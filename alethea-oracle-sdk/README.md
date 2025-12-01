# Alethea Oracle SDK

TypeScript SDK for integrating with Alethea Oracle Network - a decentralized oracle service for prediction markets and external dApps.

**Version 1.0.0** now supports both:
- **Account-Based Registry** (Recommended) - Simplified voter registration and voting
- **Legacy Market-Based Registry** - For backward compatibility

## Installation

```bash
npm install alethea-network-oracle-sdk@beta
```

## Quick Start

### Account-Based Registry (Recommended)

The account-based registry provides a simplified, more efficient way to participate in the oracle network. Voters register with their account address and can immediately start voting on queries.

```typescript
import { AletheaOracleClient } from 'alethea-network-oracle-sdk';

// Initialize the client with voter address
const client = new AletheaOracleClient({
  registryId: 'your-registry-application-id',
  chainId: 'your-chain-id',
  voterAddress: '0xYourAccountAddress', // Your account address
  endpoint: 'https://your-linera-node.com/graphql', // optional
});

// Register as a voter
const voterInfo = await client.registerVoter({
  stake: '1000', // Stake amount in tokens
  name: 'Alice', // Optional
});

console.log(`Registered with reputation: ${voterInfo.reputation}`);
console.log(`Reputation tier: ${voterInfo.reputationTier}`);

// Get active queries to vote on
const activeQueries = await client.getActiveQueries({ limit: 10 });
console.log(`Found ${activeQueries.length} active queries`);

// Submit a vote
await client.submitVote({
  queryId: activeQueries[0].id,
  value: 'Yes', // Your vote
  confidence: 90, // Optional confidence score (0-100)
});

console.log('Vote submitted successfully!');

// Check your voter info and pending rewards
const myInfo = await client.getMyVoterInfo();
console.log(`Total votes: ${myInfo.totalVotes}`);
console.log(`Accuracy: ${myInfo.accuracyPercentage.toFixed(2)}%`);

const pendingRewards = await client.getMyPendingRewards();
console.log(`Pending rewards: ${pendingRewards} tokens`);

// Claim rewards when available
if (parseFloat(pendingRewards) > 0) {
  const claimedAmount = await client.claimRewards();
  console.log(`Claimed ${claimedAmount} tokens`);
}
```

### Legacy Market-Based Registry

For backward compatibility with the application-based registry:

```typescript
import { AletheaOracleClient } from 'alethea-network-oracle-sdk';

// Initialize the client
const client = new AletheaOracleClient({
  registryId: 'your-registry-application-id',
  chainId: 'your-chain-id',
  endpoint: 'https://your-linera-node.com/graphql', // optional
});

// Register a market
const registration = await client.registerMarket({
  question: 'Will it rain tomorrow?',
  outcomes: ['Yes', 'No'],
  deadline: String(Date.now() * 1000 + 86400000000), // 24 hours from now in microseconds
  callbackChainId: 'your-callback-chain-id',
  callbackApplicationId: 'your-callback-app-id',
  callbackMethod: 'handleResolution',
  fee: '100', // Registration fee in tokens
});

console.log('Market registered with ID:', registration.marketId);

// Subscribe to resolution updates
const unsubscribe = await client.subscribeToResolution(
  registration.marketId,
  (resolution, error) => {
    if (error) {
      console.error('Subscription error:', error);
      return;
    }
    
    console.log('Market resolved!');
    console.log('Winning outcome:', resolution.outcome);
    console.log('Confidence:', resolution.confidence);
  },
  {
    pollInterval: 5000, // Poll every 5 seconds
    timeout: 86400000, // Timeout after 24 hours
  }
);

// Later, to stop polling
unsubscribe();
```

## Configuration

### OracleConfig

```typescript
interface OracleConfig {
  registryId: string;        // Registry application ID
  chainId: string;           // Your chain ID
  endpoint?: string;         // GraphQL endpoint (optional, auto-generated if not provided)
  retryAttempts?: number;    // Number of retry attempts (default: 3)
  retryDelay?: number;       // Delay between retries in ms (default: 1000)
  voterAddress?: string;     // Voter address (required for account-based operations)
}
```

## API Reference

### Account-Based Registry Methods

#### registerVoter(params: RegisterVoterParams): Promise<VoterInfo>

Register as a voter in the account-based registry.

**Parameters:**
- `stake`: Stake amount in tokens (required)
- `name`: Optional voter name
- `metadataUrl`: Optional metadata URL

**Returns:** Promise resolving to VoterInfo

#### getVoter(address?: string): Promise<VoterInfo | null>

Get voter information by address.

**Parameters:**
- `address`: Voter address (optional, uses config.voterAddress if not provided)

**Returns:** Promise resolving to VoterInfo or null if not found

#### getMyVoterInfo(): Promise<VoterInfo | null>

Get current user's voter information (convenience method).

**Returns:** Promise resolving to VoterInfo or null

#### createQuery(params: CreateQueryParams): Promise<QueryInfo>

Create a new query.

**Parameters:**
- `description`: Query description (required)
- `outcomes`: Array of possible outcomes (2-10 items, required)
- `strategy`: Decision strategy ('Majority', 'Median', 'WeightedByStake', 'WeightedByReputation')
- `rewardAmount`: Reward amount for correct voters in tokens (required)
- `minVotes`: Minimum votes required (optional, uses protocol default)
- `deadline`: Resolution deadline in microseconds (optional, uses protocol default)

**Returns:** Promise resolving to QueryInfo

#### submitVote(params: SubmitVoteParams): Promise<void>

Submit a vote on a query.

**Parameters:**
- `queryId`: Query ID to vote on (required)
- `value`: Vote value/outcome (required)
- `confidence`: Optional confidence score (0-100)

**Returns:** Promise resolving when vote is submitted

#### getQuery(queryId: number): Promise<QueryInfo | null>

Get query information by ID.

**Parameters:**
- `queryId`: The query ID

**Returns:** Promise resolving to QueryInfo or null

#### getActiveQueries(options?): Promise<QueryInfo[]>

Get all active queries.

**Parameters:**
- `limit`: Maximum number of queries to return (default: 100)
- `offset`: Number of queries to skip (default: 0)

**Returns:** Promise resolving to array of QueryInfo

#### claimRewards(): Promise<string>

Claim pending rewards.

**Returns:** Promise resolving to claimed amount as string

#### updateStake(additionalStake: string): Promise<VoterInfo>

Add additional stake to your voter account.

**Parameters:**
- `additionalStake`: Amount to add in tokens

**Returns:** Promise resolving to updated VoterInfo

#### withdrawStake(amount: string): Promise<VoterInfo>

Withdraw stake from your voter account.

**Parameters:**
- `amount`: Amount to withdraw in tokens

**Returns:** Promise resolving to updated VoterInfo

#### getStatistics(): Promise<Statistics>

Get protocol-wide statistics.

**Returns:** Promise resolving to Statistics

### Legacy Market-Based Registry Methods

#### registerMarket(params: RegisterMarketParams): Promise<MarketRegistration>

Register a new market with the oracle.

**Parameters:**
- `question`: The market question (required)
- `outcomes`: Array of possible outcomes (2-10 items)
- `deadline`: Resolution deadline in microseconds
- `callbackChainId`: Chain ID for callback
- `callbackApplicationId`: Application ID for callback
- `callbackMethod`: Method name to call on resolution
- `fee`: Registration fee as string

**Returns:** Promise resolving to MarketRegistration with marketId

### getMarketStatus(marketId: number): Promise<MarketStatus>

Get the current status of a market.

**Parameters:**
- `marketId`: The market ID

**Returns:** Promise resolving to MarketStatus

### subscribeToResolution(marketId, callback, options?): Promise<Unsubscribe>

Subscribe to market resolution updates.

**Parameters:**
- `marketId`: The market ID to monitor
- `callback`: Function called when market is resolved or on error
- `options`: Optional subscription configuration

**Returns:** Promise resolving to unsubscribe function

## Error Handling

The SDK provides typed errors for different failure scenarios:

```typescript
import { 
  ValidationError, 
  NetworkError, 
  MarketNotFoundError,
  InsufficientFeeError 
} from 'alethea-network-oracle-sdk';

try {
  await client.registerMarket(params);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Invalid parameters:', error.message);
  } else if (error instanceof NetworkError) {
    console.error('Network issue:', error.message);
  } else if (error instanceof InsufficientFeeError) {
    console.error('Fee too low:', error.required, 'required');
  }
}
```

## Examples

See the [examples directory](./examples) for complete integration examples.

## License

MIT
