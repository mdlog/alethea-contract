# 🚀 Testing Quick Start

**Run end-to-end tests in 5 minutes**

---

## Prerequisites

1. **Linera service running:**
```bash
linera service --port 8080
```

2. **Environment loaded:**
```bash
source .env.conway
```

3. **All applications deployed** (Registry, Market Chain, 3 Voters)

---

## Quick Test

### Run Automated Test Script

```bash
./scripts/test-end-to-end.sh
```

**This script will:**
1. ✅ Verify all services are running
2. ✅ Create a test market
3. ✅ Register market with Registry
4. ✅ Verify voters received VoteRequest
5. ✅ Enable auto-vote on all voters
6. ✅ Wait for votes to be committed
7. ✅ Wait for votes to be revealed
8. ✅ Check if market resolved
9. ✅ Verify voter rewards

**Expected output:**
```
╔════════════════════════════════════════════════════════╗
║     Alethea Protocol - End-to-End Test                ║
╚════════════════════════════════════════════════════════╝

▶ Step 1: Verifying services...
✅ Linera service is running
✅ Registry is accessible
✅ Market Chain is accessible
✅ Voter 1 is accessible
✅ Voter 2 is accessible
✅ Voter 3 is accessible

▶ Step 2: Creating market...
✅ Market created
  Market ID: 0
  Status: Open
  Question: Will BTC hit 100k by end of 2025?

▶ Step 3: Registering market with Registry...
✅ Market registered with Registry
  Registry Market ID: 0
  Status: Active

▶ Step 4: Verifying voters received VoteRequest...
✅ Voter 1 received VoteRequest (active votes: 1)
✅ Voter 2 received VoteRequest (active votes: 1)
✅ Voter 3 received VoteRequest (active votes: 1)

▶ Step 5: Enabling auto-vote on all voters...
✅ Voter 1: Auto-vote enabled
✅ Voter 2: Auto-vote enabled
✅ Voter 3: Auto-vote enabled

▶ Step 6: Waiting for votes to be committed...
Waiting 5 seconds for auto-votes...
  Market Status: CommitPhase
  Total Commitments: 3
✅ Votes committed (need 2/3 = 2 votes minimum)

▶ Step 7: Waiting for reveals...
Waiting 10 seconds for reveals...
  Market Status: RevealPhase
  Total Reveals: 3
✅ Votes revealed

▶ Step 8: Checking if market resolved...
  Registry Status: Resolved
  Market Chain Status: Resolved
  Final Outcome: 0
✅ Market resolved in Registry
✅ Market resolved in Market Chain

▶ Step 9: Checking voter rewards...
  Voter 1:
    Stake: 1347
    Reputation: 100
    Total Votes: 1
    Correct Votes: 1
✅ Voter 1 participated in voting
  Voter 2:
    Stake: 1553
    Reputation: 100
    Total Votes: 1
    Correct Votes: 1
✅ Voter 2 participated in voting
  Voter 3:
    Stake: 1000
    Reputation: 0
    Total Votes: 1
    Correct Votes: 0
✅ Voter 3 participated in voting

╔════════════════════════════════════════════════════════╗
║                    TEST SUMMARY                        ║
╚════════════════════════════════════════════════════════╝

✅ Services verified
✅ Market created (ID: 0)
✅ Market registered with Registry (ID: 0)
✅ Voters received VoteRequest
✅ Auto-vote enabled
✅ Votes committed (3 commitments)
✅ Votes revealed (3 reveals)
✅ Market resolved in Registry
✅ Market resolved in Market Chain

🎉 End-to-end test complete!
```

---

## Manual Testing

### 1. Create Market

```bash
curl -X POST "http://localhost:8080/chains/$CHAIN_ID/applications/$MARKET_CHAIN_ID" \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { createMarket(question: \"Test?\", outcomes: [\"Yes\", \"No\"], resolutionDeadline: 1762620364, initialLiquidity: \"1000000\") }"}' | jq .
```

### 2. Register with Registry

```bash
curl -X POST "http://localhost:8080/chains/$CHAIN_ID/applications/$ALETHEA_REGISTRY_ID" \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { registerMarket(question: \"Test?\", outcomes: [\"Yes\", \"No\"], deadline: 1762620364, callbackData: [0,0,0,0,0,0,0,0]) }"}' | jq .
```

### 3. Check Voters

```bash
curl -X POST "http://localhost:8080/chains/$CHAIN_ID/applications/$VOTER_1_ID" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ activeVotesCount }"}' | jq .
```

### 4. Submit Vote (Manual)

```bash
curl -X POST "http://localhost:8080/chains/$CHAIN_ID/applications/$VOTER_1_ID" \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { submitVote(marketId: \"0\", outcomeIndex: \"0\", confidence: \"85\") }"}' | jq .
```

### 5. Check Resolution

```bash
curl -X POST "http://localhost:8080/chains/$CHAIN_ID/applications/$MARKET_CHAIN_ID" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ markets { id status finalOutcome } }"}' | jq .
```

---

## Troubleshooting

### Test Fails at Step 4 (Voters Not Receiving VoteRequest)

**Solution:** Register voters with Registry first

```bash
for VOTER_ID in $VOTER_1_ID $VOTER_2_ID $VOTER_3_ID; do
  curl -X POST "http://localhost:8080/chains/$CHAIN_ID/applications/$VOTER_ID" \
    -H "Content-Type: application/json" \
    -d "{\"query\": \"mutation { initialize(registryId: \\\"$ALETHEA_REGISTRY_ID\\\", initialStake: \\\"1000\\\") }\"}"
done
```

### Test Fails at Step 6 (Votes Not Committed)

**Solution:** Check if auto-vote is enabled

```bash
curl -X POST "http://localhost:8080/chains/$CHAIN_ID/applications/$VOTER_1_ID" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ status { autoVoteEnabled } }"}' | jq .
```

### Test Fails at Step 8 (Market Not Resolved)

**Possible causes:**
- Not enough reveals (need 2/3)
- Commit/reveal deadlines not passed
- Aggregation failed

**Check market status:**
```bash
curl -X POST "http://localhost:8080/chains/$CHAIN_ID/applications/$ALETHEA_REGISTRY_ID" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ marketStatus(marketId: 0) { status totalCommitments totalReveals } }"}' | jq .
```

---

## Next Steps

After successful test:

1. **Test with Dashboard:**
   ```bash
   cd alethea-dashboard
   npm run dev
   ```
   Visit: http://localhost:3000

2. **Test Manual Voting:**
   - Disable auto-vote
   - Submit votes manually via GraphQL

3. **Test Multiple Markets:**
   - Create 3-5 markets
   - Verify voters handle concurrent votes

4. **Test Edge Cases:**
   - Wrong votes (no rewards)
   - Invalid reveals (slashing)
   - Insufficient voters

---

## Documentation

- **Complete Testing Guide:** `TESTING_WORKFLOW_COMPLETE.md`
- **Voter Workflow:** `VOTER_WORKFLOW_DETAILED.md`
- **Communication Flow:** `COMMUNICATION_ARCHITECTURE_DETAILED.md`

---

**Quick Start Complete**  
**Ready to test!** 🚀
