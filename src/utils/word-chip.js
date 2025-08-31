/**
 * Unified Word Chip Component - Merged from chips.js and interactive.js
 * Supports both drag-drop functionality and interactive states
 * Maintains WCAG 2.1 AA accessibility compliance
 * Colors: Vocabulary=pastel yellow, Spelling=pastel mint, Phonics=pastel purple
 */

/**
 * Creates a unified word chip element with comprehensive functionality
 * Supports both the chips.js API (activities array) and interactive.js API (completed/difficulty states)
 * 
 * @param {Object} config - Chip configuration
 * @param {string} config.word - The word text
 * @param {Array} config.activities - Array of activities ['vocabulary', 'spelling', 'phonics'] OR objects with {type, completed}
 * @param {boolean} config.completed - Whether word is completed (interactive.js compatibility)
 * @param {string} config.difficulty - Difficulty level (easy, medium, hard) (interactive.js compatibility)
 * @param {Function} config.onDelete - Delete callback function (chips.js compatibility)
 * @param {Function} config.onClick - Click handler (interactive.js compatibility)
 * @param {boolean} config.draggable - Whether chip should be draggable
 * @param {string} config.className - Additional CSS classes
 * @param {string} config.id - Custom ID (auto-generated if not provided)
 * @returns {HTMLElement} Unified chip element
 */
function createWordChip(config = {}) {
  const {
    word = '',
    activities = [],
    completed = false,
    difficulty = 'medium',
    onDelete = null,
    onClick = null,
    draggable = true,
    className = '',
    id = `chip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  } = config;

  const chip = document.createElement('div');
  
  // Determine if we're using the new interactive.js style or legacy chips.js style
  const isInteractiveStyle = completed !== undefined || difficulty !== undefined || onClick !== null;
  
  // Base classes - support both design systems
  let baseClasses = 'word-chip';
  if (isInteractiveStyle) {
    baseClasses += completed ? ' completed' : '';
    // Add interactive-specific classes
    chip.setAttribute('role', 'button');
    chip.setAttribute('tabindex', '0');
    chip.setAttribute('aria-label', `${word} ${completed ? 'completed' : 'incomplete'}`);
  }
  
  chip.className = `${baseClasses} ${className}`.trim();
  chip.setAttribute('data-word', word);
  chip.setAttribute('data-chip-id', id);
  
  // Draggable setup
  if (draggable) {
    chip.draggable = true;
    if (isInteractiveStyle) {
      chip.setAttribute('aria-grabbed', 'false');
    }
    chip.addEventListener('dragstart', handleDragStart);
    chip.addEventListener('dragend', handleDragEnd);
  }

  // Determine chip appearance based on activities (chips.js compatibility)
  if (!isInteractiveStyle && activities.length > 0) {
    updateChipAppearance(chip, activities);
  }

  // Create chip content
  const wordText = document.createElement('span');
  if (isInteractiveStyle) {
    wordText.className = 'font-medium';
  }
  wordText.textContent = word;
  chip.appendChild(wordText);

  // Handle activities - support both formats
  if (activities.length > 0) {
    if (isInteractiveStyle && Array.isArray(activities) && typeof activities[0] === 'object') {
      // Interactive.js format: activities with completed status
      const dotsContainer = document.createElement('div');
      dotsContainer.className = 'flex gap-1';
      
      activities.forEach((activity) => {
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
    } else if (!isInteractiveStyle && activities.length > 1) {
      // Chips.js format: multiple activities = gray with colored dots
      const dotsContainer = document.createElement('div');
      dotsContainer.className = 'activity-dots';
      
      activities.forEach(activity => {
        const dot = document.createElement('div');
        dot.className = `activity-dot ${activity === 'vocabulary' ? 'vocab' : activity}`;
        dotsContainer.appendChild(dot);
      });
      
      chip.appendChild(dotsContainer);
    }
  }

  // Difficulty indicator (interactive.js compatibility)
  if (isInteractiveStyle && difficulty) {
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
  }

  // Add delete button if callback provided (chips.js compatibility)
  if (onDelete) {
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size: 10px;">close</span>';
    deleteBtn.setAttribute('aria-label', `Delete ${word}`);
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      onDelete(id, word);
    });
    chip.appendChild(deleteBtn);
  }

  // Event handlers
  if (onClick) {
    chip.addEventListener('click', onClick);
    chip.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick(e);
      }
    });
  }

  return chip;
}

/**
 * Updates chip appearance based on activities (chips.js compatibility)
 * @param {HTMLElement} chip - Chip element
 * @param {Array} activities - Array of activities
 */
function updateChipAppearance(chip, activities) {
  // Remove existing activity classes
  chip.classList.remove('vocabulary', 'spelling', 'phonics', 'multiple');
  
  if (activities.length === 0) {
    chip.classList.add('vocabulary'); // Default to vocabulary
  } else if (activities.length === 1) {
    chip.classList.add(activities[0]);
  } else {
    chip.classList.add('multiple');
  }
}

/**
 * Drag and drop event handlers (unified from both implementations)
 */
let draggedChip = null;

function handleDragStart(e) {
  draggedChip = e.target;
  e.target.classList.add('dragging');
  
  // Set drag data - support both formats
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', e.target.getAttribute('data-word'));
  e.dataTransfer.setData('chip-id', e.target.getAttribute('data-chip-id'));
  
  // Interactive.js compatibility
  if (e.target.getAttribute('aria-grabbed')) {
    e.target.setAttribute('aria-grabbed', 'true');
    e.target.style.opacity = '0.5';
  }
  
  // Interactive.js JSON data support
  const isInteractiveStyle = e.target.hasAttribute('aria-grabbed');
  if (isInteractiveStyle) {
    // Try to reconstruct config for interactive.js compatibility
    const config = {
      word: e.target.getAttribute('data-word'),
      // Add other properties if needed
    };
    e.dataTransfer.setData('application/json', JSON.stringify(config));
  }
}

function handleDragEnd(e) {
  e.target.classList.remove('dragging');
  draggedChip = null;
  
  // Interactive.js compatibility
  if (e.target.getAttribute('aria-grabbed')) {
    e.target.setAttribute('aria-grabbed', 'false');
    e.target.style.opacity = '1';
  }
}

// Export the unified function
export {
  createWordChip,
  updateChipAppearance
};

// Global namespace for non-module usage (chips.js compatibility)
if (typeof window !== 'undefined') {
  window.ChipComponents = window.ChipComponents || {};
  window.ChipComponents.createWordChip = createWordChip;
  window.ChipComponents.updateChipAppearance = updateChipAppearance;
}