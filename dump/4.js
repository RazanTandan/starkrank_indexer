// this works

import { RpcProvider, num, hash } from 'starknet';

const provider = new RpcProvider({ nodeUrl:  'https://starknet-sepolia.infura.io/v3/apikey' });
const lastBlock = await provider.getBlock('latest');

// 0x2437e2dd15613166966756a703549462f0aeeb39e93947db16dd69895267962 i am trying to filter out this specific address data but can't i am getting all values
const keyFilter = [[num.toHex(hash.starknetKeccak('ScoreUpdated')), '0x2437e2dd15613166966756a703549462f0aeeb39e93947db16dd69895267962']];
const myContractAddress = '0x0310f6b79d8948d2933c3568f3f611fc1ab7f6d02de848193f158f33f94e6d51';

const eventsList = await provider.getEvents({
  address: myContractAddress,
  from_block: { block_number: lastBlock.block_number - 20000 },
  to_block: { block_number: lastBlock.block_number },
  keys: keyFilter,
  chunk_size: 5,
});

console.log(eventsList.events); // got all 3 ScoreUpdated Events
console.log(num.hexToDecimalString(eventsList.events[1].data[0])); // works got 65, 99, 221


// get all the data from start... 
// then store it in db 
// when user queires if there's any new. go from the prev time latest block... to the current prev block.... others will stay same 




// i got 2 events: 

// 1. ScoreUpdated -> key: player, new_score
// 2. ScoreReset -> key: player 

// i should store them at db 


// check if player exists, if yes then update 
// if not create one row 

// if player exists in reset, yes 
// update to 0


// easy 