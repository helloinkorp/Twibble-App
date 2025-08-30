/**
 * Twibble Form Components
 * Text inputs, avatar selector, number input with Quicksand typography
 * All components work in complete isolation with WCAG 2.1 AA compliance
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
 * Base Input Factory - Creates input element with design system classes
 * @param {Object} config - Input configuration
 * @param {string} config.type - Input type
 * @param {string} config.placeholder - Placeholder text
 * @param {string} config.label - Label text
 * @param {string} config.helpText - Help text
 * @param {boolean} config.required - Whether input is required
 * @param {string} config.value - Initial value
 * @param {Function} config.onChange - Change handler
 * @param {Function} config.onValidate - Validation handler
 * @param {string} config.errorMessage - Error message
 * @returns {HTMLElement} Form group element
 */
function createInput(config = {}) {
  const {
    type = 'text',
    placeholder = '',
    label = '',
    helpText = '',
    required = false,
    value = '',
    onChange = () => {},
    onValidate = null,
    errorMessage = '',
    id = `input-${Math.random().toString(36).substr(2, 9)}`,
    className = ''
  } = config;

  const formGroup = document.createElement('div');
  formGroup.className = `form-group ${className}`.trim();
  
  // Label
  if (label) {
    const labelEl = document.createElement('label');
    labelEl.setAttribute('for', id);
    labelEl.textContent = label;
    if (required) {
      const asterisk = document.createElement('span');
      asterisk.className = 'text-error';
      asterisk.textContent = ' *';
      asterisk.setAttribute('aria-label', 'required');
      labelEl.appendChild(asterisk);
    }
    formGroup.appendChild(labelEl);
  }
  
  // Input
  const input = document.createElement('input');
  input.type = type;
  input.id = id;
  input.placeholder = placeholder;
  input.value = value;
  input.required = required;
  
  // Set ARIA attributes
  if (required) {
    input.setAttribute('aria-required', 'true');
  }
  
  // Help text association
  if (helpText) {
    const helpId = `${id}-help`;
    input.setAttribute('aria-describedby', helpId);
  }
  
  // Event handlers
  input.addEventListener('input', (e) => {
    onChange(e.target.value, e);
    
    // Clear error state on input
    if (input.classList.contains('error')) {
      input.classList.remove('error');
      const existingError = formGroup.querySelector('.help-text.error');
      if (existingError) {
        existingError.remove();
      }
    }
  });
  
  input.addEventListener('blur', () => {
    if (onValidate) {
      const isValid = onValidate(input.value);
      if (!isValid && errorMessage) {
        showError(formGroup, input, errorMessage);
      }
    }
  });
  
  formGroup.appendChild(input);
  
  // Help text
  if (helpText) {
    const help = document.createElement('div');
    help.className = 'help-text';
    help.id = `${id}-help`;
    help.textContent = helpText;
    formGroup.appendChild(help);
  }
  
  // Expose input for external access
  formGroup.input = input;
  
  // Add validation method
  formGroup.validate = () => {
    if (onValidate) {
      const isValid = onValidate(input.value);
      if (!isValid && errorMessage) {
        showError(formGroup, input, errorMessage);
        return false;
      }
    }
    if (required && !input.value.trim()) {
      showError(formGroup, input, 'This field is required');
      return false;
    }
    return true;
  };
  
  // Add getValue method
  formGroup.getValue = () => input.value;
  
  // Add setValue method
  formGroup.setValue = (newValue) => {
    input.value = newValue;
    onChange(newValue, { target: input });
  };
  
  return formGroup;
}

/**
 * Show error state for input
 * @param {HTMLElement} formGroup - Form group element
 * @param {HTMLElement} input - Input element
 * @param {string} message - Error message
 */
function showError(formGroup, input, message) {
  input.classList.add('error');
  input.setAttribute('aria-invalid', 'true');
  
  // Remove existing error
  const existingError = formGroup.querySelector('.help-text.error');
  if (existingError) {
    existingError.remove();
  }
  
  // Add new error
  const error = document.createElement('div');
  error.className = 'help-text error';
  error.textContent = message;
  error.setAttribute('role', 'alert');
  formGroup.appendChild(error);
}

/**
 * Text Input with validation
 * @param {Object} config - Input configuration
 * @returns {HTMLElement} Text input form group
 */
function createTextInput(config = {}) {
  return createInput({
    type: 'text',
    ...config
  });
}

/**
 * Name Input - Specialized for onboarding
 * @param {Object} config - Input configuration
 * @returns {HTMLElement} Name input form group
 */
function createNameInput(config = {}) {
  return createInput({
    type: 'text',
    label: 'What is your name?',
    placeholder: 'Enter your name',
    required: true,
    onValidate: (value) => value.trim().length >= 2,
    errorMessage: 'Name must be at least 2 characters',
    ...config
  });
}

/**
 * Number Input with Quick Select
 * @param {Object} config - Input configuration
 * @param {number} config.min - Minimum value
 * @param {number} config.max - Maximum value
 * @param {Array} config.quickValues - Array of quick-select values
 * @returns {HTMLElement} Number input with quick select
 */
function createNumberInput(config = {}) {
  const {
    min = 1,
    max = 100,
    quickValues = [5, 10, 15, 20],
    label = 'Number',
    ...inputConfig
  } = config;

  const container = document.createElement('div');
  container.className = 'form-group';
  
  // Create base number input
  const numberInput = createInput({
    type: 'number',
    label,
    ...inputConfig,
    onValidate: (value) => {
      const num = parseInt(value);
      return !isNaN(num) && num >= min && num <= max;
    },
    errorMessage: `Please enter a number between ${min} and ${max}`
  });
  
  numberInput.input.min = min;
  numberInput.input.max = max;
  
  // Quick select buttons
  const quickSelect = document.createElement('div');
  quickSelect.className = 'flex gap-2 mt-2';
  
  const quickLabel = document.createElement('span');
  quickLabel.className = 'text-xs text-muted mr-2 self-center';
  quickLabel.textContent = 'Quick select:';
  quickSelect.appendChild(quickLabel);
  
  quickValues.forEach(value => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn-sm btn-tertiary';
    button.textContent = value.toString();
    button.addEventListener('click', () => {
      numberInput.setValue(value.toString());
    });
    quickSelect.appendChild(button);
  });
  
  container.appendChild(numberInput);
  container.appendChild(quickSelect);
  
  // Expose input methods
  container.input = numberInput.input;
  container.getValue = numberInput.getValue;
  container.setValue = numberInput.setValue;
  container.validate = numberInput.validate;
  
  return container;
}

/**
 * Avatar Selector Component
 * @param {Object} config - Avatar selector configuration
 * @param {Array} config.avatars - Array of avatar objects {src, alt}
 * @param {string} config.selectedAvatar - Initially selected avatar
 * @param {Function} config.onSelect - Selection handler
 * @param {boolean} config.allowUpload - Whether to allow custom upload
 * @returns {HTMLElement} Avatar selector component
 */
function createAvatarSelector(config = {}) {
  const {
    avatars = [],
    selectedAvatar = '',
    onSelect = () => {},
    allowUpload = true,
    label = 'Who are you?'
  } = config;

  const container = document.createElement('div');
  container.className = 'form-group';
  
  // Label
  if (label) {
    const labelEl = document.createElement('h3');
    labelEl.textContent = label;
    labelEl.className = 'text-center mb-6';
    container.appendChild(labelEl);
  }
  
  // Avatar grid
  const grid = document.createElement('div');
  grid.className = 'grid grid-cols-4 md:grid-cols-5 gap-4 mb-6';
  grid.setAttribute('role', 'radiogroup');
  grid.setAttribute('aria-label', 'Select your avatar');
  
  let selectedIndex = -1;
  
  avatars.forEach((avatar, index) => {
    const avatarOption = document.createElement('button');
    avatarOption.type = 'button';
    avatarOption.className = 'avatar-option relative p-2 border-2 border-transparent rounded-lg hover:border-gray-300 focus:border-primary focus:outline-none transition-colors';
    avatarOption.setAttribute('role', 'radio');
    avatarOption.setAttribute('aria-checked', avatar.src === selectedAvatar ? 'true' : 'false');
    avatarOption.setAttribute('aria-label', avatar.alt || `Avatar option ${index + 1}`);
    
    const img = document.createElement('img');
    img.src = avatar.src;
    img.alt = avatar.alt || `Avatar ${index + 1}`;
    img.className = 'w-16 h-16 rounded-full object-cover mx-auto';
    
    avatarOption.appendChild(img);
    
    // Selection logic
    if (avatar.src === selectedAvatar) {
      avatarOption.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
      avatarOption.setAttribute('aria-checked', 'true');
      selectedIndex = index;
    }
    
    avatarOption.addEventListener('click', () => {
      // Clear previous selection
      grid.querySelectorAll('.avatar-option').forEach(option => {
        option.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
        option.setAttribute('aria-checked', 'false');
      });
      
      // Set new selection
      avatarOption.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
      avatarOption.setAttribute('aria-checked', 'true');
      selectedIndex = index;
      
      onSelect(avatar.src, avatar);
    });
    
    // Keyboard navigation
    avatarOption.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        avatarOption.click();
      }
    });
    
    grid.appendChild(avatarOption);
  });
  
  container.appendChild(grid);
  
  // Upload option
  if (allowUpload) {
    const uploadContainer = document.createElement('div');
    uploadContainer.className = 'text-center';
    
    const uploadLabel = document.createElement('label');
    uploadLabel.className = 'btn btn-secondary cursor-pointer';
    uploadLabel.textContent = 'Upload Custom Avatar';
    
    const uploadInput = document.createElement('input');
    uploadInput.type = 'file';
    uploadInput.accept = 'image/*';
    uploadInput.className = 'sr-only';
    
    uploadInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const newAvatar = {
            src: event.target.result,
            alt: 'Custom avatar'
          };
          
          // Add to grid
          const avatarOption = document.createElement('button');
          avatarOption.type = 'button';
          avatarOption.className = 'avatar-option relative p-2 border-2 border-transparent rounded-lg hover:border-gray-300 focus:border-primary focus:outline-none transition-colors ring-2 ring-primary ring-offset-2';
          avatarOption.setAttribute('role', 'radio');
          avatarOption.setAttribute('aria-checked', 'true');
          avatarOption.setAttribute('aria-label', 'Custom uploaded avatar');
          
          const img = document.createElement('img');
          img.src = newAvatar.src;
          img.alt = newAvatar.alt;
          img.className = 'w-16 h-16 rounded-full object-cover mx-auto';
          
          avatarOption.appendChild(img);
          
          // Clear other selections
          grid.querySelectorAll('.avatar-option').forEach(option => {
            option.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
            option.setAttribute('aria-checked', 'false');
          });
          
          grid.appendChild(avatarOption);
          onSelect(newAvatar.src, newAvatar);
        };
        reader.readAsDataURL(file);
      }
    });
    
    uploadLabel.appendChild(uploadInput);
    uploadContainer.appendChild(uploadLabel);
    container.appendChild(uploadContainer);
  }
  
  // Expose methods
  container.getSelected = () => {
    const selected = grid.querySelector('.avatar-option[aria-checked="true"]');
    if (selected) {
      const img = selected.querySelector('img');
      return img ? img.src : '';
    }
    return '';
  };
  
  container.validate = () => {
    return container.getSelected() !== '';
  };
  
  return container;
}

/**
 * Form Builder - Creates complete forms
 * @param {Object} config - Form configuration
 * @param {Array} config.fields - Array of field configurations
 * @param {Function} config.onSubmit - Submit handler
 * @param {string} config.submitText - Submit button text
 * @returns {HTMLElement} Form element
 */
function createForm(config = {}) {
  const {
    fields = [],
    onSubmit = () => {},
    submitText = 'Submit',
    className = ''
  } = config;

  const form = document.createElement('form');
  form.className = className;
  form.setAttribute('novalidate', 'true');
  
  const fieldElements = [];
  
  // Create fields
  fields.forEach(fieldConfig => {
    let field;
    
    switch (fieldConfig.type) {
      case 'name':
        field = createNameInput(fieldConfig);
        break;
      case 'number':
        field = createNumberInput(fieldConfig);
        break;
      case 'avatar':
        field = createAvatarSelector(fieldConfig);
        break;
      default:
        field = createTextInput(fieldConfig);
    }
    
    fieldElements.push(field);
    form.appendChild(field);
  });
  
  // Submit button
  const submitContainer = document.createElement('div');
  submitContainer.className = 'flex justify-center mt-6';
  
  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.className = 'btn btn-primary';
  submitButton.textContent = submitText;
  
  submitContainer.appendChild(submitButton);
  form.appendChild(submitContainer);
  
  // Form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Validate all fields
    const isValid = fieldElements.every(field => {
      return field.validate ? field.validate() : true;
    });
    
    if (isValid) {
      // Collect form data
      const formData = {};
      fieldElements.forEach((field, index) => {
        const fieldConfig = fields[index];
        if (fieldConfig.name) {
          if (field.getValue) {
            formData[fieldConfig.name] = field.getValue();
          } else if (field.getSelected) {
            formData[fieldConfig.name] = field.getSelected();
          }
        }
      });
      
      onSubmit(formData, e);
    }
  });
  
  return form;
}

/**
 * Render forms to container for testing/showcase
 * @param {HTMLElement} container - Container element
 */
function renderFormShowcase(container) {
  container.innerHTML = '';
  
  const showcase = document.createElement('div');
  showcase.className = 'container p-8';
  
  const section = document.createElement('section');
  section.innerHTML = '<h2>Form Components</h2><p class="text-secondary mb-6">Form elements with Quicksand typography and WCAG compliance</p>';
  
  // Basic inputs
  const inputs = document.createElement('div');
  inputs.className = 'mb-8';
  inputs.innerHTML = '<h3 class="mb-4">Input Types</h3>';
  
  const inputGrid = document.createElement('div');
  inputGrid.className = 'grid md:grid-cols-2 gap-6';
  
  // Text input
  const textInput = createTextInput({
    label: 'Full Name',
    placeholder: 'Enter your full name',
    helpText: 'This will be displayed on your profile'
  });
  
  // Number input with quick select
  const numberInput = createNumberInput({
    label: 'Number of Words',
    quickValues: [5, 10, 15, 20, 25],
    min: 1,
    max: 50
  });
  
  inputGrid.appendChild(textInput);
  inputGrid.appendChild(numberInput);
  inputs.appendChild(inputGrid);
  
  // Avatar selector
  const avatarSection = document.createElement('div');
  avatarSection.className = 'mb-8';
  avatarSection.innerHTML = '<h3 class="mb-4">Avatar Selector</h3>';
  
  // Sample avatars (using placeholder images)
  const sampleAvatars = [
    { src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1', alt: 'Avatar 1' },
    { src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2', alt: 'Avatar 2' },
    { src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3', alt: 'Avatar 3' },
    { src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4', alt: 'Avatar 4' },
    { src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5', alt: 'Avatar 5' }
  ];
  
  const avatarSelector = createAvatarSelector({
    avatars: sampleAvatars,
    onSelect: (src, avatar) => console.log('Avatar selected:', avatar)
  });
  
  avatarSection.appendChild(avatarSelector);
  
  // Complete form example
  const formSection = document.createElement('div');
  formSection.innerHTML = '<h3 class="mb-4">Complete Form Example</h3>';
  
  const exampleForm = createForm({
    fields: [
      {
        type: 'name',
        name: 'userName',
        onChange: (value) => console.log('Name changed:', value)
      }
    ],
    submitText: 'Continue',
    onSubmit: (data) => {
      console.log('Form submitted:', data);
      alert(`Hello, ${data.userName}!`);
    }
  });
  
  formSection.appendChild(exampleForm);
  
  section.appendChild(inputs);
  section.appendChild(avatarSection);
  section.appendChild(formSection);
  showcase.appendChild(section);
  container.appendChild(showcase);
}

// ES6 exports
export {
  createInput,
  createTextInput,
  createNameInput,
  createNumberInput,
  createAvatarSelector,
  createForm,
  renderFormShowcase
};

// Auto-render if script is loaded directly in HTML
if (typeof window !== 'undefined' && document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.form-showcase');
    if (container) {
      renderFormShowcase(container);
    }
  });
}