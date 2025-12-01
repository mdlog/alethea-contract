# 🚀 Quick Reference - Alethea Network

**Last Updated:** November 20, 2025

## 🆔 Application IDs (Copy-Paste Ready)

```bash
# Chain ID
export CHAIN_ID="8a80fe20530eb03889f28ac1fda8628430c30b2564763522e1b7268eaecdf7ef"

# Oracle Registry
export ORACLE_REGISTRY_ID="6cf34d723b88cbbb2087f72f8395567217a0a1038ebfc4246bc168a3655303ca"

# Oracle Application
export ORACLE_APP_ID="e798118f2608603f61f73888e57d17cac734f56df11b0de733943b7e3e274621"

# Market Chain (NEW - Nov 20, 2025)
export MARKET_CHAIN_ID="03725cc7a857eb5612f9bcb984ff7dfde7da79e7e5c171ffc535d3789d5ca365"
```

## 🔗 Service URLs

```bash
# Oracle Registry
http://localhost:8080/chains/8a80fe20530eb03889f28ac1fda8628430c30b2564763522e1b7268eaecdf7ef/applications/6cf34d723b88cbbb2087f72f8395567217a0a1038ebfc4246bc168a3655303ca

# Oracle Application
http://localhost:8080/chains/8a80fe20530eb03889f28ac1fda8628430c30b2564763522e1b7268eaecdf7ef/applications/e798118f2608603f61f73888e57d17cac734f56df11b0de733943b7e3e274621

# Market Chain
http://localhost:8080/chains/8a80fe20530eb03889f28ac1fda8628430c30b2564763522e1b7268eaecdf7ef/applications/03725cc7a857eb5612f9bcb984ff7dfde7da79e7e5c171ffc535d3789d5ca365
```

## ⚡ Quick Commands

### Start Services
```bash
# Load environment
source .env.fresh

# Start Linera service
linera service --port 8080 &

# Start dashboard
cd alethea-dashboard && npm run dev
```

### Restart Dashboard
```bash
./restart_dashboard_with_new_market_id.sh
```

### Test Market Chain
```bash
./test_market_chain.sh
```

### Query Examples
```bash
# Get all markets
curl -X POST "http://localhost:8080/chains/$CHAIN_ID/applications/$MARKET_CHAIN_ID" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ markets { id question status } }"}'

# Get voter count
curl -X POST "http://localhost:8080/chains/$CHAIN_ID/applications/$ORACLE_REGISTRY_ID" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ voterCount }"}'

# Get oracle queries
curl -X POST "http://localhost:8080/chains/$CHAIN_ID/applications/$ORACLE_APP_ID" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ queries { id question status } }"}'
```

## 📍 Dashboard URLs

- **Home:** http://localhost:3000
- **Voters:** http://localhost:3000/voters
- **Markets:** http://localhost:3000 (main page)

## 🔧 Common Tasks

### Create Market
```bash
curl -X POST "http://localhost:8080/chains/$CHAIN_ID/applications/$MARKET_CHAIN_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { createMarket(question: \"Test Market?\", description: \"Test\", resolutionTime: 1735689600) }"
  }'
```

### Buy Shares
```bash
curl -X POST "http://localhost:8080/chains/$CHAIN_ID/applications/$MARKET_CHAIN_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { buyShares(marketId: 0, isYes: true, amount: \"1000000\") }"
  }'
```

### Request Resolution
```bash
curl -X POST "http://localhost:8080/chains/$CHAIN_ID/applications/$MARKET_CHAIN_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { requestResolution(marketId: 0) }"
  }'
```

## 🛠️ Troubleshooting

### Service Not Running
```bash
# Check if running
ps aux | grep linera

# Kill and restart
pkill linera
linera service --port 8080 &
```

### Dashboard Issues
```bash
# Clear cache
cd alethea-dashboard
rm -rf .next
npm run dev
```

### Check Wallet
```bash
linera wallet show
```

## 📚 Documentation

- [README.md](README.md) - Main documentation
- [CURRENT_DEPLOYMENT_IDS.md](CURRENT_DEPLOYMENT_IDS.md) - Detailed IDs
- [MARKET_CHAIN_DEPLOYMENT.md](MARKET_CHAIN_DEPLOYMENT.md) - Market chain guide
- [MARKET_CHAIN_ID_UPDATE_SUMMARY.md](MARKET_CHAIN_ID_UPDATE_SUMMARY.md) - Update log

---

**Keep this file handy for quick copy-paste!** 📋
