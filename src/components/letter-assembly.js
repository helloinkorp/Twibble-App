/**
 * Letter Assembly Component - For spelling activities
 * Provides draggable letter tiles that can be assembled to spell target words
 * Includes validation, visual feedback, and WCAG accessibility compliance
 * Imports design-system.css for consistent styling with token system
 */

// Import CSS if not already loaded
if (!document.querySelector('link[href*="design-system.css"]')) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '../styles/design-system.css';
  document.head.appendChild(link);
}

/**
 * Creates a letter assembly component for spelling activities
 * @param {Object} config - Assembly configuration
 * @param {string} config.targetWord - Word to spell (required)
 * @param {Array<string>} config.letters - Available letters for assembly (required)
 * @param {Function} config.onComplete - Callback when word is completed (success, word) => void
 * @param {string} config.className - Additional CSS classes
 * @returns {HTMLElement} Letter assembly component with drag-drop functionality
 * 
 * @example
 * const assembly = createLetterAssembly({
 *   targetWord: 'cat',
 *   letters: ['c', 'a', 't', 'b', 'r', 'x'],
 *   onComplete: (success, word) => {
 *     if (success) alert(`Correct! You spelled "${word}"`);
 *   }
 * });
 * document.body.appendChild(assembly);
 */
function createLetterAssembly(config = {}) {
  const {
    targetWord = '',
    letters = [],
    onComplete = () => {},
    className = ''
  } = config;

  const container = document.createElement('div');
  container.className = `letter-assembly ${className}`.trim();
  
  // Target word display (with blanks)
  const targetDisplay = document.createElement('div');
  targetDisplay.className = 'target-word flex justify-center gap-2 mb-6';
  
  const wordSlots = [];
  for (let i = 0; i < targetWord.length; i++) {
    const slot = document.createElement('div');
    slot.className = 'letter-slot w-12 h-12 border-2 border-gray-300 rounded-lg flex items-center justify-center text-lg font-medium bg-white';
    slot.setAttribute('data-index', i.toString());
    slot.setAttribute('role', 'listbox');
    slot.setAttribute('aria-label', `Letter position ${i + 1}`);
    
    wordSlots.push(slot);
    targetDisplay.appendChild(slot);
  }
  
  // Available letters
  const lettersContainer = document.createElement('div');
  lettersContainer.className = 'available-letters flex flex-wrap justify-center gap-3 mb-6';
  
  const letterElements = letters.map(letter => {
    const letterEl = document.createElement('div');
    letterEl.className = 'letter-option w-10 h-10 border border-gray-400 rounded-lg flex items-center justify-center text-sm font-medium cursor-move bg-gray-100 hover:bg-gray-200';
    letterEl.textContent = letter;
    letterEl.draggable = true;
    letterEl.setAttribute('data-letter', letter);
    letterEl.setAttribute('aria-grabbed', 'false');
    
    // Drag handlers
    letterEl.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', letter);
      letterEl.setAttribute('aria-grabbed', 'true');
      letterEl.style.opacity = '0.5';
    });
    
    letterEl.addEventListener('dragend', () => {
      letterEl.setAttribute('aria-grabbed', 'false');
      letterEl.style.opacity = '1';
    });
    
    return letterEl;
  });
  
  letterElements.forEach(el => lettersContainer.appendChild(el));
  
  // Make slots droppable
  wordSlots.forEach((slot, index) => {
    slot.addEventListener('dragover', (e) => {
      e.preventDefault();
      slot.classList.add('border-primary', 'bg-primary-light');
    });
    
    slot.addEventListener('dragleave', () => {
      slot.classList.remove('border-primary', 'bg-primary-light');
    });
    
    slot.addEventListener('drop', (e) => {
      e.preventDefault();
      const letter = e.dataTransfer.getData('text/plain');
      
      slot.classList.remove('border-primary', 'bg-primary-light');
      slot.textContent = letter;
      slot.classList.add('border-success', 'text-success');
      
      // Remove letter from available letters
      const letterEl = lettersContainer.querySelector(`[data-letter="${letter}"]`);
      if (letterEl) {
        letterEl.style.display = 'none';
      }
      
      // Check completion
      checkCompletion();
    });
    
    // Click to clear
    slot.addEventListener('click', () => {
      if (slot.textContent) {
        // Return letter to available letters
        const letter = slot.textContent;
        const letterEl = lettersContainer.querySelector(`[data-letter="${letter}"]`);
        if (letterEl) {
          letterEl.style.display = 'flex';
        }
        
        slot.textContent = '';
        slot.classList.remove('border-success', 'text-success');
        slot.classList.add('border-gray-300');
      }
    });
  });
  
  // Check if word is complete and correct
  const checkCompletion = () => {
    const currentWord = wordSlots.map(slot => slot.textContent).join('');
    
    if (currentWord.length === targetWord.length) {
      if (currentWord.toLowerCase() === targetWord.toLowerCase()) {
        // Success
        wordSlots.forEach(slot => {
          slot.classList.remove('border-success');
          slot.classList.add('border-success', 'bg-success', 'bg-opacity-10');
        });
        
        setTimeout(() => {
          onComplete(true, currentWord);
        }, 500);
      } else {
        // Incorrect
        wordSlots.forEach(slot => {
          slot.classList.add('border-error', 'text-error');
        });
        
        setTimeout(() => {
          wordSlots.forEach(slot => {
            slot.classList.remove('border-error', 'text-error');
          });
        }, 1000);
      }
    }
  };
  
  container.appendChild(targetDisplay);
  container.appendChild(lettersContainer);
  
  return container;
}

// ES6 exports
export { createLetterAssembly };

// Auto-render if script is loaded directly in HTML
if (typeof window !== 'undefined' && document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.letter-assembly-showcase');
    if (container) {
      const assembly = createLetterAssembly({
        targetWord: 'hello',
        letters: ['h', 'e', 'l', 'l', 'o', 'w', 'r', 'x'],
        onComplete: (success, word) => {
          if (success) {
            console.log(`Correct! You spelled "${word}"`);
          } else {
            console.log('Incorrect spelling:', word);
          }
        }
      });
      container.appendChild(assembly);
    }
  });
}