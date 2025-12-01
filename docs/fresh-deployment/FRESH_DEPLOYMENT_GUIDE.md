# 🚀 Alethea Network - Fresh Deployment Guide

**Last Updated:** November 12, 2025  
**Status:** ✅ All Applications Deployed

---

## 📋 Deployment Information

### Chain Details
- **Chain ID:** `371f1707095d36c155e513a9cf7030760acda20278a14828f5d176dd8fffecce`
- **Network:** Conway Testnet
- **Deployment Date:** November 12, 2025

### Deployed Applications

| Application | Application ID | Status |
|------------|----------------|--------|
| **Oracle Registry** | `4399b6b80563056e65fb0ef10e7988952c609bd97c6f9fb171ae07899888fa15` | ✅ Live |
| **Market Chain** | `b9a731f67c266b44a92cae63e8208cf30f69363d4cebca4f09847a1aa446ff17` | ✅ Live |
| **Voter Template** | `15ea69f62a96ca633581d81248553b2b2773b3bed48ee65c990558e05b282a19` | ✅ Live |
| **Voter 1** | `080f6577209d8347b0dcf9dc99a9699c3eb5fa68eb19cf1aa12809894e014a4a` | ✅ Live |
| **Voter 2** | `409a80b9281218bab7054bf139080a4a9b05f72eb68657561d8f058896a2bb30` | ✅ Live |
| **Voter 3** | `5857171d52922d4fa322d090cff0e31ddd53beff2f45fdbb2a57db7e2d4771fd` | ✅ Live |

---

## 🔗 GraphQL Endpoints

### Oracle Registry
```
http://localhost:8080/chains/371f1707095d36c155e513a9cf7030760acda20278a14828f5d176dd8fffecce/applications/4399b6b80563056e65fb0ef10e7988952c609bd97c6f9fb171ae07899888fa15
```

### Market Chain
```
http://localhost:8080/chains/371f1707095d36c155e513a9cf7030760acda20278a14828f5d176dd8fffecce/applications/b9a731f67c266b44a92cae63e8208cf30f69363d4cebca4f09847a1aa446ff17
```

### Voter Template
```
http://localhost:8080/chains/371f1707095d36c155e513a9cf7030760acda20278a14828f5d176dd8fffecce/applications/15ea69f62a96ca633581d81248553b2b2773b3bed48ee65c990558e05b282a19
```

### Voter Instances

**Voter 1:**
```
http://localhost:8080/chains/371f1707095d36c155e513a9cf7030760acda20278a14828f5d176dd8fffecce/applications/080f6577209d8347b0dcf9dc99a9699c3eb5fa68eb19cf1aa12809894e014a4a
```

**Voter 2:**
```
http://localhost:8080/chains/371f1707095d36c155e513a9cf7030760acda20278a14828f5d176dd8fffecce/applications/409a80b9281218bab7054bf139080a4a9b05f72eb68657561d8f058896a2bb30
```

**Voter 3:**
```
http://localhost:8080/chains/371f1707095d36c155e513a9cf7030760acda20278a14828f5d176dd8fffecce/applications/5857171d52922d4fa322d090cff0e31ddd53beff2f45fdbb2a57db7e2d4771fd
```

---

## 🛠️ Configuration Files Updated

### 1. Root Environment (`.env.fresh`)
Contains all application IDs and chain configuration for backend/CLI usage.

```bash
source .env.fresh
```

### 2. Dashboard Environment (`alethea-dashboard/.env.local`)
Updated with new chain ID and application IDs for the Next.js dashboard.

### 3. GraphQL Client (`alethea-dashboard/lib/graphql.ts`)
Updated default values to use new deployment IDs.

---

## 🚀 Quick Start

### 1. Load Environment Variables
```bash
# In project root
source .env.fresh

# Verify
echo $CHAIN_ID
echo $ALETHEA_REGISTRY_ID
echo $MARKET_CHAIN_ID
```

### 2. Start Linera Service
```bash
# In a separate terminal
linera service --port 8080
```

### 3. Start Dashboard (Optional)
```bash
cd alethea-dashboard
npm run dev
```

Dashboard will be available at: `http://localhost:3000`

---

## 📊 Testing the Deployment

### Test Registry Connection
```bash
curl http://localhost:8080/chains/${CHAIN_ID}/applications/${ALETHEA_REGISTRY_ID} \
  -H "Content-Type: application/json" \
  -d '{"query": "{ protocolStats { totalMarkets activeMarkets } }"}'
```

### Test Market Chain Connection
```bash
curl http://localhost:8080/chains/${CHAIN_ID}/applications/${MARKET_CHAIN_ID} \
  -H "Content-Type: application/json" \
  -d '{"query": "{ markets { id question status } }"}'
```

### Test Voter Connection
```bash
curl http://localhost:8080/chains/${CHAIN_ID}/applications/${VOTER_1_ID} \
  -H "Content-Type: application/json" \
  -d '{"query": "{ voterStats { totalVotes reputation } }"}'
```

---

## 🔄 Next Steps

### 1. Initialize Voters
Each voter needs to be initialized with the registry:

```bash
# This will be done via GraphQL mutations or Linera operations
```

### 2. Register Voters to Registry
Register all 3 voters to the oracle registry (minimum required: 3):

```bash
# Use registration scripts or GraphQL mutations
```

### 3. Create Test Market
Create a prediction market to test the system:

```bash
# Via dashboard or CLI
```

### 4. Test Complete Workflow
1. Create market
2. Request resolution
3. Voters commit votes
4. Voters reveal votes
5. Market resolves

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `.env.fresh` | Main environment configuration |
| `alethea-dashboard/.env.local` | Dashboard configuration |
| `alethea-dashboard/lib/graphql.ts` | GraphQL client with endpoints |
| `FRESH_DEPLOYMENT_SUMMARY.md` | Detailed deployment summary |
| `README.md` | Updated with new endpoints |

---

## 🔍 Verification Checklist

- [x] Chain ID set correctly
- [x] Registry deployed and accessible
- [x] Market Chain deployed and accessible
- [x] Voter Template deployed
- [x] 3 Voter instances deployed
- [x] Environment files updated
- [x] Dashboard configuration updated
- [x] GraphQL client updated
- [x] Documentation updated

---

## ⚠️ Important Notes

1. **All applications are on the same chain** for simplicity
2. **Voters deployed without initialization arguments** - will be initialized via GraphQL
3. **Service must be running** on port 8080 for GraphQL access
4. **Registry requires minimum 3 voters** for market resolution
5. **Always use `.env.fresh`** for the latest configuration

---

## 🆘 Troubleshooting

### Service Not Responding
```bash
# Check if service is running
ps aux | grep "linera service"

# Restart service
pkill -f "linera service"
linera service --port 8080
```

### GraphQL Errors
```bash
# Check service logs
tail -f /tmp/linera-service-fresh.log

# Verify chain sync
linera sync ${CHAIN_ID}
```

### Environment Variables Not Loading
```bash
# Reload environment
source .env.fresh

# Verify variables
env | grep -E "(CHAIN_ID|REGISTRY_ID|MARKET_CHAIN_ID)"
```

---

## 📞 Support

For issues or questions:
1. Check service logs: `/tmp/linera-service-fresh.log`
2. Verify chain status: `linera wallet show`
3. Review deployment summary: `FRESH_DEPLOYMENT_SUMMARY.md`

---

**Status:** 🎯 READY FOR TESTING ✅

All applications deployed successfully and ready for integration testing!
