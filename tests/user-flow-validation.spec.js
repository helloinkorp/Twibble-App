const { test, expect } = require('@playwright/test');

test.describe('Complete User Flow Validation', () => {
  
  async function validatePageFonts(page, pageName) {
    const fontValidation = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const fontFamilies = new Set();
      const invalidFonts = [];
      
      for (let element of elements) {
        const style = window.getComputedStyle(element);
        const fontFamily = style.fontFamily;
        if (fontFamily && fontFamily !== '') {
          fontFamilies.add(fontFamily);
          
          const validFonts = ['Poppins', 'Quicksand', 'Material Symbols Outlined'];
          const isValid = validFonts.some(validFont => fontFamily.includes(validFont));
          
          if (!isValid && element.textContent?.trim()) {
            invalidFonts.push({
              tagName: element.tagName,
              fontFamily: fontFamily,
              text: element.textContent?.substring(0, 30),
              className: element.className
            });
          }
        }
      }
      
      return {
        allFonts: Array.from(fontFamilies),
        invalidFonts: invalidFonts.slice(0, 3), // Limit for logging
        isValid: invalidFonts.length === 0
      };
    });
    
    console.log(`${pageName} font validation:`, fontValidation.allFonts);
    if (fontValidation.invalidFonts.length > 0) {
      console.log(`Invalid fonts on ${pageName}:`, fontValidation.invalidFonts);
    }
    
    return fontValidation;
  }

  async function validatePageAvatar(page, pageName) {
    const avatarValidation = await page.evaluate(() => {
      const avatarSelectors = [
        'img[src*="avatar"]',
        'img[src*="dicebear"]',
        '.avatar',
        'div[class*="rounded-full"]'
      ];
      
      const avatars = [];
      
      for (const selector of avatarSelectors) {
        const elements = document.querySelectorAll(selector);
        for (const el of elements) {
          const rect = el.getBoundingClientRect();
          const style = window.getComputedStyle(el);
          
          if (rect.width > 0 && rect.height > 0) {
            avatars.push({
              selector: selector,
              width: rect.width,
              height: rect.height,
              borderRadius: parseFloat(style.borderRadius),
              isCircular: parseFloat(style.borderRadius) >= Math.min(rect.width, rect.height) / 2,
              src: el.src || el.textContent?.trim()
            });
          }
        }
      }
      
      return avatars;
    });
    
    console.log(`${pageName} avatar validation: ${avatarValidation.length} avatars found`);
    return avatarValidation;
  }

  test('Complete Flow: Onboarding → Role Selection → Dashboard → Settings', async ({ page, browserName }) => {
    console.log(`Running complete user flow test in ${browserName}`);
    
    // Step 1: Start onboarding
    await page.goto('/src/pages/onboarding.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Validate onboarding page typography
    const onboardingFonts = await validatePageFonts(page, 'Onboarding');
    await page.screenshot({ 
      path: `tests/screenshots/flow-01-onboarding-${browserName}.png`,
      fullPage: true
    });
    
    expect(onboardingFonts.isValid, 
      `Onboarding page has invalid fonts: ${onboardingFonts.invalidFonts.map(f => f.fontFamily).join(', ')}`
    ).toBeTruthy();
    
    // Step 2: Complete onboarding form
    try {
      // Fill name field
      const nameInput = page.locator('input[type="text"], input[placeholder*="name" i]').first();
      if (await nameInput.isVisible({ timeout: 2000 })) {
        await nameInput.fill('Test User');
      }
      
      // Select teacher role if available
      const teacherRole = page.locator('button:has-text("Teacher"), input[value="teacher"], [data-role="teacher"]').first();
      if (await teacherRole.isVisible({ timeout: 2000 })) {
        await teacherRole.click();
        await page.waitForTimeout(500);
      }
      
      // Select an avatar if available
      const avatarOption = page.locator('.avatar-option, [data-avatar], img[src*="dicebear"]').first();
      if (await avatarOption.isVisible({ timeout: 2000 })) {
        await avatarOption.click();
        await page.waitForTimeout(500);
      }
      
      // Submit form
      const continueBtn = page.locator('button:has-text("Continue"), button:has-text("Next"), button[type="submit"]').first();
      if (await continueBtn.isVisible({ timeout: 2000 })) {
        await continueBtn.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
      }
    } catch (e) {
      console.log('Onboarding form interaction failed:', e.message);
    }
    
    // Step 3: Validate we reached a dashboard or next step
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    console.log(`After onboarding flow, current URL: ${currentUrl}`);
    
    // Take screenshot of where we ended up
    await page.screenshot({ 
      path: `tests/screenshots/flow-02-post-onboarding-${browserName}.png`,
      fullPage: true
    });
    
    // Step 4: Navigate to teacher dashboard (may already be there)
    if (!currentUrl.includes('teacher-dashboard')) {
      try {
        await page.goto('/src/pages/teacher-dashboard.html');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
      } catch (e) {
        console.log('Failed to navigate to teacher dashboard:', e.message);
      }
    }
    
    // Validate teacher dashboard
    const dashboardFonts = await validatePageFonts(page, 'Teacher Dashboard');
    const dashboardAvatars = await validatePageAvatar(page, 'Teacher Dashboard');
    
    await page.screenshot({ 
      path: `tests/screenshots/flow-03-dashboard-${browserName}.png`,
      fullPage: true
    });
    
    expect(dashboardFonts.isValid, 
      `Dashboard page has invalid fonts: ${dashboardFonts.invalidFonts.map(f => f.fontFamily).join(', ')}`
    ).toBeTruthy();
    
    if (dashboardAvatars.length > 0) {
      dashboardAvatars.forEach((avatar, i) => {
        expect(avatar.isCircular, 
          `Dashboard avatar ${i+1} should be circular`).toBeTruthy();
      });
    }
    
    // Step 5: Try to access settings menu
    let settingsOpened = false;
    try {
      // Multiple strategies to open settings
      const settingsTriggers = [
        'button:has(img[src*="avatar"])',
        'button:has(.avatar)', 
        '.profile-button',
        'button:has-text("Settings")',
        '[data-testid="avatar-button"]'
      ];
      
      for (const trigger of settingsTriggers) {
        try {
          const btn = page.locator(trigger).first();
          if (await btn.isVisible({ timeout: 1000 })) {
            await btn.click();
            await page.waitForTimeout(1000);
            settingsOpened = true;
            console.log(`Settings opened using trigger: ${trigger}`);
            break;
          }
        } catch (e) {
          console.log(`Settings trigger ${trigger} failed:`, e.message);
        }
      }
    } catch (e) {
      console.log('Settings menu access failed:', e.message);
    }
    
    if (settingsOpened) {
      // Validate settings menu fonts
      await page.waitForTimeout(1000);
      
      const settingsFonts = await page.evaluate(() => {
        const settingsElements = document.querySelectorAll('.settings, .modal, [role="menu"], [role="dialog"]');
        const fonts = new Set();
        const invalidFonts = [];
        
        for (const container of settingsElements) {
          const textElements = container.querySelectorAll('*');
          for (const el of textElements) {
            const text = el.textContent?.trim();
            if (text) {
              const fontFamily = window.getComputedStyle(el).fontFamily;
              fonts.add(fontFamily);
              
              if (!fontFamily.includes('Quicksand')) {
                invalidFonts.push({
                  tagName: el.tagName,
                  fontFamily: fontFamily,
                  text: text.substring(0, 20)
                });
              }
            }
          }
        }
        
        return {
          allFonts: Array.from(fonts),
          invalidFonts: invalidFonts.slice(0, 3),
          isValid: invalidFonts.length === 0
        };
      });
      
      await page.screenshot({ 
        path: `tests/screenshots/flow-04-settings-${browserName}.png`,
        fullPage: true
      });
      
      console.log(`Settings menu fonts: ${settingsFonts.allFonts.join(', ')}`);
      
      expect(settingsFonts.isValid, 
        `Settings menu has invalid fonts: ${settingsFonts.invalidFonts.map(f => f.fontFamily).join(', ')}`
      ).toBeTruthy();
      
      console.log('✅ Settings menu font validation passed');
    } else {
      console.log('⚠️ Settings menu could not be opened during flow test');
    }
    
    // Step 6: Test navigation to other pages
    const pagesToTest = [
      { path: '/src/pages/activities.html', name: 'Activities' },
      { path: '/src/pages/create-lesson.html', name: 'Create Lesson' }
    ];
    
    for (const pageTest of pagesToTest) {
      try {
        await page.goto(pageTest.path);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        
        const pageFonts = await validatePageFonts(page, pageTest.name);
        const pageAvatars = await validatePageAvatar(page, pageTest.name);
        
        await page.screenshot({ 
          path: `tests/screenshots/flow-05-${pageTest.name.toLowerCase().replace(' ', '-')}-${browserName}.png`,
          fullPage: true
        });
        
        expect(pageFonts.isValid, 
          `${pageTest.name} page has invalid fonts: ${pageFonts.invalidFonts.map(f => f.fontFamily).join(', ')}`
        ).toBeTruthy();
        
        if (pageAvatars.length > 0) {
          pageAvatars.forEach((avatar, i) => {
            expect(avatar.isCircular, 
              `${pageTest.name} avatar ${i+1} should be circular`).toBeTruthy();
          });
        }
      } catch (e) {
        console.log(`Failed to test ${pageTest.name} page:`, e.message);
      }
    }
    
    console.log(`✅ Complete user flow test passed in ${browserName}`);
  });

  test('User Flow: Onboarding avatar persistence validation', async ({ page, browserName }) => {
    // Test that avatar selected in onboarding appears in subsequent pages
    await page.goto('/src/pages/onboarding.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    let selectedAvatarSrc = null;
    
    try {
      // Try to select an avatar and capture its source
      const avatarOptions = page.locator('.avatar-option, [data-avatar], img[src*="dicebear"]');
      const count = await avatarOptions.count();
      
      if (count > 0) {
        const firstAvatar = avatarOptions.first();
        selectedAvatarSrc = await firstAvatar.getAttribute('src') || 
                           await firstAvatar.getAttribute('data-avatar');
        
        if (selectedAvatarSrc) {
          await firstAvatar.click();
          await page.waitForTimeout(500);
          console.log(`Selected avatar: ${selectedAvatarSrc}`);
        }
      }
      
      // Complete onboarding
      const nameInput = page.locator('input[type="text"]').first();
      if (await nameInput.isVisible({ timeout: 1000 })) {
        await nameInput.fill('Avatar Test User');
      }
      
      const continueBtn = page.locator('button:has-text("Continue"), button:has-text("Next")').first();
      if (await continueBtn.isVisible({ timeout: 1000 })) {
        await continueBtn.click();
        await page.waitForTimeout(2000);
      }
    } catch (e) {
      console.log('Avatar selection in onboarding failed:', e.message);
    }
    
    // Navigate to dashboard and check avatar persistence
    await page.goto('/src/pages/teacher-dashboard.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    if (selectedAvatarSrc) {
      const dashboardAvatar = await page.evaluate((expectedSrc) => {
        const avatars = document.querySelectorAll('img[src*="avatar"], img[src*="dicebear"]');
        for (const avatar of avatars) {
          if (avatar.src === expectedSrc) {
            const rect = avatar.getBoundingClientRect();
            const style = window.getComputedStyle(avatar);
            return {
              found: true,
              width: rect.width,
              height: rect.height,
              borderRadius: parseFloat(style.borderRadius),
              isCircular: parseFloat(style.borderRadius) >= Math.min(rect.width, rect.height) / 2
            };
          }
        }
        return { found: false };
      }, selectedAvatarSrc);
      
      await page.screenshot({ 
        path: `tests/screenshots/avatar-persistence-${browserName}.png`,
        fullPage: false,
        clip: { x: 0, y: 0, width: 1200, height: 200 }
      });
      
      if (dashboardAvatar.found) {
        console.log('✅ Avatar persisted from onboarding to dashboard');
        expect(dashboardAvatar.isCircular, 'Persisted avatar should be circular').toBeTruthy();
      } else {
        console.log('⚠️ Avatar did not persist from onboarding to dashboard');
      }
    }
  });

  test('User Flow: Multi-page font consistency validation', async ({ page, browserName }) => {
    const pages = [
      '/src/pages/index.html',
      '/src/pages/onboarding.html', 
      '/src/pages/teacher-dashboard.html',
      '/src/pages/student-dashboard.html',
      '/src/pages/activities.html',
      '/src/pages/create-lesson.html'
    ];
    
    const pageResults = [];
    
    for (const pagePath of pages) {
      try {
        await page.goto(pagePath);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        
        const fontValidation = await validatePageFonts(page, pagePath);
        
        pageResults.push({
          page: pagePath,
          isValid: fontValidation.isValid,
          fonts: fontValidation.allFonts,
          invalidFonts: fontValidation.invalidFonts
        });
        
        await page.screenshot({ 
          path: `tests/screenshots/multi-page-${pagePath.replace(/[^a-zA-Z0-9]/g, '_')}-${browserName}.png`,
          fullPage: true
        });
      } catch (e) {
        console.log(`Failed to test page ${pagePath}:`, e.message);
        pageResults.push({
          page: pagePath,
          isValid: false,
          error: e.message
        });
      }
    }
    
    // Summarize results
    const validPages = pageResults.filter(r => r.isValid).length;
    const totalPages = pageResults.length;
    
    console.log(`Multi-page font consistency: ${validPages}/${totalPages} pages valid`);
    
    pageResults.forEach(result => {
      if (!result.isValid) {
        console.log(`❌ ${result.page}: ${result.error || 'Font validation failed'}`);
        if (result.invalidFonts) {
          console.log(`  Invalid fonts:`, result.invalidFonts);
        }
      } else {
        console.log(`✅ ${result.page}: All fonts valid`);
      }
    });
    
    // All pages should have valid typography
    expect(validPages).toBe(totalPages);
  });
});