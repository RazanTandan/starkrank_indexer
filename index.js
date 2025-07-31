import { RpcProvider, num, hash } from 'starknet';
import Database from 'better-sqlite3';
import 'dotenv/config';

// Initialize SQLite database
const db = new Database('scores.db');

// Create players table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS players (
    contract_address TEXT NOT NULL,
    player_address TEXT NOT NULL,
    score INTEGER NOT NULL,
    PRIMARY KEY (contract_address, player_address)
  )
`);

// Helper function to process events and update database
function processEvents(contractAddress, events) {
  const insertStmt = db.prepare(`
    INSERT INTO players (contract_address, player_address, score)
    VALUES (?, ?, ?)
    ON CONFLICT(contract_address, player_address) DO UPDATE SET score = ?
  `);

  const scoreUpdatedKey = num.toHex(hash.starknetKeccak('ScoreUpdated'));
  const scoreResetKey = num.toHex(hash.starknetKeccak('ScoreReset'));

  events.forEach(event => {
    const eventKey = event.keys[0];
    const playerAddress = event.keys[1]; // Player address is the second key

    if (eventKey === scoreUpdatedKey) {
      // ScoreUpdated event: Update or insert score
      const newScore = Number(BigInt(num.hexToDecimalString(event.data[0])));
      insertStmt.run(contractAddress, playerAddress, newScore, newScore);
      console.log(`✅ Processed ScoreUpdated for ${playerAddress} (contract: ${contractAddress}): score = ${newScore}`);
    } else if (eventKey === scoreResetKey) {
      // ScoreReset event: Set score to 0
      insertStmt.run(contractAddress, playerAddress, 0, 0);
      console.log(`🔄 Processed ScoreReset for ${playerAddress} (contract: ${contractAddress}): score = 0`);
    }
  });
}



// Main function to fetch and store events
async function indexContractEvents(contractAddress) {
  try {
    const provider = new RpcProvider({ nodeUrl: `https://starknet-sepolia.infura.io/v3/${process.env.INFURA_API_KEY}` });

    const lastBlock = await provider.getBlock('latest');
    console.log('Latest block number:', lastBlock.block_number);

    //Key filters for both events
    const keyFilter = [
      [num.toHex(hash.starknetKeccak('ScoreUpdated')), num.toHex(hash.starknetKeccak('ScoreReset'))],
    ];

    let allEvents = [];
    let continuationToken = null;
    const chunkSize = 5;

    // Fetch events with pagination
    do {
      const eventsList = await provider.getEvents({
        address: contractAddress,
        from_block: { block_number: lastBlock.block_number - 40000 },
        to_block: { block_number: lastBlock.block_number },
        keys: keyFilter,
        chunk_size: chunkSize,
      });

      allEvents = allEvents.concat(eventsList.events);
      continuationToken = eventsList.continuation_token;
      console.log(`📦 Fetched ${eventsList.events.length} events, continuation_token: ${continuationToken}`);
    } while (continuationToken);

    // Sort events by block_number and transaction_index (if available)
    allEvents.sort((a, b) => {
      if (a.block_number !== b.block_number) {
        return a.block_number - b.block_number;
      }
      // If transaction_index is available, use it for tie-breaking
      return (a.transaction_index || 0) - (b.transaction_index || 0);
    });

    // Process all events
    processEvents(contractAddress, allEvents);

    // Log all player scores from the database
    const rows = db.prepare('SELECT * FROM players WHERE contract_address = ?').all(contractAddress);
    console.log(`📊 Final scores for contract: ${contractAddress}`);
    console.table(rows);
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

//Run indexer
(async () => {
  try {
    const contractAddresses = ['0x0310f6b79d8948d2933c3568f3f611fc1ab7f6d02de848193f158f33f94e6d51'];

    for (const addr of contractAddresses) {
      console.log(`\n🚀 Indexing contract: ${addr}`);
      await indexContractEvents(addr);
    }
  } finally {
    db.close();
  }
})();