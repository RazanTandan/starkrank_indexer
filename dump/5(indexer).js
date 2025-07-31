// It works




import { RpcProvider, num, hash } from 'starknet';
import Database from 'better-sqlite3';


// Initialize SQLite database
const db = new Database('scores.db');


// safe it won't create new table if already exists
// IF NOT EXSITS hataye vane each time i run script, I will run in into conflict
// Create players table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS players (
    player_address TEXT PRIMARY KEY,
    score INTEGER NOT NULL
  )
`);

// Helper function to process events and update database
function processEvents(events) {
  const insertStmt = db.prepare(`
    INSERT INTO players (player_address, score)
    VALUES (?, ?)
    ON CONFLICT(player_address) DO UPDATE SET score = ?
  `);

  const scoreUpdatedKey = num.toHex(hash.starknetKeccak('ScoreUpdated'));
  const scoreResetKey = num.toHex(hash.starknetKeccak('ScoreReset'));
  
  events.forEach(event => {
    const eventKey = event.keys[0];
    const playerAddress = event.keys[1]; // Player address is the second key

    if (eventKey === scoreUpdatedKey) {
      // ScoreUpdated event: Update or insert score
      const newScore = Number(BigInt(num.hexToDecimalString(event.data[0])));
      insertStmt.run(playerAddress, newScore, newScore); //WHY i have 2 newScore--> update lai ni 
      console.log(`Processed ScoreUpdated for ${playerAddress}: score = ${newScore}`);
    } else if (eventKey === scoreResetKey) {
      // ScoreReset event: Set score to 0
      insertStmt.run(playerAddress, 0, 0);
      console.log(`Processed ScoreReset for ${playerAddress}: score = 0`);
    }
  });
}


// Main function to fetch and store events
(async () => {
  try {
    const provider = new RpcProvider({ nodeUrl: 'https://starknet-sepolia.infura.io/v3/9f1357677c944da3a2b9a8339d288bc3' });
    const lastBlock = await provider.getBlock('latest');
    console.log('Latest block number:', lastBlock.block_number);

    // Define key filters for both events
    const keyFilter = [
      [num.toHex(hash.starknetKeccak('ScoreUpdated')), num.toHex(hash.starknetKeccak('ScoreReset'))], 
    ];
    const myContractAddress = '0x0310f6b79d8948d2933c3568f3f611fc1ab7f6d02de848193f158f33f94e6d51';

    let allEvents = [];
    let continuationToken = null;
    const chunkSize = 5;

    // Fetch events with pagination
    do {
      const eventsList = await provider.getEvents({
        address: myContractAddress,
        from_block: { block_number: lastBlock.block_number - 40000 },
        to_block: { block_number: lastBlock.block_number },
        keys: keyFilter,
        chunk_size: chunkSize,
      });


      allEvents = allEvents.concat(eventsList.events);
      continuationToken = eventsList.continuation_token;
      console.log(`Fetched ${eventsList.events.length} events, continuation_token: ${continuationToken}`);
    } while (continuationToken);

    // Sort events by block_number and transaction_index (if available)
    allEvents.sort((a, b) => {
      if (a.block_number !== b.block_number) {
        return a.block_number - b.block_number; //sorting in acceding order
      }
      // If transaction_index is available, use it for tie-breaking
      return (a.transaction_index || 0) - (b.transaction_index || 0);
    });

    // Process all events
    processEvents(allEvents);

    // Log all player scores from the database
    const rows = db.prepare('SELECT * FROM players').all();
    console.log('Final player scores in database:');
    console.table(rows);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    db.close();
  }
})();