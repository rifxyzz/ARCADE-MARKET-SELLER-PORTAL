# Arcade Market Seller Portal — Next.js

A Next.js seller dashboard for [Arcade Market](https://arcade-markets.vercel.app), gated by Genesis NFT ownership on Circle Arc Testnet.

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_REPO)

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Stack

- **Next.js 14** (App Router)
- **ethers.js v5** — wallet connect, NFT gating, on-chain listing
- **Circle Arc Testnet** (Chain ID 2648) — USDC settlements
- **MetaMask** — wallet provider

## Network

| Property | Value |
|----------|-------|
| Network | Circle Arc Testnet |
| Chain ID | 2648 |
| RPC | `https://rpc.arc.testnet.circle.com` |
| Explorer | https://testnet.arcscan.app |
| USDC | `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` |

## Project Structure

```
app/
  page.js              # Main page (assembles all tabs)
  layout.js            # Root layout + metadata
  globals.css          # All styles
  lib/
    constants.js       # ABIs, chain config, helpers
    useDashboard.js    # All wallet/contract logic (custom hook)
  components/
    GateScreen.js      # NFT-gated connect screen
    Sidebar.js         # Navigation sidebar
    Topbar.js          # Top bar with wallet button
    DashboardTab.js    # Overview + stats + chart
    AnalyticsTab.js    # Analytics table
    ProductsTab.js     # Product listings
    OrdersTab.js       # Orders (on-chain)
    AddProductTab.js   # List new product form
    SettingsTab.js     # Store settings + contract config
```

## Setup

1. Connect MetaMask (auto-switches to Arc Testnet)
2. Hold ≥ 1 ARCM Genesis NFT — [mint here](https://arcade-markets.vercel.app/mint)
3. Deploy `ArcadeMarket.sol` on Arc Testnet
4. Paste contract address in Settings tab
5. List products — they appear on [arcade-markets.vercel.app/market](https://arcade-markets.vercel.app/market)
