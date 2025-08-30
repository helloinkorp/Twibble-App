// Simple validation script using npx playwright directly
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function runSimpleValidation() {
    console.log('🚀 Typography and Avatar Validation Starting...');
    console.log('=' .repeat(60));
    
    // Create screenshots directory
    const screenshotsDir = path.join(__dirname, 'validation-screenshots');
    if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir);
    }
    
    // Test pages
    const pages = [
        'http://127.0.0.1:56712/src/pages/index.html',
        'http://127.0.0.1:56712/src/pages/onboarding.html',
        'http://127.0.0.1:56712/src/pages/teacher-dashboard.html',
        'http://127.0.0.1:56712/src/pages/student-dashboard.html',
        'http://127.0.0.1:56712/src/pages/activities.html',
        'http://127.0.0.1:56712/src/pages/create-lesson.html'
    ];
    
    const results = {
        pagesValidated: 0,
        typographyIssues: [],
        avatarIssues: [],
        screenshots: []
    };
    
    for (let i = 0; i < pages.length; i++) {
        const url = pages[i];
        const pageName = path.basename(url).replace('.html', '');
        
        try {
            console.log(`📄 Testing ${pageName}...`);
            
            // Create a validation script for this specific page
            const validateScript = `
const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
        // Set up test user
        await page.addInitScript(() => {
            const testUser = {
                name: 'Test User',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=validation123',
                role: 'teacher',
                onboardingCompleted: true
            };
            localStorage.setItem('userSettings', JSON.stringify(testUser));
        });
        
        await page.goto('${url}');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        // Validate fonts
        const fontCheck = await page.evaluate(() => {
            const elements = document.querySelectorAll('*');
            const invalidFonts = [];
            
            for (let el of elements) {
                const style = window.getComputedStyle(el);
                const fontFamily = style.fontFamily;
                const text = el.textContent?.trim();
                
                if (fontFamily && text) {
                    const validFonts = ['Poppins', 'Quicksand', 'Material Symbols Outlined'];
                    const isValid = validFonts.some(validFont => fontFamily.includes(validFont));
                    
                    if (!isValid) {
                        invalidFonts.push({
                            tag: el.tagName,
                            font: fontFamily,
                            text: text.substring(0, 20)
                        });
                    }
                }
            }
            
            return {
                totalInvalidFonts: invalidFonts.length,
                samples: invalidFonts.slice(0, 3)
            };
        });
        
        // Validate avatars
        const avatarCheck = await page.evaluate(() => {
            const avatars = document.querySelectorAll('img[src*="avatar"], img[src*="dicebear"], .avatar');
            const avatarInfo = [];
            
            for (let avatar of avatars) {
                const rect = avatar.getBoundingClientRect();
                const style = window.getComputedStyle(avatar);
                
                if (rect.width > 0 && rect.height > 0) {
                    const borderRadius = parseFloat(style.borderRadius);
                    const isCircular = borderRadius >= Math.min(rect.width, rect.height) / 2;
                    
                    avatarInfo.push({
                        width: rect.width,
                        height: rect.height,
                        borderRadius,
                        isCircular
                    });
                }
            }
            
            return avatarInfo;
        });
        
        // Take screenshot
        await page.screenshot({
            path: '${screenshotsDir}/${pageName}-validation.png',
            fullPage: true
        });
        
        console.log(JSON.stringify({
            page: '${pageName}',
            fonts: fontCheck,
            avatars: avatarCheck,
            screenshot: '${pageName}-validation.png'
        }));
        
    } catch (error) {
        console.error('ERROR:', error.message);
    }
    
    await browser.close();
})();
            `;
            
            // Write and execute the validation script
            const scriptPath = path.join(__dirname, `validate-${pageName}.js`);
            fs.writeFileSync(scriptPath, validateScript);
            
            const output = execSync(`node "${scriptPath}"`, { 
                encoding: 'utf8',
                timeout: 30000,
                cwd: __dirname
            });
            
            // Parse results
            try {
                const result = JSON.parse(output.trim());
                results.pagesValidated++;
                
                if (result.fonts.totalInvalidFonts > 0) {
                    results.typographyIssues.push({
                        page: result.page,
                        issues: result.fonts.samples
                    });
                }
                
                const nonCircularAvatars = result.avatars.filter(a => !a.isCircular);
                if (nonCircularAvatars.length > 0) {
                    results.avatarIssues.push({
                        page: result.page,
                        nonCircular: nonCircularAvatars.length,
                        total: result.avatars.length
                    });
                }
                
                results.screenshots.push(result.screenshot);
                
                console.log(`  ✅ Fonts: ${result.fonts.totalInvalidFonts === 0 ? 'PASS' : 'FAIL (' + result.fonts.totalInvalidFonts + ' issues)'}`);
                console.log(`  ✅ Avatars: ${result.avatars.length > 0 ? result.avatars.filter(a => a.isCircular).length + '/' + result.avatars.length + ' circular' : 'None found'}`);
                
            } catch (parseError) {
                console.log(`  ❌ Failed to parse results: ${parseError.message}`);
            }
            
            // Clean up script file
            fs.unlinkSync(scriptPath);
            
        } catch (error) {
            console.log(`  ❌ Error validating ${pageName}: ${error.message}`);
        }
    }
    
    // Generate summary report
    console.log('\\n' + '='.repeat(60));
    console.log('📊 VALIDATION SUMMARY');
    console.log('='.repeat(60));
    
    console.log(`Pages Validated: ${results.pagesValidated}/${pages.length}`);
    console.log(`Typography Issues: ${results.typographyIssues.length} pages`);
    console.log(`Avatar Issues: ${results.avatarIssues.length} pages`);
    console.log(`Screenshots: ${results.screenshots.length} files`);
    
    if (results.typographyIssues.length === 0) {
        console.log('✅ TYPOGRAPHY: All pages use only Poppins and Quicksand fonts');
    } else {
        console.log('❌ TYPOGRAPHY: Issues found on:');
        results.typographyIssues.forEach(issue => {
            console.log(`  - ${issue.page}: ${issue.issues.length} non-compliant elements`);
        });
    }
    
    if (results.avatarIssues.length === 0) {
        console.log('✅ AVATARS: All avatars are circular');
    } else {
        console.log('❌ AVATARS: Issues found on:');
        results.avatarIssues.forEach(issue => {
            console.log(`  - ${issue.page}: ${issue.nonCircular}/${issue.total} avatars not circular`);
        });
    }
    
    console.log(`\\n📁 Screenshots saved to: ${screenshotsDir}`);
    
    // Final assessment
    const allTypographyValid = results.typographyIssues.length === 0;
    const allAvatarsValid = results.avatarIssues.length === 0;
    
    if (allTypographyValid && allAvatarsValid) {
        console.log('\\n🎉 ALL VALIDATION TESTS PASSED!');
        console.log('✅ Typography system fully compliant (Poppins + Quicksand only)');
        console.log('✅ Avatar displays are circular and consistent');
    } else {
        console.log('\\n⚠️ Some issues found. Review the results above.');
    }
    
    // Save results
    fs.writeFileSync(
        path.join(__dirname, 'validation-results.json'),
        JSON.stringify(results, null, 2)
    );
    
    return allTypographyValid && allAvatarsValid;
}

if (require.main === module) {
    runSimpleValidation().catch(console.error);
}

module.exports = { runSimpleValidation };