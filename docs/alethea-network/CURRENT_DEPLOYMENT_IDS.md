# Current Deployment IDs - November 12, 2025

## ✅ CORRECT IDs (Use These)

**⚠️ IMPORTANT:** Always use IDs from `.env.conway` file for latest deployment!

### Network
```bash
CHAIN_ID="c8e5acdfe8de4ee96300c8d072085351db08d8e49abacb5864cb53ef92524002"
NETWORK="conway-testnet"
```

### Oracle Registry (DirectVote Support)
```bash
ALETHEA_REGISTRY_ID="3c018ea20034b33e630ff4db09874fef2bce75c9ba710dcc9fa7eb0b272b6c0a"
```
**Features:**
- DirectVote support (bypass commit-reveal)
- min_voters_per_market: 3
- Need 2/3 votes (2 votes) to resolve
- Deployed: Nov 11, 2025
- **Parameters:** All match ProtocolParameters::default()

### Market Chain
```bash
MARKET_CHAIN_ID="67655adfa7f0380e0fe2e16ffc4e68ebb1ba13b38ff62434811d4797819ddd84"
```
**Features:**
- Custom mutation root untuk String inputs
- Deployed: Nov 11, 2025

### Voter Template (Same-Chain Fix)
```bash
VOTER_TEMPLATE_ID="ffe7546cec93d873d0f35aa79aa5068312f5ca46e6bcc9bdc2e8cc3e08db89b7"
```
**Features:**
- Fixed same-chain communication (call_application)
- Deployed: Nov 12, 2025
- **Fix:** Menggunakan call_application() untuk same-chain, send_message() untuk cross-chain

### Voter Applications
```bash
VOTER_1_ID="fa3fec8eb4b72893abee7f471e4dbd702a13e6a638e5716a2067c7d70cddf831"
VOTER_2_ID="8fe971309e20616184c97fe90634fac1fa9b78aed7a3e5fd3ffe1a8fc8fa0e02"
VOTER_3_ID="d0924ce36976edd3342f94b62bf3ecaa2de62d3356622c20854ed416e8d4b752"
```
**Features:**
- Created from Voter Template (Nov 12, 2025)
- Same-chain communication fix applied

## 📋 GraphQL Endpoints

- **Registry:** `http://localhost:8080/chains/c8e5acdfe8de4ee96300c8d072085351db08d8e49abacb5864cb53ef92524002/applications/3c018ea20034b33e630ff4db09874fef2bce75c9ba710dcc9fa7eb0b272b6c0a`
- **Market Chain:** `http://localhost:8080/chains/c8e5acdfe8de4ee96300c8d072085351db08d8e49abacb5864cb53ef92524002/applications/67655adfa7f0380e0fe2e16ffc4e68ebb1ba13b38ff62434811d4797819ddd84`
- **Voter Template:** `http://localhost:8080/chains/c8e5acdfe8de4ee96300c8d072085351db08d8e49abacb5864cb53ef92524002/applications/ffe7546cec93d873d0f35aa79aa5068312f5ca46e6bcc9bdc2e8cc3e08db89b7`
- **Voter 1:** `http://localhost:8080/chains/c8e5acdfe8de4ee96300c8d072085351db08d8e49abacb5864cb53ef92524002/applications/fa3fec8eb4b72893abee7f471e4dbd702a13e6a638e5716a2067c7d70cddf831`
- **Voter 2:** `http://localhost:8080/chains/c8e5acdfe8de4ee96300c8d072085351db08d8e49abacb5864cb53ef92524002/applications/8fe971309e20616184c97fe90634fac1fa9b78aed7a3e5fd3ffe1a8fc8fa0e02`
- **Voter 3:** `http://localhost:8080/chains/c8e5acdfe8de4ee96300c8d072085351db08d8e49abacb5864cb53ef92524002/applications/d0924ce36976edd3342f94b62bf3ecaa2de62d3356622c20854ed416e8d4b752`

## ❌ OLD IDs (DO NOT USE)

### Old Chain ID
```bash
# WRONG - DO NOT USE
OLD_CHAIN_ID="c8e5acdfe8de4ee96300c8d072085351db08d8e49abacb5864cb53ef92524002"
```

### Old Registry
```bash
OLD_REGISTRY_ID="cf070750b361cf3731c226aac995b2b2717a996128b9eba67934e5e9526482c0"
```

### Old Market Chain
```bash
OLD_MARKET_CHAIN_ID="9446370424213ee61cc5b2b06943e598df47faa8ec2adaee5fdca5e9f7a74abb"
```

## 📝 Notes

- **Last Updated:** November 12, 2025
- **Deployment:** Voter Template redeployed with same-chain communication fix
- **Fix:** Using call_application() for same-chain, send_message() for cross-chain
- **Parameters:** Registry uses min_voters_per_market: 3 (corrected from 20)
- **Status:** ✅ All services operational
