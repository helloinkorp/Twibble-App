/**
 * Twibble Interactive Components
 * Word chips, drag-drop containers, flippable cards, modal system
 * All components work in complete isolation with WCAG compliance
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
 * Word Chip Component - Interactive word elements with activity indicators
 * @param {Object} config - Chip configuration
 * @param {string} config.word - The word text
 * @param {boolean} config.completed - Whether word is completed
 * @param {string} config.difficulty - Difficulty level (easy, medium, hard)
 * @param {Array} config.activities - Activity status array
 * @param {Function} config.onClick - Click handler
 * @param {boolean} config.draggable - Whether chip is draggable
 * @returns {HTMLElement} Word chip element
 */
function createWordChip(config = {}) {
  const {
    word = '',
    completed = false,
    difficulty = 'medium',
    activities = [],
    onClick = () => {},
    draggable = false,
    className = ''
  } = config;

  const chip = document.createElement('div');
  chip.className = `word-chip ${
    completed 
      ? 'completed' 
      : ''
  } ${className}`.trim();
  
  chip.setAttribute('role', 'button');
  chip.setAttribute('tabindex', '0');
  chip.setAttribute('aria-label', `${word} ${completed ? 'completed' : 'incomplete'}`);
  
  if (draggable) {
    chip.draggable = true;
    chip.setAttribute('aria-grabbed', 'false');
  }
  
  // Word text
  const wordText = document.createElement('span');
  wordText.className = 'font-medium';
  wordText.textContent = word;
  chip.appendChild(wordText);
  
  // Activity dots
  if (activities.length > 0) {
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'flex gap-1';
    
    activities.forEach((activity, index) => {
      const dot = document.createElement('div');
      dot.className = `w-2 h-2 rounded-full ${
        activity.completed 
          ? `bg-${activity.type === 'vocabulary' ? 'info' : activity.type === 'phonics' ? 'warning' : 'success'}` 
          : 'bg-gray-300'
      }`;
      dot.setAttribute('title', `${activity.name || activity.type}: ${activity.completed ? 'Complete' : 'Incomplete'}`);
      dotsContainer.appendChild(dot);
    });
    
    chip.appendChild(dotsContainer);
  }
  
  // Difficulty indicator
  const difficultyColors = {
    easy: 'bg-success',
    medium: 'bg-warning',
    hard: 'bg-error'
  };
  
  const difficultyDot = document.createElement('div');
  difficultyDot.className = `w-3 h-3 rounded-full ${difficultyColors[difficulty]} opacity-60`;
  difficultyDot.setAttribute('title', `Difficulty: ${difficulty}`);
  difficultyDot.setAttribute('aria-label', `Difficulty: ${difficulty}`);
  chip.appendChild(difficultyDot);
  
  // Event handlers
  chip.addEventListener('click', onClick);
  chip.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(e);
    }
  });
  
  // Drag and drop handlers
  if (draggable) {
    chip.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', word);
      e.dataTransfer.setData('application/json', JSON.stringify(config));
      chip.setAttribute('aria-grabbed', 'true');
      chip.style.opacity = '0.5';
    });
    
    chip.addEventListener('dragend', () => {
      chip.setAttribute('aria-grabbed', 'false');
      chip.style.opacity = '1';
    });
  }
  
  return chip;
}

/**
 * Drag and Drop Container
 * @param {Object} config - Container configuration
 * @param {string} config.label - Container label
 * @param {Function} config.onDrop - Drop handler
 * @param {Function} config.canDrop - Drop validation function
 * @param {Array} config.acceptedTypes - Array of accepted data types
 * @returns {HTMLElement} Drop container element
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

  const container = document.createElement('div');
  container.className = `drop-container min-h-32 p-6 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500 transition-all ${className}`.trim();
  container.setAttribute('role', 'region');
  container.setAttribute('aria-label', label);
  container.setAttribute('aria-dropeffect', 'move');
  
  const content = document.createElement('div');
  content.className = 'pointer-events-none';
  
  const icon = document.createElement('span');
  icon.className = 'icon icon-large block mb-2';
  icon.innerHTML = 'move_up';
  
  const text = document.createElement('p');
  text.textContent = placeholder;
  text.className = 'font-medium m-0';
  
  content.appendChild(icon);
  content.appendChild(text);
  container.appendChild(content);
  
  // Drag and drop handlers
  container.addEventListener('dragover', (e) => {
    e.preventDefault();
    
    // Check if we can accept this drop
    const hasAcceptedType = acceptedTypes.some(type => e.dataTransfer.types.includes(type));
    if (hasAcceptedType) {
      container.classList.add('border-primary', 'bg-primary', 'bg-opacity-5', 'text-primary');
      container.classList.remove('border-gray-300', 'text-gray-500');
      e.dataTransfer.dropEffect = 'move';
    }
  });
  
  container.addEventListener('dragleave', (e) => {
    // Only remove highlight if leaving the container entirely
    if (!container.contains(e.relatedTarget)) {
      container.classList.remove('border-primary', 'bg-primary', 'bg-opacity-5', 'text-primary');
      container.classList.add('border-gray-300', 'text-gray-500');
    }
  });
  
  container.addEventListener('drop', (e) => {
    e.preventDefault();
    
    // Reset visual state
    container.classList.remove('border-primary', 'bg-primary', 'bg-opacity-5', 'text-primary');
    container.classList.add('border-gray-300', 'text-gray-500');
    
    // Get dropped data
    const textData = e.dataTransfer.getData('text/plain');
    const jsonData = e.dataTransfer.getData('application/json');
    
    let dropData = textData;
    try {
      if (jsonData) {
        dropData = JSON.parse(jsonData);
      }
    } catch (err) {
      // Fallback to text data
    }
    
    // Validate drop
    if (canDrop(dropData)) {
      onDrop(dropData, e);
    }
  });
  
  // Keyboard accessibility (for items moved via keyboard)
  container.setAttribute('tabindex', '0');
  
  return container;
}

/**
 * Flippable Card Component - For vocabulary flashcards
 * @param {Object} config - Card configuration
 * @param {string} config.front - Front content (word)
 * @param {string} config.back - Back content (definition)
 * @param {boolean} config.flipped - Initial state
 * @param {Function} config.onFlip - Flip handler
 * @returns {HTMLElement} Flippable card element
 */
function createFlippableCard(config = {}) {
  const {
    front = 'Word',
    back = 'Definition',
    flipped = false,
    onFlip = () => {},
    className = ''
  } = config;

  const cardContainer = document.createElement('div');
  cardContainer.className = `flip-card relative w-80 h-48 mx-auto cursor-pointer ${className}`.trim();
  cardContainer.setAttribute('tabindex', '0');
  cardContainer.setAttribute('role', 'button');
  cardContainer.setAttribute('aria-label', `Flip card to see ${flipped ? 'word' : 'definition'}`);
  
  // Card inner (the flipping element)
  const cardInner = document.createElement('div');
  cardInner.className = 'flip-card-inner relative w-full h-full transition-transform duration-600 transform-style-preserve-3d';
  
  if (flipped) {
    cardInner.style.transform = 'rotateY(180deg)';
  }
  
  // Front side
  const frontSide = document.createElement('div');
  frontSide.className = 'flip-card-face flip-card-front absolute w-full h-full backface-hidden card flex items-center justify-center text-center p-6';
  
  const frontContent = document.createElement('div');
  frontContent.innerHTML = `<h3 class="text-2xl font-medium mb-0">${front}</h3>`;
  frontSide.appendChild(frontContent);
  
  // Back side
  const backSide = document.createElement('div');
  backSide.className = 'flip-card-face flip-card-back absolute w-full h-full backface-hidden card card-soft flex items-center justify-center text-center p-6';
  backSide.style.transform = 'rotateY(180deg)';
  
  const backContent = document.createElement('div');
  backContent.innerHTML = `<p class="text-lg text-secondary mb-0">${back}</p>`;
  backSide.appendChild(backContent);
  
  cardInner.appendChild(frontSide);
  cardInner.appendChild(backSide);
  cardContainer.appendChild(cardInner);
  
  // Flip functionality
  let isFlipped = flipped;
  
  const flip = () => {
    isFlipped = !isFlipped;
    cardInner.style.transform = isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)';
    cardContainer.setAttribute('aria-label', `Flip card to see ${isFlipped ? 'word' : 'definition'}`);
    onFlip(isFlipped);
  };
  
  cardContainer.addEventListener('click', flip);
  cardContainer.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      flip();
    }
  });
  
  // Add required CSS if not present
  if (!document.querySelector('#flip-card-styles')) {
    const style = document.createElement('style');
    style.id = 'flip-card-styles';
    style.textContent = `
      .transform-style-preserve-3d {
        transform-style: preserve-3d;
      }
      .backface-hidden {
        backface-visibility: hidden;
      }
    `;
    document.head.appendChild(style);
  }
  
  return cardContainer;
}

/**
 * Modal Component - Overlay dialogs
 * @param {Object} config - Modal configuration
 * @param {string} config.title - Modal title
 * @param {string} config.content - Modal content
 * @param {Array} config.actions - Array of action buttons
 * @param {boolean} config.closable - Whether modal can be closed
 * @param {Function} config.onClose - Close handler
 * @returns {HTMLElement} Modal element
 */
function createModal(config = {}) {
  const {
    title = '',
    content = '',
    actions = [],
    closable = true,
    onClose = () => {},
    className = ''
  } = config;

  // Modal backdrop
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
  backdrop.setAttribute('role', 'presentation');
  
  // Modal container
  const modal = document.createElement('div');
  modal.className = `modal bg-white rounded-lg shadow-lg max-w-md w-full max-h-screen overflow-y-auto ${className}`.trim();
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  
  if (title) {
    modal.setAttribute('aria-labelledby', 'modal-title');
  }
  
  // Modal header
  if (title || closable) {
    const header = document.createElement('div');
    header.className = 'modal-header flex items-center justify-between p-6 border-b border-gray-200';
    
    if (title) {
      const titleEl = document.createElement('h2');
      titleEl.id = 'modal-title';
      titleEl.className = 'text-xl font-medium m-0';
      titleEl.textContent = title;
      header.appendChild(titleEl);
    }
    
    if (closable) {
      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'text-gray-400 hover:text-gray-600 focus:text-gray-600 focus:outline-none';
      closeBtn.innerHTML = '<span class="icon icon-large">close</span>';
      closeBtn.setAttribute('aria-label', 'Close modal');
      closeBtn.addEventListener('click', () => closeModal());
      header.appendChild(closeBtn);
    }
    
    modal.appendChild(header);
  }
  
  // Modal body
  const body = document.createElement('div');
  body.className = 'modal-body p-6';
  
  if (typeof content === 'string') {
    body.innerHTML = content;
  } else if (content instanceof HTMLElement) {
    body.appendChild(content);
  }
  
  modal.appendChild(body);
  
  // Modal footer with actions
  if (actions.length > 0) {
    const footer = document.createElement('div');
    footer.className = 'modal-footer flex justify-end gap-3 p-6 border-t border-gray-200';
    
    actions.forEach(action => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `btn btn-${action.variant || 'secondary'}`;
      button.textContent = action.text;
      
      if (action.onClick) {
        button.addEventListener('click', (e) => {
          action.onClick(e);
          if (action.closesModal !== false) {
            closeModal();
          }
        });
      }
      
      footer.appendChild(button);
    });
    
    modal.appendChild(footer);
  }
  
  backdrop.appendChild(modal);
  
  // Close modal function
  const closeModal = () => {
    backdrop.remove();
    onClose();
    
    // Return focus to previously focused element
    if (backdrop.previousFocus && backdrop.previousFocus.focus) {
      backdrop.previousFocus.focus();
    }
  };
  
  // Backdrop click to close
  if (closable) {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closeModal();
      }
    });
  }
  
  // Escape key to close
  if (closable) {
    backdrop.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    });
  }
  
  // Focus management
  backdrop.previousFocus = document.activeElement;
  
  // Show modal
  document.body.appendChild(backdrop);
  
  // Focus first focusable element
  setTimeout(() => {
    const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable) {
      focusable.focus();
    }
  }, 100);
  
  // Return modal element for external reference
  backdrop.modal = modal;
  backdrop.close = closeModal;
  
  return backdrop;
}

/**
 * Letter Assembly Component - For spelling activities
 * @param {Object} config - Assembly configuration
 * @param {string} config.targetWord - Word to spell
 * @param {Array} config.letters - Available letters
 * @param {Function} config.onComplete - Completion handler
 * @returns {HTMLElement} Letter assembly component
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

/**
 * Render interactive components to container for testing/showcase
 * @param {HTMLElement} container - Container element
 */
function renderInteractiveShowcase(container) {
  container.innerHTML = '';
  
  const showcase = document.createElement('div');
  showcase.className = 'container p-8';
  
  const section = document.createElement('section');
  section.innerHTML = '<h2>Interactive Components</h2><p class="text-secondary mb-6">Word chips, drag-drop, flippable cards, and modals</p>';
  
  // Word chips
  const chipsSection = document.createElement('div');
  chipsSection.className = 'mb-8';
  chipsSection.innerHTML = '<h3 class="mb-4">Word Chips</h3>';
  
  const chipsContainer = document.createElement('div');
  chipsContainer.className = 'flex flex-wrap gap-3 mb-4';
  
  const sampleWords = [
    {
      word: 'elephant',
      completed: true,
      difficulty: 'easy',
      activities: [
        { type: 'vocabulary', completed: true },
        { type: 'phonics', completed: true },
        { type: 'spelling', completed: true }
      ]
    },
    {
      word: 'butterfly',
      completed: false,
      difficulty: 'medium',
      activities: [
        { type: 'vocabulary', completed: true },
        { type: 'phonics', completed: false },
        { type: 'spelling', completed: false }
      ]
    },
    {
      word: 'magnificent',
      completed: false,
      difficulty: 'hard',
      activities: [
        { type: 'vocabulary', completed: false },
        { type: 'phonics', completed: false },
        { type: 'spelling', completed: false }
      ]
    }
  ];
  
  sampleWords.forEach(wordData => {
    const chip = createWordChip({
      ...wordData,
      draggable: true,
      onClick: () => console.log('Word clicked:', wordData.word)
    });
    chipsContainer.appendChild(chip);
  });
  
  chipsSection.appendChild(chipsContainer);
  
  // Drag and drop
  const dropSection = document.createElement('div');
  dropSection.className = 'mb-8';
  dropSection.innerHTML = '<h3 class="mb-4">Drag and Drop</h3><p class="text-sm text-secondary mb-4">Try dragging the word chips above into the container below:</p>';
  
  const dropContainer = createDropContainer({
    label: 'Spelling practice area',
    placeholder: 'Drop words here to practice spelling',
    onDrop: (data) => {
      console.log('Dropped:', data);
      alert(`Dropped: ${typeof data === 'object' ? data.word : data}`);
    }
  });
  
  dropSection.appendChild(dropContainer);
  
  // Flippable card
  const cardSection = document.createElement('div');
  cardSection.className = 'mb-8';
  cardSection.innerHTML = '<h3 class="mb-4">Flippable Cards</h3><p class="text-sm text-secondary mb-4">Click the card to flip between word and definition:</p>';
  
  const flippableCard = createFlippableCard({
    front: 'Serendipity',
    back: 'The occurrence of happy or beneficial events by chance',
    onFlip: (flipped) => console.log('Card flipped:', flipped)
  });
  
  cardSection.appendChild(flippableCard);
  
  // Modal example
  const modalSection = document.createElement('div');
  modalSection.className = 'mb-8';
  modalSection.innerHTML = '<h3 class="mb-4">Modal System</h3>';
  
  const modalTrigger = document.createElement('button');
  modalTrigger.className = 'btn btn-primary';
  modalTrigger.textContent = 'Open Modal';
  modalTrigger.addEventListener('click', () => {
    createModal({
      title: 'Lesson Complete!',
      content: '<p>Congratulations! You have completed all the vocabulary activities for this lesson.</p><p>Your progress has been saved automatically.</p>',
      actions: [
        {
          text: 'Continue',
          variant: 'primary',
          onClick: () => console.log('Continue clicked')
        },
        {
          text: 'Review',
          variant: 'secondary',
          onClick: () => console.log('Review clicked')
        }
      ]
    });
  });
  
  modalSection.appendChild(modalTrigger);
  
  // Letter assembly
  const assemblySection = document.createElement('div');
  assemblySection.innerHTML = '<h3 class="mb-4">Letter Assembly</h3><p class="text-sm text-secondary mb-4">Drag letters to spell the word:</p>';
  
  const letterAssembly = createLetterAssembly({
    targetWord: 'cat',
    letters: ['c', 'a', 't', 'b', 'r', 'x'],
    onComplete: (success, word) => {
      if (success) {
        alert(`Correct! You spelled "${word}"`);
      } else {
        console.log('Incorrect spelling:', word);
      }
    }
  });
  
  assemblySection.appendChild(letterAssembly);
  
  section.appendChild(chipsSection);
  section.appendChild(dropSection);
  section.appendChild(cardSection);
  section.appendChild(modalSection);
  section.appendChild(assemblySection);
  showcase.appendChild(section);
  container.appendChild(showcase);
}

// ES6 exports
export {
  createWordChip,
  createDropContainer,
  createFlippableCard,
  createModal,
  createLetterAssembly,
  renderInteractiveShowcase
};

// Auto-render if script is loaded directly in HTML
if (typeof window !== 'undefined' && document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.interactive-showcase');
    if (container) {
      renderInteractiveShowcase(container);
    }
  });
}