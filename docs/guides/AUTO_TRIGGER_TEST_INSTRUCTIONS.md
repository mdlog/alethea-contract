# Auto-Trigger Test Instructions

**Test Date:** November 20, 2025  
**Test Duration:** 5 minutes  
**Purpose:** Verify auto-trigger works without duplicates

---

## 🎯 Test Objective

Verify that:
1. ✅ Auto-trigger fires when market expires
2. ✅ Trigger happens ONLY ONCE (no duplicates)
3. ✅ Oracle query is created
4. ✅ Market status changes correctly

---

## 📋 Prerequisites

### 1. Services Running
```bash
# Check Linera service
ps aux | grep "linera service"

# If not running, start it
linera service --port 8080 &
```

### 2. Dashboard Running
```bash
# Check dashboard
ps aux | grep "next dev"

# If not running, start it
cd alethea-dashboard
npm run dev &
```

### 3. Environment Loaded
```bash
source .env.fresh
```

---

## 🚀 Test Steps

### Step 1: Market Already Created ✅

Market has been created with:
- **ID:** 0
- **Question:** "Test: Auto-trigger in 5 min?"
- **Deadline:** ~5 minutes from creation
- **Status:** OPEN

### Step 2: Open Dashboard

```bash
# Open in browser
http://localhost:3000
```

**What to do:**
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Keep console visible

### Step 3: Start Monitoring Script

In a terminal, run:
```bash
./monitor_auto_trigger.sh
```

**What it does:**
- Checks market status every 5 seconds
- Shows countdown to deadline
- Detects when auto-trigger fires
- Displays oracle query creation

### Step 4: Watch Browser Console

**Expected Console Messages:**

#### Before Deadline (First ~5 minutes)
```
📊 Loading data from Oracle Registry and Market Chain...
✅ Markets loaded: 1
📋 Market market-0: { status: "Active", isExpired: false }
```

#### When Deadline Passes
```
🤖 Auto-triggering resolution for expired market 0
✅ Resolution requested for market 0: { data: "..." }
```

#### After Trigger (Should NOT see)
```
❌ SHOULD NOT SEE THIS:
🤖 Auto-triggering resolution for expired market 0  // DUPLICATE!
🤖 Auto-triggering resolution for expired market 0  // DUPLICATE!
```

### Step 5: Verify Results

After 5 minutes + trigger:

#### Check Market Status
```bash
source .env.fresh
curl -s -X POST "http://localhost:8080/chains/$CHAIN_ID/applications/$MARKET_CHAIN_ID" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ markets { id status } }"}' | jq '.'
```

**Expected:** Status changed from "OPEN" to something else

#### Check Oracle Query
```bash
curl -s -X POST "http://localhost:8080/chains/$CHAIN_ID/applications/$ORACLE_APP_ID" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ queries { id question } }"}' | jq '.'
```

**Expected:** New query created for the market

---

## ✅ Success Criteria

### 1. Auto-Trigger Fires
- [ ] Console shows "🤖 Auto-triggering resolution"
- [ ] Message appears after deadline passes
- [ ] Happens within 10 seconds of expiry

### 2. No Duplicates
- [ ] Trigger message appears ONLY ONCE
- [ ] No repeated messages in next 1-2 minutes
- [ ] Console stays clean

### 3. Oracle Query Created
- [ ] New query appears in Oracle Registry
- [ ] Query matches market question
- [ ] Query status is appropriate

### 4. Market Status Changes
- [ ] Market status changes from OPEN
- [ ] Change happens after trigger
- [ ] Status persists

---

## 📊 Monitoring Output

### Terminal Monitor

```
╔════════════════════════════════════════════════════════════╗
║           Auto-Trigger Monitor - 5 Minute Test             ║
╚════════════════════════════════════════════════════════════╝

📊 Market Information:
   ID:       0
   Question: Test: Auto-trigger in 5 min?
   Status:   OPEN
   Deadline: 2025-11-20 09:53:10

⏰ Monitoring for auto-trigger...

╔════════════════════════════════════════════════════════════╗
║                    Live Monitoring                         ║
╚════════════════════════════════════════════════════════════╝

[09:48:15] Check #1 | Time: 04:55 | Status: OPEN | Oracle Queries: 1
[09:48:20] Check #2 | Time: 04:50 | Status: OPEN | Oracle Queries: 1
[09:48:25] Check #3 | Time: 04:45 | Status: OPEN | Oracle Queries: 1
...
[09:53:10] Check #60 | Time: 00:05 | Status: OPEN | Oracle Queries: 1
[09:53:15] Check #61 | Time: EXPIRED | Status: OPEN | Oracle Queries: 1
[09:53:20] Check #62 | Time: EXPIRED | Status: WAITING_RESOLUTION | Oracle Queries: 2

╔════════════════════════════════════════════════════════════╗
║              🎉 AUTO-TRIGGER DETECTED! 🎉                  ║
╚════════════════════════════════════════════════════════════╝

Market Status Changed:
   From: OPEN
   To:   WAITING_RESOLUTION

Oracle Queries: 2

✅ Auto-trigger test: PASSED
```

### Browser Console

```
[09:53:15] 🤖 Auto-triggering resolution for expired market 0
[09:53:16] ✅ Resolution requested for market 0: { data: "abc123..." }
[09:53:18] 📊 Loading data from Oracle Registry and Market Chain...
[09:53:19] ✅ Markets loaded: 1
[09:53:25] 📊 Loading data from Oracle Registry and Market Chain...
[09:53:26] ✅ Markets loaded: 1
// NO MORE TRIGGER MESSAGES - GOOD! ✅
```

---

## 🐛 Troubleshooting

### Issue: No Auto-Trigger After 5 Minutes

**Possible Causes:**
1. Dashboard not running
2. Browser tab not active
3. Console errors

**Solution:**
```bash
# Restart dashboard
cd alethea-dashboard
rm -rf .next
npm run dev
```

### Issue: Duplicate Triggers

**This is the bug we fixed!**

**If you see duplicates:**
1. Check `app/page.tsx` has the fix
2. Verify `useRef` is imported
3. Restart dashboard

**Expected:** Should NOT happen with fix applied

### Issue: Market Not Expiring

**Check deadline:**
```bash
source .env.fresh
curl -s -X POST "http://localhost:8080/chains/$CHAIN_ID/applications/$MARKET_CHAIN_ID" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ markets { resolutionDeadline } }"}' | jq '.'
```

**Verify time:**
```bash
# Current time in microseconds
echo $(($(date +%s) * 1000000))
```

---

## 📝 Test Results Template

```markdown
## Auto-Trigger Test Results

**Date:** November 20, 2025
**Tester:** [Your Name]

### Test Environment
- Linera Service: ✅ Running
- Dashboard: ✅ Running
- Market ID: 0

### Results

#### 1. Auto-Trigger Fired
- [ ] Yes
- [ ] No
- Time: [HH:MM:SS]

#### 2. No Duplicates
- [ ] Confirmed - Only one trigger
- [ ] Failed - Saw duplicates
- Count: [Number of triggers]

#### 3. Oracle Query Created
- [ ] Yes
- [ ] No
- Query ID: [ID]

#### 4. Market Status Changed
- [ ] Yes
- [ ] No
- New Status: [Status]

### Console Logs
```
[Paste relevant console logs here]
```

### Screenshots
[Attach screenshots if available]

### Notes
[Any additional observations]

### Conclusion
- [ ] Test PASSED
- [ ] Test FAILED
- [ ] Test INCONCLUSIVE
```

---

## 🎯 Expected Timeline

```
Time 0:00 - Market created
Time 0:10 - Dashboard loads market
Time 0:20 - Market appears in Upcoming tab
Time 5:00 - Deadline passes
Time 5:10 - Auto-trigger fires (within 10s of expiry)
Time 5:11 - Oracle query created
Time 5:12 - Market status changes
Time 5:20 - No duplicate triggers (verified)
Time 5:30 - Test complete
```

---

## 📚 Related Documentation

- [AUTO_TRIGGER_DUPLICATE_FIX.md](AUTO_TRIGGER_DUPLICATE_FIX.md) - Fix details
- [AUTO_RESOLUTION_TRIGGER_FIX.md](AUTO_RESOLUTION_TRIGGER_FIX.md) - Original implementation
- [AUTOMATIC_FLOW_EXPLANATION.md](AUTOMATIC_FLOW_EXPLANATION.md) - Flow explanation

---

## 🎉 Success!

If all criteria are met:
- ✅ Auto-trigger fired once
- ✅ No duplicates observed
- ✅ Oracle query created
- ✅ Market status changed

**Congratulations! The auto-trigger fix is working correctly!** 🎊

---

**Test Created:** November 20, 2025  
**Last Updated:** 09:50 UTC
