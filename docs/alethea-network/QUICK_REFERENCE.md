# Quick Reference - Conway Testnet Deployment

**Last Updated:** November 8, 2025  
**Status:** Voters Deployed with GraphQL Mutations Fix

---

## 🚀 Quick Start

```bash
# 1. Load environment
source .env.conway

# 2. Start Linera service (if not running)
linera service --port 8080 &

# 3. Test voter GraphQL
curl -X POST http://localhost:8080/chains/$CHAIN_ID/applications/$VOTER_1_ID \
  -H "Content-Type: application/json" \
  -d '{"query":"{ status { stake reputation totalVotes } }"}'
```

---

## 📋 Current Deployment (Conway Testnet)

### Network Information

**Chain ID:**
```
a2c0349ae6add80c92e26bb383aca8d98f9f3441c3097fec99111199c7f1e221
```

**Network:**
```
conway-testnet
```

### Application IDs

**Voter Applications (✅ Working with GraphQL Mutations):**
```bash
export VOTER_1_ID="0e36707a88a3822ba3d835e081f73abceb0610c711ecc278cc4a8a11312099bd"
export VOTER_2_ID="b4f7fb227169a29541477b42f8e373e3ced8dd34e14e65f112d2e47c8ff8c63d"
export VOTER_3_ID="f02a3965f69bc42d2c8e931a57a8747b8ffef52626312467cf7097762807bc92"
```

**Registry (❌ Not Working - Compile Errors):**
```bash
export ALETHEA_REGISTRY_ID="76a2893ed86914e71823693848e316db934a49a926297621ebfbebbc0fe31f30"
```

**Coordinator (⚠️ Orphaned WASM - No Source Code):**
```bash
export ALETHEA_COORDINATOR_ID="9227842d331ee7e60d1989407ebb78d0a2b06a65cc2c2dcc08573db71ef087f0"
```

### GraphQL Endpoints

**Voter #1:**
```
http://localhost:8080/chains/a2c0349ae6add80c92e26bb383aca8d98f9f3441c3097fec99111199c7f1e221/applications/0e36707a88a3822ba3d835e081f73abceb0610c711ecc278cc4a8a11312099bd
```

**Voter #2:**
```
http://localhost:8080/chains/a2c0349ae6add80c92e26bb383aca8d98f9f3441c3097fec99111199c7f1e221/applications/b4f7fb227169a29541477b42f8e373e3ced8dd34e14e65f112d2e47c8ff8c63d
```

**Voter #3:**
```
http://localhost:8080/chains/a2c0349ae6add80c92e26bb383aca8d98f9f3441c3097fec99111199c7f1e221/applications/f02a3965f69bc42d2c8e931a57a8747b8ffef52626312467cf7097762807bc92
```

---

## ✅ Status

- ✅ **Voter Template:** WORKING (3 deployed with GraphQL mutations)
- ✅ **Market Chain:** READY (with SDK integration)
- ✅ **Alethea SDK:** WORKING
- ❌ **Registry:** NOT WORKING (compile errors)
- ⚠️ **Coordinator:** ORPHANED (old WASM, no source)

---

## 🔧 Useful Commands

### Environment Setup
```bash
# Load environment variables
source .env.conway

# Verify environment
echo "Chain ID: $CHAIN_ID"
echo "Voter #1: $VOTER_1_ID"
echo "Voter #2: $VOTER_2_ID"
echo "Voter #3: $VOTER_3_ID"
```

### Service Management
```bash
# Start Linera service
linera service --port 8080 &

# Check service status
curl http://localhost:8080/

# Stop service
pkill -f "linera service"
```

### Voter Queries
```bash
# Query voter status
curl -X POST http://localhost:8080/chains/$CHAIN_ID/applications/$VOTER_1_ID \
  -H "Content-Type: application/json" \
  -d '{"query":"{ status { stake reputation totalVotes correctVotes accuracyRate autoVoteEnabled } }"}'

# Query active votes count
curl -X POST http://localhost:8080/chains/$CHAIN_ID/applications/$VOTER_1_ID \
  -H "Content-Type: application/json" \
  -d '{"query":"{ activeVotesCount }"}'
```

### Voter Mutations
```bash
# Enable auto-vote
curl -X POST http://localhost:8080/chains/$CHAIN_ID/applications/$VOTER_1_ID \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { enableAutoVote }"}'

# Set decision strategy
curl -X POST http://localhost:8080/chains/$CHAIN_ID/applications/$VOTER_1_ID \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { setDecisionStrategy(strategy: \"random\") }"}'

# Submit vote
curl -X POST http://localhost:8080/chains/$CHAIN_ID/applications/$VOTER_1_ID \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { submitVote(marketId: 1, outcomeIndex: 0, confidence: 95) }"}'
```

### Build & Deploy
```bash
# Build all
cargo build --release --target wasm32-unknown-unknown

# Deploy voter
linera publish-and-create \
  target/wasm32-unknown-unknown/release/voter-template-contract.wasm \
  target/wasm32-unknown-unknown/release/voter-template-service.wasm

# Deploy market chain
linera publish-and-create \
  target/wasm32-unknown-unknown/release/market-chain-contract.wasm \
  target/wasm32-unknown-unknown/release/market-chain-service.wasm
```

### Testing Scripts
```bash
# Test voter mutations
./test-voter-mutations.sh

# Deploy fixed voter
./deploy-fixed-voter.sh

# Test protocol
./test-protocol.sh
```

---

## 📊 GraphQL Examples

### Voter Queries
```graphql
# Get voter status
query {
  status {
    stake
    reputation
    totalVotes
    correctVotes
    accuracyRate
    autoVoteEnabled
  }
}

# Get active votes count
query {
  activeVotesCount
}

# Get vote history count
query {
  voteHistoryCount
}
```

### Voter Mutations
```graphql
# Initialize voter
mutation {
  initialize(
    registryId: "76a2893ed86914e71823693848e316db934a49a926297621ebfbebbc0fe31f30",
    initialStake: "1000000000"
  )
}

# Submit vote
mutation {
  submitVote(
    marketId: 1,
    outcomeIndex: 0,
    confidence: 95
  )
}

# Enable auto-vote
mutation {
  enableAutoVote
}

# Set decision strategy
mutation {
  setDecisionStrategy(strategy: "random")
}
```

---

## 🔗 Related Documentation

### Core Documentation
- [START_HERE.md](START_HERE.md) - Entry point for new developers
- [ARCHITECTURE_SUMMARY.md](ARCHITECTURE_SUMMARY.md) - Complete architecture overview
- [SDK_INTEGRATION_GUIDE.md](SDK_INTEGRATION_GUIDE.md) - SDK usage guide

### GraphQL & Mutations
- [GRAPHQL_MUTATIONS_SOLUTION.md](GRAPHQL_MUTATIONS_SOLUTION.md) - How mutations work
- [VOTER_GRAPHQL_FIXED.md](VOTER_GRAPHQL_FIXED.md) - Voter mutations fix
- [GRAPHQL_CORRECT_FORMAT.md](alethea-dashboard/GRAPHQL_CORRECT_FORMAT.md) - GraphQL format guide

### Deployment & Testing
- [CREATE_MARKET_GUIDE.md](CREATE_MARKET_GUIDE.md) - Market creation tutorial
- [TESTING_GUIDE.md](TESTING_GUIDE.md) - Testing procedures
- [PROTOCOL_TEST_STATUS.md](PROTOCOL_TEST_STATUS.md) - Test status

### Status & Planning
- [CURRENT_STATUS_AND_NEXT_STEPS.md](CURRENT_STATUS_AND_NEXT_STEPS.md) - Current status
- [COMPONENT_ANALYSIS.md](COMPONENT_ANALYSIS.md) - Component analysis

---

## 🎯 Quick Actions

### Test Voter GraphQL
```bash
# Load environment
source .env.conway

# Test query
curl -s -X POST http://localhost:8080/chains/$CHAIN_ID/applications/$VOTER_1_ID \
  -H "Content-Type: application/json" \
  -d '{"query":"{ status { reputation totalVotes } }"}' | jq .

# Test mutation
curl -s -X POST http://localhost:8080/chains/$CHAIN_ID/applications/$VOTER_1_ID \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { enableAutoVote }"}' | jq .
```

### Open GraphiQL Interface
```bash
# Voter #1
xdg-open "http://localhost:8080/chains/$CHAIN_ID/applications/$VOTER_1_ID"

# Or manually navigate to:
http://localhost:8080/chains/a2c0349ae6add80c92e26bb383aca8d98f9f3441c3097fec99111199c7f1e221/applications/0e36707a88a3822ba3d835e081f73abceb0610c711ecc278cc4a8a11312099bd
```

### Start Dashboard
```bash
cd alethea-dashboard
npm run dev
# Open http://localhost:3000
```

---

**Status:** ✅ Voters Working | ❌ Registry Not Working | ⚠️ Coordinator Orphaned  
**Last Updated:** November 8, 2025

