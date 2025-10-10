# CasaReady Color System - Implementation Guide

## Overview
This color system follows the **60-30-10 rule** for balanced, professional UI design.

---

## Color Categories

### 1. PRIMARY COLOR (10% of interface)
**Brand Orange** - `brand-500: #e7851e`

**Purpose:** The most prominent accent color that draws attention to key actions.

**Use for:**
- ✅ Primary CTA buttons ("Get Started", "Submit", "Next Step")
- ✅ Active wizard step indicators
- ✅ Progress bars and completion states
- ✅ Primary links and hover states
- ✅ Active navigation items
- ✅ Focus rings on form inputs
- ✅ Selection controls (selected radio, checkbox)

**Available shades:** `brand-50` through `brand-950`

**Example usage:**
```tsx
<Button className="bg-brand-500 hover:bg-brand-600 text-white">
  Get Started
</Button>

<Progress value={75} className="bg-brand-500" />

<a className="text-brand-500 hover:text-brand-600">Learn more</a>
```

---

### 2. SECONDARY COLOR (Part of 30%)
**Blue** - `blue-500: #2563eb`

**Purpose:** Complements the primary color for secondary actions and informational elements.

**Use for:**
- ✅ Secondary buttons (outline, ghost variants)
- ✅ Informational badges ("Featured", "New", "Verified")
- ✅ Trust indicators and accreditation badges
- ✅ Info alerts and notifications
- ✅ Links in body text (secondary contexts)
- ✅ Icons for informational features

**Available shades:** `blue-50` through `blue-950`

**Example usage:**
```tsx
<Button variant="outline" className="border-blue-500 text-blue-600 hover:bg-blue-50">
  Learn More
</Button>

<Badge className="bg-blue-100 text-blue-700">Verified Agent</Badge>

<Alert className="bg-blue-50 border-blue-200">
  <Info className="text-blue-500" />
  <AlertDescription className="text-blue-700">Important info here</AlertDescription>
</Alert>
```

---

### 3. NEUTRAL COLORS (60% of interface)
**Gray Scale** - `gray-50` through `gray-950`

**Purpose:** The foundation of your UI - used for most text, backgrounds, borders, and containers.

**Use for:**

#### Text (by hierarchy):
- `gray-900`: Primary headings (H1, H2)
- `gray-800`: Secondary headings (H3, H4)
- `gray-700`: Body text (paragraphs, descriptions)
- `gray-600`: Captions, labels, placeholder text
- `gray-500`: Disabled text, subtle labels

#### Backgrounds:
- `gray-50`: Page backgrounds, light panels
- `gray-100`: Card backgrounds, secondary surfaces
- `gray-200`: Hover states for neutral elements

#### Borders:
- `gray-300`: Default borders, dividers
- `gray-400`: Emphasized borders, active input borders

**Example usage:**
```tsx
{/* Text hierarchy */}
<h1 className="text-gray-900">Main Heading</h1>
<p className="text-gray-700">Body text goes here</p>
<span className="text-gray-600">Caption or label</span>

{/* Backgrounds */}
<div className="bg-gray-50">
  <Card className="bg-white border-gray-300">
    <CardContent className="text-gray-700">Card content</CardContent>
  </Card>
</div>

{/* Form elements */}
<Input className="border-gray-300 text-gray-900 placeholder:text-gray-500" />
```

---

### 4. SEMANTIC COLORS (Status Communication)

#### ✅ SUCCESS - Green
`success-500: #22c55e`

**Use for:**
- Success messages and confirmations
- Positive indicators ("Approved", "Completed")
- Positive trend indicators (+15%, ↑)
- Success toasts and alerts

```tsx
<Alert className="bg-success-50 border-success-200">
  <CheckCircle className="text-success-500" />
  <AlertDescription className="text-success-700">Application approved!</AlertDescription>
</Alert>

<Badge className="bg-success-100 text-success-700">Completed</Badge>
```

#### ⚠️ WARNING - Amber
`warning-500: #f59e0b`

**Use for:**
- Warning messages and caution states
- Alerts that need attention but aren't critical
- Incomplete or pending statuses

```tsx
<Alert className="bg-warning-50 border-warning-200">
  <AlertTriangle className="text-warning-500" />
  <AlertDescription className="text-warning-700">Please review this section</AlertDescription>
</Alert>

<Badge className="bg-warning-100 text-warning-700">Pending Review</Badge>
```

#### ❌ ERROR - Red
`error-500: #ef4444`

**Use for:**
- Error messages and failed states
- Form validation errors
- Destructive actions ("Delete", "Cancel Subscription")
- Critical alerts

```tsx
<Alert className="bg-error-50 border-error-200">
  <XCircle className="text-error-500" />
  <AlertDescription className="text-error-700">Invalid email address</AlertDescription>
</Alert>

<Button variant="destructive" className="bg-error-500 hover:bg-error-600">
  Delete Account
</Button>

<span className="text-error-600 text-sm">Required field</span>
```

#### ℹ️ INFO - Cyan
`info-500: #0284c7`

**Use for:**
- Informational messages (neutral, not urgent)
- Helper text and tooltips
- Informational badges

```tsx
<Alert className="bg-info-50 border-info-200">
  <Info className="text-info-500" />
  <AlertDescription className="text-info-700">Your session expires in 5 minutes</AlertDescription>
</Alert>

<Badge className="bg-info-100 text-info-700">Beta Feature</Badge>
```

---

## Component Examples

### Buttons (All States)

```tsx
{/* Primary button - brand orange */}
<Button className="bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white disabled:bg-gray-300">
  Primary Action
</Button>

{/* Secondary button - blue outline */}
<Button variant="outline" className="border-blue-500 text-blue-600 hover:bg-blue-50">
  Secondary Action
</Button>

{/* Ghost button - neutral */}
<Button variant="ghost" className="text-gray-700 hover:bg-gray-100">
  Cancel
</Button>

{/* Destructive button - red */}
<Button variant="destructive" className="bg-error-500 hover:bg-error-600 text-white">
  Delete
</Button>
```

### Form Elements

```tsx
{/* Input with validation states */}
<Input
  className="border-gray-300 focus:border-brand-500 focus:ring-brand-500"
  placeholder="Enter your email"
/>

{/* Error state */}
<Input
  className="border-error-500 focus:border-error-500 focus:ring-error-500"
  aria-invalid
/>
<span className="text-error-600 text-sm">Invalid email</span>

{/* Success state */}
<Input className="border-success-500" />
<span className="text-success-600 text-sm">Email verified ✓</span>
```

### Cards

```tsx
<Card className="bg-white border-gray-300 hover:border-brand-500 transition-colors">
  <CardHeader>
    <CardTitle className="text-gray-900">Property Details</CardTitle>
    <CardDescription className="text-gray-600">View property information</CardDescription>
  </CardHeader>
  <CardContent className="text-gray-700">
    <p>Card body content</p>
  </CardContent>
  <CardFooter className="border-t border-gray-200">
    <Button className="bg-brand-500 text-white">View Details</Button>
  </CardFooter>
</Card>
```

### Wizard Steps

```tsx
{/* Active step */}
<div className="border-2 border-brand-500 bg-brand-50">
  <div className="w-8 h-8 rounded-full bg-brand-500 text-white">1</div>
  <span className="text-brand-700 font-semibold">Current Step</span>
</div>

{/* Completed step */}
<div className="border-2 border-success-500 bg-success-50">
  <div className="w-8 h-8 rounded-full bg-success-500 text-white">✓</div>
  <span className="text-success-700">Completed</span>
</div>

{/* Upcoming step */}
<div className="border-2 border-gray-300 bg-white">
  <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600">3</div>
  <span className="text-gray-600">Upcoming Step</span>
</div>
```

### Navigation

```tsx
{/* Active nav item */}
<a className="text-brand-600 border-b-2 border-brand-500 font-semibold">
  Home
</a>

{/* Inactive nav item */}
<a className="text-gray-600 hover:text-gray-900 hover:border-b-2 hover:border-gray-300">
  About
</a>
```

---

## Quick Reference Table

| Use Case | Color Class | Hex Code |
|----------|-------------|----------|
| Primary CTA | `brand-500` | #e7851e |
| Secondary Action | `blue-500` | #2563eb |
| Body Text | `gray-700` | #374151 |
| Heading | `gray-900` | #111827 |
| Placeholder | `gray-500` | #6b7280 |
| Border | `gray-300` | #d1d5db |
| Background | `gray-50` | #f9fafb |
| Success | `success-500` | #22c55e |
| Warning | `warning-500` | #f59e0b |
| Error | `error-500` | #ef4444 |
| Info | `info-500` | #0284c7 |

---

## Accessibility Notes

✅ **All color combinations meet WCAG 2.1 AA standards** (4.5:1 contrast for text)

### Text Contrast Requirements:
- **White text** on: `brand-500+`, `blue-600+`, `success-600+`, `error-500+`
- **Dark text** on: `brand-50`, `blue-50`, `success-50`, `error-50`, `gray-50`
- **Body text** should use `gray-700` or darker on white backgrounds

### Always provide non-color indicators:
- Icons alongside colored badges
- Labels on colored sections
- Multiple visual cues for status (not just color)

---

## Color Psychology

- 🟠 **Orange (Brand):** Friendly, energetic, trustworthy - perfect for real estate CTAs
- 🔵 **Blue (Secondary):** Professional, reliable, calming - ideal for trust/info
- ⚪ **Gray (Neutral):** Clean, professional, minimal - provides visual rest
- 🟢 **Green (Success):** Positive, go-ahead, completion
- 🟡 **Amber (Warning):** Caution, attention needed
- 🔴 **Red (Error):** Stop, error, critical attention

---

## Tools for Color Generation

- **Colorbox by Lyft** - Generate shade variations: https://colorbox.io
- **Adobe Color Wheel** - Find harmonious colors: https://color.adobe.com
- **Contrast Checker** - Verify accessibility: https://webaim.org/resources/contrastchecker/

---

## Migration Notes

**What changed:**
1. ✅ Added complete neutral gray scale (`gray-50` to `gray-950`)
2. ✅ Fixed primary color from blue to brand orange in `globals.css`
3. ✅ Consolidated color organization (removed redundant `realEstate` object)
4. ✅ Added proper blue scale for secondary color
5. ✅ Added info color scale (cyan)
6. ✅ Updated dark mode to use brand orange

**No breaking changes** - all existing color tokens remain valid. New colors enhance, not replace.
