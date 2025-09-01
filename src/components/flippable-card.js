/**
 * Flippable Card Component
 * 3D flip animation card for vocabulary flashcards with full WCAG compliance
 * Includes automatic CSS injection for 3D transforms and design system integration
 */

// Import CSS if not already loaded
if (!document.querySelector('link[href*="design-system.css"]')) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '../styles/design-system.css';
  document.head.appendChild(link);
}

/**
 * Creates a flippable card component with 3D flip animation
 * @param {Object} config - Card configuration
 * @param {string} config.front - Front content (word)
 * @param {string} config.back - Back content (definition)
 * @param {boolean} config.flipped - Initial state
 * @param {Function} config.onFlip - Flip handler function
 * @param {string} config.className - Additional CSS classes
 * @returns {HTMLElement} Flippable card element with full accessibility support
 * 
 * @example
 * const card = createFlippableCard({
 *   front: 'Serendipity',
 *   back: 'The occurrence of happy or beneficial events by chance',
 *   flipped: false,
 *   onFlip: (isFlipped) => console.log('Card flipped:', isFlipped),
 *   className: 'mb-4'
 * });
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

// ES6 module export
export { createFlippableCard };