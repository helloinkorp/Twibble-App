/**
 * Twibble Navigation System
 * Centralized client-side navigation with role persistence and URL handling
 * Provides seamless flow between all 6 HTML pages with proper browser history management
 */

// Import CSS if not already loaded
if (!document.querySelector('link[href*="design-system.css"]')) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '../styles/design-system.css';
  document.head.appendChild(link);
}

// Import unified avatar component
let createAvatar = null;
try {
  // Try to import avatar component
  import('../components/avatar.js').then(module => {
    createAvatar = module.createAvatar;
  }).catch(() => {
    console.warn('Avatar component not available, using fallback');
  });
} catch (error) {
  console.warn('Avatar component import failed, using fallback');
}

// Ensure Material Symbols font is loaded
if (!document.querySelector('link[href*="Material+Symbols+Outlined"]')) {
  const materialLink = document.createElement('link');
  materialLink.rel = 'stylesheet';
  materialLink.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20,300,0,0';
  document.head.appendChild(materialLink);
  console.log('Material Symbols font loaded by navigation component');
}

/**
 * Navigation Configuration - Central routing definition
 */
const NAVIGATION_CONFIG = {
    // Page definitions with their requirements
    pages: {
        'onboarding.html': {
            requiresOnboarding: false,
            requiresRole: false,
            showHomeButton: false,
            title: 'Get Started'
        },
        'index.html': {
            requiresOnboarding: true,
            requiresRole: false,
            showHomeButton: false,
            title: 'Welcome'
        },
        'teacher-dashboard.html': {
            requiresOnboarding: true,
            requiresRole: 'teacher',
            showHomeButton: true,
            title: 'Teacher Dashboard'
        },
        'create-lesson.html': {
            requiresOnboarding: true,
            requiresRole: 'teacher',
            showHomeButton: true,
            title: 'Create Lesson'
        },
        'student-dashboard.html': {
            requiresOnboarding: true,
            requiresRole: 'student',
            showHomeButton: true,
            title: 'Student Dashboard'
        },
        'activities.html': {
            requiresOnboarding: true,
            requiresRole: 'student',
            showHomeButton: true,
            title: 'Learning Activities'
        }
    },

    // Navigation flows - defines logical back navigation
    flows: {
        'create-lesson.html': 'teacher-dashboard.html',
        'activities.html': 'student-dashboard.html'
    }
};

/**
 * Navigation Manager Class
 * Handles all navigation logic, URL parameters, and history management
 */
class NavigationManager {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.userSettings = this.loadUserSettings();
        this.currentRole = localStorage.getItem('currentRole');
        
        // Bind methods to preserve context
        this.navigate = this.navigate.bind(this);
        this.goHome = this.goHome.bind(this);
        this.goBack = this.goBack.bind(this);
        this.handleURLParameters = this.handleURLParameters.bind(this);
        
        this.init();
    }

    init() {
        // Validate current page access
        this.validatePageAccess();
        
        // Handle URL parameters
        this.handleURLParameters();
        
        // Setup browser history management
        this.setupHistoryManagement();
        
        console.log('Navigation Manager initialized for:', this.currentPage);
    }

    /**
     * Get current page from window location
     */
    getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index.html';
        return filename;
    }

    /**
     * Load user settings from localStorage
     */
    loadUserSettings() {
        try {
            const settings = localStorage.getItem('userSettings');
            return settings ? JSON.parse(settings) : null;
        } catch (error) {
            console.warn('Failed to load user settings:', error);
            return null;
        }
    }

    /**
     * Validate if user can access current page
     */
    validatePageAccess() {
        const pageConfig = NAVIGATION_CONFIG.pages[this.currentPage];
        if (!pageConfig) {
            console.warn('Unknown page:', this.currentPage);
            return;
        }

        // Check onboarding requirement
        if (pageConfig.requiresOnboarding && !this.userSettings) {
            console.log('Onboarding required, redirecting...');
            this.navigate('onboarding.html', true);
            return;
        }

        // Check role requirement
        if (pageConfig.requiresRole && pageConfig.requiresRole !== this.currentRole) {
            console.log('Invalid role for page, redirecting to role selection...');
            this.navigate('index.html', true);
            return;
        }
    }

    /**
     * Handle URL parameters (especially for shared lessons)
     */
    handleURLParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        
        // Handle shared lesson parameter
        const addLessonParam = urlParams.get('addLesson');
        if (addLessonParam) {
            this.handleSharedLesson(addLessonParam);
        }

        // Handle lesson and day parameters for activities
        const lessonParam = urlParams.get('lesson');
        const dayParam = urlParams.get('day');
        if (lessonParam && dayParam && this.currentPage === 'activities.html') {
            console.log(`Activities loaded for lesson ${lessonParam}, day ${dayParam}`);
            // Parameters are already handled by the activities page
        }
    }

    /**
     * Handle shared lesson parameter
     */
    handleSharedLesson(lessonId) {
        if (this.currentPage !== 'student-dashboard.html') {
            // If not on student dashboard, redirect there with the parameter
            this.navigate(`student-dashboard.html?addLesson=${lessonId}`, true);
            return;
        }

        // The student dashboard will handle adding the lesson
        console.log('Shared lesson parameter handled:', lessonId);
        
        // Clean URL after processing
        this.cleanURL();
    }

    /**
     * Setup browser history management
     */
    setupHistoryManagement() {
        // Handle browser back/forward buttons
        window.addEventListener('popstate', (event) => {
            console.log('Browser navigation detected');
            
            // Get the new page
            const newPage = this.getCurrentPage();
            this.currentPage = newPage;
            
            // Validate access to new page
            this.validatePageAccess();
            
            // Handle URL parameters
            this.handleURLParameters();
        });

        // Store current state in history
        const state = {
            page: this.currentPage,
            timestamp: Date.now()
        };
        
        if (!window.history.state) {
            window.history.replaceState(state, '', window.location.href);
        }
    }

    /**
     * Navigate to a specific page
     */
    navigate(destination, replace = false) {
        // Handle relative paths
        if (!destination.startsWith('http') && !destination.startsWith('/')) {
            // Check if we need to navigate up directories
            const currentPath = window.location.pathname;
            const currentDir = currentPath.substring(0, currentPath.lastIndexOf('/'));
            
            if (currentDir.includes('/pages')) {
                destination = destination;
            } else {
                destination = `src/pages/${destination}`;
            }
        }

        const state = {
            page: destination.split('/').pop().split('?')[0],
            timestamp: Date.now(),
            navigatedFrom: this.currentPage
        };

        if (replace) {
            window.history.replaceState(state, '', destination);
            window.location.replace(destination);
        } else {
            window.history.pushState(state, '', destination);
            window.location.href = destination;
        }
    }

    /**
     * Navigate to home (index.html)
     */
    goHome() {
        this.navigate('index.html');
    }

    /**
     * Navigate back in the logical flow
     */
    goBack() {
        const backPage = NAVIGATION_CONFIG.flows[this.currentPage];
        
        if (backPage) {
            // Use logical back navigation
            this.navigate(backPage);
        } else {
            // Use browser history
            const hasHistory = window.history.length > 1;
            if (hasHistory) {
                window.history.back();
            } else {
                // Fallback to home
                this.goHome();
            }
        }
    }

    /**
     * Navigate to activities page with lesson and day parameters
     */
    navigateToActivities(lessonId, dayNumber) {
        const url = `activities.html?lesson=${lessonId}&day=${dayNumber}`;
        this.navigate(url);
    }

    /**
     * Navigate to specific lesson day
     */
    navigateToLessonDay(lessonId, dayNumber) {
        this.navigateToActivities(lessonId, dayNumber);
    }

    /**
     * Set user role and navigate to appropriate dashboard
     */
    setRoleAndNavigate(role) {
        try {
            localStorage.setItem('currentRole', role);
            this.currentRole = role;

            if (role === 'teacher') {
                this.navigate('teacher-dashboard.html');
            } else if (role === 'student') {
                this.navigate('student-dashboard.html');
            }
        } catch (error) {
            console.error('Failed to set role:', error);
            throw error;
        }
    }

    /**
     * Complete onboarding and navigate to role selection
     */
    completeOnboarding(userSettings) {
        try {
            localStorage.setItem('userSettings', JSON.stringify(userSettings));
            this.userSettings = userSettings;
            this.navigate('index.html');
        } catch (error) {
            console.error('Failed to complete onboarding:', error);
            throw error;
        }
    }

    /**
     * Clear all user data and restart onboarding
     */
    resetOnboarding() {
        localStorage.removeItem('userSettings');
        localStorage.removeItem('currentRole');
        this.userSettings = null;
        this.currentRole = null;
        this.navigate('onboarding.html', true);
    }

    /**
     * Clean URL of parameters
     */
    cleanURL() {
        const cleanUrl = window.location.pathname;
        window.history.replaceState(window.history.state, '', cleanUrl);
    }

    /**
     * Get current page configuration
     */
    getPageConfig() {
        return NAVIGATION_CONFIG.pages[this.currentPage];
    }

    /**
     * Check if user is authenticated (completed onboarding)
     */
    isAuthenticated() {
        return this.userSettings && this.userSettings.name && this.userSettings.avatar;
    }

    /**
     * Check if user has required role for current page
     */
    hasRequiredRole() {
        const pageConfig = this.getPageConfig();
        if (!pageConfig || !pageConfig.requiresRole) {
            return true;
        }
        return this.currentRole === pageConfig.requiresRole;
    }

    /**
     * Get breadcrumb trail for current page
     */
    getBreadcrumb() {
        const breadcrumb = [{ text: 'Home', href: 'index.html' }];
        
        switch (this.currentPage) {
            case 'teacher-dashboard.html':
                breadcrumb.push({ text: 'Teacher Dashboard' });
                break;
            case 'create-lesson.html':
                breadcrumb.push(
                    { text: 'Teacher Dashboard', href: 'teacher-dashboard.html' },
                    { text: 'Create Lesson' }
                );
                break;
            case 'student-dashboard.html':
                breadcrumb.push({ text: 'Student Dashboard' });
                break;
            case 'activities.html':
                breadcrumb.push(
                    { text: 'Student Dashboard', href: 'student-dashboard.html' },
                    { text: 'Activities' }
                );
                break;
        }
        
        return breadcrumb;
    }
}

/**
 * Navigation Utilities
 * Helper functions for common navigation tasks and UI components
 */
const NavigationUtils = {
    /**
     * Create a home button that works consistently across all pages
     */
    createHomeButton(options = {}) {
        const {
            className = 'btn btn-secondary',
            text = 'Home',
            icon = 'home'
        } = options;

        const button = document.createElement('button');
        button.type = 'button';
        button.className = className;
        button.innerHTML = `<span class="icon icon-small mr-2">${icon}</span>${text}`;
        button.setAttribute('aria-label', 'Go to home page');
        
        button.addEventListener('click', () => {
            window.navigationManager.goHome();
        });

        return button;
    },

    /**
     * Create a back button that uses logical flow
     */
    createBackButton(options = {}) {
        const {
            className = 'btn btn-secondary',
            text = 'Back',
            icon = 'arrow_back'
        } = options;

        const button = document.createElement('button');
        button.type = 'button';
        button.className = className;
        button.innerHTML = `<span class="icon icon-small mr-2">${icon}</span>${text}`;
        button.setAttribute('aria-label', 'Go back');
        
        button.addEventListener('click', () => {
            window.navigationManager.goBack();
        });

        return button;
    },

    /**
     * Create role selection buttons
     */
    createRoleButton(role, options = {}) {
        const {
            className = 'btn btn-secondary role-button',
            text = role.charAt(0).toUpperCase() + role.slice(1),
            icon = role === 'teacher' ? 'school' : 'person'
        } = options;

        const button = document.createElement('button');
        button.type = 'button';
        button.className = className;
        button.innerHTML = `<span class="icon">${icon}</span><span>${text}</span>`;
        button.setAttribute('aria-label', `Continue as ${text}`);
        
        button.addEventListener('click', () => {
            window.navigationManager.setRoleAndNavigate(role);
        });

        return button;
    },

    /**
     * Setup common page navigation
     */
    setupPageNavigation(pageElement) {
        const homeButtons = pageElement.querySelectorAll('[data-nav="home"], #homeBtn');
        const backButtons = pageElement.querySelectorAll('[data-nav="back"], #backBtn');
        
        homeButtons.forEach(button => {
            button.addEventListener('click', () => {
                window.navigationManager.goHome();
            });
        });

        backButtons.forEach(button => {
            button.addEventListener('click', () => {
                window.navigationManager.goBack();
            });
        });
    },

    /**
     * App Header Component - Consistent across all pages
     * @param {Object} config - Header configuration
     * @param {boolean} config.showHome - Whether to show home button
     * @param {Object} config.user - User data {name, avatar}
     * @param {Function} config.onHome - Home button click handler
     * @param {Function} config.onProfile - Profile click handler
     * @param {string} config.title - Page title
     * @returns {HTMLElement} Header element
     */
    createHeader(config = {}) {
        const {
            showHome = true,
            user = null,
            onHome = () => window.location.href = '/index.html',
            onProfile = () => {},
            title = '',
            className = ''
        } = config;

        const header = document.createElement('header');
        header.className = `bg-white border-b border-gray-200 p-4 ${className}`.trim();
        header.setAttribute('role', 'banner');
        
        const container = document.createElement('div');
        container.className = 'flex items-center justify-between max-w-6xl mx-auto';
        
        // Left side - Home button and title
        const leftSide = document.createElement('div');
        leftSide.className = 'flex items-center gap-4';
        
        if (showHome) {
            // Create home button with proper icon styling
            const homeButton = document.createElement('button');
            homeButton.type = 'button';
            homeButton.className = 'home-icon-button';
            homeButton.setAttribute('aria-label', 'Go to home page');
            
            // Create the icon inside the button
            const homeIcon = document.createElement('span');
            homeIcon.className = 'material-symbols-outlined icon';
            homeIcon.textContent = 'home';
            
            // Apply comprehensive styling to ensure proper icon display
            homeIcon.style.cssText = `
              font-family: 'Material Symbols Outlined' !important;
              font-weight: normal !important;
              font-style: normal !important;
              font-size: 24px !important;
              line-height: 1 !important;
              letter-spacing: normal !important;
              text-transform: none !important;
              display: inline-block !important;
              white-space: nowrap !important;
              word-wrap: normal !important;
              direction: ltr !important;
              -webkit-font-feature-settings: 'liga' !important;
              -webkit-font-smoothing: antialiased !important;
              font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24 !important;
              color: var(--color-gray-600) !important;
              user-select: none !important;
            `;
            
            // Style the button to be clean and borderless
            homeButton.style.cssText = `
              background: none;
              border: none;
              padding: var(--space-2);
              cursor: pointer;
              border-radius: var(--border-radius);
              transition: background-color var(--transition-fast);
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 44px;
              min-width: 44px;
            `;
            
            // Add hover effect
            homeButton.addEventListener('mouseenter', () => {
              homeButton.style.backgroundColor = 'var(--color-gray-100)';
            });
            
            homeButton.addEventListener('mouseleave', () => {
              homeButton.style.backgroundColor = 'transparent';
            });
            
            // Add click handler
            homeButton.addEventListener('click', onHome);
            
            homeButton.appendChild(homeIcon);
            leftSide.appendChild(homeButton);
        }
        
        if (title) {
            const titleEl = document.createElement('h1');
            titleEl.textContent = title;
            titleEl.className = 'text-2xl font-medium m-0';
            leftSide.appendChild(titleEl);
        }
        
        // Right side - User profile
        const rightSide = document.createElement('div');
        rightSide.className = 'flex items-center gap-3';
        
        // Debug logging for user data
        console.log('Navigation createHeader received user data:', user);
        
        if (user && user.name) {
            const profileButton = document.createElement('button');
            profileButton.type = 'button';
            profileButton.setAttribute('aria-label', `${user.name} profile and settings`);
            
            // Style button to be invisible - just a clean circular avatar
            profileButton.style.cssText = `
              background: none;
              border: none;
              padding: 0;
              cursor: pointer;
              border-radius: 50%;
              transition: transform var(--transition-fast), box-shadow var(--transition-fast);
              display: flex;
              align-items: center;
              justify-content: center;
            `;
            
            // Add hover effect that slightly scales the avatar
            profileButton.addEventListener('mouseenter', () => {
              profileButton.style.transform = 'scale(1.05)';
              profileButton.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
            });
            
            profileButton.addEventListener('mouseleave', () => {
              profileButton.style.transform = 'scale(1)';
              profileButton.style.boxShadow = 'none';
            });
            
            // Create avatar using unified avatar component or fallback
            let avatarElement;
            
            if (createAvatar) {
              // Use unified avatar component for consistency
              avatarElement = createAvatar({
                user: user,
                size: 40,
                className: 'navigation-avatar',
                showBorder: true
              });
              console.log('Navigation: Using unified avatar component for:', user.name);
            } else {
              // Fallback implementation with design system styles
              console.log('Navigation: Using fallback avatar implementation for:', user.name);
              
              if (user.avatar && user.avatar.trim()) {
                console.log('Creating avatar image with source:', user.avatar);
                
                const avatar = document.createElement('img');
                avatar.src = user.avatar.trim();
                avatar.alt = user.name || 'User avatar';
                avatar.className = 'avatar-image';
                avatar.style.cssText = `
                  width: 40px;
                  height: 40px;
                  border-radius: 50%;
                  object-fit: cover;
                  border: 1px solid var(--color-gray-200);
                  display: block;
                `;
                
                // Add error handling for avatar loading
                avatar.addEventListener('error', function() {
                  console.warn('Avatar failed to load, creating fallback for user:', user.name);
                  console.warn('Failed avatar URL:', this.src);
                  
                  // Create fallback avatar with initials
                  const fallback = document.createElement('div');
                  fallback.className = 'avatar-fallback';
                  fallback.style.cssText = `
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: var(--color-primary);
                    border: 1px solid var(--color-gray-200);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    font-weight: 500;
                    color: white;
                    font-family: var(--font-family-body) !important;
                  `;
                  fallback.textContent = user.name.charAt(0).toUpperCase();
                  fallback.setAttribute('aria-label', `${user.name} avatar (initials)`);
                  
                  // Replace the broken image with fallback
                  if (profileButton.contains(this)) {
                    profileButton.replaceChild(fallback, this);
                  }
                });
                
                // Success handler for avatar loading
                avatar.addEventListener('load', function() {
                  console.log('Avatar loaded successfully for:', user.name);
                });
                
                avatarElement = avatar;
              } else {
                console.log('No avatar provided, creating initials fallback for user:', user.name);
                
                // Create fallback avatar with initials (no avatar URL provided)
                const fallback = document.createElement('div');
                fallback.className = 'avatar-fallback';
                fallback.style.cssText = `
                  width: 40px;
                  height: 40px;
                  border-radius: 50%;
                  background: var(--color-primary);
                  border: 1px solid var(--color-gray-200);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 14px;
                  font-weight: 500;
                  color: white;
                  font-family: var(--font-family-body) !important;
                `;
                fallback.textContent = user.name.charAt(0).toUpperCase();
                fallback.setAttribute('aria-label', `${user.name} avatar (initials)`);
                
                avatarElement = fallback;
              }
            }
            
            profileButton.appendChild(avatarElement);
            profileButton.addEventListener('click', onProfile);
            rightSide.appendChild(profileButton);
        } else {
            console.warn('Navigation createHeader: No user data or user name provided', { user, hasName: !!(user && user.name) });
        }
        
        container.appendChild(leftSide);
        container.appendChild(rightSide);
        header.appendChild(container);
        
        return header;
    },

    /**
     * Progress Indicator - Shows completion progress
     * @param {Object} config - Progress configuration
     * @param {number} config.current - Current step (0-based)
     * @param {number} config.total - Total steps
     * @param {Array} config.steps - Array of step labels
     * @param {boolean} config.showLabels - Whether to show step labels
     * @returns {HTMLElement} Progress indicator
     */
    createProgressIndicator(config = {}) {
        const {
            current = 0,
            total = 3,
            steps = [],
            showLabels = false,
            className = ''
        } = config;

        const progress = document.createElement('div');
        progress.className = `progress-indicator ${className}`.trim();
        progress.setAttribute('role', 'progressbar');
        progress.setAttribute('aria-valuemin', '0');
        progress.setAttribute('aria-valuemax', total.toString());
        progress.setAttribute('aria-valuenow', current.toString());
        progress.setAttribute('aria-label', `Step ${current + 1} of ${total}`);
        
        // Progress bar
        const progressBar = document.createElement('div');
        progressBar.className = 'flex items-center mb-4';
        
        for (let i = 0; i < total; i++) {
            // Step circle
            const step = document.createElement('div');
            step.className = `w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
              i <= current 
                ? 'bg-primary border-primary text-white' 
                : 'bg-white border-gray-300 text-gray-500'
            }`;
            step.textContent = (i + 1).toString();
            
            progressBar.appendChild(step);
            
            // Connector line (except for last step)
            if (i < total - 1) {
              const connector = document.createElement('div');
              connector.className = `flex-1 h-0.5 mx-2 ${
                i < current ? 'bg-primary' : 'bg-gray-300'
              }`;
              progressBar.appendChild(connector);
            }
        }
        
        progress.appendChild(progressBar);
        
        // Step labels
        if (showLabels && steps.length > 0) {
            const labels = document.createElement('div');
            labels.className = 'flex justify-between text-xs text-gray-600';
            
            steps.forEach((label, index) => {
              const labelEl = document.createElement('span');
              labelEl.textContent = label;
              labelEl.className = index <= current ? 'font-medium text-primary' : '';
              labels.appendChild(labelEl);
            });
            
            progress.appendChild(labels);
        }
        
        return progress;
    },

    /**
     * Accordion Component - Collapsible content sections
     * @param {Object} config - Accordion configuration
     * @param {Array} config.sections - Array of section objects
     * @param {boolean} config.allowMultiple - Allow multiple sections open
     * @param {number} config.defaultOpen - Default open section index
     * @returns {HTMLElement} Accordion element
     */
    createAccordion(config = {}) {
        const {
            sections = [],
            allowMultiple = false,
            defaultOpen = -1,
            className = ''
        } = config;

        const accordion = document.createElement('div');
        accordion.className = `accordion ${className}`.trim();
        accordion.setAttribute('role', 'region');
        accordion.setAttribute('aria-label', 'Expandable content sections');
        
        const openSections = new Set();
        if (defaultOpen >= 0 && defaultOpen < sections.length) {
            openSections.add(defaultOpen);
        }
        
        sections.forEach((section, index) => {
            const sectionEl = document.createElement('div');
            sectionEl.className = 'border border-gray-200 rounded-lg mb-2';
            
            // Header button
            const header = document.createElement('button');
            header.type = 'button';
            header.className = 'w-full flex items-center justify-between p-4 text-left font-medium hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset';
            header.setAttribute('aria-expanded', openSections.has(index) ? 'true' : 'false');
            header.setAttribute('aria-controls', `accordion-content-${index}`);
            
            const title = document.createElement('span');
            title.textContent = section.title || `Section ${index + 1}`;
            header.appendChild(title);
            
            const icon = document.createElement('span');
            icon.className = 'icon icon-small transition-transform duration-200';
            icon.innerHTML = 'keyboard_arrow_down';
            if (openSections.has(index)) {
              icon.style.transform = 'rotate(180deg)';
            }
            header.appendChild(icon);
            
            // Content panel
            const content = document.createElement('div');
            content.id = `accordion-content-${index}`;
            content.className = `accordion-content overflow-hidden transition-all duration-200 ${
              openSections.has(index) ? 'max-h-none' : 'max-h-0'
            }`;
            content.setAttribute('role', 'region');
            content.setAttribute('aria-labelledby', `accordion-header-${index}`);
            
            const contentInner = document.createElement('div');
            contentInner.className = 'p-4 pt-0 text-gray-700';
            
            if (typeof section.content === 'string') {
              contentInner.innerHTML = section.content;
            } else if (section.content instanceof HTMLElement) {
              contentInner.appendChild(section.content);
            }
            
            content.appendChild(contentInner);
            
            // Toggle functionality
            header.addEventListener('click', () => {
              const isOpen = openSections.has(index);
              
              if (!allowMultiple) {
                // Close all other sections
                openSections.clear();
                accordion.querySelectorAll('.accordion-content').forEach(otherContent => {
                  otherContent.style.maxHeight = '0';
                });
                accordion.querySelectorAll('button[aria-expanded="true"]').forEach(otherButton => {
                  otherButton.setAttribute('aria-expanded', 'false');
                  const otherIcon = otherButton.querySelector('.icon');
                  if (otherIcon) {
                    otherIcon.style.transform = 'rotate(0deg)';
                  }
                });
              }
              
              if (isOpen) {
                // Close this section
                openSections.delete(index);
                content.style.maxHeight = '0';
                header.setAttribute('aria-expanded', 'false');
                icon.style.transform = 'rotate(0deg)';
              } else {
                // Open this section
                openSections.add(index);
                content.style.maxHeight = content.scrollHeight + 'px';
                header.setAttribute('aria-expanded', 'true');
                icon.style.transform = 'rotate(180deg)';
                
                // Auto-adjust height after transitions
                setTimeout(() => {
                  if (openSections.has(index)) {
                    content.style.maxHeight = 'none';
                  }
                }, 200);
              }
            });
            
            header.id = `accordion-header-${index}`;
            sectionEl.appendChild(header);
            sectionEl.appendChild(content);
            accordion.appendChild(sectionEl);
        });
        
        return accordion;
    },

    /**
     * Breadcrumb Navigation
     * @param {Object} config - Breadcrumb configuration
     * @param {Array} config.items - Array of breadcrumb items
     * @param {string} config.separator - Separator icon
     * @returns {HTMLElement} Breadcrumb navigation
     */
    createBreadcrumb(config = {}) {
        const {
            items = [],
            separator = 'chevron_right',
            className = ''
        } = config;

        const nav = document.createElement('nav');
        nav.className = `breadcrumb ${className}`.trim();
        nav.setAttribute('aria-label', 'Breadcrumb');
        
        const ol = document.createElement('ol');
        ol.className = 'flex items-center space-x-2 text-sm';
        
        items.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'flex items-center';
            
            if (index > 0) {
              const sep = document.createElement('span');
              sep.className = 'icon icon-small text-gray-400 mr-2';
              sep.innerHTML = separator;
              sep.setAttribute('aria-hidden', 'true');
              li.appendChild(sep);
            }
            
            if (item.href && index < items.length - 1) {
              const link = document.createElement('a');
              link.href = item.href;
              link.textContent = item.text;
              link.className = 'text-primary hover:text-primary-hover';
              li.appendChild(link);
            } else {
              const span = document.createElement('span');
              span.textContent = item.text;
              span.className = index === items.length - 1 ? 'text-gray-900 font-medium' : 'text-gray-600';
              if (index === items.length - 1) {
                span.setAttribute('aria-current', 'page');
              }
              li.appendChild(span);
            }
            
            ol.appendChild(li);
        });
        
        nav.appendChild(ol);
        return nav;
    },

    /**
     * Tab Navigation Component
     * @param {Object} config - Tab configuration
     * @param {Array} config.tabs - Array of tab objects
     * @param {number} config.activeTab - Active tab index
     * @param {Function} config.onChange - Tab change handler
     * @returns {HTMLElement} Tab navigation
     */
    createTabs(config = {}) {
        const {
            tabs = [],
            activeTab = 0,
            onChange = () => {},
            className = ''
        } = config;

        const tabContainer = document.createElement('div');
        tabContainer.className = `tabs ${className}`.trim();
        
        // Tab list
        const tabList = document.createElement('div');
        tabList.className = 'border-b border-gray-200';
        tabList.setAttribute('role', 'tablist');
        
        const nav = document.createElement('nav');
        nav.className = '-mb-px flex space-x-8';
        
        tabs.forEach((tab, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = `py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              index === activeTab
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`;
            button.textContent = tab.title;
            button.setAttribute('role', 'tab');
            button.setAttribute('aria-selected', index === activeTab ? 'true' : 'false');
            button.setAttribute('aria-controls', `tabpanel-${index}`);
            button.id = `tab-${index}`;
            
            button.addEventListener('click', () => {
              // Update button states
              nav.querySelectorAll('button').forEach((btn, btnIndex) => {
                const isActive = btnIndex === index;
                btn.className = `py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`;
                btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
              });
              
              // Update panel states
              tabContainer.querySelectorAll('[role="tabpanel"]').forEach((panel, panelIndex) => {
                panel.hidden = panelIndex !== index;
              });
              
              onChange(index, tab);
            });
            
            nav.appendChild(button);
        });
        
        tabList.appendChild(nav);
        tabContainer.appendChild(tabList);
        
        // Tab panels
        tabs.forEach((tab, index) => {
            const panel = document.createElement('div');
            panel.className = 'py-6';
            panel.setAttribute('role', 'tabpanel');
            panel.setAttribute('aria-labelledby', `tab-${index}`);
            panel.id = `tabpanel-${index}`;
            panel.hidden = index !== activeTab;
            
            if (typeof tab.content === 'string') {
              panel.innerHTML = tab.content;
            } else if (tab.content instanceof HTMLElement) {
              panel.appendChild(tab.content);
            }
            
            tabContainer.appendChild(panel);
        });
        
        return tabContainer;
    },

    /**
     * Render navigation components to container for testing/showcase
     * @param {HTMLElement} container - Container element
     */
    renderNavigationShowcase(container) {
        container.innerHTML = '';
        
        const showcase = document.createElement('div');
        showcase.className = 'container p-8';
        
        const section = document.createElement('section');
        section.innerHTML = '<h2>Navigation Components</h2><p class="text-secondary mb-6">Headers, progress indicators, and navigation elements</p>';
        
        // Header example
        const headerSection = document.createElement('div');
        headerSection.className = 'mb-8';
        headerSection.innerHTML = '<h3 class="mb-4">Header Component</h3>';
        
        const sampleHeader = this.createHeader({
            title: 'Teacher Dashboard',
            user: {
              name: 'Ms. Anderson',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher'
            },
            onHome: () => alert('Home clicked'),
            onProfile: () => alert('Profile clicked')
        });
        
        headerSection.appendChild(sampleHeader);
        
        // Progress indicator
        const progressSection = document.createElement('div');
        progressSection.className = 'mb-8';
        progressSection.innerHTML = '<h3 class="mb-4">Progress Indicator</h3>';
        
        const progressExample = this.createProgressIndicator({
            current: 1,
            total: 3,
            steps: ['Hero', 'Name', 'Avatar'],
            showLabels: true
        });
        
        progressSection.appendChild(progressExample);
        
        // Accordion
        const accordionSection = document.createElement('div');
        accordionSection.className = 'mb-8';
        accordionSection.innerHTML = '<h3 class="mb-4">Accordion Component</h3>';
        
        const accordionExample = this.createAccordion({
            sections: [
              {
                title: 'Getting Started',
                content: '<p>Welcome to Twibble! This section covers the basics of creating your first lesson.</p>'
              },
              {
                title: 'Creating Lessons',
                content: '<p>Learn how to add words, set difficulty levels, and schedule activities for your students.</p>'
              },
              {
                title: 'Sharing & Management',
                content: '<p>Share lessons with students via QR codes and track their progress through the dashboard.</p>'
              }
            ],
            defaultOpen: 0
        });
        
        accordionSection.appendChild(accordionExample);
        
        // Breadcrumb
        const breadcrumbSection = document.createElement('div');
        breadcrumbSection.className = 'mb-8';
        breadcrumbSection.innerHTML = '<h3 class="mb-4">Breadcrumb Navigation</h3>';
        
        const breadcrumbExample = this.createBreadcrumb({
            items: [
              { text: 'Home', href: '#' },
              { text: 'Lessons', href: '#' },
              { text: 'Create Lesson' }
            ]
        });
        
        breadcrumbSection.appendChild(breadcrumbExample);
        
        // Tabs
        const tabsSection = document.createElement('div');
        tabsSection.innerHTML = '<h3 class="mb-4">Tab Navigation</h3>';
        
        const tabsExample = this.createTabs({
            tabs: [
              {
                title: 'Vocabulary',
                content: '<p>Add words and their definitions for vocabulary learning.</p>'
              },
              {
                title: 'Phonics',
                content: '<p>Configure phonics activities and sound patterns.</p>'
              },
              {
                title: 'Spelling',
                content: '<p>Set up spelling exercises and word assembly tasks.</p>'
              }
            ],
            activeTab: 0,
            onChange: (index, tab) => console.log('Tab changed:', tab.title)
        });
        
        tabsSection.appendChild(tabsExample);
        
        section.appendChild(headerSection);
        section.appendChild(progressSection);
        section.appendChild(accordionSection);
        section.appendChild(breadcrumbSection);
        section.appendChild(tabsSection);
        showcase.appendChild(section);
        container.appendChild(showcase);
    }
};

/**
 * Initialize Navigation System
 * Creates global navigation manager and sets up utilities
 */
function initializeNavigation() {
    // Create global navigation manager
    window.navigationManager = new NavigationManager();
    
    // Expose utilities globally
    window.NavigationUtils = NavigationUtils;
    
    // Setup common navigation for current page
    NavigationUtils.setupPageNavigation(document.body);
    
    console.log('Twibble Navigation System initialized');
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeNavigation);
} else {
    initializeNavigation();
}

// Assign to global namespace for non-module usage
window.NavigationManager = NavigationManager;
window.NavigationUtils = NavigationUtils;
window.NAVIGATION_CONFIG = NAVIGATION_CONFIG;
window.initializeNavigation = initializeNavigation;