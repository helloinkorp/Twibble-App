/**
 * Twibble Button Components
 * Implements secondary-button-first philosophy with Quicksand typography
 * All components work in complete isolation
 * Imports design-system.css for token system
 */

// Import CSS if not already loaded
if (!document.querySelector('link[href*="design-system.css"]')) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '../styles/design-system.css';
  document.head.appendChild(link);
}

/**
 * Base Button Factory - Creates button element with design system classes
 * @param {Object} config - Button configuration
 * @param {string} config.text - Button text content
 * @param {string} config.variant - Button variant (primary, secondary, tertiary, destructive)
 * @param {string} config.size - Button size (sm, lg, default)
 * @param {boolean} config.disabled - Whether button is disabled
 * @param {Function} config.onClick - Click handler function
 * @param {string} config.ariaLabel - Accessibility label
 * @returns {HTMLElement} Button element
 */
function createButton(config = {}) {
  const {
    text = 'Button',
    variant = 'secondary', // Secondary-first philosophy
    size = '',
    disabled = false,
    onClick = () => {},
    ariaLabel = text,
    type = 'button'
  } = config;

  const button = document.createElement('button');
  button.type = type;
  button.textContent = text;
  button.disabled = disabled;
  button.setAttribute('aria-label', ariaLabel);
  
  // Base button class with variant
  const sizeClass = size ? `btn-${size}` : '';
  button.className = `btn btn-${variant} ${sizeClass}`.trim();
  
  // Add click handler
  button.addEventListener('click', onClick);
  
  // Ensure WCAG compliance
  if (disabled) {
    button.setAttribute('aria-disabled', 'true');
  }
  
  return button;
}

/**
 * CTA Button (Primary) - Filled orange, use sparingly
 * @param {Object} config - Button configuration
 * @returns {HTMLElement} Primary CTA button
 */
function createCtaButton(config = {}) {
  return createButton({
    variant: 'primary',
    ...config
  });
}

/**
 * Secondary Button (Default) - Black border, becomes default choice
 * @param {Object} config - Button configuration  
 * @returns {HTMLElement} Secondary button
 */
function createSecondaryButton(config = {}) {
  return createButton({
    variant: 'secondary',
    ...config
  });
}

/**
 * Tertiary Button - Text only, minimal emphasis
 * @param {Object} config - Button configuration
 * @returns {HTMLElement} Tertiary button
 */
function createTertiaryButton(config = {}) {
  return createButton({
    variant: 'tertiary',
    ...config
  });
}

/**
 * Destructive Button - Red border/text for dangerous actions
 * @param {Object} config - Button configuration
 * @returns {HTMLElement} Destructive button
 */
function createDestructiveButton(config = {}) {
  return createButton({
    variant: 'destructive',
    ...config
  });
}

/**
 * Button Group - Creates a group of related buttons
 * @param {Array} buttons - Array of button configurations
 * @param {string} alignment - Group alignment (left, center, right)
 * @returns {HTMLElement} Button group container
 */
function createButtonGroup(buttons = [], alignment = 'left') {
  const group = document.createElement('div');
  group.className = `flex gap-3 items-center`;
  
  if (alignment === 'center') {
    group.classList.add('justify-center');
  } else if (alignment === 'right') {
    group.classList.add('justify-end');
  }
  
  buttons.forEach(buttonConfig => {
    const button = createButton(buttonConfig);
    group.appendChild(button);
  });
  
  return group;
}

/**
 * Loading Button - Shows loading state
 * @param {Object} config - Button configuration
 * @returns {HTMLElement} Button with loading capability
 */
function createLoadingButton(config = {}) {
  const button = createButton(config);
  
  const setLoading = (isLoading) => {
    if (isLoading) {
      button.classList.add('btn-loading');
      button.disabled = true;
      button.setAttribute('aria-busy', 'true');
    } else {
      button.classList.remove('btn-loading');
      button.disabled = config.disabled || false;
      button.setAttribute('aria-busy', 'false');
    }
  };
  
  // Expose loading control
  button.setLoading = setLoading;
  
  return button;
}

/**
 * Form Submit Button - Handles form submissions with validation
 * @param {Object} config - Button configuration
 * @param {HTMLFormElement} config.form - Form element to submit
 * @returns {HTMLElement} Form submit button
 */
function createSubmitButton(config = {}) {
  const { form, ...buttonConfig } = config;
  
  const button = createLoadingButton({
    type: 'submit',
    variant: 'primary', // Submit buttons typically primary
    ...buttonConfig,
    onClick: (e) => {
      if (form && !form.checkValidity()) {
        e.preventDefault();
        form.reportValidity();
        return;
      }
      if (buttonConfig.onClick) {
        buttonConfig.onClick(e);
      }
    }
  });
  
  return button;
}

/**
 * Render buttons to container for testing/showcase
 * @param {HTMLElement} container - Container element
 */
function renderButtonShowcase(container) {
  container.innerHTML = '';
  
  const showcase = document.createElement('div');
  showcase.className = 'container p-8';
  
  // Buttons section
  const section = document.createElement('section');
  section.innerHTML = '<h2>Button Components</h2><p class="text-secondary mb-6">Secondary-first philosophy with Quicksand typography</p>';
  
  // Button variants
  const variants = document.createElement('div');
  variants.className = 'mb-8';
  variants.innerHTML = '<h3 class="mb-4">Button Variants</h3>';
  
  const buttonGroup = document.createElement('div');
  buttonGroup.className = 'flex flex-wrap gap-4 mb-6';
  
  // Create each variant
  const buttons = [
    createCtaButton({ text: 'Get Started', ariaLabel: 'Get Started - Primary Action' }),
    createSecondaryButton({ text: 'Learn More', ariaLabel: 'Learn More - Secondary Action' }),
    createTertiaryButton({ text: 'Cancel', ariaLabel: 'Cancel Action' }),
    createDestructiveButton({ text: 'Delete', ariaLabel: 'Delete - Destructive Action' })
  ];
  
  buttons.forEach(button => buttonGroup.appendChild(button));
  variants.appendChild(buttonGroup);
  
  // Button sizes
  const sizes = document.createElement('div');
  sizes.className = 'mb-8';
  sizes.innerHTML = '<h3 class="mb-4">Button Sizes</h3>';
  
  const sizeGroup = document.createElement('div');
  sizeGroup.className = 'flex flex-wrap gap-4 items-center mb-6';
  
  const sizeButtons = [
    createSecondaryButton({ text: 'Small', size: 'sm' }),
    createSecondaryButton({ text: 'Default' }),
    createSecondaryButton({ text: 'Large', size: 'lg' })
  ];
  
  sizeButtons.forEach(button => sizeGroup.appendChild(button));
  sizes.appendChild(sizeGroup);
  
  // Button states
  const states = document.createElement('div');
  states.innerHTML = '<h3 class="mb-4">Button States</h3>';
  
  const stateGroup = document.createElement('div');
  stateGroup.className = 'flex flex-wrap gap-4 items-center';
  
  const stateButtons = [
    createSecondaryButton({ text: 'Normal' }),
    createSecondaryButton({ text: 'Disabled', disabled: true }),
    createLoadingButton({ text: 'Loading', variant: 'primary' })
  ];
  
  // Demonstrate loading state
  setTimeout(() => {
    if (stateButtons[2].setLoading) {
      stateButtons[2].setLoading(true);
      setTimeout(() => stateButtons[2].setLoading(false), 2000);
    }
  }, 1000);
  
  stateButtons.forEach(button => stateGroup.appendChild(button));
  states.appendChild(stateGroup);
  
  section.appendChild(variants);
  section.appendChild(sizes);
  section.appendChild(states);
  showcase.appendChild(section);
  container.appendChild(showcase);
}

// ES6 exports
export {
  createButton,
  createCtaButton,
  createSecondaryButton,
  createTertiaryButton,
  createDestructiveButton,
  createButtonGroup,
  createLoadingButton,
  createSubmitButton,
  renderButtonShowcase
};

// Auto-render if script is loaded directly in HTML
if (typeof window !== 'undefined' && document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.button-showcase');
    if (container) {
      renderButtonShowcase(container);
    }
  });
}