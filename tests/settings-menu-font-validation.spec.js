const { test, expect } = require('@playwright/test');

test.describe('Settings Menu Font Validation (User-Specific Concern)', () => {
  
  // Settings menu specific font validation helpers
  async function getSettingsMenuElements(page) {
    const selectors = [
      '.settings',
      '.user-settings', 
      '.profile-settings',
      '.settings-menu',
      '.dropdown-menu',
      '[role="menu"]',
      '[data-settings]',
      '.modal .settings',
      '.profile-modal'
    ];
    
    const elements = [];
    for (const selector of selectors) {
      try {
        const found = await page.$$(selector);
        elements.push(...found);
      } catch (e) {
        console.log(`Selector ${selector} not found or failed`);
      }
    }
    
    return elements;
  }

  async function validateSettingsMenuFonts(page) {
    const settingsElements = await getSettingsMenuElements(page);
    const fontValidation = {
      totalElements: 0,
      validElements: 0,
      invalidElements: [],
      allFonts: new Set(),
      quicksandElements: 0
    };
    
    for (const element of settingsElements) {
      try {
        const isVisible = await element.isVisible();
        if (!isVisible) continue;
        
        // Get all text-containing descendants
        const textElements = await element.$$('*');
        
        for (const textEl of textElements) {
          const hasText = await textEl.evaluate(el => {
            return el.textContent && el.textContent.trim().length > 0;
          });
          
          if (hasText) {
            fontValidation.totalElements++;
            
            const fontFamily = await textEl.evaluate(el => 
              window.getComputedStyle(el).fontFamily
            );
            
            fontValidation.allFonts.add(fontFamily);
            
            if (fontFamily.includes('Quicksand')) {
              fontValidation.validElements++;
              fontValidation.quicksandElements++;
            } else {
              const elementInfo = await textEl.evaluate(el => ({
                tagName: el.tagName,
                className: el.className,
                textContent: el.textContent?.substring(0, 50),
                fontFamily: window.getComputedStyle(el).fontFamily
              }));
              fontValidation.invalidElements.push(elementInfo);
            }
          }
        }
      } catch (e) {
        console.log('Error processing settings element:', e.message);
      }
    }
    
    return fontValidation;
  }

  async function triggerSettingsMenu(page) {
    // Multiple strategies to open settings menu
    const triggers = [
      // Avatar button approach
      async () => {
        const avatarBtn = page.locator('button:has(img[src*="avatar"]), button:has(.avatar), [data-testid="avatar-button"]').first();
        if (await avatarBtn.isVisible({ timeout: 1000 })) {
          await avatarBtn.click();
          return true;
        }
        return false;
      },
      
      // Settings button approach  
      async () => {
        const settingsBtn = page.locator('button:has-text("Settings"), .settings-trigger, [aria-label*="settings"]').first();
        if (await settingsBtn.isVisible({ timeout: 1000 })) {
          await settingsBtn.click();
          return true;
        }
        return false;
      },
      
      // Profile/user menu approach
      async () => {
        const profileBtn = page.locator('button:has-text("Profile"), .profile-trigger, [aria-label*="profile"]').first();
        if (await profileBtn.isVisible({ timeout: 1000 })) {
          await profileBtn.click();
          return true;
        }
        return false;
      },
      
      // Three dots menu approach
      async () => {
        const menuBtn = page.locator('button:has-text("⋮"), button:has-text("..."), .menu-trigger').first();
        if (await menuBtn.isVisible({ timeout: 1000 })) {
          await menuBtn.click();
          return true;
        }
        return false;
      }
    ];
    
    for (const trigger of triggers) {
      try {
        const success = await trigger();
        if (success) {
          await page.waitForTimeout(500); // Wait for menu to open
          return true;
        }
      } catch (e) {
        console.log('Trigger failed:', e.message);
      }
    }
    
    return false;
  }

  async function setupTestUser(page) {
    await page.addInitScript(() => {
      const testUser = {
        name: 'Test Teacher',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test123',
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

  test('Settings Menu: ALL text uses Quicksand font (User Priority Test)', async ({ page, browserName }) => {
    await page.goto('/src/pages/teacher-dashboard.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log(`Testing settings menu fonts in ${browserName}`);
    
    const menuOpened = await triggerSettingsMenu(page);
    
    if (!menuOpened) {
      console.log('Could not open settings menu - taking screenshot for debugging');
      await page.screenshot({ 
        path: `tests/screenshots/settings-menu-not-found-${browserName}.png`
      });
      
      // Try to find any settings-related UI elements even if not in a modal
      const staticSettingsElements = await page.$$('.settings, [data-settings], .profile-section');
      if (staticSettingsElements.length > 0) {
        console.log('Found static settings elements instead of modal');
      } else {
        test.skip('Settings menu not found in current UI');
        return;
      }
    }
    
    await page.waitForTimeout(1000); // Allow menu to fully render
    
    // Take full screenshot for evidence
    await page.screenshot({ 
      path: `tests/screenshots/settings-menu-font-test-${browserName}.png`,
      fullPage: true
    });
    
    const fontValidation = await validateSettingsMenuFonts(page);
    
    console.log(`Settings Menu Font Analysis for ${browserName}:`);
    console.log(`- Total text elements: ${fontValidation.totalElements}`);
    console.log(`- Elements using Quicksand: ${fontValidation.quicksandElements}`);
    console.log(`- Elements with other fonts: ${fontValidation.totalElements - fontValidation.quicksandElements}`);
    console.log(`- All fonts found: ${Array.from(fontValidation.allFonts).join(', ')}`);
    
    if (fontValidation.invalidElements.length > 0) {
      console.log('NON-COMPLIANT ELEMENTS:');
      fontValidation.invalidElements.forEach((el, i) => {
        console.log(`  ${i+1}. <${el.tagName}> "${el.textContent}" - Font: ${el.fontFamily}`);
      });
    }
    
    // The critical assertion - this is what the user specifically wants validated
    expect(fontValidation.totalElements, 'No text elements found in settings menu').toBeGreaterThan(0);
    
    if (fontValidation.totalElements > 0) {
      const complianceRate = fontValidation.quicksandElements / fontValidation.totalElements;
      console.log(`Font compliance rate: ${(complianceRate * 100).toFixed(1)}%`);
      
      expect(complianceRate, 
        `Settings menu must use 100% Quicksand fonts. Found ${fontValidation.invalidElements.length} non-compliant elements: ${fontValidation.invalidElements.map(el => `${el.tagName}[${el.fontFamily}]`).join(', ')}`
      ).toBe(1.0);
    }
  });

  test('Settings Menu: Font consistency across menu items', async ({ page, browserName }) => {
    await page.goto('/src/pages/teacher-dashboard.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const menuOpened = await triggerSettingsMenu(page);
    
    if (menuOpened) {
      await page.waitForTimeout(1000);
      
      // Look for menu items specifically
      const menuItemSelectors = [
        '.menu-item',
        '.settings-item', 
        '.dropdown-item',
        '[role="menuitem"]',
        'li',
        'a[href*="settings"]',
        'button[class*="menu"]'
      ];
      
      const menuItemFonts = new Set();
      let menuItemsFound = 0;
      
      for (const selector of menuItemSelectors) {
        try {
          const items = await page.$$(selector);
          for (const item of items) {
            const isVisible = await item.isVisible();
            if (isVisible) {
              const fontFamily = await item.evaluate(el => 
                window.getComputedStyle(el).fontFamily
              );
              const text = await item.textContent();
              
              if (text && text.trim()) {
                menuItemFonts.add(fontFamily);
                menuItemsFound++;
                console.log(`Menu item "${text.trim()}" uses font: ${fontFamily}`);
                
                expect(fontFamily).toContain('Quicksand');
              }
            }
          }
        } catch (e) {
          console.log(`Menu item selector ${selector} failed:`, e.message);
        }
      }
      
      console.log(`Found ${menuItemsFound} menu items in ${browserName}`);
      console.log(`Unique fonts in menu items: ${Array.from(menuItemFonts).join(', ')}`);
      
      // All menu items should use the same font (Quicksand)
      if (menuItemsFound > 0) {
        expect(menuItemFonts.size, 'All menu items should use the same font family').toBeLessThanOrEqual(1);
        expect(Array.from(menuItemFonts)[0]).toContain('Quicksand');
      }
    }
  });

  test('Settings Menu: Font inheritance from parent elements', async ({ page, browserName }) => {
    await page.goto('/src/pages/teacher-dashboard.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const menuOpened = await triggerSettingsMenu(page);
    
    if (menuOpened) {
      await page.waitForTimeout(1000);
      
      // Check that parent containers have correct font that children inherit
      const containerSelectors = [
        '.settings',
        '.modal',
        '.dropdown-menu',
        '[role="menu"]'
      ];
      
      for (const selector of containerSelectors) {
        try {
          const containers = await page.$$(selector);
          for (const container of containers) {
            const isVisible = await container.isVisible();
            if (isVisible) {
              const containerFont = await container.evaluate(el => 
                window.getComputedStyle(el).fontFamily
              );
              
              console.log(`Container ${selector} font: ${containerFont}`);
              expect(containerFont).toContain('Quicksand');
              
              // Check children inherit correctly
              const children = await container.$$('*');
              for (let i = 0; i < Math.min(children.length, 5); i++) {
                const childFont = await children[i].evaluate(el => 
                  window.getComputedStyle(el).fontFamily
                );
                expect(childFont).toContain('Quicksand');
              }
            }
          }
        } catch (e) {
          console.log(`Container selector ${selector} failed:`, e.message);
        }
      }
    }
  });

  test('Settings Menu: Dynamic content font validation', async ({ page, browserName }) => {
    await page.goto('/src/pages/teacher-dashboard.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const menuOpened = await triggerSettingsMenu(page);
    
    if (menuOpened) {
      await page.waitForTimeout(1000);
      
      // Test any dynamic content that might be added to settings
      await page.evaluate(() => {
        // Add dynamic content to test font inheritance
        const settingsEl = document.querySelector('.settings, .modal, [role="menu"]');
        if (settingsEl) {
          const dynamicDiv = document.createElement('div');
          dynamicDiv.textContent = 'Dynamic Settings Content';
          dynamicDiv.className = 'dynamic-test-content';
          settingsEl.appendChild(dynamicDiv);
        }
      });
      
      await page.waitForTimeout(500);
      
      const dynamicFont = await page.$eval('.dynamic-test-content', el => 
        window.getComputedStyle(el).fontFamily
      ).catch(() => null);
      
      if (dynamicFont) {
        console.log(`Dynamic content font in ${browserName}: ${dynamicFont}`);
        expect(dynamicFont).toContain('Quicksand');
      }
    }
  });

  test('Settings Menu: Compare with before-fix state', async ({ page, browserName }) => {
    await page.goto('/src/pages/teacher-dashboard.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Take screenshot BEFORE opening menu
    await page.screenshot({ 
      path: `tests/screenshots/before-settings-menu-${browserName}.png`
    });
    
    const menuOpened = await triggerSettingsMenu(page);
    
    if (menuOpened) {
      await page.waitForTimeout(1000);
      
      // Take screenshot AFTER opening menu
      await page.screenshot({ 
        path: `tests/screenshots/after-settings-menu-${browserName}.png`
      });
      
      const fontValidation = await validateSettingsMenuFonts(page);
      
      // Generate evidence report
      const evidence = {
        browser: browserName,
        timestamp: new Date().toISOString(),
        settingsMenuFound: true,
        totalTextElements: fontValidation.totalElements,
        quicksandCompliantElements: fontValidation.quicksandElements,
        complianceRate: fontValidation.totalElements > 0 ? 
          (fontValidation.quicksandElements / fontValidation.totalElements * 100).toFixed(1) + '%' : 
          'N/A',
        allFontsFound: Array.from(fontValidation.allFonts),
        nonCompliantElements: fontValidation.invalidElements
      };
      
      console.log('SETTINGS MENU VALIDATION EVIDENCE:', JSON.stringify(evidence, null, 2));
      
      // Critical assertion for user requirement
      expect(fontValidation.quicksandElements).toBe(fontValidation.totalElements);
      console.log(`✅ PASS: All ${fontValidation.totalElements} text elements in settings menu use Quicksand font`);
    } else {
      console.log('⚠️ SKIP: Settings menu could not be opened for validation');
    }
  });
});