/**
 * Example: Query Creator
 * 
 * This example demonstrates how to use the Alethea Oracle SDK
 * to create and manage queries in the account-based registry:
 * 1. Create queries with different strategies
 * 2. Monitor query progress
 * 3. Resolve queries when ready
 */

import { AletheaOracleClient } from '../src';

async function main() {
    // Initialize the client
    const client = new AletheaOracleClient({
        registryId: 'your-registry-app-id',
        chainId: 'your-chain-id',
        voterAddress: '0xYourAccountAddress',
        endpoint: 'http://localhost:8080/graphql',
    });

    console.log('=== Alethea Oracle - Query Creator Example ===\n');

    // Example 1: Create a simple majority vote query
    console.log('Example 1: Creating a majority vote query...');
    const majorityQuery = await client.createQuery({
        description: 'Will Bitcoin reach $100,000 by end of 2025?',
        outcomes: ['Yes', 'No'],
        strategy: 'Majority',
        minVotes: 5,
        rewardAmount: '1000',
        deadline: String(Date.now() * 1000 + 86400000000), // 24 hours from now
    });

    console.log('✅ Majority query created!');
    console.log(`   Query ID: ${majorityQuery.id}`);
    console.log(`   Strategy: ${majorityQuery.strategy}`);
    console.log(`   Min Votes: ${majorityQuery.minVotes}`);
    console.log(`   Reward: ${majorityQuery.rewardAmount} tokens`);
    console.log();

    // Example 2: Create a median query for numeric data
    console.log('Example 2: Creating a median query for price prediction...');
    const medianQuery = await client.createQuery({
        description: 'What will be the ETH price in USD on December 31, 2025?',
        outcomes: ['$2000-$3000', '$3000-$4000', '$4000-$5000', '$5000+'],
        strategy: 'Median',
        minVotes: 7,
        rewardAmount: '2000',
        deadline: String(Date.now() * 1000 + 172800000000), // 48 hours from now
    });

    console.log('✅ Median query created!');
    console.log(`   Query ID: ${medianQuery.id}`);
    console.log(`   Strategy: ${medianQuery.strategy}`);
    console.log(`   Outcomes: ${medianQuery.outcomes.length} price ranges`);
    console.log();

    // Example 3: Create a reputation-weighted query
    console.log('Example 3: Creating a reputation-weighted query...');
    const reputationQuery = await client.createQuery({
        description: 'Will the next major AI breakthrough come from OpenAI, Google, or another company?',
        outcomes: ['OpenAI', 'Google', 'Meta', 'Anthropic', 'Other'],
        strategy: 'WeightedByReputation',
        minVotes: 10,
        rewardAmount: '5000',
        deadline: String(Date.now() * 1000 + 604800000000), // 7 days from now
    });

    console.log('✅ Reputation-weighted query created!');
    console.log(`   Query ID: ${reputationQuery.id}`);
    console.log(`   Strategy: ${reputationQuery.strategy}`);
    console.log(`   This query gives more weight to voters with higher reputation`);
    console.log();

    // Example 4: Create a stake-weighted query
    console.log('Example 4: Creating a stake-weighted query...');
    const stakeQuery = await client.createQuery({
        description: 'Which blockchain will have the highest TVL in 2026?',
        outcomes: ['Ethereum', 'Solana', 'Cardano', 'Polkadot', 'Other'],
        strategy: 'WeightedByStake',
        minVotes: 8,
        rewardAmount: '3000',
    });

    console.log('✅ Stake-weighted query created!');
    console.log(`   Query ID: ${stakeQuery.id}`);
    console.log(`   Strategy: ${stakeQuery.strategy}`);
    console.log(`   This query gives more weight to voters with higher stake`);
    console.log();

    // Monitor query progress
    console.log('Monitoring query progress...\n');

    const queriesToMonitor = [majorityQuery.id, medianQuery.id, reputationQuery.id, stakeQuery.id];

    for (const queryId of queriesToMonitor) {
        const query = await client.getQuery(queryId);
        if (query) {
            console.log(`Query #${query.id}: ${query.description}`);
            console.log(`   Status: ${query.status}`);
            console.log(`   Votes: ${query.voteCount}/${query.minVotes} required`);
            console.log(`   Time Remaining: ${Math.floor(query.timeRemaining / 3600)} hours`);

            // Check if query is ready to resolve
            if (query.voteCount >= query.minVotes && query.status === 'Active') {
                console.log(`   ✅ Ready to resolve!`);
            } else if (query.status === 'Active') {
                console.log(`   ⏳ Waiting for ${query.minVotes - query.voteCount} more votes`);
            }
            console.log();
        }
    }

    // Example: Resolve a query (if ready)
    console.log('Checking if any queries can be resolved...');
    const activeQueries = await client.getActiveQueries();

    for (const query of activeQueries) {
        if (query.voteCount >= query.minVotes) {
            console.log(`\nQuery #${query.id} is ready to resolve!`);
            console.log(`   Description: ${query.description}`);
            console.log(`   Votes received: ${query.voteCount}`);

            try {
                const resolvedQuery = await client.resolveQuery(query.id);
                console.log(`✅ Query resolved!`);
                console.log(`   Result: ${resolvedQuery.result}`);
                console.log(`   Resolved at: ${resolvedQuery.resolvedAt}`);
            } catch (error) {
                console.log(`ℹ️  Could not resolve: ${error.message}`);
            }
        }
    }

    // View all queries with different filters
    console.log('\n=== Query Filtering Examples ===\n');

    // Get only active queries
    const active = await client.getQueries({ status: 'Active', limit: 5 });
    console.log(`Active queries: ${active.length}`);

    // Get resolved queries
    const resolved = await client.getQueries({ status: 'Resolved', limit: 5 });
    console.log(`Resolved queries: ${resolved.length}`);

    // Get all queries with pagination
    const allQueries = await client.getQueries({ limit: 10, offset: 0 });
    console.log(`Total queries (first page): ${allQueries.length}`);

    console.log('\n=== Example Complete ===');
}

// Run the example
main().catch(console.error);
