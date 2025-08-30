/**
 * Twibble Navigation System
 * Centralized client-side navigation with role persistence and URL handling
 * Provides seamless flow between all 6 HTML pages with proper browser history management
 */

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
 * Helper functions for common navigation tasks
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