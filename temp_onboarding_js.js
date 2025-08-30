        // Onboarding state management
        class OnboardingManager {
            constructor() {
                this.currentSection = 0;
                this.sections = ['hero-section', 'name-section', 'avatar-section'];
                this.userData = {
                    name: '',
                    avatar: ''
                };
                this.init();
            }

            init() {
                this.bindEvents();
                this.loadExistingData();
            }

            bindEvents() {
                // Hero section - Get Started button
                document.getElementById('get-started-btn').addEventListener('click', () => {
                    this.nextSection();
                });

                // Name section - Input validation and Next button
                const nameInput = document.getElementById('user-name');
                const nameNextBtn = document.getElementById('name-next-btn');

                nameInput.addEventListener('input', (e) => {
                    this.validateName(e.target.value);
                });

                nameInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter' && !nameNextBtn.disabled) {
                        this.nextSection();
                    }
                });

                nameNextBtn.addEventListener('click', () => {
                    if (!nameNextBtn.disabled) {
                        this.userData.name = nameInput.value.trim();
                        this.nextSection();
                    }
                });

                // Avatar section - Avatar selection
                this.bindAvatarEvents();

                // Avatar section - Continue button
                document.getElementById('avatar-continue-btn').addEventListener('click', () => {
                    if (!document.getElementById('avatar-continue-btn').disabled) {
                        this.completeOnboarding();
                    }
                });
            }

            bindAvatarEvents() {
                const avatarGrid = document.getElementById('avatar-grid');
                const avatarOptions = avatarGrid.querySelectorAll('.avatar-option');
                const uploadInput = document.getElementById('avatar-upload');

                // Avatar selection
                avatarOptions.forEach((option, index) => {
                    if (!option.classList.contains('avatar-upload')) {
                        option.addEventListener('click', () => {
                            this.selectAvatar(option);
                        });

                        option.addEventListener('keydown', (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                this.selectAvatar(option);
                            }
                        });
                    }
                });

                // Upload handling
                uploadInput.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        this.handleAvatarUpload(file);
                    }
                });

                // Keyboard navigation for avatar grid
                this.setupAvatarKeyboardNavigation();
            }

            setupAvatarKeyboardNavigation() {
                const avatarOptions = Array.from(document.querySelectorAll('.avatar-option'));
                
                avatarOptions.forEach((option, index) => {
                    option.addEventListener('keydown', (e) => {
                        let newIndex = index;
                        
                        switch (e.key) {
                            case 'ArrowRight':
                                e.preventDefault();
                                newIndex = (index + 1) % avatarOptions.length;
                                break;
                            case 'ArrowLeft':
                                e.preventDefault();
                                newIndex = index === 0 ? avatarOptions.length - 1 : index - 1;
                                break;
                            case 'ArrowDown':
                                e.preventDefault();
                                newIndex = Math.min(index + 5, avatarOptions.length - 1);
                                break;
                            case 'ArrowUp':
                                e.preventDefault();
                                newIndex = Math.max(index - 5, 0);
                                break;
                        }
                        
                        if (newIndex !== index) {
                            avatarOptions[newIndex].focus();
                            // Update tabindex
                            avatarOptions.forEach((opt, i) => {
                                opt.tabIndex = i === newIndex ? 0 : -1;
                            });
                        }
                    });
                });
            }

            validateName(value) {
                const nameNextBtn = document.getElementById('name-next-btn');
                const nameError = document.getElementById('name-error');
                const trimmedValue = value.trim();

                if (trimmedValue.length >= 2) {
                    nameNextBtn.disabled = false;
                    nameNextBtn.classList.remove('btn-disabled');
                    nameNextBtn.setAttribute('aria-disabled', 'false');
                    nameError.style.display = 'none';
                    return true;
                } else {
                    nameNextBtn.disabled = true;
                    nameNextBtn.classList.add('btn-disabled');
                    nameNextBtn.setAttribute('aria-disabled', 'true');
                    if (trimmedValue.length > 0) {
                        nameError.textContent = 'Name must be at least 2 characters long';
                        nameError.style.display = 'block';
                    } else {
                        nameError.style.display = 'none';
                    }
                    return false;
                }
            }

            selectAvatar(option) {
                // Clear previous selections
                document.querySelectorAll('.avatar-option').forEach(opt => {
                    opt.classList.remove('selected');
                    opt.setAttribute('aria-checked', 'false');
                    opt.tabIndex = -1;
                });

                // Set new selection
                option.classList.add('selected');
                option.setAttribute('aria-checked', 'true');
                option.tabIndex = 0;
                option.focus();

                // Get avatar source
                const avatarSrc = option.dataset.avatar || (option.querySelector('img') && option.querySelector('img').src);
                this.userData.avatar = avatarSrc;

                // Enable continue button
                const continueBtn = document.getElementById('avatar-continue-btn');
                continueBtn.disabled = false;
                continueBtn.classList.remove('btn-disabled');
                continueBtn.setAttribute('aria-disabled', 'false');
            }

            handleAvatarUpload(file) {
                const reader = new FileReader();
                const uploadOption = document.querySelector('.avatar-upload');

                reader.onload = (e) => {
                    const result = e.target.result;
                    
                    // Create image element for uploaded avatar
                    const img = document.createElement('img');
                    img.src = result;
                    img.alt = 'Custom uploaded avatar';
                    
                    // Clear upload content and add image
                    uploadOption.innerHTML = '';
                    uploadOption.appendChild(img);
                    uploadOption.dataset.avatar = result;
                    
                    // Select this avatar
                    this.selectAvatar(uploadOption);
                };

                reader.readAsDataURL(file);
            }

            nextSection() {
                if (this.currentSection < this.sections.length - 1) {
                    // Hide current section
                    const currentEl = document.getElementById(this.sections[this.currentSection]);
                    const currentTransition = currentEl.querySelector('.section-transition');
                    
                    currentTransition.classList.remove('show');
                    
                    setTimeout(() => {
                        currentEl.classList.remove('active');
                        
                        // Show next section
                        this.currentSection++;
                        const nextEl = document.getElementById(this.sections[this.currentSection]);
                        const nextTransition = nextEl.querySelector('.section-transition');
                        
                        nextEl.classList.add('active');
                        
                        // Focus management
                        this.manageFocus();
                        
                        setTimeout(() => {
                            nextTransition.classList.add('show');
                        }, 50);
                    }, 200);
                }
            }

            manageFocus() {
                // Set focus to appropriate element in new section
                switch (this.currentSection) {
                    case 1: // Name section
                        document.getElementById('user-name').focus();
                        break;
                    case 2: // Avatar section
                        document.querySelector('.avatar-option[tabindex="0"]').focus();
                        break;
                }
            }

            loadExistingData() {
                // Check if user has already completed onboarding
                try {
                    const existingData = localStorage.getItem('userSettings');
                    if (existingData) {
                        const userData = JSON.parse(existingData);
                        // If complete profile exists, redirect to role selection
                        if (userData.name && userData.avatar) {
                            if (window.navigationManager) {
                                window.navigationManager.navigate('index.html', true);
                            } else {
                                window.location.href = 'index.html';
                            }
                            return;
                        }
                    }
                } catch (error) {
                    console.warn('Could not load existing user data:', error);
                }
            }

            completeOnboarding() {
                // Validate user data before proceeding
                if (!this.userData.name || !this.userData.avatar) {
                    alert('Please complete all required fields before continuing.');
                    return;
                }
                
                // Show loading state
                this.showLoadingState();
                
                // Set up safety timeout in case navigation fails
                const safetyTimeout = setTimeout(() => {
                    console.warn('Navigation timeout reached, forcing direct redirect');
                    window.location.href = 'index.html';
                }, 5000);
                
                // Save user data to localStorage
                try {
                    const userSettings = {
                        name: this.userData.name.trim(),
                        avatar: this.userData.avatar,
                        createdAt: new Date().toISOString(),
                        onboardingCompleted: true
                    };

                    // Validate userSettings structure
                    if (!userSettings.name || !userSettings.avatar) {
                        throw new Error('Invalid user data structure');
                    }

                    // Save to localStorage first (critical step)
                    localStorage.setItem('userSettings', JSON.stringify(userSettings));
                    
                    // Verify the data was saved correctly
                    const savedData = localStorage.getItem('userSettings');
                    if (!savedData) {
                        throw new Error('Failed to save user settings to localStorage');
                    }
                    
                    const parsedData = JSON.parse(savedData);
                    if (!parsedData.name || !parsedData.avatar || !parsedData.onboardingCompleted) {
                        throw new Error('Saved user settings are incomplete');
                    }
                    
                    console.log('User settings saved successfully:', userSettings);
                    
                    // Brief delay to show loading state, then redirect
                    setTimeout(() => {
                        clearTimeout(safetyTimeout);
                        
                        // Use navigation manager if available for better UX
                        if (window.navigationManager && typeof window.navigationManager.navigate === 'function') {
                            console.log('Using navigation manager for redirect');
                            try {
                                window.navigationManager.navigate('index.html', true);
                            } catch (navError) {
                                console.warn('Navigation manager failed, using direct navigation:', navError);
                                window.location.href = 'index.html';
                            }
                        } else {
                            // Direct navigation as fallback
                            console.log('Using direct navigation');
                            window.location.href = 'index.html';
                        }
                    }, 800);
                    
                } catch (error) {
                    clearTimeout(safetyTimeout);
                    console.error('Failed to save user settings:', error);
                    this.hideLoadingState();
                    
                    // Provide specific error messages based on the error type
                    if (!this.isLocalStorageAvailable()) {
                        alert('Your browser\'s storage is disabled or full. Please enable cookies and local storage, or try clearing your browser data.');
                    } else if (error.name === 'QuotaExceededError') {
                        alert('Your browser\'s storage is full. Please clear some data and try again.');
                    } else if (error.message.includes('Invalid user data')) {
                        alert('There was an issue with your profile data. Please refresh and try again.');
                    } else {
                        alert('There was an error saving your profile. Please try again.');
                    }
                }
            }

            showLoadingState() {
                const continueBtn = document.getElementById('avatar-continue-btn');
                const continueText = document.getElementById('continue-btn-text');
                const loadingText = document.getElementById('loading-text');
                
                if (continueBtn && continueText && loadingText) {
                    continueBtn.disabled = true;
                    continueBtn.classList.add('btn-disabled');
                    continueText.style.display = 'none';
                    loadingText.style.display = 'inline';
                }
            }

            hideLoadingState() {
                const continueBtn = document.getElementById('avatar-continue-btn');
                const continueText = document.getElementById('continue-btn-text');
                const loadingText = document.getElementById('loading-text');
                
                if (continueBtn && continueText && loadingText) {
                    continueBtn.disabled = false;
                    continueBtn.classList.remove('btn-disabled');
                    continueText.style.display = 'inline';
                    loadingText.style.display = 'none';
                }
            }

            isLocalStorageAvailable() {
                try {
                    const test = '__localStorage_test__';
                    localStorage.setItem(test, test);
                    localStorage.removeItem(test);
                    return true;
                } catch (e) {
                    return false;
                }
            }
        }

