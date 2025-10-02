# Systematic Test Plan - Wizard Report Fixes

**Date:** 2025-10-01
**Fixes Applied:**
1. Extract `maxAffordable` from AI response (`personalizedPlan.affordabilityEstimate.maxHomePrice`)
2. Filter VA Loan from recommendations for non-veteran buyers
3. Add defensive logging for debugging

---

## Test Strategy

### Approach
1. **Unit Tests** - Test the AI service functions in isolation
2. **Integration Tests** - Test with real wizard data scenarios
3. **End-to-End Tests** - Test the full wizard flow with different buyer profiles
4. **Regression Tests** - Ensure existing functionality still works

### Test Data Scenarios

#### Scenario 1: Non-Veteran Buyer with High Income (Original Bug Case)
```json
{
  "city": "Austin",
  "zipCode": "78701",
  "timeline": "3-6",
  "budgetType": "price",
  "targetPrice": 250000,
  "annualIncome": 125000,
  "monthlyDebts": 400,
  "creditScore": "740-799",
  "downPaymentPercent": 3,
  "employmentType": "w2",
  "buyerType": ["relocating", "downsizing"],
  "householdSize": 2
}
```

**Expected Results:**
- ✅ `maxAffordable` should be > 0 (likely $300k-$400k range based on income)
- ✅ `programFit` should NOT contain "VA Loan"
- ✅ `programFit` should contain "Conventional Loan" or "FHA Loan"
- ✅ `estimatedPrice` should be reasonable ($250k as targeted)

---

#### Scenario 2: Veteran Buyer (Should Get VA Loan)
```json
{
  "city": "Austin",
  "zipCode": "78701",
  "timeline": "3-6",
  "budgetType": "price",
  "targetPrice": 300000,
  "annualIncome": 100000,
  "monthlyDebts": 500,
  "creditScore": "680-739",
  "downPaymentPercent": 0,
  "employmentType": "w2",
  "buyerType": ["veteran"],
  "householdSize": 3
}
```

**Expected Results:**
- ✅ `maxAffordable` should be > 0 (likely $250k-$350k range)
- ✅ `programFit` SHOULD contain "VA Loan"
- ✅ VA Loan should be recommended in AI text
- ✅ `estimatedPrice` should be reasonable

---

#### Scenario 3: First-Time Buyer (No VA Loan)
```json
{
  "city": "Dallas",
  "zipCode": "75201",
  "timeline": "6-12",
  "budgetType": "price",
  "targetPrice": 200000,
  "annualIncome": 60000,
  "monthlyDebts": 300,
  "creditScore": "620-679",
  "downPaymentPercent": 3.5,
  "employmentType": "w2",
  "buyerType": ["first-time"],
  "householdSize": 2
}
```

**Expected Results:**
- ✅ `maxAffordable` should be > 0 (likely $180k-$220k range)
- ✅ `programFit` should NOT contain "VA Loan"
- ✅ `programFit` should contain "FHA Loan" or "First-Time Buyer Programs"
- ✅ Down payment assistance programs recommended

---

#### Scenario 4: Low Income Buyer (Edge Case)
```json
{
  "city": "Houston",
  "zipCode": "77001",
  "timeline": "12+",
  "budgetType": "price",
  "targetPrice": 150000,
  "annualIncome": 40000,
  "monthlyDebts": 200,
  "creditScore": "580-619",
  "downPaymentPercent": 5,
  "employmentType": "w2",
  "buyerType": ["relocating"],
  "householdSize": 1
}
```

**Expected Results:**
- ✅ `maxAffordable` should be > 0 (likely $120k-$160k range)
- ✅ `programFit` should NOT contain "VA Loan"
- ✅ Realistic affordability warnings in AI text
- ✅ FHA or USDA loan recommendations

---

#### Scenario 5: Veteran + First-Time Buyer (Multiple Flags)
```json
{
  "city": "San Antonio",
  "zipCode": "78201",
  "timeline": "3-6",
  "budgetType": "price",
  "targetPrice": 250000,
  "annualIncome": 80000,
  "monthlyDebts": 400,
  "creditScore": "700-739",
  "downPaymentPercent": 0,
  "employmentType": "w2",
  "buyerType": ["veteran", "first-time"],
  "householdSize": 2
}
```

**Expected Results:**
- ✅ `maxAffordable` should be > 0 (likely $220k-$280k range)
- ✅ `programFit` SHOULD contain "VA Loan" (veteran flag present)
- ✅ VA Loan should be prioritized in recommendations
- ✅ First-time buyer programs also mentioned

---

#### Scenario 6: Fallback Report (AI Disabled)
```json
{
  "city": "Austin",
  "zipCode": "78701",
  "timeline": "6-12",
  "budgetType": "price",
  "targetPrice": 200000,
  "annualIncome": 75000,
  "monthlyDebts": 350,
  "creditScore": "660-699",
  "downPaymentPercent": 5,
  "employmentType": "w2",
  "buyerType": ["downsizing"],
  "householdSize": 2
}
```

**Expected Results (when AI fails):**
- ✅ `maxAffordable` calculated by fallback logic should be > 0
- ✅ `programFit` from `determineProgramFit()` should NOT contain "VA Loan"
- ✅ Fallback report content should be present
- ✅ `aiGenerated: false` flag

---

## Unit Test Cases

### Test 1: `determineProgramFit()` Function

```typescript
describe('determineProgramFit', () => {
  it('should NOT include VA Loan for non-veteran', () => {
    const wizardData = {
      buyerType: ['relocating', 'downsizing'],
      annualIncome: 125000,
      // ... other fields
    };
    const programs = determineProgramFit(wizardData);
    expect(programs).not.toContain('VA Loan');
    expect(programs).not.toContain('Military Housing Assistance');
  });

  it('should include VA Loan for veteran', () => {
    const wizardData = {
      buyerType: ['veteran'],
      annualIncome: 100000,
      // ... other fields
    };
    const programs = determineProgramFit(wizardData);
    expect(programs).toContain('VA Loan');
  });

  it('should include Conventional Loan for high income', () => {
    const wizardData = {
      buyerType: ['downsizing'],
      annualIncome: 125000,
      // ... other fields
    };
    const programs = determineProgramFit(wizardData);
    expect(programs).toContain('Conventional Loan');
  });
});
```

### Test 2: VA Loan Filtering Logic

```typescript
describe('VA Loan Filtering', () => {
  it('should filter out VA Loan from AI recommendations for non-veteran', () => {
    const mockRecommendations = [
      { programType: 'conventional', name: 'Conventional Loan' },
      { programType: 'va', name: 'VA Loan' },
    ];
    const wizardData = { buyerType: ['relocating'] };

    const filtered = mockRecommendations
      .filter(p => {
        const isVALoan = p.programType === 'va' || p.name.toLowerCase().includes('va loan');
        if (isVALoan) {
          return wizardData.buyerType?.includes('veteran') || false;
        }
        return true;
      })
      .map(p => p.name);

    expect(filtered).toEqual(['Conventional Loan']);
  });

  it('should keep VA Loan for veteran buyer', () => {
    const mockRecommendations = [
      { programType: 'conventional', name: 'Conventional Loan' },
      { programType: 'va', name: 'VA Loan' },
    ];
    const wizardData = { buyerType: ['veteran'] };

    const filtered = mockRecommendations
      .filter(p => {
        const isVALoan = p.programType === 'va' || p.name.toLowerCase().includes('va loan');
        if (isVALoan) {
          return wizardData.buyerType?.includes('veteran') || false;
        }
        return true;
      })
      .map(p => p.name);

    expect(filtered).toContain('VA Loan');
  });
});
```

### Test 3: maxAffordable Extraction

```typescript
describe('maxAffordable Extraction', () => {
  it('should extract maxHomePrice from AI response', () => {
    const mockPersonalizedPlan = {
      affordabilityEstimate: {
        maxHomePrice: 350000,
        recommendedPrice: 300000,
        budgetBreakdown: {
          monthlyPayment: 2000
        }
      }
    };

    const extracted = {
      estimatedPrice: mockPersonalizedPlan.affordabilityEstimate?.recommendedPrice,
      maxAffordable: mockPersonalizedPlan.affordabilityEstimate?.maxHomePrice,
      monthlyPayment: mockPersonalizedPlan.affordabilityEstimate?.budgetBreakdown?.monthlyPayment,
    };

    expect(extracted.maxAffordable).toBe(350000);
    expect(extracted.estimatedPrice).toBe(300000);
    expect(extracted.monthlyPayment).toBe(2000);
  });

  it('should handle missing maxHomePrice gracefully', () => {
    const mockPersonalizedPlan = {
      affordabilityEstimate: {
        recommendedPrice: 300000,
        budgetBreakdown: {
          monthlyPayment: 2000
        }
      }
    };

    const extracted = {
      maxAffordable: mockPersonalizedPlan.affordabilityEstimate?.maxHomePrice,
    };

    expect(extracted.maxAffordable).toBeUndefined();
  });
});
```

---

## Integration Test Cases

### Test 4: Full Report Generation Flow

```typescript
describe('generateHomebuyingReport', () => {
  it('should generate report with correct maxAffordable for non-veteran', async () => {
    const wizardData = {
      annualIncome: 125000,
      monthlyDebts: 400,
      buyerType: ['relocating', 'downsizing'],
      // ... other fields
    };
    const contactInfo = { /* ... */ };

    const report = await generateHomebuyingReport(wizardData, contactInfo, 'en');

    expect(report.maxAffordable).toBeGreaterThan(0);
    expect(report.maxAffordable).toBeLessThanOrEqual(report.estimatedPrice * 1.5);
    expect(report.programFit).not.toContain('VA Loan');
  });

  it('should include VA Loan for veteran buyer', async () => {
    const wizardData = {
      annualIncome: 100000,
      buyerType: ['veteran'],
      // ... other fields
    };
    const contactInfo = { /* ... */ };

    const report = await generateHomebuyingReport(wizardData, contactInfo, 'en');

    expect(report.maxAffordable).toBeGreaterThan(0);
    expect(report.programFit).toContain('VA Loan');
  });
});
```

---

## Manual Testing Checklist

### Pre-Test Setup
- [ ] Ensure GOOGLE_API_KEY is configured
- [ ] Clear any cached responses
- [ ] Start dev server: `npm run dev`
- [ ] Open browser DevTools console

### Test Execution

#### Test 1: Original Bug Case (Non-Veteran, High Income)
- [ ] Navigate to `/wizard`
- [ ] Fill in Scenario 1 data (Austin, $125k income, relocating/downsizing)
- [ ] Submit wizard
- [ ] **Verify:** "Máximo Asequible" displays > $0 (not $0)
- [ ] **Verify:** "Programas de Préstamo Recomendados" does NOT show "VA Loan"
- [ ] **Verify:** Console logs show "📊 AI Response Extraction" with maxAffordable value
- [ ] **Verify:** Debug panel shows `maxAffordable > 0` in JSON

#### Test 2: Veteran Buyer
- [ ] Navigate to `/wizard`
- [ ] Fill in Scenario 2 data (Austin, $100k income, veteran)
- [ ] Submit wizard
- [ ] **Verify:** "Maximum Affordable" displays > $0
- [ ] **Verify:** "Recommended Programs" INCLUDES "VA Loan"
- [ ] **Verify:** AI text mentions VA Loan benefits
- [ ] **Verify:** No console warnings about filtering VA Loan

#### Test 3: First-Time Buyer
- [ ] Navigate to `/wizard`
- [ ] Fill in Scenario 3 data (Dallas, $60k income, first-time)
- [ ] Submit wizard
- [ ] **Verify:** maxAffordable > 0
- [ ] **Verify:** No VA Loan in recommendations
- [ ] **Verify:** FHA or First-Time Buyer programs recommended
- [ ] **Verify:** Down payment assistance mentioned

#### Test 4: Fallback Report (Disable AI)
- [ ] Temporarily remove/invalidate GOOGLE_API_KEY
- [ ] Navigate to `/wizard`
- [ ] Fill in Scenario 6 data
- [ ] Submit wizard
- [ ] **Verify:** maxAffordable > 0 (calculated by fallback)
- [ ] **Verify:** No VA Loan in recommendations
- [ ] **Verify:** `aiGenerated: false` in debug data
- [ ] **Verify:** Report still displays correctly

#### Test 5: Edge Cases
- [ ] Test with $0 down payment
- [ ] Test with very low income ($30k)
- [ ] Test with very high income ($500k)
- [ ] Test with multiple buyer types (veteran + first-time)
- [ ] Test in Spanish language (verify "Máximo Asequible" displays correctly)

### Console Log Verification
For each test, verify console shows:
- [ ] "📊 AI Response Extraction:" with all values populated
- [ ] If non-veteran with VA Loan: "⚠️ Filtering out VA Loan recommendation - user is not a veteran"
- [ ] No errors or warnings about undefined values

### Debug Panel Verification
For each test, verify debug JSON shows:
- [ ] `maxAffordable` has numeric value > 0
- [ ] `estimatedPrice` is reasonable
- [ ] `monthlyPayment` is reasonable
- [ ] `programFit` array contains appropriate programs
- [ ] `aiGenerated` is true (or false for fallback test)

---

## Expected Console Output Examples

### Successful Non-Veteran (Should Filter VA Loan)
```
📊 AI Response Extraction: {
  estimatedPrice: 437500,
  maxAffordable: 350000,
  monthlyPayment: 2917,
  programCount: 1,
  programs: ['Conventional Loan']
}
⚠️  Filtering out VA Loan recommendation - user is not a veteran
```

### Successful Veteran (Should Keep VA Loan)
```
📊 AI Response Extraction: {
  estimatedPrice: 300000,
  maxAffordable: 350000,
  monthlyPayment: 2100,
  programCount: 2,
  programs: ['VA Loan', 'Conventional Loan']
}
```

---

## Regression Tests

### Existing Functionality to Verify
- [ ] Wizard navigation still works
- [ ] Form validation still works
- [ ] Lead submission to CRM still works
- [ ] Email report still works
- [ ] Language switching still works
- [ ] Mobile responsive layout still works
- [ ] All other loan programs (FHA, USDA, Conventional) still recommended appropriately

---

## Success Criteria

### Fix #1 - maxAffordable (Must Pass All)
- ✅ maxAffordable is always > 0 for valid income
- ✅ maxAffordable is extracted from AI response
- ✅ maxAffordable falls back to calculation when AI fails
- ✅ maxAffordable is displayed correctly in UI
- ✅ maxAffordable is reasonable relative to income (3-4x annual income)

### Fix #2 - VA Loan Filtering (Must Pass All)
- ✅ VA Loan NOT recommended for non-veteran buyers
- ✅ VA Loan IS recommended for veteran buyers
- ✅ Filtering works for both AI and fallback reports
- ✅ Other loan programs not affected by filtering
- ✅ Console logs indicate when VA Loan is filtered

### Overall Quality (Must Pass All)
- ✅ No new TypeScript errors
- ✅ No runtime errors in console
- ✅ No undefined values in report data
- ✅ UI displays all fields correctly
- ✅ Spanish and English both work
- ✅ Performance not degraded

---

## Test Results Documentation

### Test Execution Log
```
Date: _____________
Tester: _____________

Test 1 - Original Bug Case: [ PASS / FAIL ]
  - maxAffordable > 0: ___________
  - No VA Loan: ___________
  - Notes: ___________________________

Test 2 - Veteran Buyer: [ PASS / FAIL ]
  - maxAffordable > 0: ___________
  - VA Loan included: ___________
  - Notes: ___________________________

Test 3 - First-Time Buyer: [ PASS / FAIL ]
  - maxAffordable > 0: ___________
  - No VA Loan: ___________
  - Notes: ___________________________

... (continue for all tests)
```

---

## Known Limitations & Future Improvements

1. **AI Response Variability**: AI may still occasionally recommend VA Loan in text even after filtering from programFit array
2. **Edge Cases**: Very low income (<$30k) may produce low maxAffordable that appears incorrect
3. **Fallback Calculation**: Fallback maxAffordable is estimated, not exact
4. **Additional Filters**: May need similar filters for USDA, ITIN, etc.

---

## Rollback Plan

If tests fail:
1. Revert changes to `src/lib/services/ai-service.ts`
2. Use git: `git checkout src/lib/services/ai-service.ts`
3. Investigate failed test case
4. Apply more targeted fix
