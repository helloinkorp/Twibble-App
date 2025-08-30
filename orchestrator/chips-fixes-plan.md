# Chips System Fixes Implementation Plan
**TraceID**: trace-chips-fixes-2025-08-30
**Date**: 2025-08-30
**Confidence**: 85% (Complex UI logic requiring careful coordination)

## Requirements Analysis

### 1. Chip Size Issue ❌
- **Current**: Chip size reduction (50-60%) not applied properly
- **Expected**: Smaller, more compact chips
- **Root Cause**: CSS changes may not have taken effect or were overridden

### 2. File Upload UI Flow Issue ❌
- **Current**: File upload places chips in Manual Entry card grids
- **Expected**: File upload should show chips in separate grids within the File Upload card
- **Impact**: Confusing UX - users can't distinguish manual vs uploaded words

### 3. Dynamic Color Management Issue ❌
- **Current**: Chip colors are static based on initial assignment
- **Expected**: Chip colors should update dynamically when activity toggles change
- **Rules**: 
  - Single activity = specific pastel color
  - Multiple activities = gray background with colored dots
  - Cannot turn off ALL toggles (validation required)

## Task Decomposition

### T500: Verify and Fix Chip Size Implementation
- **Responsibility**: CSS debugging and size verification
- **Output**: Properly sized chips (50-60% of original)
- **Validation**: Visual comparison with original size

### T501: Restructure File Upload UI Flow
- **Responsibility**: Separate file upload chip containers from manual entry
- **Output**: Independent file upload word groups within File Upload card
- **Validation**: Clear visual separation between manual and uploaded words

### T502: Implement Dynamic Activity Toggle System
- **Responsibility**: Activity toggle change handlers with color updates
- **Output**: Real-time chip color updates based on toggle states
- **Validation**: Toggle changes immediately reflect in chip appearance

### T503: Implement Toggle Validation Logic
- **Responsibility**: Prevent all toggles being turned off
- **Output**: At least one toggle always remains active per group
- **Validation**: Cannot disable all activities for any word group

### T504: Enhanced Color State Management
- **Responsibility**: Dynamic color calculation based on multiple activities
- **Output**: Gray chips with colored dots for multiple activities
- **Validation**: Correct dot colors and counts match enabled activities

## Implementation Strategy

1. **Size Fix First**: Ensure visual foundation is correct
2. **UI Restructure**: Separate file upload flow from manual entry
3. **Toggle System**: Implement dynamic activity management
4. **Color Logic**: Add real-time color updates
5. **Integration Testing**: Comprehensive validation of all interactions

## Success Criteria
- [ ] Chips are visibly 50-60% smaller than original
- [ ] File upload shows words in File Upload card, not Manual Entry card
- [ ] Toggle changes immediately update chip colors
- [ ] Multiple activities show gray chips with colored dots
- [ ] Cannot disable all toggles for any word group
- [ ] Drag-and-drop still works after all changes

## Risk Assessment
- **Medium Risk**: Complex UI state management with multiple interdependencies
- **Medium Risk**: Toggle validation logic affecting user workflow
- **Low Risk**: CSS size adjustments