'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { ARC_TESTNET, ARCADE_ABI, NFT_ABI, getTier, short, toDataUri } from './constants'

function isMissingChainError(error) {
  const message = String(error?.message || '')
  return error?.code === 4902 || /unrecognized chain id|unknown chain|not been added|try adding the chain/i.test(message)
}

async function ensureArcTestnet() {
  const params = {
    chainId: ARC_TESTNET.chainIdHex,
    chainName: ARC_TESTNET.name,
    rpcUrls: [ARC_TESTNET.rpcUrl],
    nativeCurrency: ARC_TESTNET.nativeCurrency,
    blockExplorerUrls: [ARC_TESTNET.explorerUrl],
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: ARC_TESTNET.chainIdHex }],
    })
  } catch (error) {
    if (!isMissingChainError(error)) throw error

    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [params],
    })

    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: ARC_TESTNET.chainIdHex }],
    })
  }
}

export function useDashboard() {
  const [ws, setWs] = useState({ provider:null,signer:null,address:null,chainId:null,nftBalance:0,contract:null,contractAddr:null })
  const [gateOpen,  setGateOpen]  = useState(true)
  const [tab,       setTab]       = useState('dashboard')
  const [gSt,       setGSt]       = useState({ type:'', msg:'' })
  const [gLoad,     setGLoad]     = useState(false)
  const [toast,     setToast]     = useState({ show:false, msg:'', type:'success' })
  const [txMod,     setTxMod]     = useState({ show:false, icon:'⬡', title:'', desc:'', hash:'' })
  const [stats,     setStats]     = useState({ revenue:0, orders:0, listings:0 })
  const [localP,    setLocalP]    = useState([])
  const [dispP,     setDispP]     = useState([])
  const [pf,        setPf]        = useState({ name:'',desc:'',price:'',stock:'',cat:'Collectibles',imgUri:'',imgPrev:'' })
  const [listLoad,  setListLoad]  = useState(false)
  const [listTx,    setListTx]    = useState('')
  const [sf,        setSf]        = useState({ name:'My Arcade Store',handle:'@arcade_seller',bio:'Selling rare digital collectibles on Arc Testnet.' })
  const [cInput,    setCInput]    = useState('')

  const tTimer = useRef(null)
  const avRef  = useRef(null)
  const eLib   = useRef(null)

  useEffect(() => { import('ethers').then(m => { eLib.current = m.ethers || m }) }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = localStorage.getItem('arcade_wallet')
    if (saved && window.ethereum) connect(true)
    loadDraft()
    if (window.ethereum) {
      const handleAccountsChanged = a => { if (!a.length) disconnect() }
      const handleChainChanged = () => window.location.reload()
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!ws.address || !avRef.current) return
    const cv = avRef.current, ctx = cv.getContext('2d')
    const h1 = parseInt(ws.address.slice(2,6),16)%360
    const h2 = parseInt(ws.address.slice(6,10),16)%360
    const g = ctx.createLinearGradient(0,0,22,22)
    g.addColorStop(0,`hsl(${h1},70%,55%)`); g.addColorStop(1,`hsl(${h2},60%,45%)`)
    ctx.beginPath(); ctx.arc(11,11,11,0,Math.PI*2); ctx.fillStyle=g; ctx.fill()
  }, [ws.address])

  const toast$ = useCallback((msg, type='success') => {
    setToast({ show:true, msg, type })
    if (tTimer.current) clearTimeout(tTimer.current)
    tTimer.current = setTimeout(() => setToast(t => ({ ...t, show:false })), 3200)
  }, [])

  async function connect(silent=false) {
    const E = eLib.current
    if (!E) { setGSt({ type:'error', msg:'Loading, please retry.' }); return }
    if (!window.ethereum) { setGSt({ type:'error', msg:'MetaMask not detected.' }); return }
    try {
      setGLoad(!silent); setGSt({ type:'loading', msg:silent ? 'Reconnecting wallet...' : 'Requesting wallet access...' })
      let p = new E.providers.Web3Provider(window.ethereum)
      const accs = silent ? await p.send('eth_accounts', []) : await p.send('eth_requestAccounts', [])
      if (!accs?.length) throw new Error('No accounts')
      let s = p.getSigner(), a = await s.getAddress(), cid = (await p.getNetwork()).chainId
      if (cid !== ARC_TESTNET.chainId) {
        setGSt({ type:'loading', msg:'Switching to Arc Testnet...' })
        await ensureArcTestnet()
        p = new E.providers.Web3Provider(window.ethereum)
        s = p.getSigner(); a = await s.getAddress(); cid = (await p.getNetwork()).chainId
      }
      setGSt({ type:'loading', msg:'Checking Genesis NFT balance...' })
      const bal = await checkNFT(p, a, E)
      if (bal < 1) {
        setGSt({ type:'error', msg:`Access denied — ${bal} ARCM held. Need >= 1.` })
        setGLoad(false); toast$('Mint a Genesis NFT first', 'error'); return
      }
      localStorage.setItem('arcade_wallet', a)
      setGSt({ type:'success', msg:`Verified! ${bal} ARCM held. Entering dashboard...` })
      const key = 'arcade_contract_'+a.toLowerCase()
      const ca = localStorage.getItem(key)||null
      let ct = null
      if (ca) { try { ct = new E.Contract(ca, ARCADE_ABI, s) } catch {} ; setCInput(ca) }
      const prods = loadLP(a)
      setLocalP(prods)
      setWs({ provider:p, signer:s, address:a, chainId:cid, nftBalance:bal, contract:ct, contractAddr:ca })
      setTimeout(async () => {
        setGateOpen(false); setGLoad(false)
        await doStats(ct, a, prods, E)
        await doProds(ct, a, prods, E)
        toast$('Connected: '+short(a), 'success')
      }, 800)
    } catch(err) {
      setGSt({ type:'error', msg:err.code===4001?'Connection rejected.':(err.message||'Failed.') })
      setGLoad(false)
    }
  }

  async function checkNFT(p, a, E) {
    const na = localStorage.getItem('arcade_nft_contract')||null
    if (!na) return 1
    try { const nc = new E.Contract(na, NFT_ABI, p); return (await nc.balanceOf(a)).toNumber() } catch { return 1 }
  }

  function disconnect() {
    localStorage.removeItem('arcade_wallet')
    setWs({ provider:null,signer:null,address:null,chainId:null,nftBalance:0,contract:null,contractAddr:null })
    setGateOpen(true); setGSt({ type:'',msg:'' }); setGLoad(false)
    toast$('Wallet disconnected', 'info')
  }

  async function doStats(ct, a, prods, E) {
    if (!a) return
    let rev=0, ord=0, lst=(prods||[]).filter(p=>p.active).length
    if (ct&&E) {
      try {
        const s = await ct.getSellerStats(a)
        rev = parseFloat(E.utils.formatUnits(s.totalRevenue, 6))
        ord = s.totalOrders.toNumber()
        lst = s.activeListings.toNumber()
      } catch {}
    }
    setStats({ revenue:rev, orders:ord, listings:lst })
  }

  async function doProds(ct, a, prods, E) {
    if (!a) return
    let ps = []
    if (ct&&E) {
      try {
        const raw = await ct.getSellerProducts(a)
        ps = raw.map(p => ({
          id:p.id.toNumber(), name:p.name, description:p.description,
          priceUsdc:parseFloat(E.utils.formatUnits(p.priceUsdc,6)),
          stock:p.stock.toNumber(), category:p.category, imageUri:p.imageUri,
          seller:p.seller, active:p.active, totalSold:p.totalSold.toNumber(), source:'chain'
        }))
        const ids = new Set(ps.map(p=>p.id))
        ps = [...ps, ...(prods||[]).filter(p=>!ids.has(p.id))]
      } catch { ps = prods||[] }
    } else ps = prods||[]
    setDispP(ps)
  }

  async function saveContract() {
    const v = cInput.trim()
    if (!v||!v.startsWith('0x')||v.length!==42) { toast$('Enter a valid 0x address (42 chars)', 'error'); return }
    const key = 'arcade_contract_'+(ws.address||'').toLowerCase()
    localStorage.setItem(key, v)
    const E = eLib.current; let ct = null
    if (ws.signer&&E) { try { ct = new E.Contract(v, ARCADE_ABI, ws.signer) } catch {} }
    setWs(w => ({ ...w, contractAddr:v, contract:ct }))
    toast$('Contract address saved!', 'success')
    if (ct&&ws.address&&E) { await doStats(ct, ws.address, localP, E); await doProds(ct, ws.address, localP, E) }
  }

  async function listProduct() {
    const { address:a, contract:ct } = ws
    if (!a) { toast$('Connect wallet first', 'error'); return }
    if (!pf.name.trim()) { toast$('Product name required', 'error'); return }
    if (!pf.desc.trim()) { toast$('Description required', 'error'); return }
    const price = parseFloat(pf.price), stock = parseInt(pf.stock)
    if (isNaN(price)||price<=0) { toast$('Enter a valid price', 'error'); return }
    if (isNaN(stock)||stock<1)  { toast$('Enter a valid stock quantity', 'error'); return }
    const E = eLib.current
    setListLoad(true); setListTx('Preparing...')
    const pu = E.utils.parseUnits(price.toFixed(6), 6)
    const prod = { id:Date.now(), name:pf.name.trim(), description:pf.desc.trim(), priceUsdc:price, stock, category:pf.cat, imageUri:pf.imgUri, seller:a, active:true, totalSold:0, txHash:null, listedAt:new Date().toISOString(), source:'local' }
    if (ct) {
      try {
        setListTx('Waiting for MetaMask...')
        const tx = await ct.listProduct(pf.name.trim(), pf.desc.trim(), pu, stock, pf.cat, pf.imgUri)
        setListTx('TX: '+short(tx.hash,8))
        setTxMod({ show:true, icon:'⬡', title:'Listing Submitted', desc:`"${pf.name}" is being listed...`, hash:tx.hash })
        const rc = await tx.wait(); prod.txHash=tx.hash; prod.source='chain'
        const ev = rc.events?.find(e=>e.event==='ProductListed'); if (ev) prod.id=ev.args.productId.toNumber()
        setListTx('Listed on Arc Testnet!')
        setTxMod(m => ({ ...m, icon:'✅', title:'Listing Confirmed!', desc:`"${pf.name}" is now live on Arcade Market.` }))
        toast$(`"${pf.name}" listed!`, 'success')
      } catch(err) {
        const msg = err.code===4001?'Rejected.':(err.reason||err.message||'TX failed')
        setListTx(msg); toast$('TX failed: '+msg, 'error'); setListLoad(false); return
      }
    } else {
      setListTx('Saved locally (configure contract to list on-chain)')
      toast$(`"${pf.name}" saved locally`, 'info')
    }
    const np = [...localP, prod]; setLocalP(np); saveLP(a, np); setDispP(np)
    setPf({ name:'',desc:'',price:'',stock:'',cat:'Collectibles',imgUri:'',imgPrev:'' })
    setListLoad(false); await doStats(ct, a, np, E)
  }

  async function delistProduct(id) {
    const { address:a, contract:ct } = ws; if (!a) return
    if (!confirm('Delist this product?')) return
    if (ct) {
      try {
        const tx = await ct.delistProduct(id)
        toast$('Delisting... TX: '+short(tx.hash,8), 'info')
        await tx.wait(); toast$('Delisted!', 'success')
      } catch(e) { toast$('Delist failed: '+(e.reason||e.message), 'error'); return }
    }
    const np = localP.filter(p=>p.id!==id); setLocalP(np); saveLP(a, np); setDispP(np)
    await doStats(ct, a, np, eLib.current)
  }

  function saveDraft() {
    localStorage.setItem('arcade_draft', JSON.stringify({ name:pf.name,desc:pf.desc,price:pf.price,stock:pf.stock,cat:pf.cat }))
    toast$('Draft saved!', 'success')
  }
  function loadDraft() {
    try {
      const d = localStorage.getItem('arcade_draft'); if (!d) return
      const x = JSON.parse(d)
      setPf(f => ({ ...f, name:x.name||f.name, desc:x.desc||f.desc, price:x.price||f.price, stock:x.stock||f.stock, cat:x.cat||f.cat }))
    } catch {}
  }
  function loadLP(a) { try { const d=localStorage.getItem('arcade_products_'+(a||'anon')); return d?JSON.parse(d):[] } catch { return [] } }
  function saveLP(a, ps) { try { localStorage.setItem('arcade_products_'+(a||'anon'), JSON.stringify(ps)) } catch {} }

  async function onImg(e) {
    const f = e.target.files[0]; if (!f) return
    const u = await toDataUri(f); setPf(x => ({ ...x, imgUri:u, imgPrev:u }))
  }

  function goTab(name) {
    setTab(name)
    if ((name==='products'||name==='analytics')&&ws.address) doProds(ws.contract, ws.address, localP, eLib.current)
  }

  function saveStore() {
    localStorage.setItem('arcade_store', JSON.stringify({ name:sf.name, handle:sf.handle, bio:sf.bio }))
    toast$('Store settings saved!', 'success')
  }

  return {
    ws, gateOpen, tab, gSt, gLoad, toast, txMod, stats, localP, dispP,
    pf, setPf, listLoad, listTx, sf, setSf, cInput, setCInput, avRef,
    connect, disconnect, saveContract, listProduct, delistProduct,
    saveDraft, onImg, goTab, saveStore, setTxMod, toast$,
    tier: getTier(ws.nftBalance),
    isArc: ws.chainId === ARC_TESTNET.chainId,
    avgOrd: ws.chainId && stats.orders>0 ? (stats.revenue/stats.orders).toFixed(2) : '0.00',
    anaTotal: 0,
  }
}
