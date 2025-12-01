/**
 * Configuration for the Oracle client
 */
export interface OracleConfig {
    /** Registry application ID */
    registryId: string;

    /** Chain ID where the registry is deployed */
    chainId: string;

    /** GraphQL endpoint (optional, will be auto-generated if not provided) */
    endpoint?: string;

    /** Number of retry attempts for failed requests (default: 3) */
    retryAttempts?: number;

    /** Delay between retries in milliseconds (default: 1000) */
    retryDelay?: number;

    /** Voter address (optional, required for voter operations) */
    voterAddress?: string;
}

/**
 * Parameters for registering a new market
 */
export interface RegisterMarketParams {
    /** The market question */
    question: string;

    /** Array of possible outcomes (2-10 items) */
    outcomes: string[];

    /** Resolution deadline in microseconds since epoch */
    deadline: string;

    /** Chain ID where callback should be sent */
    callbackChainId: string;

    /** Application ID where callback should be sent */
    callbackApplicationId: string;

    /** Method name to call on resolution */
    callbackMethod: string;

    /** Registration fee in tokens (as string) */
    fee: string;
}

/**
 * Result of market registration
 */
export interface MarketRegistration {
    /** The assigned market ID */
    marketId: number;

    /** Timestamp when market was registered */
    registeredAt: Date;

    /** Estimated resolution time */
    estimatedResolution: Date;
}

/**
 * Market status information
 */
export interface MarketStatus {
    /** Market ID */
    id: number;

    /** Current status */
    status: 'ACTIVE' | 'VOTING' | 'REVEALING' | 'RESOLVED' | 'CANCELLED';

    /** Winning outcome index (only present when resolved) */
    finalOutcome?: number;

    /** Callback status */
    callbackStatus: 'PENDING' | 'SENT' | 'FAILED' | 'NOT_REQUIRED';

    /** Resolution timestamp (only present when resolved) */
    resolvedAt?: string;

    /** Confidence score (0-100, only present when resolved) */
    confidence?: number;

    /** Market question */
    question?: string;

    /** Possible outcomes */
    outcomes?: string[];
}

/**
 * Resolution data provided to callback
 */
export interface Resolution {
    /** Market ID */
    marketId: number;

    /** Winning outcome index */
    outcome: number;

    /** Resolution timestamp */
    resolvedAt: string;

    /** Confidence score (0-100) */
    confidence?: number;

    /** Number of voters who participated */
    voterCount?: number;
}

/**
 * Callback function for resolution updates
 */
export type ResolutionCallback = (
    resolution: Resolution | null,
    error: Error | null
) => void;

/**
 * Function to unsubscribe from resolution updates
 */
export type Unsubscribe = () => void;

/**
 * Options for subscription
 */
export interface SubscriptionOptions {
    /** Polling interval in milliseconds (default: 5000) */
    pollInterval?: number;

    /** Timeout in milliseconds (default: 86400000 = 24 hours) */
    timeout?: number;
}

/**
 * Internal GraphQL response types
 */
export interface GraphQLResponse<T = any> {
    data?: T;
    errors?: Array<{
        message: string;
        extensions?: {
            code?: string;
            [key: string]: any;
        };
    }>;
}

/**
 * GraphQL market query response
 */
export interface MarketQueryResponse {
    market: {
        id: number;
        question: string;
        outcomes: string[];
        deadline: string;
        status: string;
        finalOutcome?: number;
        callbackStatus: string;
        resolvedAt?: string;
        confidence?: number;
    } | null;
}

/**
 * GraphQL register market mutation response
 */
export interface RegisterMarketResponse {
    registerExternalMarket: number;
}

/**
 * Voter information
 */
export interface VoterInfo {
    /** Voter's account address */
    address: string;

    /** Staked amount in tokens */
    stake: string;

    /** Locked stake for active votes */
    lockedStake: string;

    /** Available stake (stake - lockedStake) */
    availableStake: string;

    /** Reputation score (0-100) */
    reputation: number;

    /** Reputation tier (Novice, Intermediate, Expert, Master) */
    reputationTier: string;

    /** Voting weight multiplier based on reputation (0.5-2.0) */
    reputationWeight: number;

    /** Total number of votes submitted */
    totalVotes: number;

    /** Number of correct votes */
    correctVotes: number;

    /** Voting accuracy percentage */
    accuracyPercentage: number;

    /** Registration timestamp (ISO 8601 format) */
    registeredAt: string;

    /** Is voter currently active */
    isActive: boolean;

    /** Optional voter name */
    name?: string;

    /** Optional metadata URL */
    metadataUrl?: string;
}

/**
 * Query information (account-based registry)
 */
export interface QueryInfo {
    /** Unique query ID */
    id: number;

    /** Query description */
    description: string;

    /** Possible outcomes */
    outcomes: string[];

    /** Decision strategy */
    strategy: 'Majority' | 'Median' | 'WeightedByStake' | 'WeightedByReputation';

    /** Minimum votes required for resolution */
    minVotes: number;

    /** Reward amount for correct voters */
    rewardAmount: string;

    /** Query creator address */
    creator: string;

    /** Creation timestamp (ISO 8601 format) */
    createdAt: string;

    /** Resolution deadline (ISO 8601 format) */
    deadline: string;

    /** Query status */
    status: 'Active' | 'Resolved' | 'Expired' | 'Cancelled';

    /** Resolved result (if resolved) */
    result?: string;

    /** Resolution timestamp (if resolved) */
    resolvedAt?: string;

    /** Number of votes submitted */
    voteCount: number;

    /** Time remaining until deadline (in seconds) */
    timeRemaining: number;
}

/**
 * Protocol statistics
 */
export interface Statistics {
    /** Total number of registered voters */
    totalVoters: number;

    /** Number of active voters */
    activeVoters: number;

    /** Total stake across all voters */
    totalStake: string;

    /** Total locked stake */
    totalLockedStake: string;

    /** Average stake per voter */
    averageStake: string;

    /** Total number of queries created */
    totalQueriesCreated: number;

    /** Total number of queries resolved */
    totalQueriesResolved: number;

    /** Number of currently active queries */
    activeQueriesCount: number;

    /** Total number of votes submitted */
    totalVotesSubmitted: number;

    /** Average votes per query */
    averageVotesPerQuery: number;

    /** Total rewards distributed */
    totalRewardsDistributed: string;

    /** Current reward pool balance */
    rewardPoolBalance: string;

    /** Protocol treasury balance */
    protocolTreasury: string;

    /** Average voter reputation score */
    averageReputation: number;

    /** Protocol status (Active or Paused) */
    protocolStatus: string;

    /** Query resolution rate (percentage) */
    resolutionRate: number;
}

/**
 * Parameters for registering as a voter
 */
export interface RegisterVoterParams {
    /** Stake amount in tokens */
    stake: string;

    /** Optional voter name */
    name?: string;

    /** Optional metadata URL */
    metadataUrl?: string;
}

/**
 * Parameters for creating a query
 */
export interface CreateQueryParams {
    /** Query description */
    description: string;

    /** Possible outcomes */
    outcomes: string[];

    /** Decision strategy */
    strategy: 'Majority' | 'Median' | 'WeightedByStake' | 'WeightedByReputation';

    /** Minimum votes required (optional, uses protocol default if not specified) */
    minVotes?: number;

    /** Reward amount for correct voters in tokens */
    rewardAmount: string;

    /** Resolution deadline in microseconds since epoch (optional, uses protocol default if not specified) */
    deadline?: string;
}

/**
 * Parameters for submitting a vote
 */
export interface SubmitVoteParams {
    /** Query ID to vote on */
    queryId: number;

    /** Vote value/outcome */
    value: string;

    /** Optional confidence score (0-100) */
    confidence?: number;
}

/**
 * GraphQL response types for account-based operations
 */
export interface VoterQueryResponse {
    voter: VoterInfo | null;
}

export interface VotersQueryResponse {
    voters: VoterInfo[];
}

export interface QueryQueryResponse {
    query: QueryInfo | null;
}

export interface QueriesQueryResponse {
    queries: QueryInfo[];
}

export interface ActiveQueriesQueryResponse {
    activeQueries: QueryInfo[];
}

export interface StatisticsQueryResponse {
    statistics: Statistics;
}

export interface PendingRewardsQueryResponse {
    myPendingRewards: string;
}
