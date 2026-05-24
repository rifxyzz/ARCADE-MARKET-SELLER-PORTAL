export const ARC_TESTNET = {
  chainId: 5042002, chainIdHex: '0x4cef52', name: 'Arc Testnet',
  rpcUrl: 'https://rpc.testnet.arc.network',
  explorerUrl: 'https://testnet.arcscan.app',
  explorerTx: 'https://testnet.arcscan.app/tx/',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
}

export const DEFAULT_MARKET_CONTRACT = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT || '0xF36223FD6544e772269c77c1bcec001dFFafB7C9'

export const ARCADE_ABI = [
  { inputs:[{internalType:'string',name:'name',type:'string'},{internalType:'string',name:'description',type:'string'},{internalType:'uint256',name:'priceUsdc',type:'uint256'},{internalType:'uint256',name:'stock',type:'uint256'},{internalType:'string',name:'category',type:'string'},{internalType:'string',name:'imageUri',type:'string'}], name:'listProduct', outputs:[{internalType:'uint256',name:'productId',type:'uint256'}], stateMutability:'nonpayable', type:'function' },
  { inputs:[{internalType:'address',name:'seller',type:'address'}], name:'getSellerProducts', outputs:[{components:[{internalType:'uint256',name:'id',type:'uint256'},{internalType:'string',name:'name',type:'string'},{internalType:'string',name:'description',type:'string'},{internalType:'uint256',name:'priceUsdc',type:'uint256'},{internalType:'uint256',name:'stock',type:'uint256'},{internalType:'string',name:'category',type:'string'},{internalType:'string',name:'imageUri',type:'string'},{internalType:'address',name:'seller',type:'address'},{internalType:'bool',name:'active',type:'bool'},{internalType:'uint256',name:'totalSold',type:'uint256'}],internalType:'struct ArcadeMarket.Product[]',name:'',type:'tuple[]'}], stateMutability:'view', type:'function' },
  { inputs:[{internalType:'uint256',name:'productId',type:'uint256'}], name:'delistProduct', outputs:[], stateMutability:'nonpayable', type:'function' },
  { inputs:[{internalType:'address',name:'seller',type:'address'}], name:'getSellerStats', outputs:[{internalType:'uint256',name:'totalRevenue',type:'uint256'},{internalType:'uint256',name:'totalOrders',type:'uint256'},{internalType:'uint256',name:'activeListings',type:'uint256'}], stateMutability:'view', type:'function' },
  { anonymous:false, inputs:[{indexed:true,internalType:'uint256',name:'productId',type:'uint256'},{indexed:true,internalType:'address',name:'seller',type:'address'},{indexed:false,internalType:'string',name:'name',type:'string'},{indexed:false,internalType:'uint256',name:'priceUsdc',type:'uint256'}], name:'ProductListed', type:'event' }
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

export function toDataUri(file) {
  return new Promise(r => {
    const fr = new FileReader()
    fr.onload = e => r(e.target.result)
    fr.onerror = () => r('')
    fr.readAsDataURL(file)
  })
}
