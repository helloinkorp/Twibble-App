/**
 * Unified Avatar Component for Twibble
 * Ensures consistent avatar display across all contexts (header, modal, profile, etc.)
 * Uses design system CSS custom properties instead of Tailwind classes
 */

/**
 * Create Avatar Component
 * @param {Object} config - Avatar configuration
 * @param {Object} config.user - User data with name and avatar
 * @param {number} config.size - Avatar size in pixels (default: 40)
 * @param {string} config.className - Additional CSS classes
 * @param {boolean} config.showBorder - Whether to show border (default: true)
 * @returns {HTMLElement} Avatar element (img or div with initials)
 */
function createAvatar(config = {}) {
  const {
    user = null,
    size = 40,
    className = '',
    showBorder = true
  } = config;

  if (!user || !user.name) {
    console.warn('Avatar component: No user data or name provided');
    return createFallbackAvatar({ name: 'U', size, className, showBorder });
  }

  // Create container for avatar
  const container = document.createElement('div');
  container.className = `avatar-container ${className}`.trim();
  container.style.cssText = `
    width: ${size}px;
    height: ${size}px;
    border-radius: 50%;
    overflow: hidden;
    display: inline-block;
    position: relative;
  `;

  let avatarElement;

  if (user.avatar && user.avatar.trim()) {
    console.log(`Avatar component: Creating image avatar for ${user.name}`);
    
    // Create image element
    const avatar = document.createElement('img');
    avatar.src = user.avatar.trim();
    avatar.alt = `${user.name}'s avatar`;
    avatar.className = 'avatar-image';
    avatar.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      ${showBorder ? `border: 1px solid var(--color-gray-200);` : ''}
    `;
    
    // Error handling - fallback to initials
    avatar.addEventListener('error', function() {
      console.warn(`Avatar component: Image failed to load for ${user.name}, showing initials`);
      const fallback = createFallbackElement(user.name, size, showBorder);
      container.replaceChild(fallback, this);
    });

    // Success logging
    avatar.addEventListener('load', function() {
      console.log(`Avatar component: Image loaded successfully for ${user.name}`);
    });

    avatarElement = avatar;
  } else {
    console.log(`Avatar component: No avatar URL, creating initials for ${user.name}`);
    avatarElement = createFallbackElement(user.name, size, showBorder);
  }

  container.appendChild(avatarElement);
  
  // Add accessibility attributes
  container.setAttribute('role', 'img');
  container.setAttribute('aria-label', `${user.name}'s profile picture`);

  return container;
}

/**
 * Create fallback avatar with user initials
 * @param {string} name - User name
 * @param {number} size - Avatar size in pixels
 * @param {boolean} showBorder - Whether to show border
 * @returns {HTMLElement} Fallback avatar element
 */
function createFallbackElement(name, size, showBorder) {
  const fallback = document.createElement('div');
  fallback.className = 'avatar-fallback';
  
  // Calculate font size based on avatar size
  const fontSize = Math.max(Math.floor(size * 0.35), 12);
  
  fallback.style.cssText = `
    width: 100%;
    height: 100%;
    background: var(--color-primary);
    ${showBorder ? `border: 1px solid var(--color-gray-200);` : ''}
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: ${fontSize}px;
    font-weight: 500;
    color: white;
    font-family: var(--font-family-headers);
  `;
  
  // Get initials from name
  const initials = getInitials(name);
  fallback.textContent = initials;
  fallback.setAttribute('aria-label', `${name} avatar (initials: ${initials})`);
  
  return fallback;
}

/**
 * Create fallback avatar when no user data is provided
 * @param {Object} config - Fallback config
 * @returns {HTMLElement} Fallback avatar element
 */
function createFallbackAvatar(config) {
  const { name, size, className, showBorder } = config;
  
  const container = document.createElement('div');
  container.className = `avatar-container avatar-fallback-container ${className}`.trim();
  container.style.cssText = `
    width: ${size}px;
    height: ${size}px;
    border-radius: 50%;
    overflow: hidden;
    display: inline-block;
  `;

  const fallback = createFallbackElement(name, size, showBorder);
  container.appendChild(fallback);
  
  return container;
}

/**
 * Extract initials from a name
 * @param {string} name - Full name
 * @returns {string} Initials (1-2 characters)
 */
function getInitials(name) {
  if (!name || typeof name !== 'string') return 'U';
  
  const words = name.trim().split(/\s+/);
  
  if (words.length === 1) {
    // Single word - take first character
    return words[0].charAt(0).toUpperCase();
  } else {
    // Multiple words - take first character of first and last word
    const first = words[0].charAt(0).toUpperCase();
    const last = words[words.length - 1].charAt(0).toUpperCase();
    return first + last;
  }
}

/**
 * Update an existing avatar component with new user data
 * @param {HTMLElement} avatarElement - Existing avatar element
 * @param {Object} user - New user data
 */
function updateAvatar(avatarElement, user) {
  if (!avatarElement || !avatarElement.classList.contains('avatar-container')) {
    console.warn('Avatar component: Invalid avatar element for update');
    return;
  }

  // Get current size from container
  const size = parseInt(avatarElement.style.width) || 40;
  const showBorder = avatarElement.querySelector('.avatar-image, .avatar-fallback').style.border.includes('solid');
  const className = avatarElement.className.replace('avatar-container', '').trim();

  // Create new avatar
  const newAvatar = createAvatar({ user, size, className, showBorder });
  
  // Replace content
  avatarElement.innerHTML = newAvatar.innerHTML;
  avatarElement.setAttribute('aria-label', newAvatar.getAttribute('aria-label'));
}

/**
 * Create consistent avatar styles for the design system
 * @returns {string} CSS styles for avatar components
 */
function getAvatarStyles() {
  return `
    .avatar-container {
      border-radius: 50%;
      overflow: hidden;
      display: inline-block;
      position: relative;
      flex-shrink: 0;
    }

    .avatar-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .avatar-fallback {
      width: 100%;
      height: 100%;
      background: var(--color-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 500;
      color: white;
      font-family: var(--font-family-headers);
    }

    .avatar-container:hover {
      transform: scale(1.05);
      transition: transform 0.2s ease;
    }

    .avatar-container:focus {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }
  `;
}

/**
 * Avatar component sizes preset
 */
const AVATAR_SIZES = {
  xs: 24,    // Small icons
  sm: 32,    // Compact lists
  md: 40,    // Navigation header (default)
  lg: 64,    // Profile cards
  xl: 80,    // Settings modal
  '2xl': 120 // Profile pages
};

// ES6 exports
export {
  createAvatar,
  updateAvatar,
  getAvatarStyles,
  getInitials,
  AVATAR_SIZES
};

// Auto-inject avatar styles if not already present
if (typeof document !== 'undefined') {
  const existingStyles = document.querySelector('#avatar-component-styles');
  if (!existingStyles) {
    const styleElement = document.createElement('style');
    styleElement.id = 'avatar-component-styles';
    styleElement.textContent = getAvatarStyles();
    document.head.appendChild(styleElement);
  }
}

// Global namespace for non-module usage
if (typeof window !== 'undefined') {
  window.AvatarComponent = {
    createAvatar,
    updateAvatar,
    getAvatarStyles,
    getInitials,
    AVATAR_SIZES
  };
}