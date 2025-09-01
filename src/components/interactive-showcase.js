/**
 * Interactive Components Showcase Renderer
 * Provides comprehensive demo and testing interface for all interactive components
 * Used for component validation and development testing
 */

// Import all interactive components
import { createWordChip } from '../utils/word-chip.js';
import { createModal } from './modal.js';
import { createFlippableCard } from './flippable-card.js';
import { createDropContainer } from './drop-container.js';
import { createLetterAssembly } from './letter-assembly.js';

// Import CSS if not already loaded
if (!document.querySelector('link[href*="design-system.css"]')) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '../styles/design-system.css';
  document.head.appendChild(link);
}

/**
 * Render interactive components to container for testing/showcase
 * @param {HTMLElement} container - Container element to render components into
 * @description Creates a comprehensive showcase of all interactive components with working examples
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