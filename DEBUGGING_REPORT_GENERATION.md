# Debugging Report Generation Issue 🔍

## Problem Description
User clicks "Generate Report" but the report doesn't display - it appears to be working but then no results show.

## Architecture Overview

### Report Generation Flow
```
1. User fills contact form → ContactStep component
2. Click "Generate Report" button → handleSubmit()
3. Parallel execution:
   - streamWizardReport() → Calls /api/wizard-stream
   - submitLead() → Calls /api/leads
4. Stream receives chunks from Gemini API
5. On completion → updateReportData(structuredData)
6. Navigate to Step 10 → ResultsStep component
7. ResultsStep displays report from wizardContext.reportData
```

### Key Files
- **Contact Step**: `src/components/wizard/steps/contact-step.tsx` (Form + streaming)
- **API Route**: `src/app/api/wizard-stream/route.ts` (Gemini streaming)
- **Wizard Context**: `src/lib/services/wizard-service.tsx` (State management)
- **Results Step**: `src/components/wizard/steps/results-step.tsx` (Display)
- **Steps Config**: `src/components/wizard/steps/index.ts` (Navigation)

---

## Debugging Steps (Follow in Order)

### ✅ Step 1: Check Browser Console
Open DevTools (F12) and look for these log messages:

**Expected console output:**
```
🚀 Starting report generation stream...
📡 Stream response status: 200
📨 Starting to read stream chunks...
🎬 Stream started: Generating your personalized homebuying report...
📝 Received 10 chunks, 1523 chars
📝 Received 20 chunks, 3456 chars
...
✅ Stream complete event received
📊 Structured data: { id: "...", language: "en", contentLength: 5432 }
✅ Structured data created successfully
✅ Stream reading completed. Total chunks: 45
✅ Report generated successfully: { id: "...", language: "en", contentLength: 5432 }
✅ Report stored in wizard context, navigating to results...
```

**If you see errors:**
- ❌ `Stream request failed: 500` → API error (check Step 2)
- ❌ `Failed to parse SSE data` → Malformed stream (check Step 3)
- ❌ `No structured data was created` → Missing 'complete' event (check Step 4)
- ❌ `No report data received from stream` → `structuredData` is null (check Step 5)

---

### ✅ Step 2: Check API Route Logs

**In your terminal** (where `npm run dev` is running), look for:

```bash
🚀 Wizard Streaming API: Starting Gemini streaming for wizard report...
📊 Wizard Streaming API: Processing report for John Doe
🌐 Wizard Streaming API: Locale set to "en"
📝 Wizard Streaming API: Privacy-safe input created with language: en
📝 Wizard Streaming API: Starting markdown analysis stream...
📨 Wizard Streaming API: Sent chunk 1, length: 127
📨 Wizard Streaming API: Sent chunk 2, length: 143
...
✅ Wizard Streaming API: Received 45 chunks with 5432 total characters
✅ Wizard Streaming API: Completed successfully with 45 chunks for locale "en"
```

**Common API Errors:**

| Error Message | Cause | Solution |
|---------------|-------|----------|
| `GOOGLE_API_KEY is not configured` | Missing env var | Add to `.env.local` |
| `No content received from Gemini` | Gemini API failure | Check API quota/status |
| `Stream request failed: 500` | Server error | Check full error in terminal |
| `Request setup failed` | Invalid input data | Check wizard data format |

---

### ✅ Step 3: Check Network Tab

1. Open DevTools → Network tab
2. Click "Generate Report"
3. Find the `/api/wizard-stream` request
4. Check:
   - **Status**: Should be `200`
   - **Type**: Should be `eventsource` or `text/event-stream`
   - **Response**: Click to see Server-Sent Events

**Expected SSE format:**
```
data: {"type":"start","message":"Generating your personalized homebuying report..."}

data: {"type":"chunk","content":"# Your","accumulated":"# Your","chunkNumber":1}

data: {"type":"chunk","content":" Home","accumulated":"# Your Home","chunkNumber":2}

...

data: {"type":"complete","structured":{...},"fullMarkdown":"...","totalChunks":45}
```

**If you see:**
- Status `401/403` → Authentication issue
- Status `500` → Server error (check terminal logs)
- No `complete` event → Stream interrupted or Gemini failed
- Malformed JSON → Check for syntax errors in API route

---

### ✅ Step 4: Verify Wizard Context

Add this to `contact-step.tsx` after line 99 (after `updateReportData`):

```typescript
// Temporary debug: Check if context updated
setTimeout(() => {
  console.log('🔍 Checking wizard context reportData:', reportData)
}, 500)
```

**Expected:** Should log the report data object

**If `undefined`:**
- Context not updating → Check `wizard-service.tsx`
- React state not syncing → Check provider setup

---

### ✅ Step 5: Check Results Step

When you navigate to Step 10, check:

```typescript
// In ResultsStep component (line 42)
console.log('📄 ResultsStep mounted, reportData:', reportData)
```

**Scenarios:**

| reportData value | What you see | Fix |
|------------------|-------------|-----|
| `undefined` | "Loading..." message | Data not stored in context |
| `null` | "Loading..." message | Stream returned null |
| `{...}` | Full report displayed | ✅ Working! |

---

### ✅ Step 6: Environment Variables

Check `.env.local` file:

```bash
# Required for report generation
GOOGLE_API_KEY=your_gemini_api_key_here

# Optional but recommended
CENSUS_API_KEY=your_census_key
ZAPIER_WEBHOOK_URL=your_webhook_url
```

**Test Gemini API key:**
```bash
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

---

## Common Issues & Solutions

### 🔴 Issue 1: "Stream works but no data"

**Symptoms:**
- Console shows "Stream reading completed"
- But "❌ No structured data was created"

**Cause:** The `complete` event never fired or was malformed

**Solution:**
```typescript
// In streamWizardReport(), add after line 237:
console.log('🔍 Final structuredData:', structuredData)
console.log('🔍 Accumulated content length:', accumulatedContent.length)
```

If `accumulatedContent` has data but `structuredData` is null:
- The `complete` event didn't fire
- Check API route is sending it (line 148-156 in `/api/wizard-stream/route.ts`)

---

### 🔴 Issue 2: "Report generates but page doesn't navigate"

**Symptoms:**
- Console shows "✅ Report stored in wizard context"
- But stays on contact step

**Cause:** `onNext()` not working

**Solution:**
Check wizard navigation in `interactive-homebuyer-wizard.tsx`:
```typescript
// Line 102-116
const handleNext = () => {
  if (!isLastStep(currentStep)) {
    goToNextStep() // This should navigate
  }
}
```

**Debug:**
```typescript
// In contact-step.tsx after updateReportData:
console.log('🎯 Current step before onNext:', currentStep)
onNext()
console.log('🎯 Called onNext()')
```

---

### 🔴 Issue 3: "Gemini API quota exceeded"

**Symptoms:**
Terminal shows: `429 Resource has been exhausted`

**Causes:**
- Free tier: 15 RPM (requests per minute)
- Quota exceeded for the day

**Solutions:**
1. Wait 60 seconds between requests
2. Upgrade Gemini API plan
3. Use caching for repeated requests

---

### 🔴 Issue 4: "Stream times out"

**Symptoms:**
- Stream starts but never completes
- Console shows chunks then stops

**Causes:**
- Vercel serverless timeout (30s on Hobby plan)
- Gemini API is slow
- Network interruption

**Solutions:**
```typescript
// In next.config.ts, increase timeout:
export const maxDuration = 30 // Max for Hobby plan
// Upgrade to Pro for 60s
```

---

## Testing Checklist

### ✅ Manual Test Steps

1. **Fill wizard completely:**
   - Complete steps 1-8 with valid data
   - Don't skip any required fields

2. **On Contact Step (Step 9):**
   - Fill: First Name, Last Name, Email, Phone
   - Open DevTools Console
   - Open DevTools Network tab
   - Click "Generate Report" button

3. **Watch for:**
   - Blue streaming box appears ✅
   - Console logs start appearing ✅
   - Chunks increment (10, 20, 30...) ✅
   - "Stream complete" message ✅
   - Navigation to Step 10 ✅

4. **On Results Step (Step 10):**
   - Should see full report with sections ✅
   - Markdown rendered correctly ✅
   - Email button works ✅

### ✅ Test Data

Use this minimal test data for wizard:

```javascript
{
  city: "Austin",
  locationPriority: ["School district quality"],
  timeline: "Ready to buy",
  targetPrice: 350000,
  monthlyBudget: 2000,
  annualIncome: 75000,
  hasOtherIncome: false,
  monthlyDebts: 500,
  creditScore: "700-749",
  downPaymentAmount: 25000,
  employmentType: "w2",
  yearsAtJob: 5,
  buyerType: ["first-time"],
  firstName: "Test",
  lastName: "User",
  email: "test@example.com",
  phone: "512-123-4567"
}
```

---

## Quick Fixes

### If nothing works, try these in order:

1. **Restart dev server:**
   ```bash
   # Kill the process
   Ctrl+C

   # Clear Next.js cache
   rm -rf .next

   # Restart
   npm run dev
   ```

2. **Check environment:**
   ```bash
   # Verify API key is loaded
   echo $GOOGLE_API_KEY

   # Or in Node.js
   console.log('API Key:', process.env.GOOGLE_API_KEY?.slice(0, 10) + '...')
   ```

3. **Test API route directly:**
   ```bash
   curl -X POST http://localhost:3000/api/wizard-stream \
     -H "Content-Type: application/json" \
     -d '{"wizardData":{...},"contactInfo":{...},"locale":"en"}'
   ```

4. **Simplify the data:**
   - Use minimal wizard data
   - Test with English only first
   - Remove optional fields

---

## Expected Behavior Summary

### ✅ What SHOULD happen:

1. Click "Generate Report" → Button shows spinner
2. Blue box appears → "Generating your personalized report..."
3. Status updates → "Processing... (10 chunks)", (20 chunks), etc.
4. After 10-30 seconds → "Report generated successfully!"
5. Page navigates → Step 10 (Results)
6. Report displays → Full markdown with sections
7. Email button → Opens mail client with report

### ❌ What should NOT happen:

- Button stays loading forever (>60s)
- Blue box never appears
- Status never updates from "Generating..."
- Error message appears
- Page doesn't navigate
- Results page shows "Loading..." forever
- Report is blank/empty

---

## Need More Help?

If you've tried all the steps above and it still doesn't work:

### Collect this information:

1. **Console logs** (full output from browser)
2. **Terminal logs** (from `npm run dev`)
3. **Network request details** (from DevTools → Network)
4. **Wizard data** (sanitize personal info)
5. **Environment** (Node version, OS, browser)

### Debug command:

```bash
# Enable verbose logging
DEBUG=* npm run dev 2>&1 | tee debug.log
```

Then try generating a report and share the `debug.log` file.

---

## Summary of Improvements Made

✅ Added comprehensive console logging throughout the flow
✅ Added error handling for all failure scenarios
✅ Enhanced streaming feedback with real-time status
✅ Added null checks and validation
✅ Created this debugging guide

The enhanced logging will show you exactly where the process fails!
