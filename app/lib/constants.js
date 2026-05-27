export const ARC_TESTNET = {
  chainId: 5042002, chainIdHex: '0x4cef52', name: 'Arc Testnet',
  rpcUrl: process.env.NEXT_PUBLIC_ARC_TESTNET_RPC_URL || 'https://rpc.testnet.arc.network',
  explorerUrl: 'https://testnet.arcscan.app',
  explorerTx: 'https://testnet.arcscan.app/tx/',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
}

export const MARKETPLACE_URL = process.env.NEXT_PUBLIC_MARKETPLACE_URL || 'https://www.arcademarkets.xyz'
export const MARKET_API_URL = process.env.NEXT_PUBLIC_MARKET_API_URL || `${MARKETPLACE_URL}/api/sellers`
export const MINT_URL = process.env.NEXT_PUBLIC_MINT_URL || `${MARKETPLACE_URL}/mint`
export const DEFAULT_MARKET_CONTRACT = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT || ''
export const SELLER_MARKET_FACTORY_CONTRACT = process.env.NEXT_PUBLIC_SELLER_MARKET_FACTORY_CONTRACT || process.env.NEXT_PUBLIC_SELLER_MARKET_FACTORY_ADDRESS || '0x68Ea73653605B81f309DD5DcE4DfCc663001dF0a'
export const GENESIS_NFT_CONTRACT = process.env.NEXT_PUBLIC_GENESIS_NFT_CONTRACT || '0x7817f42C4355175Edf0a4d1c8b8a6f6a3E9e148F'
export const MIN_NFT_BALANCE = Number(process.env.NEXT_PUBLIC_MIN_NFT_BALANCE || 1)

export const ARCADE_ABI = [
  { inputs:[{internalType:'string',name:'name',type:'string'},{internalType:'string',name:'description',type:'string'},{internalType:'uint256',name:'priceUsdc',type:'uint256'},{internalType:'uint256',name:'stock',type:'uint256'},{internalType:'string',name:'category',type:'string'},{internalType:'string',name:'imageUri',type:'string'}], name:'listProduct', outputs:[{internalType:'uint256',name:'productId',type:'uint256'}], stateMutability:'nonpayable', type:'function' },
  { inputs:[{internalType:'string',name:'name',type:'string'},{internalType:'string',name:'description',type:'string'},{internalType:'uint256',name:'priceUsdc',type:'uint256'},{internalType:'uint256',name:'stock',type:'uint256'},{internalType:'string',name:'category',type:'string'},{internalType:'string',name:'imageUri',type:'string'}], name:'createProduct', outputs:[{internalType:'uint256',name:'productId',type:'uint256'}], stateMutability:'nonpayable', type:'function' },
  { inputs:[{internalType:'address',name:'seller',type:'address'}], name:'getSellerProducts', outputs:[{components:[{internalType:'uint256',name:'id',type:'uint256'},{internalType:'string',name:'name',type:'string'},{internalType:'string',name:'description',type:'string'},{internalType:'uint256',name:'priceUsdc',type:'uint256'},{internalType:'uint256',name:'stock',type:'uint256'},{internalType:'string',name:'category',type:'string'},{internalType:'string',name:'imageUri',type:'string'},{internalType:'address',name:'seller',type:'address'},{internalType:'bool',name:'active',type:'bool'},{internalType:'uint256',name:'totalSold',type:'uint256'}],internalType:'struct ArcadeMarket.Product[]',name:'',type:'tuple[]'}], stateMutability:'view', type:'function' },
  { inputs:[], name:'getAllProducts', outputs:[{components:[{internalType:'uint256',name:'id',type:'uint256'},{internalType:'string',name:'name',type:'string'},{internalType:'string',name:'description',type:'string'},{internalType:'uint256',name:'priceUsdc',type:'uint256'},{internalType:'uint256',name:'stock',type:'uint256'},{internalType:'string',name:'category',type:'string'},{internalType:'string',name:'imageUri',type:'string'},{internalType:'address',name:'seller',type:'address'},{internalType:'bool',name:'active',type:'bool'},{internalType:'uint256',name:'totalSold',type:'uint256'}],internalType:'struct ArcadeMarket.Product[]',name:'',type:'tuple[]'}], stateMutability:'view', type:'function' },
  { inputs:[{internalType:'uint256',name:'productId',type:'uint256'}], name:'delistProduct', outputs:[], stateMutability:'nonpayable', type:'function' },
  { inputs:[{internalType:'uint256',name:'productId',type:'uint256'},{internalType:'bool',name:'active',type:'bool'}], name:'setProductActive', outputs:[], stateMutability:'nonpayable', type:'function' },
  { inputs:[{internalType:'address',name:'seller',type:'address'}], name:'getSellerStats', outputs:[{internalType:'uint256',name:'totalRevenue',type:'uint256'},{internalType:'uint256',name:'totalOrders',type:'uint256'},{internalType:'uint256',name:'activeListings',type:'uint256'}], stateMutability:'view', type:'function' },
  { anonymous:false, inputs:[{indexed:true,internalType:'uint256',name:'productId',type:'uint256'},{indexed:true,internalType:'address',name:'seller',type:'address'},{indexed:false,internalType:'string',name:'name',type:'string'},{indexed:false,internalType:'uint256',name:'priceUsdc',type:'uint256'}], name:'ProductListed', type:'event' },
  { anonymous:false, inputs:[{indexed:true,internalType:'uint256',name:'productId',type:'uint256'},{indexed:true,internalType:'address',name:'buyer',type:'address'},{indexed:true,internalType:'address',name:'seller',type:'address'},{indexed:false,internalType:'uint256',name:'amount',type:'uint256'},{indexed:false,internalType:'uint256',name:'quantity',type:'uint256'}], name:'ProductPurchased', type:'event' }
]

export const SELLER_FACTORY_ABI = [
  { inputs:[{internalType:'address',name:'seller',type:'address'}], name:'sellerMarket', outputs:[{internalType:'address',name:'',type:'address'}], stateMutability:'view', type:'function' },
  { inputs:[], name:'createSellerMarket', outputs:[{internalType:'address',name:'market',type:'address'}], stateMutability:'nonpayable', type:'function' },
  { inputs:[{internalType:'address',name:'seller',type:'address'}], name:'createSellerMarketFor', outputs:[{internalType:'address',name:'market',type:'address'}], stateMutability:'nonpayable', type:'function' },
  { anonymous:false, inputs:[{indexed:true,internalType:'address',name:'seller',type:'address'},{indexed:true,internalType:'address',name:'market',type:'address'},{indexed:true,internalType:'uint256',name:'index',type:'uint256'}], name:'SellerMarketCreated', type:'event' },
]

export const NFT_ABI = [
  { inputs:[{internalType:'address',name:'owner',type:'address'}], name:'balanceOf', outputs:[{internalType:'uint256',name:'',type:'uint256'}], stateMutability:'view', type:'function' }
]

export const CHART_H = [18,42,28,65,50,80,38]
export const DAYS = ['S','M','T','W','T','F','S']
export const CAT_EMOJI = {'Collectibles':'🃏','Game Items':'🗡','Apparel':'🧥','Access Pass':'🎫','Digital Art':'🖼'}

export function getTier(b) {
  if (b>=10000) return {id:'legendary',name:'LEGENDARY'}
  if (b>=1000)  return {id:'epic',name:'EPIC'}
  if (b>=100)   return {id:'rare',name:'RARE'}
  return {id:'common',name:'COMMON'}
}

export function short(addr, c=4) {
  return addr ? addr.slice(0,c+2)+'\u2026'+addr.slice(-c) : ''
}

export const MAX_IMAGE_UPLOAD_BYTES = 5 * 1024 * 1024
export const MAX_ONCHAIN_IMAGE_BYTES = 24 * 1024

export function toDataUri(file) {
  return new Promise(r => {
    const fr = new FileReader()
    fr.onload = e => r(e.target.result)
    fr.onerror = () => r('')
    fr.readAsDataURL(file)
  })
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export async function imageToOptimizedDataUri(file) {
  if (!file || !file.type?.startsWith('image/')) throw new Error('Please upload a valid image file.')
  if (file.size > MAX_IMAGE_UPLOAD_BYTES) throw new Error('Image must be 5 MB or smaller.')

  const original = await toDataUri(file)
  if (!original) throw new Error('Could not read image file.')
  if (file.type === 'image/gif' && file.size <= MAX_ONCHAIN_IMAGE_BYTES) return original

  const img = await loadImage(original)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  let maxSide = 360
  let quality = 0.72

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const scale = Math.min(1, maxSide / Math.max(img.width, img.height))
    canvas.width = Math.max(1, Math.round(img.width * scale))
    canvas.height = Math.max(1, Math.round(img.height * scale))
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    const dataUri = canvas.toDataURL('image/jpeg', quality)
    const approxBytes = Math.ceil((dataUri.length - dataUri.indexOf(',') - 1) * 3 / 4)
    if (approxBytes <= MAX_ONCHAIN_IMAGE_BYTES || attempt === 7) return dataUri

    quality = Math.max(0.42, quality - 0.06)
    maxSide = Math.max(160, Math.round(maxSide * 0.78))
  }

  return original
}
