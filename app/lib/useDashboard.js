'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { ARC_TESTNET, FACTORY_ABI, FACTORY_ADDRESS, SELLER_ABI, NFT_ABI, GENESIS_NFT_CONTRACT, MIN_NFT_BALANCE, getTier, short, imageToOptimizedDataUri, MAX_IMAGE_UPLOAD_BYTES } from './constants'

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
    await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: ARC_TESTNET.chainIdHex }] })
  } catch (error) {
    if (!isMissingChainError(error)) throw error
    await window.ethereum.request({ method: 'wallet_addEthereumChain', params: [params] })
    await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: ARC_TESTNET.chainIdHex }] })
  }
}

const ZERO_ADDR = '0x0000000000000000000000000000000000000000'

export function useDashboard() {
  const [ws, setWs] = useState({ provider:null, signer:null, address:null, chainId:null, nftBalance:0, factory:null, sellerContract:null, sellerContractAddr:null })
  const [gateOpen,   setGateOpen]   = useState(true)
  const [tab,        setTab]        = useState('dashboard')
  const [gSt,        setGSt]        = useState({ type:'', msg:'' })
  const [gLoad,      setGLoad]      = useState(false)
  const [toast,      setToast]      = useState({ show:false, msg:'', type:'success' })
  const [txMod,      setTxMod]      = useState({ show:false, icon:'⬡', title:'', desc:'', hash:'' })
  const [stats,      setStats]      = useState({ revenue:0, orders:0, listings:0 })
  const [localP,     setLocalP]     = useState([])
  const [dispP,      setDispP]      = useState([])
  const [orders,     setOrders]     = useState([])
  const [pf,         setPf]         = useState({ name:'', desc:'', price:'', stock:'', cat:'Collectibles', imgUri:'', imgPrev:'' })
  const [listLoad,   setListLoad]   = useState(false)
  const [listTx,     setListTx]     = useState('')
  const [deployLoad, setDeployLoad] = useState(false)
  const [sf,         setSf]         = useState({ name:'My Arcade Store', handle:'@arcade_seller', bio:'Selling rare digital collectibles on Arc Testnet.' })

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
      setGLoad(!silent); setGSt({ type:'loading', msg: silent ? 'Reconnecting wallet...' : 'Requesting wallet access...' })
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
      if (bal < MIN_NFT_BALANCE) {
        setGSt({ type:'error', msg:`Access denied — ${bal} ARCM held. Need >= ${MIN_NFT_BALANCE}.` })
        setGLoad(false); toast$('Mint a Genesis NFT first', 'error'); return
      }
      setGSt({ type:'loading', msg:'Looking up your store contract...' })
      const factory = new E.Contract(FACTORY_ADDRESS, FACTORY_ABI, s)
      const sellerContractAddr = await factory.getSellerContract(a)
      const hasContract = sellerContractAddr && sellerContractAddr !== ZERO_ADDR
      const sellerContract = hasContract ? new E.Contract(sellerContractAddr, SELLER_ABI, s) : null

      localStorage.setItem('arcade_wallet', a)
      setGSt({ type:'success', msg: hasContract ? `Verified! Store found. Entering dashboard...` : `Verified! Deploy your store to start listing.` })
      const prods = loadLP(a)
      setLocalP(prods)
      setWs({ provider:p, signer:s, address:a, chainId:cid, nftBalance:bal, factory, sellerContract, sellerContractAddr: hasContract ? sellerContractAddr : null })
      setTimeout(async () => {
        setGateOpen(false); setGLoad(false)
        await doStats(sellerContract, prods, E)
        await doProds(sellerContract, prods, E)
        toast$('Connected: '+short(a), 'success')
      }, 800)
    } catch(err) {
      setGSt({ type:'error', msg: err.code===4001 ? 'Connection rejected.' : (err.message||'Failed.') })
      setGLoad(false)
    }
  }

  async function checkNFT(p, a, E) {
    const na = GENESIS_NFT_CONTRACT
    if (!na || na === ZERO_ADDR) throw new Error('Genesis NFT contract is not configured.')
    const nc = new E.Contract(na, NFT_ABI, p)
    const balance = await nc.balanceOf(a)
    return balance.toNumber()
  }

  function disconnect() {
    localStorage.removeItem('arcade_wallet')
    setWs({ provider:null, signer:null, address:null, chainId:null, nftBalance:0, factory:null, sellerContract:null, sellerContractAddr:null })
    setGateOpen(true); setGSt({ type:'', msg:'' }); setGLoad(false)
    toast$('Wallet disconnected', 'info')
  }

  async function deployStore() {
    const { address:a, factory, signer:s } = ws
    if (!a || !factory) { toast$('Connect wallet first', 'error'); return }
    const E = eLib.current
    setDeployLoad(true)
    try {
      toast$('Deploying your store contract...', 'info')
      const gasEstimate = await factory.estimateGas.deploySellerContract()
      const tx = await factory.deploySellerContract({ gasLimit: gasEstimate.mul(130).div(100) })
      toast$('TX submitted, waiting for confirmation...', 'info')
      await tx.wait()
      const sellerContractAddr = await factory.getSellerContract(a)
      const sellerContract = new E.Contract(sellerContractAddr, SELLER_ABI, s)
      setWs(w => ({ ...w, sellerContract, sellerContractAddr }))
      toast$('Store deployed! You can now list products.', 'success')
      setTxMod({ show:true, icon:'✅', title:'Store Deployed!', desc:'Your personal seller contract is live on Arc Testnet.', hash:tx.hash })
      const prods = loadLP(a)
      await doStats(sellerContract, prods, E)
      await doProds(sellerContract, prods, E)
    } catch(err) {
      toast$('Deploy failed: '+(err.reason||err.message), 'error')
    }
    setDeployLoad(false)
  }

  async function doStats(ct, prods, E) {
    let lst = 0
    if (ct && E) {
      try {
        const raw = await ct.getListings()
        lst = raw.filter(l => l.active).length
      } catch {
        lst = (prods || []).filter(p => p.active).length
      }
    } else {
      lst = (prods || []).filter(p => p.active).length
    }
    setStats({ revenue:0, orders:0, listings:lst })
  }

  async function doProds(ct, prods, E) {
    let ps = []
    if (ct && E) {
      try {
        const raw = await ct.getListings()
        ps = raw.map(l => ({
          id: l.id.toNumber(),
          name: l.name,
          description: l.description,
          priceUsdc: parseFloat(E.utils.formatUnits(l.price, 6)),
          stock: l.quantity.toNumber(),
          category: l.category,
          imageUri: l.imageURI,
          active: l.active,
          source: 'chain',
        }))
      } catch { ps = prods || [] }
    } else ps = prods || []
    setDispP(ps)
  }

  async function listProduct() {
    const { address:a, sellerContract:ct } = ws
    if (!a) { toast$('Connect wallet first', 'error'); return }
    if (!ct) { toast$('Deploy your store first', 'error'); setListTx('No store contract — deploy first'); return }
    if (!pf.name.trim()) { toast$('Product name required', 'error'); return }
    if (!pf.desc.trim()) { toast$('Description required', 'error'); return }
    const price = parseFloat(pf.price), stock = parseInt(pf.stock)
    if (isNaN(price)||price<=0) { toast$('Enter a valid price', 'error'); return }
    if (isNaN(stock)||stock<1)  { toast$('Enter a valid stock quantity', 'error'); return }
    const E = eLib.current
    setListLoad(true); setListTx('Preparing...')
    const pu = E.utils.parseUnits(price.toFixed(6), 6)
    // arg order: listProduct(name, description, price, quantity, imageURI, category)
    const listArgs = [pf.name.trim(), pf.desc.trim(), pu, stock, pf.imgUri, pf.cat]
    const prod = { id:Date.now(), name:pf.name.trim(), description:pf.desc.trim(), priceUsdc:price, stock, category:pf.cat, imageUri:pf.imgUri, active:true, txHash:null, listedAt:new Date().toISOString(), source:'chain' }
    try {
      const block = await ws.provider.getBlock('latest')
      console.log('Arc block gasLimit:', block.gasLimit.toString())
      setListTx('Waiting for MetaMask...')
      const tx = await ct.listProduct(...listArgs, { gasLimit: 80000 })
      setListTx('TX: '+short(tx.hash,8))
      setTxMod({ show:true, icon:'⬡', title:'Listing Submitted', desc:`"${pf.name}" is being listed...`, hash:tx.hash })
      const rc = await tx.wait(); prod.txHash=tx.hash
      const ev = rc.events?.find(e=>e.event==='ProductListed'); if (ev) prod.id=ev.args.id.toNumber()
      setListTx('Listed on Arc Testnet!')
      setTxMod(m => ({ ...m, icon:'✅', title:'Listing Confirmed!', desc:`"${pf.name}" is now live on Arcade Market.` }))
      toast$(`"${pf.name}" listed!`, 'success')
    } catch(err) {
      const msg = err.code===4001 ? 'Rejected.' : (err.reason||err.message||'TX failed')
      setListTx(msg); toast$('TX failed: '+msg, 'error'); setListLoad(false); return
    }
    const np = [...localP, prod]; setLocalP(np); saveLP(a, np); setDispP(np)
    setPf({ name:'', desc:'', price:'', stock:'', cat:'Collectibles', imgUri:'', imgPrev:'' })
    setListLoad(false)
    await doStats(ct, np, E)
    await doProds(ct, np, E)
  }

  async function delistProduct(id) {
    const { address:a, sellerContract:ct } = ws; if (!a) return
    if (!confirm('Delist this product?')) return
    if (ct) {
      try {
        const tx = await ct.delistProduct(id)
        toast$('Delisting... TX: '+short(tx.hash,8), 'info')
        await tx.wait(); toast$('Delisted!', 'success')
      } catch(e) { toast$('Delist failed: '+(e.reason||e.message), 'error'); return }
    }
    const np = localP.filter(p=>p.id!==id); setLocalP(np); saveLP(a, np); setDispP(np)
    await doStats(ct, np, eLib.current)
  }

  function saveDraft() {
    localStorage.setItem('arcade_draft', JSON.stringify({ name:pf.name, desc:pf.desc, price:pf.price, stock:pf.stock, cat:pf.cat }))
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
    if (f.size > MAX_IMAGE_UPLOAD_BYTES) {
      e.target.value = ''
      toast$('Image must be 5 MB or smaller', 'error')
      return
    }
    try {
      setListTx('Optimizing image for on-chain listing...')
      const u = await imageToOptimizedDataUri(f)
      setPf(x => ({ ...x, imgUri:u, imgPrev:u }))
      setListTx('Image ready')
    } catch (err) {
      e.target.value = ''
      setPf(x => ({ ...x, imgUri:'', imgPrev:'' }))
      setListTx('')
      toast$(err.message || 'Image upload failed', 'error')
    }
  }

  function goTab(name) {
    setTab(name)
    if (!ws.address || !ws.sellerContract) return
    const ct = ws.sellerContract
    const prods = localP
    const E = eLib.current
    if (name==='products' || name==='analytics') doProds(ct, prods, E)
    if (name==='orders') { setOrders([]); doProds(ct, prods, E); doStats(ct, prods, E) }
  }

  function saveStore() {
    localStorage.setItem('arcade_store', JSON.stringify({ name:sf.name, handle:sf.handle, bio:sf.bio }))
    toast$('Store settings saved!', 'success')
  }

  return {
    ws, gateOpen, tab, gSt, gLoad, toast, txMod, stats, localP, dispP, orders,
    pf, setPf, listLoad, listTx, deployLoad, sf, setSf, avRef,
    connect, disconnect, deployStore, listProduct, delistProduct,
    saveDraft, onImg, goTab, saveStore, setTxMod, toast$,
    hasSellerContract: !!ws.sellerContract,
    tier: getTier(ws.nftBalance),
    isArc: ws.chainId === ARC_TESTNET.chainId,
    avgOrd: stats.orders > 0 ? (stats.revenue/stats.orders).toFixed(2) : '0.00',
    anaTotal: 0,
  }
}
