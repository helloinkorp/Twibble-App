        // Use consolidated navigation system - createHeader is now in NavigationUtils
        import '../navigation.js';
        import { createCtaButton, createSecondaryButton } from '../../components/buttons.js';
        import { createTextInput, createNumberInput } from '../../components/forms.js';
        import { ChipManager, createWordChip } from '../../components/chips.js';
        
        // Initialize ChipManager for lesson creation
        const chipManager = new ChipManager();
        
        // Role validation - must be teacher
        function validateRole() {
            const currentRole = localStorage.getItem('currentRole');
            
            // For development/testing, set default role if none exists
            if (!currentRole) {
                console.log('No role found, setting default teacher role for development');
                localStorage.setItem('currentRole', 'teacher');
                return true;
            }
            
            if (currentRole !== 'teacher') {
                alert('Access denied. This page is only available to teachers.');
                window.location.href = 'index.html';
                return false;
            }
            return true;
        }

        // Initialize page
        function initializePage() {
            console.log('Initializing create-lesson page...');
            
            // Always initialize accordion first (critical for UI)
            initializeAccordion();
            console.log('Accordion initialized');

            // Role validation (non-blocking for development)
            if (!validateRole()) {
                console.warn('Role validation failed, but continuing with UI initialization');
                // Don't return - continue with UI setup
            }

            // Setup header
            setupHeader();

            // Initialize ChipManager with containers
            initializeChipSystem();

            console.log('ChipManager initialized');
            
            // Initialize manual entry
            initializeManualEntry();
            
            // Initialize file import
            initializeFileImport();
            
            // Initialize navigation
            initializeNavigation();
            
            // Initialize auto-save
            initializeAutoSave();
            
            // Load existing draft if available
            loadExistingDraft();
        }

        // Initialize ChipManager with containers - COMPREHENSIVE FIX
        function initializeChipSystem() {
            console.log('=== INITIALIZING CHIP SYSTEM ===');
            
            // All containers to register (both manual and file upload)
            const containerConfigs = [
                // Manual Entry containers
                { groupId: 'vocabulary', containerId: 'vocabulary-chip-container', type: 'manual' },
                { groupId: 'spelling', containerId: 'spelling-chip-container', type: 'manual' },
                { groupId: 'phonics', containerId: 'phonics-chip-container', type: 'manual' },
                // File Upload containers (exist in DOM but initially hidden)
                { groupId: 'file-vocabulary', containerId: 'file-vocabulary-chip-container', type: 'file' },
                { groupId: 'file-spelling', containerId: 'file-spelling-chip-container', type: 'file' },
                { groupId: 'file-phonics', containerId: 'file-phonics-chip-container', type: 'file' }
            ];
            
            let successCount = 0;
            let totalCount = containerConfigs.length;
            
            containerConfigs.forEach(({ groupId, containerId, type }) => {
                const container = document.getElementById(containerId);
                if (container) {
                    chipManager.registerContainer(groupId, container);
                    console.log(`✅ ChipSystem: Registered ${type} container '${groupId}'`);
                    successCount++;
                } else {
                    console.error(`❌ ChipSystem: Container '${containerId}' not found!`);
                }
            });
            
            console.log(`=== CHIP SYSTEM INIT COMPLETE: ${successCount}/${totalCount} containers registered ===`);
            
            if (successCount < totalCount) {
                console.warn('Some containers failed to register - file upload may not work properly!');
            }

            // Setup change handler for auto-save, word count, and continue button
            chipManager.onChipChange((chipData) => {
                console.log('ChipManager change event triggered:', chipData);
                
                // Update word count, continue button, and trigger auto-save
                updateWordCountFromChips(chipData);
                updateContinueButton();
                triggerAutoSave();
                
                // NOTE: Word Pool updates removed from auto-change handler
                // Word Pool now updates ONLY when buttons are explicitly pressed
            });

            // Initialize dynamic activity toggle system
            initializeActivityToggleSystem();
            
            // Setup file upload drag-drop between containers
            setupFileUploadDragDrop();
        }

        // Initialize Dynamic Activity Toggle System
        function initializeActivityToggleSystem() {
            // Map group containers to their toggle IDs
            const groupToggleMap = {
                'vocabulary': ['vocab-toggle', 'vocab-spelling-toggle', 'vocab-phonics-toggle'],
                'spelling': ['spelling-vocab-toggle', 'spelling-toggle', 'spelling-phonics-toggle'],
                'phonics': ['phonics-vocab-toggle', 'phonics-spelling-toggle', 'phonics-toggle'],
                'file-vocabulary': ['file-vocab-toggle', 'file-vocab-spelling-toggle', 'file-vocab-phonics-toggle'],
                'file-spelling': ['file-spelling-vocab-toggle', 'file-spelling-toggle', 'file-spelling-phonics-toggle'],
                'file-phonics': ['file-phonics-vocab-toggle', 'file-phonics-spelling-toggle', 'file-phonics-toggle']
            };

            // Setup toggle change handlers with validation and chip updates
            Object.entries(groupToggleMap).forEach(([groupId, toggleIds]) => {
                toggleIds.forEach(toggleId => {
                    const toggle = document.getElementById(toggleId);
                    const label = document.querySelector(`label[for="${toggleId}"]`);
                    
                    if (toggle && label) {
                        toggle.addEventListener('change', (e) => {
                            handleActivityToggleChange(groupId, toggleIds, e.target);
                        });
                    }
                });
            });

            console.log('Dynamic activity toggle system initialized');
        }

        // Add all temporary words to the lesson (ChipManager)
        function addAllTempWordsToLesson() {
            let totalAdded = 0;
            
            // Process each group's temporary words
            ['vocabulary', 'spelling', 'phonics'].forEach(groupType => {
                const words = tempWordStorage[groupType];
                if (words.length > 0) {
                    // Get current activity states for this group
                    const currentActivities = getActivitiesForGroup(groupType);
                    const activeActivities = Object.keys(currentActivities).filter(key => currentActivities[key]);
                    
                    words.forEach(word => {
                        // Add chip with current activity states to ChipManager
                        chipManager.addChip(word.trim(), activeActivities, groupType);
                        totalAdded++;
                    });
                    
                    // Clear temporary storage and display
                    tempWordStorage[groupType] = [];
                    updateTempWordsDisplay(groupType);
                }
            });
            
            if (totalAdded > 0) {
                console.log(`Added ${totalAdded} words to lesson`);
                
                // Update Word Pool with all current chips
                const chipData = chipManager.getAllChips();
                updateWordPoolFromChips(chipData);
                
                // Auto-save is triggered by chipManager change handler
            }
        }

        // Handle activity toggle changes with validation and chip updates
        function handleActivityToggleChange(groupId, toggleIds, changedToggle) {
            // Get current states for this group
            const activities = {
                vocabulary: false,
                spelling: false, 
                phonics: false
            };

            // Update activity states based on toggles
            toggleIds.forEach(toggleId => {
                const toggle = document.getElementById(toggleId);
                if (toggle && toggle.checked) {
                    if (toggleId.includes('vocab') && !toggleId.includes('spelling') && !toggleId.includes('phonics')) {
                        activities.vocabulary = true;
                    } else if (toggleId.includes('spelling')) {
                        activities.spelling = true;
                    } else if (toggleId.includes('phonics')) {
                        activities.phonics = true;
                    }
                }
            });

            // Validation: Prevent all toggles from being turned off
            const hasActiveToggle = Object.values(activities).some(active => active);
            if (!hasActiveToggle) {
                // Revert the change and show warning
                changedToggle.checked = true;
                showToggleValidationWarning();
                return;
            }

            // Update visual labels
            updateToggleLabels(toggleIds, activities);

            // Update ChipManager with new activity states
            chipManager.updateGroupActivities(groupId, activities);

            console.log(`Updated ${groupId} activities:`, activities);
        }

        // Update toggle label visual states
        function updateToggleLabels(toggleIds, activities) {
            toggleIds.forEach(toggleId => {
                const toggle = document.getElementById(toggleId);
                const label = document.querySelector(`label[for="${toggleId}"]`);
                
                if (toggle && label) {
                    if (toggle.checked) {
                        label.classList.add('active');
                    } else {
                        label.classList.remove('active');
                    }
                }
            });
        }

        // Show validation warning when trying to disable all toggles
        function showToggleValidationWarning() {
            // Create a temporary warning message
            const warning = document.createElement('div');
            warning.className = 'validation-warning';
            warning.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--color-warning);
                color: white;
                padding: var(--space-3) var(--space-4);
                border-radius: 8px;
                box-shadow: var(--shadow-lg);
                z-index: 1000;
                font-family: var(--font-family-body);
                font-size: var(--font-size-sm);
                max-width: 300px;
            `;
            warning.innerHTML = `
                <strong>Validation Error:</strong><br>
                At least one activity must remain enabled for each word group.
            `;

            document.body.appendChild(warning);

            // Auto-remove after 4 seconds
            setTimeout(() => {
                if (warning.parentNode) {
                    warning.parentNode.removeChild(warning);
                }
            }, 4000);
        }
        
        // Setup consistent header
        function setupHeader() {
            const headerContainer = document.getElementById('page-header');
            
            // Load user data
            const userSettingsStr = localStorage.getItem('userSettings');
            let userSettings = null;
            if (userSettingsStr) {
                try {
                    userSettings = JSON.parse(userSettingsStr);
                } catch (error) {
                    console.error('Error parsing user settings:', error);
                }
            }
            
            const header = window.NavigationUtils.createHeader({
                showHome: true,
                user: userSettings,
                onHome: () => {
                    if (window.navigationManager) {
                        window.navigationManager.goHome();
                    } else {
                        window.location.href = 'index.html';
                    }
                },
                onProfile: () => {
                    if (window.navigationManager) {
                        window.navigationManager.goHome();
                    } else {
                        window.location.href = 'index.html';
                    }
                },
                title: ''
            });

            headerContainer.appendChild(header);
        }

        // Accordion functionality
        function initializeAccordion() {
            const accordionHeaders = document.querySelectorAll('.accordion-header');
            console.log(`Found ${accordionHeaders.length} accordion headers`);
            
            accordionHeaders.forEach((header, index) => {
                console.log(`Setting up accordion header ${index + 1}`);
                
                header.addEventListener('click', (e) => {
                    console.log('Accordion header clicked:', header.textContent.trim());
                    e.preventDefault();
                    
                    const accordionItem = header.parentElement;
                    const isActive = accordionItem.classList.contains('active');
                    
                    console.log(`Accordion item is currently: ${isActive ? 'OPEN' : 'CLOSED'}`);
                    
                    // Close all accordion items
                    document.querySelectorAll('.accordion-item').forEach(item => {
                        item.classList.remove('active');
                        const itemHeader = item.querySelector('.accordion-header');
                        if (itemHeader) {
                            itemHeader.setAttribute('aria-expanded', 'false');
                        }
                    });
                    
                    // Open clicked item if it wasn't already active
                    if (!isActive) {
                        accordionItem.classList.add('active');
                        header.setAttribute('aria-expanded', 'true');
                        console.log('Accordion item OPENED');
                    } else {
                        console.log('Accordion item CLOSED');
                    }
                });
                
                // Keyboard support
                header.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        header.click();
                    }
                });
            });
            
            console.log('Accordion initialization complete');
        }

        // Manual entry functionality with ChipManager integration
        function initializeManualEntry() {
            // Initialize word input handling for each group
            document.querySelectorAll('.word-group').forEach(wordGroup => {
                const textarea = wordGroup.querySelector('.word-input');
                const groupType = wordGroup.dataset.group;
                
                // Skip groups that don't have word input textarea elements (e.g., file upload groups)
                if (!textarea) {
                    return;
                }
                
                // Enhanced input handling - Enter key and comma separation (now stores temporarily)
                textarea.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        processInputWordsForStorage(textarea, groupType);
                    }
                });
                
                // Comma separation handling
                textarea.addEventListener('input', (e) => {
                    const value = e.target.value;
                    if (value.includes(',')) {
                        processInputWordsForStorage(textarea, groupType);
                    }
                });
                
                // Paste handling for multiple words
                textarea.addEventListener('paste', (e) => {
                    setTimeout(() => {
                        processInputWordsForStorage(textarea, groupType);
                    }, 10);
                });
            });
            
            // Setup "Add to Word Pool" button functionality for manual entry
            const addAllBtn = document.querySelector('.add-all-to-lesson-btn[data-entry-type="manual"]');
            if (addAllBtn) {
                addAllBtn.addEventListener('click', () => {
                    addAllTempWordsToLesson();
                });
            }
            
            // Setup "Add File Upload Words to Lesson" button functionality
            const fileUploadBtn = document.querySelector('.add-all-to-lesson-btn[data-entry-type="file-upload"]');
            if (fileUploadBtn) {
                fileUploadBtn.addEventListener('click', () => {
                    addAllFileUploadWordsToLesson();
                });
            }

            // Note: Activity toggle listeners are now handled by initializeActivityToggleSystem()
            // which provides validation, real-time chip updates, and visual feedback

            // Group title listeners
            document.querySelectorAll('.group-title-input').forEach(input => {
                input.addEventListener('input', () => {
                    triggerAutoSave();
                });
            });
        }

        // Store for temporary word storage before adding to lesson
        const tempWordStorage = {
            vocabulary: [],
            spelling: [],
            phonics: []
        };
        
        // Store for file upload staging before adding to lesson
        const fileUploadStorage = {
            'file-vocabulary': [],
            'file-spelling': [],
            'file-phonics': []
        };

        // Process words from input and store temporarily (no longer auto-adding to chip manager)
        function processInputWordsForStorage(textarea, groupType) {
            const words = parseWords(textarea.value);
            if (words.length > 0) {
                words.forEach(word => {
                    const cleanWord = word.trim();
                    // Add to temporary storage if not already present
                    if (!tempWordStorage[groupType].includes(cleanWord)) {
                        tempWordStorage[groupType].push(cleanWord);
                    }
                });
                textarea.value = '';
                
                // Update visual display of temporary words
                updateTempWordsDisplay(groupType);
            }
        }

        // Update display of temporary words in group containers
        function updateTempWordsDisplay(groupType) {
            const container = document.getElementById(`${groupType}-chip-container`);
            if (!container) return;
            
            // Clear existing temp chips
            container.innerHTML = '';
            
            // Add temp word chips
            tempWordStorage[groupType].forEach(word => {
                const chip = createTempWordChip(word, groupType);
                container.appendChild(chip);
            });
            
            // Remove empty class if we have words
            if (tempWordStorage[groupType].length > 0) {
                container.classList.remove('empty');
            } else {
                container.classList.add('empty');
            }
        }

        // Create temporary word chip (yellow/cream background)
        function createTempWordChip(word, groupType) {
            const chip = document.createElement('div');
            chip.className = 'word-chip temp-chip'; // Use design system class + temp identifier
            chip.textContent = word;
            chip.setAttribute('data-word', word);
            chip.setAttribute('data-group', groupType);
            
            // Add activity color class based on group type
            if (groupType === 'vocabulary') {
                chip.classList.add('vocabulary');
            } else if (groupType === 'spelling') {
                chip.classList.add('spelling');  
            } else if (groupType === 'phonics') {
                chip.classList.add('phonics');
            }
            
            // Add delete button
            const deleteBtn = document.createElement('span');
            deleteBtn.className = 'delete-btn material-symbols-outlined';
            deleteBtn.textContent = 'close';
            deleteBtn.style.fontSize = '10px';
            deleteBtn.setAttribute('aria-label', `Remove ${word}`);
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                removeTempWord(word, groupType);
            });
            
            chip.appendChild(deleteBtn);
            return chip;
        }

        // Remove word from temporary storage
        function removeTempWord(word, groupType) {
            const index = tempWordStorage[groupType].indexOf(word);
            if (index > -1) {
                tempWordStorage[groupType].splice(index, 1);
                updateTempWordsDisplay(groupType);
            }
        }
        
        // File upload staging functions - similar to manual entry staging
        
        // Add all file upload staged words to the lesson (ChipManager)
        function addAllFileUploadWordsToLesson() {
            let totalAdded = 0;
            
            // Process each file upload group's staged words
            ['file-vocabulary', 'file-spelling', 'file-phonics'].forEach(groupType => {
                const words = fileUploadStorage[groupType];
                if (words.length > 0) {
                    // Get current activity states for this group
                    const currentActivities = getActivitiesForGroup(groupType);
                    const activeActivities = Object.keys(currentActivities).filter(key => currentActivities[key]);
                    
                    words.forEach(word => {
                        // Add chip with current activity states to ChipManager
                        chipManager.addChip(word.trim(), activeActivities, groupType);
                        totalAdded++;
                    });
                    
                    // Clear staging storage and display
                    fileUploadStorage[groupType] = [];
                    updateFileUploadWordsDisplay(groupType);
                }
            });
            
            if (totalAdded > 0) {
                console.log(`Added ${totalAdded} file upload words to lesson`);
                
                // Update Word Pool with all current chips
                const chipData = chipManager.getAllChips();
                updateWordPoolFromChips(chipData);
                
                // Auto-save is triggered by chipManager change handler
            }
        }
        
        // Update display of staged file upload words in group containers
        function updateFileUploadWordsDisplay(groupType) {
            const container = document.getElementById(`${groupType}-chip-container`);
            if (!container) return;
            
            // Clear existing staged chips
            container.innerHTML = '';
            
            // Add staged word chips
            fileUploadStorage[groupType].forEach(word => {
                const chip = createFileUploadTempChip(word, groupType);
                container.appendChild(chip);
            });
            
            // Remove empty class if we have words
            if (fileUploadStorage[groupType].length > 0) {
                container.classList.remove('empty');
            } else {
                container.classList.add('empty');
            }
        }
        
        // Create temporary file upload chip (similar styling to manual entry temp chips)
        function createFileUploadTempChip(word, groupType) {
            const chip = document.createElement('div');
            chip.className = 'word-chip temp-chip'; // Use design system class + temp identifier
            chip.textContent = word;
            chip.setAttribute('data-word', word);
            chip.setAttribute('data-group', groupType);
            
            // Add activity color class based on group type
            if (groupType === 'file-vocabulary') {
                chip.classList.add('vocabulary');
            } else if (groupType === 'file-spelling') {
                chip.classList.add('spelling');  
            } else if (groupType === 'file-phonics') {
                chip.classList.add('phonics');
            }
            
            // Make chip draggable for moving between file upload grids
            chip.draggable = true;
            chip.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', word);
                e.dataTransfer.setData('source-group', groupType);
                e.dataTransfer.effectAllowed = 'move';
            });
            
            // Add delete button
            const deleteBtn = document.createElement('span');
            deleteBtn.className = 'delete-btn material-symbols-outlined';
            deleteBtn.textContent = 'close';
            deleteBtn.style.fontSize = '10px';
            deleteBtn.setAttribute('aria-label', `Remove ${word}`);
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                removeFileUploadTempWord(word, groupType);
            });
            
            chip.appendChild(deleteBtn);
            return chip;
        }
        
        // Remove word from file upload staging storage
        function removeFileUploadTempWord(word, groupType) {
            const index = fileUploadStorage[groupType].indexOf(word);
            if (index > -1) {
                fileUploadStorage[groupType].splice(index, 1);
                updateFileUploadWordsDisplay(groupType);
            }
        }
        
        // Setup drag-drop between file upload containers
        function setupFileUploadDragDrop() {
            const fileUploadContainers = [
                document.getElementById('file-vocabulary-chip-container'),
                document.getElementById('file-spelling-chip-container'),
                document.getElementById('file-phonics-chip-container')
            ];
            
            fileUploadContainers.forEach(container => {
                if (container) {
                    container.addEventListener('dragover', (e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                    });
                    
                    container.addEventListener('drop', (e) => {
                        e.preventDefault();
                        const word = e.dataTransfer.getData('text/plain');
                        const sourceGroup = e.dataTransfer.getData('source-group');
                        const targetGroup = container.getAttribute('data-group');
                        
                        if (word && sourceGroup && targetGroup && sourceGroup !== targetGroup) {
                            // Move word between file upload staging groups
                            const index = fileUploadStorage[sourceGroup].indexOf(word);
                            if (index > -1) {
                                // Remove from source
                                fileUploadStorage[sourceGroup].splice(index, 1);
                                // Add to target if not already there
                                if (!fileUploadStorage[targetGroup].includes(word)) {
                                    fileUploadStorage[targetGroup].push(word);
                                }
                                // Update both displays
                                updateFileUploadWordsDisplay(sourceGroup);
                                updateFileUploadWordsDisplay(targetGroup);
                            }
                        }
                    });
                }
            });
        }
        
        // Legacy functions removed - now using ChipManager system
        
        // Helper function to safely check toggle state
        function getToggleState(toggleId) {
            const toggle = document.getElementById(toggleId);
            return toggle ? toggle.checked : false;
        }

        // Get activities based on toggle states for a group
        function getActivitiesForGroup(groupType) {
            const activities = {
                vocabulary: false,
                spelling: false,
                phonics: false
            };
            
            if (groupType === 'vocabulary') {
                activities.vocabulary = getToggleState('vocab-toggle');
                activities.spelling = getToggleState('vocab-spelling-toggle');
                activities.phonics = getToggleState('vocab-phonics-toggle');
            } else if (groupType === 'spelling') {
                activities.vocabulary = getToggleState('spelling-vocab-toggle');
                activities.spelling = getToggleState('spelling-toggle');
                activities.phonics = getToggleState('spelling-phonics-toggle');
            } else if (groupType === 'phonics') {
                activities.vocabulary = getToggleState('phonics-vocab-toggle');
                activities.spelling = getToggleState('phonics-spelling-toggle');
                activities.phonics = getToggleState('phonics-toggle');
            } else if (groupType === 'file-vocabulary') {
                activities.vocabulary = getToggleState('file-vocab-toggle');
                activities.spelling = getToggleState('file-vocab-spelling-toggle');
                activities.phonics = getToggleState('file-vocab-phonics-toggle');
            } else if (groupType === 'file-spelling') {
                activities.vocabulary = getToggleState('file-spelling-vocab-toggle');
                activities.spelling = getToggleState('file-spelling-toggle');
                activities.phonics = getToggleState('file-spelling-phonics-toggle');
            } else if (groupType === 'file-phonics') {
                activities.vocabulary = getToggleState('file-phonics-vocab-toggle');
                activities.spelling = getToggleState('file-phonics-spelling-toggle');
                activities.phonics = getToggleState('file-phonics-toggle');
            } else if (groupType === 'file-import') {
                // Default file import to vocabulary
                activities.vocabulary = true;
            }
            
            return activities;
        }

        // File import functionality - loads directly to Vocabulary grid per PRD
        function initializeFileImport() {
            const fileDropZone = document.getElementById('fileDropZone');
            const fileInput = document.getElementById('fileInput');
            const fileStatus = document.getElementById('fileStatus');

            // Drag and drop handlers
            fileDropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                fileDropZone.classList.add('dragover');
            });

            fileDropZone.addEventListener('dragleave', (e) => {
                e.preventDefault();
                fileDropZone.classList.remove('dragover');
            });

            fileDropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                fileDropZone.classList.remove('dragover');
                
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    handleFileUpload(files[0]);
                }
            });

            // Click handler for file drop zone
            fileDropZone.addEventListener('click', (e) => {
                // Only trigger if not clicking on the actual file input
                if (e.target !== fileInput) {
                    e.preventDefault();
                    fileInput.click();
                }
            });

            // File input handler
            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    handleFileUpload(e.target.files[0]);
                }
            });

            function handleFileUpload(file) {
                if (!file.name.toLowerCase().endsWith('.txt')) {
                    showFileStatus('Error: Only TXT files are supported', 'error');
                    return;
                }

                const reader = new FileReader();
                reader.onload = (e) => {
                    const content = e.target.result;
                    const words = parseWords(content);
                    
                    if (words.length > 0) {
                        // Show File Upload word groups when words are loaded
                        const fileUploadWordGroups = document.getElementById('fileUploadWordGroups');
                        if (fileUploadWordGroups) {
                            fileUploadWordGroups.style.display = 'grid';
                            fileUploadWordGroups.classList.add('visible');
                            console.log('File upload word groups made visible');
                        } else {
                            console.error('fileUploadWordGroups element not found!');
                        }
                        
                        // FIXED: Store words in file upload staging instead of direct ChipManager
                        // Add each word to file upload staging (file-vocabulary group)
                        let successCount = 0;
                        words.forEach(word => {
                            const cleanWord = word.trim();
                            if (!fileUploadStorage['file-vocabulary'].includes(cleanWord)) {
                                fileUploadStorage['file-vocabulary'].push(cleanWord);
                                successCount++;
                            }
                        });
                        
                        // Update visual display of staged file upload words
                        updateFileUploadWordsDisplay('file-vocabulary');
                        
                        // Keep File Import accordion open to show the loaded words
                        const fileSection = document.getElementById('fileImportSection');
                        if (fileSection && !fileSection.classList.contains('active')) {
                            fileSection.querySelector('.accordion-header').click();
                        }
                        
                        showFileStatus(`Successfully loaded ${successCount} words to File Upload - Vocabulary staging from ${file.name}`, 'success');
                        console.log(`File upload staging complete: ${successCount}/${words.length} words added to staging`);
                    } else {
                        showFileStatus('No valid words found in file', 'warning');
                    }
                };
                
                reader.onerror = () => {
                    showFileStatus('Error reading file', 'error');
                };
                
                reader.readAsText(file);
            }

            function showFileStatus(message, type) {
                fileStatus.textContent = message;
                fileStatus.className = `mt-4 text-sm text-${type === 'error' ? 'error' : type === 'success' ? 'success' : 'warning'}`;
                fileStatus.style.display = 'block';
                
                setTimeout(() => {
                    fileStatus.style.display = 'none';
                }, 5000);
            }
        }

        // Update word pool display from ChipManager data - SIMPLIFIED VERSION
        // Called only from button clicks, no automatic filtering needed
        function updateWordPoolFromChips(chipData) {
            console.log('=== updateWordPoolFromChips called from button click ===');
            console.log('chipData:', chipData);
            
            const container = document.getElementById('wordChipsContainer');
            container.innerHTML = '';
            
            let totalChips = 0;
            
            // Add all chips to Word Pool (no filtering - called only when intended)
            Object.entries(chipData).forEach(([activity, chips]) => {
                chips.forEach(chipInfo => {
                    totalChips++;
                    console.log(`Adding chip to pool: ${chipInfo.word} (${chipInfo.containerId})`);
                    const poolChip = createWordPoolChip(chipInfo.word, activity, chipInfo.activities);
                    container.appendChild(poolChip);
                });
            });
            
            console.log(`Word Pool update complete: ${totalChips} chips added`);
            
            // Show empty state if no chips
            if (totalChips === 0) {
                const emptyState = document.createElement('div');
                emptyState.className = 'empty-state';
                emptyState.innerHTML = `
                    <span class="material-symbols-outlined empty-icon">auto_stories</span>
                    <p class="empty-text">No words added yet. Use the sections above to add words to your lesson.</p>
                `;
                container.appendChild(emptyState);
            }
        }

        // Create a word chip for the word pool display - Use design system createWordChip
        function createWordPoolChip(word, primaryActivity, activities) {
            // Use the design system createWordChip function for consistency
            const chipConfig = {
                word: word,
                activities: activities,
                onDelete: (chipId, word) => {
                    // Handle pool chip deletion
                    console.log(`Deleting word "${word}" from pool`);
                    // Remove from all chip managers
                    const allChips = chipManager.getAllChips();
                    Object.entries(allChips).forEach(([activity, chips]) => {
                        chips.forEach(chipInfo => {
                            if (chipInfo.word === word) {
                                chipManager.deleteChip(chipInfo.element.getAttribute('data-chip-id'));
                            }
                        });
                    });
                },
                draggable: false, // Pool chips are display-only
                id: `pool-chip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            };
            
            return createWordChip(chipConfig);
        }

        // Remove word from ChipManager
        function removeWordFromChipManager(word) {
            // Find the chip in ChipManager and remove it
            for (const [chipId, chipData] of chipManager.chips) {
                if (chipData.word === word) {
                    chipManager.deleteChip(chipId);
                    break;
                }
            }
        }

        // Update word count from ChipManager data
        function updateWordCountFromChips(chipData) {
            const totalCount = Object.values(chipData).flat().length;
            document.getElementById('wordCount').textContent = `${totalCount} word${totalCount !== 1 ? 's' : ''}`;
        }

        // Update continue button state based on ChipManager data
        function updateContinueButton() {
            const allChips = chipManager.getAllChips();
            const totalCount = Object.values(allChips).flat().length;
            const continueBtn = document.getElementById('continueBtn');
            if (continueBtn) {
                continueBtn.disabled = totalCount === 0;
            }
        }

        // Navigation functionality
        function initializeNavigation() {
            const backBtn = document.getElementById('backBtn');
            const saveDraftBtn = document.getElementById('saveDraftBtn');
            const continueBtn = document.getElementById('continueBtn');
            
            if (backBtn) {
                backBtn.addEventListener('click', () => {
                    if (window.navigationManager) {
                        window.navigationManager.goBack();
                    } else {
                        window.location.href = 'teacher-dashboard.html';
                    }
                });
            }

            if (saveDraftBtn) {
                saveDraftBtn.addEventListener('click', () => {
                    saveDraft();
                    alert('Draft saved successfully!');
                });
            }

            if (continueBtn) {
                continueBtn.addEventListener('click', () => {
                    // Placeholder for scheduling functionality
                    alert('Scheduling functionality will be available in the next phase.');
                });
            }
        }

        // Word parsing functionality
        function parseWords(text) {
            if (!text.trim()) return [];
            
            return text.split(/[\s,\n]+/)
                .map(word => word.trim().replace(/[^\w\s-']/g, ''))
                .filter(word => word.length > 0 && /[a-zA-Z]/.test(word))
                .map(word => word.toLowerCase());
        }

        // Add single word to pool with PRD-compliant visual coding
        function addWordToPool(word, groupType, activities) {
            const container = document.getElementById('wordChipsContainer');
            const emptyState = container.querySelector('.empty-state');
            
            if (emptyState) {
                emptyState.remove();
            }

            // Check if word already exists
            if (container.querySelector(`[data-word="${word}"]`)) {
                return; // Skip duplicate
            }

            // REFACTORED: Use the single, correct utility to create the chip
            const chip = createWordChip({
                word: word,
                activities: Object.keys(activities).filter(key => activities[key]),
                onDelete: () => removeWordFromPool(word),
                draggable: false
            });
            
            container.appendChild(chip);
            
            updateWordCount();
            updateContinueButton();
        }

        // Remove word from pool
        function removeWordFromPool(word) {
            const chip = document.querySelector(`[data-word="${word}"]`);
            if (chip) {
                chip.remove();
                updateWordCount();
                updateContinueButton();
                triggerAutoSave();
                
                // Show empty state if no words left
                const container = document.getElementById('wordChipsContainer');
                if (container.children.length === 0) {
                    const emptyState = document.createElement('div');
                    emptyState.className = 'empty-state';
                    emptyState.innerHTML = `
                        <span class="material-symbols-outlined empty-icon">auto_stories</span>
                        <p class="empty-text">No words added yet. Use the sections above to add words to your lesson.</p>
                    `;
                    container.appendChild(emptyState);
                }
            }
        }

        // Update word count
        function updateWordCount() {
            const chips = document.querySelectorAll('.word-chip[data-word]');
            const count = chips.length;
            document.getElementById('wordCount').textContent = `${count} word${count !== 1 ? 's' : ''}`;
        }


        // Auto-save functionality
        let autoSaveTimeout;
        function initializeAutoSave() {
            // Auto-save will be implemented in Phase 3
            console.log('Auto-save initialized (placeholder)');
        }

        function triggerAutoSave() {
            clearTimeout(autoSaveTimeout);
            autoSaveTimeout = setTimeout(() => {
                saveDraft();
            }, 2000); // Auto-save after 2 seconds of inactivity
        }

        function saveDraft() {
            const draftData = {
                id: getCurrentDraftId(),
                timestamp: Date.now(),
                words: Array.from(document.querySelectorAll('.word-chip[data-word]')).map(chip => ({
                    word: chip.dataset.word,
                    group: chip.dataset.group
                })),
                groups: Array.from(document.querySelectorAll('.word-group')).map(group => ({
                    type: group.dataset.group,
                    title: group.querySelector('.group-title-input').value,
                    active: group.querySelector('.activity-toggle').checked
                }))
            };

            localStorage.setItem('lessonDraft', JSON.stringify(draftData));
            console.log('Draft saved:', draftData);
        }

        function loadExistingDraft() {
            const draft = localStorage.getItem('lessonDraft');
            if (draft) {
                try {
                    const draftData = JSON.parse(draft);
                    // Restore draft functionality will be implemented in Phase 3
                    console.log('Draft available:', draftData);
                } catch (error) {
                    console.error('Error loading draft:', error);
                }
            }
        }

        function getCurrentDraftId() {
            let draftId = localStorage.getItem('currentDraftId');
            if (!draftId) {
                draftId = 'lesson-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
                localStorage.setItem('currentDraftId', draftId);
            }
            return draftId;
        }

        // Initialize page on DOM load
        document.addEventListener('DOMContentLoaded', initializePage);