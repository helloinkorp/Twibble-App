/**
 * Twibble Card Components
 * Implements 3 exact card variants: Default, Soft, Hover
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
 * Base Card Factory - Creates card element with design system classes
 * @param {Object} config - Card configuration
 * @param {string} config.variant - Card variant (default, soft, hover)
 * @param {string} config.content - HTML content for the card
 * @param {Function} config.onClick - Click handler for hover cards
 * @param {string} config.ariaLabel - Accessibility label
 * @param {boolean} config.focusable - Whether card should be focusable
 * @returns {HTMLElement} Card element
 */
function createCard(config = {}) {
  const {
    variant = 'default',
    content = '',
    onClick = null,
    ariaLabel = '',
    focusable = false,
    className = ''
  } = config;

  const card = document.createElement('div');
  
  // Set card class based on variant
  switch (variant) {
    case 'soft':
      card.className = `card-soft ${className}`.trim();
      break;
    case 'hover':
      card.className = `card-hover ${className}`.trim();
      if (onClick) {
        card.addEventListener('click', onClick);
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.style.cursor = 'pointer';
        
        // Keyboard navigation
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick(e);
          }
        });
      }
      break;
    default:
      card.className = `card ${className}`.trim();
  }
  
  // Set content
  if (typeof content === 'string') {
    card.innerHTML = content;
  } else if (content instanceof HTMLElement) {
    card.appendChild(content);
  }
  
  // Accessibility
  if (ariaLabel) {
    card.setAttribute('aria-label', ariaLabel);
  }
  
  if (focusable && variant !== 'hover') {
    card.setAttribute('tabindex', '0');
  }
  
  return card;
}

/**
 * Default Card - Background + Border + Shadow
 * Used for primary content containers
 * @param {Object} config - Card configuration
 * @returns {HTMLElement} Default card element
 */
function createDefaultCard(config = {}) {
  return createCard({
    variant: 'default',
    ...config
  });
}

/**
 * Card Soft - Background + No Border + No Shadow  
 * Used for nested content that needs subtle separation
 * @param {Object} config - Card configuration
 * @returns {HTMLElement} Soft card element
 */
function createSoftCard(config = {}) {
  return createCard({
    variant: 'soft',
    ...config
  });
}

/**
 * Card Hover - Interactive with Hover States
 * Transparent by default, fills background on hover
 * @param {Object} config - Card configuration
 * @returns {HTMLElement} Hover card element
 */
function createHoverCard(config = {}) {
  return createCard({
    variant: 'hover',
    focusable: true,
    ...config
  });
}

/**
 * Lesson Card - Specialized card for lesson display
 * @param {Object} config - Lesson data and configuration
 * @param {string} config.title - Lesson title
 * @param {number} config.wordCount - Number of words
 * @param {string} config.date - Date created/modified
 * @param {Array} config.activities - Activity status array
 * @param {Function} config.onEdit - Edit handler
 * @param {Function} config.onShare - Share handler
 * @param {Function} config.onDelete - Delete handler
 * @returns {HTMLElement} Lesson card element
 */
function createLessonCard(config = {}) {
  const {
    title = 'Untitled Lesson',
    wordCount = 0,
    date = new Date().toLocaleDateString(),
    activities = [],
    onEdit = () => {},
    onShare = () => {},
    onDelete = () => {},
    onClick = () => {}
  } = config;

  const content = document.createElement('div');
  
  // Header with title
  const header = document.createElement('div');
  header.className = 'flex justify-between items-start mb-3';
  
  const titleEl = document.createElement('h3');
  titleEl.textContent = title;
  titleEl.className = 'text-lg font-medium m-0';
  
  // Actions menu
  const actions = document.createElement('div');
  actions.className = 'flex gap-2';
  
  const editBtn = document.createElement('button');
  editBtn.className = 'action-btn';
  editBtn.innerHTML = '<span class="material-symbols-outlined icon">edit</span>';
  editBtn.setAttribute('aria-label', 'Edit lesson');
  editBtn.setAttribute('data-action', 'edit');
  editBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    onEdit();
  });
  
  const shareBtn = document.createElement('button');
  shareBtn.className = 'action-btn';
  shareBtn.innerHTML = '<span class="material-symbols-outlined icon">share</span>';
  shareBtn.setAttribute('aria-label', 'Share lesson');
  shareBtn.setAttribute('data-action', 'share');
  shareBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    onShare();
  });
  
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'action-btn';
  deleteBtn.innerHTML = '<span class="material-symbols-outlined icon">delete</span>';
  deleteBtn.setAttribute('aria-label', 'Delete lesson');
  deleteBtn.setAttribute('data-action', 'delete');
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    onDelete();
  });
  
  actions.appendChild(editBtn);
  actions.appendChild(shareBtn);
  actions.appendChild(deleteBtn);
  
  header.appendChild(titleEl);
  header.appendChild(actions);
  
  // Meta information
  const meta = document.createElement('div');
  meta.className = 'flex justify-between items-center text-sm text-secondary mb-4';
  
  const wordInfo = document.createElement('span');
  wordInfo.textContent = `${wordCount} words`;
  
  const dateInfo = document.createElement('span');
  dateInfo.textContent = date;
  
  meta.appendChild(wordInfo);
  meta.appendChild(dateInfo);
  
  // Activity dots
  if (activities.length > 0) {
    const activityContainer = document.createElement('div');
    activityContainer.className = 'flex gap-2 items-center';
    
    const label = document.createElement('span');
    label.className = 'text-xs text-muted mr-2';
    label.textContent = 'Activities:';
    activityContainer.appendChild(label);
    
    activities.forEach((activity, index) => {
      const dot = document.createElement('div');
      dot.className = `w-2 h-2 rounded-full ${activity.completed ? 'bg-success' : 'bg-gray-300'}`;
      dot.setAttribute('title', activity.name || `Activity ${index + 1}`);
      activityContainer.appendChild(dot);
    });
    
    content.appendChild(activityContainer);
  }
  
  content.appendChild(header);
  content.appendChild(meta);
  
  return createHoverCard({
    content: content.outerHTML,
    onClick,
    ariaLabel: `${title} lesson with ${wordCount} words, created ${date}`
  });
}

/**
 * Avatar Selection Card - For onboarding avatar picker
 * @param {Object} config - Avatar configuration
 * @param {string} config.src - Avatar image source
 * @param {string} config.alt - Avatar alt text
 * @param {boolean} config.selected - Whether avatar is selected
 * @param {Function} config.onSelect - Selection handler
 * @returns {HTMLElement} Avatar card element
 */
function createAvatarCard(config = {}) {
  const {
    src = '',
    alt = 'Avatar option',
    selected = false,
    onSelect = () => {}
  } = config;

  const content = document.createElement('div');
  content.className = 'flex flex-col items-center p-4';
  
  const img = document.createElement('img');
  img.src = src;
  img.alt = alt;
  img.className = 'w-16 h-16 rounded-full object-cover mb-2';
  
  content.appendChild(img);
  
  const card = createHoverCard({
    content: content.outerHTML,
    onClick: onSelect,
    className: selected ? 'ring-2 ring-primary ring-offset-2' : '',
    ariaLabel: `Select ${alt} avatar`
  });
  
  // Add selected state
  if (selected) {
    card.setAttribute('aria-pressed', 'true');
  }
  
  return card;
}

/**
 * Activity Day Card - For student dashboard
 * @param {Object} config - Day configuration
 * @param {number} config.day - Day number
 * @param {boolean} config.completed - Whether day is completed
 * @param {boolean} config.current - Whether this is current day
 * @param {boolean} config.locked - Whether day is locked
 * @param {Function} config.onClick - Click handler
 * @returns {HTMLElement} Day card element
 */
function createDayCard(config = {}) {
  const {
    day = 1,
    completed = false,
    current = false,
    locked = false,
    onClick = () => {}
  } = config;

  const content = document.createElement('div');
  content.className = 'flex flex-col items-center p-6';
  
  const dayNumber = document.createElement('div');
  dayNumber.className = `text-2xl font-medium mb-2 ${
    completed ? 'text-success' : 
    current ? 'text-primary' : 
    locked ? 'text-gray-400' : 'text-black'
  }`;
  dayNumber.textContent = `Day ${day}`;
  
  const status = document.createElement('div');
  status.className = 'text-sm text-center';
  
  if (completed) {
    status.innerHTML = '<span class="icon icon-small text-success">check_circle</span> Complete';
    status.className += ' text-success';
  } else if (current) {
    status.textContent = 'Continue';
    status.className += ' text-primary font-medium';
  } else if (locked) {
    status.innerHTML = '<span class="icon icon-small">lock</span> Locked';
    status.className += ' text-gray-400';
  } else {
    status.textContent = 'Start';
    status.className += ' text-black';
  }
  
  content.appendChild(dayNumber);
  content.appendChild(status);
  
  return createHoverCard({
    content: content.outerHTML,
    onClick: locked ? () => {} : onClick,
    className: locked ? 'opacity-60 cursor-not-allowed' : '',
    ariaLabel: `Day ${day} ${completed ? 'completed' : current ? 'current' : locked ? 'locked' : 'available'}`
  });
}

/**
 * Render cards to container for testing/showcase
 * @param {HTMLElement} container - Container element
 */
function renderCardShowcase(container) {
  container.innerHTML = '';
  
  const showcase = document.createElement('div');
  showcase.className = 'container p-8';
  
  const section = document.createElement('section');
  section.innerHTML = '<h2>Card Components</h2><p class="text-secondary mb-6">3 exact variants: Default, Soft, Hover</p>';
  
  // Card variants
  const variants = document.createElement('div');
  variants.className = 'grid md:grid-cols-3 gap-6 mb-8';
  
  // Default Card
  const defaultCard = createDefaultCard({
    content: `
      <h3>Default Card</h3>
      <p class="text-secondary mb-0">Background + Border + Shadow</p>
      <p class="text-small text-muted mb-0">Used for primary content containers</p>
    `
  });
  
  // Soft Card  
  const softCard = createSoftCard({
    content: `
      <h3>Soft Card</h3>
      <p class="text-secondary mb-0">Background + No Border + No Shadow</p>
      <p class="text-small text-muted mb-0">Used for nested content</p>
    `
  });
  
  // Hover Card
  const hoverCard = createHoverCard({
    content: `
      <h3>Hover Card</h3>
      <p class="text-secondary mb-0">Interactive with hover states</p>
      <p class="text-small text-muted mb-0">Click or hover to see effect</p>
    `,
    onClick: () => alert('Hover card clicked!')
  });
  
  variants.appendChild(defaultCard);
  variants.appendChild(softCard);
  variants.appendChild(hoverCard);
  
  // Specialized cards
  const specialized = document.createElement('div');
  specialized.innerHTML = '<h3 class="mb-4">Specialized Cards</h3>';
  specialized.className = 'mb-8';
  
  const specializedGrid = document.createElement('div');
  specializedGrid.className = 'grid md:grid-cols-2 gap-6';
  
  // Lesson Card
  const lessonCard = createLessonCard({
    title: 'Animal Words',
    wordCount: 15,
    date: 'Today',
    activities: [
      { name: 'Vocabulary', completed: true },
      { name: 'Phonics', completed: true },
      { name: 'Spelling', completed: false }
    ],
    onClick: () => console.log('Lesson clicked'),
    onEdit: () => console.log('Edit clicked'),
    onShare: () => console.log('Share clicked'),
    onDelete: () => console.log('Delete clicked')
  });
  
  // Day Card
  const dayCard = createDayCard({
    day: 2,
    current: true,
    onClick: () => console.log('Day 2 clicked')
  });
  
  specializedGrid.appendChild(lessonCard);
  specializedGrid.appendChild(dayCard);
  specialized.appendChild(specializedGrid);
  
  section.appendChild(variants);
  section.appendChild(specialized);
  showcase.appendChild(section);
  container.appendChild(showcase);
}

// ES6 exports
export {
  createCard,
  createDefaultCard,
  createSoftCard,
  createHoverCard,
  createLessonCard,
  createAvatarCard,
  createDayCard,
  renderCardShowcase
};

// Auto-render if script is loaded directly in HTML
if (typeof window !== 'undefined' && document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.card-showcase');
    if (container) {
      renderCardShowcase(container);
    }
  });
}