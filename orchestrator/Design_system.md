# Design System: Visual Specifications

*Complete visual design guide for consistent, accessible, and beautiful user interfaces*

***

## 🎨 **Design Philosophy**

### **Core Design Principles**
1. **Clarity First**: Information hierarchy guides user attention
2. **Accessibility**: WCAG 2.1 AA compliance minimum
3. **Consistency**: Predictable patterns across all interfaces
4. **Progressive Disclosure**: Show what's needed, when it's needed
5. **Mobile-First**: Touch-friendly, thumb-reachable design
6. **Minimalist Elegance**: Flat, clean, restrained use of color and depth

### **Visual Language**
- **Warm & Minimal**: Default #faf9f5 background creates friendly atmosphere
- **Subtle Color Use**: Orange accent used sparingly for CTAs only
- **Black Typography**: Headings and primary text in black for clarity
- **Gray Icons & Neutrals**: Icons always gray, never black
- **Flat Design**: Shadows only for cards, subtle and soft
- **Progressive Enhancement**: Visual feedback appears only on interaction

***

## 📋 **Design System Contracts**

### **Implementation Contract**
**ALL developers and contributors agree to:**

1. **Zero Deviation Policy**: Components MUST be implemented exactly as specified
2. **Token-Only Policy**: NO hardcoded colors, spacing, or typography values
3. **Accessibility Contract**: ALL implementations MUST meet WCAG 2.1 AA standards
4. **Mobile-First Contract**: ALL components MUST work on 320px+ viewports
5. **Performance Contract**: Design implementations MUST stay within CSS budget (≤100KB)

### **Design System Compliance**
**Required before ANY UI implementation:**
- [ ] Design tokens validated against DESIGN_SYSTEM.md
- [ ] Color contrast ratios measured (4.5:1 minimum)
- [ ] Touch targets confirmed 44px+ on mobile
- [ ] Focus states implemented and tested
- [ ] Screen reader compatibility verified

### **Violation Consequences**
- **Code Review Blocking**: Non-compliant code will be rejected
- **Deployment Blocking**: UI violations prevent production deployment
- **Required Remediation**: All violations must be fixed before merge

***

## 🔄 **Change Control Process**

### **Design System Governance**
- **Design System Owner**: Lead Developer/Designer
- **Change Authority**: Requires approval from system owner
- **Documentation**: All changes must update this document
- **Backwards Compatibility**: Changes must not break existing implementations

### **Change Request Process**
1. **Issue Creation**: Document the need for change with specific use cases
2. **Impact Assessment**: Analyze effects on existing components
3. **Stakeholder Review**: Get approval from design system owner
4. **Documentation Update**: Update this file with new specifications
5. **Implementation**: Roll out changes across all components
6. **Validation**: Test all affected components for compliance

### **Emergency Changes**
For critical accessibility or performance issues:
- Immediate fixes allowed with post-hoc documentation
- Must create tracking issue within 24 hours
- Full review and documentation within 1 week

### **Deprecation Policy**
- **6-month notice**: All breaking changes require advance warning
- **Migration path**: Provide clear upgrade instructions
- **Support timeline**: Old patterns supported during transition period

***

## 🌈 **Color System (Minimalist)**

### **Brand Colors**
```css
/* Primary Brand Colors */
--color-primary: #D97706;           /* Orange - Main brand accent */
--color-primary-hover: #B45309;     /* Darker orange - Interactive states */
--color-primary-light: #FED7AA;     /* Light orange - subtle hover */
--color-background: #faf9f5;        /* Warm default background */
--color-black: #000000;             /* Primary text color */
```

#### **When to Use Primary Colors:**
- **Primary**: Main CTAs, links, rare brand elements
- **Primary Hover**: Hover states, pressed buttons
- **Primary Light**: Subtle backgrounds (hover/active states)
- **Background**: **DEFAULT PAGE BACKGROUND** - All pages use #faf9f5
- **Black**: Main text and headings

### **Card Colors**
```css
/* Card Backgrounds */
--color-card-bg: #FDFCFA;           /* Default card */
--color-card-bg-soft: #F0EEE6;      /* Card soft (no border) */
```

### **Semantic Colors (Reduced)**
```css
/* Success States */
--color-success: #10B981;
--color-warning: #F59E0B;
--color-error: #EF4444;
--color-info: #3B82F6;
```
> Use only for status-driven alerts and form validation.

### **Neutral Palette**
```css
/* Neutral Colors */
--color-white: #FFFFFF;
--color-gray-50: #F9FAFB;
--color-gray-100: #F3F4F6;
--color-gray-200: #E5E7EB;
--color-gray-300: #D1D5DB;
--color-gray-400: #9CA3AF;
--color-gray-500: #6B7280;
--color-gray-600: #4B5563;
--color-gray-700: #374151;
--color-gray-800: #1F2937;
--color-gray-900: #111827;
```

### **Color Usage Guidelines**

#### **✅ DO:**
- Use orange sparingly for CTAs and key highlights
- Use black for headings and main body text
- Use gray for secondary or meta information
- Keep icons gray only, never black

#### **❌ DON'T:**
- Use bright semantic colors in normal UI
- Overuse orange for backgrounds
- Add shadows to non-card elements

***

## ✍️ **Typography System**

### **Font Family**
```css
/* Primary Font Families */
--font-family-headers: 'Poppins', sans-serif;
--font-family-body: 'Quicksand', sans-serif;
--font-family-buttons: 'Quicksand', sans-serif;
--font-family-inputs: 'Quicksand', sans-serif;
```

### **Font Usage Guidelines**
- **Headings**: Black, Poppins, medium weight
- **Body Text**: Black for primary, gray-600 for secondary
- **Links**: Orange, underline on hover
- **Input Fields**: Quicksand font for text inputs
- **Bold Policy**: Minimal, black only

***

## 🔍 **Icon System**

### **Icon Guidelines**
- **Source**: Material Symbols Light (outlined)
- **Size**: 20px or 24px
- **Color**: Always neutral gray (never black)
- **No custom SVGs**
- **No icons in buttons**
- **Functional only**

***

## 🗂️ **Card Components**

### **Shadows (Minimalist)**
```css
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.04);
--shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.05);
```

### **Main Card Variants** (3 TYPES)

#### **Default Card (`.card`)**
- Background: `--color-card-bg`
- Border: 1px solid `--color-gray-200`
- **Shadow:** `var(--shadow-sm)` (light, soft)

#### **Card Soft (`.card-soft`)**
- Background: `--color-card-bg-soft`
- Border: none
- **Shadow:** none (flat)

#### **Card Hover (`.card-hover`)**
- Background: transparent → `#FDFCFA` on hover
- Border: 1px solid `--color-gray-200` → `--color-gray-400` on hover
- **Shadow:** `var(--shadow-xs)` default → `var(--shadow-sm)` on hover

***

## 🔘 **Button System**

### **Button Philosophy**
- **Primary CTA**: Orange fill + white text
- **Secondary**: Black border + black text (flat)
- **Tertiary**: Text-only (black), underline on hover
- **Destructive**: Red border/text only
- **No shadows** on any button

***

## 📝 **Form Elements**

- Flat design: borders + background only
- Focus: border + outline color glow (no shadows)
- Labels: black or gray-700
- Input text: Quicksand font family
- Errors/success: semantic border colors only

***

## 🎯 **Feedback States**

- Alerts: Border + background only, no shadows
- Loading: Spinner/skeleton, no shadows
- Status colors: used sparingly

***

## 📱 **Responsive Design**

- Mobile-first, fluid grid
- No shadows on responsive adjustments

***

## 🎭 **Animation & Transitions**

- Use opacity, transform, and color transitions only
- No shadow-based animations
- Motion: fade, slide, scale (subtle)

***

## 📏 **Spacing System**

4px base scale (4, 8, 16, 24, etc.)

***

## ✅ **Design System Checklist**

- Colors: minimal palette, contrast 4.5:1+
- Text: black primary, gray secondary, orange accent only
- Icons: gray only, never black
- Shadows: only on cards (xs/sm)
- Buttons/forms: flat, border + color only
- Responsive + accessible at all breakpoints

***

**Remember**: Minimalist design = restraint. Use orange or non-black/gray/background color sparingly, rely on black typography, neutral grays, and flat surfaces for clarity.

***

*Last Updated: August 2025 — minimalist palette + card-only shadows applied*

