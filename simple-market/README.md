# Simple Market

A minimal prediction market implementation for testing Alethea Oracle Registry v2 resolution callbacks.

## Features

- ✅ Create binary (Yes/No) prediction markets
- ✅ Place bets on market outcomes
- ✅ Receive resolution callbacks from Oracle Registry v2
- ✅ Claim payouts based on oracle results
- ✅ State persistence (fixed!)

## Architecture

### Components

1. **Contract** (`src/contract.rs`) - State machine that executes operations
2. **Service** (`src/service.rs`) - GraphQL interface for queries and mutations
3. **State** (`src/state.rs`) - Persistent storage using Linera views
4. **Lib** (`src/lib.rs`) - Types, operations, and ABI definitions

### State Management

Uses Linera SDK's `RootView` with the following storage:

- `markets: MapView<u64, Market>` - All markets indexed by ID
- `bets: MapView<(u64, ChainId), Bet>` - All bets indexed by (market_id, bettor)
- `next_market_id: RegisterView<u64>` - Counter for market IDs
- `registry_app_id: RegisterView<Option<ApplicationId>>` - Oracle Registry v2 ID
- Statistics: `total_markets_created`, `total_bets_placed`, `total_volume`

### Operations

```rust
pub enum Operation {
    CreateMarket { question: String, end_time: Timestamp },
    PlaceBet { market_id: u64, outcome: String, stake: Amount },
    ClaimPayout { market_id: u64 },
}
```

### Messages

```rust
pub enum Message {
    QueryResolutionCallback {
        query_id: u64,
        resolved_outcome: String,
        resolved_at: Timestamp,
        callback_data: Vec<u8>,  // Contains market_id
    },
}
```

## Building

```bash
cargo build --release --target wasm32-unknown-unknown
```

## Deployment

```bash
# Deploy application
linera --with-wallet 0 publish-and-create \
  target/wasm32-unknown-unknown/release/simple_market_contract.wasm \
  target/wasm32-unknown-unknown/release/simple_market_service.wasm

# Save application ID to .env.simple-market
export SIMPLE_MARKET_APP_ID="<application_id>"
export CHAIN_ID="<chain_id>"
export ALETHEA_REGISTRY_V2_ID="<registry_id>"
```

## Usage

### Create Market

```bash
DEADLINE=$(($(date +%s) * 1000000 + 600000000))  # 10 minutes from now

curl -X POST "http://localhost:8080/chains/$CHAIN_ID/applications/$SIMPLE_MARKET_APP_ID" \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"mutation { createMarket(question: \\\"Will BTC hit \$100k?\\\", endTime: $DEADLINE) }\"}"
```

### Query Markets

```bash
curl -X POST "http://localhost:8080/chains/$CHAIN_ID/applications/$SIMPLE_MARKET_APP_ID" \
  -H "Content-Type: application/json" \
  -d '{"query":"{ markets { id question status endTime queryId } }"}'
```

### Place Bet

```bash
curl -X POST "http://localhost:8080/chains/$CHAIN_ID/applications/$SIMPLE_MARKET_APP_ID" \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { placeBet(marketId: \"1\", outcome: \"Yes\", stake: \"1000000\") }"}'
```

### Claim Payout

```bash
curl -X POST "http://localhost:8080/chains/$CHAIN_ID/applications/$SIMPLE_MARKET_APP_ID" \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { claimPayout(marketId: \"1\") }"}'
```

### Query Statistics

```bash
curl -X POST "http://localhost:8080/chains/$CHAIN_ID/applications/$SIMPLE_MARKET_APP_ID" \
  -H "Content-Type: application/json" \
  -d '{"query":"{ statistics { totalMarkets totalBets totalVolume } }"}'
```

## Integration with Oracle Registry v2

### Workflow

1. **Create Market** - Market is created with `status: Open`
2. **Market Expires** - When `end_time` is reached, market needs resolution
3. **Query Created** - (Manual for now) Create query in Registry v2 with callback info
4. **Voters Vote** - Oracle voters commit and reveal votes
5. **Query Resolves** - Registry v2 determines outcome
6. **Callback Sent** - Registry v2 sends `QueryResolutionCallback` message to market
7. **Market Resolved** - Market updates to `status: Resolved` with winning outcome
8. **Claim Payouts** - Winners can claim their payouts

### Callback Data Format

Market ID is serialized as BCS-encoded u64:
- Market ID 1 = `0x0100000000000000` (little-endian)
- Market ID 2 = `0x0200000000000000`

## Troubleshooting

### Markets Not Persisting

See `DEBUGGING_GUIDE.md` for detailed troubleshooting steps.

**Quick Fix Checklist:**
- ✅ Service reloads state from `storage_context` (not cached)
- ✅ Contract calls `self.state.save()` in `store()` method
- ✅ Import `RootView` trait: `use linera_sdk::views::{RootView, View}`

### Cross-Chain Messaging Not Working

Cross-chain messaging to Registry v2 is not yet implemented. For now:
1. Create market in Simple Market
2. Manually create query in Registry v2 with callback info
3. Query resolves and sends callback to market

## Testing

```bash
# Run full workflow test
./test-simple-market.sh

# Or manual steps
source .env.simple-market

# 1. Create market
DEADLINE=$(($(date +%s) * 1000000 + 600000000))
curl -X POST "$SIMPLE_MARKET_URL" \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"mutation { createMarket(question: \\\"Test\\\", endTime: $DEADLINE) }\"}"

# 2. Verify market created
curl -X POST "$SIMPLE_MARKET_URL" \
  -H "Content-Type: application/json" \
  -d '{"query":"{ markets { id question status } }"}'

# 3. Create query in Registry v2 (manual)
# 4. Wait for resolution
# 5. Verify market resolved
```

## Configuration

Current deployment (as of 2025-11-30):

```bash
SIMPLE_MARKET_APP_ID="2653d884afb3bddbdf4b0f6bc3563892b5dfb81244840f16fa15342ce64d7608"
CHAIN_ID="8a80fe20530eb03889f28ac1fda8628430c30b2564763522e1b7268eaecdf7ef"
ALETHEA_REGISTRY_V2_ID="9e5e530312d7f508b5b7056407025ebd0d42ddfdd3a0db7c364eb3ed7a8fe3b5"
```

## Known Limitations

1. **Cross-Chain Messaging** - Not yet implemented, queries must be created manually
2. **Registry ID** - Hardcoded in contract instantiation
3. **Binary Markets Only** - Only supports Yes/No outcomes
4. **No AMM** - Simple pool-based payout calculation

## Future Improvements

- [ ] Implement cross-chain messaging to Registry v2
- [ ] Support multi-outcome markets
- [ ] Add AMM pricing mechanism
- [ ] Dynamic registry configuration
- [ ] Market cancellation/refunds
- [ ] Advanced betting features

## References

- Linera SDK: https://docs.linera.io/
- Oracle Registry v2: `../oracle-registry-v2/`
- Working example: `lineraodds/management/` (state persistence pattern)

## License

MIT
