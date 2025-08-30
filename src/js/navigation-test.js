/**
 * Navigation System Test Suite
 * Tests for the Twibble Navigation System functionality
 */

// Test configuration
const TEST_CONFIG = {
    baseURL: window.location.origin + '/src/pages/',
    testTimeout: 5000,
    testData: {
        validUser: {
            name: 'Test User',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
            createdAt: new Date().toISOString(),
            onboardingCompleted: true
        },
        validLessonId: 'lesson-123',
        validDay: 1
    }
};

/**
 * Test Suite Class
 */
class NavigationTestSuite {
    constructor() {
        this.results = [];
        this.currentTest = null;
        this.originalLocalStorage = {};
    }

    // Setup and teardown methods
    setup() {
        console.log('🧪 Starting Navigation System Tests');
        
        // Backup current localStorage
        this.backupLocalStorage();
        
        // Clear localStorage for clean tests
        this.clearTestStorage();
    }

    teardown() {
        console.log('🧹 Cleaning up tests');
        
        // Restore original localStorage
        this.restoreLocalStorage();
    }

    backupLocalStorage() {
        this.originalLocalStorage = {
            userSettings: localStorage.getItem('userSettings'),
            currentRole: localStorage.getItem('currentRole')
        };
    }

    restoreLocalStorage() {
        Object.entries(this.originalLocalStorage).forEach(([key, value]) => {
            if (value !== null) {
                localStorage.setItem(key, value);
            } else {
                localStorage.removeItem(key);
            }
        });
    }

    clearTestStorage() {
        localStorage.removeItem('userSettings');
        localStorage.removeItem('currentRole');
    }

    // Test execution methods
    async runAllTests() {
        this.setup();
        
        try {
            await this.testNavigationManagerInit();
            await this.testPageValidation();
            await this.testRoleNavigation();
            await this.testURLParameterHandling();
            await this.testBrowserHistorySupport();
            await this.testNavigationUtils();
            
            this.printResults();
        } catch (error) {
            console.error('❌ Test suite failed:', error);
        } finally {
            this.teardown();
        }
    }

    // Individual test methods
    async testNavigationManagerInit() {
        this.startTest('Navigation Manager Initialization');

        try {
            // Test that navigation manager exists
            this.assert(
                typeof window.navigationManager !== 'undefined',
                'NavigationManager should be globally available'
            );

            // Test that it has required methods
            const requiredMethods = ['navigate', 'goHome', 'goBack', 'setRoleAndNavigate'];
            requiredMethods.forEach(method => {
                this.assert(
                    typeof window.navigationManager[method] === 'function',
                    `NavigationManager should have ${method} method`
                );
            });

            // Test initial state
            this.assert(
                typeof window.navigationManager.currentPage === 'string',
                'NavigationManager should track current page'
            );

            this.passTest('Navigation Manager initialized successfully');
        } catch (error) {
            this.failTest(error.message);
        }
    }

    async testPageValidation() {
        this.startTest('Page Access Validation');

        try {
            const manager = window.navigationManager;

            // Test authenticated state
            localStorage.setItem('userSettings', JSON.stringify(TEST_CONFIG.testData.validUser));
            manager.userSettings = TEST_CONFIG.testData.validUser;
            
            this.assert(
                manager.isAuthenticated(),
                'Should recognize authenticated user'
            );

            // Test role validation
            localStorage.setItem('currentRole', 'teacher');
            manager.currentRole = 'teacher';
            
            // Mock current page as teacher dashboard
            manager.currentPage = 'teacher-dashboard.html';
            
            this.assert(
                manager.hasRequiredRole(),
                'Should validate correct role for page'
            );

            this.passTest('Page validation works correctly');
        } catch (error) {
            this.failTest(error.message);
        }
    }

    async testRoleNavigation() {
        this.startTest('Role-based Navigation');

        try {
            const manager = window.navigationManager;

            // Test teacher role navigation
            const teacherNavSpy = this.createNavigationSpy();
            manager.navigate = teacherNavSpy;
            
            manager.setRoleAndNavigate('teacher');
            
            this.assert(
                teacherNavSpy.lastCall === 'teacher-dashboard.html',
                'Should navigate to teacher dashboard for teacher role'
            );

            // Test student role navigation
            const studentNavSpy = this.createNavigationSpy();
            manager.navigate = studentNavSpy;
            
            manager.setRoleAndNavigate('student');
            
            this.assert(
                studentNavSpy.lastCall === 'student-dashboard.html',
                'Should navigate to student dashboard for student role'
            );

            this.passTest('Role-based navigation works correctly');
        } catch (error) {
            this.failTest(error.message);
        }
    }

    async testURLParameterHandling() {
        this.startTest('URL Parameter Handling');

        try {
            const manager = window.navigationManager;
            const navSpy = this.createNavigationSpy();
            manager.navigate = navSpy;

            // Test shared lesson parameter
            const originalSearch = window.location.search;
            
            // Simulate URL with addLesson parameter
            Object.defineProperty(window.location, 'search', {
                writable: true,
                value: '?addLesson=test-lesson-123'
            });

            manager.handleURLParameters();
            
            // Should redirect to student dashboard with parameter
            this.assert(
                navSpy.lastCall && navSpy.lastCall.includes('student-dashboard.html') && navSpy.lastCall.includes('addLesson'),
                'Should handle shared lesson parameter'
            );

            // Test activities navigation with parameters
            const activitiesUrl = manager.navigateToActivities('lesson-123', 2);
            
            // Restore original search
            Object.defineProperty(window.location, 'search', {
                writable: true,
                value: originalSearch
            });

            this.passTest('URL parameter handling works correctly');
        } catch (error) {
            this.failTest(error.message);
        }
    }

    async testBrowserHistorySupport() {
        this.startTest('Browser History Support');

        try {
            const manager = window.navigationManager;
            const originalPushState = window.history.pushState;
            const originalReplaceState = window.history.replaceState;
            
            let historyActions = [];
            
            // Mock history methods
            window.history.pushState = (state, title, url) => {
                historyActions.push({ type: 'push', state, title, url });
            };
            
            window.history.replaceState = (state, title, url) => {
                historyActions.push({ type: 'replace', state, title, url });
            };

            // Test navigation with history
            manager.navigate('test-page.html');
            
            this.assert(
                historyActions.length > 0,
                'Should push state to browser history'
            );

            // Test replace navigation
            manager.navigate('another-page.html', true);
            
            this.assert(
                historyActions.some(action => action.type === 'replace'),
                'Should support replace state navigation'
            );

            // Restore original methods
            window.history.pushState = originalPushState;
            window.history.replaceState = originalReplaceState;

            this.passTest('Browser history support works correctly');
        } catch (error) {
            this.failTest(error.message);
        }
    }

    async testNavigationUtils() {
        this.startTest('Navigation Utilities');

        try {
            // Test home button creation
            const homeButton = window.NavigationUtils.createHomeButton();
            
            this.assert(
                homeButton instanceof HTMLButtonElement,
                'Should create home button element'
            );
            
            this.assert(
                homeButton.textContent.includes('Home'),
                'Home button should have correct text'
            );

            // Test back button creation
            const backButton = window.NavigationUtils.createBackButton();
            
            this.assert(
                backButton instanceof HTMLButtonElement,
                'Should create back button element'
            );

            // Test role button creation
            const teacherButton = window.NavigationUtils.createRoleButton('teacher');
            
            this.assert(
                teacherButton instanceof HTMLButtonElement,
                'Should create role button element'
            );
            
            this.assert(
                teacherButton.textContent.includes('Teacher'),
                'Role button should have correct text'
            );

            this.passTest('Navigation utilities work correctly');
        } catch (error) {
            this.failTest(error.message);
        }
    }

    // Helper methods
    createNavigationSpy() {
        return {
            lastCall: null,
            calls: [],
            call: function(destination) {
                this.lastCall = destination;
                this.calls.push(destination);
            }
        };
    }

    startTest(name) {
        this.currentTest = { name, startTime: Date.now(), passed: false };
        console.log(`🔍 Testing: ${name}`);
    }

    passTest(message) {
        if (this.currentTest) {
            this.currentTest.passed = true;
            this.currentTest.message = message;
            this.currentTest.duration = Date.now() - this.currentTest.startTime;
            this.results.push(this.currentTest);
            console.log(`✅ ${this.currentTest.name}: ${message}`);
        }
    }

    failTest(message) {
        if (this.currentTest) {
            this.currentTest.passed = false;
            this.currentTest.message = message;
            this.currentTest.duration = Date.now() - this.currentTest.startTime;
            this.results.push(this.currentTest);
            console.error(`❌ ${this.currentTest.name}: ${message}`);
        }
    }

    assert(condition, message) {
        if (!condition) {
            throw new Error(message);
        }
    }

    printResults() {
        console.log('\n📊 Test Results Summary:');
        console.log('========================');
        
        const passed = this.results.filter(r => r.passed).length;
        const total = this.results.length;
        const duration = this.results.reduce((sum, r) => sum + r.duration, 0);
        
        console.log(`Passed: ${passed}/${total} tests`);
        console.log(`Total Duration: ${duration}ms`);
        console.log('');
        
        this.results.forEach(result => {
            const status = result.passed ? '✅' : '❌';
            console.log(`${status} ${result.name} (${result.duration}ms)`);
            if (!result.passed) {
                console.log(`   Error: ${result.message}`);
            }
        });
        
        if (passed === total) {
            console.log('\n🎉 All tests passed!');
        } else {
            console.log(`\n⚠️  ${total - passed} test(s) failed`);
        }
    }
}

/**
 * Manual Test Functions
 * These can be called from the browser console to test specific functionality
 */
window.NavigationTests = {
    // Test complete teacher flow
    async testTeacherFlow() {
        console.log('🎯 Testing Complete Teacher Flow');
        
        // Simulate teacher onboarding completion
        const userSettings = {
            name: 'Teacher Test',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher',
            createdAt: new Date().toISOString(),
            onboardingCompleted: true
        };
        
        localStorage.setItem('userSettings', JSON.stringify(userSettings));
        
        // Navigate through teacher flow
        console.log('1. Selecting teacher role...');
        window.navigationManager.setRoleAndNavigate('teacher');
        
        setTimeout(() => {
            console.log('2. Navigating to create lesson...');
            window.navigationManager.navigate('create-lesson.html');
            
            setTimeout(() => {
                console.log('3. Going back to dashboard...');
                window.navigationManager.goBack();
                
                setTimeout(() => {
                    console.log('4. Going home...');
                    window.navigationManager.goHome();
                    console.log('✅ Teacher flow test complete');
                }, 1000);
            }, 1000);
        }, 1000);
    },

    // Test complete student flow
    async testStudentFlow() {
        console.log('🎯 Testing Complete Student Flow');
        
        // Simulate student onboarding completion
        const userSettings = {
            name: 'Student Test',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=student',
            createdAt: new Date().toISOString(),
            onboardingCompleted: true
        };
        
        localStorage.setItem('userSettings', JSON.stringify(userSettings));
        
        // Navigate through student flow
        console.log('1. Selecting student role...');
        window.navigationManager.setRoleAndNavigate('student');
        
        setTimeout(() => {
            console.log('2. Navigating to activities...');
            window.navigationManager.navigateToActivities('lesson-123', 1);
            
            setTimeout(() => {
                console.log('3. Going back to dashboard...');
                window.navigationManager.goBack();
                
                setTimeout(() => {
                    console.log('4. Going home...');
                    window.navigationManager.goHome();
                    console.log('✅ Student flow test complete');
                }, 1000);
            }, 1000);
        }, 1000);
    },

    // Test shared lesson functionality
    testSharedLesson() {
        console.log('🎯 Testing Shared Lesson');
        
        // Simulate shared lesson URL
        const lessonId = 'shared-lesson-' + Math.random().toString(36).substr(2, 9);
        const sharedURL = `student-dashboard.html?addLesson=${lessonId}`;
        
        console.log('Navigating to shared lesson URL:', sharedURL);
        window.navigationManager.navigate(sharedURL);
        
        console.log('✅ Shared lesson test initiated');
    },

    // Test browser back/forward
    testBrowserNavigation() {
        console.log('🎯 Testing Browser Navigation');
        
        const pages = ['index.html', 'teacher-dashboard.html', 'create-lesson.html'];
        let currentIndex = 0;
        
        const navigateNext = () => {
            if (currentIndex < pages.length) {
                console.log(`Navigating to: ${pages[currentIndex]}`);
                window.navigationManager.navigate(pages[currentIndex]);
                currentIndex++;
                
                if (currentIndex < pages.length) {
                    setTimeout(navigateNext, 1000);
                } else {
                    console.log('Now test browser back button manually');
                    console.log('✅ Browser navigation test complete');
                }
            }
        };
        
        navigateNext();
    },

    // Run automated test suite
    runTestSuite() {
        const testSuite = new NavigationTestSuite();
        return testSuite.runAllTests();
    }
};

// Auto-run tests if in development mode
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🧪 Navigation Tests Available');
    console.log('Run NavigationTests.runTestSuite() to test the navigation system');
    console.log('Or run specific tests:');
    console.log('- NavigationTests.testTeacherFlow()');
    console.log('- NavigationTests.testStudentFlow()');
    console.log('- NavigationTests.testSharedLesson()');
    console.log('- NavigationTests.testBrowserNavigation()');
}