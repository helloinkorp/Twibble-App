# Twibble Project Rules

## Project Context
- **App**: Twibble - Vocabulary learning web app for K-5 education
- **Architecture**: localStorage-first, vanilla JS, mobile-responsive
- **Assets**: Supabase-hosted images/audio, local fallbacks

## Development Rules
- **NO Frameworks**: Vanilla HTML/CSS/JS only
- **Mobile-First**: 320px minimum, 44px touch targets
- **Component Isolation**: Build/test in showcase.html first
- **Service Layer**: No direct localStorage from components
- **Progressive Sections**: Multi-section pages, not separate HTML files
- **Design System Compliance**: All UI must follow Design_system.md specifications exactly

## Quality Gates
- Tests must pass before commits
- All assets need fallback handling
- Session recovery required
- Cross-browser compatibility mandatory
- **Design System Validation**: All components must comply with Design_system.md standards before deployment

## File Structure
```
/src
  /components (reusable UI)
  /styles (design system)
  /js (business logic)
  /pages (HTML pages: 6 total)
  /assets (images, icons)
```

## Current Phase Status
Refer to plan.md for current implementation phase and validation gates.

## Design Consistency Requirements
- **Reference Document**: Design_system.md contains all visual specifications
- **Component Standards**: Use only approved design system classes and tokens
- **Accessibility**: Must meet WCAG 2.1 AA compliance per Design_system.md
- **Mobile Standards**: All touch targets 44px minimum per Design_system.md
- **Performance**: CSS budget ≤100KB per Design_system.md contract
- **Validation**: Use Design_system.md checklist before component implementation