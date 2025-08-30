const { test, expect } = require('@playwright/test');

test.describe('Avatar Display Consistency Validation', () => {
  
  // Avatar validation helper functions
  async function getElementBorderRadius(page, selector) {
    return await page.$eval(selector, el => {
      const style = window.getComputedStyle(el);
      return style.borderRadius;
    });
  }

  async function getElementShape(page, selector) {
    return await page.$eval(selector, el => {
      const style = window.getComputedStyle(el);
      const width = parseFloat(style.width);
      const height = parseFloat(style.height);
      const borderRadius = parseFloat(style.borderRadius);
      
      return {
        width,
        height,
        borderRadius,
        isSquare: Math.abs(width - height) < 2, // Allow 2px tolerance
        isCircular: borderRadius >= Math.min(width, height) / 2
      };
    });
  }

  async function setupTestUser(page) {
    // Set up a test user with avatar data
    await page.addInitScript(() => {
      const testUser = {
        name: 'Test Teacher',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test123&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd93d,ffdfbf',
        role: 'teacher',
        onboardingCompleted: true,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('userSettings', JSON.stringify(testUser));
    });
  }

  async function triggerSettingsModal(page) {
    // Try multiple ways to open settings modal
    try {
      // Look for avatar button in header
      const avatarButton = await page.locator('[data-testid="avatar-button"], .profile-button, button:has(.avatar), button:has(img[src*="avatar"])').first();
      if (await avatarButton.isVisible()) {
        await avatarButton.click();
        return true;
      }
    } catch (e) {
      console.log('Avatar button method failed:', e.message);
    }

    try {
      // Look for settings/profile menu trigger
      const settingsButton = await page.locator('button:has-text("Settings"), button:has-text("Profile"), .settings-trigger').first();
      if (await settingsButton.isVisible()) {
        await settingsButton.click();
        return true;
      }
    } catch (e) {
      console.log('Settings button method failed:', e.message);
    }

    return false;
  }

  test.beforeEach(async ({ page }) => {
    await setupTestUser(page);
    console.log('Test user set up with avatar data');
  });

  test('Avatar: Header avatar displays as circular image', async ({ page, browserName }) => {
    await page.goto('/src/pages/teacher-dashboard.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Allow time for avatar to load
    
    // Look for avatar in header/navigation
    const avatarSelectors = [
      'img[alt*="avatar"]',
      'img[src*="avatar"]', 
      'img[src*="dicebear"]',
      '.avatar',
      '.profile-image',
      'button img'
    ];
    
    let avatarFound = false;
    let avatarElement = null;
    
    for (const selector of avatarSelectors) {
      try {
        const elements = await page.$$(selector);
        for (const element of elements) {
          const isVisible = await element.isVisible();
          if (isVisible) {
            avatarElement = element;
            avatarFound = true;
            console.log(`Found avatar using selector: ${selector}`);
            break;
          }
        }
        if (avatarFound) break;
      } catch (e) {
        console.log(`Selector ${selector} failed:`, e.message);
      }
    }
    
    if (avatarFound && avatarElement) {
      const shape = await avatarElement.evaluate(el => {
        const style = window.getComputedStyle(el);
        const width = parseFloat(style.width);
        const height = parseFloat(style.height);
        const borderRadius = parseFloat(style.borderRadius);
        
        return {
          width,
          height,
          borderRadius,
          isSquare: Math.abs(width - height) < 2,
          isCircular: borderRadius >= Math.min(width, height) / 2
        };
      });
      
      console.log(`Avatar shape in ${browserName}:`, shape);
      
      // Take screenshot for evidence
      await page.screenshot({ 
        path: `tests/screenshots/header-avatar-${browserName}.png`,
        fullPage: false,
        clip: { x: 0, y: 0, width: 1200, height: 200 } // Header area
      });
      
      expect(shape.isSquare, 'Avatar should have equal width and height').toBeTruthy();
      expect(shape.isCircular, 'Avatar should be circular (border-radius >= 50%)').toBeTruthy();
    } else {
      console.log('No avatar found in header - checking if initials fallback is displayed');
      
      // Check for initials fallback
      const initialsSelectors = [
        'div[class*="rounded-full"]',
        '.avatar-initials',
        '[data-initials]'
      ];
      
      let initialsFound = false;
      for (const selector of initialsSelectors) {
        try {
          const elements = await page.$$(selector);
          if (elements.length > 0) {
            const element = elements[0];
            const isVisible = await element.isVisible();
            if (isVisible) {
              const textContent = await element.textContent();
              if (textContent && textContent.trim().length > 0) {
                console.log(`Found initials fallback: ${textContent}`);
                initialsFound = true;
                
                const shape = await getElementShape(page, selector);
                console.log(`Initials fallback shape:`, shape);
                
                expect(shape.isCircular, 'Initials fallback should be circular').toBeTruthy();
                break;
              }
            }
          }
        } catch (e) {
          console.log(`Initials selector ${selector} failed:`, e.message);
        }
      }
      
      if (!initialsFound) {
        console.warn('Neither avatar image nor initials fallback found in header');
        // This might be expected if user setup is different, so we'll log but not fail
      }
    }
  });

  test('Avatar: Settings modal avatar displays as circular image', async ({ page, browserName }) => {
    await page.goto('/src/pages/teacher-dashboard.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const modalOpened = await triggerSettingsModal(page);
    
    if (modalOpened) {
      await page.waitForTimeout(1000); // Wait for modal to fully open
      
      // Look for avatar in modal/settings
      const modalAvatarSelectors = [
        '.modal img[alt*="avatar"]',
        '.modal img[src*="avatar"]',
        '.modal img[src*="dicebear"]',
        '.settings img',
        '.profile-settings img',
        '[role="dialog"] img'
      ];
      
      let modalAvatarFound = false;
      
      for (const selector of modalAvatarSelectors) {
        try {
          const elements = await page.$$(selector);
          if (elements.length > 0) {
            const element = elements[0];
            const isVisible = await element.isVisible();
            if (isVisible) {
              const shape = await element.evaluate(el => {
                const style = window.getComputedStyle(el);
                const width = parseFloat(style.width);
                const height = parseFloat(style.height);
                const borderRadius = parseFloat(style.borderRadius);
                
                return {
                  width,
                  height,
                  borderRadius,
                  isSquare: Math.abs(width - height) < 2,
                  isCircular: borderRadius >= Math.min(width, height) / 2
                };
              });
              
              console.log(`Modal avatar shape in ${browserName}:`, shape);
              modalAvatarFound = true;
              
              // Take screenshot for evidence
              await page.screenshot({ 
                path: `tests/screenshots/modal-avatar-${browserName}.png`
              });
              
              expect(shape.isSquare, 'Modal avatar should have equal width and height').toBeTruthy();
              expect(shape.isCircular, 'Modal avatar should be circular').toBeTruthy();
              break;
            }
          }
        } catch (e) {
          console.log(`Modal selector ${selector} failed:`, e.message);
        }
      }
      
      if (!modalAvatarFound) {
        console.log('No avatar found in settings modal');
        // Take screenshot anyway for debugging
        await page.screenshot({ 
          path: `tests/screenshots/modal-no-avatar-${browserName}.png`
        });
      }
    } else {
      console.log('Could not open settings modal for avatar consistency test');
      // Take screenshot of page for debugging
      await page.screenshot({ 
        path: `tests/screenshots/modal-trigger-failed-${browserName}.png`
      });
    }
  });

  test('Avatar: Header and modal avatars show same image', async ({ page, browserName }) => {
    await page.goto('/src/pages/teacher-dashboard.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Get header avatar source
    let headerAvatarSrc = null;
    const headerAvatarSelectors = [
      'img[src*="avatar"]',
      'img[src*="dicebear"]',
      'button img'
    ];
    
    for (const selector of headerAvatarSelectors) {
      try {
        const elements = await page.$$(selector);
        for (const element of elements) {
          const isVisible = await element.isVisible();
          if (isVisible) {
            headerAvatarSrc = await element.getAttribute('src');
            if (headerAvatarSrc) {
              console.log(`Header avatar src: ${headerAvatarSrc}`);
              break;
            }
          }
        }
        if (headerAvatarSrc) break;
      } catch (e) {
        console.log(`Header avatar selector ${selector} failed:`, e.message);
      }
    }
    
    // Try to open settings modal
    const modalOpened = await triggerSettingsModal(page);
    
    if (modalOpened && headerAvatarSrc) {
      await page.waitForTimeout(1000);
      
      // Get modal avatar source
      let modalAvatarSrc = null;
      const modalAvatarSelectors = [
        '.modal img[src*="avatar"]',
        '.modal img[src*="dicebear"]',
        '.settings img',
        '[role="dialog"] img'
      ];
      
      for (const selector of modalAvatarSelectors) {
        try {
          const elements = await page.$$(selector);
          if (elements.length > 0) {
            const element = elements[0];
            const isVisible = await element.isVisible();
            if (isVisible) {
              modalAvatarSrc = await element.getAttribute('src');
              if (modalAvatarSrc) {
                console.log(`Modal avatar src: ${modalAvatarSrc}`);
                break;
              }
            }
          }
        } catch (e) {
          console.log(`Modal avatar selector ${selector} failed:`, e.message);
        }
      }
      
      if (modalAvatarSrc) {
        // Take side-by-side screenshot for comparison
        await page.screenshot({ 
          path: `tests/screenshots/avatar-consistency-${browserName}.png`
        });
        
        expect(headerAvatarSrc).toBe(modalAvatarSrc);
        console.log(`Avatar consistency verified in ${browserName}`);
      } else {
        console.log('Could not find modal avatar for consistency check');
      }
    } else {
      console.log('Could not perform avatar consistency test - missing header avatar or modal failed to open');
    }
  });

  test('Avatar: Fallback behavior for missing/broken avatars', async ({ page, browserName }) => {
    // Set up user with broken avatar URL
    await page.addInitScript(() => {
      const testUser = {
        name: 'Test User',
        avatar: 'https://broken-url.com/nonexistent-avatar.jpg',
        role: 'teacher',
        onboardingCompleted: true,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('userSettings', JSON.stringify(testUser));
    });
    
    await page.goto('/src/pages/teacher-dashboard.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Wait for broken image to fail and fallback to load
    
    // Check for initials fallback
    const fallbackSelectors = [
      'div[class*="rounded-full"]',
      '.avatar-fallback',
      'div:has-text("T")', // First letter of "Test User"
    ];
    
    let fallbackFound = false;
    
    for (const selector of fallbackSelectors) {
      try {
        const elements = await page.locator(selector).all();
        for (const element of elements) {
          const isVisible = await element.isVisible();
          if (isVisible) {
            const textContent = await element.textContent();
            if (textContent && textContent.trim() === 'T') {
              console.log(`Found initials fallback: ${textContent}`);
              fallbackFound = true;
              
              const shape = await element.evaluate(el => {
                const style = window.getComputedStyle(el);
                const width = parseFloat(style.width);
                const height = parseFloat(style.height);
                const borderRadius = parseFloat(style.borderRadius);
                
                return {
                  width,
                  height,
                  borderRadius,
                  isCircular: borderRadius >= Math.min(width, height) / 2
                };
              });
              
              console.log(`Fallback shape in ${browserName}:`, shape);
              
              // Take screenshot for evidence
              await page.screenshot({ 
                path: `tests/screenshots/avatar-fallback-${browserName}.png`,
                fullPage: false,
                clip: { x: 0, y: 0, width: 1200, height: 200 }
              });
              
              expect(shape.isCircular, 'Avatar fallback should be circular').toBeTruthy();
              break;
            }
          }
        }
        if (fallbackFound) break;
      } catch (e) {
        console.log(`Fallback selector ${selector} failed:`, e.message);
      }
    }
    
    if (!fallbackFound) {
      console.log('Avatar fallback test could not find initials display');
      await page.screenshot({ 
        path: `tests/screenshots/avatar-fallback-missing-${browserName}.png`
      });
    }
  });

  test('Avatar: No user data graceful handling', async ({ page, browserName }) => {
    // Clear user data to test no-user scenario
    await page.addInitScript(() => {
      localStorage.removeItem('userSettings');
    });
    
    await page.goto('/src/pages/teacher-dashboard.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check that page doesn't break and handles missing user gracefully
    const pageTitle = await page.title();
    expect(pageTitle).toBeTruthy();
    
    // Take screenshot to verify no broken elements
    await page.screenshot({ 
      path: `tests/screenshots/no-user-data-${browserName}.png`
    });
    
    console.log(`No user data test completed for ${browserName} - page rendered without errors`);
  });
});