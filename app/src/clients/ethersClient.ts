import { ethers } from 'ethers'
export const mainNetInfuraProvider = new ethers.providers.JsonRpcProvider(
    { url: 'https://evm.kava.io/', throttleLimit: 1 },
    2222,
)
export const optimismInfuraProvider = new ethers.providers.JsonRpcProvider(
    { url: 'https://evm.kava.io/', throttleLimit: 1 },
    2222,
)
export const alchemyProvider = new ethers.providers.JsonRpcProvider(
    { url: 'https://evm.kava.io/', throttleLimit: 1 },
    2222,
)

export const optimsimProvider = new ethers.providers.JsonRpcProvider(
  { url: 'https://evm.kava.io/', throttleLimit: 1 },
    2222,
)
