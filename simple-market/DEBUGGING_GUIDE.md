# Simple Market - Debugging Guide

## Problem: State Not Persisting

### Symptoms
- Mutations execute successfully and return transaction hash
- Queries always return empty results
- Statistics remain at 0 even after operations
- State changes in contract don't appear in service queries

### Root Causes Found

After extensive investigation comparing with working Linera applications (lineraodds, Stream_Pay, linera-meme, Gmic), we identified two critical issues:

#### 1. Service Using Cached State ❌

**Problem:**
```rust
// WRONG - State cached at service startup
pub struct SimpleMarketService {
    state: Arc<MarketState>,  // ❌ Cached state
    runtime: Arc<ServiceRuntime<Self>>,
}

struct QueryRoot {
    state: Arc<MarketState>,  // ❌ Uses cached state
}

async fn markets(&self) -> Result<Vec<MarketQL>, String> {
    self.state.markets.indices().await  // ❌ Reads from cache
}
```

**Solution:**
```rust
// CORRECT - Reload state on every query
struct QueryRoot {
    runtime: Arc<ServiceRuntime<SimpleMarketService>>,
    storage_context: linera_sdk::views::ViewStorageContext,  // ✅ Storage context
}

async fn markets(&self) -> Result<Vec<MarketQL>, String> {
    // ✅ Reload state from storage
    let state = MarketState::load(self.storage_context.clone()).await
        .map_err(|e| format!("Failed to load state: {}", e))?;
    
    state.markets.indices().await  // ✅ Reads fresh state
}
```

#### 2. Contract Not Saving State ❌

**Problem:**
```rust
// WRONG - No explicit save
async fn store(self) {
    // State is automatically persisted by Linera SDK with RootView
    // No explicit save needed  // ❌ WRONG ASSUMPTION!
}
```

**Solution:**
```rust
// CORRECT - Explicit save required
use linera_sdk::{
    views::{RootView, View},  // ✅ Import RootView trait
    // ...
};

async fn store(mut self) {
    self.state.save().await.expect("Failed to save state");  // ✅ Explicit save
}
```

### Investigation Process

1. **Compared with Stream_Pay** - Uses `GraphQLMutationRoot` ✅
2. **Compared with linera-meme** - Uses `GraphQLMutationRoot` ✅
3. **Compared with Gmic** - Uses custom MutationRoot with `schedule_operation`
4. **Compared with lineraodds** - Found the solution! ✅

### Key Differences: lineraodds Pattern

lineraodds (working) vs Simple Market (broken):

| Aspect | lineraodds ✅ | Simple Market (before fix) ❌ |
|--------|--------------|-------------------------------|
| QueryRoot | Uses `storage_context` | Uses cached `state` |
| Query method | Reloads state each time | Uses cached state |
| Contract store | Calls `state.save()` | No explicit save |
| Import | `views::{RootView, View}` | Only `views::View` |

### Complete Fix

#### File: `src/service.rs`

```rust
// 1. Update QueryRoot structure
struct QueryRoot {
    runtime: Arc<ServiceRuntime<SimpleMarketService>>,
    storage_context: linera_sdk::views::ViewStorageContext,
}

// 2. Update handle_query
async fn handle_query(&self, request: Request) -> Response {
    let schema = Schema::build(
        QueryRoot { 
            runtime: self.runtime.clone(),
            storage_context: self.runtime.root_view_storage_context(),
        },
        Operation::mutation_root(self.runtime.clone()),
        EmptySubscription,
    )
    .finish();
    
    schema.execute(request).await
}

// 3. Update all query methods to reload state
async fn markets(&self) -> Result<Vec<MarketQL>, String> {
    let state = MarketState::load(self.storage_context.clone()).await
        .map_err(|e| format!("Failed to load state: {}", e))?;
    
    // ... use state
}
```

#### File: `src/contract.rs`

```rust
// 1. Add RootView import
use linera_sdk::{
    views::{RootView, View},  // Add RootView
    // ...
};

// 2. Update store method
async fn store(mut self) {
    self.state.save().await.expect("Failed to save state");
}
```

### Testing

```bash
# 1. Build
cargo build --release --target wasm32-unknown-unknown

# 2. Deploy
linera --with-wallet 0 publish-and-create \
  target/wasm32-unknown-unknown/release/simple_market_contract.wasm \
  target/wasm32-unknown-unknown/release/simple_market_service.wasm

# 3. Test create market
source .env.simple-market
DEADLINE=$(($(date +%s) * 1000000 + 600000000))
curl -X POST "http://localhost:8080/chains/$CHAIN_ID/applications/$SIMPLE_MARKET_APP_ID" \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"mutation { createMarket(question: \\\"Test\\\", endTime: $DEADLINE) }\"}"

# 4. Verify market persisted
curl -X POST "http://localhost:8080/chains/$CHAIN_ID/applications/$SIMPLE_MARKET_APP_ID" \
  -H "Content-Type: application/json" \
  -d '{"query":"{ markets { id question status } statistics { totalMarkets } }"}'
```

### Expected Result

```json
{
  "data": {
    "markets": [
      {
        "id": "1",
        "question": "Test",
        "status": "Open"
      }
    ],
    "statistics": {
      "totalMarkets": "1"
    }
  }
}
```

### Lessons Learned

1. **Don't cache state in service** - Always reload from storage_context
2. **Explicit save required** - Call `state.save()` in `store()` method
3. **Import RootView trait** - Needed for `save()` method
4. **Compare with working examples** - lineraodds pattern is the gold standard
5. **Test thoroughly** - Verify state persists after mutations

### References

- Working example: `/home/mdlog/Project-MDlabs/linera-new/lineraodds/management/`
- Linera SDK: `linera_sdk::views::{RootView, View}`
- Contract trait: `async fn store(mut self)`

### Deployment Info

- **Fixed Version**: Deployed 2025-11-30T09:58:17Z
- **Application ID**: `2653d884afb3bddbdf4b0f6bc3563892b5dfb81244840f16fa15342ce64d7608`
- **Chain ID**: `8a80fe20530eb03889f28ac1fda8628430c30b2564763522e1b7268eaecdf7ef`
- **Status**: ✅ Working - State persists correctly
