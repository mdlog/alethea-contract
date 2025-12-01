# API Reference

Complete API documentation for the Alethea Oracle SDK.

## Table of Contents

- [AletheaOracleClient](#aletheaoracleclient)
- [Types](#types)
- [Errors](#errors)

## AletheaOracleClient

The main client class for interacting with the Alethea Oracle.

### Constructor

```typescript
new AletheaOracleClient(config: OracleConfig)
```

Creates a new instance of the Oracle client.

**Parameters:**
- `config`: Configuration object (see [OracleConfig](#oracleconfig))

**Example:**
```typescript
const client = new AletheaOracleClient({
  registryId: 'registry-app-id',
  chainId: 'my-chain-id',
  endpoint: 'https://node.example.com/graphql',
  retryAttempts: 3,
  retryDelay: 1000,
});
```

### Methods

#### registerMarket()

```typescript
registerMarket(params: RegisterMarketParams): Promise<MarketRegistration>
```

Registers a new market with the oracle for resolution.

**Parameters:**
- `params`: Market registration parameters (see [RegisterMarketParams](#registermarketparams))

**Returns:** Promise<[MarketRegistration](#marketregistration)>

**Throws:**
- [ValidationError](#validationerror): If parameters are invalid
- [NetworkError](#networkerror): If network request fails
- [InsufficientFeeError](#insufficientfeeerror): If registration fee is too low

**Example:**
```typescript
const registration = await client.registerMarket({
  question: 'Will it rain tomorrow?',
  outcomes: ['Yes', 'No'],
  deadline: String(Date.now() * 1000 + 86400000000),
  callbackChainId: 'callback-chain',
  callbackApplicationId: 'callback-app',
  callbackMethod: 'handleResolution',
  fee: '100',
});

console.log('Market ID:', registration.marketId);
```

#### getMarketStatus()

```typescript
getMarketStatus(marketId: number): Promise<MarketStatus>
```

Retrieves the current status of a market.

**Parameters:**
- `marketId`: The ID of the market to query

**Returns:** Promise<[MarketStatus](#marketstatus)>

**Throws:**
- [MarketNotFoundError](#marketnotfounderror): If market doesn't exist
- [NetworkError](#networkerror): If network request fails

**Example:**
```typescript
const status = await client.getMarketStatus(123);

console.log('Status:', status.status);
console.log('Final outcome:', status.finalOutcome);
```

#### subscribeToResolution()

```typescript
subscribeToResolution(
  marketId: number,
  callback: ResolutionCallback,
  options?: SubscriptionOptions
): Promise<Unsubscribe>
```

Subscribes to resolution updates for a market. Polls the market status at regular intervals and calls the callback when resolved.

**Parameters:**
- `marketId`: The ID of the market to monitor
- `callback`: Function to call when market is resolved or on error (see [ResolutionCallback](#resolutioncallback))
- `options`: Optional subscription configuration (see [SubscriptionOptions](#subscriptionoptions))

**Returns:** Promise<[Unsubscribe](#unsubscribe)> - Function to stop polling

**Example:**
```typescript
const unsubscribe = await client.subscribeToResolution(
  123,
  (resolution, error) => {
    if (error) {
      console.error('Error:', error);
      return;
    }
    console.log('Resolved:', resolution);
  },
  {
    pollInterval: 5000,
    timeout: 86400000,
  }
);

// Later, to stop polling
unsubscribe();
```

## Types

### OracleConfig

Configuration for the Oracle client.

```typescript
interface OracleConfig {
  registryId: string;        // Registry application ID (required)
  chainId: string;           // Your chain ID (required)
  endpoint?: string;         // GraphQL endpoint (optional)
  retryAttempts?: number;    // Retry attempts (optional, default: 3)
  retryDelay?: number;       // Retry delay in ms (optional, default: 1000)
}
```

### RegisterMarketParams

Parameters for registering a market.

```typescript
interface RegisterMarketParams {
  question: string;              // Market question (required)
  outcomes: string[];            // Array of outcomes, 2-10 items (required)
  deadline: string;              // Deadline in microseconds (required)
  callbackChainId: string;       // Chain ID for callback (required)
  callbackApplicationId: string; // Application ID for callback (required)
  callbackMethod: string;        // Method name for callback (required)
  fee: string;                   // Registration fee as string (required)
}
```

**Validation Rules:**
- `question`: Must be non-empty string
- `outcomes`: Must have 2-10 items
- `deadline`: Must be in the future (microseconds since epoch)
- `fee`: Must be valid amount string

### MarketRegistration

Result of market registration.

```typescript
interface MarketRegistration {
  marketId: number;              // Assigned market ID
  registeredAt: Date;            // Registration timestamp
  estimatedResolution: Date;     // Estimated resolution time
}
```

### MarketStatus

Current status of a market.

```typescript
interface MarketStatus {
  id: number;                    // Market ID
  status: string;                // Status: 'ACTIVE', 'VOTING', 'RESOLVED'
  finalOutcome?: number;         // Winning outcome index (if resolved)
  callbackStatus: string;        // Callback status
  resolvedAt?: string;           // Resolution timestamp (if resolved)
  confidence?: number;           // Confidence percentage (if resolved)
}
```

### Resolution

Resolution data passed to subscription callback.

```typescript
interface Resolution {
  marketId: number;              // Market ID
  outcome: number;               // Winning outcome index
  resolvedAt: string;            // Resolution timestamp
  confidence?: number;           // Confidence percentage
}
```

### ResolutionCallback

Callback function for resolution subscriptions.

```typescript
type ResolutionCallback = (
  resolution: Resolution | null,
  error: Error | null
) => void;
```

**Parameters:**
- `resolution`: Resolution data (null if error occurred)
- `error`: Error object (null if successful)

### SubscriptionOptions

Options for resolution subscriptions.

```typescript
interface SubscriptionOptions {
  pollInterval?: number;         // Polling interval in ms (default: 5000)
  timeout?: number;              // Timeout in ms (default: 86400000 = 24h)
}
```

### Unsubscribe

Function to stop a subscription.

```typescript
type Unsubscribe = () => void;
```

## Errors

All errors extend the base `OracleError` class.

### OracleError

Base error class for all SDK errors.

```typescript
class OracleError extends Error {
  code: string;                  // Error code
  message: string;               // Error message
  cause?: any;                   // Original error (if any)
}
```

### ValidationError

Thrown when input parameters are invalid.

```typescript
class ValidationError extends OracleError {
  code: 'VALIDATION_ERROR'
}
```

**Common causes:**
- Empty question
- Less than 2 outcomes
- More than 10 outcomes
- Deadline in the past

**Example:**
```typescript
try {
  await client.registerMarket({
    question: '',  // Invalid: empty
    outcomes: ['Yes'],  // Invalid: only 1 outcome
    // ...
  });
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Invalid input:', error.message);
  }
}
```

### NetworkError

Thrown when network requests fail.

```typescript
class NetworkError extends OracleError {
  code: 'NETWORK_ERROR'
}
```

**Common causes:**
- Network connectivity issues
- Invalid endpoint
- Server errors
- Timeout

### MarketNotFoundError

Thrown when querying a non-existent market.

```typescript
class MarketNotFoundError extends OracleError {
  code: 'MARKET_NOT_FOUND'
}
```

### InsufficientFeeError

Thrown when registration fee is too low.

```typescript
class InsufficientFeeError extends OracleError {
  code: 'INSUFFICIENT_FEE'
  required: string;              // Required fee amount
  provided: string;              // Provided fee amount
}
```

**Example:**
```typescript
try {
  await client.registerMarket({
    // ...
    fee: '10',  // Too low
  });
} catch (error) {
  if (error instanceof InsufficientFeeError) {
    console.error(`Fee too low. Required: ${error.required}, Provided: ${error.provided}`);
  }
}
```

### MaxRetriesExceededError

Thrown when all retry attempts fail.

```typescript
class MaxRetriesExceededError extends OracleError {
  code: 'MAX_RETRIES_EXCEEDED'
}
```

### SubscriptionTimeoutError

Thrown when subscription times out waiting for resolution.

```typescript
class SubscriptionTimeoutError extends OracleError {
  code: 'SUBSCRIPTION_TIMEOUT'
}
```

## GraphQL Queries

The SDK uses GraphQL under the hood. Here are the queries it makes:

### Register Market Mutation

```graphql
mutation {
  registerExternalMarket(input: {
    question: "..."
    outcomes: ["...", "..."]
    deadline: "..."
    callbackChainId: "..."
    callbackApplicationId: "..."
    callbackMethod: "..."
    fee: "..."
  })
}
```

### Get Market Status Query

```graphql
query {
  market(id: 123) {
    id
    status
    finalOutcome
    callbackStatus
    resolvedAt
  }
}
```

## Rate Limiting

The SDK implements automatic retry with exponential backoff. Default configuration:
- Max retries: 3
- Base delay: 1000ms
- Delay calculation: `baseDelay * attemptNumber`

Example delays: 1s, 2s, 3s

## Best Practices

1. **Always handle errors**: Wrap SDK calls in try-catch blocks
2. **Use environment variables**: Store sensitive configuration
3. **Unsubscribe when done**: Call the unsubscribe function to prevent memory leaks
4. **Set appropriate timeouts**: Adjust based on your market's deadline
5. **Validate inputs**: Check parameters before calling SDK methods

## See Also

- [Getting Started Guide](./getting-started.md)
- [Examples](./examples.md)
- [Error Handling](./error-handling.md)
- [Best Practices](./best-practices.md)


---

## Account-Based Registry Methods

The following methods are available for the account-based registry (oracle-registry-v2).

### registerVoter()

```typescript
registerVoter(params: RegisterVoterParams): Promise<VoterInfo>
```

Register as a voter in the account-based registry.

**Parameters:**
- `stake`: Stake amount in tokens (required)
- `name`: Optional voter name
- `metadataUrl`: Optional metadata URL

**Returns:** Promise<[VoterInfo](#voterinfo)>

**Example:**
```typescript
const voterInfo = await client.registerVoter({
    stake: '1000',
    name: 'Alice',
});
```

### getVoter()

```typescript
getVoter(address?: string): Promise<VoterInfo | null>
```

Get voter information by address.

**Parameters:**
- `address`: Voter address (optional, uses config.voterAddress if not provided)

**Returns:** Promise<[VoterInfo](#voterinfo) | null>

**Example:**
```typescript
const voter = await client.getVoter('0xabc...');
```

### getMyVoterInfo()

```typescript
getMyVoterInfo(): Promise<VoterInfo | null>
```

Get current user's voter information (convenience method).

**Returns:** Promise<[VoterInfo](#voterinfo) | null>

**Example:**
```typescript
const myInfo = await client.getMyVoterInfo();
console.log(`Reputation: ${myInfo.reputation}`);
```

### getVoters()

```typescript
getVoters(options?: {
    limit?: number;
    offset?: number;
    activeOnly?: boolean;
}): Promise<VoterInfo[]>
```

Get all registered voters with pagination.

**Parameters:**
- `limit`: Maximum number of voters to return (default: 100, max: 1000)
- `offset`: Number of voters to skip (default: 0)
- `activeOnly`: Filter to return only active voters (default: false)

**Returns:** Promise<[VoterInfo](#voterinfo)[]>

**Example:**
```typescript
const topVoters = await client.getVoters({
    limit: 10,
    activeOnly: true,
});
```

### createQuery()

```typescript
createQuery(params: CreateQueryParams): Promise<QueryInfo>
```

Create a new query.

**Parameters:**
- `description`: Query description (required)
- `outcomes`: Array of possible outcomes (2-10 items, required)
- `strategy`: Decision strategy ('Majority', 'Median', 'WeightedByStake', 'WeightedByReputation')
- `rewardAmount`: Reward amount for correct voters in tokens (required)
- `minVotes`: Minimum votes required (optional, uses protocol default)
- `deadline`: Resolution deadline in microseconds (optional, uses protocol default)

**Returns:** Promise<[QueryInfo](#queryinfo)>

**Example:**
```typescript
const query = await client.createQuery({
    description: 'Will BTC reach $100k by end of 2025?',
    outcomes: ['Yes', 'No'],
    strategy: 'Majority',
    minVotes: 5,
    rewardAmount: '1000',
});
```

### getQuery()

```typescript
getQuery(queryId: number): Promise<QueryInfo | null>
```

Get query information by ID.

**Parameters:**
- `queryId`: The query ID

**Returns:** Promise<[QueryInfo](#queryinfo) | null>

**Example:**
```typescript
const query = await client.getQuery(1);
```

### getQueries()

```typescript
getQueries(options?: {
    limit?: number;
    offset?: number;
    status?: 'Active' | 'Resolved' | 'Expired' | 'Cancelled';
}): Promise<QueryInfo[]>
```

Get all queries with optional filtering.

**Parameters:**
- `limit`: Maximum number of queries to return (default: 100, max: 1000)
- `offset`: Number of queries to skip (default: 0)
- `status`: Filter by status (optional)

**Returns:** Promise<[QueryInfo](#queryinfo)[]>

**Example:**
```typescript
const activeQueries = await client.getQueries({
    status: 'Active',
    limit: 20,
});
```

### getActiveQueries()

```typescript
getActiveQueries(options?: {
    limit?: number;
    offset?: number;
}): Promise<QueryInfo[]>
```

Get all active queries (convenience method).

**Parameters:**
- `limit`: Maximum number of queries to return (default: 100, max: 1000)
- `offset`: Number of queries to skip (default: 0)

**Returns:** Promise<[QueryInfo](#queryinfo)[]>

**Example:**
```typescript
const activeQueries = await client.getActiveQueries({ limit: 10 });
```

### submitVote()

```typescript
submitVote(params: SubmitVoteParams): Promise<void>
```

Submit a vote on a query.

**Parameters:**
- `queryId`: Query ID to vote on (required)
- `value`: Vote value/outcome (required)
- `confidence`: Optional confidence score (0-100)

**Returns:** Promise<void>

**Example:**
```typescript
await client.submitVote({
    queryId: 1,
    value: 'Yes',
    confidence: 90,
});
```

### resolveQuery()

```typescript
resolveQuery(queryId: number): Promise<QueryInfo>
```

Resolve a query (admin or creator only).

**Parameters:**
- `queryId`: The query ID to resolve

**Returns:** Promise<[QueryInfo](#queryinfo)>

**Example:**
```typescript
const resolved = await client.resolveQuery(1);
console.log(`Result: ${resolved.result}`);
```

### getMyPendingRewards()

```typescript
getMyPendingRewards(): Promise<string>
```

Get pending rewards for current voter.

**Returns:** Promise<string> - Reward amount as string

**Example:**
```typescript
const pending = await client.getMyPendingRewards();
console.log(`Pending: ${pending} tokens`);
```

### claimRewards()

```typescript
claimRewards(): Promise<string>
```

Claim pending rewards.

**Returns:** Promise<string> - Claimed amount as string

**Example:**
```typescript
const claimed = await client.claimRewards();
console.log(`Claimed: ${claimed} tokens`);
```

### updateStake()

```typescript
updateStake(additionalStake: string): Promise<VoterInfo>
```

Add additional stake to your voter account.

**Parameters:**
- `additionalStake`: Amount to add in tokens

**Returns:** Promise<[VoterInfo](#voterinfo)>

**Example:**
```typescript
const updated = await client.updateStake('500');
console.log(`New stake: ${updated.stake}`);
```

### withdrawStake()

```typescript
withdrawStake(amount: string): Promise<VoterInfo>
```

Withdraw stake from your voter account.

**Parameters:**
- `amount`: Amount to withdraw in tokens

**Returns:** Promise<[VoterInfo](#voterinfo)>

**Example:**
```typescript
const updated = await client.withdrawStake('200');
console.log(`Remaining stake: ${updated.stake}`);
```

### deregisterVoter()

```typescript
deregisterVoter(): Promise<void>
```

Deregister as a voter.

**Returns:** Promise<void>

**Example:**
```typescript
await client.deregisterVoter();
```

### getStatistics()

```typescript
getStatistics(): Promise<Statistics>
```

Get protocol-wide statistics.

**Returns:** Promise<[Statistics](#statistics)>

**Example:**
```typescript
const stats = await client.getStatistics();
console.log(`Total Voters: ${stats.totalVoters}`);
console.log(`Active Queries: ${stats.activeQueriesCount}`);
```

---

## Account-Based Registry Types

### VoterInfo

```typescript
interface VoterInfo {
    address: string;
    stake: string;
    lockedStake: string;
    availableStake: string;
    reputation: number;
    reputationTier: string;
    reputationWeight: number;
    totalVotes: number;
    correctVotes: number;
    accuracyPercentage: number;
    registeredAt: string;
    isActive: boolean;
    name?: string;
    metadataUrl?: string;
}
```

### QueryInfo

```typescript
interface QueryInfo {
    id: number;
    description: string;
    outcomes: string[];
    strategy: 'Majority' | 'Median' | 'WeightedByStake' | 'WeightedByReputation';
    minVotes: number;
    rewardAmount: string;
    creator: string;
    createdAt: string;
    deadline: string;
    status: 'Active' | 'Resolved' | 'Expired' | 'Cancelled';
    result?: string;
    resolvedAt?: string;
    voteCount: number;
    timeRemaining: number;
}
```

### Statistics

```typescript
interface Statistics {
    totalVoters: number;
    activeVoters: number;
    totalStake: string;
    totalLockedStake: string;
    averageStake: string;
    totalQueriesCreated: number;
    totalQueriesResolved: number;
    activeQueriesCount: number;
    totalVotesSubmitted: number;
    averageVotesPerQuery: number;
    totalRewardsDistributed: string;
    rewardPoolBalance: string;
    protocolTreasury: string;
    averageReputation: number;
    protocolStatus: string;
    resolutionRate: number;
}
```

### RegisterVoterParams

```typescript
interface RegisterVoterParams {
    stake: string;
    name?: string;
    metadataUrl?: string;
}
```

### CreateQueryParams

```typescript
interface CreateQueryParams {
    description: string;
    outcomes: string[];
    strategy: 'Majority' | 'Median' | 'WeightedByStake' | 'WeightedByReputation';
    minVotes?: number;
    rewardAmount: string;
    deadline?: string;
}
```

### SubmitVoteParams

```typescript
interface SubmitVoteParams {
    queryId: number;
    value: string;
    confidence?: number;
}
```
