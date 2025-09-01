/**
 * Twibble Drop Container Component
 * WCAG-compliant drag and drop container with visual feedback
 * Supports multiple data types, keyboard accessibility, and configurable validation
 * Imports design-system.css for consistent styling
 */

// Import CSS if not already loaded
if (!document.querySelector('link[href*="design-system.css"]')) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '../styles/design-system.css';
  document.head.appendChild(link);
}

/**
 * Creates a WCAG-compliant drag and drop container with visual feedback
 * @param {Object} config - Container configuration options
 * @param {string} [config.label='Drop here'] - ARIA label for the container
 * @param {Function} [config.onDrop=()=>{}] - Callback function when item is dropped
 * @param {Function} [config.canDrop=()=>true] - Validation function to check if drop is allowed
 * @param {Array<string>} [config.acceptedTypes=['text/plain']] - Array of accepted MIME types for drag data
 * @param {string} [config.placeholder='Drag items here'] - Placeholder text displayed in container
 * @param {string} [config.className=''] - Additional CSS classes to apply
 * @returns {HTMLElement} Fully configured drop container element
 * 
 * @example
 * // Basic usage
 * const container = createDropContainer({
 *   label: 'Word practice area',
 *   placeholder: 'Drop words here to practice',
 *   onDrop: (data) => console.log('Dropped:', data)
 * });
 * 
 * @example
 * // Advanced configuration with validation
 * const container = createDropContainer({
 *   label: 'Vocabulary sorting area',
 *   acceptedTypes: ['text/plain', 'application/json'],
 *   canDrop: (data) => typeof data === 'string' && data.length > 0,
 *   onDrop: (data, event) => {
 *     // Handle dropped data
 *     processWord(data);
 *   },
 *   className: 'my-custom-class'
 * });
 */
function createDropContainer(config = {}) {
  const {
    label = 'Drop here',
    onDrop = () => {},
    canDrop = () => true,
    acceptedTypes = ['text/plain'],
    placeholder = 'Drag items here',
    className = ''
  } = config;

  // Create main container with WCAG-compliant attributes
  const container = document.createElement('div');
  container.className = `drop-container min-h-32 p-6 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500 transition-all ${className}`.trim();
  container.setAttribute('role', 'region');
  container.setAttribute('aria-label', label);
  container.setAttribute('aria-dropeffect', 'move');
  
  // Create content wrapper (prevents event conflicts with drag operations)
  const content = document.createElement('div');
  content.className = 'pointer-events-none';
  
  // Add visual icon using design system
  const icon = document.createElement('span');
  icon.className = 'icon icon-large block mb-2';
  icon.innerHTML = 'move_up';
  
  // Add placeholder text
  const text = document.createElement('p');
  text.textContent = placeholder;
  text.className = 'font-medium m-0';
  
  // Assemble content structure
  content.appendChild(icon);
  content.appendChild(text);
  container.appendChild(content);
  
  /**
   * Handles drag over events - provides visual feedback when dragging over container
   * @param {DragEvent} e - Drag event object
   */
  container.addEventListener('dragover', (e) => {
    e.preventDefault();
    
    // Check if we can accept this drop based on data types
    const hasAcceptedType = acceptedTypes.some(type => e.dataTransfer.types.includes(type));
    if (hasAcceptedType) {
      // Apply visual feedback for valid drop targets
      container.classList.add('border-primary', 'bg-primary', 'bg-opacity-5', 'text-primary');
      container.classList.remove('border-gray-300', 'text-gray-500');
      e.dataTransfer.dropEffect = 'move';
    }
  });
  
  /**
   * Handles drag leave events - removes visual feedback when leaving container
   * @param {DragEvent} e - Drag event object
   */
  container.addEventListener('dragleave', (e) => {
    // Only remove highlight if leaving the container entirely (not child elements)
    if (!container.contains(e.relatedTarget)) {
      container.classList.remove('border-primary', 'bg-primary', 'bg-opacity-5', 'text-primary');
      container.classList.add('border-gray-300', 'text-gray-500');
    }
  });
  
  /**
   * Handles drop events - processes dropped data and triggers callbacks
   * @param {DragEvent} e - Drag event object
   */
  container.addEventListener('drop', (e) => {
    e.preventDefault();
    
    // Reset visual state to default
    container.classList.remove('border-primary', 'bg-primary', 'bg-opacity-5', 'text-primary');
    container.classList.add('border-gray-300', 'text-gray-500');
    
    // Extract data from different transfer types
    const textData = e.dataTransfer.getData('text/plain');
    const jsonData = e.dataTransfer.getData('application/json');
    
    // Prioritize JSON data if available, fallback to text
    let dropData = textData;
    try {
      if (jsonData) {
        dropData = JSON.parse(jsonData);
      }
    } catch (err) {
      // JSON parsing failed, use text data as fallback
      console.warn('Failed to parse JSON data, using text data instead');
    }
    
    // Validate drop using configuration function
    if (canDrop(dropData)) {
      onDrop(dropData, e);
    }
  });
  
  // Add keyboard accessibility for screen readers and keyboard navigation
  container.setAttribute('tabindex', '0');
  
  return container;
}

// ES6 module export
export { createDropContainer };