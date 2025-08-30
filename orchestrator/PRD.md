# **Twibble Product Requirements Document (PRD)**

**Document Overview**

* **Version**: 3.0
* **Date**: 2025-08-26
* **Status**: Active
* **Scope**: MVP web app (desktop and mobile), ready for future expansion

This document is the definitive, detailed Product Requirements Document for Twibble. It has been meticulously organized for enhanced clarity and AI agent reference, providing an "encyclopedia" of all app features, requirements, and business context.

## **1. Executive Summary \& Core Concepts**

### **Core Innovation**

Twibble is a vocabulary learning web app that empowers teachers to create and share multi-day lessons with intelligent word scheduling and interactive activities. Students access these lessons via shared links and progress through a sequence of vocabulary, phonics, and spelling activities at their own pace.

### **MVP Scope**

* **Teacher Flow**: Desktop-optimized, but mobile-responsive lesson creation, scheduling, and sharing.
* **Student Flow**: Mobile-first interactive learning activities with robust progress tracking.
* **Storage**: A localStorage-first architecture with continuous auto-save functionality.
* **Activities**: Vocabulary (flashcards/MCQ), Phonics (chunk assembly), and Spelling (letter assembly).
* **Sharing**: Seamless lesson distribution via QR codes and URLs.
* **Design Consistency**: All UI components must follow Design_system.md standards for colors, typography, spacing, and accessibility.

### **Key Success Metrics**

* Zero-friction student lesson access via shared links.  
* Robust progress tracking with seamless session recovery.
* Error-free creation, sharing, and lesson activity flows. MOST important.
* **Visual Consistency**: All interfaces comply with Design_system.md specifications for professional appearance and accessibility.

### **User Roles \& Core Flows**

* **Teacher Flow**: Onboarding (first time) → Role Selection → Teacher Dashboard → Create Lesson (first time) → Schedule → Share → Manage.
* **Student Flow**: Onboarding → Role Selection → Student Dashboard → Access Lesson → Select Day → Complete Activities → Track Progress.

## **2. Product Vision \& Goals**

### **2.1 Problem Statement**

Teachers spend too much time creating engaging vocabulary lessons and managing student access, while students often find traditional, static materials boring and struggle to stay motivated. The friction of logins and accounts for young learners further complicates the process.

### **2.2 Product Vision**

Twibble aims to be the go-to, zero-friction vocabulary tool for K-5 classrooms, making lesson creation effortless for teachers and learning fun and seamless for students.

## **3. User Personas**

### **3.1 Persona: Ms. Anderson, The Teacher**

Role: Elementary School Teacher (K-5)  
Goals: Quickly create and share lessons; personalize learning for students with diverse needs; easily track progress.  
Pain Points: Limited time for lesson planning; outdated tools that require manual effort; friction in sharing materials and getting students to log in.

### **3.2 Persona: Leo, The Student**

Age: 9 years old  
Goals: Learn new words in a fun, engaging way; easily access lessons without accounts or passwords; get instant feedback on his progress.  
Pain Points: Boring worksheets; friction with logins and passwords; losing track of his work when switching devices.

## **4. Core User Journeys: Detailed Specifications**

### **4.1 Teacher Flow**

#### **4.1.1 Onboarding: Profile Creation**

Goal: To create a persistent user profile for a personalized experience.  
Trigger: First app launch, before role selection.  
Layout Elements:

* **Section 1**: Hero section with the app logo (logo file as logo.png in project folder) and subheader "Lesson. Made Simple." and a "Get Started" button below the subheader.
* **Section 2**: Name input field (What is your name? - required field).
* **Section 3**: Avatar selection (Who are you?) with 10+ preloaded avatars in circles and an upload option.

**Design Requirements**: All components must follow Design_system.md specifications including:
- Primary button styling for "Get Started" and "Continue" buttons
- Form input styling for name field
- Card components for avatar selection
- Consistent spacing and typography throughout  
  
User Flow:

1. User presses "Get Started" → advances to name input.
2. User enters name → "Next" button is enabled → advances to avatar selection.
3. User selects/uploads avatar → "Continue" button is enabled → advances to role selection.
4. Profile is saved to localStorage as the userSettings object.  
   Technical Requirements:

* Clear "Next" buttons between sections (no auto-advance).
* Avatar upload with preview/replace controls.
* Persistent storage: localStorage.userSettings = {name: string, avatar: string}.
* This process runs only once per browser unless the profile is explicitly reset.
* **UI Standards**: All buttons, inputs, and interactive elements must comply with Design_system.md accessibility and sizing requirements (minimum 44px touch targets).

#### **4.1.2 Home Page: Role Selection**

Goal: Allow users to select their role as a Teacher or Student.  
Layout Elements:

* Personalized greeting (Hello, \[name]!).
* Avatar displayed top-right next to a home button.
* "Who are you today?" subtext.
* Full-width role buttons: "Teacher" and "Student".
* Profile/settings access via avatar click.  
  User Flow:

1. Displayed after onboarding or on a home button click.
2. User selects a role → saves to localStorage → routes to the appropriate dashboard.
3. Role switching is available anytime via the home button.  
   Technical Requirements:

* Session role persistence: localStorage.currentRole.
* The home button always returns here.

#### **4.1.3 Teacher Dashboard**

Goal: The central hub for lesson management and creation.  
Layout Elements:

* Header with Home button and avatar (top-right).
* Primary CTA: "Create New Lesson" button.
* A responsive grid of lesson cards:

  * Each card shows title, word count, creation date, and activity type indicators (colored dots).
  * Actions: Edit, Share, and Delete icons.

* Empty state: "No lessons created yet" with guidance to create a new lesson.

**Design Implementation**: All elements must follow Design_system.md standards:
- Use `.btn-cta` class for "Create New Lesson" button
- Use `.card` class for lesson cards with proper spacing and borders
- Icons must be Material Symbols Light (20px/24px) in gray colors
- Grid layout must be responsive per design system breakpoints  
  User Flow:

1. "Create New Lesson" → navigates to create-lesson.html.
2. Edit lesson → returns to the lesson creation flow with the draft loaded.
3. Share lesson → displays URL and QR code with copy functionality.
4. Delete lesson → requires a confirmation dialog before removal from localStorage.  
   Technical Requirements:

* Real-time updates reflecting changes in localStorage.
* Lesson cards display metadata from localStorage.

#### **4.1.4 Create Lesson**

Goal: To build lessons through word input and activity assignment with continuous auto-save.  
Auto-Save Architecture:

* **Trigger**: Every input change, toggle selection, and word addition.
* **Storage**: localStorage.lessonDrafts\[UUID].
* **ID Generation**: A permanent UUID is assigned on the first auto-save.
* Result: The lesson exists in localStorage before a user has to "save" it.  
  Layout Elements:
* Three expandable accordion sections (all collapsed by default).
* **Manual Entry Section**:

  * Word Groups: Default grids for "Vocabulary", "Spelling", "Phonics" (with editable titles).
  * Group Controls: Activity toggles per group, a text input field for comma/space-separated words, and an "Add to Lesson" button.

* **File Import Section**:

  * **MVP Scope**: TXT files only.
  * **Interface**: A drag-and-drop zone with a file input fallback.
  * **Processing**: Imported words are automatically loaded to the "Vocabulary" grid as default assignment.
  * **Reassignment**: Users can drag imported word chips to other grids (Spelling/Phonics) for activity reassignment.

* Word Pool: A bottom section displaying all processed words as editable "chips" with activity indicators.  
  Chip System:
* **Processing**: Raw text is parsed into individual word chips.
* **Visual Coding**: 
  * Single activity assignment: Chips display pastel colors (Vocabulary=pastel yellow, Spelling=pastel mint, Phonics=pastel purple).
  * Multiple activity assignment: Gray chips with colored dots (yellow=Vocab, mint=Spelling, purple=Phonics).
* **Drag & Drop**: Chips are draggable between groups for activity reassignment.
* **Color Updates**: Chip colors automatically update to match their assigned group's activity.
* **Management**: Individual chip deletion is supported.

#### **4.1.5 Lesson Scheduling**

Goal: To distribute words across lesson days with smart algorithms and manual adjustment.  
Layout Elements:

* Day selection: A number input (1-10) and quick-select buttons (3, 5, 7 days).
* A responsive grid of day cards showing daily word allocations.
* A manual adjustment interface for dragging and dropping word chips between days.
* "Reset Schedule" and "Continue to Summary" buttons.  
  Auto-Distribution Algorithm:
* **Day 1**: Approximately 40% of total words (front-loaded learning).
* **Middle Days**: An exponential decay distribution.
* Final Day: Review-only, no new words.  
  Review Logic: Words learned on Day X are reviewed on Day X and all days thereafter.  
  Technical Requirements:
* Work with existing lesson data from localStorage.
* Save schedule updates back to the existing lesson record.
* **Validation**: Cannot review words before they have been introduced.

#### **4.1.6 Lesson Summary \& Sharing**

Goal: To finalize the lesson and provide sharing options.  
Layout Elements:

* **Overview Section**: Large editable lesson title, statistics (total words, duration, activity breakdown), and creation date.
* **Schedule Preview**: Collapsible day cards showing a summary of words for that day.
* **Sharing Section (CRITICAL)**:

  * **Share URL**: Generated using the existing lesson's UUID from localStorage.
  * **QR Code**: A 200x200px PNG with a download capability.
  * **Copy Functionality**: A one-click URL copying button with success feedback.
  * Test Feature: A "Test as Student" button that opens the share URL in a new tab.  
    Technical Requirements:

* **Lesson Status**: Mark as "published" on finalization.
* **URL Format**: \[domain]/student-dashboard.html?addLesson=\[UUID].

**Worksheet Generator Feature**: This module will be an integrated feature within the existing Twibble web application, allowing teachers to generate and download printable PDF worksheets from their finalized lessons (and words). A placeholder section for this Worksheet Generator Feature should be in this Lesson Summary \& Sharing layout.

### **4.2 Student Flow**

#### **4.2.1 Student Dashboard**

Goal: Central hub for lesson access and progress tracking (Mobile-First).  
Layout Elements:

* Header: Home button, greeting with avatar.
* **Lesson Cards** (responsive grid):

  * Creator name, lesson title, word count, duration.
  * Overall progress bar (completed/total words).
  * **Day Selector Grid**: Up to 10 day buttons.
  * **Day Button States**:

    * **Available**: Gray styling.
    * **Current**: Orange styling (next available day).
    * **Completed**: Green styling with checkmarks.
    * **Locked**: Disabled styling.

* "Start Learning" / "Continue" buttons.  
  User Flow:

1. Lesson is accessed via a shared URL with a ?addLesson=UUID parameter.
2. The lesson is automatically added to the student's dashboard.
3. Day selection routes to the activity page.
4. Progress is tracked with real-time updates.  
   Technical Requirements:

* Mobile-first responsive design.
* Progress calculation across all assigned activities.
* Storage: localStorage.studentLessons\[].

#### **4.2.2 Lesson Activities**

Goal: Interactive learning activities with robust progress tracking (Mobile-First).  
Activity Flow Logic:

* **Order**: NEW words (Vocab → Phonics → Spelling) followed by REVIEW words (Vocab → Phonics → Spelling).
* **Filtering**: Activities for which no words are assigned are automatically skipped.
* Skipping: Empty activity types are automatically skipped.  
  Interface Elements:
* Header: Progress indicator "Activity X of Y".
* **Exit Icon Button**: Saves progress and returns to the dashboard.
* **Skip Icon Button**: Skips the current word and advances.
* Clean, distraction-free environment.
* Large, touch-friendly controls (44px minimum).

#### **4.2.2.1 Vocabulary Activities**

**NEW Words (Learning Mode)**:

* **Interface**: A large, flippable card with a smooth animation.
* **Front**: Displays an image of the word.
* **Back**: Displays the word text with auto-play TTS.
* Progression: The user must view both sides twice before the advance button is enabled.  
  REVIEW Words (Test Mode):
* **Interface**: A word image in a prominent card.
* **Options**: 4 word choices in a 2x2 grid.
* **Feedback**: A correct choice triggers a checkmark, TTS audio, and auto-advances. An incorrect choice shows a "Try Again!" message.

#### **4.2.2.2 Phonics Activities**

**Data Source**:

* **Primary**: Complete List of Phonics Chunks.MD.
* Fallback: Rule-based syllable splitting for unlisted words.  
  NEW Words (Learning Mode):
* **Activity 1 (Chunk Learning)**: A prominent phonics chunk card with related lesson words below.
* Activity 2 (Chunk Assembly): A prominent play button for TTS of the target word. The user must drag the correct phonics chunks from a scrambled pool (including distractors) to assemble the word.  
  REVIEW Words (Assessment Mode):
* A prominent play button for TTS audio of the lesson word.
* The user must assemble the word by dragging and dropping letters and chunks from a mixed pool.

#### **4.2.2.3 Spelling Activities**

**NEW Words (Learning Sequence)**:

1. A word image is displayed with a play button for TTS audio cues.
2. An animated letter reveal sequence (0.5s delays).
3. Auto-play TTS after the full sequence.
4. Drag-and-drop practice with the exact letters, no distractors.  
   REVIEW Words (Assessment Mode):

* Skips the learning sequence.
* Clickable image for TTS audio cues.
* Drag-and-drop with correct letters plus distractors.
* "Try Again" feedback until the correct spelling is achieved.

## **5. Technical Architecture \& Data Models**

**Design System Integration**: All technical implementations must reference Design_system.md for:
- Component specifications and CSS classes
- Color tokens and typography scales
- Accessibility standards (WCAG 2.1 AA compliance)
- Mobile-first responsive breakpoints
- Performance budgets and optimization requirements

### **5.1 Data Storage \& Models**

* **Storage Architecture**: The MVP uses a **localStorage-first architecture** for offline support and zero-friction access. This is a temporary solution, and future plans include a migration to a cloud database.
* **Data Models**: [to be FILLED IN]
* **Asset Storage**: Images and audio files are hosted on **Supabase**. Their URLs are referenced within a consolidated\_words.json file.
* **Fallbacks**: Placeholder images are used when assets are unavailable.
* **Caching**: Fetched assets are cached in localStorage for 30 days to optimize performance.

### **5.2 Performance Considerations**

* **Mobile-First**: Touch-optimized interactions for students.
* **Offline Support**: localStorage-first architecture for full offline functionality.
* **Asset Loading**: Progressive enhancement approach for quick initial load times.
* **Error Recovery**: Graceful degradation to ensure the app remains usable even with network issues.
* **Design System Performance**: CSS implementation must stay within Design_system.md performance contract (≤100KB CSS budget).

### **5.3 Technical Debt Planning**

* **Storage Migration**: Migrate from localStorage to a cloud database (e.g., Supabase, Firestore).
* **API Abstraction**: Create a centralized service layer.
* **Component Library**: Develop a reusable UI component library.

## **6. Future Expansion Areas**

### **6.1 Post-MVP Enhancements**

* **OCR Integration**: Image text extraction via Tesseract.js.
* **Advanced File Import**: PDF and Excel support.
* **API Integrations**: Pixabay for images, ElevenLabs for TTS.
* **Cloud Sync**: Google account integration and cross-device synchronization.
* **Worksheet Generation**: Downloadable classroom materials.
* **Advanced Activities**: Gamification, puzzles, and crosswords.

### **6.2 Architecture Expansion**

* **User Accounts**: Full registration, authentication, and profiles.
* **Multi-tenancy**: School/classroom management.
* **Real-time Sync**: WebSocket-based collaboration.
* **Mobile Apps**: Native iOS/Android versions.
* **Accessibility**: Enhanced screen reader support.
