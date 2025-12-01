# Quick Start - Testing Alethea Protocol

## Prerequisites
✅ All components deployed (see `DEPLOYMENT_SUMMARY_NOV9_2025.md`)  
✅ Environment files updated (`.env.conway` and `alethea-dashboard/.env.local`)

## Step 1: Start Linera Service

```bash
# Source environment variables
source .env.conway

# Start Linera service on port 8080
linera service --port 8080
```

Keep this terminal running.

## Step 2: Start Dashboard (New Terminal)

```bash
cd alethea-dashboard
npm run dev
```

Dashboard will be available at: `http://localhost:3000`

## Step 3: Test the System

### A. Create a Market

1. Open dashboard at `http://localhost:3000`
2. Click "Create Market"
3. Fill in market details:
   - **Question:** "Will Bitcoin reach $100k by end of 2025?"
   - **Outcomes:** ["Yes", "No"]
   - **Resolution Time:** Select future date
4. Click "Create Market"
5. Wait for confirmation

### B. Register Voters (Optional)

The 3 voter applications are already deployed:
- Voter 1: `fa3fec8eb4b72893abee7f471e4dbd702a13e6a638e5716a2067c7d70cddf831`
- Voter 2: `8fe971309e20616184c97fe90634fac1fa9b78aed7a3e5fd3ffe1a8fc8fa0e02`
- Voter 3: `d0924ce36976edd3342f94b62bf3ecaa2de62d3356622c20854ed416e8d4b752`

### C. Submit Votes

1. Navigate to the market you created
2. Click "Vote" on your preferred outcome
3. Confirm the transaction
4. Wait for vote to be recorded

### D. Verify Resolution

After resolution time:
1. Check market status
2. Verify final outcome
3. Check voter reputation updates

## Quick Commands Reference

### Check Application Status
```bash
# View wallet and chains
linera wallet show

# Query registry
linera query-application $ALETHEA_REGISTRY_ID

# Query market chain
linera query-application $MARKET_CHAIN_ID

# Query voter
linera query-application $VOTER_1_ID
```

### GraphQL Queries

#### Get All Markets
```bash
curl -X POST http://localhost:8080/chains/$CHAIN_ID/applications/$MARKET_CHAIN_ID \
  -H "Content-Type: application/json" \
  -d '{"query": "{ markets { id question outcomes status } }"}'
```

#### Get Registry Info
```bash
curl -X POST http://localhost:8080/chains/$CHAIN_ID/applications/$ALETHEA_REGISTRY_ID \
  -H "Content-Type: application/json" \
  -d '{"query": "{ registeredVoters { voterId reputation } }"}'
```

## Environment Variables

### Current Deployment IDs

```bash
# Chain
export CHAIN_ID="c8e5acdfe8de4ee96300c8d072085351db08d8e49abacb5864cb53ef92524002"

# Applications
export ALETHEA_REGISTRY_ID="db4e4c1ca5dc6c09bae641099c59cd18b87fe79b01280a2b04559b23e9405039"
export MARKET_CHAIN_ID="9446370424213ee61cc5b2b06943e598df47faa8ec2adaee5fdca5e9f7a74abb"
export VOTER_TEMPLATE_ID="ffe7546cec93d873d0f35aa79aa5068312f5ca46e6bcc9bdc2e8cc3e08db89b7"
export VOTER_1_ID="fa3fec8eb4b72893abee7f471e4dbd702a13e6a638e5716a2067c7d70cddf831"
export VOTER_2_ID="8fe971309e20616184c97fe90634fac1fa9b78aed7a3e5fd3ffe1a8fc8fa0e02"
export VOTER_3_ID="d0924ce36976edd3342f94b62bf3ecaa2de62d3356622c20854ed416e8d4b752"
```

## Troubleshooting

### Dashboard Not Loading
```bash
# Check if Linera service is running
curl http://localhost:8080/

# Restart Linera service
pkill linera
linera service --port 8080
```

### Market Creation Fails
1. Check Linera service logs
2. Verify chain ID in `.env.local`
3. Ensure registry ID is correct
4. Check browser console for errors

### Votes Not Recording
1. Verify voter application IDs
2. Check GraphQL endpoint connectivity
3. Review Linera service logs
4. Ensure market is in correct state

## Testing Checklist

- [ ] Linera service running on port 8080
- [ ] Dashboard accessible at localhost:3000
- [ ] Can view markets list
- [ ] Can create new market
- [ ] Market appears in list
- [ ] Can submit vote
- [ ] Vote is recorded
- [ ] Can view market details
- [ ] Resolution works correctly

## Next Steps

After successful testing:

1. **Integration Testing:** Test full workflow end-to-end
2. **Performance Testing:** Create multiple markets and votes
3. **Error Handling:** Test edge cases and error scenarios
4. **Documentation:** Update any findings or issues
5. **Production Prep:** Prepare for mainnet deployment

## Support Files

- `DEPLOYMENT_SUMMARY_NOV9_2025.md` - Full deployment details
- `ARCHITECTURE_SUMMARY.md` - System architecture
- `CREATE_MARKET_GUIDE.md` - Detailed market creation guide
- `START_HERE.md` - General getting started guide
