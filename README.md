<div align="center">
  
  # 🏛️ Alethea Contract

  **Smart Contracts for Alethea Oracle Network on Linera Blockchain**

  [![Status](https://img.shields.io/badge/status-production%20ready-brightgreen)]()
  [![Version](https://img.shields.io/badge/version-2.2.0-blue)]()
  [![Network](https://img.shields.io/badge/network-linera%20conway-purple)]()
  [![License](https://img.shields.io/badge/license-MIT-blue)]()
</div>

---

## 📦 Components

| Component | Description |
|-----------|-------------|
| `oracle-registry-v2/` | Core oracle contract with voter registration, query management, commit-reveal voting |
| `simple-market/` | Minimal prediction market for testing oracle resolution callbacks |
| `market-chain/` | Legacy prediction market with AMM (reference) |
| `voter-template/` | Template for voter chain deployment |
| `alethea-oracle-types/` | Shared types and data structures |
| `alethea-sdk/` | SDK for contract integration |
| `alethea-oracle-sdk/` | Oracle-specific SDK |
| `oracle-cli/` | Command-line tools |
| `oracle-backend/` | Backend service |
| `linera-executor/` | Transaction executor |
| `integration-tests/` | Integration test suite |

## 🚀 Quick Start

### Prerequisites

- Rust toolchain (see `rust-toolchain.toml`)
- Linera CLI installed
- wasm32-unknown-unknown target

### Build

```bash
# Build all contracts
cargo build --release --target wasm32-unknown-unknown

# Build specific contract
cargo build --release --target wasm32-unknown-unknown -p oracle-registry-v2
```

### Deploy

```bash
# Source environment
source .env.fresh

# Start Linera service
linera service --port 8080 &

# Deploy Oracle Registry v2
cd oracle-registry-v2
linera project publish-and-create

# Deploy Simple Market
cd ../simple-market
./deploy.sh
```

## 🔧 Environment Files

| File | Purpose |
|------|---------|
| `.env.fresh` | Main environment with chain IDs and app IDs |
| `.env.registry-v2` | Oracle Registry v2 specific config |
| `.env.simple-market` | Simple Market specific config |

## 📖 Documentation

- [Oracle Registry Guide](oracle-registry-v2/REGISTRATION_GUIDE.md)
- [Simple Market Guide](simple-market/README.md)
- [Full Documentation](docs/README.md)

## 🏗️ Architecture

```
Oracle Registry v2 (Core)
├── Voter Registration (stake management)
├── Query Creation & Management
├── Commit-Reveal Voting (keccak256)
├── Resolution Strategies (Majority, Weighted, Consensus)
├── Reward Distribution
└── Resolution Callbacks → External DApps

Simple Market (Example DApp)
├── Binary Prediction Markets
├── Bet Placement
├── Resolution Callback Handler
└── Payout Claims
```

## 🔗 Related Repositories

- **Dashboard**: [alethea-dashboard](https://github.com/mdlog/alethea-network) - Frontend application

## 📄 License

MIT License

---

**Built with ❤️ on Linera Blockchain**
