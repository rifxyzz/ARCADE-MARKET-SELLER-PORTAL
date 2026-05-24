# Deploy ArcadeMarket to Arc Testnet

This project includes a Hardhat deploy flow for `contracts/ArcadeMarket.sol`.

## 1. Install dependencies

```bash
npm install
```

If npm shows a cache permission error, use a local cache:

```bash
npm install --cache ./.npm-cache
```

## 2. Create `.env`

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and fill at least:

```bash
PRIVATE_KEY=0xf9f6d852945bfbcb4beb01d0407da788f1a726091b517f1d30f2309c2cc5fd44
ARC_TESTNET_RPC_URL=https://rpc.testnet.arc.network
```

For quick listing tests, you can keep:

```bash
USDC_TOKEN=0x0000000000000000000000000000000000000000
GENESIS_NFT=0x0000000000000000000000000000000000000000
MIN_NFT_BALANCE=0
PLATFORM_FEE_BPS=0
```

For real USDC purchase flow, replace `USDC_TOKEN` with the correct Arc Testnet USDC address used by your marketplace.

## 3. Compile

```bash
npm run compile
```

## 4. Deploy

Make sure the deployer wallet has Arc Testnet gas token, then run:

```bash
npm run deploy:arc
```

The script prints:

```text
ArcadeMarket deployed to: 0x...
```

## 5. Connect the Seller Portal

1. Open the seller portal.
2. Connect the same wallet.
3. Go to Settings.
4. Paste the deployed `ArcadeMarket` address into ArcadeMarket Contract.
5. Click Save.
6. List product again and confirm the MetaMask transaction.

A product must be listed on-chain to appear on the marketplace. If the product label is `local`, it was not submitted to the deployed contract.

## Files added for deployment

- `hardhat.config.js` — Hardhat config for Arc Testnet.
- `contracts/ArcadeMarket.sol` — Hardhat contract source.
- `scripts/deploy-arcade-market.js` — deploy script.
- `.env.example` — environment variable template.
