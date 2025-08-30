/**
 * Design System Validation Utilities
 * Architectural enforcement tools to prevent typography and styling violations
 * 
 * Usage:
 * - DesignSystemValidator.validatePage() - Check entire page for violations
 * - DesignSystemValidator.validateElement(element) - Check specific element
 * - DesignSystemValidator.enableDevMode() - Enable real-time violation detection
 * - DesignSystemValidator.generateReport() - Get compliance report
 */

class DesignSystemValidator {
  constructor() {
    this.violations = [];
    this.devModeEnabled = false;
    this.observer = null;
    
    // Patterns for detecting violations
    this.violationPatterns = {
      // Non-design-system utility classes
      tailwindUtilities: /\b(flex|grid|p-\d|m[txblr]?-\d|bg-|text-|w-\d|h-\d|items-|justify-|gap-\d)\b/g,
      
      // Hardcoded color values
      hardcodedColors: /#[0-9A-Fa-f]{3,6}|rgb\(|rgba\(|hsl\(|hsla\(/g,
      
      // Hardcoded spacing values
      hardcodedSpacing: /\b\d+px\b/g,
      
      // Non-design-system font families
      nonDSFonts: /font-family\s*:\s*(?!var\(--font-family)[^;]+/g,
      
      // Inline styles that should use tokens
      inlineStyles: /style\s*=\s*["'][^"']*(?:color|background|font-family|font-size|margin|padding)[^"']*["']/g
    };
    
    // Allowed design system classes
    this.allowedClasses = new Set([
      // Base components
      'btn', 'btn-primary', 'btn-secondary', 'btn-tertiary', 'btn-destructive',
      'card', 'card-soft', 'card-hover',
      'form-group', 'input-error', 'input-success', 'input-warning',
      'alert', 'alert-success', 'alert-warning', 'alert-error', 'alert-info',
      'icon', 'icon-small', 'icon-large', 'icon-muted', 'icon-dark',
      
      // Design system utilities (ds-* prefix)
      'ds-flex', 'ds-flex-col', 'ds-flex-wrap',
      'ds-items-center', 'ds-items-start', 'ds-items-end',
      'ds-justify-center', 'ds-justify-between', 'ds-justify-end',
      'ds-gap-1', 'ds-gap-2', 'ds-gap-3', 'ds-gap-4', 'ds-gap-5', 'ds-gap-6',
      'ds-m-0', 'ds-m-1', 'ds-m-2', 'ds-m-3', 'ds-m-4', 'ds-m-5', 'ds-m-6',
      'ds-mb-0', 'ds-mb-1', 'ds-mb-2', 'ds-mb-3', 'ds-mb-4', 'ds-mb-5', 'ds-mb-6', 'ds-mb-8',
      'ds-mt-0', 'ds-mt-1', 'ds-mt-2', 'ds-mt-3', 'ds-mt-4', 'ds-mt-5', 'ds-mt-6',
      'ds-p-1', 'ds-p-2', 'ds-p-3', 'ds-p-4', 'ds-p-5', 'ds-p-6', 'ds-p-8',
      'ds-text-center', 'ds-text-left', 'ds-text-right',
      'ds-text-secondary', 'ds-text-muted', 'ds-text-small', 'ds-text-large',
      'ds-container', 'ds-w-full', 'ds-h-full', 'ds-block', 'ds-inline-block', 'ds-hidden',
      
      // Legacy allowed classes (being migrated)
      'container', 'text-secondary', 'text-muted', 'text-small', 'text-large',
      'flex', 'flex-col', 'flex-wrap', 'items-center', 'items-start', 'items-end',
      'justify-center', 'justify-between', 'justify-end',
      'gap-1', 'gap-2', 'gap-3', 'gap-4', 'gap-5', 'gap-6',
      'mb-0', 'mb-1', 'mb-2', 'mb-3', 'mb-4', 'mb-5', 'mb-6', 'mb-8',
      'mt-0', 'mt-1', 'mt-2', 'mt-3', 'mt-4', 'mt-5', 'mt-6',
      'p-1', 'p-2', 'p-3', 'p-4', 'p-5', 'p-6', 'p-8',
      'w-full', 'h-full', 'block', 'inline-block', 'hidden'
    ]);
  }
  
  /**
   * Validate entire page for design system violations
   * @returns {Object} Validation results with violations and compliance score
   */
  validatePage() {
    this.violations = [];
    const allElements = document.querySelectorAll('*');
    
    allElements.forEach(element => {
      this.validateElement(element, false);
    });
    
    return this.generateReport();
  }
  
  /**
   * Validate a specific element for design system violations
   * @param {HTMLElement} element - Element to validate
   * @param {boolean} returnViolations - Whether to return violations array
   * @returns {Array|null} Array of violations or null
   */
  validateElement(element, returnViolations = true) {
    const elementViolations = [];
    
    // Check class names for non-design-system utilities
    if (element.className && typeof element.className === 'string') {
      const classes = element.className.split(' ').filter(cls => cls.trim());
      
      classes.forEach(className => {
        // Skip component-specific or framework classes that are acceptable
        if (this.isComponentSpecificClass(className)) {
          return;
        }
        
        // Check for Tailwind-like utilities not in allowed list
        if (this.violationPatterns.tailwindUtilities.test(className) && !this.allowedClasses.has(className)) {
          elementViolations.push({
            type: 'non-design-system-class',
            element: element,
            violation: className,
            message: `Non-design-system utility class "${className}" detected. Use "ds-${className}" or equivalent design system class.`,
            severity: 'high',
            fix: this.suggestClassFix(className)
          });
        }
      });
    }
    
    // Check inline styles
    if (element.getAttribute('style')) {
      const inlineStyle = element.getAttribute('style');
      
      // Check for hardcoded colors
      if (this.violationPatterns.hardcodedColors.test(inlineStyle)) {
        elementViolations.push({
          type: 'hardcoded-color',
          element: element,
          violation: inlineStyle,
          message: 'Hardcoded color values detected. Use CSS custom properties like var(--color-primary).',
          severity: 'high',
          fix: 'Replace with design system color tokens'
        });
      }
      
      // Check for hardcoded spacing
      if (this.violationPatterns.hardcodedSpacing.test(inlineStyle)) {
        elementViolations.push({
          type: 'hardcoded-spacing',
          element: element,
          violation: inlineStyle,
          message: 'Hardcoded spacing values (px) detected. Use CSS custom properties like var(--space-4).',
          severity: 'medium',
          fix: 'Replace with design system spacing tokens'
        });
      }
      
      // Check for non-design-system fonts
      if (this.violationPatterns.nonDSFonts.test(inlineStyle)) {
        elementViolations.push({
          type: 'non-design-system-font',
          element: element,
          violation: inlineStyle,
          message: 'Non-design-system font detected. Use var(--font-family-body) or var(--font-family-headers).',
          severity: 'high',
          fix: 'Replace with design system font tokens'
        });
      }
    }
    
    // Check computed styles for font family violations
    if (typeof window !== 'undefined' && window.getComputedStyle) {
      const computedStyle = window.getComputedStyle(element);
      const fontFamily = computedStyle.fontFamily;
      
      if (fontFamily && !this.isDesignSystemFont(fontFamily)) {
        elementViolations.push({
          type: 'computed-font-violation',
          element: element,
          violation: fontFamily,
          message: `Element using non-design-system font: "${fontFamily}". Should use Quicksand or Poppins.`,
          severity: 'high',
          fix: 'Apply design system font classes or CSS custom properties'
        });
      }
    }
    
    // Add to global violations list
    this.violations.push(...elementViolations);
    
    return returnViolations ? elementViolations : null;
  }
  
  /**
   * Check if a class name is component-specific and should be ignored
   * @param {string} className 
   * @returns {boolean}
   */
  isComponentSpecificClass(className) {
    const componentPrefixes = [
      'material-symbols', 'icon', 'btn-', 'card-', 'form-', 'input-', 'alert-',
      'avatar-', 'modal-', 'dropdown-', 'nav-', 'header-', 'footer-',
      'sr-only', 'skip-link', 'focus-visible'
    ];
    
    return componentPrefixes.some(prefix => className.startsWith(prefix)) ||
           className.includes('test') || // Allow test classes
           className.includes('js-') ||  // Allow JS hooks
           className.includes('no-') ||  // Allow negation classes
           /^[a-z]+-[a-z]+/.test(className); // Allow kebab-case component names
  }
  
  /**
   * Check if font family is design system compliant
   * @param {string} fontFamily 
   * @returns {boolean}
   */
  isDesignSystemFont(fontFamily) {
    const dsFont = fontFamily.toLowerCase();
    return dsFont.includes('quicksand') || 
           dsFont.includes('poppins') || 
           dsFont.includes('material symbols') ||
           dsFont.includes('system-ui') ||
           dsFont.includes('sans-serif');
  }
  
  /**
   * Suggest design system alternative for a class
   * @param {string} className 
   * @returns {string}
   */
  suggestClassFix(className) {
    const fixes = {
      'flex': 'ds-flex',
      'flex-col': 'ds-flex-col',
      'items-center': 'ds-items-center',
      'justify-between': 'ds-justify-between',
      'gap-4': 'ds-gap-4',
      'mb-4': 'ds-mb-4',
      'p-4': 'ds-p-4',
      'text-center': 'ds-text-center',
      'w-full': 'ds-w-full',
      'container': 'ds-container'
    };
    
    return fixes[className] || `Use design system equivalent for "${className}"`;
  }
  
  /**
   * Enable development mode with real-time violation detection
   */
  enableDevMode() {
    if (this.devModeEnabled) return;
    
    this.devModeEnabled = true;
    
    // Add violation detection stylesheet
    this.injectDevModeStyles();
    
    // Set up mutation observer for dynamic content
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.validateElement(node, false);
              this.highlightElementViolations(node);
            }
          });
        }
        
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          this.validateElement(mutation.target, false);
          this.highlightElementViolations(mutation.target);
        }
      });
    });
    
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });
    
    console.log('🔍 Design System Dev Mode Enabled - Violations will be highlighted in red');
  }
  
  /**
   * Disable development mode
   */
  disableDevMode() {
    this.devModeEnabled = false;
    
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    
    // Remove dev mode styles
    const devStyles = document.getElementById('ds-dev-mode-styles');
    if (devStyles) {
      devStyles.remove();
    }
    
    // Remove violation highlights
    document.querySelectorAll('.ds-violation-highlight').forEach(el => {
      el.classList.remove('ds-violation-highlight');
    });
    
    console.log('🔍 Design System Dev Mode Disabled');
  }
  
  /**
   * Inject development mode CSS for violation highlighting
   */
  injectDevModeStyles() {
    if (document.getElementById('ds-dev-mode-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'ds-dev-mode-styles';
    style.textContent = `
      /* Design System Violation Detection Styles */
      [class*="flex"]:not([class*="ds-flex"]):not(.flex):not(.btn):not(.card),
      [class*="grid"]:not([class*="ds-grid"]):not(.grid),
      [class*="p-"]:not([class*="ds-p"]):not(.card):not(.btn):not(.form-group),
      [class*="m-"]:not([class*="ds-m"]):not(.card):not(.btn):not(.form-group),
      [class*="bg-"]:not(.btn):not(.card):not(.alert),
      [class*="text-"]:not([class*="ds-text"]):not(.text-secondary):not(.text-muted):not(.text-small):not(.text-large),
      [class*="w-"]:not([class*="ds-w"]):not(.w-full):not(.w-auto),
      [class*="h-"]:not([class*="ds-h"]):not(.btn):not(.form-group),
      [class*="items-"]:not([class*="ds-items"]):not(.items-center):not(.items-start):not(.items-end),
      [class*="justify-"]:not([class*="ds-justify"]):not(.justify-center):not(.justify-between):not(.justify-end),
      [class*="gap-"]:not([class*="ds-gap"]):not(.gap-1):not(.gap-2):not(.gap-3):not(.gap-4):not(.gap-5):not(.gap-6) {
        border: 2px solid #FF0000 !important;
        background-color: rgba(255, 0, 0, 0.1) !important;
        position: relative !important;
      }
      
      [class*="flex"]:not([class*="ds-flex"]):not(.flex):not(.btn):not(.card)::before,
      [class*="grid"]:not([class*="ds-grid"]):not(.grid)::before,
      [class*="p-"]:not([class*="ds-p"]):not(.card):not(.btn):not(.form-group)::before,
      [class*="m-"]:not([class*="ds-m"]):not(.card):not(.btn):not(.form-group)::before,
      [class*="bg-"]:not(.btn):not(.card):not(.alert)::before,
      [class*="text-"]:not([class*="ds-text"]):not(.text-secondary):not(.text-muted):not(.text-small):not(.text-large)::before,
      [class*="w-"]:not([class*="ds-w"]):not(.w-full):not(.w-auto)::before,
      [class*="h-"]:not([class*="ds-h"]):not(.btn):not(.form-group)::before,
      [class*="items-"]:not([class*="ds-items"]):not(.items-center):not(.items-start):not(.items-end)::before,
      [class*="justify-"]:not([class*="ds-justify"]):not(.justify-center):not(.justify-between):not(.justify-end)::before,
      [class*="gap-"]:not([class*="ds-gap"]):not(.gap-1):not(.gap-2):not(.gap-3):not(.gap-4):not(.gap-5):not(.gap-6)::before {
        content: "⚠️ NON-DS CLASS";
        position: absolute;
        top: -18px;
        left: 0;
        background: #FF0000;
        color: white;
        padding: 1px 4px;
        font-size: 9px;
        font-weight: bold;
        z-index: 9999;
        white-space: nowrap;
        font-family: monospace;
      }
      
      .ds-violation-highlight {
        outline: 3px solid #FF0000 !important;
        outline-offset: 1px !important;
      }
    `;
    
    document.head.appendChild(style);
  }
  
  /**
   * Highlight specific element violations
   * @param {HTMLElement} element 
   */
  highlightElementViolations(element) {
    const violations = this.validateElement(element);
    
    if (violations.length > 0) {
      element.classList.add('ds-violation-highlight');
      
      // Add tooltip with violation details
      element.title = violations.map(v => v.message).join(' | ');
    } else {
      element.classList.remove('ds-violation-highlight');
      element.removeAttribute('title');
    }
  }
  
  /**
   * Generate comprehensive validation report
   * @returns {Object} Validation report
   */
  generateReport() {
    const totalElements = document.querySelectorAll('*').length;
    const violationCount = this.violations.length;
    const complianceScore = Math.max(0, Math.round(((totalElements - violationCount) / totalElements) * 100));
    
    const violationsByType = this.violations.reduce((acc, violation) => {
      acc[violation.type] = (acc[violation.type] || 0) + 1;
      return acc;
    }, {});
    
    const violationsBySeverity = this.violations.reduce((acc, violation) => {
      acc[violation.severity] = (acc[violation.severity] || 0) + 1;
      return acc;
    }, {});
    
    return {
      timestamp: new Date().toISOString(),
      compliance: {
        score: complianceScore,
        grade: this.getComplianceGrade(complianceScore),
        status: complianceScore >= 90 ? 'PASSING' : 'FAILING'
      },
      statistics: {
        totalElements,
        violationCount,
        violationsByType,
        violationsBySeverity
      },
      violations: this.violations,
      recommendations: this.generateRecommendations()
    };
  }
  
  /**
   * Get compliance grade based on score
   * @param {number} score 
   * @returns {string}
   */
  getComplianceGrade(score) {
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 85) return 'B+';
    if (score >= 80) return 'B';
    if (score >= 75) return 'C+';
    if (score >= 70) return 'C';
    if (score >= 65) return 'D';
    return 'F';
  }
  
  /**
   * Generate recommendations based on violations
   * @returns {Array} Array of recommendations
   */
  generateRecommendations() {
    const recommendations = [];
    
    if (this.violations.some(v => v.type === 'non-design-system-class')) {
      recommendations.push({
        priority: 'high',
        action: 'Replace non-design-system utility classes with ds-* equivalents',
        impact: 'Ensures consistent styling and prevents design system bypass'
      });
    }
    
    if (this.violations.some(v => v.type === 'hardcoded-color')) {
      recommendations.push({
        priority: 'high',
        action: 'Replace hardcoded color values with CSS custom properties',
        impact: 'Maintains consistent brand colors and enables theme switching'
      });
    }
    
    if (this.violations.some(v => v.type === 'computed-font-violation')) {
      recommendations.push({
        priority: 'high',
        action: 'Fix typography violations - ensure all text uses Quicksand or Poppins',
        impact: 'Maintains consistent typography system across the application'
      });
    }
    
    if (this.violations.some(v => v.type === 'hardcoded-spacing')) {
      recommendations.push({
        priority: 'medium',
        action: 'Replace hardcoded spacing values with design system spacing tokens',
        impact: 'Ensures consistent spacing and responsive behavior'
      });
    }
    
    return recommendations;
  }
  
  /**
   * Export violations as CSV for analysis
   * @returns {string} CSV content
   */
  exportViolationsCSV() {
    const headers = ['Type', 'Severity', 'Element', 'Violation', 'Message', 'Fix'];
    const rows = this.violations.map(v => [
      v.type,
      v.severity,
      v.element.tagName.toLowerCase() + (v.element.id ? `#${v.element.id}` : '') + (v.element.className ? `.${v.element.className.split(' ')[0]}` : ''),
      v.violation,
      v.message,
      v.fix
    ]);
    
    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  }
  
  /**
   * Log detailed validation report to console
   */
  logReport() {
    const report = this.generateReport();
    
    console.group('🔍 Design System Validation Report');
    console.log(`Compliance Score: ${report.compliance.score}% (Grade: ${report.compliance.grade})`);
    console.log(`Status: ${report.compliance.status}`);
    console.log(`Total Elements: ${report.statistics.totalElements}`);
    console.log(`Violations: ${report.statistics.violationCount}`);
    
    if (report.statistics.violationCount > 0) {
      console.group('Violations by Type:');
      Object.entries(report.statistics.violationsByType).forEach(([type, count]) => {
        console.log(`${type}: ${count}`);
      });
      console.groupEnd();
      
      console.group('Violations by Severity:');
      Object.entries(report.statistics.violationsBySeverity).forEach(([severity, count]) => {
        console.log(`${severity}: ${count}`);
      });
      console.groupEnd();
      
      console.group('Recommendations:');
      report.recommendations.forEach(rec => {
        console.log(`[${rec.priority.toUpperCase()}] ${rec.action}`);
        console.log(`  Impact: ${rec.impact}`);
      });
      console.groupEnd();
    }
    
    console.groupEnd();
    
    return report;
  }
}

// Create global instance
const DesignSystemValidator = new DesignSystemValidator();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DesignSystemValidator;
}

// Global namespace for browser usage
if (typeof window !== 'undefined') {
  window.DesignSystemValidator = DesignSystemValidator;
  
  // Add developer console commands
  window.dsValidate = () => DesignSystemValidator.logReport();
  window.dsDevMode = () => DesignSystemValidator.enableDevMode();
  window.dsDevOff = () => DesignSystemValidator.disableDevMode();
  
  console.log('🎨 Design System Validator loaded');
  console.log('Commands: dsValidate(), dsDevMode(), dsDevOff()');
}