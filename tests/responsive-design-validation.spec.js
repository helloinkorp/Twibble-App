const { test, expect } = require('@playwright/test');

test.describe('Responsive Design Validation', () => {
  
  const viewports = [
    { name: 'mobile-small', width: 320, height: 568 },
    { name: 'mobile-medium', width: 375, height: 667 },
    { name: 'mobile-large', width: 414, height: 896 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop-small', width: 1024, height: 768 },
    { name: 'desktop-large', width: 1440, height: 900 }
  ];

  async function validateTypographyAtViewport(page, viewport) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.waitForTimeout(500); // Allow layout to adjust
    
    // Check that fonts remain consistent
    const fontValidation = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const fontFamilies = new Set();
      const invalidFonts = [];
      
      for (let element of elements) {
        const style = window.getComputedStyle(element);
        const fontFamily = style.fontFamily;
        if (fontFamily && fontFamily !== '') {
          fontFamilies.add(fontFamily);
          
          // Check if font contains our valid fonts
          const validFonts = ['Poppins', 'Quicksand', 'Material Symbols Outlined'];
          const isValid = validFonts.some(validFont => fontFamily.includes(validFont));
          
          if (!isValid) {
            invalidFonts.push({
              tagName: element.tagName,
              fontFamily: fontFamily,
              className: element.className
            });
          }
        }
      }
      
      return {
        allFonts: Array.from(fontFamilies),
        invalidFonts: invalidFonts.slice(0, 5), // Limit for logging
        isValid: invalidFonts.length === 0
      };
    });
    
    return fontValidation;
  }

  async function validateAvatarAtViewport(page, viewport) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.waitForTimeout(500);
    
    // Look for avatars and check they remain circular
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
              isVisible: rect.width > 0 && rect.height > 0,
              isSquare: Math.abs(rect.width - rect.height) < 2,
              isCircular: parseFloat(style.borderRadius) >= Math.min(rect.width, rect.height) / 2
            });
          }
        }
      }
      
      return avatars;
    });
    
    return avatarValidation;
  }

  async function setupTestUser(page) {
    await page.addInitScript(() => {
      const testUser = {
        name: 'Test User',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=responsive123',
        role: 'teacher',
        onboardingCompleted: true,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('userSettings', JSON.stringify(testUser));
    });
  }

  test.beforeEach(async ({ page }) => {
    await setupTestUser(page);
  });

  for (const viewport of viewports) {
    test(`Typography: Font consistency at ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page, browserName }) => {
      await page.goto('/src/pages/teacher-dashboard.html');
      await page.waitForLoadState('networkidle');
      
      const fontValidation = await validateTypographyAtViewport(page, viewport);
      
      // Take screenshot for evidence
      await page.screenshot({ 
        path: `tests/screenshots/typography-${viewport.name}-${browserName}.png`,
        fullPage: true
      });
      
      console.log(`Typography validation at ${viewport.name} (${browserName}):`);
      console.log(`- All fonts: ${fontValidation.allFonts.join(', ')}`);
      if (fontValidation.invalidFonts.length > 0) {
        console.log(`- Invalid fonts found:`, fontValidation.invalidFonts);
      }
      
      expect(fontValidation.isValid, 
        `Invalid fonts found at ${viewport.name}: ${fontValidation.invalidFonts.map(f => f.fontFamily).join(', ')}`
      ).toBeTruthy();
    });
    
    test(`Avatar: Circular display at ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page, browserName }) => {
      await page.goto('/src/pages/teacher-dashboard.html');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      const avatarValidation = await validateAvatarAtViewport(page, viewport);
      
      // Take screenshot for evidence
      await page.screenshot({ 
        path: `tests/screenshots/avatar-${viewport.name}-${browserName}.png`,
        fullPage: false,
        clip: { x: 0, y: 0, width: Math.min(viewport.width, 800), height: 200 }
      });
      
      console.log(`Avatar validation at ${viewport.name} (${browserName}):`);
      console.log(`- Avatars found: ${avatarValidation.length}`);
      
      avatarValidation.forEach((avatar, i) => {
        console.log(`- Avatar ${i+1}: ${avatar.width}x${avatar.height}, circular: ${avatar.isCircular}`);
        
        if (avatar.isVisible) {
          expect(avatar.isSquare, 
            `Avatar should be square at ${viewport.name}`).toBeTruthy();
          expect(avatar.isCircular, 
            `Avatar should be circular at ${viewport.name}`).toBeTruthy();
        }
      });
    });
  }

  test('Typography: Readability across all viewport sizes', async ({ page, browserName }) => {
    const readabilityTests = [];
    
    for (const viewport of viewports) {
      await page.goto('/src/pages/teacher-dashboard.html');
      await page.waitForLoadState('networkidle');
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(500);
      
      const readabilityData = await page.evaluate(() => {
        const textElements = document.querySelectorAll('h1, h2, h3, p, span, button, input, label');
        const readings = [];
        
        for (const el of textElements) {
          const style = window.getComputedStyle(el);
          const fontSize = parseFloat(style.fontSize);
          const lineHeight = parseFloat(style.lineHeight);
          const text = el.textContent?.trim();
          
          if (text && fontSize > 0) {
            readings.push({
              tagName: el.tagName,
              fontSize: fontSize,
              lineHeight: lineHeight,
              isReadable: fontSize >= 14, // Minimum readable size
              text: text.substring(0, 30)
            });
          }
        }
        
        return readings.slice(0, 10); // Limit for performance
      });
      
      readabilityTests.push({
        viewport: viewport.name,
        elements: readabilityData
      });
      
      // Check minimum font sizes
      const unreadableElements = readabilityData.filter(el => !el.isReadable);
      if (unreadableElements.length > 0) {
        console.log(`Potentially unreadable elements at ${viewport.name}:`, unreadableElements);
      }
      
      expect(unreadableElements.length, 
        `Found ${unreadableElements.length} elements with font-size < 14px at ${viewport.name}`
      ).toBeLessThanOrEqual(0);
    }
    
    console.log(`Typography readability test completed across ${readabilityTests.length} viewports`);
  });

  test('Avatar: Consistent sizing across viewport changes', async ({ page, browserName }) => {
    await page.goto('/src/pages/teacher-dashboard.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const avatarSizes = [];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(500);
      
      const avatarSize = await page.evaluate(() => {
        const avatar = document.querySelector('img[src*="avatar"], .avatar, div[class*="rounded-full"]');
        if (avatar) {
          const rect = avatar.getBoundingClientRect();
          const style = window.getComputedStyle(avatar);
          return {
            width: rect.width,
            height: rect.height,
            borderRadius: parseFloat(style.borderRadius)
          };
        }
        return null;
      });
      
      if (avatarSize) {
        avatarSizes.push({
          viewport: viewport.name,
          ...avatarSize
        });
        
        console.log(`Avatar size at ${viewport.name}: ${avatarSize.width}x${avatarSize.height}`);
      }
    }
    
    // Avatar should maintain reasonable proportions across viewports
    if (avatarSizes.length > 0) {
      const minSize = Math.min(...avatarSizes.map(a => Math.min(a.width, a.height)));
      const maxSize = Math.max(...avatarSizes.map(a => Math.max(a.width, a.height)));
      
      console.log(`Avatar size range: ${minSize}px to ${maxSize}px`);
      
      // Reasonable range for avatar sizes (20px to 80px)
      expect(minSize).toBeGreaterThanOrEqual(20);
      expect(maxSize).toBeLessThanOrEqual(80);
      
      // All avatars should be circular
      avatarSizes.forEach(avatar => {
        const expectedRadius = Math.min(avatar.width, avatar.height) / 2;
        expect(avatar.borderRadius).toBeGreaterThanOrEqual(expectedRadius * 0.9); // 90% tolerance
      });
    }
  });

  test('Settings Menu: Responsive font validation', async ({ page, browserName }) => {
    for (const viewport of [viewports[0], viewports[3], viewports[5]]) { // Mobile, tablet, desktop
      await page.goto('/src/pages/teacher-dashboard.html');
      await page.waitForLoadState('networkidle');
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(2000);
      
      // Try to open settings menu (mobile vs desktop may differ)
      let menuOpened = false;
      try {
        const avatarBtn = page.locator('button:has(img[src*="avatar"]), .profile-button').first();
        if (await avatarBtn.isVisible({ timeout: 2000 })) {
          await avatarBtn.click();
          await page.waitForTimeout(1000);
          menuOpened = true;
        }
      } catch (e) {
        console.log(`Settings menu trigger failed at ${viewport.name}`);
      }
      
      if (menuOpened) {
        // Take screenshot
        await page.screenshot({ 
          path: `tests/screenshots/settings-responsive-${viewport.name}-${browserName}.png`,
          fullPage: true
        });
        
        // Validate fonts in settings menu
        const settingsFonts = await page.evaluate(() => {
          const settingsElements = document.querySelectorAll('.settings, .modal, [role="menu"], [role="dialog"]');
          const fonts = new Set();
          
          for (const container of settingsElements) {
            const textElements = container.querySelectorAll('*');
            for (const el of textElements) {
              if (el.textContent?.trim()) {
                const fontFamily = window.getComputedStyle(el).fontFamily;
                fonts.add(fontFamily);
              }
            }
          }
          
          return Array.from(fonts);
        });
        
        console.log(`Settings menu fonts at ${viewport.name}:`, settingsFonts);
        
        // All settings menu fonts should contain Quicksand
        settingsFonts.forEach(font => {
          expect(font).toContain('Quicksand');
        });
      }
    }
  });
});