# Twibble - Vocabulary Learning App

**Educational vocabulary learning web app for K-5 students**

## Project Architecture

- **Framework**: Vanilla HTML/CSS/JS (no frameworks)
- **Storage**: localStorage-first architecture  
- **Design**: Mobile-responsive with Design_system.md compliance
- **Assets**: Supabase-hosted with local fallbacks

## Folder Structure

```
/src
├── /components     # Reusable UI components
├── /styles         # Design system CSS
├── /js            # Business logic & services  
├── /pages         # 6 HTML pages
└── /assets        # Local fallback assets
```

## Development Workflow

1. **Component Isolation**: Build in showcase.html first
2. **Design System Compliance**: Follow Design_system.md exactly
3. **Mobile-First**: 320px minimum, 44px touch targets
4. **Service Layer**: No direct localStorage from components

## Key Pages

- `onboarding.html` - Progressive user setup
- `index.html` - Role selection (home)
- `teacher-dashboard.html` - Lesson management
- `create-lesson.html` - Multi-step lesson creation
- `student-dashboard.html` - Mobile-first lesson access
- `activities.html` - Interactive learning activities

## Documentation

See `/orchestrator` directory for complete specifications:
- `PRD.md` - Product requirements
- `Design_system.md` - Visual specifications  
- `plan.md` - Implementation phases
- `CLAUDE.md` - Development rules