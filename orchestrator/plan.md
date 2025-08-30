# Twibble Master Plan - Strategic Implementation Roadmap

## Overview
This master plan breaks down the Twibble application into manageable phases, learning from previous implementation failures where the foundation worked but broke when building actual HTML pages. Each phase builds upon the previous one with clear validation gates and human inspection points.

## Critical Learning from Previous Failure
- **What Failed**: Moving from foundation (JS files, components) to actual HTML pages (onboarding, teacher dashboard) caused breakage
- **Root Cause**: Likely insufficient component isolation and improper state management integration
- **Solution**: Build visual layer first with proper component architecture before adding functionality

## Application Structure (Per PRD)
### Exact HTML Pages Required:
1. **onboarding.html** - Single page with 3 progressive sections (hero → name → avatar)
2. **index.html** - Home/Role selection page (always accessible via home button)
3. **teacher-dashboard.html** - Teacher's lesson management hub
4. **create-lesson.html** - Multi-step lesson creation interface
5. **student-dashboard.html** - Student's lesson access hub (mobile-first)
6. **activities.html** - Interactive learning activities page

---

## PHASE 1: Foundation & Visual Framework (REBUILD)
**Goal**: Create bulletproof component system with secondary-button-first philosophy
**Duration**: 2-3 days 
**Success Criteria**: All UI components render correctly in isolation, secondary buttons default, CTA buttons sparingly used
**Status**: REBUILDING - Updated Design_system.md requires fresh implementation

### 1.1 Project Structure & Build System
- Initialize clean project structure with clear separation:
  ```
  /src
    /components (reusable UI components)
    /styles (design system implementation)
    /js (business logic, separate from components)
    /pages (HTML pages)
    /assets (images, icons)
  ```
- Set up simple build system (Vite recommended for robustness)
- NO framework (vanilla JS for simplicity and control)
- Configure CSS with design system tokens
- Create base HTML template with proper meta tags

### 1.2 Design System Implementation
- Convert Design_system.md into CSS custom properties
- Implement color tokens (#faf9f5 background, orange palette, etc.)
- Typography setup (Poppins for headers, Quicksand for body)
- Implement the THREE card variants exactly as specified
- Create utility classes for spacing, layout
- Set up Material Symbols Light icons (20px/24px only)
- **Compliance Check**: All implementations must match Design_system.md specifications exactly

### 1.3 Core Component Library (Isolated & Testable)
Each component must work in complete isolation before integration:

- **Buttons**:
  - CTA button (filled orange, primary actions only)
  - Standard button (transparent/outline, fills on hover)
  - NO icons in buttons per design system
  
- **Cards** (3 specific types):
  - Default Card (#FDFCFA with border and shadow)
  - Card Soft (#F0EEE6, no border, for nested content)
  - Card Hover (transparent default, fills on hover)
  
- **Form Elements**:
  - Text inputs with 44px minimum touch targets
  - Avatar selector component
  - Number input with quick-select buttons
  
- **Navigation Components**:
  - Header with home button and avatar
  - Progress indicators
  - Tab/accordion components (for create-lesson sections)
  
- **Interactive Elements**:
  - Word chips with activity indicators:
    - Single activity: Pastel colors (Vocabulary=pastel yellow, Spelling=pastel mint, Phonics=pastel purple)
    - Multiple activities: Gray bg with colored dots
    - Drag-and-drop between groups for reassignment
    - Color updates automatically when reassigned
  - Drag-and-drop containers
  - Flippable cards (for vocabulary)
  - Modal/dialog system

### 1.4 Component Showcase Page
- **showcase.html** - Display ALL components in isolation
- Each component shown with different states (default, hover, active, disabled)
- Mobile and desktop views side-by-side
- This page is our validation tool throughout development

**Validation Gate**: Every component renders correctly in showcase.html, responsive from 320px up, and complies with Design_system.md standards including:
- Color contrast ratios (4.5:1 minimum)
- Touch targets (44px minimum)
- Typography scales and weights
- Component specifications and states

---

## PHASE 2: Static Page Construction (Clickable Prototype)
**Goal**: Build all 6 HTML pages with working navigation, no data functionality yet
**Duration**: 3-4 days
**Success Criteria**: Complete user flow navigation works perfectly

### 2.1 Onboarding Page (onboarding.html)
**Critical**: This is ONE page with progressive sections, not multiple pages
**Design Reference**: Must follow Design_system.md for all UI elements including buttons, forms, cards, and layouts

Structure:
```html
<!-- All three sections in one page, show/hide with JS -->
<section id="hero-section" class="active">
  - Logo (logo.png)
  - "Lesson. Made Simple." subheader
  - "Get Started" button
</section>

<section id="name-section" class="hidden">
  - "What is your name?" input
  - "Next" button (disabled until name entered)
</section>

<section id="avatar-section" class="hidden">
  - "Who are you?" text
  - 10+ avatar options in circles
  - Upload option
  - "Continue" button
</section>
```

Navigation Logic:
- Get Started → Hide hero, show name section
- Next → Hide name, show avatar section  
- Continue → Save to localStorage, redirect to index.html

### 2.2 Home/Role Selection Page (index.html)
Structure:
- Personalized greeting using stored name
- Avatar display (top-right) with click for settings
- "Who are you today?" subtext
- Two full-width buttons: "Teacher" and "Student"
- Clicking avatar opens profile/settings modal

Navigation:
- Teacher button → teacher-dashboard.html
- Student button → student-dashboard.html
- This page is ALWAYS accessible via home button from any page

### 2.3 Teacher Dashboard (teacher-dashboard.html)
Structure:
- Header with Home button and avatar (consistent across all pages)
- "Create New Lesson" primary CTA button
- Lesson cards grid (use sample data for prototype):
  - Card shows: title, word count, date, activity dots
  - Actions: Edit, Share, Delete icons
- Empty state: "No lessons created yet" message

**Design Implementation**: Follow Design_system.md exactly:
- Use `.btn-cta` for primary button
- Use `.card` class for lesson cards
- Material Symbols Light icons (gray colors only)
- Proper spacing and typography per design system

Navigation:
- Create New Lesson → create-lesson.html
- Edit → create-lesson.html (with lesson loaded)
- Share → Opens modal with URL/QR (just UI for now)
- Home button → index.html

### 2.4 Create Lesson Page (create-lesson.html)
**Critical**: This is ONE page with multiple sections, not separate pages

Structure:
```html
<!-- All in one page -->
<div id="lesson-creation">
  <!-- Three accordion sections, collapsed by default -->
  <section class="accordion">
    <h3>Manual Entry</h3>
    <div class="content">
      - Word group grids
      - Activity toggles
      - Input field
      - "Add to Lesson" button
    </div>
  </section>
  
  <section class="accordion">
    <h3>File Import</h3>
    <div class="content">
      - Drag-drop zone
      - File input fallback
      - Auto-load to "Vocabulary" grid as default
      - Drag chips to other grids for reassignment
    </div>
  </section>
  
  <section class="accordion">
    <h3>AI Assistant</h3>
    <!-- Future feature placeholder -->
  </section>
</div>

<!-- Word Pool at bottom -->
<div id="word-pool">
  - Display word chips with activity dots
</div>

<!-- Continue to Scheduling button -->
```

The scheduling and summary sections appear on THE SAME PAGE, replacing/hiding the creation sections.

**Lesson Summary Section** (appears after scheduling):
```html
<div id="lesson-summary">
  - Lesson title and metadata
  - Word distribution across days (visual chart)
  - Activity breakdown statistics
  - Share URL and QR code display
  
  <!-- Worksheet Generator Placeholder -->
  <section id="worksheet-generator-placeholder">
    <h3>Generate Printable Worksheets</h3>
    <div class="placeholder-content">
      - "Coming Soon" message with icon
      - Disabled button: "Generate Worksheets"
      - Brief description: "Create printable practice sheets for your lesson"
    </div>
  </section>
  
  - "Save & Finish" button
  - "Test as Student" button
</div>
```

### 2.5 Student Dashboard (student-dashboard.html)
**Mobile-First Design Required**
**Design Compliance**: All components must reference Design_system.md for mobile-first responsive design, touch targets, and accessibility requirements

Structure:
- Header with Home button and greeting
- Lesson cards (responsive grid):
  - Creator name, title, word count
  - Overall progress bar
  - Day selector grid (up to 10 buttons)
  - Day button states: Available (gray), Current (orange), Completed (green), Locked (disabled)
- "Start Learning"/"Continue" button per card

Special Entry:
- Must handle URL parameter: ?addLesson=[UUID]
- Auto-add lesson to dashboard when accessed via share link

Navigation:
- Day button → activities.html
- Home → index.html

### 2.6 Activities Page (activities.html)
**Mobile-First Design Required**
**Design Standards**: Interactive elements must follow Design_system.md specifications for touch-friendly mobile interfaces, animations, and feedback states

Structure:
- Header: "Activity X of Y" progress
- Exit icon button (saves and returns to dashboard)
- Skip icon button (skips current word)
- Activity container (changes based on activity type):
  - Vocabulary: Flippable card OR MCQ grid
  - Phonics: Chunk display OR assembly area
  - Spelling: Letter reveal OR assembly area
- Next/Continue button

Navigation:
- Exit → student-dashboard.html (with progress saved)
- Activity completion → Next activity OR back to dashboard

### 2.7 Navigation System Implementation
- Simple client-side routing (can use basic JS)
- Proper back/forward button support
- Home button on every page except onboarding
- Role persistence across page loads

**Validation Gate**: Complete click-through of both teacher and student flows with Design_system.md compliance verified:
- All components use design system classes
- Consistent visual appearance across all pages
- Accessibility standards met (WCAG 2.1 AA)
- Mobile responsiveness validated

---

## PHASE 3: State Management & Data Layer
**Goal**: Implement localStorage architecture without breaking the UI
**Duration**: 2-3 days
**Success Criteria**: Data persists, UI doesn't break (addressing previous failure point)

### 3.1 Storage Service Layer
Create abstraction layer to prevent direct localStorage access from components:
```javascript
// storage-service.js
class StorageService {
  - saveUserProfile()
  - getUserProfile()
  - saveLessonDraft()
  - publishLesson()
  - getStudentProgress()
  // etc - single point of truth
}
```

### 3.2 Data Models & Schemas
Define clear data structures with consolidated sources:
- User profile schema
- Lesson schema (draft vs published)
- Progress tracking schema
- Activity state schema
- **Consolidated Word Data Model**:
  - Merge `consolidated_words.json` and `Complete List of Phonics Chunks.MD`
  - Single source of truth for word data, images, audio, and phonics chunks
  - Schema includes: word, image_url, audio_url, phonics_chunks[], syllables[]
  - Cached locally with 30-day expiration

### 3.3 Auto-Save Implementation
- Debounced auto-save on input changes
- UUID generation for lessons
- Draft management system
- Continuous background saving

### 3.4 State Synchronization
- Keep UI and localStorage in sync
- Handle edge cases (corrupted data, missing fields)
- Migration utilities for schema changes
- Data validation layer

**Validation Gate**: Create lesson, refresh page, data persists correctly

---

## PHASE 4: Teacher Creation Tools
**Goal**: Implement complete teacher workflow with the PRD-specified features
**Duration**: 3-4 days
**Success Criteria**: Teachers can create, schedule, and share lessons

### 4.1 Word Input Processing
- Manual entry with group management
- Parse comma/space separated words
- Activity toggle functionality
- Word chip generation with visual indicators:
  - Single activity: Pastel background colors
  - Multiple activities: Gray background with colored dots
  - Drag-and-drop reassignment between groups
  - Automatic color updates on reassignment

### 4.2 File Import (TXT only for MVP)
- Drag-and-drop implementation
- File reading and parsing
- Word extraction and processing
- Auto-assignment to "Vocabulary" grid as default
- Drag-and-drop chip reassignment between grids
- Error handling for invalid files

### 4.3 Scheduling Algorithm
Per PRD specifications:
- Day 1: ~40% of words
- Middle days: Exponential decay
- Final day: Review only
- Manual drag-drop adjustments
- Schedule validation (no review before introduction)

### 4.4 Sharing System
- UUID-based URL generation
- Format: [domain]/student-dashboard.html?addLesson=[UUID]
- QR code generation (200x200px)
- Copy-to-clipboard with feedback
- "Test as Student" feature

**Validation Gate**: Create, schedule, and share a complete lesson

---

## PHASE 5: Student Learning Experience
**Goal**: Implement all three activity types with NEW/REVIEW modes
**Duration**: 4-5 days
**Success Criteria**: Students can complete all activities with proper progression

### 5.1 Lesson Access System
- Process ?addLesson URL parameter
- Add lesson to student dashboard
- Display lesson cards with progress
- Implement day unlocking logic

### 5.2 Vocabulary Activities
**NEW Mode (Learning)**:
- Flippable card with smooth animation
- Front: word image
- Back: word text with TTS
- Must view both sides twice before advancing

**REVIEW Mode (Testing)**:
- Word image display
- 4 choices in 2x2 grid
- Correct answer: checkmark + TTS + auto-advance
- Wrong answer: "Try Again!" message

### 5.3 Phonics Activities
Integration with consolidated word data model:
- Use phonics_chunks[] from consolidated data model
- Fallback to syllables[] if chunks unavailable
- Single data source for consistency

**NEW Mode**:
- Chunk learning interface
- Assembly with drag-and-drop
- TTS audio cues

**REVIEW Mode**:
- Audio-based word identification
- Chunk assembly from mixed pool

### 5.4 Spelling Activities
**NEW Mode**:
- Image with TTS button
- Letter reveal animation (0.5s delays)
- Guided practice (exact letters only)

**REVIEW Mode**:
- Skip learning sequence
- Assembly with distractors
- "Try Again" until correct

### 5.5 Activity Flow Management
- Correct order: NEW (V→P→S) then REVIEW (V→P→S)
- Skip empty activity types automatically
- Progress tracking and saving
- Session recovery on reload

**Validation Gate**: Complete student journey through multi-day lesson

---

## PHASE 6: Asset Integration & Polish
**Goal**: Integrate Supabase assets and enhance UX
**Duration**: 2-3 days
**Success Criteria**: All assets load with proper fallbacks

### 6.1 Consolidated Data Integration
- Load unified word data model (words, images, audio, phonics chunks)
- Implement Supabase fetching for all asset types
- 30-day localStorage caching strategy
- Placeholder fallbacks for missing assets
- Merge and validate data from multiple sources into single model

### 6.2 Audio System
- TTS integration for all words
- Audio preloading strategy
- Mobile audio handling (user interaction required)
- Playback controls and feedback

### 6.3 Visual Polish
- Smooth transitions between sections
- Loading states for asset fetching
- Error states with helpful messages
- Success celebrations for activity completion
- Touch feedback for mobile
- **Design System Compliance**: All visual enhancements must follow Design_system.md animation guidelines and component specifications

### 6.4 Performance Optimization
- Lazy load images
- Progressive enhancement
- Optimize bundle size
- Test offline capability

**Validation Gate**: Full app test with real Supabase assets

---

## PHASE 7: Quality Assurance & Launch Prep
**Goal**: Ensure production readiness
**Duration**: 2-3 days
**Success Criteria**: Zero critical bugs, meets all PRD requirements

### 7.1 Cross-Browser Testing
- Desktop: Chrome, Firefox, Safari, Edge
- Mobile: iOS Safari, Chrome Android
- Tablet layouts
- Minimum 320px viewport support

### 7.2 Accessibility & Compliance
- WCAG 2.1 AA compliance (per Design_system.md specifications)
- Keyboard navigation
- Screen reader support
- 44px minimum touch targets
- **Design System Contract**: All accessibility implementations must match Design_system.md requirements and validation checklist

### 7.3 Error Recovery
- Network failure handling
- Invalid data recovery
- Graceful degradation
- Session recovery after crashes

### 7.4 Final Validation
- Complete teacher flow test
- Complete student flow test
- Share link functionality
- Progress persistence
- Mobile experience validation

**Validation Gate**: Production deployment ready

---

## Risk Mitigation Strategies

### Addressing Previous Failure Point
**Problem**: HTML pages broke when integrated with JS components
**Solution**: 
1. Build components in complete isolation first (showcase.html)
2. Use service layer for all data operations (no direct localStorage access from UI)
3. Implement one page completely before moving to next
4. Test each page thoroughly before proceeding

### Validation Checkpoints
- After EACH section of EACH phase: Human visual inspection
- Use showcase.html to test components in isolation
- Never proceed if current phase has issues
- Git commit after each successful validation

### Recovery Mechanisms
- Clean git history with descriptive commits
- Branch for each phase
- Ability to rollback to last working state
- Keep old working code until new code is validated

## Success Metrics Checklist
- [ ] All 6 HTML pages load and navigate correctly
- [ ] Onboarding is single page with progressive sections
- [ ] Role selection (home) is always accessible
- [ ] Teacher can create and schedule lessons
- [ ] Share URLs work with ?addLesson parameter
- [ ] Students can complete all activity types
- [ ] Data persists across sessions
- [ ] Mobile responsive (320px minimum)
- [ ] Assets load with fallbacks
- [ ] No console errors in any flow

## Implementation Notes
1. **Start with Phase 1** - Get components perfect in isolation
2. **One page at a time** in Phase 2 - Complete each page fully
3. **Service layer first** in Phase 3 - Before touching UI data integration
4. **Test continuously** - After every significant change
5. **Human inspection** - At every validation gate
6. **Don't skip steps** - Even if they seem simple

---

**This plan specifically addresses the previous failure points and builds incrementally with validation at each step.**