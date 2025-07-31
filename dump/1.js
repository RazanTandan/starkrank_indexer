import { RpcProvider, constants } from 'starknet';

const provider = new RpcProvider({ nodeUrl: constants.NetworkName.SN_SEPOLIA });

const blockNumber = await provider.getBlockNumber(); 
console.log(blockNumber);

const chainId = await provider.getChainId();
console.log(chainId);