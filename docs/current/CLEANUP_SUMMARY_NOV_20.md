# Root Folder Cleanup Summary - November 20, 2025

## 🧹 Pembersihan yang Dilakukan

### 1. Dokumentasi Dipindahkan
- ✅ `QUICK_REFERENCE_VOTING.md` → `docs/guides/QUICK_REFERENCE_VOTING.md`

### 2. File Dokumentasi Dihapus dari docs/
Menghapus **semua file .md di root docs/** (200+ file) yang sudah tidak relevan atau duplikat.

File-file tersebut sebagian besar adalah:
- Status lama yang sudah tidak relevan
- Dokumentasi duplikat
- Log deployment lama
- Dokumentasi troubleshooting yang sudah resolved

### 3. Script dan File Tidak Diperlukan Dihapus
Dihapus dari root folder:
- `ANALISIS_SEMUA_MARKETS.sh`
- `CREATE_NEW_QUERY.sh`
- `DEBUG_MARKETS.sh`
- `check-env-loaded.sh`
- `create_5_test_markets.sh`
- `create_test_market_5min.sh`
- `debug-dashboard.sh`
- `deploy_registry.sh`
- `deploy-market-chain-local.sh`
- `deploy-market-chain-testnet.sh`
- `deploy-market-chain.sh`
- `deploy-output.txt`
- `find-hardcoded-ids.sh`
- `message_implementation.rs`
- `monitor_1min_test.sh`
- `monitor_auto_trigger.sh`
- `mt5linux.sh`
- `organize_docs.sh`
- `print.html.pdf`
- `process-blocks-daemon.sh`
- `rebuild-and-redeploy.sh`
- `restart_dashboard_with_new_market_id.sh`
- `restart-dashboard.sh`
- `simple_deploy.sh`
- `TEST_COMMANDS.txt`
- `test_deployment.sh`
- `test_end_to_end.sh`
- `test_market_chain.sh`
- `test_registry.sh`
- `test-chain-id-as-address.sh`
- `test-create-market.sh`
- `test-market-chain.sh`
- `test-new-deployment.sh`
- `test-register-voter.sh`
- `test-with-address.sh`
- `update-dashboard-resolved-markets.js`
- `verify-all-ids.sh`
- `verify-env.sh`
- `.app_id`
- `.bashrc.local`
- `alethea-network-removebg-preview.jpeg`
- `logo.png`

### 4. Struktur Dokumentasi Baru
Dibuat `docs/README.md` sebagai index utama dengan struktur:

```
docs/
├── README.md                    # Index utama (BARU)
├── current/                     # Status terkini
│   ├── CURRENT_DEPLOYMENT_IDS.md
│   ├── UPDATES_NOV_20_2025.md
│   ├── FINAL_STATUS_NOV_20_2025.md
│   └── QUICK_REFERENCE.md
├── getting-started/             # Panduan awal
│   ├── what-is-alethea.md
│   ├── quick-start.md
│   └── key-concepts.md
├── guides/                      # Panduan teknis
│   ├── TESTING_GUIDE.md
│   ├── END_TO_END_TEST_GUIDE.md
│   ├── MARKET_CHAIN_DEPLOYMENT.md
│   └── QUICK_REFERENCE_VOTING.md (DIPINDAHKAN)
├── fixes/                       # Dokumentasi bug fixes
│   ├── AUTO_TRIGGER_DUPLICATE_FIX.md
│   ├── VOTE_STATE_PERSISTENCE_FIX.md
│   └── WAITING_RESOLUTION_TAB_FIX.md
├── alethea-network/            # Arsitektur core
│   ├── ARCHITECTURE_SUMMARY.md
│   ├── COMMUNICATION_FLOW_SIMPLE.md
│   └── SDK_INTEGRATION_GUIDE.md
├── fresh-deployment/           # Deployment guides
│   ├── FRESH_DEPLOYMENT_GUIDE.md
│   └── WORKFLOW_STATUS_FINAL.md
└── archive/                    # Dokumentasi lama
    └── (file-file historis)
```

## 📊 Hasil Pembersihan

### Root Folder Sekarang Hanya Berisi:
```
linera-new/
├── .env.* files                # Environment configs
├── .gitignore
├── Cargo.toml                  # Rust workspace config
├── Cargo.lock
├── linera.toml                 # Linera config
├── rust-toolchain.toml
├── README.md                   # Main README (TETAP)
├── docs/                       # Dokumentasi terorganisir
├── alethea-dashboard/          # Frontend
├── alethea-explorer/
├── alethea-oracle-sdk/
├── alethea-oracle-types/
├── alethea-sdk/
├── alethea-website/
├── deployment/
├── examples/
├── integration-tests/
├── linera-executor/
├── linera-protocol/
├── market-chain/               # Smart contracts
├── oracle-api-backend/
├── oracle-backend/
├── oracle-cli/
├── oracle-contract/
├── oracle-contract-minimal/
├── oracle-registry/
├── oracle-registry-v2/
├── scripts/                    # Scripts yang masih diperlukan
├── tests/
├── voter-template/
└── voters/
```

## ✅ Manfaat

1. **Root folder lebih bersih** - Hanya file konfigurasi dan folder project
2. **Dokumentasi terorganisir** - Mudah ditemukan berdasarkan kategori
3. **Tidak ada duplikasi** - File dokumentasi lama sudah dihapus
4. **Navigasi lebih mudah** - docs/README.md sebagai index
5. **Maintenance lebih mudah** - Struktur yang jelas

## 📝 Catatan

- File `README.md` tetap di root sebagai entry point utama
- Semua dokumentasi penting sudah dipindahkan ke folder yang sesuai
- File-file di `docs/archive/` tetap dipertahankan untuk referensi historis
- Script-script yang masih diperlukan ada di folder `scripts/`

## 🔗 Referensi

- Main README: [../../README.md](../../README.md)
- Docs Index: [../README.md](../README.md)
- Current Status: [./FINAL_STATUS_NOV_20_2025.md](./FINAL_STATUS_NOV_20_2025.md)
