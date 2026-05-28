require('dotenv').config()
const hre = require('hardhat')

async function main() {
  const [deployer] = await hre.ethers.getSigners()
  const network = await hre.ethers.provider.getNetwork()
  const balance = await deployer.getBalance()

  console.log('Network:  ', network.name, `(chainId ${network.chainId})`)
  console.log('Deployer: ', deployer.address)
  console.log('Balance:  ', hre.ethers.utils.formatEther(balance), 'ETH')
  console.log('')

  console.log('Deploying ArcadeMarketFactory...')
  const Factory = await hre.ethers.getContractFactory('ArcadeMarketFactory')
  const factory = await Factory.deploy()
  await factory.deployed()

  console.log('ArcadeMarketFactory deployed to:', factory.address)
  console.log('Deploy tx:                       ', factory.deployTransaction.hash)
  console.log('Explorer:', `https://testnet.arcscan.app/address/${factory.address}`)
  console.log('')
  console.log('Next: paste this address into app/lib/constants.js as FACTORY_ADDRESS')
}

main().catch(err => {
  console.error(err)
  process.exitCode = 1
})
