# 🔍 Workflow Readiness Check

**Date:** November 12, 2025  
**Chain ID:** 371f1707095d36c155e513a9cf7030760acda20278a14828f5d176dd8fffecce

---

## ✅ Current Status

### 1. Applications Deployed
- ✅ Oracle Registry: `4399b6b80563056e65fb0ef10e7988952c609bd97c6f9fb171ae07899888fa15`
- ✅ Market Chain: `b9a731f67c266b44a92cae63e8208cf30f69363d4cebca4f09847a1aa446ff17`
- ✅ Voter Template: `15ea69f62a96ca633581d81248553b2b2773b3bed48ee65c990558e05b282a19`
- ✅ Voter 1: `080f6577209d8347b0dcf9dc99a9699c3eb5fa68eb19cf1aa12809894e014a4a`
- ✅ Voter 2: `409a80b9281218bab7054bf139080a4a9b05f72eb68657561d8f058896a2bb30`
- ✅ Voter 3: `5857171d52922d4fa322d090cff0e31ddd53beff2f45fdbb2a57db7e2d4771fd`

### 2. Services Running
- ✅ Linera Service: Running on port 8080
- ✅ Registry GraphQL: Responding (totalMarkets: 0, totalVoters: 0)

---

## ⚠️ Required Before Testing

### 1. Initialize Voters ❌ NOT DONE
Voters need to be initialized with the registry ID.

**Why:** Voters were deployed without initialization arguments and need to be configured.

**How to do:**
```bash
# Via GraphQL mutation to each voter
# Or via Linera operations
```

### 2. Register Voters to Registry ❌ NOT DONE
All 3 voters must be registered to the registry.

**Why:** Registry shows `totalVoters: 0`, meaning no voters are registered yet.

**Required:** Minimum 3 voters (current min_voters: 3)

**How to do:**
```bash
# Use registration script or GraphQL mutations
```

### 3. Verify Cross-Application Communication ❌ NOT TESTED
Test if voters can communicate with registry.

**Why:** This was the main issue in previous deployments.

**How to test:**
```bash
# Try registering a voter and check if registry receives it
```

---

## 📋 Complete Workflow Steps

### Phase 1: Setup (Required First)
1. ❌ Initialize Voter 1 with registry ID
2. ❌ Initialize Voter 2 with registry ID
3. ❌ Initialize Voter 3 with registry ID
4. ❌ Register Voter 1 to Registry
5. ❌ Register Voter 2 to Registry
6. ❌ Register Voter 3 to Registry
7. ❌ Verify all voters registered (totalVoters should be 3)

### Phase 2: Market Creation
8. ❌ Create a test market via Market Chain
9. ❌ Verify market appears in Registry
10. ❌ Check market status is OPEN

### Phase 3: Resolution Request
11. ❌ Wait for market deadline or manually trigger
12. ❌ Request resolution from Market Chain
13. ❌ Verify market status changes to WAITING_RESOLUTION
14. ❌ Check if voters are selected

### Phase 4: Voting (Commit Phase)
15. ❌ Voter 1 commits vote
16. ❌ Voter 2 commits vote
17. ❌ Voter 3 commits vote
18. ❌ Verify all commits received

### Phase 5: Voting (Reveal Phase)
19. ❌ Voter 1 reveals vote
20. ❌ Voter 2 reveals vote
21. ❌ Voter 3 reveals vote
22. ❌ Verify all reveals received

### Phase 6: Resolution
23. ❌ Registry aggregates votes
24. ❌ Market resolves with winning outcome
25. ❌ Verify market status is RESOLVED
26. ❌ Check rewards distributed

---

## 🚀 Quick Start Commands

### 1. Load Environment
```bash
source .env.fresh
```

### 2. Test Registry Connection
```bash
curl http://localhost:8080/chains/${CHAIN_ID}/applications/${ALETHEA_REGISTRY_ID} \
  -H "Content-Type: application/json" \
  -d '{"query": "{ protocolStats { totalMarkets activeMarkets totalVoters } }"}'
```

### 3. Test Market Chain Connection
```bash
curl http://localhost:8080/chains/${CHAIN_ID}/applications/${MARKET_CHAIN_ID} \
  -H "Content-Type: application/json" \
  -d '{"query": "{ markets { id question status } }"}'
```

### 4. Test Voter Connection
```bash
curl http://localhost:8080/chains/${CHAIN_ID}/applications/${VOTER_1_ID} \
  -H "Content-Type: application/json" \
  -d '{"query": "{ voterStats { totalVotes reputation } }"}'
```

---

## 🎯 Next Immediate Steps

### Step 1: Initialize Voters
We need to initialize each voter with the registry ID. This can be done via:

**Option A: GraphQL Mutation**
```graphql
mutation {
  initialize(
    registryId: "4399b6b80563056e65fb0ef10e7988952c609bd97c6f9fb171ae07899888fa15"
    initialStake: "1000000000000"
  )
}
```

**Option B: Linera Operation**
```bash
linera execute-operation \
  --application-id ${VOTER_1_ID} \
  --operation '{"Initialize": {"registry_id": "'${ALETHEA_REGISTRY_ID}'", "initial_stake": "1000"}}'
```

### Step 2: Register Voters
After initialization, register each voter to the registry:

```bash
# This will be done via Registry operations or Market Chain
```

---

## 📊 Current State Summary

| Component | Status | Notes |
|-----------|--------|-------|
| Chain | ✅ Active | Block height increasing |
| Registry | ✅ Deployed | Responding to queries |
| Market Chain | ✅ Deployed | Ready for markets |
| Voter Template | ✅ Deployed | Template available |
| Voter 1 | ⚠️ Deployed | Needs initialization |
| Voter 2 | ⚠️ Deployed | Needs initialization |
| Voter 3 | ⚠️ Deployed | Needs initialization |
| Voter Registration | ❌ Not Done | 0 voters registered |
| Test Market | ❌ Not Created | No markets yet |

---

## ⚠️ Critical Issues to Resolve

### 1. Voter Initialization
**Problem:** Voters deployed without initialization arguments  
**Impact:** Cannot register to registry until initialized  
**Solution:** Initialize each voter with registry ID

### 2. Voter Registration
**Problem:** No voters registered (totalVoters: 0)  
**Impact:** Cannot resolve markets (requires min 3 voters)  
**Solution:** Register all 3 voters after initialization

### 3. Cross-App Communication
**Problem:** Unknown if same-chain messaging works  
**Impact:** May block voter registration  
**Solution:** Test with first voter registration

---

## 🎯 Recommendation

**Before running full workflow test:**

1. ✅ Create initialization script for voters
2. ✅ Create registration script for voters
3. ✅ Test single voter registration first
4. ✅ Verify registry receives registration
5. ✅ Then proceed with full workflow

**Estimated Time:** 30-60 minutes for setup, then ready for workflow testing.

---

**Status:** 🟡 PARTIALLY READY - Needs voter initialization and registration first
