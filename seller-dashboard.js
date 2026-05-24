/* ============================================================
   ARCADE MARKET — Seller Dashboard JS
   Network: Arc Testnet (chainId 5042002)
   Payment: USDC on Arc Testnet
   Model: Each seller deploys their own ArcadeMarket.sol
          Contract address saved in localStorage per wallet
   ============================================================ */

const ARC_TESTNET = {
  chainId:     5042002,
  chainIdHex:  '0x4cef52',
  name:        'Arc Testnet',
  rpcUrl:      'https://rpc.testnet.arc.network',
  explorerUrl: 'https://testnet.arcscan.app',
  explorerTx:  'https://testnet.arcscan.app/tx/',
  nativeCurrency: { name:'ETH', symbol:'ETH', decimals:18 },
  usdcAddress: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
};

const MIN_NFT_BALANCE = 1;

const ARCADE_MARKET_ABI = [
  { inputs:[{internalType:'string',name:'name',type:'string'},{internalType:'string',name:'description',type:'string'},{internalType:'uint256',name:'priceUsdc',type:'uint256'},{internalType:'uint256',name:'stock',type:'uint256'},{internalType:'string',name:'category',type:'string'},{internalType:'string',name:'imageUri',type:'string'}], name:'listProduct', outputs:[{internalType:'uint256',name:'productId',type:'uint256'}], stateMutability:'nonpayable', type:'function' },
  { inputs:[{internalType:'address',name:'seller',type:'address'}], name:'getSellerProducts', outputs:[{components:[{internalType:'uint256',name:'id',type:'uint256'},{internalType:'string',name:'name',type:'string'},{internalType:'string',name:'description',type:'string'},{internalType:'uint256',name:'priceUsdc',type:'uint256'},{internalType:'uint256',name:'stock',type:'uint256'},{internalType:'string',name:'category',type:'string'},{internalType:'string',name:'imageUri',type:'string'},{internalType:'address',name:'seller',type:'address'},{internalType:'bool',name:'active',type:'bool'},{internalType:'uint256',name:'totalSold',type:'uint256'}],internalType:'struct ArcadeMarket.Product[]',name:'',type:'tuple[]'}], stateMutability:'view', type:'function' },
  { inputs:[], name:'getAllProducts', outputs:[{components:[{internalType:'uint256',name:'id',type:'uint256'},{internalType:'string',name:'name',type:'string'},{internalType:'string',name:'description',type:'string'},{internalType:'uint256',name:'priceUsdc',type:'uint256'},{internalType:'uint256',name:'stock',type:'uint256'},{internalType:'string',name:'category',type:'string'},{internalType:'string',name:'imageUri',type:'string'},{internalType:'address',name:'seller',type:'address'},{internalType:'bool',name:'active',type:'bool'},{internalType:'uint256',name:'totalSold',type:'uint256'}],internalType:'struct ArcadeMarket.Product[]',name:'',type:'tuple[]'}], stateMutability:'view', type:'function' },
  { inputs:[{internalType:'uint256',name:'productId',type:'uint256'}], name:'delistProduct', outputs:[], stateMutability:'nonpayable', type:'function' },
  { inputs:[{internalType:'address',name:'seller',type:'address'}], name:'getSellerStats', outputs:[{internalType:'uint256',name:'totalRevenue',type:'uint256'},{internalType:'uint256',name:'totalOrders',type:'uint256'},{internalType:'uint256',name:'activeListings',type:'uint256'}], stateMutability:'view', type:'function' },
  { anonymous:false, inputs:[{indexed:true,internalType:'uint256',name:'productId',type:'uint256'},{indexed:true,internalType:'address',name:'seller',type:'address'},{indexed:false,internalType:'string',name:'name',type:'string'},{indexed:false,internalType:'uint256',name:'priceUsdc',type:'uint256'}], name:'ProductListed', type:'event' }
];

const NFT_ABI = [
  { inputs:[{internalType:'address',name:'owner',type:'address'}], name:'balanceOf', outputs:[{internalType:'uint256',name:'',type:'uint256'}], stateMutability:'view', type:'function' }
];

let provider=null, signer=null, userAddress=null, chainId=null;
let nftBalance=0, contract=null, contractAddr=null, nftContractAddr=null;
let localProducts=[], draftData={}, toastTimer=null;

function isMissingChainError(error) {
  var message = String((error && error.message) || '');
  return error && (error.code===4902 || /unrecognized chain id|unknown chain|not been added|try adding the chain/i.test(message));
}

async function ensureArcTestnetNetwork() {
  var params = {
    chainId: ARC_TESTNET.chainIdHex,
    chainName: ARC_TESTNET.name,
    rpcUrls: [ARC_TESTNET.rpcUrl],
    nativeCurrency: ARC_TESTNET.nativeCurrency,
    blockExplorerUrls: [ARC_TESTNET.explorerUrl]
  };

  try {
    await window.ethereum.request({ method:'wallet_switchEthereumChain', params:[{ chainId: ARC_TESTNET.chainIdHex }] });
  } catch (sw) {
    if (!isMissingChainError(sw)) throw sw;
    await window.ethereum.request({ method:'wallet_addEthereumChain', params:[params] });
    await window.ethereum.request({ method:'wallet_switchEthereumChain', params:[{ chainId: ARC_TESTNET.chainIdHex }] });
  }
}

window.addEventListener('DOMContentLoaded', function() {
  loadDraft();
  var saved = localStorage.getItem('arcade_wallet');
  if (saved && window.ethereum) connectWallet(true);
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', function(a) { if(!a.length) disconnectWallet(); else { userAddress=a[0]; onWalletConnected(); } });
    window.ethereum.on('chainChanged', function() { window.location.reload(); });
  }
});

async function connectWallet(silent) {
  var btn=document.getElementById('gate-btn'), btnTxt=document.getElementById('gate-btn-text');
  if (!window.ethereum) { setGateStatus('error','MetaMask not detected. Please install MetaMask.'); return; }
  try {
    btn.disabled=true;
    btnTxt.innerHTML='<span class="spinner"></span> Connecting...';
    setGateStatus('loading','Requesting wallet access...');
    provider = new ethers.providers.Web3Provider(window.ethereum);
    var accounts = await provider.send('eth_requestAccounts',[]);
    if (!accounts||!accounts.length) throw new Error('No accounts');
    signer = provider.getSigner();
    userAddress = await signer.getAddress();
    var net = await provider.getNetwork();
    chainId = net.chainId;
    if (chainId !== ARC_TESTNET.chainId) {
      setGateStatus('loading','Switching to Arc Testnet...');
      await ensureArcTestnetNetwork();
      provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
      userAddress = await signer.getAddress();
      chainId = (await provider.getNetwork()).chainId;
    }
    setGateStatus('loading','Checking Genesis NFT balance...');
    await checkNFTBalance();
    if (nftBalance < MIN_NFT_BALANCE) {
      setGateStatus('error','Access denied — you hold '+nftBalance+' ARCM. Need >= '+MIN_NFT_BALANCE+'.');
      btn.disabled=false; btnTxt.textContent='Connect Wallet';
      showToast('Access denied — mint a Genesis NFT first','error'); return;
    }
    localStorage.setItem('arcade_wallet', userAddress);
    setGateStatus('success','Verified! '+nftBalance+' ARCM held. Entering dashboard...');
    setTimeout(function() { document.getElementById('gate-screen').classList.add('hidden'); onWalletConnected(); }, 800);
  } catch(err) {
    console.error('connectWallet:',err);
    var msg = err.code===4001 ? 'Connection rejected.' : (err.message||'Connection failed.');
    setGateStatus('error',msg);
    btn.disabled=false; btnTxt.textContent='Connect Wallet';
  }
}

async function checkNFTBalance() {
  nftContractAddr = localStorage.getItem('arcade_nft_contract')||null;
  if (!nftContractAddr) { nftBalance=1; return; }
  try {
    var nc = new ethers.Contract(nftContractAddr, NFT_ABI, provider);
    nftBalance = (await nc.balanceOf(userAddress)).toNumber();
  } catch(e) { console.warn('NFT check failed, demo mode'); nftBalance=1; }
}

function disconnectWallet() {
  localStorage.removeItem('arcade_wallet');
  provider=null; signer=null; userAddress=null; chainId=null;
  nftBalance=0; contract=null; contractAddr=null;
  document.getElementById('gate-screen').classList.remove('hidden');
  document.getElementById('gate-status').textContent='';
  document.getElementById('gate-status').className='gate-status';
  document.getElementById('gate-btn').disabled=false;
  document.getElementById('gate-btn-text').textContent='Connect Wallet';
  showToast('Wallet disconnected','info');
}

async function onWalletConnected() {
  loadLocalProducts(); loadContractAddress();
  updateTopbarWallet(); updateNetworkPill(); updateSidebarNFT(); updateSettingsPage();
  initContract(); showContractBanner();
  await loadOnChainProducts(); await loadDashboardStats();
  showToast('Connected: '+shortAddr(userAddress),'success');
}

function loadContractAddress() {
  var key='arcade_contract_'+(userAddress||'').toLowerCase();
  contractAddr = localStorage.getItem(key)||null;
}

async function registerSellerContract(seller, marketContractAddr) {
  var apiUrl = 'https://arcade-markets.vercel.app/api/sellers';
  try {
    await fetch(apiUrl, {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body:JSON.stringify({ address:seller, contractAddress:marketContractAddr })
    });
  } catch(e) { console.warn('registerSellerContract:', e && e.message); }
}

async function saveContractAddress() {
  var si=document.getElementById('settings-contract-input');
  var ci=document.getElementById('contract-addr-input');
  var val=(si&&si.value.trim())||(ci&&ci.value.trim())||'';
  if (!val||!val.startsWith('0x')||val.length!==42) { showToast('Enter a valid 0x contract address (42 chars)','error'); return; }
  var key='arcade_contract_'+(userAddress||'').toLowerCase();
  localStorage.setItem(key,val); contractAddr=val;
  initContract(); showContractBanner(); updateContractDisplays();
  if (userAddress) await registerSellerContract(userAddress,val);
  showToast('Contract address saved and registered for marketplace!','success');
  loadOnChainProducts(); loadDashboardStats();
}

function initContract() {
  if (!contractAddr||!signer) { contract=null; return; }
  try { contract = new ethers.Contract(contractAddr, ARCADE_MARKET_ABI, signer); }
  catch(e) { console.error('initContract:',e); contract=null; }
}

function showContractBanner() {
  var b=document.getElementById('contract-setup-banner');
  if (b) b.style.display = contractAddr ? 'none' : 'block';
}

function updateContractDisplays() {
  ['contract-addr-display','contract-addr-display-small'].forEach(function(id) {
    var el=document.getElementById(id);
    if (!el) return;
    el.textContent = contractAddr||'No contract configured';
    el.style.color = contractAddr ? 'var(--navy3)' : 'var(--text3)';
  });
  var si=document.getElementById('settings-contract-input');
  if (si&&contractAddr) si.value=contractAddr;
}

function updateTopbarWallet() {
  var addrEl=document.getElementById('topbar-wallet-addr');
  var btn=document.getElementById('topbar-wallet-btn');
  if (addrEl) addrEl.textContent=shortAddr(userAddress);
  if (btn) { btn.classList.add('disconnect'); btn.title='Click to disconnect'; }
  var canvas=document.getElementById('wallet-avatar');
  if (canvas&&canvas.getContext) {
    var ctx=canvas.getContext('2d');
    var h1=parseInt(userAddress.slice(2,6),16)%360;
    var h2=parseInt(userAddress.slice(6,10),16)%360;
    var g=ctx.createLinearGradient(0,0,22,22);
    g.addColorStop(0,'hsl('+h1+',70%,55%)'); g.addColorStop(1,'hsl('+h2+',60%,45%)');
    ctx.beginPath(); ctx.arc(11,11,11,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
  }
  var payEl=document.getElementById('payment-wallet-addr');
  if (payEl) payEl.textContent=userAddress;
}

function updateNetworkPill() {
  var nn=document.getElementById('network-name'), nd=document.getElementById('net-dot');
  var isArc = chainId===ARC_TESTNET.chainId;
  if (nn) nn.textContent = isArc ? 'Arc Testnet' : 'Wrong Network';
  if (nd) nd.className = isArc ? 'net-dot' : 'net-dot wrong';
  var sn=document.getElementById('settings-network'), sc=document.getElementById('settings-chainid');
  if (sn) sn.textContent = isArc ? 'Circle Arc Testnet' : 'Unknown ('+chainId+')';
  if (sc) sc.textContent = chainId;
  updateContractDisplays();
}

function updateSidebarNFT() {
  var ne=document.getElementById('nft-card-name'), te=document.getElementById('nft-tier-text');
  var tier=getTier(nftBalance);
  if (ne) ne.textContent=nftBalance+' ARCM held';
  if (te) te.textContent=tier.name+' TIER';
  var sn=document.getElementById('stat-nft'); if (sn) sn.textContent=nftBalance;
}

function updateSettingsPage() {
  var we=document.getElementById('settings-wallet-addr'); if (we) we.textContent=userAddress;
  var nb=document.getElementById('settings-nft-balance'); if (nb) nb.textContent=nftBalance;
  var vi=document.getElementById('verify-nft-info'); if (vi) vi.textContent=nftBalance+' ARCM · '+getTier(nftBalance).name;
  var tier=getTier(nftBalance);
  ['common','rare','epic','legendary'].forEach(function(t) {
    var el=document.getElementById('tier-'+t); if (!el) return;
    el.classList.remove('active-tier');
    var lbl=el.querySelector('.tier-active-label'); if (lbl) lbl.remove();
  });
  var ate=document.getElementById('tier-'+tier.id);
  if (ate) {
    ate.classList.add('active-tier');
    var lbl=document.createElement('div'); lbl.className='tier-active-label'; lbl.textContent='YOURS';
    ate.prepend(lbl);
  }
  var at=document.getElementById('ana-tier'); if (at) at.textContent=tier.name;
  updateContractDisplays();
}

function getTier(b) {
  if (b>=10000) return {id:'legendary',name:'LEGENDARY',max:Infinity};
  if (b>=1000)  return {id:'epic',     name:'EPIC',     max:50};
  if (b>=100)   return {id:'rare',     name:'RARE',     max:20};
  return               {id:'common',   name:'COMMON',   max:5};
}

async function loadDashboardStats() {
  if (!userAddress) return;
  var rev=0, ord=0, lst=localProducts.filter(function(p){return p.active;}).length;
  if (contract) {
    try {
      var s=await contract.getSellerStats(userAddress);
      rev=parseFloat(ethers.utils.formatUnits(s.totalRevenue,6));
      ord=s.totalOrders.toNumber(); lst=s.activeListings.toNumber();
    } catch(e) { console.warn('getSellerStats:',e.message); }
  }
  var re=document.getElementById('stat-revenue'); if (re) re.innerHTML=rev.toFixed(2)+' <span>USDC</span>';
  var oe=document.getElementById('stat-orders');  if (oe) oe.textContent=ord;
  var le=document.getElementById('stat-listings');if (le) le.textContent=lst;
  var ct=document.getElementById('chart-total');  if (ct) ct.innerHTML=rev.toFixed(2)+' <span style="font-size:14px;color:var(--text2);font-weight:400">USDC</span>';
  var aa=document.getElementById('ana-avg');      if (aa) aa.innerHTML=(ord>0?(rev/ord).toFixed(2):'0.00')+' <span>USDC</span>';
  var ap=document.getElementById('ana-products'); if (ap) ap.textContent=lst;
  var bp=document.getElementById('badge-products');if (bp) bp.textContent=lst;
  animateChartBars();
}

function refreshDashboard() { animateChartBars(); loadDashboardStats(); showToast('Dashboard refreshed','success'); }

function animateChartBars() {
  var bars=document.querySelectorAll('#chart-bars .bar');
  var h=[18,42,28,65,50,80,38], mx=Math.max.apply(null,h);
  bars.forEach(function(bar,i) {
    bar.style.height=Math.round(h[i]/mx*88)+'px';
    bar.className='bar'+(h[i]===mx?' peak':'');
  });
}

async function listProductOnChain() {
  if (!userAddress) { showToast('Connect wallet first','error'); return; }
  var name=document.getElementById('prod-name').value.trim();
  var desc=document.getElementById('prod-desc').value.trim();
  var price=parseFloat(document.getElementById('prod-price').value);
  var stock=parseInt(document.getElementById('prod-stock').value);
  var cat=document.getElementById('prod-category').value;
  var imgFile=document.getElementById('prod-image').files[0];
  if (!name)                     { showToast('Product name required','error'); return; }
  if (!desc)                     { showToast('Description required','error'); return; }
  if (isNaN(price)||price<=0)    { showToast('Enter a valid price','error'); return; }
  if (isNaN(stock)||stock<1)     { showToast('Enter a valid stock quantity','error'); return; }
  var lb=document.getElementById('list-btn'), ts=document.getElementById('list-tx-status');
  lb.disabled=true; lb.innerHTML='<span class="spinner"></span> Submitting...';
  ts.textContent='Preparing...'; ts.style.color='var(--copper3)';
  var imageUri='';
  if (imgFile) { ts.textContent='Processing image...'; imageUri=await fileToDataUri(imgFile); }
  if (!contractAddr||!contract) {
    ts.textContent='No contract configured. Save your deployed ArcadeMarket contract in Settings first.';
    ts.style.color='var(--red)';
    showToast('Configure a valid market contract first','error');
    lb.disabled=false; lb.textContent='List on Arcade Market'; return;
  }
  var priceUsdc=ethers.utils.parseUnits(price.toFixed(6),6);
  var product={id:Date.now(),name:name,description:desc,priceUsdc:price,stock:stock,category:cat,imageUri:imageUri,seller:userAddress,active:true,totalSold:0,txHash:null,listedAt:new Date().toISOString(),source:'chain'};
  try {
    ts.textContent='Waiting for MetaMask...';
    var tx=await contract.listProduct(name,desc,priceUsdc,stock,cat,imageUri);
    ts.textContent='TX: '+shortAddr(tx.hash,8);
    showTxModal('⬡','Listing Submitted','"'+name+'" is being listed on Arcade Market...',tx.hash);
    var receipt=await tx.wait();
    product.txHash=tx.hash;
    var ev=receipt.events&&receipt.events.find(function(e){return e.event==='ProductListed';});
    if (ev) product.id=ev.args.productId.toNumber();
    await registerSellerContract(userAddress,contractAddr);
    ts.textContent='Listed on Arc Testnet!'; ts.style.color='var(--green)';
    updateTxModal('✅','Listing Confirmed!','"'+name+'" is now live on Arcade Market.');
    showToast('"'+name+'" listed on Arcade Market!','success');
  } catch(err) {
    console.error('listProduct:',err);
    var msg=err.code===4001?'Rejected by user.':(err.reason||err.message||'TX failed');
    ts.textContent=msg; ts.style.color='var(--red)';
    showToast('Transaction failed: '+msg,'error');
    lb.disabled=false; lb.textContent='List on Arcade Market'; return;
  }
  localProducts.push(product); saveLocalProducts();
  document.getElementById('prod-name').value='';
  document.getElementById('prod-desc').value='';
  document.getElementById('prod-price').value='';
  document.getElementById('prod-stock').value='';
  document.getElementById('upload-preview').style.display='none';
  lb.disabled=false; lb.textContent='List on Arcade Market';
  renderProducts(localProducts); loadDashboardStats();
}

function fileToDataUri(file) {
  return new Promise(function(res) {
    var r=new FileReader();
    r.onload=function(e){res(e.target.result);}; r.onerror=function(){res('');};
    r.readAsDataURL(file);
  });
}

function previewImage(event) {
  var file=event.target.files[0]; if (!file) return;
  var prev=document.getElementById('upload-preview');
  var r=new FileReader();
  r.onload=function(e){prev.src=e.target.result;prev.style.display='block';};
  r.readAsDataURL(file);
}

async function loadOnChainProducts() {
  if (!userAddress) return;
  var ld=document.getElementById('products-loading'); if (ld) ld.classList.remove('hidden');
  var products=[];
  if (contract) {
    try {
      var raw=await contract.getSellerProducts(userAddress);
      products=raw.map(function(p) {
        return {id:p.id.toNumber(),name:p.name,description:p.description,priceUsdc:parseFloat(ethers.utils.formatUnits(p.priceUsdc,6)),stock:p.stock.toNumber(),category:p.category,imageUri:p.imageUri,seller:p.seller,active:p.active,totalSold:p.totalSold.toNumber(),source:'chain'};
      });
      var cids=new Set(products.map(function(p){return p.id;}));
      products=products.concat(localProducts.filter(function(p){return !cids.has(p.id);}));
    } catch(e) { console.warn('getSellerProducts:',e.message); products=localProducts; }
  } else { products=localProducts; }
  renderProducts(products); renderAnalyticsTable(products);
  if (ld) ld.classList.add('hidden');
  var bp=document.getElementById('badge-products');
  if (bp) bp.textContent=products.filter(function(p){return p.active;}).length;
}

function renderProducts(products) {
  var c=document.getElementById('products-list'); if (!c) return;
  if (!products||!products.length) {
    c.innerHTML='<div class="empty"><div class="empty-icon">◉</div><div class="empty-text">No products listed yet.</div><a class="empty-cta" onclick="showTab(\'addproduct\')">✦ List your first product</a></div>';
    return;
  }
  var EM={'Collectibles':'🃏','Game Items':'🗡','Apparel':'🧥','Access Pass':'🎫','Digital Art':'🖼'};
  c.innerHTML=products.map(function(p) {
    var em=EM[p.category]||'📦';
    var sc=p.stock<=3?'low':'', sl=p.stock<=3?'Low Stock':'In Stock';
    var thumb=(p.imageUri&&p.imageUri.startsWith('data:'))?'<img src="'+p.imageUri+'" alt="'+escHtml(p.name)+'" />':em;
    var badge=p.source==='chain'?'<span style="font-size:10px;color:var(--navy3);font-family:\'DM Mono\',monospace;margin-left:6px;background:rgba(45,74,154,0.15);padding:1px 6px;border-radius:4px">on-chain</span>':'<span style="font-size:10px;color:var(--text3);font-family:\'DM Mono\',monospace;margin-left:6px">local</span>';
    return '<div class="product-row"><div class="product-thumb">'+thumb+'</div><div class="product-info"><div class="product-name">'+escHtml(p.name)+badge+'</div><div class="product-meta">'+escHtml(p.category)+' · ID: '+p.id+'</div></div><div class="product-stock '+sc+'">'+sl+' · '+p.stock+'</div><div class="product-price">'+p.priceUsdc.toFixed(2)+' USDC</div><button class="btn btn-outline btn-sm" onclick="delistProduct('+p.id+')">Delist</button></div>';
  }).join('');
}

function renderAnalyticsTable(products) {
  var w=document.getElementById('analytics-table-wrap'); if (!w) return;
  if (!products||!products.length) { w.innerHTML='<div class="empty"><div class="empty-icon">◈</div><div class="empty-text">No sales data yet.</div></div>'; return; }
  var tot=products.reduce(function(s,p){return s+p.priceUsdc*p.totalSold;},0);
  w.innerHTML='<table><thead><tr><th>Product</th><th>Units Sold</th><th>Revenue (USDC)</th><th>% of Total</th></tr></thead><tbody>'+
    products.map(function(p) {
      var r=p.priceUsdc*p.totalSold, pct=tot>0?((r/tot)*100).toFixed(1):'0.0';
      return '<tr><td class="order-item">'+escHtml(p.name)+'</td><td>'+p.totalSold+'</td><td class="order-price">'+r.toFixed(2)+'</td><td style="font-family:\'DM Mono\',monospace;color:var(--navy3)">'+pct+'%</td></tr>';
    }).join('')+'</tbody></table>';
}

async function delistProduct(productId) {
  if (!userAddress) return;
  if (!confirm('Delist this product from Arcade Market?')) return;
  if (contract) {
    try {
      var tx=await contract.delistProduct(productId);
      showToast('Delisting... TX: '+shortAddr(tx.hash,8),'info');
      await tx.wait(); showToast('Product delisted!','success');
    } catch(e) { showToast('Delist failed: '+(e.reason||e.message),'error'); return; }
  }
  localProducts=localProducts.filter(function(p){return p.id!==productId;});
  saveLocalProducts(); renderProducts(localProducts); loadDashboardStats();
}

function saveLocalProducts() {
  try { localStorage.setItem('arcade_products_'+(userAddress||'anon'), JSON.stringify(localProducts)); } catch(e){}
}

function loadLocalProducts() {
  try {
    var d=localStorage.getItem('arcade_products_'+(userAddress||'anon'));
    localProducts=d?JSON.parse(d):[];
  } catch(e) { localProducts=[]; }
}

function saveDraft() {
  draftData={name:document.getElementById('prod-name').value,desc:document.getElementById('prod-desc').value,price:document.getElementById('prod-price').value,stock:document.getElementById('prod-stock').value,cat:document.getElementById('prod-category').value};
  localStorage.setItem('arcade_draft',JSON.stringify(draftData));
  showToast('Draft saved!','success');
}

function loadDraft() {
  try {
    var d=localStorage.getItem('arcade_draft'); if (!d) return;
    draftData=JSON.parse(d);
    if (draftData.name)  document.getElementById('prod-name').value=draftData.name;
    if (draftData.desc)  document.getElementById('prod-desc').value=draftData.desc;
    if (draftData.price) document.getElementById('prod-price').value=draftData.price;
    if (draftData.stock) document.getElementById('prod-stock').value=draftData.stock;
    if (draftData.cat)   document.getElementById('prod-category').value=draftData.cat;
  } catch(e){}
}

function saveStoreSettings() {
  var n=document.getElementById('store-name').value.trim();
  var h=document.getElementById('store-handle').value.trim();
  var b=document.getElementById('store-bio').value.trim();
  localStorage.setItem('arcade_store',JSON.stringify({name:n,handle:h,bio:b}));
  showToast('Store settings saved!','success');
}

function showTab(name) {
  document.querySelectorAll('.content').forEach(function(el){el.classList.remove('active');});
  document.querySelectorAll('.nav-item').forEach(function(el){el.classList.remove('active');});
  var tab=document.getElementById('tab-'+name); if (tab) tab.classList.add('active');
  var titles={dashboard:'Dashboard',analytics:'Analytics',products:'Products',orders:'Orders',addproduct:'List Product',settings:'Settings'};
  var te=document.getElementById('page-title-text'); if (te) te.textContent=titles[name]||name;
  document.querySelectorAll('.nav-item').forEach(function(el) {
    if (el.getAttribute('onclick')==="showTab('"+name+"')") el.classList.add('active');
  });
  if (name==='products'&&userAddress) loadOnChainProducts();
  if (name==='analytics'&&userAddress) loadOnChainProducts();
}

function showTxModal(icon,title,desc,txHash) {
  document.getElementById('modal-icon').textContent=icon;
  document.getElementById('modal-title').textContent=title;
  document.getElementById('modal-desc').textContent=desc;
  var he=document.getElementById('modal-hash');
  if (txHash) he.innerHTML='TX: <a href="'+ARC_TESTNET.explorerTx+txHash+'" target="_blank" style="color:var(--copper3)">'+txHash+' ↗</a>';
  else he.textContent='';
  document.getElementById('tx-modal').classList.add('show');
}

function updateTxModal(icon,title,desc) {
  document.getElementById('modal-icon').textContent=icon;
  document.getElementById('modal-title').textContent=title;
  document.getElementById('modal-desc').textContent=desc;
}

function closeTxModal() { document.getElementById('tx-modal').classList.remove('show'); }

function showToast(msg,type) {
  var t=document.getElementById('toast');
  var icons={success:'✓',error:'⚠',info:'◈'};
  document.getElementById('toast-icon').textContent=icons[type]||'✓';
  document.getElementById('toast-msg').textContent=msg;
  t.className='toast '+(type||'success');
  t.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer=setTimeout(function(){t.classList.remove('show');},3200);
}

function setGateStatus(type,msg) {
  var el=document.getElementById('gate-status');
  el.textContent=msg; el.className='gate-status '+type;
}

function shortAddr(addr,chars) {
  if (!addr) return '';
  var c=chars||4;
  return addr.slice(0,c+2)+'…'+addr.slice(-c);
}

function escHtml(str) {
  return String(str).replace(/&/g,'&').replace(/</g,'<').replace(/>/g,'>').replace(/"/g,'"');
}
