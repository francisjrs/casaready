# Wizard End-to-End Test Results & Fix Plan

## Test Date: 2025-09-29
## Test Environment: http://localhost:3000/wizard
## Browser: Playwright (Chromium)

---

## Executive Summary

✅ **Tested**: Wizard navigation, language switching, form inputs, city autocomplete
❌ **Critical Issue Found**: Translation keys displaying instead of translated text
🔍 **Root Cause**: Mismatch between translation key paths in code vs. i18n.ts structure

---

## Issues Found

### 🔴 Issue #1: Translation Keys Showing Instead of Translated Text (CRITICAL)

**Severity**: HIGH - Breaks user experience completely

**Description**: Throughout the wizard interface, raw translation keys like `wizard.page.badge`, `wizard.steps.location.header`, `wizard.cityAutocomplete.metroBadge` are displayed instead of the actual translated text.

**Affected Areas**:
- Wizard page header (badge, title, subtitle)
- Progress indicator titles
- Step headers and subtitles
- Form field labels and placeholders
- Location step: all fields and priorities
- Timeline step: all options and labels
- City autocomplete: metro badge, error messages
- Help text and tips
- Support section labels

**Screenshots**:
- `/Users/framos/projects/casaready/.playwright-mcp/wizard-initial-load.png`
- `/Users/framos/projects/casaready/.playwright-mcp/wizard-spanish-with-issues.png`
- `/Users/framos/projects/casaready/.playwright-mcp/wizard-austin-autocomplete.png`
- `/Users/framos/projects/casaready/.playwright-mcp/wizard-step2-timeline.png`

**Examples of Untranslated Keys**:
```
- wizard.page.badge
- wizard.page.title
- wizard.page.titleHighlight
- wizard.page.subtitle
- wizard.page.supportTitle
- wizard.page.callUs
- wizard.page.textUs
- wizard.page.liveChat
- wizard.progress.title
- wizard.progress.progressLabel
- wizard.progress.stepCounter
- wizard.progress.percentComplete
- wizard.steps.location.header
- wizard.steps.location.subtitle
- wizard.steps.location.preferredLocationTitle
- wizard.steps.location.fields.city
- wizard.steps.location.fields.zipCode
- wizard.steps.location.fields.cityPlaceholder
- wizard.steps.location.fields.zipPlaceholder
- wizard.steps.location.prioritiesTitle
- wizard.steps.location.priorities.schools
- wizard.steps.location.priorities.commute
- wizard.steps.location.priorities.safety
- wizard.steps.location.priorities.walkability
- wizard.steps.location.priorities.shopping
- wizard.steps.location.priorities.parks
- wizard.steps.location.priorities.nightlife
- wizard.steps.location.priorities.diversity
- wizard.steps.timeline.sectionTitle
- wizard.steps.timeline.options.0-3.label
- wizard.steps.timeline.options.0-3.description
- wizard.steps.timeline.urgentBadge
- wizard.cityAutocomplete.metroBadge
- wizard.cityAutocomplete.noCitiesFound
- wizard.cityAutocomplete.tryDifferentCity
- wizard.shared.tip
- wizard.progressRestoration.progressSaved
- wizard.stepIndicator.actionDescriptions.clickToNavigate
- wizard.stepIndicator.actionDescriptions.futureStep
- wizard.stepIndicator.currentStepAnnouncement
```

**Root Cause Analysis**:

The `getNestedTranslation()` function in `/Users/framos/projects/casaready/src/lib/i18n.ts` (lines 1688-1704) returns the translation key itself when a translation is not found:

```typescript
export function getNestedTranslation(
  translations: Translation,
  path: string
): string {
  const keys = path.split('.');
  let current: any = translations;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return path; // ❌ Returns key when not found
    }
  }

  return typeof current === 'string' ? current : path;
}
```

**Translation Structure Issue**:

The i18n.ts file has wizard translations nested under `pages.wizard` (starting at line 165):

```typescript
export const translations: Record<Locale, Translation> = {
  en: {
    common: {...},
    nav: {...},
    pages: {
      home: {...},
      wizard: {              // ← Nested under 'pages'
        page: {
          badge: '🏠 AI-Powered Analysis',
          // ...
        },
        steps: {
          location: {...}
        }
      }
    }
  }
}
```

But the code is calling `t('wizard.page.badge')` instead of `t('pages.wizard.page.badge')`.

---

### ✅ Issue #2: Language Switching Works

**Status**: WORKING CORRECTLY

**Test Results**:
- Language toggle button works ✓
- Switching from English to Spanish updates:
  - Navigation labels ("Anterior", "Siguiente")
  - Step names ("Ubicación y Preferencias", "Cronograma")
  - Form labels
  - Footer sections ("Servicios", "Áreas de Servicio", "Contacto")
  - Accessibility text ("Enlaces de salto", "Saltar al contenido principal")
  - Step counter ("Paso 1 de 10", "Paso 2 de 10")

**Note**: While switching works, the untranslated keys remain visible in both languages.

---

### ✅ Issue #3: Form Functionality Works

**Status**: WORKING CORRECTLY

**Test Results**:
- City autocomplete triggers correctly ✓
- Search results appear for "Austin" ✓
- City selection works (Austin, Travis County) ✓
- ZIP code suggestion appears after city selection ✓
- Step navigation works ("Siguiente" button) ✓
- Progress tracking works (Step 1→2, 10%→20%) ✓
- Form state persists (localStorage save detected) ✓

---

### ⚠️ Issue #4: Mixed Translation Keys in Some Components

**Severity**: MEDIUM

**Description**: Some components show BOTH the translation key AND hardcoded English text:

**Example** (from wizard page line 68):
```tsx
<p className="text-sm text-gray-500 mb-4">
  {t('wizard.page.supportTitle')} Our home buying specialists are here to assist you.
</p>
```

This results in output like:
```
wizard.page.supportTitle Our home buying specialists are here to assist you.
```

**Affected Areas**:
- Support section title
- Possibly other components

---

## Fix Plan

### Phase 1: Fix Translation Structure (PRIORITY 1)

**Option A: Update i18n.ts Structure (RECOMMENDED)**

Move all wizard translations from `pages.wizard` to top-level `wizard`:

```typescript
export const translations: Record<Locale, Translation> = {
  en: {
    common: {...},
    nav: {...},
    pages: {
      home: {...}
      // Remove wizard from here
    },
    wizard: {            // ← Move to top level
      page: {
        badge: '🏠 AI-Powered Analysis',
        title: 'Get Your Personalized',
        titleHighlight: 'Home Buying Plan',
        subtitle: '...',
        backToHome: '← Back to Home',
        supportTitle: 'Need help? Our home buying specialists are here to assist you.',
        callUs: 'Call Us:',
        textUs: 'Text Us:',
        liveChat: 'Live Chat Support'
      },
      progress: {...},
      steps: {...},
      cityAutocomplete: {...},
      shared: {...},
      stepIndicator: {...},
      progressRestoration: {...}
    }
  },
  es: {
    // Same structure for Spanish
  }
}
```

**Files to Modify**:
- `src/lib/i18n.ts` - Restructure translations (lines 165-694 for EN, lines 1002-1531 for ES)

**Estimated Time**: 30 minutes

---

**Option B: Update All Component Translation Keys (NOT RECOMMENDED)**

Change all `t('wizard.page.badge')` calls to `t('pages.wizard.page.badge')` throughout the codebase.

**Files to Modify**:
- `src/app/wizard/page.tsx`
- `src/components/wizard/*.tsx` (11+ files)
- All wizard step components

**Estimated Time**: 2-3 hours
**Risk**: Higher chance of errors, more files to modify

---

### Phase 2: Remove Hardcoded Text (PRIORITY 2)

**Fix mixed translation key + hardcoded text issues**:

**File**: `src/app/wizard/page.tsx` (line 68)

❌ **Before**:
```tsx
<p className="text-sm text-gray-500 mb-4">
  {t('wizard.page.supportTitle')} Our home buying specialists are here to assist you.
</p>
```

✅ **After**:
```tsx
<p className="text-sm text-gray-500 mb-4">
  {t('wizard.page.supportTitle')}
</p>
```

**Update i18n.ts** to include full text in translation:
```typescript
supportTitle: 'Need help? Our home buying specialists are here to assist you.'
```

**Files to Check**:
- Search for mixed patterns: `{t('...')} some hardcoded text`
- Grep pattern: `\{t\(['"].*?['"]\)\}.*[A-Z]`

**Estimated Time**: 15 minutes

---

### Phase 3: Add Missing Translation Keys (PRIORITY 3)

**Verify all recently added translation keys exist**:

Check these keys added during localization work:
- `wizard.cityAutocomplete.metroBadge` ✓ (added)
- `wizard.cityAutocomplete.noCitiesFound` ✓ (added)
- `wizard.cityAutocomplete.tryDifferentCity` ✓ (added)

**Status**: All recently added keys are present in i18n.ts

**Estimated Time**: Already complete

---

### Phase 4: Add Fallback Handling (PRIORITY 4 - OPTIONAL)

**Improve `getNestedTranslation()` for better debugging**:

```typescript
export function getNestedTranslation(
  translations: Translation,
  path: string,
  locale?: Locale
): string {
  const keys = path.split('.');
  let current: any = translations;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      // Better error handling for development
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Translation key not found: ${path} (locale: ${locale})`);
      }
      return path; // Fallback to key
    }
  }

  if (typeof current === 'string') {
    return current;
  }

  if (process.env.NODE_ENV === 'development') {
    console.warn(`Translation key returned non-string: ${path}`);
  }
  return path;
}
```

**Estimated Time**: 15 minutes

---

## Implementation Order

### Step 1: Fix Translation Structure (Option A)
1. Open `src/lib/i18n.ts`
2. Copy entire `pages.wizard` section (EN and ES)
3. Move to top-level `wizard` key
4. Remove old `pages.wizard` section
5. Verify structure matches code expectations
6. Test in browser

### Step 2: Remove Hardcoded Text
1. Update `src/app/wizard/page.tsx` line 68
2. Update `src/lib/i18n.ts` with full support title text
3. Search for other mixed patterns
4. Test in browser

### Step 3: Verify & Test
1. Restart dev server
2. Test wizard in English
3. Test wizard in Spanish
4. Test all 10 wizard steps
5. Test city autocomplete
6. Verify no translation keys visible

### Step 4: Optional Improvements
1. Add console warnings for missing keys
2. Add TypeScript types for translation keys
3. Create translation key validation script

---

## Testing Checklist

After fixes are applied, verify:

- [ ] Wizard page header shows translated text (not keys)
- [ ] All form labels show translated text
- [ ] City autocomplete shows "Metro" badge (not key)
- [ ] All step headers show translated text
- [ ] Timeline options show translated text
- [ ] Progress indicator shows translated text
- [ ] Support section shows translated text
- [ ] Tips and help text show translated text
- [ ] Language switching updates all text correctly
- [ ] English translations work
- [ ] Spanish translations work
- [ ] No console errors related to translations

---

## Success Criteria

✅ **Complete when**:
1. Zero translation keys visible in UI
2. All text displays correctly in English
3. All text displays correctly in Spanish
4. Language switching works for all text
5. No console errors or warnings
6. All 10 wizard steps render correctly

---

## Additional Notes

### Environment Issues (Non-blocking)
Console shows these warnings (unrelated to localization):
```
- Invalid environment variables: GEMINI_API_KEY: expected string, received undefined
- Zapier webhook URL not configured
```

These are expected in development and don't affect wizard functionality.

---

## Estimated Total Time

- **Phase 1 (Option A)**: 30 minutes ⭐ RECOMMENDED
- **Phase 2**: 15 minutes
- **Phase 3**: Complete
- **Phase 4**: 15 minutes (optional)
- **Testing**: 20 minutes

**Total**: ~1 hour 20 minutes (or ~45 minutes without Phase 4)

---

## Files to Modify

### Critical Path:
1. `src/lib/i18n.ts` - Restructure wizard translations
2. `src/app/wizard/page.tsx` - Remove hardcoded text (line 68)

### Optional:
3. `src/lib/i18n.ts` - Improve `getNestedTranslation()` error handling

---

## End of Report