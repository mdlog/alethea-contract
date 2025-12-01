# 🎉 Alethea Network - Fresh Deployment Complete

**Deployment Date:** November 12, 2025  
**Chain ID:** `371f1707095d36c155e513a9cf7030760acda20278a14828f5d176dd8fffecce`  
**Network:** Fresh Deployment (Conway Testnet)

---

## ✅ Deployed Applications

### 1. Oracle Registry
- **Application ID:** `4399b6b80563056e65fb0ef10e7988952c609bd97c6f9fb171ae07899888fa15`
- **Configuration:** `min_voters: 3`
- **Purpose:** Central registry for managing voters, markets, and oracle protocol
- **GraphQL Endpoint:** 
  ```
  http://localhost:8080/chains/371f1707095d36c155e513a9cf7030760acda20278a14828f5d176dd8fffecce/applications/4399b6b80563056e65fb0ef10e7988952c609bd97c6f9fb171ae07899888fa15
  ```

### 2. Market Chain
- **Application ID:** `b9a731f67c266b44a92cae63e8208cf30f69363d4cebca4f09847a1aa446ff17`
- **Purpose:** Prediction market dApp for creating and managing markets
- **GraphQL Endpoint:**
  ```
  http://localhost:8080/chains/371f1707095d36c155e513a9cf7030760acda20278a14828f5d176dd8fffecce/applications/b9a731f67c266b44a92cae63e8208cf30f69363d4cebca4f09847a1aa446ff17
  ```

### 3. Voter Template
- **Application ID:** `15ea69f62a96ca633581d81248553b2b2773b3bed48ee65c990558e05b282a19`
- **Purpose:** Template application for creating new voter instances
- **GraphQL Endpoint:**
  ```
  http://localhost:8080/chains/371f1707095d36c155e513a9cf7030760acda20278a14828f5d176dd8fffecce/applications/15ea69f62a96ca633581d81248553b2b2773b3bed48ee65c990558e05b282a19
  ```

### 4. Voter Instances

#### Voter 1
- **Application ID:** `080f6577209d8347b0dcf9dc99a9699c3eb5fa68eb19cf1aa12809894e014a4a`
- **Chain ID:** `371f1707095d36c155e513a9cf7030760acda20278a14828f5d176dd8fffecce`
- **GraphQL Endpoint:**
  ```
  http://localhost:8080/chains/371f1707095d36c155e513a9cf7030760acda20278a14828f5d176dd8fffecce/applications/080f6577209d8347b0dcf9dc99a9699c3eb5fa68eb19cf1aa12809894e014a4a
  ```

#### Voter 2
- **Application ID:** `409a80b9281218bab7054bf139080a4a9b05f72eb68657561d8f058896a2bb30`
- **Chain ID:** `371f1707095d36c155e513a9cf7030760acda20278a14828f5d176dd8fffecce`
- **GraphQL Endpoint:**
  ```
  http://localhost:8080/chains/371f1707095d36c155e513a9cf7030760acda20278a14828f5d176dd8fffecce/applications/409a80b9281218bab7054bf139080a4a9b05f72eb68657561d8f058896a2bb30
  ```

#### Voter 3
- **Application ID:** `5857171d52922d4fa322d090cff0e31ddd53beff2f45fdbb2a57db7e2d4771fd`
- **Chain ID:** `371f1707095d36c155e513a9cf7030760acda20278a14828f5d176dd8fffecce`
- **GraphQL Endpoint:**
  ```
  http://localhost:8080/chains/371f1707095d36c155e513a9cf7030760acda20278a14828f5d176dd8fffecce/applications/5857171d52922d4fa322d090cff0e31ddd53beff2f45fdbb2a57db7e2d4771fd
  ```

---

## 📋 Quick Start

### 1. Load Environment Variables
```bash
source .env.fresh
```

### 2. Verify Deployment
```bash
# Check Registry
curl http://localhost:8080/chains/${CHAIN_ID}/applications/${ALETHEA_REGISTRY_ID}

# Check Market Chain
curl http://localhost:8080/chains/${CHAIN_ID}/applications/${MARKET_CHAIN_ID}

# Check Voter 1
curl http://localhost:8080/chains/${CHAIN_ID}/applications/${VOTER_1_ID}
```

### 3. Start Linera Service (if not running)
```bash
linera service --port 8080
```

---

## 🔄 Next Steps

### 1. Initialize Voters
Voters need to be initialized with the registry:
```bash
# Initialize each voter with registry
# This will be done via GraphQL mutations
```

### 2. Register Voters to Registry
```bash
# Register voters to the oracle registry
# Minimum 3 voters required (min_voters: 3)
```

### 3. Create Test Market
```bash
# Create a prediction market to test the system
```

### 4. Test Complete Workflow
```bash
# Test the full oracle workflow:
# 1. Create market
# 2. Request resolution
# 3. Voters commit votes
# 4. Voters reveal votes
# 5. Market resolves
```

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Chain ID: 371f17...                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐         ┌──────────────────┐        │
│  │ Oracle Registry  │◄────────┤  Market Chain    │        │
│  │   (min_voters:3) │         │  (Predictions)   │        │
│  └────────┬─────────┘         └──────────────────┘        │
│           │                                                 │
│           │ Manages                                         │
│           │                                                 │
│  ┌────────▼─────────────────────────────────────┐         │
│  │           Voter Instances                     │         │
│  ├───────────────┬───────────────┬──────────────┤         │
│  │   Voter 1     │   Voter 2     │   Voter 3    │         │
│  │  080f6577...  │  409a80b9...  │  5857171d... │         │
│  └───────────────┴───────────────┴──────────────┘         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔗 Important Links

- **Environment File:** `.env.fresh`
- **Chain Explorer:** Check your local Linera explorer
- **GraphQL Playground:** `http://localhost:8080/`

---

## ⚠️ Notes

1. All applications are deployed on the same chain for simplicity
2. Voters are deployed without initialization arguments (will be initialized via GraphQL)
3. Service must be running on port 8080 for GraphQL access
4. Registry requires minimum 3 voters for market resolution

---

## 🎯 Status: READY FOR TESTING ✅

All core applications are deployed and ready for integration testing!
