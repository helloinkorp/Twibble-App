const { test, expect } = require('@playwright/test');

test.describe('Typography System Validation', () => {
  
  // Typography validation helper functions
  async function getFontFamily(page, selector) {
    return await page.$eval(selector, el => {
      return window.getComputedStyle(el).fontFamily;
    });
  }

  async function getAllFontFamilies(page) {
    return await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const fontFamilies = new Set();
      
      for (let element of elements) {
        const style = window.getComputedStyle(element);
        const fontFamily = style.fontFamily;
        if (fontFamily && fontFamily !== '') {
          fontFamilies.add(fontFamily);
        }
      }
      
      return Array.from(fontFamilies);
    });
  }

  async function validateDesignSystemFonts(page) {
    const fontFamilies = await getAllFontFamilies(page);
    const validFonts = [
      'Poppins', 
      'Quicksand', 
      '"Material Symbols Outlined"',
      'Material Symbols Outlined'
    ];
    
    const invalidFonts = fontFamilies.filter(font => {
      // Check if font contains any of our valid fonts
      return !validFonts.some(validFont => font.includes(validFont));
    });
    
    return {
      allFonts: fontFamilies,
      invalidFonts: invalidFonts,
      isValid: invalidFonts.length === 0
    };
  }

  test.beforeEach(async ({ page }) => {
    // Set up consistent test environment
    await page.addInitScript(() => {
      // Ensure fonts are loaded
      document.fonts.ready.then(() => {
        console.log('All fonts loaded');
      });
    });
  });

  test('Typography: All pages use only Poppins and Quicksand fonts', async ({ page, browserName }) => {
    const pages = [
      '/src/pages/onboarding.html',
      '/src/pages/index.html',
      '/src/pages/teacher-dashboard.html',
      '/src/pages/student-dashboard.html',
      '/src/pages/activities.html',
      '/src/pages/create-lesson.html'
    ];

    for (const pagePath of pages) {
      console.log(`Testing typography on ${pagePath} in ${browserName}`);
      
      await page.goto(pagePath);
      
      // Wait for fonts to load and page to be fully rendered
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      const fontValidation = await validateDesignSystemFonts(page);
      
      // Take screenshot for evidence
      await page.screenshot({ 
        path: `tests/screenshots/typography-${pagePath.replace(/[^a-zA-Z0-9]/g, '_')}-${browserName}.png`,
        fullPage: true 
      });
      
      // Detailed logging for debugging
      console.log(`Page: ${pagePath}, Browser: ${browserName}`);
      console.log(`All fonts found:`, fontValidation.allFonts);
      if (fontValidation.invalidFonts.length > 0) {
        console.log(`Invalid fonts found:`, fontValidation.invalidFonts);
      }
      
      expect(fontValidation.isValid, 
        `Page ${pagePath} contains invalid fonts: ${fontValidation.invalidFonts.join(', ')}`
      ).toBeTruthy();
    }
  });

  test('Typography: Headers use Poppins font family', async ({ page }) => {
    await page.goto('/src/pages/teacher-dashboard.html');
    await page.waitForLoadState('networkidle');
    
    const headerSelectors = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    
    for (const selector of headerSelectors) {
      const headers = await page.$$(selector);
      
      for (const header of headers) {
        const fontFamily = await header.evaluate(el => 
          window.getComputedStyle(el).fontFamily
        );
        
        expect(fontFamily).toContain('Poppins');
        console.log(`${selector} font-family: ${fontFamily}`);
      }
    }
  });

  test('Typography: Body text uses Quicksand font family', async ({ page }) => {
    await page.goto('/src/pages/teacher-dashboard.html');
    await page.waitForLoadState('networkidle');
    
    const bodySelectors = ['p', 'span', 'div', 'li', 'td'];
    
    for (const selector of bodySelectors) {
      const elements = await page.$$(selector);
      
      // Test first few elements of each type
      for (let i = 0; i < Math.min(elements.length, 3); i++) {
        const element = elements[i];
        const fontFamily = await element.evaluate(el => 
          window.getComputedStyle(el).fontFamily
        );
        
        expect(fontFamily).toContain('Quicksand');
        console.log(`${selector}[${i}] font-family: ${fontFamily}`);
      }
    }
  });

  test('Typography: Form elements use Quicksand font family', async ({ page }) => {
    await page.goto('/src/pages/onboarding.html');
    await page.waitForLoadState('networkidle');
    
    const formSelectors = ['input', 'textarea', 'select', 'button'];
    
    for (const selector of formSelectors) {
      const elements = await page.$$(selector);
      
      for (const element of elements) {
        const fontFamily = await element.evaluate(el => 
          window.getComputedStyle(el).fontFamily
        );
        
        expect(fontFamily).toContain('Quicksand');
        console.log(`${selector} font-family: ${fontFamily}`);
      }
    }
  });

  test('Typography: Dynamic content maintains font consistency', async ({ page }) => {
    await page.goto('/src/pages/teacher-dashboard.html');
    await page.waitForLoadState('networkidle');
    
    // Test any modals or dynamic content that might be generated
    const dynamicSelectors = [
      '[role="dialog"]',
      '[role="menu"]', 
      '.modal',
      '.dropdown',
      '.popup'
    ];
    
    for (const selector of dynamicSelectors) {
      const elements = await page.$$(selector);
      
      for (const element of elements) {
        const fontFamily = await element.evaluate(el => 
          window.getComputedStyle(el).fontFamily
        );
        
        if (fontFamily) {
          expect(fontFamily).toContain('Quicksand');
          console.log(`Dynamic content ${selector} font-family: ${fontFamily}`);
        }
      }
    }
  });

  test('Typography: Icons use Material Symbols font', async ({ page }) => {
    await page.goto('/src/pages/teacher-dashboard.html');
    await page.waitForLoadState('networkidle');
    
    const iconSelectors = [
      '.material-symbols-outlined',
      '.material-icons',
      '[data-icon]'
    ];
    
    for (const selector of iconSelectors) {
      const elements = await page.$$(selector);
      
      for (const element of elements) {
        const fontFamily = await element.evaluate(el => 
          window.getComputedStyle(el).fontFamily
        );
        
        if (fontFamily) {
          expect(fontFamily).toMatch(/Material.*Symbols/);
          console.log(`Icon ${selector} font-family: ${fontFamily}`);
        }
      }
    }
  });

  test('Typography: Font loading performance and fallbacks', async ({ page }) => {
    // Test with network throttling to ensure fallbacks work
    await page.route('**/*.woff*', route => {
      setTimeout(() => route.continue(), 1000); // Delay font loading
    });
    
    await page.goto('/src/pages/index.html');
    
    // Check that fallback fonts are reasonable
    const bodyFontFamily = await getFontFamily(page, 'body');
    console.log(`Body font-family with delayed loading: ${bodyFontFamily}`);
    
    // Should contain either Quicksand or system fallbacks
    expect(bodyFontFamily).toMatch(/Quicksand|system-ui|sans-serif/);
  });

  test('Typography: CSS custom properties are defined and used', async ({ page }) => {
    await page.goto('/src/pages/index.html');
    await page.waitForLoadState('networkidle');
    
    const customProperties = await page.evaluate(() => {
      const root = document.documentElement;
      const computedStyle = window.getComputedStyle(root);
      
      return {
        headers: computedStyle.getPropertyValue('--font-family-headers').trim(),
        body: computedStyle.getPropertyValue('--font-family-body').trim(),
        buttons: computedStyle.getPropertyValue('--font-family-buttons').trim(),
        inputs: computedStyle.getPropertyValue('--font-family-inputs').trim()
      };
    });
    
    console.log('CSS Custom Properties:', customProperties);
    
    expect(customProperties.headers).toContain('Poppins');
    expect(customProperties.body).toContain('Quicksand');
    expect(customProperties.buttons).toContain('Quicksand');
    expect(customProperties.inputs).toContain('Quicksand');
  });
});