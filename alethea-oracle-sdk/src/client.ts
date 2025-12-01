import {
    OracleConfig,
    RegisterMarketParams,
    MarketRegistration,
    MarketStatus,
    Resolution,
    ResolutionCallback,
    Unsubscribe,
    SubscriptionOptions,
    GraphQLResponse,
    MarketQueryResponse,
    RegisterMarketResponse,
    VoterInfo,
    QueryInfo,
    Statistics,
    RegisterVoterParams,
    CreateQueryParams,
    SubmitVoteParams,
    VoterQueryResponse,
    VotersQueryResponse,
    QueryQueryResponse,
    QueriesQueryResponse,
    ActiveQueriesQueryResponse,
    StatisticsQueryResponse,
    PendingRewardsQueryResponse,
} from './types';
import {
    ValidationError,
    NetworkError,
    MarketNotFoundError,
    MaxRetriesExceededError,
    SubscriptionTimeoutError,
} from './errors';

/**
 * Client for interacting with Alethea Oracle Network
 */
export class AletheaOracleClient {
    private config: OracleConfig;
    private endpoint: string;
    private retryAttempts: number;
    private retryDelay: number;

    constructor(config: OracleConfig) {
        this.config = config;
        this.endpoint = config.endpoint || this.buildDefaultEndpoint();
        this.retryAttempts = config.retryAttempts ?? 3;
        this.retryDelay = config.retryDelay ?? 1000;
    }

    /**
     * Register a new market with the oracle
     */
    async registerMarket(
        params: RegisterMarketParams
    ): Promise<MarketRegistration> {
        // Validate parameters
        this.validateMarketParams(params);

        // Build GraphQL mutation
        const mutation = this.buildRegisterMutation(params);

        // Execute with retry
        const result = await this.executeWithRetry<RegisterMarketResponse>(mutation);

        if (!result.data?.registerExternalMarket) {
            throw new NetworkError('Invalid response from oracle service');
        }

        return {
            marketId: result.data.registerExternalMarket,
            registeredAt: new Date(),
            estimatedResolution: new Date(parseInt(params.deadline) / 1000),
        };
    }

    /**
     * Get the current status of a market
     */
    async getMarketStatus(marketId: number): Promise<MarketStatus> {
        const query = `
      query {
        market(id: ${marketId}) {
          id
          question
          outcomes
          deadline
          status
          finalOutcome
          callbackStatus
          resolvedAt
          confidence
        }
      }
    `;

        const result = await this.executeQuery<MarketQueryResponse>(query);

        if (!result.data?.market) {
            throw new MarketNotFoundError(marketId);
        }

        return this.parseMarketStatus(result.data.market);
    }

    /**
     * Subscribe to market resolution updates
     */
    async subscribeToResolution(
        marketId: number,
        callback: ResolutionCallback,
        options?: SubscriptionOptions
    ): Promise<Unsubscribe> {
        const pollInterval = options?.pollInterval ?? 5000;
        const timeout = options?.timeout ?? 86400000; // 24 hours

        const startTime = Date.now();
        let isActive = true;

        const poll = async () => {
            if (!isActive) return;

            try {
                // Check timeout
                if (Date.now() - startTime > timeout) {
                    isActive = false;
                    callback(null, new SubscriptionTimeoutError(marketId, timeout));
                    return;
                }

                // Poll status
                const status = await this.getMarketStatus(marketId);

                if (status.status === 'RESOLVED') {
                    isActive = false;
                    callback(
                        {
                            marketId,
                            outcome: status.finalOutcome!,
                            resolvedAt: status.resolvedAt!,
                            confidence: status.confidence,
                        },
                        null
                    );
                } else {
                    // Continue polling
                    if (isActive) {
                        setTimeout(poll, pollInterval);
                    }
                }
            } catch (error) {
                // Continue polling on error (don't stop subscription)
                console.error('Polling error:', error);
                if (isActive) {
                    setTimeout(poll, pollInterval);
                }
            }
        };

        // Start polling
        setTimeout(poll, pollInterval);

        // Return unsubscribe function
        return () => {
            isActive = false;
        };
    }

    /**
     * Execute GraphQL query with retry logic
     */
    private async executeWithRetry<T>(
        query: string,
        attempt: number = 1
    ): Promise<GraphQLResponse<T>> {
        try {
            return await this.executeQuery<T>(query);
        } catch (error) {
            if (attempt >= this.retryAttempts) {
                throw new MaxRetriesExceededError(attempt, error);
            }

            // Exponential backoff: delay * attempt
            await this.sleep(this.retryDelay * attempt);

            return this.executeWithRetry<T>(query, attempt + 1);
        }
    }

    /**
     * Execute a GraphQL query
     */
    private async executeQuery<T>(query: string): Promise<GraphQLResponse<T>> {
        try {
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query }),
            });

            if (!response.ok) {
                throw new NetworkError(
                    `HTTP ${response.status}: ${response.statusText}`
                );
            }

            const result = await response.json() as GraphQLResponse<T>;

            if (result.errors && result.errors.length > 0) {
                const error = result.errors[0];
                throw new NetworkError(
                    error.message,
                    error.extensions
                );
            }

            return result;
        } catch (error) {
            if (error instanceof NetworkError) {
                throw error;
            }
            throw new NetworkError(
                'Failed to communicate with oracle service',
                error
            );
        }
    }

    /**
     * Validate market registration parameters
     */
    private validateMarketParams(params: RegisterMarketParams): void {
        if (!params.question || params.question.trim().length === 0) {
            throw new ValidationError('Question is required and cannot be empty');
        }

        if (!params.outcomes || params.outcomes.length < 2) {
            throw new ValidationError(
                'At least 2 outcomes are required'
            );
        }

        if (params.outcomes.length > 10) {
            throw new ValidationError(
                'Maximum 10 outcomes allowed'
            );
        }

        const deadline = parseInt(params.deadline);
        if (isNaN(deadline) || deadline <= Date.now() * 1000) {
            throw new ValidationError(
                'Deadline must be a valid timestamp in the future (in microseconds)'
            );
        }

        if (!params.callbackChainId || params.callbackChainId.trim().length === 0) {
            throw new ValidationError('Callback chain ID is required');
        }

        if (!params.callbackApplicationId || params.callbackApplicationId.trim().length === 0) {
            throw new ValidationError('Callback application ID is required');
        }

        if (!params.callbackMethod || params.callbackMethod.trim().length === 0) {
            throw new ValidationError('Callback method is required');
        }

        const fee = parseFloat(params.fee);
        if (isNaN(fee) || fee <= 0) {
            throw new ValidationError('Fee must be a positive number');
        }
    }

    /**
     * Build GraphQL mutation for market registration
     */
    private buildRegisterMutation(params: RegisterMarketParams): string {
        const outcomesJson = JSON.stringify(params.outcomes);

        return `
      mutation {
        registerExternalMarket(input: {
          question: ${JSON.stringify(params.question)}
          outcomes: ${outcomesJson}
          deadline: "${params.deadline}"
          callbackChainId: "${params.callbackChainId}"
          callbackApplicationId: "${params.callbackApplicationId}"
          callbackMethod: "${params.callbackMethod}"
          fee: "${params.fee}"
        })
      }
    `;
    }

    /**
     * Parse market status from GraphQL response
     */
    private parseMarketStatus(market: any): MarketStatus {
        return {
            id: market.id,
            status: market.status,
            finalOutcome: market.finalOutcome,
            callbackStatus: market.callbackStatus,
            resolvedAt: market.resolvedAt,
            confidence: market.confidence,
            question: market.question,
            outcomes: market.outcomes,
        };
    }

    /**
     * Build default GraphQL endpoint from config
     */
    private buildDefaultEndpoint(): string {
        // Default Linera GraphQL endpoint format
        return `http://localhost:8080/chains/${this.config.chainId}/applications/${this.config.registryId}`;
    }

    /**
     * Sleep utility for retry delays
     */
    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ========================================
    // Account-Based Registry Methods
    // ========================================

    /**
     * Register as a voter in the account-based registry
     */
    async registerVoter(params: RegisterVoterParams): Promise<VoterInfo> {
        if (!this.config.voterAddress) {
            throw new ValidationError('Voter address is required for voter operations');
        }

        // Validate parameters
        const stake = parseFloat(params.stake);
        if (isNaN(stake) || stake <= 0) {
            throw new ValidationError('Stake must be a positive number');
        }

        // Build GraphQL mutation
        const mutation = `
            mutation {
                registerVoter(
                    stake: "${params.stake}"
                    ${params.name ? `name: ${JSON.stringify(params.name)}` : ''}
                    ${params.metadataUrl ? `metadataUrl: ${JSON.stringify(params.metadataUrl)}` : ''}
                ) {
                    address
                    stake
                    lockedStake
                    availableStake
                    reputation
                    reputationTier
                    reputationWeight
                    totalVotes
                    correctVotes
                    accuracyPercentage
                    registeredAt
                    isActive
                    name
                    metadataUrl
                }
            }
        `;

        const result = await this.executeWithRetry<{ registerVoter: VoterInfo }>(mutation);

        if (!result.data?.registerVoter) {
            throw new NetworkError('Invalid response from voter registration');
        }

        return result.data.registerVoter;
    }

    /**
     * Get voter information by address
     */
    async getVoter(address?: string): Promise<VoterInfo | null> {
        const voterAddress = address || this.config.voterAddress;
        if (!voterAddress) {
            throw new ValidationError('Voter address is required');
        }

        const query = `
            query {
                voter(address: "${voterAddress}") {
                    address
                    stake
                    lockedStake
                    availableStake
                    reputation
                    reputationTier
                    reputationWeight
                    totalVotes
                    correctVotes
                    accuracyPercentage
                    registeredAt
                    isActive
                    name
                    metadataUrl
                }
            }
        `;

        const result = await this.executeQuery<VoterQueryResponse>(query);
        return result.data?.voter || null;
    }

    /**
     * Get all registered voters
     */
    async getVoters(options?: {
        limit?: number;
        offset?: number;
        activeOnly?: boolean;
    }): Promise<VoterInfo[]> {
        const limit = options?.limit || 100;
        const offset = options?.offset || 0;
        const activeOnly = options?.activeOnly || false;

        const query = `
            query {
                voters(limit: ${limit}, offset: ${offset}, activeOnly: ${activeOnly}) {
                    address
                    stake
                    lockedStake
                    availableStake
                    reputation
                    reputationTier
                    reputationWeight
                    totalVotes
                    correctVotes
                    accuracyPercentage
                    registeredAt
                    isActive
                    name
                    metadataUrl
                }
            }
        `;

        const result = await this.executeQuery<VotersQueryResponse>(query);
        return result.data?.voters || [];
    }

    /**
     * Get current user's voter information
     */
    async getMyVoterInfo(): Promise<VoterInfo | null> {
        if (!this.config.voterAddress) {
            throw new ValidationError('Voter address is required for this operation');
        }

        const query = `
            query {
                myVoterInfo(address: "${this.config.voterAddress}") {
                    address
                    stake
                    lockedStake
                    availableStake
                    reputation
                    reputationTier
                    reputationWeight
                    totalVotes
                    correctVotes
                    accuracyPercentage
                    registeredAt
                    isActive
                    name
                    metadataUrl
                }
            }
        `;

        const result = await this.executeQuery<{ myVoterInfo: VoterInfo | null }>(query);
        return result.data?.myVoterInfo || null;
    }

    /**
     * Get pending rewards for current voter
     */
    async getMyPendingRewards(): Promise<string> {
        if (!this.config.voterAddress) {
            throw new ValidationError('Voter address is required for this operation');
        }

        const query = `
            query {
                myPendingRewards(address: "${this.config.voterAddress}")
            }
        `;

        const result = await this.executeQuery<PendingRewardsQueryResponse>(query);
        return result.data?.myPendingRewards || '0';
    }

    /**
     * Create a new query
     */
    async createQuery(params: CreateQueryParams): Promise<QueryInfo> {
        // Validate parameters
        if (!params.description || params.description.trim().length === 0) {
            throw new ValidationError('Description is required and cannot be empty');
        }

        if (!params.outcomes || params.outcomes.length < 2) {
            throw new ValidationError('At least 2 outcomes are required');
        }

        if (params.outcomes.length > 10) {
            throw new ValidationError('Maximum 10 outcomes allowed');
        }

        const rewardAmount = parseFloat(params.rewardAmount);
        if (isNaN(rewardAmount) || rewardAmount <= 0) {
            throw new ValidationError('Reward amount must be a positive number');
        }

        const validStrategies = ['Majority', 'Median', 'WeightedByStake', 'WeightedByReputation'];
        if (!validStrategies.includes(params.strategy)) {
            throw new ValidationError(`Invalid strategy. Must be one of: ${validStrategies.join(', ')}`);
        }

        // Build GraphQL mutation
        const outcomesJson = JSON.stringify(params.outcomes);
        const mutation = `
            mutation {
                createQuery(
                    description: ${JSON.stringify(params.description)}
                    outcomes: ${outcomesJson}
                    strategy: "${params.strategy}"
                    ${params.minVotes ? `minVotes: ${params.minVotes}` : ''}
                    rewardAmount: "${params.rewardAmount}"
                    ${params.deadline ? `deadline: "${params.deadline}"` : ''}
                ) {
                    id
                    description
                    outcomes
                    strategy
                    minVotes
                    rewardAmount
                    creator
                    createdAt
                    deadline
                    status
                    result
                    resolvedAt
                    voteCount
                    timeRemaining
                }
            }
        `;

        const result = await this.executeWithRetry<{ createQuery: QueryInfo }>(mutation);

        if (!result.data?.createQuery) {
            throw new NetworkError('Invalid response from query creation');
        }

        return result.data.createQuery;
    }

    /**
     * Get query information by ID
     */
    async getQuery(queryId: number): Promise<QueryInfo | null> {
        const query = `
            query {
                query(id: ${queryId}) {
                    id
                    description
                    outcomes
                    strategy
                    minVotes
                    rewardAmount
                    creator
                    createdAt
                    deadline
                    status
                    result
                    resolvedAt
                    voteCount
                    timeRemaining
                }
            }
        `;

        const result = await this.executeQuery<QueryQueryResponse>(query);
        return result.data?.query || null;
    }

    /**
     * Get all queries with optional filtering
     */
    async getQueries(options?: {
        limit?: number;
        offset?: number;
        status?: 'Active' | 'Resolved' | 'Expired' | 'Cancelled';
    }): Promise<QueryInfo[]> {
        const limit = options?.limit || 100;
        const offset = options?.offset || 0;

        const query = `
            query {
                queries(
                    limit: ${limit}
                    offset: ${offset}
                    ${options?.status ? `status: "${options.status}"` : ''}
                ) {
                    id
                    description
                    outcomes
                    strategy
                    minVotes
                    rewardAmount
                    creator
                    createdAt
                    deadline
                    status
                    result
                    resolvedAt
                    voteCount
                    timeRemaining
                }
            }
        `;

        const result = await this.executeQuery<QueriesQueryResponse>(query);
        return result.data?.queries || [];
    }

    /**
     * Get all active queries
     */
    async getActiveQueries(options?: {
        limit?: number;
        offset?: number;
    }): Promise<QueryInfo[]> {
        const limit = options?.limit || 100;
        const offset = options?.offset || 0;

        const query = `
            query {
                activeQueries(limit: ${limit}, offset: ${offset}) {
                    id
                    description
                    outcomes
                    strategy
                    minVotes
                    rewardAmount
                    creator
                    createdAt
                    deadline
                    status
                    result
                    resolvedAt
                    voteCount
                    timeRemaining
                }
            }
        `;

        const result = await this.executeQuery<ActiveQueriesQueryResponse>(query);
        return result.data?.activeQueries || [];
    }

    /**
     * Submit a vote on a query
     */
    async submitVote(params: SubmitVoteParams): Promise<void> {
        if (!this.config.voterAddress) {
            throw new ValidationError('Voter address is required for voting');
        }

        // Validate parameters
        if (!params.value || params.value.trim().length === 0) {
            throw new ValidationError('Vote value is required and cannot be empty');
        }

        if (params.confidence !== undefined) {
            if (params.confidence < 0 || params.confidence > 100) {
                throw new ValidationError('Confidence must be between 0 and 100');
            }
        }

        // Build GraphQL mutation
        const mutation = `
            mutation {
                submitVote(
                    queryId: ${params.queryId}
                    value: ${JSON.stringify(params.value)}
                    ${params.confidence !== undefined ? `confidence: ${params.confidence}` : ''}
                )
            }
        `;

        const result = await this.executeWithRetry<{ submitVote: boolean }>(mutation);

        if (!result.data?.submitVote) {
            throw new NetworkError('Failed to submit vote');
        }
    }

    /**
     * Resolve a query (admin or creator only)
     */
    async resolveQuery(queryId: number): Promise<QueryInfo> {
        const mutation = `
            mutation {
                resolveQuery(queryId: ${queryId}) {
                    id
                    description
                    outcomes
                    strategy
                    minVotes
                    rewardAmount
                    creator
                    createdAt
                    deadline
                    status
                    result
                    resolvedAt
                    voteCount
                    timeRemaining
                }
            }
        `;

        const result = await this.executeWithRetry<{ resolveQuery: QueryInfo }>(mutation);

        if (!result.data?.resolveQuery) {
            throw new NetworkError('Invalid response from query resolution');
        }

        return result.data.resolveQuery;
    }

    /**
     * Claim pending rewards
     */
    async claimRewards(): Promise<string> {
        if (!this.config.voterAddress) {
            throw new ValidationError('Voter address is required for claiming rewards');
        }

        const mutation = `
            mutation {
                claimRewards
            }
        `;

        const result = await this.executeWithRetry<{ claimRewards: string }>(mutation);

        if (!result.data?.claimRewards) {
            throw new NetworkError('Invalid response from claim rewards');
        }

        return result.data.claimRewards;
    }

    /**
     * Update voter stake
     */
    async updateStake(additionalStake: string): Promise<VoterInfo> {
        if (!this.config.voterAddress) {
            throw new ValidationError('Voter address is required for this operation');
        }

        const stake = parseFloat(additionalStake);
        if (isNaN(stake) || stake <= 0) {
            throw new ValidationError('Additional stake must be a positive number');
        }

        const mutation = `
            mutation {
                updateStake(additionalStake: "${additionalStake}") {
                    address
                    stake
                    lockedStake
                    availableStake
                    reputation
                    reputationTier
                    reputationWeight
                    totalVotes
                    correctVotes
                    accuracyPercentage
                    registeredAt
                    isActive
                    name
                    metadataUrl
                }
            }
        `;

        const result = await this.executeWithRetry<{ updateStake: VoterInfo }>(mutation);

        if (!result.data?.updateStake) {
            throw new NetworkError('Invalid response from stake update');
        }

        return result.data.updateStake;
    }

    /**
     * Withdraw stake
     */
    async withdrawStake(amount: string): Promise<VoterInfo> {
        if (!this.config.voterAddress) {
            throw new ValidationError('Voter address is required for this operation');
        }

        const withdrawAmount = parseFloat(amount);
        if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
            throw new ValidationError('Withdraw amount must be a positive number');
        }

        const mutation = `
            mutation {
                withdrawStake(amount: "${amount}") {
                    address
                    stake
                    lockedStake
                    availableStake
                    reputation
                    reputationTier
                    reputationWeight
                    totalVotes
                    correctVotes
                    accuracyPercentage
                    registeredAt
                    isActive
                    name
                    metadataUrl
                }
            }
        `;

        const result = await this.executeWithRetry<{ withdrawStake: VoterInfo }>(mutation);

        if (!result.data?.withdrawStake) {
            throw new NetworkError('Invalid response from stake withdrawal');
        }

        return result.data.withdrawStake;
    }

    /**
     * Deregister as a voter
     */
    async deregisterVoter(): Promise<void> {
        if (!this.config.voterAddress) {
            throw new ValidationError('Voter address is required for this operation');
        }

        const mutation = `
            mutation {
                deregisterVoter
            }
        `;

        const result = await this.executeWithRetry<{ deregisterVoter: boolean }>(mutation);

        if (!result.data?.deregisterVoter) {
            throw new NetworkError('Failed to deregister voter');
        }
    }

    /**
     * Get protocol statistics
     */
    async getStatistics(): Promise<Statistics> {
        const query = `
            query {
                statistics {
                    totalVoters
                    activeVoters
                    totalStake
                    totalLockedStake
                    averageStake
                    totalQueriesCreated
                    totalQueriesResolved
                    activeQueriesCount
                    totalVotesSubmitted
                    averageVotesPerQuery
                    totalRewardsDistributed
                    rewardPoolBalance
                    protocolTreasury
                    averageReputation
                    protocolStatus
                    resolutionRate
                }
            }
        `;

        const result = await this.executeQuery<StatisticsQueryResponse>(query);

        if (!result.data?.statistics) {
            throw new NetworkError('Invalid response from statistics query');
        }

        return result.data.statistics;
    }
}
