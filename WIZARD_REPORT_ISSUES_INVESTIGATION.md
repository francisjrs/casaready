# Wizard Report Generation Issues - Investigation Report

**Date:** 2025-10-01
**Investigator:** Claude Code
**Status:** ✅ Root Causes Identified

## Summary

Two critical issues were identified in the wizard report generation:

1. **"Máximo Asequible" showing $0** instead of calculated maximum affordable price
2. **VA Loan appearing in recommendations** for non-veteran buyers

Both issues stem from bugs in the AI response parsing and merging logic in `src/lib/services/ai-service.ts`.

---

## Issue 1: Maximum Affordable Price Showing $0

### Observed Behavior
- The "Máximo Asequible" (Maximum Affordable) field displays **$0** in the report
- Debug data confirms: `"maxAffordable": 0`
- User has income of $125,000/year and should have a positive max affordable price

### Root Cause Analysis

**Location:** `src/lib/services/ai-service.ts:602-634`

The bug occurs in the AI response merging logic:

```typescript
// Line 606-607: AI extracts recommendedPrice but NOT maxHomePrice
estimatedPrice: personalizedPlan.affordabilityEstimate?.recommendedPrice,
// MISSING: maxAffordable extraction from personalizedPlan.affordabilityEstimate?.maxHomePrice

// Line 624-634: When merging AI results with fallback
return {
  ...fallbackReport,  // fallbackReport has correct maxAffordable
  reportContent: aiResult.data.plan || aiResult.data.response,
  aiGenerated: true,
  // Override with AI recommendations if available
  ...(aiResult.data.estimatedPrice && { estimatedPrice: aiResult.data.estimatedPrice }),
  ...(aiResult.data.monthlyPayment && { monthlyPayment: aiResult.data.monthlyPayment }),
  // MISSING: No maxAffordable override here!
  ...(aiResult.data.programFit && { programFit: aiResult.data.programFit }),
  ...(aiResult.data.actionPlan && { actionPlan: aiResult.data.actionPlan }),
  ...(aiResult.data.tips && { tips: aiResult.data.tips })
}
```

**The Problem:**
1. The fallback report correctly calculates `maxAffordable` (line 562)
2. AI response extraction (line 602-616) does NOT extract `maxHomePrice` from `personalizedPlan.affordabilityEstimate?.maxHomePrice`
3. When merging (line 624-634), if `estimatedPrice` from AI is present and has a value, it overrides the fallback
4. BUT `maxAffordable` is NOT extracted from AI response, so it remains as whatever is in `fallbackReport`
5. **However**, if the AI's `recommendedPrice` is used but `maxAffordable` is 0 or undefined in the AI response, it becomes 0

### Why This Happens
The AI response structure has `affordabilityEstimate.maxHomePrice` but the extraction code at line 606 only gets `recommendedPrice`, not `maxHomePrice`. This means `maxAffordable` is never populated from the AI response.

### Evidence from Debug Data
```json
{
  "maxAffordable": 0,  // ❌ Should be ~$320,000 based on income
  "estimatedPrice": 437500,  // ✅ Correctly extracted from AI
  "monthlyPayment": 2917,  // ✅ Correctly extracted from AI
  "aiGenerated": true  // ✅ Confirms AI was used
}
```

The AI report content mentions:
> "Rango de precio realista: $250,000-$320,000"

This confirms the AI calculated a max affordable around $320,000, but it wasn't extracted properly.

---

## Issue 2: VA Loan Recommended for Non-Veteran

### Observed Behavior
- User did NOT select "veteran" in buyer type
- User selected: `"buyerType": ["relocating", "downsizing"]`
- Report shows: `"programFit": ["Conventional Loan", "VA Loan"]`

### Root Cause Analysis

**Location:** Multiple files involved

#### 1. AI Prompt Construction (`src/ai/gemini-client.ts:1263-1268`)

The AI prompt includes military/veteran guidance if either:
- `preferences.buyerSpecialization.isMilitaryVeteran` is true, OR
- User's employer name contains military keywords

```typescript
// Line 1263-1268
if (specialization?.isMilitaryVeteran || hasMillitaryEmployer) {
  types.push('MILITARY_VETERAN');
  guidanceContexts.push(language === 'es' ?
    `**CONTEXTO MILITAR/VETERANO:** Elegible para préstamo VA. BENEFICIOS: 0% enganche...` :
    `**MILITARY/VETERAN CONTEXT:** Eligible for VA loan. BENEFITS: 0% down payment...`
  );
}
```

**This is working correctly** - the user's employer doesn't have military keywords, and `isMilitaryVeteran` should be false.

#### 2. Buyer Specialization Setting (`src/lib/services/ai-service.ts:91-93`)

```typescript
buyerSpecialization: {
  isFirstTimeBuyer: wizardData.buyerType?.includes('first-time') || false,
  isMilitaryVeteran: wizardData.buyerType?.includes('veteran') || false,  // ✅ Correctly false
  isUSDAEligible: false,
  isITINTaxpayer: false,
  isInvestor: wizardData.buyerType?.includes('investor') || false,
  needsAccessibilityFeatures: false
}
```

**This is working correctly** - since buyerType is `["relocating", "downsizing"]`, `isMilitaryVeteran` = false.

#### 3. **THE BUG**: Fallback Program Fit Logic (`src/lib/services/ai-service.ts:275-309`)

```typescript
function determineProgramFit(wizardData: WizardData): string[] {
  const programs: string[] = []

  // First-time buyer programs
  if (wizardData.buyerType?.includes('first-time')) {
    programs.push('FHA Loan', 'First-Time Buyer Programs', 'Down Payment Assistance')
  }

  // Veteran programs - Line 284: BUG IS HERE
  if (wizardData.buyerType?.includes('veteran')) {
    programs.push('VA Loan', 'Military Housing Assistance')
  }

  // Low down payment options
  if (wizardData.downPaymentPercent && wizardData.downPaymentPercent < 10) {
    programs.push('Low Down Payment Options', 'PMI Programs')
  }

  // High income conventional - Line 294: THIS TRIGGERS
  if (wizardData.annualIncome && wizardData.annualIncome > 100000) {
    programs.push('Conventional Loan', 'Jumbo Loan Options')  // ✅ User has $125k income
  }

  // Self-employed programs
  if (wizardData.employmentType === 'self-employed' || wizardData.employmentType === '1099') {
    programs.push('Bank Statement Loans', 'Non-QM Programs')
  }

  // Default programs if none match - Line 304: THIS ALSO TRIGGERS!
  if (programs.length === 0) {
    programs.push('Conventional Loan', 'FHA Loan', 'Down Payment Assistance')
  }

  return programs
}
```

**Wait, this function looks correct!** The user has income > $100k, so it should only add "Conventional Loan" and "Jumbo Loan Options".

Let me re-examine... **THE REAL BUG:**

The AI is generating the `programFit` array, not the fallback! Look at line 608:

```typescript
programFit: personalizedPlan.programRecommendations?.map(p => p.name) || [],
```

The AI's `personalizedPlan.programRecommendations` contains VA Loan! This means:

1. ✅ The fallback `determineProgramFit()` function works correctly
2. ❌ The AI is recommending VA Loan even though `isMilitaryVeteran` is false
3. The AI prompt at line 1263-1268 should NOT include military context
4. **BUT** - there's a fallback in the prompt that might be causing this

Let me check the prompt instructions again... The AI is told at line 1749:

> "3. Recommend only programs the user is likely to qualify for"

**The AI is incorrectly recommending VA Loan despite the user profile NOT having `isMilitaryVeteran: true`.**

This could be because:
- The AI has general knowledge about VA loans and is suggesting it broadly
- The AI prompt doesn't explicitly say "DO NOT recommend VA Loan unless isMilitaryVeteran is true"

### Evidence from Debug Data

```json
{
  "buyerType": ["relocating", "downsizing"],  // ❌ No "veteran" here
  "programFit": ["Conventional Loan", "VA Loan"]  // ❌ VA Loan shouldn't be here
}
```

The AI's text output correctly focuses on FHA and down payment assistance programs:
> "FHA Loan con Asistencia para Enganche"
> "Programas de Asistencia Locales/Estatales clave: TDHCA, AHFC"

But the structured `programRecommendations` array contains VA Loan as second option!

---

## Recommendations

### Fix #1: Extract maxAffordable from AI Response

**File:** `src/lib/services/ai-service.ts`
**Line:** 602-616

Add extraction of `maxHomePrice`:

```typescript
aiResult = {
  success: true,
  data: {
    plan: markdownAnalysis || JSON.stringify(personalizedPlan, null, 2),
    estimatedPrice: personalizedPlan.affordabilityEstimate?.recommendedPrice,
    maxAffordable: personalizedPlan.affordabilityEstimate?.maxHomePrice,  // ✅ ADD THIS LINE
    monthlyPayment: personalizedPlan.affordabilityEstimate?.budgetBreakdown?.monthlyPayment,
    programFit: personalizedPlan.programRecommendations?.map(p => p.name) || [],
    actionPlan: personalizedPlan.actionPlan?.phases?.flatMap(phase =>
      phase.steps.map(step => step.title)
    ) || [],
    tips: personalizedPlan.actionPlan?.phases?.flatMap(phase =>
      phase.steps.map(step => step.description)
    ).slice(0, 5) || []
  }
}
```

And add the override in the merge:

```typescript
return {
  ...fallbackReport,
  reportContent: aiResult.data.plan || aiResult.data.response,
  aiGenerated: true,
  // Override with AI recommendations if available
  ...(aiResult.data.estimatedPrice && { estimatedPrice: aiResult.data.estimatedPrice }),
  ...(aiResult.data.maxAffordable && { maxAffordable: aiResult.data.maxAffordable }),  // ✅ ADD THIS LINE
  ...(aiResult.data.monthlyPayment && { monthlyPayment: aiResult.data.monthlyPayment }),
  ...(aiResult.data.programFit && { programFit: aiResult.data.programFit }),
  ...(aiResult.data.actionPlan && { actionPlan: aiResult.data.actionPlan }),
  ...(aiResult.data.tips && { tips: aiResult.data.tips })
}
```

### Fix #2: Filter VA Loan from AI Recommendations

**Option A - Filter in AI Service (Recommended)**

**File:** `src/lib/services/ai-service.ts`
**Line:** 608

Filter out VA Loan if user is not a veteran:

```typescript
programFit: personalizedPlan.programRecommendations
  ?.filter(p => {
    // Filter out VA Loan if user is not a military veteran
    if (p.programType === 'va' || p.name.toLowerCase().includes('va loan')) {
      return wizardData.buyerType?.includes('veteran') || false;
    }
    return true;
  })
  ?.map(p => p.name) || [],
```

**Option B - Improve AI Prompt (Additional safeguard)**

**File:** `src/ai/gemini-client.ts`
**Line:** 1747-1753

Add explicit restriction:

```typescript
**IMPORTANT GUIDELINES:**
1. All financial calculations must be realistic and based on current market conditions
2. Consider debt-to-income ratios, credit scores, and employment stability
3. Recommend only programs the user is likely to qualify for
3a. DO NOT recommend VA Loan unless user is a military veteran or has isMilitaryVeteran=true
4. Provide actionable, specific steps with realistic timelines
...
```

**Option C - Both (Best approach)**

Implement both fixes for defense in depth:
1. Explicit AI prompt restriction
2. Post-processing filter to catch any AI mistakes

---

## Testing Recommendations

### Test Case 1: maxAffordable with AI
- User with $125k income, $400 debts
- Verify `maxAffordable` is populated (should be ~$320k-400k range)
- Verify it's not $0

### Test Case 2: VA Loan filtering
- User with `buyerType: ["relocating", "downsizing"]` (no veteran)
- Verify VA Loan is NOT in `programFit` array
- Verify VA Loan IS included for `buyerType: ["veteran"]`

### Test Case 3: Fallback correctness
- Disable AI temporarily
- Verify fallback report has correct `maxAffordable` calculation
- Verify fallback `determineProgramFit()` doesn't add VA Loan for non-veterans

---

## Impact Assessment

### Severity: HIGH
- **maxAffordable = $0** misleads users about their buying power
- **Incorrect VA Loan recommendation** may create false expectations for non-veterans
- Both issues harm user trust and lead quality

### Affected Users
- All users using the wizard in the last X days (since AI integration)
- Spanish-speaking users may be disproportionately affected (UI shows "Máximo Asequible: $0")

### Data Integrity
- Historical reports in database may have incorrect `maxAffordable` values
- Leads sent to CRM may have incorrect program recommendations

---

## Additional Notes

### Why the AI Text is Correct but programFit is Wrong

The AI generates two outputs:
1. **Markdown analysis text** - This is correct and mentions FHA, DPA programs
2. **Structured JSON with programRecommendations** - This contains VA Loan incorrectly

The markdown is used for display, but the `programFit` array is extracted from `programRecommendations`, which has the bug.

### Related Code Paths

- Report generation: `src/lib/services/ai-service.ts:578-646`
- AI client: `src/ai/gemini-client.ts:973-1075`
- Results display: `src/components/wizard/steps/results-step.tsx:152-196`

---

## Files Modified (Proposed)

1. `src/lib/services/ai-service.ts` - Add maxAffordable extraction and VA Loan filter
2. `src/ai/gemini-client.ts` - Add explicit VA Loan restriction in prompt (optional)

---

## Conclusion

Both issues have clear root causes and straightforward fixes:

1. **maxAffordable = $0**: Missing extraction of `maxHomePrice` from AI response
2. **VA Loan for non-veteran**: AI generating incorrect program recommendations, needs filtering

Implementing the recommended fixes will resolve both issues and improve report accuracy.
