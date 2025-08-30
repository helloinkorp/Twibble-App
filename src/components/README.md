# Twibble Component Library

A complete, isolated component library built for the Twibble vocabulary learning application. All components follow the design system specifications with secondary-button-first philosophy and Quicksand typography.

## 🎯 Design Principles

- **Secondary-first philosophy**: Default buttons are secondary style, CTA buttons used sparingly
- **Complete isolation**: Each component works independently
- **WCAG 2.1 AA compliance**: 44px+ touch targets, 4.5:1 contrast ratios
- **Responsive design**: Works from 320px up
- **Quicksand typography**: Applied to buttons, inputs, and body text
- **Design system compliance**: Uses CSS custom properties from design-system.css

## 📁 Component Files

### 🔘 Buttons (`buttons.js`)
- **Primary function**: Interactive button components with secondary-first approach
- **Components**:
  - `createButton()` - Base button factory
  - `createCtaButton()` - Primary CTA (orange, use sparingly)
  - `createSecondaryButton()` - Default style (black border)
  - `createTertiaryButton()` - Text-only minimal button
  - `createDestructiveButton()` - Red styling for dangerous actions
  - `createButtonGroup()` - Related button collections
  - `createLoadingButton()` - Button with loading states
  - `createSubmitButton()` - Form submission with validation

**Key Features**:
- Quicksand font family applied
- 44px minimum touch targets
- Loading states and disabled handling
- Keyboard navigation support
- Secondary-button-first philosophy

### 🃏 Cards (`cards.js`)
- **Primary function**: 3 exact card variants as specified in design system
- **Components**:
  - `createCard()` - Base card factory
  - `createDefaultCard()` - Background + Border + Shadow
  - `createSoftCard()` - Background + No Border + No Shadow
  - `createHoverCard()` - Interactive with hover states
  - `createLessonCard()` - Specialized for lesson display
  - `createAvatarCard()` - For avatar selection
  - `createDayCard()` - For student activity days

**Key Features**:
- Exact implementation of 3 design system variants
- Click/keyboard interaction for hover cards
- Proper ARIA labeling and roles
- Responsive stacking behavior

### 📝 Forms (`forms.js`)
- **Primary function**: Form inputs with Quicksand typography and validation
- **Components**:
  - `createInput()` - Base input factory with validation
  - `createTextInput()` - Standard text input
  - `createNameInput()` - Specialized for onboarding
  - `createNumberInput()` - Number input with quick-select buttons
  - `createAvatarSelector()` - Grid-based avatar picker
  - `createForm()` - Complete form builder

**Key Features**:
- Quicksand font family for inputs
- 44px minimum height for touch targets
- Real-time validation with error states
- Screen reader announcements
- Avatar selector with keyboard navigation
- Upload functionality for custom avatars

### 🧭 Navigation (`navigation.js`)
- **Primary function**: Headers, progress, and navigation components
- **Components**:
  - `createHeader()` - App header with home button and user profile
  - `createProgressIndicator()` - Step-by-step progress display
  - `createAccordion()` - Collapsible content sections
  - `createBreadcrumb()` - Breadcrumb navigation
  - `createTabs()` - Tab-based navigation

**Key Features**:
- Consistent header across all pages
- ARIA-compliant progress indicators
- Keyboard-accessible accordions and tabs
- Proper landmark roles for screen readers
- Responsive behavior for mobile/desktop

### 🎮 Interactive (`interactive.js`)
- **Primary function**: Interactive learning components
- **Components**:
  - `createWordChip()` - Word elements with activity dots
  - `createDropContainer()` - Drag-and-drop target areas
  - `createFlippableCard()` - Vocabulary flashcards
  - `createModal()` - Overlay dialogs with focus management
  - `createLetterAssembly()` - Spelling activity component

**Key Features**:
- Drag-and-drop with keyboard alternatives
- Word chips with difficulty indicators
- Flippable cards with CSS transforms
- Modal focus management and escape handling
- Activity status indicators with color coding

## 🚀 Usage Examples

### Basic Button Usage
```javascript
import { createSecondaryButton, createCtaButton } from './buttons.js';

// Secondary button (default choice)
const cancelButton = createSecondaryButton({
  text: 'Cancel',
  onClick: () => console.log('Cancelled')
});

// CTA button (use sparingly)
const submitButton = createCtaButton({
  text: 'Get Started',
  onClick: () => console.log('Starting...')
});
```

### Card Variants
```javascript
import { createDefaultCard, createSoftCard, createHoverCard } from './cards.js';

// Default card with border and shadow
const infoCard = createDefaultCard({
  content: '<h3>Information</h3><p>Important content here</p>'
});

// Soft card for nested content
const nestedCard = createSoftCard({
  content: '<p>Nested content without borders</p>'
});

// Interactive hover card
const clickableCard = createHoverCard({
  content: '<h3>Click Me</h3>',
  onClick: () => alert('Card clicked!')
});
```

### Form with Validation
```javascript
import { createForm } from './forms.js';

const userForm = createForm({
  fields: [
    {
      type: 'name',
      name: 'userName',
      required: true
    },
    {
      type: 'avatar',
      name: 'userAvatar',
      avatars: [
        { src: '/avatar1.png', alt: 'Avatar 1' },
        { src: '/avatar2.png', alt: 'Avatar 2' }
      ]
    }
  ],
  onSubmit: (data) => {
    console.log('Form data:', data);
  }
});
```

### Interactive Components
```javascript
import { createWordChip, createModal } from './interactive.js';

// Word chip with activity indicators
const wordChip = createWordChip({
  word: 'elephant',
  difficulty: 'medium',
  activities: [
    { type: 'vocabulary', completed: true },
    { type: 'phonics', completed: false }
  ],
  draggable: true
});

// Modal dialog
const welcomeModal = createModal({
  title: 'Welcome!',
  content: '<p>Ready to start learning?</p>',
  actions: [
    { text: 'Continue', variant: 'primary', onClick: () => {} }
  ]
});
```

## 🧪 Testing

### Component Test Suite
Open `component-test.html` in a browser to run the complete test suite:

1. **Isolation testing** - Each component renders independently
2. **Responsive testing** - Components work from 320px to desktop
3. **Accessibility testing** - WCAG 2.1 AA compliance verification
4. **Typography testing** - Quicksand font application verification
5. **Integration testing** - Components working together

### Manual Testing Checklist

- [ ] All buttons meet 44px minimum touch target
- [ ] Secondary buttons are the default choice
- [ ] CTA buttons used sparingly (primary actions only)
- [ ] Cards render with correct variants (Default, Soft, Hover)
- [ ] Forms use Quicksand typography for inputs
- [ ] Avatar selector is keyboard accessible
- [ ] Navigation components announce properly to screen readers
- [ ] Interactive components have keyboard alternatives
- [ ] All components responsive from 320px up

## 📱 Responsive Behavior

### Mobile (320px - 768px)
- Buttons stack vertically with full width
- Cards use single column layout
- Forms maintain 44px touch targets
- Navigation collapses to mobile-friendly format
- Interactive components adapt hit areas for touch

### Tablet (768px - 1024px)
- Two-column layouts where appropriate
- Buttons group horizontally with spacing
- Cards use grid layouts (2-3 columns)
- Interactive components optimize for touch/mouse hybrid

### Desktop (1024px+)
- Full multi-column layouts
- Hover states more prominent
- Maximum content width with centered layout
- Mouse-optimized interactions

## ♿ Accessibility Features

### WCAG 2.1 AA Compliance
- **4.5:1 minimum contrast ratio** for all text
- **44px minimum touch targets** for interactive elements
- **Keyboard navigation** for all interactive components
- **Screen reader support** with proper ARIA labels
- **Focus management** in modals and dynamic content

### Screen Reader Support
- Proper semantic HTML structure
- ARIA labels and descriptions
- Role attributes for custom components
- Live regions for dynamic content updates
- Skip links and landmark navigation

### Keyboard Navigation
- Tab order follows visual order
- Enter/Space activation for buttons
- Arrow key navigation in component groups
- Escape key closes modals and dropdowns
- Focus indicators meet visibility requirements

## 🎨 Design System Integration

All components automatically import and use:
- **CSS Custom Properties** from `design-system.css`
- **Color tokens** including primary orange (#D97706)
- **Typography scale** with Poppins headers, Quicksand body
- **Spacing system** based on 4px increments
- **Component specifications** matching Design_system.md exactly

## 🔧 Development Notes

### Dependencies
- No external JavaScript dependencies (vanilla JS only)
- Requires `design-system.css` for styling
- Uses ES6 modules for imports
- Google Fonts for Poppins and Quicksand typography
- Material Symbols for icons

### Browser Support
- Modern browsers with ES6 module support
- CSS Grid and Flexbox required
- CSS Custom Properties required
- Drag and drop API for interactive components

### Performance Considerations
- Components lazy-load CSS if not present
- Minimal DOM manipulation
- Event delegation for dynamic components
- Optimized for mobile performance

## 📋 Component Specifications Met

✅ **All Phase 1.3 requirements implemented**:
- Buttons: CTA, Secondary, Tertiary, Destructive (secondary-first)
- Cards: Default, Soft, Hover (exact 3 variants)
- Forms: Text inputs, avatar selector, number input (Quicksand)
- Navigation: Header, progress indicators, accordion
- Interactive: Word chips, drag-drop, flippable cards, modals

✅ **Design system compliance**:
- Quicksand typography for buttons/inputs/body
- 320px+ responsive design
- WCAG 2.1 AA accessibility standards
- Secondary-button-first philosophy
- No inline styles or hardcoded values

✅ **Isolation testing**:
- Each component works independently
- No framework dependencies
- Modular ES6 exports
- Self-contained functionality