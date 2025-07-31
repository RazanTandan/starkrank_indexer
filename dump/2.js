//batch JSON-RPC
//batching many requests into one using BatchClient Class

import { RpcProvider } from 'starknet';

const provider = new RpcProvider({ batch: 0 });


const [blockNumber, chainId] = await Promise.all([
    provider.getBlockNumber(), 
    provider.getChainId(),
])

console.log(blockNumber, chainId);