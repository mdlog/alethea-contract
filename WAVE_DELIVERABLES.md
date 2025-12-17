# Alethea Network - Wave Deliverables

## Wave 4: Complete Oracle Platform with Token Economy

Wave 4 delivers a fully functional decentralized oracle platform on Linera testnet Conway, comprising three integrated components: ALTH token contract, Oracle Registry v2 contract, and a production-ready web dashboard.

The ALTH token contract (`alethea-token`) implements a fungible token with cross-chain transfer capabilities. Users can mint, transfer, and manage tokens across different Linera chains using the native messaging system. The token serves as the economic backbone for the oracle network, enabling real staking for voter registration. Token operations include `sendTransferMessage` for cross-chain transfers and balance queries via GraphQL. The contract is deployed with App ID `bc9272e95177834f00d617d2996e1979fb77c5e77eede964c3239019f6454a0d`.

The Oracle Registry v2 contract (`oracle-registry-v2`) implements a decentralized oracle with commit-reveal voting. Voters register by staking ALTH tokens, which are transferred to the treasury before registration. The two-phase voting prevents vote copying: voters first submit a hash of their vote (commit), then reveal the actual vote with salt (reveal). The contract calculates voter power as stake × reputation, supports multiple decision strategies (Majority, Median, WeightedByStake), and handles automatic phase transitions. Deployed with App ID `e821a9aa94d38eb40cd9da7914aa06607c7d3a27f11fa065aa71dbbfc35ea62d`.

The Alethea Dashboard (`alethea-dashboard-vite`) provides complete UI for all platform operations. Built with Vite, React 19, and Linera's WASM client (`@linera/client`), it enables authenticated blockchain operations directly from the browser. Key features include wallet creation with BIP-39 mnemonic, chain claiming from faucet, token faucet for testnet tokens, voter registration with integrated token staking, commit-reveal voting interface with local salt storage, and real-time balance/stats display. The WASM integration eliminates backend requirements while maintaining cryptographic authentication.

Dashboard: http://localhost:4002 | Chain: `208873b668818fc962d8470c68698dc5dff2321720a9bb0d74576d45f4f73c91`

---

## Wave 5: Prediction Market and Automated Rewards (Planned)

Wave 5 introduces prediction market integration where users create markets on future events resolved by oracle voters. The market contract automatically triggers oracle queries at deadlines and receives resolution callbacks to settle positions using Linera's cross-application messaging.

Automated reward distribution calculates payouts based on voter accuracy, stake weight, and reputation. Correct voters receive proportional rewards while incorrect voters face stake slashing (configurable percentage deducted and redistributed to reward pool).

---

## Wave 6: Multi-Chain Federation and Analytics (Planned)

Wave 6 expands the oracle into a multi-chain federation, enabling oracle instances across Linera chains to share data and aggregate consensus for higher reliability.

Governance voting allows token holders to modify protocol parameters (minimum stake, slashing rates, reward percentages) through commit-reveal proposals. Advanced analytics dashboard provides voter performance metrics, resolution statistics, and historical tracking. Oracle Data Feeds API exposes results for DeFi integration.
