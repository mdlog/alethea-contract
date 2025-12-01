# Current Deployment IDs

**Last Updated:** November 20, 2025

## 🔗 Application IDs

### Core Applications

| Application | ID | Status |
|------------|-----|--------|
| **Chain ID** | `8a80fe20530eb03889f28ac1fda8628430c30b2564763522e1b7268eaecdf7ef` | ✅ Active |
| **Oracle Registry** | `6cf34d723b88cbbb2087f72f8395567217a0a1038ebfc4246bc168a3655303ca` | ✅ Active |
| **Oracle Application** | `e798118f2608603f61f73888e57d17cac734f56df11b0de733943b7e3e274621` | ✅ Active |
| **Market Chain** | `03725cc7a857eb5612f9bcb984ff7dfde7da79e7e5c171ffc535d3789d5ca365` | ✅ **NEW** |

### Owner Address
```
0x1378c5e5c37d5b1264af7f3ecd4e913493fc7a6796bd5fb0439b4438c7f0d318
```

## 📍 Service URLs

### Linera Service (Port 8080)
```bash
# Oracle Registry
http://localhost:8080/chains/8a80fe20530eb03889f28ac1fda8628430c30b2564763522e1b7268eaecdf7ef/applications/6cf34d723b88cbbb2087f72f8395567217a0a1038ebfc4246bc168a3655303ca

# Oracle Application
http://localhost:8080/chains/8a80fe20530eb03889f28ac1fda8628430c30b2564763522e1b7268eaecdf7ef/applications/e798118f2608603f61f73888e57d17cac734f56df11b0de733943b7e3e274621

# Market Chain (NEW)
http://localhost:8080/chains/8a80fe20530eb03889f28ac1fda8628430c30b2564763522e1b7268eaecdf7ef/applications/03725cc7a857eb5612f9bcb984ff7dfde7da79e7e5c171ffc535d3789d5ca365
```

### Dashboard URLs
```bash
# Frontend Dashboard
http://localhost:3000

# Backend API
http://localhost:3001

# GraphQL Endpoint
http://localhost:8080
```

## 🔧 Environment Files Updated

### 1. `.env.fresh` (Root)
```bash
CHAIN_ID=8a80fe20530eb03889f28ac1fda8628430c30b2564763522e1b7268eaecdf7ef
ORACLE_REGISTRY_ID=6cf34d723b88cbbb2087f72f8395567217a0a1038ebfc4246bc168a3655303ca
ORACLE_APP_ID=e798118f2608603f61f73888e57d17cac734f56df11b0de733943b7e3e274621
MARKET_CHAIN_ID=03725cc7a857eb5612f9bcb984ff7dfde7da79e7e5c171ffc535d3789d5ca365
```

### 2. `alethea-dashboard/.env.local`
```bash
NEXT_PUBLIC_CHAIN_ID=8a80fe20530eb03889f28ac1fda8628430c30b2564763522e1b7268eaecdf7ef
NEXT_PUBLIC_REGISTRY_ID=6cf34d723b88cbbb2087f72f8395567217a0a1038ebfc4246bc168a3655303ca
NEXT_PUBLIC_ORACLE_APP_ID=e798118f2608603f61f73888e57d17cac734f56df11b0de733943b7e3e274621
NEXT_PUBLIC_MARKET_CHAIN_ID=03725cc7a857eb5612f9bcb984ff7dfde7da79e7e5c171ffc535d3789d5ca365
```

### 3. `README.md`
Updated deployment section with new Market Chain ID.

## 🚀 Quick Commands

### Source Environment
```bash
source .env.fresh
```

### Start Services
```bash
# Start Linera service
linera service --port 8080

# Start dashboard (in another terminal)
cd alethea-dashboard
npm run dev
```

### Test Market Chain
```bash
# Run test script
./test_market_chain.sh

# Or manual test
curl -X POST "http://localhost:8080/chains/$CHAIN_ID/applications/$MARKET_CHAIN_ID" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ markets { id question status } }"}'
```

## 📝 Deployment History

### November 20, 2025
- ✅ **Market Chain Redeployed**
  - Old ID: `438a180a65594f69d27d0d53eb2072213a476489d439aeef5f857ef9699f245b`
  - New ID: `03725cc7a857eb5612f9bcb984ff7dfde7da79e7e5c171ffc535d3789d5ca365`
  - Reason: Fresh deployment with latest code
  - Status: Successfully deployed and tested

### Previous Deployments
- Oracle Registry: Deployed Nov 19, 2025
- Oracle Application: Deployed Nov 19, 2025
- Market Chain (Old): Deployed Nov 18, 2025

## 🔍 Verification

### Check Wallet
```bash
linera wallet show
```

### Query Market Chain
```bash
curl -X POST "http://localhost:8080/chains/8a80fe20530eb03889f28ac1fda8628430c30b2564763522e1b7268eaecdf7ef/applications/03725cc7a857eb5612f9bcb984ff7dfde7da79e7e5c171ffc535d3789d5ca365" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ markets { id question } }"}'
```

### Query Oracle Registry
```bash
curl -X POST "http://localhost:8080/chains/8a80fe20530eb03889f28ac1fda8628430c30b2564763522e1b7268eaecdf7ef/applications/6cf34d723b88cbbb2087f72f8395567217a0a1038ebfc4246bc168a3655303ca" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ voterCount }"}'
```

## 📚 Related Documentation

- [Market Chain Deployment Guide](MARKET_CHAIN_DEPLOYMENT.md)
- [README.md](README.md)
- [Test Script](test_market_chain.sh)

## ⚠️ Important Notes

1. **Always source `.env.fresh`** before running scripts
2. **Restart dashboard** after updating `.env.local`
3. **Verify IDs** match across all configuration files
4. **Test endpoints** after any deployment changes

## 🎯 Next Steps

1. ✅ Market Chain deployed with new ID
2. ✅ Environment files updated
3. ✅ Documentation updated
4. 🔄 Restart dashboard to apply changes
5. 🧪 Test market creation and trading
6. 🔗 Test oracle integration

---

**Status:** All IDs updated and verified ✅

**Network:** Linera Conway Testnet (Local)

**Last Verified:** November 20, 2025
