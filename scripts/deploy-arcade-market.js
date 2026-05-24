const hre = require('hardhat')

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const DEFAULT_USDC = '0x0000000000000000000000000000000000000000'

function getAddressEnv(name, fallback = ZERO_ADDRESS) {
  const value = process.env[name] || fallback
  if (!hre.ethers.utils.isAddress(value)) {
    throw new Error(`${name} must be a valid 0x address. Received: ${value}`)
  }
  return value
}

async function main() {
  const [deployer] = await hre.ethers.getSigners()

  if (!deployer) {
    throw new Error('No deployer account found. Set PRIVATE_KEY in your environment.')
  }

  const network = await hre.ethers.provider.getNetwork()
  const balance = await deployer.getBalance()

  const usdcToken = getAddressEnv('USDC_TOKEN', DEFAULT_USDC)
  const genesisNFT = getAddressEnv('GENESIS_NFT', ZERO_ADDRESS)
  const minNFTBalance = process.env.MIN_NFT_BALANCE || '0'
  const platformFeeBps = process.env.PLATFORM_FEE_BPS || '0'
  const feeRecipient = getAddressEnv('FEE_RECIPIENT', deployer.address)

  console.log('Deploying ArcadeMarket...')
  console.log('Network:', network.name, `(${network.chainId})`)
  console.log('Deployer:', deployer.address)
  console.log('Deployer balance:', hre.ethers.utils.formatEther(balance), 'ETH')
  console.log('Constructor args:')
  console.log('  USDC_TOKEN:', usdcToken)
  console.log('  GENESIS_NFT:', genesisNFT)
  console.log('  MIN_NFT_BALANCE:', minNFTBalance)
  console.log('  PLATFORM_FEE_BPS:', platformFeeBps)
  console.log('  FEE_RECIPIENT:', feeRecipient)

  const ArcadeMarket = await hre.ethers.getContractFactory('ArcadeMarket')
  const arcadeMarket = await ArcadeMarket.deploy(
    usdcToken,
    genesisNFT,
    minNFTBalance,
    platformFeeBps,
    feeRecipient
  )

  console.log('Deploy tx:', arcadeMarket.deployTransaction.hash)
  await arcadeMarket.deployed()

  console.log('ArcadeMarket deployed to:', arcadeMarket.address)
  console.log('Arcscan:', `https://testnet.arcscan.app/address/${arcadeMarket.address}`)
  console.log('')
  console.log('Next step: paste this address into Seller Portal > Settings > ArcadeMarket Contract.')
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
