// Copyright (c) Alethea Network
// SPDX-License-Identifier: MIT

//! Simple Prediction Market - MVP for testing Registry v2 resolution
//! 
//! This is a minimal market implementation that demonstrates:
//! - Creating binary (Yes/No) prediction markets
//! - Placing bets on outcomes
//! - Receiving resolution callbacks from Registry v2
//! - Claiming payouts based on oracle results

pub mod state;

use async_graphql::{Request, Response};
use linera_sdk::{
    graphql::GraphQLMutationRoot,
    linera_base_types::{Amount, ApplicationId, ChainId, Timestamp, ContractAbi, ServiceAbi},
};
use serde::{Deserialize, Serialize};

pub struct SimpleMarketAbi;

impl ContractAbi for SimpleMarketAbi {
    type Operation = Operation;
    type Response = ();
}

impl ServiceAbi for SimpleMarketAbi {
    type Query = Request;
    type QueryResponse = Response;
}

/// Instantiation argument for Simple Market
/// Contains the Registry v2 application ID for cross-application calls
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InstantiationArgument {
    /// Registry v2 Application ID (for cross-application calls)
    pub registry_app_id: ApplicationId<oracle_registry_v2::OracleRegistryV2Abi>,
    /// Registry v2 Chain ID (for cross-chain messaging/callbacks)
    pub registry_chain_id: ChainId,
}

/// Operations that can be performed on the market
#[derive(Debug, Clone, Serialize, Deserialize, GraphQLMutationRoot)]
pub enum Operation {
    /// Create a new prediction market
    CreateMarket {
        question: String,
        end_time: Timestamp,
    },
    
    /// Place a bet on a market outcome
    PlaceBet {
        market_id: u64,
        outcome: String,  // "Yes" or "No"
        stake: Amount,
    },
    
    /// Claim payout for a winning bet
    ClaimPayout {
        market_id: u64,
    },
    
    /// Request resolution for an expired market
    /// This will create a query in Oracle Registry v2 for voters to resolve
    RequestResolution {
        market_id: u64,
    },
}

/// Cross-chain messages
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Message {
    /// Market -> Registry: Request query creation for expired market
    CreateQueryFromMarket {
        market_id: u64,
        question: String,
        outcomes: Vec<String>,
        deadline: Timestamp,
        callback_chain: ChainId,
        callback_data: Vec<u8>,
    },
    
    /// Registry -> Market: Callback with query resolution
    /// This message is sent FROM Registry v2 TO Market Chain after query is resolved
    /// Note: market_id is encoded in callback_data (as little-endian u64 bytes)
    QueryResolutionCallback {
        query_id: u64,
        resolved_outcome: String,
        resolved_at: Timestamp,
        callback_data: Vec<u8>,  // Contains market_id as bytes
    },
}

/// Response from operations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OperationResponse {
    pub success: bool,
    pub message: String,
    pub data: Option<ResponseData>,
}

impl OperationResponse {
    pub fn success(message: impl Into<String>) -> Self {
        Self {
            success: true,
            message: message.into(),
            data: None,
        }
    }
    
    pub fn success_with_data(message: impl Into<String>, data: ResponseData) -> Self {
        Self {
            success: true,
            message: message.into(),
            data: Some(data),
        }
    }
    
    pub fn error(message: impl Into<String>) -> Self {
        Self {
            success: false,
            message: message.into(),
            data: None,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResponseData {
    pub market_id: Option<u64>,
    pub query_id: Option<u64>,
    pub payout_amount: Option<Amount>,
}

/// Market status
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum MarketStatus {
    Open,      // Accepting bets
    Voting,    // Oracle voting in progress
    Resolved,  // Oracle resolved, payouts available
    Cancelled, // Market cancelled
}

/// Market data structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Market {
    pub id: u64,
    pub question: String,
    pub creator: ChainId,
    pub created_at: Timestamp,
    pub end_time: Timestamp,
    pub status: MarketStatus,
    
    // Betting pools
    pub yes_pool: Amount,
    pub no_pool: Amount,
    pub total_pool: Amount,
    
    // Oracle integration
    pub query_id: Option<u64>,
    pub registry_chain: Option<ChainId>,
    
    // Resolution
    pub winning_outcome: Option<String>,
    pub resolved_at: Option<Timestamp>,
}

/// Bet data structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Bet {
    pub bettor: ChainId,
    pub market_id: u64,
    pub outcome: String,  // "Yes" or "No"
    pub stake: Amount,
    pub placed_at: Timestamp,
    pub claim_status: ClaimStatus,
    pub payout_amount: Option<Amount>,
}

/// Claim status for bets
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ClaimStatus {
    Pending,   // Not yet claimed
    Claimed,   // Payout claimed
}
