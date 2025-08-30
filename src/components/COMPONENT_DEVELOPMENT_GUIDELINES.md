# Component Development Guidelines & Standards

**Architectural guidelines to prevent future typography and component display issues**

## 🎯 Design System Compliance Requirements

### **CRITICAL RULE: Zero Deviation Policy**
All components MUST be implemented exactly as specified in `Design_system.md`. No exceptions.

## 📋 Pre-Development Checklist

Before creating ANY component, developers MUST:

- [ ] Read and understand `Design_system.md` specifications
- [ ] Verify design tokens are available in `design-system.css`
- [ ] Check existing components for similar patterns
- [ ] Plan for accessibility requirements (WCAG 2.1 AA)
- [ ] Ensure mobile-first responsive approach (320px+)

## 🏗️ Component Architecture Standards

### **1. Component Creation Pattern**

```javascript
// ✅ CORRECT Component Creation
function createMyComponent(config = {}) {
  const {
    variant = 'default',
    size = 'md',
    className = '',
    ...props
  } = config;
  
  // 1. Create base element
  const element = document.createElement('div');
  
  // 2. Apply design system classes ONLY
  element.className = `my-component my-component-${variant} ${className}`.trim();
  
  // 3. Use CSS custom properties for dynamic styling
  if (props.customColor) {
    element.style.backgroundColor = `var(--color-${props.customColor})`;
  }
  
  // 4. Apply accessibility attributes
  element.setAttribute('role', 'button');
  element.setAttribute('aria-label', props.ariaLabel || 'Component');
  
  return element;
}
```

### **2. Forbidden Patterns**

```javascript
// ❌ WRONG - Using non-design-system classes
element.className = 'flex items-center p-4 bg-blue-500 text-white';

// ❌ WRONG - Hardcoded values
element.style.color = '#D97706';
element.style.padding = '16px';
element.style.fontFamily = 'Arial, sans-serif';

// ❌ WRONG - Mixed frameworks
element.className = 'card flex justify-between p-4';

// ❌ WRONG - Inline styles for design system values
element.style.cssText = `
  background: #D97706;
  font-family: Quicksand, sans-serif;
  padding: 16px;
`;
```

## 🎨 Styling Architecture

### **1. Class Naming Conventions**

```css
/* Component Base Classes */
.component-name { /* Base styles */ }
.component-name-variant { /* Variant styles */ }
.component-name-size-sm { /* Size modifiers */ }
.component-name-state-disabled { /* State modifiers */ }

/* Example: Button Component */
.btn { /* Base button styles */ }
.btn-primary { /* Primary variant */ }
.btn-sm { /* Small size */ }
.btn:disabled { /* Disabled state */ }
```

### **2. CSS Custom Properties Usage**

```javascript
// ✅ CORRECT - Using design tokens
element.style.backgroundColor = 'var(--color-primary)';
element.style.fontSize = 'var(--font-size-lg)';
element.style.padding = 'var(--space-4)';
element.style.fontFamily = 'var(--font-family-body)';

// ❌ WRONG - Hardcoded values
element.style.backgroundColor = '#D97706';
element.style.fontSize = '18px';
element.style.padding = '16px';
element.style.fontFamily = 'Quicksand, sans-serif';
```

### **3. Design System Utility Classes**

**Use `ds-*` prefixed classes instead of framework utilities:**

```javascript
// ✅ CORRECT - Design system utilities
container.className = 'ds-flex ds-items-center ds-gap-4 ds-p-6';

// ❌ WRONG - Tailwind/Bootstrap utilities
container.className = 'flex items-center gap-4 p-6';
```

**Available Design System Classes:**
- Layout: `ds-flex`, `ds-grid`, `ds-flex-col`, `ds-items-center`, `ds-justify-between`
- Spacing: `ds-gap-4`, `ds-p-6`, `ds-mb-4`, `ds-mt-2`
- Typography: `ds-text-center`, `ds-text-secondary`, `ds-text-large`
- Display: `ds-block`, `ds-hidden`, `ds-w-full`

## 🖋️ Typography Requirements

### **1. Font Family Enforcement**

```javascript
// ✅ CORRECT - Typography patterns
const heading = document.createElement('h2');
heading.style.fontFamily = 'var(--font-family-headers)'; // Poppins

const bodyText = document.createElement('p');
bodyText.style.fontFamily = 'var(--font-family-body)'; // Quicksand

const button = document.createElement('button');
button.className = 'btn btn-secondary'; // Automatically uses Quicksand

const input = document.createElement('input');
input.className = 'form-control'; // Automatically uses Quicksand
```

### **2. Typography System Tokens**

**Font Families:**
- `--font-family-headers`: Poppins (for h1-h6)
- `--font-family-body`: Quicksand (for body text, p, div, span)
- `--font-family-buttons`: Quicksand (for all buttons)
- `--font-family-inputs`: Quicksand (for form elements)

**Font Sizes:**
- `--font-size-xs`: 12px
- `--font-size-sm`: 14px
- `--font-size-base`: 13px (body text)
- `--font-size-lg`: 18px
- `--font-size-xl`: 20px
- `--font-size-2xl`: 24px

## 🃏 Component Types & Standards

### **1. Button Components**

```javascript
// ✅ CORRECT Button Implementation
function createButton(config = {}) {
  const {
    text = 'Button',
    variant = 'secondary', // Secondary-first philosophy
    size = 'md',
    onClick,
    disabled = false,
    ariaLabel
  } = config;
  
  const button = document.createElement('button');
  button.className = `btn btn-${variant}`;
  
  if (size !== 'md') {
    button.className += ` btn-${size}`;
  }
  
  button.textContent = text;
  button.disabled = disabled;
  
  if (ariaLabel) {
    button.setAttribute('aria-label', ariaLabel);
  }
  
  if (onClick) {
    button.addEventListener('click', onClick);
  }
  
  return button;
}

// Usage examples
const primaryBtn = createButton({ text: 'Get Started', variant: 'primary' });
const secondaryBtn = createButton({ text: 'Cancel' }); // Default secondary
const tertiaryBtn = createButton({ text: 'Skip', variant: 'tertiary' });
```

### **2. Card Components**

```javascript
// ✅ CORRECT Card Implementation
function createCard(config = {}) {
  const {
    variant = 'default', // default, soft, hover
    content = '',
    onClick,
    className = ''
  } = config;
  
  const card = document.createElement('div');
  
  // Apply appropriate card class
  if (variant === 'default') {
    card.className = `card ${className}`.trim();
  } else {
    card.className = `card-${variant} ${className}`.trim();
  }
  
  if (content) {
    card.innerHTML = content;
  }
  
  // Add interaction for hover cards
  if (variant === 'hover' && onClick) {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.addEventListener('click', onClick);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick(e);
      }
    });
  }
  
  return card;
}
```

### **3. Form Components**

```javascript
// ✅ CORRECT Form Implementation
function createFormField(config = {}) {
  const {
    type = 'text',
    label = '',
    placeholder = '',
    required = false,
    validation,
    className = ''
  } = config;
  
  const wrapper = document.createElement('div');
  wrapper.className = `form-group ${className}`.trim();
  
  // Label
  if (label) {
    const labelEl = document.createElement('label');
    labelEl.textContent = label;
    labelEl.style.fontFamily = 'var(--font-family-body)';
    wrapper.appendChild(labelEl);
  }
  
  // Input
  const input = document.createElement('input');
  input.type = type;
  input.placeholder = placeholder;
  input.required = required;
  input.className = 'form-control';
  
  // Input automatically gets Quicksand font from design system
  
  wrapper.appendChild(input);
  
  return { wrapper, input };
}
```

## ♿ Accessibility Requirements

### **1. WCAG 2.1 AA Compliance Checklist**

- [ ] **Color Contrast**: 4.5:1 minimum ratio for normal text, 3:1 for large text
- [ ] **Touch Targets**: 44px minimum for interactive elements
- [ ] **Keyboard Navigation**: Tab order, Enter/Space activation
- [ ] **Screen Reader Support**: Proper ARIA labels and roles
- [ ] **Focus Management**: Visible focus indicators

### **2. Accessibility Implementation Pattern**

```javascript
// ✅ CORRECT Accessibility Implementation
function createAccessibleComponent(config = {}) {
  const element = document.createElement('button');
  
  // 1. Semantic HTML
  element.setAttribute('role', 'button');
  
  // 2. Proper labeling
  element.setAttribute('aria-label', config.ariaLabel || config.text);
  
  // 3. Keyboard support
  element.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      element.click();
    }
  });
  
  // 4. Focus management
  element.addEventListener('focus', () => {
    element.style.outline = '2px solid var(--color-primary)';
    element.style.outlineOffset = '2px';
  });
  
  // 5. Touch target size
  element.style.minHeight = '44px';
  element.style.minWidth = '44px';
  
  return element;
}
```

## 📱 Responsive Design Standards

### **1. Mobile-First Approach**

```javascript
// ✅ CORRECT Responsive Implementation
function createResponsiveComponent() {
  const component = document.createElement('div');
  component.className = 'ds-flex ds-flex-col';
  
  // Mobile-first: Stack vertically
  // Tablet and up: Horizontal layout
  component.style.cssText = `
    gap: var(--space-4);
  `;
  
  // Add responsive behavior with CSS media queries
  const style = document.createElement('style');
  style.textContent = `
    @media (min-width: 768px) {
      .responsive-component {
        flex-direction: row;
        gap: var(--space-6);
      }
    }
  `;
  
  if (!document.head.querySelector('#responsive-component-styles')) {
    style.id = 'responsive-component-styles';
    document.head.appendChild(style);
  }
  
  return component;
}
```

### **2. Breakpoint Standards**

- **Mobile**: 320px - 767px (primary focus)
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px+

Use design system breakpoint tokens:
- `--breakpoint-sm`: 480px
- `--breakpoint-md`: 768px
- `--breakpoint-lg`: 1024px

## 🧪 Component Testing Standards

### **1. Validation Testing**

```javascript
// Test component against design system violations
function testComponent(component) {
  // Load the validator
  if (typeof DesignSystemValidator !== 'undefined') {
    const violations = DesignSystemValidator.validateElement(component);
    
    if (violations.length > 0) {
      console.warn('Design System Violations:', violations);
      return false;
    }
  }
  
  return true;
}

// Usage
const myButton = createButton({ text: 'Test' });
document.body.appendChild(myButton);
testComponent(myButton);
```

### **2. Manual Testing Checklist**

- [ ] Component renders correctly on mobile (320px)
- [ ] Typography uses correct design system fonts
- [ ] Colors match design system tokens
- [ ] Interactive elements meet 44px minimum
- [ ] Keyboard navigation works
- [ ] Screen reader announces properly
- [ ] Focus indicators are visible
- [ ] No design system violations detected

## 🚨 Common Violation Patterns to Avoid

### **1. Typography Violations**

```javascript
// ❌ WRONG - Browser default fonts
element.style.fontFamily = 'Arial, sans-serif';

// ❌ WRONG - Hardcoded font sizes
element.style.fontSize = '16px';

// ❌ WRONG - Missing font declarations
const modal = document.createElement('div');
modal.innerHTML = '<p>Content</p>'; // Might inherit browser defaults
```

### **2. Spacing Violations**

```javascript
// ❌ WRONG - Hardcoded spacing
element.style.margin = '16px';
element.style.padding = '8px 12px';

// ❌ WRONG - Non-design-system classes
element.className = 'p-4 mb-6 gap-3';
```

### **3. Color Violations**

```javascript
// ❌ WRONG - Hardcoded colors
element.style.backgroundColor = '#D97706';
element.style.color = '#000000';

// ❌ WRONG - CSS color names
element.style.backgroundColor = 'orange';
```

## 🔧 Development Tools

### **1. Design System Validator**

```javascript
// Enable development mode for real-time violation detection
DesignSystemValidator.enableDevMode();

// Validate entire page
const report = DesignSystemValidator.validatePage();
console.log('Compliance Score:', report.compliance.score + '%');

// Quick console commands
dsValidate(); // Run validation
dsDevMode();  // Enable dev mode
dsDevOff();   // Disable dev mode
```

### **2. Component Testing Template**

```javascript
// Copy this template for new components
function createNewComponent(config = {}) {
  // 1. Configuration with defaults
  const {
    variant = 'default',
    size = 'md',
    className = '',
    ariaLabel,
    ...props
  } = config;
  
  // 2. Create element
  const element = document.createElement('div');
  
  // 3. Apply design system classes
  element.className = `new-component new-component-${variant} ${className}`.trim();
  
  // 4. Apply accessibility
  if (ariaLabel) {
    element.setAttribute('aria-label', ariaLabel);
  }
  
  // 5. Add CSS custom properties for dynamic values
  if (props.customSpacing) {
    element.style.padding = `var(--space-${props.customSpacing})`;
  }
  
  // 6. Test before returning
  if (typeof testComponent === 'function') {
    testComponent(element);
  }
  
  return element;
}
```

## 📚 Reference Materials

- **Design System**: `Design_system.md` - Master specification
- **CSS Tokens**: `design-system.css` - Implementation reference  
- **Validator**: `design-system-validator.js` - Compliance checking
- **Components**: `src/components/` - Existing component examples

## 🎯 Quality Gates

Before merging any component code:

1. **Design System Validation**: 90%+ compliance score required
2. **Accessibility Testing**: All WCAG 2.1 AA requirements met
3. **Typography Verification**: Quicksand/Poppins fonts applied universally
4. **Mobile Testing**: Works correctly on 320px+ viewports
5. **Performance Check**: No unnecessary CSS or DOM bloat

## 📋 Component Creation Workflow

1. **Plan**: Review design system specifications
2. **Create**: Use architectural patterns and guidelines
3. **Validate**: Run design system validator
4. **Test**: Manual accessibility and responsive testing
5. **Document**: Update component documentation
6. **Review**: Code review focusing on design system compliance

---

**Remember**: The design system exists to prevent the exact issues we've seen with typography and avatar components. Following these guidelines prevents future architectural problems and ensures consistent user experience across the application.