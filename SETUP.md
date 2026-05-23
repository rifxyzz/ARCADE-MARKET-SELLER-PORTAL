# Arcade Market Seller Portal — Setup Guide

## Overview

The Seller Portal lets Genesis NFT holders list products directly on [arcade-markets.vercel.app](https://arcade-markets.vercel.app).

**Each seller deploys their own `ArcadeMarket.sol` contract** on Arc Testnet. Products listed through the contract automatically appear on the main marketplace via `getAllProducts()`.

---

## Network: Circle Arc Testnet

| Property | Value |
|----------|-------|
| Network Name | Circle Arc Testnet |
| Chain ID | **2648** |
| RPC URL | `https://rpc.arc.testnet.circle.com` |
| Explorer | https://testnet.arcscan.app |
| USDC Address | `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` |
| Get test USDC | https://faucet.circle.com |

---

## Files

| File | Purpose |
|------|---------|
| `arcade-seller-dashboard.html` | Main dashboard UI |
| `seller-dashboard.css` | Styles (matches arcade-markets.vercel.app theme) |
| `seller-dashboard.js` | Wallet connect, NFT gating, on-chain logic |
| `ArcadeMarket.sol` | Solidity contract — each seller deploys their own |

---

## Step 1 — Add Arc Testnet to MetaMask

MetaMask will prompt automatically when you connect. Or add manually:

- **Network Name:** Circle Arc Testnet
- **RPC URL:** `https://rpc.arc.testnet.circle.com`
- **Chain ID:** `2648`
- **Currency Symbol:** ETH
- **Explorer:** `https://testnet.arcscan.app`

---

## Step 2 — Get Test USDC

1. Go to https://faucet.circle.com
2. Connect wallet → select Arc Testnet → request USDC
3. USDC will appear in your wallet on Arc Testnet

---

## Step 3 — Mint a Genesis NFT (Required for Seller Access)

1. Go to https://arcade-markets.vercel.app/mint
2. Connect wallet on Arc Testnet
3. Mint your ARCM Genesis NFT
4. The dashboard checks your NFT balance on connect — you need ≥ 1 ARCM

---

## Step 4 — Deploy Your ArcadeMarket Contract

### Option A: Remix IDE (Recommended)

1. Go to [remix.ethereum.org](https://remix.ethereum.org)
2. Create new file → paste contents of `ArcadeMarket.sol`
3. Compile: Solidity `^0.8.20`, EVM version `paris`
4. Deploy tab → Environment: **Injected Provider (MetaMask)**
5. Make sure MetaMask is on **Arc Testnet (Chain ID 2648)**
6. Constructor arguments:
   ```
   _usdcToken:      0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
   _genesisNFT:     <your ARCM NFT contract address, or 0x000...000 to skip>
   _minNFTBalance:  1
   _platformFeeBps: 0      (0% fee — you keep 100%)
   _feeRecipient:   <your wallet address>
   ```
7. Click **Deploy** → confirm in MetaMask
8. Copy the deployed contract address from Remix

### Option B: Hardhat

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat init

# hardhat.config.js — add Arc Testnet:
networks: {
  arcTestnet: {
    url: 'https://rpc.arc.testnet.circle.com',
    chainId: 2648,
    accounts: ['YOUR_PRIVATE_KEY'],
  }
}

# Deploy:
npx hardhat run scripts/deploy.js --network arcTestnet
```

---

## Step 5 — Configure the Dashboard

1. Open `arcade-seller-dashboard.html` in your browser
2. Connect wallet (MetaMask will switch to Arc Testnet automatically)
3. Go to **Settings** tab
4. Paste your deployed contract address in **ArcadeMarket Contract** field
5. Click **Save**

The dashboard will now:
- Read your on-chain listings via `getSellerProducts()`
- Submit new listings via `listProduct()` (MetaMask popup)
- Show real revenue/order stats from `getSellerStats()`

---

## Step 6 — List Your First Product

1. Go to **List Product** tab
2. Fill in: Name, Description, Price (USDC), Stock, Category
3. Upload a product image (stored as base64 data URI)
4. Click **List on Arcade Market**
5. Confirm the transaction in MetaMask
6. Product appears on https://arcade-markets.vercel.app/market

---

## How Products Appear on the Main Marketplace

The main marketplace at `arcade-markets.vercel.app` calls `getAllProducts()` from your contract to display listings. Add this to the marketplace frontend:

```js
// In your Next.js marketplace page
const provider = new ethers.providers.JsonRpcProvider('https://rpc.arc.testnet.circle.com');
const contract = new ethers.Contract(SELLER_CONTRACT_ADDRESS, ABI, provider);
const products = await contract.getAllProducts();
// products = array of Product structs — render in your UI
```

For multiple sellers, maintain a registry of deployed contract addresses and aggregate `getAllProducts()` from each.

---

## Smart Contract Reference

| Function | Caller | Description |
|----------|--------|-------------|
| `listProduct(name, desc, price, stock, category, imageUri)` | Seller | List new product on-chain |
| `updateProduct(id, newPrice, newStock)` | Seller | Update price/stock |
| `delistProduct(id)` | Seller | Remove listing |
| `purchaseProduct(id, qty)` | Buyer | Buy with USDC (buyer must approve first) |
| `getSellerProducts(address)` | Anyone | Get all listings by a seller |
| `getAllProducts()` | Anyone | Get all active listings (used by marketplace) |
| `getSellerStats(address)` | Anyone | Revenue, orders, active listings |
| `getProduct(id)` | Anyone | Single product lookup |

---

## NFT Gating

The dashboard checks NFT balance on wallet connect:

```
wallet connects → checkNFTBalance() →
  if balance >= MIN_NFT_BALANCE (1) → show dashboard
  else → show error on gate screen
```

**To configure the NFT contract address** (for real gating):
1. Open browser DevTools → Console
2. Run: `localStorage.setItem('arcade_nft_contract', '0xYOUR_ARCM_NFT_ADDRESS')`
3. Reload the page

If no NFT contract is set, the dashboard runs in **demo mode** (grants access to all wallets — useful for testing).

---

## Buyer Flow (USDC Purchase)

1. Buyer visits `arcade-markets.vercel.app/market`
2. Clicks "Buy" on a product
3. Marketplace calls `USDC.approve(contractAddress, amount)` first
4. Then calls `contract.purchaseProduct(productId, quantity)`
5. USDC transfers directly from buyer → seller wallet (minus platform fee)
6. `ProductPurchased` event emitted → dashboard stats update

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| MetaMask not detected | Install MetaMask browser extension |
| Wrong network | Dashboard auto-switches to Arc Testnet on connect |
| Access denied (NFT) | Mint ARCM at arcade-markets.vercel.app/mint |
| No contract configured | Deploy ArcadeMarket.sol → paste address in Settings |
| Products not on marketplace | Ensure marketplace calls `getAllProducts()` from your contract |
| TX rejected | User cancelled in MetaMask, or insufficient ETH for gas |
| USDC transfer failed | Buyer needs to approve USDC spend first |
