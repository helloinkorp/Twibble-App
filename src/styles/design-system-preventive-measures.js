/**
 * Design System Preventive Measures
 * Architectural safeguards to prevent common styling mistakes
 * 
 * This module implements proactive prevention rather than reactive detection.
 * It intercepts common DOM manipulation patterns and enforces design system compliance.
 */

class DesignSystemPreventiveMeasures {
  constructor() {
    this.enabled = false;
    this.violations = [];
    this.originalMethods = {};
    this.preventionRules = {
      // Forbidden class patterns (non-design-system utilities)
      forbiddenClasses: [
        /\bflex\b(?!\s|$)/,
        /\bgrid\b(?!\s|$)/,
        /\bp-\d+\b/,
        /\bm[txblr]?-\d+\b/,
        /\bbg-\w+\b/,
        /\btext-\w+\b(?!-secondary|$|ds-)/,
        /\bw-\d+\b/,
        /\bh-\d+\b/,
        /\bitems-\w+\b/,
        /\bjustify-\w+\b/,
        /\bgap-\d+\b/
      ],
      
      // Forbidden inline style patterns
      forbiddenStyles: [
        {
          pattern: /font-family\s*:\s*(?!var\(--font-family)[^;]+/i,
          replacement: 'var(--font-family-body)',
          message: 'Use design system font tokens'
        },
        {
          pattern: /#[0-9A-Fa-f]{3,6}/g,
          replacement: 'var(--color-token)',
          message: 'Use design system color tokens'
        },
        {
          pattern: /\d+px/g,
          replacement: 'var(--space-token)',
          message: 'Use design system spacing tokens'
        }
      ],
      
      // Required attributes for components
      requiredAttributes: {
        'button': ['aria-label', 'type'],
        'input': ['aria-label', 'type'],
        'img': ['alt'],
        'a': ['href']
      }
    };
  }
  
  /**
   * Enable preventive measures
   * This intercepts DOM manipulation methods to enforce design system compliance
   */
  enable() {
    if (this.enabled) return;
    
    this.enabled = true;
    console.log('🛡️ Design System Preventive Measures Enabled');
    
    // Intercept className assignments
    this.interceptClassNameAssignments();
    
    // Intercept style assignments
    this.interceptStyleAssignments();
    
    // Intercept DOM creation methods
    this.interceptDOMCreation();
    
    // Intercept innerHTML assignments
    this.interceptInnerHTML();
    
    // Monitor createElement calls
    this.interceptCreateElement();
  }
  
  /**
   * Disable preventive measures
   */
  disable() {
    if (!this.enabled) return;
    
    this.enabled = false;
    
    // Restore original methods
    Object.keys(this.originalMethods).forEach(key => {
      const [obj, method] = key.split('.');
      if (obj === 'document' && document[method]) {
        document[method] = this.originalMethods[key];
      } else if (obj === 'Element.prototype' && Element.prototype[method]) {
        Element.prototype[method] = this.originalMethods[key];
      }
    });
    
    console.log('🛡️ Design System Preventive Measures Disabled');
  }
  
  /**
   * Intercept className assignments to prevent non-design-system classes
   */
  interceptClassNameAssignments() {
    const self = this;
    
    // Store original property descriptor
    const originalDescriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'className');
    
    Object.defineProperty(Element.prototype, 'className', {
      get: originalDescriptor.get,
      set: function(value) {
        const cleanedValue = self.enforceDesignSystemClasses(value, this);
        return originalDescriptor.set.call(this, cleanedValue);
      },
      configurable: true
    });
  }
  
  /**
   * Intercept style assignments to prevent hardcoded values
   */
  interceptStyleAssignments() {
    const self = this;
    
    // Intercept cssText assignments
    const originalCssTextDescriptor = Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype, 'cssText');
    
    Object.defineProperty(CSSStyleDeclaration.prototype, 'cssText', {
      get: originalCssTextDescriptor.get,
      set: function(value) {
        const cleanedValue = self.enforceDesignSystemStyles(value);
        return originalCssTextDescriptor.set.call(this, cleanedValue);
      },
      configurable: true
    });
    
    // Intercept individual style property assignments
    const styleProperties = [
      'fontFamily', 'fontSize', 'color', 'backgroundColor', 
      'margin', 'padding', 'width', 'height'
    ];
    
    styleProperties.forEach(prop => {
      const camelCase = prop;
      const kebabCase = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
      
      const originalDescriptor = Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype, camelCase);
      
      if (originalDescriptor && originalDescriptor.set) {
        Object.defineProperty(CSSStyleDeclaration.prototype, camelCase, {
          get: originalDescriptor.get,
          set: function(value) {
            const cleanedValue = self.enforceStyleProperty(camelCase, value);
            return originalDescriptor.set.call(this, cleanedValue);
          },
          configurable: true
        });
      }
    });
  }
  
  /**
   * Intercept DOM creation methods
   */
  interceptDOMCreation() {
    const self = this;
    
    // Store and wrap createElement
    this.originalMethods['document.createElement'] = document.createElement;
    document.createElement = function(tagName, options) {
      const element = self.originalMethods['document.createElement'].call(this, tagName, options);
      self.enforceElementCompliance(element, tagName);
      return element;
    };
  }
  
  /**
   * Intercept innerHTML assignments
   */
  interceptInnerHTML() {
    const self = this;
    
    const originalDescriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
    
    Object.defineProperty(Element.prototype, 'innerHTML', {
      get: originalDescriptor.get,
      set: function(value) {
        const cleanedValue = self.enforceHTMLCompliance(value);
        const result = originalDescriptor.set.call(this, cleanedValue);
        
        // Validate children after innerHTML is set
        setTimeout(() => {
          self.validateChildElements(this);
        }, 0);
        
        return result;
      },
      configurable: true
    });
  }
  
  /**
   * Intercept createElement calls
   */
  interceptCreateElement() {
    const self = this;
    
    // Override createElement to add automatic compliance
    this.originalMethods['document.createElement'] = document.createElement;
    document.createElement = function(tagName, options) {
      const element = self.originalMethods['document.createElement'].call(this, tagName, options);
      
      // Apply default design system compliance
      self.applyDefaultCompliance(element, tagName);
      
      return element;
    };
  }
  
  /**
   * Enforce design system classes
   * @param {string} classNameValue 
   * @param {HTMLElement} element 
   * @returns {string} Cleaned class name
   */
  enforceDesignSystemClasses(classNameValue, element) {
    if (!classNameValue || typeof classNameValue !== 'string') return classNameValue;
    
    const classes = classNameValue.split(' ').filter(cls => cls.trim());
    const cleanedClasses = [];
    const warnings = [];
    
    classes.forEach(className => {
      let isViolation = false;
      let suggestedFix = null;
      
      // Check against forbidden patterns
      this.preventionRules.forbiddenClasses.forEach(pattern => {
        if (pattern.test(className)) {
          isViolation = true;
          suggestedFix = this.getDesignSystemAlternative(className);
        }
      });
      
      if (isViolation) {
        warnings.push({
          type: 'non-design-system-class',
          violation: className,
          fix: suggestedFix,
          element: element
        });
        
        // Replace with design system alternative
        if (suggestedFix) {
          cleanedClasses.push(suggestedFix);
        }
      } else {
        cleanedClasses.push(className);
      }
    });
    
    // Log warnings in development
    if (warnings.length > 0) {
      console.warn('🛡️ Design System Prevention:', warnings);
      this.violations.push(...warnings);
    }
    
    return cleanedClasses.join(' ');
  }
  
  /**
   * Enforce design system styles
   * @param {string} cssText 
   * @returns {string} Cleaned CSS text
   */
  enforceDesignSystemStyles(cssText) {
    if (!cssText) return cssText;
    
    let cleanedCSS = cssText;
    const warnings = [];
    
    this.preventionRules.forbiddenStyles.forEach(rule => {
      if (rule.pattern.test(cleanedCSS)) {
        warnings.push({
          type: 'forbidden-inline-style',
          violation: cssText.match(rule.pattern),
          message: rule.message
        });
        
        // Replace with design system token (placeholder)
        cleanedCSS = cleanedCSS.replace(rule.pattern, '/* USE DESIGN SYSTEM TOKEN */');
      }
    });
    
    if (warnings.length > 0) {
      console.warn('🛡️ Style Prevention:', warnings);
      this.violations.push(...warnings);
    }
    
    return cleanedCSS;
  }
  
  /**
   * Enforce individual style property compliance
   * @param {string} property 
   * @param {string} value 
   * @returns {string} Cleaned value
   */
  enforceStyleProperty(property, value) {
    if (!value) return value;
    
    const cleanedValue = this.getDesignSystemStyleValue(property, value);
    
    if (cleanedValue !== value) {
      console.warn(`🛡️ Style Property Prevention: ${property}: ${value} → ${cleanedValue}`);
      this.violations.push({
        type: 'style-property-violation',
        property,
        violation: value,
        fix: cleanedValue
      });
    }
    
    return cleanedValue;
  }
  
  /**
   * Get design system alternative for a class name
   * @param {string} className 
   * @returns {string} Design system alternative
   */
  getDesignSystemAlternative(className) {
    const alternatives = {
      'flex': 'ds-flex',
      'flex-col': 'ds-flex-col',
      'items-center': 'ds-items-center',
      'justify-between': 'ds-justify-between',
      'gap-1': 'ds-gap-1',
      'gap-2': 'ds-gap-2',
      'gap-3': 'ds-gap-3',
      'gap-4': 'ds-gap-4',
      'gap-5': 'ds-gap-5',
      'gap-6': 'ds-gap-6',
      'mb-1': 'ds-mb-1',
      'mb-2': 'ds-mb-2',
      'mb-3': 'ds-mb-3',
      'mb-4': 'ds-mb-4',
      'mb-5': 'ds-mb-5',
      'mb-6': 'ds-mb-6',
      'p-1': 'ds-p-1',
      'p-2': 'ds-p-2',
      'p-3': 'ds-p-3',
      'p-4': 'ds-p-4',
      'p-6': 'ds-p-6',
      'p-8': 'ds-p-8',
      'text-center': 'ds-text-center',
      'text-secondary': 'ds-text-secondary',
      'w-full': 'ds-w-full',
      'container': 'ds-container'
    };
    
    return alternatives[className] || className;
  }
  
  /**
   * Get design system style value
   * @param {string} property 
   * @param {string} value 
   * @returns {string} Design system compliant value
   */
  getDesignSystemStyleValue(property, value) {
    // Font family enforcement
    if (property === 'fontFamily') {
      if (!value.includes('var(--font-family')) {
        return 'var(--font-family-body)';
      }
    }
    
    // Color enforcement
    if (property === 'color' || property === 'backgroundColor') {
      if (/#[0-9A-Fa-f]{3,6}/.test(value)) {
        const colorMap = {
          '#D97706': 'var(--color-primary)',
          '#B45309': 'var(--color-primary-hover)',
          '#000000': 'var(--color-black)',
          '#FFFFFF': 'var(--color-white)'
        };
        return colorMap[value] || 'var(--color-primary)';
      }
    }
    
    // Spacing enforcement
    if (['margin', 'padding', 'gap', 'width', 'height'].includes(property)) {
      if (/^\d+px$/.test(value)) {
        const px = parseInt(value);
        const spacingMap = {
          '4': 'var(--space-1)',
          '8': 'var(--space-2)',
          '12': 'var(--space-3)',
          '16': 'var(--space-4)',
          '20': 'var(--space-5)',
          '24': 'var(--space-6)',
          '32': 'var(--space-8)',
          '40': 'var(--space-10)',
          '48': 'var(--space-12)'
        };
        return spacingMap[px.toString()] || value;
      }
    }
    
    // Font size enforcement
    if (property === 'fontSize') {
      if (/^\d+px$/.test(value)) {
        const px = parseInt(value);
        const fontSizeMap = {
          '12': 'var(--font-size-xs)',
          '14': 'var(--font-size-sm)',
          '13': 'var(--font-size-base)',
          '18': 'var(--font-size-lg)',
          '20': 'var(--font-size-xl)',
          '24': 'var(--font-size-2xl)'
        };
        return fontSizeMap[px.toString()] || value;
      }
    }
    
    return value;
  }
  
  /**
   * Enforce element compliance on creation
   * @param {HTMLElement} element 
   * @param {string} tagName 
   */
  enforceElementCompliance(element, tagName) {
    // Apply typography enforcement
    this.applyTypographyCompliance(element, tagName);
    
    // Apply accessibility requirements
    this.applyAccessibilityCompliance(element, tagName);
    
    // Apply responsive requirements
    this.applyResponsiveCompliance(element, tagName);
  }
  
  /**
   * Apply typography compliance
   * @param {HTMLElement} element 
   * @param {string} tagName 
   */
  applyTypographyCompliance(element, tagName) {
    const headingTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    
    if (headingTags.includes(tagName.toLowerCase())) {
      element.style.fontFamily = 'var(--font-family-headers)';
    } else if (['button'].includes(tagName.toLowerCase())) {
      element.style.fontFamily = 'var(--font-family-buttons)';
    } else if (['input', 'textarea', 'select'].includes(tagName.toLowerCase())) {
      element.style.fontFamily = 'var(--font-family-inputs)';
    } else {
      element.style.fontFamily = 'var(--font-family-body)';
    }
  }
  
  /**
   * Apply accessibility compliance
   * @param {HTMLElement} element 
   * @param {string} tagName 
   */
  applyAccessibilityCompliance(element, tagName) {
    const interactiveElements = ['button', 'a', 'input', 'textarea', 'select'];
    
    if (interactiveElements.includes(tagName.toLowerCase())) {
      // Ensure minimum touch target size
      element.style.minHeight = '44px';
      element.style.minWidth = '44px';
      
      // Add focus styles
      element.addEventListener('focus', () => {
        element.style.outline = '2px solid var(--color-primary)';
        element.style.outlineOffset = '2px';
      });
    }
    
    // Add required attributes
    const requiredAttrs = this.preventionRules.requiredAttributes[tagName.toLowerCase()];
    if (requiredAttrs) {
      requiredAttrs.forEach(attr => {
        if (!element.hasAttribute(attr)) {
          console.warn(`🛡️ Missing required attribute: ${attr} for ${tagName}`);
        }
      });
    }
  }
  
  /**
   * Apply responsive compliance
   * @param {HTMLElement} element 
   * @param {string} tagName 
   */
  applyResponsiveCompliance(element, tagName) {
    // Ensure elements work well on mobile
    if (['img'].includes(tagName.toLowerCase())) {
      element.style.maxWidth = '100%';
      element.style.height = 'auto';
    }
  }
  
  /**
   * Apply default compliance to newly created elements
   * @param {HTMLElement} element 
   * @param {string} tagName 
   */
  applyDefaultCompliance(element, tagName) {
    // Ensure all elements inherit proper fonts
    if (!['script', 'style', 'meta', 'link'].includes(tagName.toLowerCase())) {
      element.style.fontFamily = 'inherit';
    }
  }
  
  /**
   * Enforce HTML compliance
   * @param {string} html 
   * @returns {string} Cleaned HTML
   */
  enforceHTMLCompliance(html) {
    if (!html) return html;
    
    // Simple pattern replacement for common violations
    let cleanedHTML = html;
    
    // Replace common non-design-system classes
    const classReplacements = {
      'class="flex': 'class="ds-flex',
      'class="grid': 'class="ds-grid',
      'class="p-4': 'class="ds-p-4',
      'class="mb-4': 'class="ds-mb-4',
      'class="gap-4': 'class="ds-gap-4',
      'class="text-center': 'class="ds-text-center'
    };
    
    Object.entries(classReplacements).forEach(([old, replacement]) => {
      cleanedHTML = cleanedHTML.replace(new RegExp(old, 'g'), replacement);
    });
    
    return cleanedHTML;
  }
  
  /**
   * Validate child elements after DOM manipulation
   * @param {HTMLElement} parent 
   */
  validateChildElements(parent) {
    const children = parent.querySelectorAll('*');
    children.forEach(child => {
      this.enforceElementCompliance(child, child.tagName);
    });
  }
  
  /**
   * Get violation report
   * @returns {Object} Violation report
   */
  getViolationReport() {
    return {
      timestamp: new Date().toISOString(),
      enabled: this.enabled,
      totalViolations: this.violations.length,
      violationsByType: this.violations.reduce((acc, v) => {
        acc[v.type] = (acc[v.type] || 0) + 1;
        return acc;
      }, {}),
      violations: this.violations
    };
  }
  
  /**
   * Clear violation history
   */
  clearViolations() {
    this.violations = [];
  }
  
  /**
   * Log prevention report
   */
  logReport() {
    const report = this.getViolationReport();
    console.group('🛡️ Design System Prevention Report');
    console.log(`Status: ${report.enabled ? 'ENABLED' : 'DISABLED'}`);
    console.log(`Violations Prevented: ${report.totalViolations}`);
    if (report.totalViolations > 0) {
      console.log('Violations by Type:', report.violationsByType);
    }
    console.groupEnd();
  }
}

// Create global instance
const DesignSystemPreventiveMeasures = new DesignSystemPreventiveMeasures();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DesignSystemPreventiveMeasures;
}

// Global namespace for browser usage
if (typeof window !== 'undefined') {
  window.DesignSystemPreventiveMeasures = DesignSystemPreventiveMeasures;
  
  // Add developer console commands
  window.dsPrevent = () => DesignSystemPreventiveMeasures.enable();
  window.dsPreventOff = () => DesignSystemPreventiveMeasures.disable();
  window.dsPreventReport = () => DesignSystemPreventiveMeasures.logReport();
  
  console.log('🛡️ Design System Preventive Measures loaded');
  console.log('Commands: dsPrevent(), dsPreventOff(), dsPreventReport()');
}