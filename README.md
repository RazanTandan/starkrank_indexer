# Score Events Indexer

A Node.js indexer that processes Starknet smart contract events from contracts using StarkRank component to track player scores. It stores player scores in a SQLite database. Useful for gaming dApps that need leaderboard functionality.

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Infura Starknet API key
- starknet.js
- better-sqlite3

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/starknet-event-indexer.git
   cd starknet-event-indexer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Add your Infura API key to `.env`:
   ```env
   INFURA_API_KEY=your_infura_api_key_here
   ```

## 🎯 Usage

### Basic Usage

1. **Add your contract addresses** in `index.js`:
   ```javascript
   const contractAddresses = [
     '0x0310f6b79d8948d2933c3568f3f611fc1ab7f6d02de848193f158f33f94e6d51',
     // Add more contract addresses here
   ];
   ```

2. **Run the indexer**:
   ```bash
   npm start
   ```

### Expected Output
looks something like this: 
```
🚀 Indexing contract: 0x0310f6b79d8948d2933c3568f3f611fc1ab7f6d02de848193f158f33f94e6d51
Latest block number: 1285526
📦 Fetched 25 events, continuation_token: null
✅ Processed ScoreUpdated for 0x123...abc (contract: 0x031...d51): score = 1500
🔄 Processed ScoreReset for 0x456...def (contract: 0x031...d51): score = 0
📊 Final scores for contract: 0x0310f6b79d8948d2933c3568f3f611fc1ab7f6d51
```

## 📊 Database Schema

The indexer creates a SQLite database (`scores.db`) with the following schema:

```sql
CREATE TABLE players (
    contract_address TEXT NOT NULL,
    player_address TEXT NOT NULL,
    score INTEGER NOT NULL,
    PRIMARY KEY (contract_address, player_address)
);
```

## 🎮 Smart Contract Events

The indexer processes these Cairo events:

### ScoreUpdated
```cairo
#[derive(Drop, starknet::Event)]
struct ScoreUpdated {
    player: ContractAddress,
    score: u64,
}
```

### ScoreReset  
```cairo
#[derive(Drop, starknet::Event)]
struct ScoreReset {
    player: ContractAddress,
}
```

## 🔧 Configuration

### Environment Variables
- `INFURA_API_KEY`: Your Infura Starknet API key

### Customizable Parameters
```javascript
const chunkSize = 5;           // Events per request
const blockRange = 4000;      // How many blocks to scan
```

## 🔍 Troubleshooting

### Common Issues

**"RPC Error: Invalid params"**
- Check your Infura API key
- Verify contract address format

**"No events found"**
- Confirm your contract emits the expected events
- Check the block range (increase `blockRange`)
- Verify event names match your contract

**"Database locked"**
- Ensure only one instance is running
- Close database connections properly


## 🙏 Acknowledgments

- [Starknet.js](https://github.com/0xs34n/starknet.js) for blockchain interaction
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) for database operations
- [Infura](https://infura.io/) for Starknet RPC access
