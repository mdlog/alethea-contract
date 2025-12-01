/**
 * Example: Account-Based Voter
 * 
 * This example demonstrates how to use the Alethea Oracle SDK
 * with the account-based registry to:
 * 1. Register as a voter
 * 2. Browse and vote on queries
 * 3. Track reputation and rewards
 * 4. Claim rewards
 */

import { AletheaOracleClient } from '../src';

async function main() {
    // Initialize the client with your voter address
    const client = new AletheaOracleClient({
        registryId: 'your-registry-app-id',
        chainId: 'your-chain-id',
        voterAddress: '0xYourAccountAddress',
        endpoint: 'http://localhost:8080/graphql', // Optional
    });

    console.log('=== Alethea Oracle - Account-Based Voter Example ===\n');

    // Step 1: Register as a voter
    console.log('Step 1: Registering as a voter...');
    try {
        const voterInfo = await client.registerVoter({
            stake: '1000', // Stake 1000 tokens
            name: 'Alice the Oracle', // Optional
        });

        console.log('✅ Successfully registered!');
        console.log(`   Address: ${voterInfo.address}`);
        console.log(`   Stake: ${voterInfo.stake} tokens`);
        console.log(`   Reputation: ${voterInfo.reputation}/100 (${voterInfo.reputationTier})`);
        console.log(`   Reputation Weight: ${voterInfo.reputationWeight}x`);
        console.log();
    } catch (error) {
        console.log('ℹ️  Already registered or error:', error.message);
        console.log();
    }

    // Step 2: Check your voter info
    console.log('Step 2: Checking voter information...');
    const myInfo = await client.getMyVoterInfo();
    if (myInfo) {
        console.log('✅ Voter Info:');
        console.log(`   Total Votes: ${myInfo.totalVotes}`);
        console.log(`   Correct Votes: ${myInfo.correctVotes}`);
        console.log(`   Accuracy: ${myInfo.accuracyPercentage.toFixed(2)}%`);
        console.log(`   Available Stake: ${myInfo.availableStake} tokens`);
        console.log(`   Locked Stake: ${myInfo.lockedStake} tokens`);
        console.log();
    }

    // Step 3: Browse active queries
    console.log('Step 3: Browsing active queries...');
    const activeQueries = await client.getActiveQueries({ limit: 5 });
    console.log(`✅ Found ${activeQueries.length} active queries:\n`);

    for (const query of activeQueries) {
        console.log(`   Query #${query.id}: ${query.description}`);
        console.log(`   Outcomes: ${query.outcomes.join(', ')}`);
        console.log(`   Strategy: ${query.strategy}`);
        console.log(`   Reward: ${query.rewardAmount} tokens`);
        console.log(`   Votes: ${query.voteCount}/${query.minVotes} required`);
        console.log(`   Time Remaining: ${Math.floor(query.timeRemaining / 60)} minutes`);
        console.log();
    }

    // Step 4: Submit a vote
    if (activeQueries.length > 0) {
        const queryToVote = activeQueries[0];
        console.log(`Step 4: Voting on Query #${queryToVote.id}...`);

        try {
            await client.submitVote({
                queryId: queryToVote.id,
                value: queryToVote.outcomes[0], // Vote for first outcome
                confidence: 85, // 85% confidence
            });

            console.log('✅ Vote submitted successfully!');
            console.log(`   Query: ${queryToVote.description}`);
            console.log(`   Your Vote: ${queryToVote.outcomes[0]}`);
            console.log(`   Confidence: 85%`);
            console.log();
        } catch (error) {
            console.log('ℹ️  Could not vote:', error.message);
            console.log();
        }
    }

    // Step 5: Check pending rewards
    console.log('Step 5: Checking pending rewards...');
    const pendingRewards = await client.getMyPendingRewards();
    console.log(`✅ Pending Rewards: ${pendingRewards} tokens`);
    console.log();

    // Step 6: Claim rewards if available
    if (parseFloat(pendingRewards) > 0) {
        console.log('Step 6: Claiming rewards...');
        try {
            const claimedAmount = await client.claimRewards();
            console.log(`✅ Successfully claimed ${claimedAmount} tokens!`);
            console.log();
        } catch (error) {
            console.log('ℹ️  Could not claim rewards:', error.message);
            console.log();
        }
    }

    // Step 7: View protocol statistics
    console.log('Step 7: Viewing protocol statistics...');
    const stats = await client.getStatistics();
    console.log('✅ Protocol Statistics:');
    console.log(`   Total Voters: ${stats.totalVoters}`);
    console.log(`   Active Voters: ${stats.activeVoters}`);
    console.log(`   Total Stake: ${stats.totalStake} tokens`);
    console.log(`   Active Queries: ${stats.activeQueriesCount}`);
    console.log(`   Total Queries Created: ${stats.totalQueriesCreated}`);
    console.log(`   Total Queries Resolved: ${stats.totalQueriesResolved}`);
    console.log(`   Resolution Rate: ${stats.resolutionRate.toFixed(2)}%`);
    console.log(`   Average Reputation: ${stats.averageReputation.toFixed(2)}`);
    console.log(`   Protocol Status: ${stats.protocolStatus}`);
    console.log();

    // Step 8: View top voters (leaderboard)
    console.log('Step 8: Viewing top voters...');
    const topVoters = await client.getVoters({
        limit: 5,
        activeOnly: true,
    });

    console.log('✅ Top 5 Active Voters:\n');
    topVoters
        .sort((a, b) => b.reputation - a.reputation)
        .forEach((voter, index) => {
            console.log(`   ${index + 1}. ${voter.name || voter.address.substring(0, 10) + '...'}`);
            console.log(`      Reputation: ${voter.reputation}/100 (${voter.reputationTier})`);
            console.log(`      Accuracy: ${voter.accuracyPercentage.toFixed(2)}%`);
            console.log(`      Total Votes: ${voter.totalVotes}`);
            console.log(`      Stake: ${voter.stake} tokens`);
            console.log();
        });

    console.log('=== Example Complete ===');
}

// Run the example
main().catch(console.error);
