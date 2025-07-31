//batch JSON-RPC
//batching many requests into one using BatchClient Class

import { BatchClient, RpcProvider } from 'starknet';

const provider = new RpcProvider();

const batchClient = new BatchClient({
    nodeUrl: provider.channel.nodeUrl, 
    headers: provider.channel.headers, 
    interval: 0, 
});



const [blockNumber, chainId] = await Promise.all([
    provider.getBlockNumber(), 
    provider.getChainId(),
])

console.log(blockNumber, chainId);