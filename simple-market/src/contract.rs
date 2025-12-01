// Copyright (c) Alethea Network
// SPDX-License-Identifier: MIT

#![cfg_attr(target_arch = "wasm32", no_main)]

use linera_sdk::{
    linera_base_types::{Amount, Timestamp, WithContractAbi},
    views::{RootView, View},
    Contract, ContractRuntime,
};

use simple_market::{
    state::MarketState,
    Bet, ClaimStatus, InstantiationArgument, Market, MarketStatus, Message, Operation, SimpleMarketAbi
};
use oracle_registry_v2::OracleRegistryV2Abi;

pub struct SimpleMarketContract {
    state: MarketState,
    runtime: ContractRuntime<Self>,
}

linera_sdk::contract!(SimpleMarketContract);

impl WithContractAbi for SimpleMarketContract {
    type Abi = SimpleMarketAbi;
}

impl Contract for SimpleMarketContract {
    type Message = Message;
    type InstantiationArgument = InstantiationArgument;
    type Parameters = ();
    type EventValue = ();

    async fn load(runtime: ContractRuntime<Self>) -> Self {
        let state = MarketState::load(runtime.root_view_storage_context())
            .await
            .expect("Failed to load state");
        
        SimpleMarketContract { state, runtime }
    }

    async fn instantiate(&mut self, args: InstantiationArgument) {
        // Initialize state
        self.state.next_market_id.set(1);
        self.state.total_markets_created.set(0);
        self.state.total_bets_placed.set(0);
        self.state.total_volume.set(0);
        
        // Store Registry v2 Application ID for cross-application calls
        self.state.registry_app_id.set(Some(args.registry_app_id.forget_abi()));
        
        // Store Registry chain ID for cross-chain messaging/callbacks
        self.state.registry_chain_id.set(Some(args.registry_chain_id));
        
        // Version marker for bytecode change detection
        eprintln!(
            "Simple Market v4 (cross-app call) initialized with Registry app: {:?}, chain: {}",
            args.registry_app_id, args.registry_chain_id
        );
    }

    async fn execute_operation(&mut self, operation: Operation) {
        match operation {
            Operation::CreateMarket { question, end_time } => {
                self.create_market(question, end_time).await;
            }
            
            Operation::PlaceBet { market_id, outcome, stake } => {
                self.place_bet(market_id, outcome, stake).await;
            }
            
            Operation::ClaimPayout { market_id } => {
                self.claim_payout(market_id).await;
            }
            
            Operation::RequestResolution { market_id } => {
                self.request_resolution(market_id).await;
            }
        }
    }

    async fn execute_message(&mut self, message: Message) {
        match message {
            Message::CreateQueryFromMarket { .. } => {
                // This message is sent FROM Market TO Registry, not received by Market
                eprintln!("Market does not handle CreateQueryFromMarket messages");
            }
            
            Message::QueryResolutionCallback { query_id, resolved_outcome, resolved_at, callback_data } => {
                // Extract market_id from callback_data (little-endian u64)
                let market_id = if callback_data.len() >= 8 {
                    u64::from_le_bytes(callback_data[..8].try_into().unwrap_or([0u8; 8]))
                } else {
                    eprintln!("❌ Invalid callback_data length: {}", callback_data.len());
                    panic!("Invalid callback_data");
                };
                
                eprintln!(
                    "📥 Received QueryResolutionCallback: query_id={}, market_id={}, outcome={}",
                    query_id, market_id, resolved_outcome
                );
                
                self.handle_resolution_callback(
                    market_id,
                    query_id,
                    resolved_outcome,
                    resolved_at
                ).await;
                
                eprintln!("✅ Resolution callback handled for market {}", market_id);
            }
        }
    }

    async fn store(mut self) {
        self.state.save().await.expect("Failed to save state");
    }
}

impl SimpleMarketContract {
    /// Create a new prediction market
    async fn create_market(&mut self, question: String, end_time: Timestamp) {
        // Validate question
        if question.trim().is_empty() {
            panic!("Question cannot be empty");
        }
        
        if question.len() > 200 {
            panic!("Question too long (max 200 characters)");
        }
        
        // Validate end_time is in the future
        let now = self.runtime.system_time();
        if end_time <= now {
            panic!("End time must be in the future");
        }
        
        // Generate market ID
        let market_id = *self.state.next_market_id.get();
        self.state.next_market_id.set(market_id + 1);
        
        // Create market
        let creator = self.runtime.chain_id();
        let created_at = self.runtime.system_time();
        
        let market = Market {
            id: market_id,
            question: question.clone(),
            creator,
            created_at,
            end_time,
            status: MarketStatus::Open,
            yes_pool: Amount::ZERO,
            no_pool: Amount::ZERO,
            total_pool: Amount::ZERO,
            query_id: None,
            registry_chain: None,
            winning_outcome: None,
            resolved_at: None,
        };
        
        // Store market
        self.state.markets.insert(&market_id, market.clone())
            .expect("Failed to insert market");
        
        // Update statistics
        let total = *self.state.total_markets_created.get();
        self.state.total_markets_created.set(total + 1);
        
        eprintln!("✅ Market {} created: {}", market_id, question);
        // Note: Query will be created when market expires and RequestResolution is called
        eprintln!("✅ Market {} created successfully", market_id);
    }
    
    /// Place a bet on a market outcome
    async fn place_bet(&mut self, market_id: u64, outcome: String, stake: Amount) {
        // Validate outcome
        if outcome != "Yes" && outcome != "No" {
            panic!("Outcome must be 'Yes' or 'No'");
        }
        
        // Validate stake
        if stake == Amount::ZERO {
            panic!("Stake must be greater than zero");
        }
        
        // Get market
        let mut market = match self.state.markets.get(&market_id).await {
            Ok(Some(m)) => m,
            Ok(None) => panic!("Market not found"),
            Err(e) => panic!("Failed to get market: {}", e),
        };
        
        // Check if market has expired and update status
        let now = self.runtime.system_time();
        if now >= market.end_time && market.status == MarketStatus::Open {
            market.status = MarketStatus::Voting;
            self.state.markets.insert(&market_id, market.clone())
                .expect("Failed to update market status");
            eprintln!("Market {} transitioned to Voting status (expired)", market_id);
        }
        
        // Validate market is open
        if market.status != MarketStatus::Open {
            panic!("Market is not open for betting (status: {:?})", market.status);
        }
        
        // Create bet
        let bettor = self.runtime.chain_id();
        let placed_at = self.runtime.system_time();
        
        let bet = Bet {
            bettor,
            market_id,
            outcome: outcome.clone(),
            stake,
            placed_at,
            claim_status: ClaimStatus::Pending,
            payout_amount: None,
        };
        
        // Store bet
        self.state.bets.insert(&(market_id, bettor), bet)
            .expect("Failed to insert bet");
        
        // Update pools
        let stake_value: u128 = stake.into();
        if outcome == "Yes" {
            let yes_value: u128 = market.yes_pool.into();
            market.yes_pool = Amount::from_tokens(yes_value + stake_value);
        } else {
            let no_value: u128 = market.no_pool.into();
            market.no_pool = Amount::from_tokens(no_value + stake_value);
        }
        
        let total_value: u128 = market.total_pool.into();
        market.total_pool = Amount::from_tokens(total_value + stake_value);
        
        // Save updated market
        self.state.markets.insert(&market_id, market)
            .expect("Failed to update market");
        
        // Update statistics
        let total_bets = *self.state.total_bets_placed.get();
        self.state.total_bets_placed.set(total_bets + 1);
        
        let total_vol = *self.state.total_volume.get();
        self.state.total_volume.set(total_vol + (stake_value as u64));
        
        eprintln!("✅ Bet placed on market {}: {} with stake {}", market_id, outcome, stake);
    }
    
    /// Claim payout for a winning bet
    async fn claim_payout(&mut self, market_id: u64) {
        let bettor = self.runtime.chain_id();
        
        // Get market
        let market = match self.state.markets.get(&market_id).await {
            Ok(Some(m)) => m,
            Ok(None) => panic!("Market not found"),
            Err(e) => panic!("Failed to get market: {}", e),
        };
        
        // Validate market is resolved
        if market.status != MarketStatus::Resolved {
            panic!("Market is not resolved yet");
        }
        
        // Get bet
        let mut bet = match self.state.bets.get(&(market_id, bettor)).await {
            Ok(Some(b)) => b,
            Ok(None) => panic!("No bet found for this market"),
            Err(e) => panic!("Failed to get bet: {}", e),
        };
        
        // Validate not already claimed
        if bet.claim_status == ClaimStatus::Claimed {
            panic!("Payout already claimed");
        }
        
        // Validate bet is on winning outcome
        let winning_outcome = match market.winning_outcome.as_ref() {
            Some(o) => o,
            None => panic!("No winning outcome set"),
        };
        
        if &bet.outcome != winning_outcome {
            panic!("Bet was on losing outcome ({})", bet.outcome);
        }
        
        // Calculate payout if not already calculated
        let payout = match bet.payout_amount {
            Some(p) => p,
            None => {
                // Calculate payout now
                let (winning_pool, _) = if winning_outcome == "Yes" {
                    (market.yes_pool, market.no_pool)
                } else {
                    (market.no_pool, market.yes_pool)
                };
                
                let total_value: u128 = market.total_pool.into();
                let winning_value: u128 = winning_pool.into();
                let stake_value: u128 = bet.stake.into();
                
                if winning_value == 0 {
                    panic!("No winning pool");
                }
                
                let payout_value = (stake_value as f64 * total_value as f64 / winning_value as f64) as u128;
                let payout = Amount::from_tokens(payout_value);
                
                // Store calculated payout
                bet.payout_amount = Some(payout);
                
                payout
            }
        };
        
        // Mark as claimed
        bet.claim_status = ClaimStatus::Claimed;
        self.state.bets.insert(&(market_id, bettor), bet)
            .expect("Failed to update bet");
        
        // TODO: Transfer payout to bettor (implement token transfer)
        
        eprintln!("✅ Payout claimed for market {}: {}", market_id, payout);
    }
    
    /// Request resolution for an expired market
    /// This will create a query in Oracle Registry v2 via cross-application call
    async fn request_resolution(&mut self, market_id: u64) {
        eprintln!("🔔 Requesting resolution for market {}", market_id);
        
        // Get market
        let mut market = match self.state.markets.get(&market_id).await {
            Ok(Some(m)) => m,
            Ok(None) => {
                eprintln!("Market {} not found", market_id);
                panic!("Market not found");
            }
            Err(e) => {
                eprintln!("Failed to get market {}: {}", market_id, e);
                panic!("Failed to get market: {}", e);
            }
        };
        
        // Check if market is expired
        let now = self.runtime.system_time();
        if now < market.end_time {
            eprintln!("Market {} not expired yet", market_id);
            panic!("Market not expired yet");
        }
        
        // Check if already in voting or resolved
        if market.status != MarketStatus::Open {
            eprintln!("Market {} already in status {:?}", market_id, market.status);
            panic!("Market already processed");
        }
        
        // Get Registry v2 Application ID
        let registry_app_id = match *self.state.registry_app_id.get() {
            Some(id) => id,
            None => {
                eprintln!("Registry v2 Application ID not configured");
                panic!("Registry v2 Application ID not configured. Set it during instantiation.");
            }
        };
        
        // Update market status to Voting
        market.status = MarketStatus::Voting;
        self.state.markets.insert(&market_id, market.clone())
            .expect("Failed to update market status");
        
        eprintln!("✅ Market {} status updated to Voting", market_id);
        
        // Prepare callback data (market_id as bytes)
        let callback_data = market_id.to_le_bytes().to_vec();
        
        // Get callback chain and app (this chain and this app)
        let callback_chain = self.runtime.chain_id();
        let callback_app = self.runtime.application_id().forget_abi();
        
        // Create Registry v2 Operation for cross-application call
        let registry_operation = oracle_registry_v2::Operation::CreateQueryWithCallback {
            description: format!("Market #{}: {}", market_id, market.question),
            outcomes: vec!["Yes".to_string(), "No".to_string()],
            strategy: oracle_registry_v2::state::DecisionStrategy::Majority,
            min_votes: None, // Use default
            reward_amount: linera_sdk::linera_base_types::Amount::ZERO,
            deadline: Some(market.end_time),
            callback_chain,
            callback_app,
            callback_data,
        };
        
        eprintln!(
            "📤 Calling Registry v2 CreateQueryWithCallback: market_id={}, callback_chain={}, callback_app={}",
            market_id, callback_chain, callback_app
        );
        
        // Make cross-application call to Registry v2
        // This is synchronous and atomic - the query is created in the same transaction
        let registry_app_id_typed = registry_app_id.with_abi::<OracleRegistryV2Abi>();
        
        let response = self.runtime.call_application(
            true, // authenticated
            registry_app_id_typed,
            &registry_operation,
        );
        
        eprintln!("✅ Registry v2 response: {:?}", response);
        
        // Store query_id from response if available
        if response.success {
            if let Some(ref data) = response.data {
                if let Some(query_id) = data.query_id {
                    market.query_id = Some(query_id);
                    // Registry chain is stored separately during instantiation
                    market.registry_chain = *self.state.registry_chain_id.get();
                    self.state.markets.insert(&market_id, market)
                        .expect("Failed to update market with query_id");
                    eprintln!("✅ Market {} linked to query {}", market_id, query_id);
                }
            }
        } else {
            eprintln!("❌ Registry v2 call failed: {}", response.message);
            // Revert market status
            market.status = MarketStatus::Open;
            self.state.markets.insert(&market_id, market)
                .expect("Failed to revert market status");
            panic!("Failed to create query in Registry v2: {}", response.message);
        }
    }
    
    /// Handle resolution callback from Registry v2
    async fn handle_resolution_callback(
        &mut self,
        market_id: u64,
        query_id: u64,
        result: String,
        resolved_at: Timestamp,
    ) {
        eprintln!(
            "📥 Received resolution callback from Registry v2: market_id={}, query_id={}, result={}",
            market_id, query_id, result
        );
        
        // Get market
        let mut market = match self.state.markets.get(&market_id).await {
            Ok(Some(m)) => m,
            Ok(None) => {
                eprintln!("❌ Market {} not found", market_id);
                panic!("Market not found");
            }
            Err(e) => {
                eprintln!("❌ Failed to get market {}: {}", market_id, e);
                panic!("Failed to get market: {}", e);
            }
        };
        
        // Validate market is not already resolved
        if market.status == MarketStatus::Resolved {
            eprintln!("⚠️ Market {} already resolved", market_id);
            panic!("Market already resolved");
        }
        
        // Update market status
        market.status = MarketStatus::Resolved;
        market.query_id = Some(query_id);
        market.winning_outcome = Some(result.clone());
        market.resolved_at = Some(resolved_at);
        
        eprintln!("✅ Market {} status updated to Resolved", market_id);
        
        // Calculate payouts for all bets
        self.calculate_payouts(&market).await;
        
        // Save updated market
        self.state.markets.insert(&market_id, market)
            .expect("Failed to update market");
        
        eprintln!("✅ Market {} resolved with outcome: {}", market_id, result);
    }
    
    /// Calculate payouts for all bets on a market
    async fn calculate_payouts(&mut self, market: &Market) {
        let winning_outcome = match &market.winning_outcome {
            Some(o) => o,
            None => return,
        };
        
        // Get winning and losing pools
        let (winning_pool, _losing_pool) = if winning_outcome == "Yes" {
            (market.yes_pool, market.no_pool)
        } else {
            (market.no_pool, market.yes_pool)
        };
        
        // If no one bet on winning outcome, no payouts
        if winning_pool == Amount::ZERO {
            return;
        }
        
        // Calculate payout ratio: total_pool / winning_pool
        let total_value: u128 = market.total_pool.into();
        let winning_value: u128 = winning_pool.into();
        let payout_ratio = total_value as f64 / winning_value as f64;
        
        // Update all bets with payout amounts
        // Note: In production, we'd iterate through all bets for this market
        // For MVP, payouts are calculated when claimed
        
        eprintln!("Payouts calculated for market {}: ratio = {}", market.id, payout_ratio);
    }
    
}
