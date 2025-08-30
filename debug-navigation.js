/**
 * Debug script to test navigation fixes
 * Run this in browser console to verify navigation components
 */

console.log('🔧 Navigation Debug Script Starting...');

// Test 1: Check if Material Symbols font is loaded
function testMaterialSymbols() {
    console.log('\n📋 Testing Material Symbols Font...');
    
    // Check if font link exists
    const fontLink = document.querySelector('link[href*="Material+Symbols+Outlined"]');
    console.log('Font link found:', !!fontLink);
    
    // Test if font is actually loaded
    const testSpan = document.createElement('span');
    testSpan.className = 'material-symbols-outlined';
    testSpan.textContent = 'home';
    testSpan.style.fontSize = '24px';
    document.body.appendChild(testSpan);
    
    const computed = window.getComputedStyle(testSpan);
    console.log('Font family applied:', computed.fontFamily);
    
    document.body.removeChild(testSpan);
    return computed.fontFamily.includes('Material Symbols');
}

// Test 2: Check localStorage userSettings structure
function testUserSettings() {
    console.log('\n👤 Testing User Settings Structure...');
    
    const userSettingsStr = localStorage.getItem('userSettings');
    if (!userSettingsStr) {
        console.log('No userSettings found in localStorage');
        
        // Create test data
        const testUser = {
            name: 'Debug Test User',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=debug&backgroundColor=b6e3f4',
            onboardingCompleted: true
        };
        
        localStorage.setItem('userSettings', JSON.stringify(testUser));
        console.log('Created test userSettings:', testUser);
        return testUser;
    } else {
        try {
            const userData = JSON.parse(userSettingsStr);
            console.log('Existing userSettings found:', userData);
            console.log('Has name:', !!userData.name);
            console.log('Has avatar:', !!userData.avatar);
            console.log('Onboarding completed:', !!userData.onboardingCompleted);
            return userData;
        } catch (error) {
            console.error('Failed to parse userSettings:', error);
            return null;
        }
    }
}

// Test 3: Test navigation component creation
function testNavigationComponent() {
    console.log('\n🧭 Testing Navigation Component...');
    
    try {
        // Import navigation component dynamically
        import('./src/components/navigation.js').then(module => {
            const { createHeader } = module;
            
            const userData = testUserSettings();
            
            const header = createHeader({
                showHome: true,
                user: userData,
                onHome: () => console.log('🏠 Home button clicked'),
                onProfile: () => console.log('👤 Profile button clicked'),
                title: 'Debug Test'
            });
            
            console.log('Header component created successfully');
            
            // Check for home icon
            const homeIcon = header.querySelector('.material-symbols-outlined');
            console.log('Home icon found:', !!homeIcon);
            console.log('Home icon text:', homeIcon ? homeIcon.textContent : 'N/A');
            
            // Check for avatar
            const avatar = header.querySelector('img');
            console.log('Avatar found:', !!avatar);
            console.log('Avatar src:', avatar ? avatar.src : 'N/A');
            
            // Add to page for visual inspection
            const testContainer = document.createElement('div');
            testContainer.style.cssText = 'position: fixed; top: 10px; right: 10px; z-index: 9999; background: white; border: 2px solid red; padding: 10px;';
            testContainer.appendChild(header);
            document.body.appendChild(testContainer);
            
            console.log('✅ Navigation component test completed - check top-right corner');
            
        }).catch(error => {
            console.error('Failed to import navigation component:', error);
        });
        
    } catch (error) {
        console.error('Navigation component test failed:', error);
    }
}

// Test 4: Check current role
function testCurrentRole() {
    console.log('\n🎭 Testing Current Role...');
    
    const currentRole = localStorage.getItem('currentRole');
    console.log('Current role:', currentRole);
    
    if (!currentRole) {
        localStorage.setItem('currentRole', 'student');
        console.log('Set test role: student');
    }
    
    return currentRole || 'student';
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Running All Navigation Tests...\n');
    
    const results = {
        materialSymbols: testMaterialSymbols(),
        userSettings: testUserSettings(),
        currentRole: testCurrentRole()
    };
    
    console.log('\n📊 Test Results Summary:');
    console.log('- Material Symbols loaded:', results.materialSymbols);
    console.log('- User Settings valid:', !!results.userSettings);
    console.log('- Current Role set:', !!results.currentRole);
    
    // Test navigation component last
    setTimeout(testNavigationComponent, 1000);
    
    return results;
}

// Auto-run tests
runAllTests();

// Export functions for manual testing
window.debugNavigation = {
    testMaterialSymbols,
    testUserSettings,
    testNavigationComponent,
    testCurrentRole,
    runAllTests
};

console.log('🔧 Debug functions available at window.debugNavigation');