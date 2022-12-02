import { ethers } from 'ethers'
export const mainNetInfuraProvider = new ethers.providers.JsonRpcProvider(
    { url: 'https://evm.testnet.kava.io/', throttleLimit: 1 },
    2221,
)
export const optimismInfuraProvider = new ethers.providers.JsonRpcProvider(
    { url: 'https://evm.testnet.kava.io/', throttleLimit: 1 },
    2221,
)
export const alchemyProvider = new ethers.providers.JsonRpcProvider(
    { url: 'https://evm.testnet.kava.io/', throttleLimit: 1 },
    2221,
)

export const optimsimProvider = new ethers.providers.JsonRpcProvider(
  { url: 'https://evm.testnet.kava.io/', throttleLimit: 1 },
    2221,
)
