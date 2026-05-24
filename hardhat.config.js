require('dotenv').config()
require('@nomiclabs/hardhat-ethers')

const PRIVATE_KEY = process.env.PRIVATE_KEY || ''
const ARC_TESTNET_RPC_URL = process.env.ARC_TESTNET_RPC_URL || 'https://rpc.testnet.arc.network'

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {},
    arcTestnet: {
      url: ARC_TESTNET_RPC_URL,
      chainId: 5042002,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
}
