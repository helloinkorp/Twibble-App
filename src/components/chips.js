/**
 * Word Chips Component System - PRD Compliant
 * Implements drag-and-drop word chips with activity color coding
 * Colors: Vocabulary=pastel yellow, Spelling=pastel mint, Phonics=pastel purple
 * Multiple activities = gray with colored dots
 */

/**
 * Creates a word chip element with proper activity color coding
 * @param {Object} config - Chip configuration
 * @param {string} config.word - The word text
 * @param {Array} config.activities - Array of activities ['vocabulary', 'spelling', 'phonics']
 * @param {Function} config.onDelete - Delete callback function
 * @param {boolean} config.draggable - Whether chip should be draggable
 * @returns {HTMLElement} Chip element
 */
function createWordChip(config = {}) {
  const {
    word = '',
    activities = [],
    onDelete = null,
    draggable = true,
    id = `chip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  } = config;

  const chip = document.createElement('div');
  chip.className = 'word-chip';
  chip.setAttribute('data-word', word);
  chip.setAttribute('data-chip-id', id);
  
  if (draggable) {
    chip.draggable = true;
    chip.addEventListener('dragstart', handleDragStart);
    chip.addEventListener('dragend', handleDragEnd);
  }

  // Determine chip appearance based on activities
  updateChipAppearance(chip, activities);

  // Create chip content
  const wordText = document.createElement('span');
  wordText.textContent = word;
  chip.appendChild(wordText);

  // Add activity dots for multiple activities
  if (activities.length > 1) {
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'activity-dots';
    
    activities.forEach(activity => {
      const dot = document.createElement('div');
      dot.className = `activity-dot ${activity === 'vocabulary' ? 'vocab' : activity}`;
      dotsContainer.appendChild(dot);
    });
    
    chip.appendChild(dotsContainer);
  }

  // Add delete button if callback provided
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

  return chip;
}

/**
 * Updates chip appearance based on activities
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
 * Creates a chip container (drop zone) for an activity group
 * @param {Object} config - Container configuration
 * @param {string} config.activity - Activity type (vocabulary, spelling, phonics)
 * @param {string} config.title - Container title
 * @param {Function} config.onDrop - Drop callback function
 * @returns {HTMLElement} Container element
 */
function createChipContainer(config = {}) {
  const {
    activity = 'vocabulary',
    title = 'Words',
    onDrop = null
  } = config;

  const container = document.createElement('div');
  container.className = 'chip-container';
  container.setAttribute('data-activity', activity);

  // Setup drop zone functionality
  if (onDrop) {
    container.addEventListener('dragover', handleDragOver);
    container.addEventListener('drop', (e) => handleDrop(e, activity, onDrop));
    container.addEventListener('dragenter', handleDragEnter);
    container.addEventListener('dragleave', handleDragLeave);
  }

  return container;
}

/**
 * Drag and drop event handlers
 */
let draggedChip = null;

function handleDragStart(e) {
  draggedChip = e.target;
  e.target.classList.add('dragging');
  
  // Set drag data
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', e.target.getAttribute('data-word'));
  e.dataTransfer.setData('chip-id', e.target.getAttribute('data-chip-id'));
}

function handleDragEnd(e) {
  e.target.classList.remove('dragging');
  draggedChip = null;
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}

function handleDragEnter(e) {
  e.preventDefault();
  if (e.target.classList.contains('chip-container')) {
    e.target.classList.add('drop-zone');
  }
}

function handleDragLeave(e) {
  if (e.target.classList.contains('chip-container')) {
    // Only remove drop-zone if we're actually leaving the container
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      e.target.classList.remove('drop-zone');
    }
  }
}

function handleDrop(e, targetActivity, onDropCallback) {
  e.preventDefault();
  const container = e.currentTarget;
  container.classList.remove('drop-zone');
  
  const chipId = e.dataTransfer.getData('chip-id');
  const word = e.dataTransfer.getData('text/plain');
  
  if (draggedChip && onDropCallback) {
    onDropCallback(chipId, word, targetActivity, draggedChip);
  }
}

/**
 * Chip Management System - Handles chip state and operations
 */
class ChipManager {
  constructor() {
    this.chips = new Map(); // chipId -> {word, activities, element}
    this.containers = new Map(); // activity -> container element
    this.changeHandlers = [];
    this.activityStates = new Map(); // groupId -> {vocabulary: boolean, spelling: boolean, phonics: boolean}
    this.initializeActivityTracking();
  }

  /**
   * Initialize activity state tracking for all word groups
   */
  initializeActivityTracking() {
    // Initialize activity states for Manual Entry groups
    this.activityStates.set('vocabulary', { vocabulary: true, spelling: false, phonics: false });
    this.activityStates.set('spelling', { vocabulary: false, spelling: true, phonics: false });
    this.activityStates.set('phonics', { vocabulary: false, spelling: false, phonics: true });
    
    // Initialize activity states for File Upload groups
    this.activityStates.set('file-vocabulary', { vocabulary: true, spelling: false, phonics: false });
    this.activityStates.set('file-spelling', { vocabulary: false, spelling: true, phonics: false });
    this.activityStates.set('file-phonics', { vocabulary: false, spelling: false, phonics: true });
  }

  /**
   * Add a change handler to be called when chips change
   */
  onChipChange(handler) {
    this.changeHandlers.push(handler);
  }

  /**
   * Trigger change handlers
   */
  triggerChange() {
    this.changeHandlers.forEach(handler => handler(this.getAllChips()));
  }

  /**
   * Add a new chip to the system
   */
  addChip(word, activities = ['vocabulary'], containerId = 'vocabulary') {
    // CRITICAL FIX: Validate inputs and ensure activities is never empty
    if (!word || typeof word !== 'string' || word.trim().length === 0) {
      console.error('ChipManager.addChip: Invalid word provided:', word);
      return null;
    }
    
    // Ensure activities is an array and not empty
    if (!Array.isArray(activities) || activities.length === 0) {
      console.warn('ChipManager.addChip: Empty activities array, defaulting to vocabulary');
      activities = ['vocabulary'];
    }

    // Check if container exists
    const container = this.containers.get(containerId);
    if (!container) {
      console.error(`ChipManager.addChip: Container '${containerId}' not registered! Available containers:`, Array.from(this.containers.keys()));
      return null;
    }

    const chipConfig = {
      word: word.trim(),
      activities,
      onDelete: (chipId) => this.deleteChip(chipId),
      draggable: true
    };

    const chipElement = createWordChip(chipConfig);
    const chipId = chipElement.getAttribute('data-chip-id');
    
    // Store chip data
    this.chips.set(chipId, {
      word: word.trim(),
      activities: [...activities],
      element: chipElement,
      containerId
    });

    // Add to container
    container.appendChild(chipElement);
    container.classList.remove('empty');
    
    console.log(`ChipManager.addChip: Successfully added "${word.trim()}" to ${containerId} with activities:`, activities);

    this.triggerChange();
    return chipId;
  }

  /**
   * Delete a chip from the system
   */
  deleteChip(chipId) {
    const chipData = this.chips.get(chipId);
    if (chipData) {
      chipData.element.remove();
      this.chips.delete(chipId);
      this.triggerChange();
    }
  }

  /**
   * Move a chip between containers and update its activities
   */
  moveChip(chipId, fromActivity, toActivity) {
    const chipData = this.chips.get(chipId);
    if (!chipData) return;

    const fromContainer = this.containers.get(fromActivity);
    const toContainer = this.containers.get(toActivity);
    
    if (!toContainer) return;

    // Update chip activities (replace with target activity)
    chipData.activities = [toActivity];
    chipData.containerId = toActivity;
    
    // Update visual appearance
    updateChipAppearance(chipData.element, chipData.activities);
    
    // Move element
    toContainer.appendChild(chipData.element);
    toContainer.classList.remove('empty');
    
    // Check if source container is now empty
    if (fromContainer && fromContainer.children.length === 0) {
      fromContainer.classList.add('empty');
    }

    this.triggerChange();
  }

  /**
   * Register a container for an activity
   */
  registerContainer(activity, containerElement) {
    this.containers.set(activity, containerElement);
    
    // Setup drop handler for this container
    const originalOnDrop = (chipId, word, targetActivity, chipElement) => {
      const currentChip = this.chips.get(chipId);
      if (currentChip) {
        this.moveChip(chipId, currentChip.containerId, targetActivity);
      }
    };

    // Update container with drop functionality
    containerElement.addEventListener('dragover', handleDragOver);
    containerElement.addEventListener('drop', (e) => handleDrop(e, activity, originalOnDrop));
    containerElement.addEventListener('dragenter', handleDragEnter);
    containerElement.addEventListener('dragleave', handleDragLeave);
  }

  /**
   * Get all chips data
   */
  getAllChips() {
    const result = {};
    for (const [activity, container] of this.containers) {
      result[activity] = [];
    }
    
    for (const [chipId, chipData] of this.chips) {
      const activity = chipData.containerId;
      if (result[activity]) {
        result[activity].push({
          id: chipId,
          word: chipData.word,
          activities: chipData.activities
        });
      }
    }
    
    return result;
  }

  /**
   * Load chips from data (e.g., from file upload)
   */
  loadChips(words, targetActivity = 'vocabulary') {
    words.forEach(word => {
      if (typeof word === 'string' && word.trim()) {
        this.addChip(word.trim(), [targetActivity], targetActivity);
      }
    });
  }

  /**
   * Update activity states for a word group and refresh all chips in that group
   */
  updateGroupActivities(groupId, activities) {
    // Update stored activity state
    this.activityStates.set(groupId, { ...activities });
    
    // Get active activities array for color coding
    const activeActivities = Object.keys(activities).filter(key => activities[key]);
    
    // Update all chips in this group
    for (const [chipId, chipData] of this.chips) {
      if (chipData.containerId === groupId) {
        // Update chip activities
        chipData.activities = [...activeActivities];
        
        // Update visual appearance
        updateChipAppearance(chipData.element, chipData.activities);
        
        // Update activity dots if multiple activities
        this.updateChipActivityDots(chipData.element, chipData.activities);
      }
    }
    
    this.triggerChange();
  }

  /**
   * Update activity dots on a chip element
   */
  updateChipActivityDots(chipElement, activities) {
    // Remove existing dots container
    const existingDots = chipElement.querySelector('.activity-dots');
    if (existingDots) {
      existingDots.remove();
    }
    
    // Add new dots if multiple activities
    if (activities.length > 1) {
      const dotsContainer = document.createElement('div');
      dotsContainer.className = 'activity-dots';
      
      activities.forEach(activity => {
        const dot = document.createElement('div');
        dot.className = `activity-dot ${activity === 'vocabulary' ? 'vocab' : activity}`;
        dotsContainer.appendChild(dot);
      });
      
      // Insert before delete button if it exists, otherwise append
      const deleteBtn = chipElement.querySelector('.delete-btn');
      if (deleteBtn) {
        chipElement.insertBefore(dotsContainer, deleteBtn);
      } else {
        chipElement.appendChild(dotsContainer);
      }
    }
  }

  /**
   * Validate that at least one activity is enabled for a group
   */
  validateGroupActivities(activities) {
    return Object.values(activities).some(enabled => enabled);
  }

  /**
   * Get current activity states for all groups
   */
  getActivityStates() {
    return new Map(this.activityStates);
  }

  /**
   * Clear all chips
   */
  clearAll() {
    for (const chipData of this.chips.values()) {
      chipData.element.remove();
    }
    this.chips.clear();
    
    // Add empty class to all containers
    for (const container of this.containers.values()) {
      container.classList.add('empty');
    }
    
    this.triggerChange();
  }
}

// Export for ES6 modules
export {
  createWordChip,
  createChipContainer,
  ChipManager
};

// Global namespace for non-module usage
if (typeof window !== 'undefined') {
  window.ChipComponents = {
    createWordChip,
    createChipContainer,
    ChipManager
  };
}