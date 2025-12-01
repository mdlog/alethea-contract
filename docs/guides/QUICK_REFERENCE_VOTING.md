# 🎯 Quick Reference - Commit-Reveal Voting

## 📋 Cheat Sheet

### User Flow
```
Login → Register → Commit Vote → Wait → Reveal Vote → Get Rewards
```

### Code Flow
```typescript
// 1. COMMIT
handleCommitVote(queryId, answer)
  → Generate salt
  → Create SHA-256 hash
  → commitVote({ queryId, commitHash })
  → Store salt in localStorage

// 2. REVEAL
handleRevealVote(queryId)
  → Get salt from localStorage
  → revealVote({ queryId, value, salt })
  → Blockchain verifies hash
  → Clean localStorage
```

## 🔑 Key Functions

### Frontend (app/page.tsx)

```typescript
// Commit vote
const handleCommitVote = async (queryId: number, answer: string) => {
  const salt = generateRandomSalt();
  const commitHash = await createHash(answer + salt);
  await commitVote({ queryId, commitHash });
  localStorage.setItem(`vote_salt_${queryId}`, salt);
}

// Reveal vote
const handleRevealVote = async (queryId: number) => {
  const salt = localStorage.getItem(`vote_salt_${queryId}`);
  const answer = localStorage.getItem(`vote_answer_${queryId}`);
  await revealVote({ queryId, value: answer, salt });
  localStorage.removeItem(`vote_salt_${queryId}`);
}
```

### GraphQL (lib/graphql.ts)

```typescript
// Commit mutation
export async function commitVote(params: {
  queryId: number;
  commitHash: string;
}) {
  return queryGraphQL(`
    mutation {
      commitVote(queryId: ${params.queryId}, commitHash: "${params.commitHash}") {
        voter
        commitHash
        committedAt
      }
    }
  `, 'registry');
}

// Reveal mutation
export async function revealVote(params: {
  queryId: number;
  value: string;
  salt: string;
  confidence?: number;
}) {
  return queryGraphQL(`
    mutation {
      revealVote(
        queryId: ${params.queryId},
        value: "${params.value}",
        salt: "${params.salt}",
        confidence: ${params.confidence || 100}
      ) {
        voter
        value
        timestamp
      }
    }
  `, 'registry');
}
```

## 🔐 Hash Generation

```typescript
// SHA-256 hash
const encoder = new TextEncoder();
const data = encoder.encode(answer + salt);
const hashBuffer = await crypto.subtle.digest('SHA-256', data);
const hashArray = Array.from(new Uint8Array(hashBuffer));
const commitHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
```

## 💾 localStorage Keys

```typescript
// Store
localStorage.setItem(`vote_salt_${queryId}`, salt);
localStorage.setItem(`vote_answer_${queryId}`, answer);

// Retrieve
const salt = localStorage.getItem(`vote_salt_${queryId}`);
const answer = localStorage.getItem(`vote_answer_${queryId}`);

// Clean
localStorage.removeItem(`vote_salt_${queryId}`);
localStorage.removeItem(`vote_answer_${queryId}`);
```

## 🎨 UI States

```typescript
// Not committed
<button onClick={() => handleCommit()}>
  Commit Vote
</button>

// Committed
<div className="bg-green-100 border-green-500">
  ✓ Vote Committed
</div>

// Reveal phase
<button onClick={() => handleReveal()}>
  Reveal Vote
</button>

// Revealed
<div className="text-gray-500">
  Vote Revealed
</div>
```

## 🔍 Debug Commands

```bash
# Check localStorage
localStorage.getItem('vote_salt_1')
localStorage.getItem('vote_answer_1')

# Check blockchain
curl -X POST http://localhost:8080/chains/CHAIN_ID/applications/REGISTRY_ID \
  -d '{"query": "{ query(id: 1) { commitCount voteCount hasCommitted hasRevealed } }"}'

# Check console logs
console.log('Commit hash:', commitHash)
console.log('Salt:', salt)
console.log('Answer:', answer)
```

## ⚠️ Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "You must be registered as a voter first" | Not registered | Go to /voters and register |
| "No committed vote found" | localStorage cleared | Commit vote again |
| "Invalid outcome" | Wrong answer format | Select from dropdown |
| "Hash verification failed" | Salt/answer mismatch | Check localStorage values |
| "Query not found" | Invalid queryId | Check active queries |

## 📊 Query Structure

```typescript
interface Query {
  id: number;
  question: string;
  commitEndTime: number;      // Timestamp in ms
  revealEndTime: number;       // Timestamp in ms
  outcomes: string[];          // ["Yes", "No"]
  phase: 'commit' | 'reveal' | 'ended';
}
```

## 🔄 Phase Transitions

```
COMMIT PHASE
  ↓ (commitEndTime reached)
REVEAL PHASE
  ↓ (revealEndTime reached)
ENDED
```

## 🎯 Testing Checklist

```bash
# 1. Setup
✓ Linera running
✓ Dashboard running
✓ Wallet connected
✓ User registered

# 2. Commit
✓ Select answer
✓ Click commit
✓ Check console for hash
✓ Check localStorage for salt
✓ Verify UI shows "Committed"

# 3. Reveal
✓ Wait for reveal phase
✓ Click reveal
✓ Check console for verification
✓ Check localStorage cleared
✓ Verify UI updates

# 4. Blockchain
✓ Query commitCount
✓ Query voteCount
✓ Verify hasCommitted
✓ Verify hasRevealed
```

## 🚀 Quick Start

```bash
# Terminal 1: Start Linera
linera service --port 8080

# Terminal 2: Start Dashboard
cd alethea-dashboard
npm run dev

# Browser
1. Open http://localhost:3000
2. Connect wallet
3. Register as voter
4. Commit vote
5. Reveal vote
```

## 📝 GraphQL Queries

```graphql
# Get query details
query {
  query(id: 1) {
    id
    description
    outcomes
    phase
    commitPhaseEnd
    revealPhaseEnd
    commitCount
    voteCount
    hasCommitted
    hasRevealed
  }
}

# Get my voter info
query {
  myVoterInfo {
    address
    totalVotes
    correctVotes
    reputation
  }
}

# Get active queries
query {
  activeQueries(limit: 10) {
    id
    description
    phase
    commitCount
    voteCount
  }
}
```

## 🔗 Important Files

```
alethea-dashboard/
├── app/
│   └── page.tsx                    # Main voting logic
├── components/
│   └── voting/
│       └── ActiveVotesSection.tsx  # Voting UI
├── lib/
│   ├── graphql.ts                  # GraphQL mutations
│   └── linera-adapter.ts           # Blockchain adapter
└── docs/
    ├── COMMIT_REVEAL_VOTING_IMPLEMENTATION.md
    ├── TESTING_COMMIT_REVEAL.md
    └── RINGKASAN_COMMIT_REVEAL.md
```

## 💡 Pro Tips

1. **Always check localStorage** before reveal
2. **Don't clear browser data** during voting
3. **Use console logs** for debugging
4. **Test with multiple browsers** for multi-voter scenarios
5. **Backup salt** if needed (copy from localStorage)

## 🎓 Learn More

- SHA-256: https://en.wikipedia.org/wiki/SHA-2
- Commit-Reveal: https://en.wikipedia.org/wiki/Commitment_scheme
- Linera Docs: https://linera.dev
- GraphQL: https://graphql.org

---

**Quick Help:**
- Commit not working? → Check registration status
- Reveal not working? → Check localStorage for salt
- Hash mismatch? → Verify salt and answer match
- Network error? → Check Linera service running
