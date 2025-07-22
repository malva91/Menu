import { GAME_CONFIG, spriteLoader, initializeSprites, GameUtils, getRandomPlayerName } from './game-config.js';

// Dinosaur Game Engine - Versione Mario del Barrino
class DinosaurGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        
        // Game state
        this.currentState = GAME_CONFIG.states.WAITING;
        this.score = 0;
        this.highScore = this.loadHighScore();
        this.distanceRan = 0;
        this.currentSpeed = GAME_CONFIG.physics.initialSpeed;
        
        // Game objects
        this.player = null;
        this.horizon = null;
        this.distanceMeter = null;
        this.gameOverPanel = null;
        
        // Collections
        this.obstacles = [];
        this.powerUps = [];
        this.clouds = [];
        
        // Timing
        this.time = 0;
        this.runningTime = 0;
        this.msPerFrame = 1000 / 60; // 60 FPS
        this.lastObstacleTime = 0;
        this.lastPowerUpTime = 0;
        
        // Input handling
        this.activated = false;
        this.crashed = false;
        this.paused = false;
        this.inverted = false;
        this.invertTimer = 0;
        
        // Animation
        this.raqId = 0;
        this.playCount = 0;
        
        // Sprites loaded flag
        this.spritesLoaded = false;
        
        // Mobile support
        this.isMobile = GameUtils.isMobile();
        
        // Orientation handling
        this.orientationNotice = null;
        
        this.init();
    }

    async init() {
        console.log('🦕 [GAME] Initializing Mario game...');
        
        // Initialize translations first
        await this.initializeTranslations();
        
        // Get canvas and context
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            console.error('🦕 [GAME] Canvas not found!');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = GAME_CONFIG.canvas.width;
        this.canvas.height = GAME_CONFIG.canvas.height;
        
        // Setup orientation handling
        this.setupOrientationHandling();
        
        // Load sprites
        this.spritesLoaded = await initializeSprites();
        
        // Initialize game objects
        this.initializeGameObjects();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Setup language selector events
        this.setupLanguageSelectorEvents();
        
        // Start the game loop
        this.startGame();
        
        // Initialize leaderboard display
        this.updateGameLeaderboardDisplay();
        
        console.log('🦕 [GAME] Game initialized successfully!');
    }

    setupLanguageSelectorEvents() {
        // Language selector button
        document.getElementById('language-btn-game')?.addEventListener('click', () => {
            this.toggleLanguageSelector();
        });

        // Close language selector
        document.querySelector('#language-selector-game .close-btn')?.addEventListener('click', () => {
            this.hideLanguageSelector();
        });

        // Close modals on outside click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('language-selector-game')) {
                this.hideLanguageSelector();
            }
        });

        // Prevent modal close when clicking inside
        document.querySelector('#language-selector-game .language-content')?.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideLanguageSelector();
            }
        });
    }

    toggleLanguageSelector() {
        const selector = document.getElementById('language-selector-game');
        selector?.classList.toggle('hidden');
    }

    async initializeTranslations() {
        // Wait for Firebase service to be available
        await this.waitForFirebase();
        
        try {
            const translationsData = await window.firebaseService.getTranslations();
            this.translations = translationsData;
            
            // Initialize current language
            this.currentLanguage = localStorage.getItem('game-language') || 
                                  this.detectBrowserLanguage() || 'it';
            
            // Update UI with translations
            this.updateUITranslations();
            this.updateLanguageDisplay();
            this.setupLanguageSelector();
            
        } catch (error) {
            console.warn('🦕 [GAME] Could not load translations, using fallback');
            this.translations = this.getFallbackTranslations();
            this.currentLanguage = 'it';
        }
    }

    async waitForFirebase() {
        let attempts = 0;
        const maxAttempts = 50;
        
        while (!window.firebaseService && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.firebaseService) {
            console.warn('Firebase service not available, using fallback translations');
            return;
        }
        
        attempts = 0;
        while (!window.firebaseService.isInitialized && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
    }

    detectBrowserLanguage() {
        const browserLang = navigator.language.split('-')[0];
        const supportedLanguages = ['it', 'en', 'fr', 'de', 'es', 'pt', 'ru', 'zh', 'ja', 'ar'];
        return supportedLanguages.includes(browserLang) ? browserLang : 'it';
    }

    getFallbackTranslations() {
        return {
            it: {
                game_title: "Gioco del Dinosauro",
                game_subtitle: "Divertiti mentre aspetti il tuo ordine!",
                instructions_title: "Come Giocare",
                instruction_1: "Tocca lo schermo per saltare (o premi SPAZIO su desktop)",
                instruction_2: "Evita tavoli, pizze e mestoli per continuare a correre",
                instruction_3: "Più a lungo resisti, più alto sarà il tuo punteggio",
                instruction_4: "Tocca per ricominciare dopo il game over",
                score_label: "Punteggio",
                high_score_label: "Record",
                speed_label: "Velocità",
                game_controls_text: "Tocca lo schermo per iniziare o saltare",
                back_to_menu_text: "Torna al Menu",
                game_over_title: "Game Over!",
                new_record_title: "Nuovo Record!",
                final_score_text: "Punteggio finale:",
                restart_text: "Gioca Ancora",
                leaderboard_text: "Classifica",
                leaderboard_title: "🏆 Classifica",
                leaderboard_main_title: "🏆 Classifica Migliori Punteggi",
                no_scores_text: "Nessun punteggio salvato. Gioca per essere il primo!",
                save_score_label: "Inserisci il tuo nome per la classifica:",
                use_suggestion: "Usa questo",
                player_name_placeholder: "Il tuo nome o lascia vuoto per nome casuale",
                save_score: "Salva Punteggio",
                skip_save: "Salta",
                play_again: "Gioca Ancora",
                orientation_title: "Ruota il dispositivo",
                orientation_message: "Per una migliore esperienza di gioco, ruota il tuo dispositivo in orizzontale",
                orientation_note: "Il gioco è ottimizzato per la modalità landscape",
                continue_portrait_text: "Continua in verticale"
            },
            en: {
                game_title: "Dinosaur Game",
                game_subtitle: "Have fun while waiting for your order!",
                instructions_title: "How to Play",
                instruction_1: "Tap the screen to jump (or press SPACE on desktop)",
                instruction_2: "Avoid tables, pizzas and ladles to keep running",
                instruction_3: "The longer you survive, the higher your score",
                instruction_4: "Tap to restart after game over",
                score_label: "Score",
                high_score_label: "High Score",
                speed_label: "Speed",
                game_controls_text: "Tap the screen to start or jump",
                back_to_menu_text: "Back to Menu",
                game_over_title: "Game Over!",
                new_record_title: "New Record!",
                final_score_text: "Final score:",
                restart_text: "Play Again",
                leaderboard_text: "Leaderboard",
                leaderboard_title: "🏆 Leaderboard",
                leaderboard_main_title: "🏆 Top Scores Leaderboard",
                no_scores_text: "No scores saved. Play to be the first!",
                save_score_label: "Enter your name for the leaderboard:",
                use_suggestion: "Use this",
                player_name_placeholder: "Your name or leave empty for random name",
                save_score: "Save Score",
                skip_save: "Skip",
                play_again: "Play Again",
                orientation_title: "Rotate Device",
                orientation_message: "For a better gaming experience, rotate your device to landscape",
                orientation_note: "The game is optimized for landscape mode",
                continue_portrait_text: "Continue in Portrait"
            }
        };
    }

    updateUITranslations() {
        const t = this.translations[this.currentLanguage] || this.translations.it || {};
        
        // Update all translatable elements
        const elements = {
            'game-title': t.game_title,
            'game-subtitle': t.game_subtitle,
            'instructions-title': t.instructions_title,
            'instruction-1': t.instruction_1,
            'instruction-2': t.instruction_2,
            'instruction-3': t.instruction_3,
            'instruction-4': t.instruction_4,
            'score-label': t.score_label,
            'high-score-label': t.high_score_label,
            'speed-label': t.speed_label,
            'game-controls-text': t.game_controls_text,
            'back-to-menu-text': t.back_to_menu_text,
            'restart-text': t.restart_text,
            'leaderboard-text': t.leaderboard_text,
            'leaderboard-title': t.leaderboard_title,
            'leaderboard-main-title': t.leaderboard_main_title,
            'no-scores-text': t.no_scores_text,
            'save-score-label': t.save_score_label,
            'orientation-title': t.orientation_title,
            'orientation-message': t.orientation_message,
            'orientation-note': t.orientation_note,
            'continue-portrait-text': t.continue_portrait_text
        };

        Object.entries(elements).forEach(([id, text]) => {
            const element = document.getElementById(id);
            if (element && text) {
                element.textContent = text;
            }
        });
        
        // Update elements with data-translation attribute
        document.querySelectorAll('[data-translation]').forEach(element => {
            const key = element.dataset.translation;
            if (t[key]) {
                element.textContent = t[key];
            }
        });
        
        // Update placeholders
        document.querySelectorAll('[data-placeholder]').forEach(element => {
            const key = element.dataset.placeholder;
            if (t[key]) {
                element.placeholder = t[key];
            }
        });
    }

    updateLanguageDisplay() {
        const flags = {
            'it': '🇮🇹', 'en': '🇬🇧', 'fr': '🇫🇷', 'de': '🇩🇪',
            'es': '🇪🇸', 'pt': '🇵🇹', 'ru': '🇷🇺', 'zh': '🇨🇳',
            'ja': '🇯🇵', 'ar': '🇸🇦'
        };
        
        const currentLangElement = document.getElementById('current-language-game');
        if (currentLangElement) {
            currentLangElement.textContent = flags[this.currentLanguage] || '🇮🇹';
        }
        
        // Update HTML lang attribute
        document.documentElement.lang = this.currentLanguage;
        
        // Update RTL for Arabic
        if (this.currentLanguage === 'ar') {
            document.body.dir = 'rtl';
        } else {
            document.body.dir = 'ltr';
        }
    }

    setupLanguageSelector() {
        const languageGrid = document.getElementById('language-grid-game');
        if (!languageGrid) return;
        
        const availableLanguages = this.translations._languages ? 
            Object.keys(this.translations._languages).filter(lang => {
                const langData = this.translations._languages[lang];
                return langData && langData.active !== false;
            }) : ['it', 'en'];
        
        const languageNames = {
            'it': 'Italiano', 'en': 'English', 'fr': 'Français', 'de': 'Deutsch',
            'es': 'Español', 'pt': 'Português', 'ru': 'Русский', 'zh': '中文',
            'ja': '日本語', 'ar': 'العربية'
        };
        
        const flags = {
            'it': '🇮🇹', 'en': '🇬🇧', 'fr': '🇫🇷', 'de': '🇩🇪',
            'es': '🇪🇸', 'pt': '🇵🇹', 'ru': '🇷🇺', 'zh': '🇨🇳',
            'ja': '🇯🇵', 'ar': '🇸🇦'
        };
        
        languageGrid.innerHTML = availableLanguages
            .filter(code => languageNames[code])
            .map(code => {
                const langData = this.translations._languages?.[code] || {};
                const name = langData.name || languageNames[code];
                const flag = langData.flag || flags[code];
                
                return `
                <button class="lang-btn" data-lang="${code}">
                    ${flag} ${name}
                </button>
                `;
            }).join('');
        
        // Re-attach event listeners
        languageGrid.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = e.target.dataset.lang;
                this.changeLanguage(lang);
            });
        });
    }

    changeLanguage(lang) {
        this.currentLanguage = lang;
        localStorage.setItem('game-language', lang);
        
        this.updateLanguageDisplay();
        this.updateUITranslations();
        this.hideLanguageSelector();
    }

    hideLanguageSelector() {
        document.getElementById('language-selector-game')?.classList.add('hidden');
    }

    setupOrientationHandling() {
        if (!this.isMobile || !GAME_CONFIG.mobile.forceOrientation) return;
        
        this.orientationNotice = document.getElementById('orientation-notice');
        const continuePortraitBtn = document.getElementById('continue-portrait');
        
        // Allow continuing in portrait mode
        if (continuePortraitBtn) {
            continuePortraitBtn.addEventListener('click', () => {
                this.allowPortraitMode();
            });
        }
        
        // Check orientation on load and resize
        this.checkOrientation();
        
        // Listen for orientation changes
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.checkOrientation(), 100);
        });
        
        window.addEventListener('resize', () => {
            this.checkOrientation();
        });
    }
    
    allowPortraitMode() {
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            gameContainer.classList.add('portrait-allowed');
        }
        
        if (this.orientationNotice) {
            this.orientationNotice.classList.add('hidden');
        }
        
        // Resume game if it was paused
        if (this.paused && !this.crashed) {
            setTimeout(() => this.resume(), 500);
        }
    }
    
    checkOrientation() {
        if (!this.isMobile || !this.orientationNotice) return;
        
        const isPortrait = GameUtils.isPortrait();
        const gameContainer = document.querySelector('.game-container');
        const isPortraitAllowed = gameContainer?.classList.contains('portrait-allowed');
        
        if (isPortrait && GAME_CONFIG.mobile.showOrientationNotice && !isPortraitAllowed) {
            this.orientationNotice.classList.remove('hidden');
            // Pause game if running
            if (this.isRunning()) {
                this.pause();
            }
        } else {
            this.orientationNotice.classList.add('hidden');
            // Resume game if it was paused due to orientation
            if (this.paused && !this.crashed) {
                setTimeout(() => this.resume(), 500);
            }
        }
    }

    initializeGameObjects() {
        // Initialize Player (Mario)
        this.player = new Player(this.canvas, spriteLoader);
        
        // Initialize horizon (ground and clouds)
        this.horizon = new Horizon(this.canvas, spriteLoader);
        
        // Initialize distance meter
        this.distanceMeter = new DistanceMeter(this.canvas);
        
        // Initialize game over panel
        this.gameOverPanel = new GameOverPanel(this.canvas);
    }

    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.onKeyDown(e);
        });
        
        document.addEventListener('keyup', (e) => {
            this.onKeyUp(e);
        });
        
        // Touch/click events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleTouch(e);
        }, { passive: false });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        this.canvas.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleClick(e);
        });
        
        // Prevent context menu and scrolling
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        
        if (GAME_CONFIG.mobile.preventScroll) {
            document.addEventListener('touchmove', (e) => {
                if (e.target === this.canvas) {
                    e.preventDefault();
                }
            }, { passive: false });
        }
        
        // Visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else if (!this.crashed) {
                this.resume();
            }
        });
    }

    handleTouch(e) {
        if (!this.activated) {
            this.startGame();
        } else if (!this.crashed && !this.paused) {
            this.player.jump();
        } else if (this.crashed) {
            this.restart();
        }
    }

    handleClick(e) {
        this.handleTouch(e);
    }

    onKeyDown(e) {
        if (!this.crashed && !this.paused) {
            if (e.keyCode === 32 || e.keyCode === 38) { // Space or Up arrow
                e.preventDefault();
                
                if (!this.activated) {
                    this.startGame();
                } else {
                    this.player.jump();
                }
            }
        } else if (this.crashed && (e.keyCode === 32 || e.keyCode === 82)) { // Space or R
            e.preventDefault();
            this.restart();
        }
    }

    onKeyUp(e) {
        // Handle key up events if needed
    }

    startGame() {
        if (!this.activated) {
            this.activated = true;
            this.crashed = false;
            this.paused = false;
            this.currentState = GAME_CONFIG.states.RUNNING;
            this.runningTime = 0;
            this.time = performance.now();
            this.play();
        }
    }

    play() {
        this.update();
    }

    pause() {
        this.paused = true;
        if (this.raqId) {
            cancelAnimationFrame(this.raqId);
            this.raqId = 0;
        }
    }

    resume() {
        if (this.paused && !this.crashed) {
            this.paused = false;
            this.time = performance.now();
            this.update();
        }
    }

    update() {
        if (this.paused || this.crashed) {
            return;
        }

        const now = performance.now();
        const deltaTime = now - this.time;
        this.time = now;
        
        if (this.activated) {
            this.runningTime += deltaTime;
            
            // Clear canvas
            this.clearCanvas();
            
            // Update game speed
            this.updateSpeed();
            
            // Update game objects
            this.updateGameObjects(deltaTime);
            
            // Check collisions
            this.checkCollisions();
            
            // Draw everything
            this.draw();
            
            // Update UI
            this.updateUI();
        }
        
        if (this.activated && !this.crashed && !this.paused) {
            this.raqId = requestAnimationFrame(() => this.update());
        }
    }

    updateSpeed() {
        const timeSeconds = this.runningTime / 1000;
        this.currentSpeed = Math.min(
            GAME_CONFIG.physics.initialSpeed + timeSeconds * GAME_CONFIG.physics.acceleration,
            GAME_CONFIG.physics.maxSpeed
        );
        
        // Increase speed every 100 points
        const speedBoost = Math.floor(this.getScore() / 100) * 0.5;
        this.currentSpeed = Math.min(this.currentSpeed + speedBoost, GAME_CONFIG.physics.maxSpeed);
    }

    updateGameObjects(deltaTime) {
        // Update player
        this.player.update(deltaTime, this.currentSpeed);
        
        // Update horizon (ground and clouds)
        this.horizon.update(deltaTime, this.currentSpeed);
        
        // Update obstacles
        this.updateObstacles(deltaTime);
        
        // Update power-ups
        this.updatePowerUps(deltaTime);
        
        // Update distance
        this.distanceRan += this.currentSpeed * (deltaTime / this.msPerFrame);
        
        // Update score based on distance
        this.score = Math.floor(this.distanceRan * GAME_CONFIG.scoring.pointsPerFrame);
    }

    updateObstacles(deltaTime) {
        // Spawn new obstacles
        const spawnDelay = GameUtils.getSpawnDelay(this.currentSpeed);
        if (this.runningTime - this.lastObstacleTime > spawnDelay) {
            this.spawnObstacle();
            this.lastObstacleTime = this.runningTime;
        }
        
        // Update existing obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            obstacle.update(deltaTime, this.currentSpeed);
            
            // Remove obstacles that are off screen
            if (obstacle.x + obstacle.width < 0) {
                this.obstacles.splice(i, 1);
            }
        }
    }

    updatePowerUps(deltaTime) {
        // Spawn new power-ups
        const powerUpDelay = GameUtils.getPowerUpSpawnDelay(this.currentSpeed);
        if (this.runningTime - this.lastPowerUpTime > powerUpDelay) {
            if (Math.random() < GAME_CONFIG.obstacles.powerUpChance) {
                this.spawnPowerUp();
            }
            this.lastPowerUpTime = this.runningTime;
        }
        
        // Update existing power-ups
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            powerUp.update(deltaTime, this.currentSpeed);
            
            // Check collision with player
            if (this.player.collidesWith(powerUp)) {
                // Add points
                this.score += powerUp.points;
                // Remove power-up
                this.powerUps.splice(i, 1);
                continue;
            }
            
            // Remove power-ups that are off screen
            if (powerUp.x + powerUp.width < 0) {
                this.powerUps.splice(i, 1);
            }
        }
    }

    spawnObstacle() {
        const obstacleType = GameUtils.getRandomObstacleType();
        const obstacle = new Obstacle(obstacleType, this.canvas.width, spriteLoader);
        this.obstacles.push(obstacle);
    }

    spawnPowerUp() {
        const powerUpType = GameUtils.getRandomPowerUpType();
        const powerUp = new PowerUp(powerUpType, this.canvas.width, spriteLoader);
        this.powerUps.push(powerUp);
    }
    checkCollisions() {
        for (const obstacle of this.obstacles) {
            if (this.player.collidesWith(obstacle)) {
                this.gameOver();
                break;
            }
        }
    }

    draw() {
        // Draw horizon (ground and clouds)
        this.horizon.draw();
        
        // Draw obstacles
        this.obstacles.forEach(obstacle => obstacle.draw(this.ctx));
        
        // Draw power-ups
        this.powerUps.forEach(powerUp => powerUp.draw(this.ctx));
        
        // Draw player
        this.player.draw(this.ctx);
        
        // Draw debug info if needed (only in development)
        // Debug info removed as requested
    }
    
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Background
        this.ctx.fillStyle = GAME_CONFIG.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    updateUI() {
        // Update score display
        const scoreElement = document.getElementById('score');
        const highScoreElement = document.getElementById('highScore');
        const speedElement = document.getElementById('speed');
        
        if (scoreElement) {
            scoreElement.textContent = this.getScore();
        }
        
        if (highScoreElement) {
            highScoreElement.textContent = this.highScore;
        }
        
        if (speedElement) {
            const speedMultiplier = (this.currentSpeed / GAME_CONFIG.physics.initialSpeed).toFixed(1);
            speedElement.textContent = speedMultiplier + 'x';
        }
    }

    gameOver() {
        this.crashed = true;
        this.currentState = GAME_CONFIG.states.GAME_OVER;
        
        // Update high score
        const finalScore = this.getScore();
        if (finalScore > this.highScore) {
            this.highScore = finalScore;
            this.saveHighScore(this.highScore);
        }
        
        // Show game over
        this.showGameOverModal(finalScore);
        
        // Stop animation
        if (this.raqId) {
            cancelAnimationFrame(this.raqId);
            this.raqId = 0;
        }
    }

    showGameOverModal(finalScore) {
        const gameOverElement = document.getElementById('gameOver');
        const finalScoreElement = document.getElementById('finalScore');
        const gameOverTitle = document.getElementById('game-over-title');
        const t = this.translations[this.currentLanguage] || this.translations.it || {};
        
        if (gameOverElement) {
            gameOverElement.classList.add('show');
        }
        
        if (finalScoreElement) {
            finalScoreElement.textContent = finalScore;
        }
        
        // Check if it's a new high score
        if (finalScore > 0 && finalScore >= this.highScore) {
            if (gameOverTitle) {
                gameOverTitle.textContent = t.new_record_title || 'Nuovo Record!';
            }
            this.showSaveScoreForm(finalScore);
        } else {
            if (gameOverTitle) {
                gameOverTitle.textContent = t.game_over_title || 'Game Over!';
            }
            // Always show save score form for any score > 0
            if (finalScore > 0) {
                this.showSaveScoreForm(finalScore);
            }
        }
    }

    hideGameOver() {
        const gameOverElement = document.getElementById('gameOver');
        if (gameOverElement) {
            gameOverElement.classList.remove('show');
        }
    }

    restart() {
        // Reset game state
        this.crashed = false;
        this.activated = false;
        this.paused = false;
        this.distanceRan = 0;
        this.score = 0;
        this.currentSpeed = GAME_CONFIG.physics.initialSpeed;
        this.runningTime = 0;
        this.lastObstacleTime = 0;
        this.currentState = GAME_CONFIG.states.WAITING;
        
        // Reset game objects
        this.player.reset();
        this.horizon.reset();
        this.obstacles = [];
        this.powerUps = [];
        
        // Hide game over
        this.hideGameOver();
        
        // Clear canvas
        this.clearCanvas();
        this.draw();
        
        console.log('🦕 [GAME] Game restarted');
    }

    showSaveScoreForm(score) {
        const saveScoreDiv = document.getElementById('save-score-section');
        const randomNameText = document.getElementById('random-name-text');
        const playerNameInput = document.getElementById('player-name');
        const t = this.translations[this.currentLanguage] || this.translations.it || {};
        
        if (saveScoreDiv) {
            saveScoreDiv.style.display = 'block';
        }
        
        // Generate and show random name suggestion
        if (randomNameText) {
            const randomName = getRandomPlayerName();
            const suggestionText = t.random_name_suggestion || 'Suggerimento:';
            randomNameText.textContent = `${suggestionText} ${randomName} `;
            
            // Store the random name for use later
            if (playerNameInput) {
                playerNameInput.dataset.randomName = randomName;
            }
        }
    }

    saveScore(playerName, score) {
        try {
            let leaderboard = JSON.parse(localStorage.getItem('mario-barrino-leaderboard') || '[]');
            
            // Use random name if no name provided
            let finalName = playerName?.trim();
            if (!finalName) {
                const playerNameInput = document.getElementById('player-name');
                finalName = playerNameInput?.dataset.randomName || getRandomPlayerName();
            }
            
            const newEntry = {
                name: finalName,
                score: score,
                date: new Date().toLocaleDateString('it-IT'),
                timestamp: Date.now()
            };
            
            leaderboard.push(newEntry);
            leaderboard.sort((a, b) => {
                // Sort by score first, then by timestamp for ties
                if (b.score !== a.score) {
                    return b.score - a.score;
                }
                return a.timestamp - b.timestamp; // Earlier timestamp wins for same score
            });
            
            localStorage.setItem('mario-barrino-leaderboard', JSON.stringify(leaderboard));
            
            // Hide save form and show leaderboard
            const saveScoreDiv = document.getElementById('save-score-section');
            if (saveScoreDiv) {
                saveScoreDiv.style.display = 'none';
            }
            
            // Update the always-visible leaderboard
            this.updateGameLeaderboardDisplay();
            
            this.showLeaderboard();
            
            return true;
        } catch (error) {
            console.error('Error saving score:', error);
            return false;
        }
    }

    showLeaderboard() {
        const leaderboardModal = document.getElementById('leaderboard-modal');
        if (leaderboardModal) {
            this.updateLeaderboardDisplay();
            leaderboardModal.style.display = 'flex';
        }
    }

    updateGameLeaderboardDisplay() {
        try {
            const leaderboard = JSON.parse(localStorage.getItem('mario-barrino-leaderboard') || '[]');
            const gameLeaderboardList = document.getElementById('game-leaderboard-list');
            const t = this.translations[this.currentLanguage] || this.translations.it || {};
            
            if (gameLeaderboardList) {
                if (leaderboard.length === 0) {
                    const noScoresText = t.no_scores_text || 'Nessun punteggio salvato. Gioca per essere il primo!';
                    gameLeaderboardList.innerHTML = `<li class="no-scores-game">${noScoresText}</li>`;
                } else {
                    gameLeaderboardList.innerHTML = leaderboard.map((entry, index) => `
                        <li class="game-leaderboard-entry ${index < 3 ? 'top-' + (index + 1) : ''}">
                            <span class="rank">${index + 1}.</span>
                            <span class="name">${entry.name}</span>
                            <span class="score">${entry.score}</span>
                            <span class="date">${entry.date}</span>
                        </li>
                    `).join('');
                }
            }
        } catch (error) {
            console.error('Error updating game leaderboard:', error);
        }
    }

    updateLeaderboardDisplay() {
        try {
            const leaderboard = JSON.parse(localStorage.getItem('mario-barrino-leaderboard') || '[]');
            const leaderboardList = document.getElementById('leaderboard-list');
            const noScoresModal = document.getElementById('no-scores-modal');
            const t = this.translations[this.currentLanguage] || this.translations.it || {};
            
            if (leaderboardList) {
                if (leaderboard.length === 0) {
                    leaderboardList.style.display = 'none';
                    if (noScoresModal) {
                        noScoresModal.style.display = 'block';
                        const noScoresText = t.no_scores_modal_text || 'Nessun punteggio salvato';
                        document.getElementById('no-scores-modal-text').textContent = noScoresText;
                    }
                } else {
                    leaderboardList.style.display = 'block';
                    if (noScoresModal) {
                        noScoresModal.style.display = 'none';
                    }
                    leaderboardList.innerHTML = leaderboard.map((entry, index) => `
                        <li class="leaderboard-entry ${index < 3 ? 'top-' + (index + 1) : ''}">
                            <span class="rank">${index + 1}.</span>
                            <span class="name">${entry.name}</span>
                            <span class="score">${entry.score}</span>
                            <span class="date">${entry.date}</span>
                        </li>
                    `).join('');
                }
            }
        } catch (error) {
            console.error('Error updating leaderboard:', error);
        }
    }

    loadHighScore() {
        try {
            return parseInt(localStorage.getItem('mario-barrino-high-score') || '0');
        } catch (e) {
            return 0;
        }
    }

    saveHighScore(score) {
        try {
            localStorage.setItem('mario-barrino-high-score', score.toString());
        } catch (e) {
            console.warn('Could not save high score');
        }
    }

    // Public API
    getScore() {
        return this.score;
    }

    getHighScore() {
        return this.highScore;
    }

    isRunning() {
        return this.activated && !this.crashed && !this.paused;
    }

    isGameOver() {
        return this.crashed;
    }

    destroy() {
        if (this.raqId) {
            cancelAnimationFrame(this.raqId);
        }
        console.log('🦕 [GAME] Game destroyed');
    }
}

// Player class (Mario)
class Player {
    constructor(canvas, spriteLoader) {
        this.canvas = canvas;
        this.spriteLoader = spriteLoader;
        
        // Position and dimensions
        this.x = GAME_CONFIG.player.x;
        this.y = GAME_CONFIG.player.y;
        this.width = GAME_CONFIG.player.width;
        this.height = GAME_CONFIG.player.height;
        this.groundY = GAME_CONFIG.player.groundY;
        
        // Physics
        this.velocityY = 0;
        this.isJumping = false;
        this.isOnGround = true;
        this.lastJumpTime = 0;
        this.jumpForce = GAME_CONFIG.player.jumpPower;
        
        // Animation
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.runningSprites = [
            this.spriteLoader.getSprite('player_run1'),
            this.spriteLoader.getSprite('player_run2')
        ];
        this.jumpingSprite = this.spriteLoader.getSprite('player_jump');
        
        this.reset();
    }
    
    update(deltaTime, currentSpeed) {
        // Update animation
        this.updateAnimation(deltaTime);
        
        // Update physics
        this.updatePhysics(deltaTime);
    }
    
    updateAnimation(deltaTime) {
        if (!this.isJumping) {
            this.animationTimer += deltaTime;
            if (this.animationTimer >= GAME_CONFIG.player.sprites.animationSpeed) {
                this.animationFrame = (this.animationFrame + 1) % 2;
                this.animationTimer = 0;
            }
        }
    }
    
    updatePhysics(deltaTime) {
        if (this.isJumping) {
            // Apply gravity
            this.velocityY += GAME_CONFIG.player.gravity;
            this.y += this.velocityY;
            
            // Check if landed
            if (this.y >= this.groundY) {
                this.y = this.groundY;
                this.velocityY = 0;
                this.isJumping = false;
                this.isOnGround = true;
            }
        }
    }
    
    jump() {
        const now = performance.now();
        if (this.isOnGround && (now - this.lastJumpTime) > GAME_CONFIG.physics.jumpCooldown) {
            this.isJumping = true;
            this.isOnGround = false;
            this.velocityY = -this.jumpForce;
            this.lastJumpTime = now;
        }
    }
    
    draw(ctx) {
        let sprite = null;
        
        if (this.isJumping) {
            sprite = this.jumpingSprite;
        } else {
            sprite = this.runningSprites[this.animationFrame];
        }
        
        if (sprite && sprite.complete) {
            ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
        } else {
            // Fallback drawing
            this.drawFallback(ctx);
        }
    }
    
    drawFallback(ctx) {
        ctx.fillStyle = GAME_CONFIG.colors.player;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Simple Mario-like character
        ctx.fillStyle = '#FF0000'; // Red hat
        ctx.fillRect(this.x + 5, this.y, this.width - 10, 8);
        
        ctx.fillStyle = '#FFDBAC'; // Skin color
        ctx.fillRect(this.x + 8, this.y + 8, this.width - 16, 12);
        
        ctx.fillStyle = '#0000FF'; // Blue shirt
        ctx.fillRect(this.x + 5, this.y + 20, this.width - 10, 15);
    }
    
    collidesWith(obstacle) {
        return GameUtils.checkCollision(
            { x: this.x, y: this.y, width: this.width, height: this.height },
            obstacle,
            3 // tolerance
        );
    }
    
    reset() {
        this.x = GAME_CONFIG.player.x;
        this.y = GAME_CONFIG.player.groundY;
        this.velocityY = 0;
        this.isJumping = false;
        this.isOnGround = true;
        this.animationFrame = 0;
        this.animationTimer = 0;
    }
}

// Obstacle class
class Obstacle {
    constructor(type, canvasWidth, spriteLoader) {
        this.type = type;
        this.spriteLoader = spriteLoader;
        this.sprite = spriteLoader.getSprite(`obstacle_${type.id}`);
        
        // Position and dimensions
        this.x = canvasWidth;
        // Gestione altezze multiple per ostacoli volanti
        if (Array.isArray(type.y)) {
            this.baseY = type.y[Math.floor(Math.random() * type.y.length)];
        } else {
            this.baseY = type.y;
        }
        this.y = this.baseY;
        this.width = type.width;
        this.height = type.height;
        
        // Animation per ostacoli volanti
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.flyOffset = 0;
        this.flySpeed = type.flySpeed || 2;
        this.flyAmplitude = type.flyAmplitude || 10;
    }
    
    update(deltaTime, currentSpeed) {
        // Move obstacle
        this.x -= currentSpeed;
        
        // Animazione migliorata per ostacoli volanti
        if (this.type.canFly) {
            this.flyOffset += this.flySpeed * (deltaTime / 16.67); // Normalizzato a 60fps
            this.y = this.baseY + Math.sin(this.flyOffset * 0.1) * this.flyAmplitude;
        }
    }
    
    draw(ctx) {
        if (this.sprite && this.sprite.complete) {
            ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
        } else {
            // Fallback drawing
            this.drawFallback(ctx);
        }
    }
    
    drawFallback(ctx) {
        ctx.fillStyle = GAME_CONFIG.colors.obstacles;
        
        if (this.type.id === 'tavolo') {
            // Table
            ctx.fillRect(this.x, this.y + 20, this.width, 5); // Table top
            ctx.fillRect(this.x + 5, this.y + 25, 5, 15); // Leg 1
            ctx.fillRect(this.x + 20, this.y + 25, 5, 15); // Leg 2
        } else if (this.type.id === 'pizza') {
            // Pizza slice
            ctx.beginPath();
            ctx.moveTo(this.x, this.y + this.height);
            ctx.lineTo(this.x + this.width/2, this.y);
            ctx.lineTo(this.x + this.width, this.y + this.height);
            ctx.closePath();
            ctx.fill();
        } else if (this.type.id === 'mestolo') {
            // Ladle
            ctx.fillRect(this.x, this.y + 10, this.width - 10, 5); // Handle
            ctx.beginPath();
            ctx.arc(this.x + this.width - 8, this.y + 12, 8, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// PowerUp class
class PowerUp {
    constructor(type, canvasWidth, spriteLoader) {
        this.type = type;
        this.spriteLoader = spriteLoader;
        this.sprite = spriteLoader.getSprite(`obstacle_${type.id.replace('_powerup', '')}`);
        
        // Position and dimensions
        this.x = canvasWidth;
        // Altezza casuale tra quelle disponibili
        if (Array.isArray(type.y)) {
            this.y = type.y[Math.floor(Math.random() * type.y.length)];
        } else {
            this.y = type.y;
        }
        this.width = type.width;
        this.height = type.height;
        this.points = type.points;
        
        // Glow animation
        this.glowTimer = 0;
        this.glowIntensity = type.glowIntensity || 0.8;
        this.glowColor = type.glowColor || '#FFD700';
    }
    
    update(deltaTime, currentSpeed) {
        // Move power-up
        this.x -= currentSpeed;
        
        // Update glow animation
        this.glowTimer += deltaTime * GAME_CONFIG.powerUps.glowAnimation.speed;
        const minIntensity = GAME_CONFIG.powerUps.glowAnimation.minIntensity;
        const maxIntensity = GAME_CONFIG.powerUps.glowAnimation.maxIntensity;
        this.glowIntensity = minIntensity + (maxIntensity - minIntensity) * 
                           (Math.sin(this.glowTimer) * 0.5 + 0.5);
    }
    
    draw(ctx) {
        // Draw glow effect
        ctx.save();
        ctx.shadowColor = this.glowColor;
        ctx.shadowBlur = 15 * this.glowIntensity;
        ctx.globalAlpha = this.glowIntensity;
        
        // Draw multiple glow layers for better effect
        for (let i = 0; i < 3; i++) {
            ctx.shadowBlur = (5 + i * 5) * this.glowIntensity;
            
            if (this.sprite && this.sprite.complete) {
                ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
            } else {
                // Fallback drawing with glow
                ctx.fillStyle = this.glowColor;
                ctx.beginPath();
                ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        ctx.restore();
        
        // Draw the actual power-up (without glow)
        if (this.sprite && this.sprite.complete) {
            ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
        } else {
            // Fallback drawing
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    collidesWith(player) {
        return GameUtils.checkCollision(
            { x: this.x, y: this.y, width: this.width, height: this.height },
            { x: player.x, y: player.y, width: player.width, height: player.height },
            2 // tolerance più piccola per power-up
        );
    }
}
// Horizon class (manages ground and clouds)
class Horizon {
    constructor(canvas, spriteLoader) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.spriteLoader = spriteLoader;
        this.clouds = [];
        this.groundOffset = 0;
        
        this.initClouds();
    }
    
    initClouds() {
        for (let i = 0; i < GAME_CONFIG.clouds.count; i++) {
            this.addCloud();
        }
    }
    
    addCloud() {
        const cloud = {
            x: this.canvas.width + Math.random() * 200,
            y: GAME_CONFIG.clouds.minY + Math.random() * (GAME_CONFIG.clouds.maxY - GAME_CONFIG.clouds.minY),
            width: GAME_CONFIG.clouds.minWidth + Math.random() * (GAME_CONFIG.clouds.maxWidth - GAME_CONFIG.clouds.minWidth),
            height: GAME_CONFIG.clouds.minHeight + Math.random() * (GAME_CONFIG.clouds.maxHeight - GAME_CONFIG.clouds.minHeight),
            speed: GAME_CONFIG.clouds.minSpeed + Math.random() * (GAME_CONFIG.clouds.maxSpeed - GAME_CONFIG.clouds.minSpeed),
            sprite: this.spriteLoader.getSprite('cloud')
        };
        this.clouds.push(cloud);
    }
    
    update(deltaTime, currentSpeed) {
        // Update ground
        this.groundOffset += currentSpeed;
        if (this.groundOffset >= GAME_CONFIG.ground.patternSize) {
            this.groundOffset = 0;
        }
        
        // Update clouds
        for (let i = this.clouds.length - 1; i >= 0; i--) {
            const cloud = this.clouds[i];
            cloud.x -= cloud.speed;
            
            // Remove clouds that are off screen
            if (cloud.x + cloud.width < 0) {
                this.clouds.splice(i, 1);
                this.addCloud();
            }
        }
    }
    
    draw() {
        // Draw ground
        this.drawGround();
        
        // Draw clouds
        this.drawClouds();
    }
    
    drawGround() {
        const ground = GAME_CONFIG.ground;
        
        // Main ground
        this.ctx.fillStyle = ground.color;
        this.ctx.fillRect(0, ground.y, this.canvas.width, ground.height);
        
        // Ground pattern
        this.ctx.fillStyle = ground.patternColor;
        for (let x = -this.groundOffset; x < this.canvas.width; x += ground.patternSize) {
            this.ctx.fillRect(x, ground.y + 2, ground.patternSize / 2, 2);
        }
    }
    
    drawClouds() {
        this.clouds.forEach(cloud => {
            if (cloud.sprite && cloud.sprite.complete) {
                this.ctx.drawImage(cloud.sprite, cloud.x, cloud.y, cloud.width, cloud.height);
            } else {
                // Fallback cloud
                this.ctx.fillStyle = GAME_CONFIG.colors.clouds;
                this.ctx.beginPath();
                this.ctx.arc(cloud.x + cloud.width/4, cloud.y + cloud.height/2, cloud.width/4, 0, Math.PI * 2);
                this.ctx.arc(cloud.x + cloud.width/2, cloud.y + cloud.height/3, cloud.width/3, 0, Math.PI * 2);
                this.ctx.arc(cloud.x + cloud.width*3/4, cloud.y + cloud.height/2, cloud.width/4, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
    }
    
    reset() {
        this.clouds = [];
        this.groundOffset = 0;
        this.initClouds();
    }
}

// Distance meter class
class DistanceMeter {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
    }
    
    draw(score, highScore) {
        this.ctx.save();
        this.ctx.fillStyle = GAME_CONFIG.colors.text;
        this.ctx.font = 'bold 14px monospace';
        this.ctx.textAlign = 'right';
        
        const xPos = this.canvas.width - 10;
        const yPos = 25;
        
        // High score
        this.ctx.fillText(`HI ${highScore.toString().padStart(5, '0')}`, xPos - 80, yPos);
        
        // Current score
        this.ctx.fillText(score.toString().padStart(5, '0'), xPos, yPos);
        
        this.ctx.restore();
    }
}

// Game Over Panel class
class GameOverPanel {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
    }
    
    draw(score) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Semi-transparent overlay
        this.ctx.save();
        this.ctx.fillStyle = GAME_CONFIG.colors.gameOver;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Game over text
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', centerX, centerY - 30);
        
        this.ctx.font = '14px Arial';
        this.ctx.fillText(`Punteggio: ${score}`, centerX, centerY);
        
        this.ctx.font = '12px Arial';
        if (GameUtils.isMobile()) {
            this.ctx.fillText('Tocca per ricominciare', centerX, centerY + 30);
        } else {
            this.ctx.fillText('Premi SPAZIO o R per ricominciare', centerX, centerY + 30);
        }
        
        this.ctx.restore();
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🦕 [GAME] DOM loaded, initializing Mario game...');
    
    // Small delay to ensure all elements are ready
    setTimeout(async () => {
        window.game = new DinosaurGame();
        
        // Setup global event handlers
        const restartBtn = document.getElementById('restartBtn');
        const saveScoreBtn = document.getElementById('save-score-btn');
        const skipSaveBtn = document.getElementById('skip-save-btn');
        const leaderboardBtn = document.getElementById('leaderboard-btn');
        const playAgainBtn = document.getElementById('play-again-btn');
        const closeLeaderboard = document.querySelector('.close-leaderboard');
        const useRandomNameBtn = document.getElementById('use-random-name');
        
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                if (window.game) {
                    window.game.restart();
                }
            });
        }
        
        if (saveScoreBtn) {
            saveScoreBtn.addEventListener('click', () => {
                const playerName = document.getElementById('player-name').value;
                const finalScore = parseInt(document.getElementById('finalScore').textContent);
                if (window.game && window.game.saveScore(playerName, finalScore)) {
                    // Score saved successfully
                }
            });
        }
        
        if (skipSaveBtn) {
            skipSaveBtn.addEventListener('click', () => {
                const saveScoreDiv = document.getElementById('save-score-section');
                if (saveScoreDiv) {
                    saveScoreDiv.style.display = 'none';
                }
            });
        }
        
        if (useRandomNameBtn) {
            useRandomNameBtn.addEventListener('click', () => {
                const playerNameInput = document.getElementById('player-name');
                if (playerNameInput && playerNameInput.dataset.randomName) {
                    playerNameInput.value = playerNameInput.dataset.randomName;
                }
            });
        }
        
        if (leaderboardBtn) {
            leaderboardBtn.addEventListener('click', () => {
                if (window.game) {
                    window.game.showLeaderboard();
                }
            });
        }
        
        if (playAgainBtn) {
            playAgainBtn.addEventListener('click', () => {
                const leaderboardModal = document.getElementById('leaderboard-modal');
                if (leaderboardModal) {
                    leaderboardModal.style.display = 'none';
                }
                if (window.game) {
                    window.game.restart();
                }
            });
        }
        
        if (closeLeaderboard) {
            closeLeaderboard.addEventListener('click', () => {
                const leaderboardModal = document.getElementById('leaderboard-modal');
                if (leaderboardModal) {
                    leaderboardModal.style.display = 'none';
                }
            });
        }
        
        // Allow Enter key to save score
        const playerNameInput = document.getElementById('player-name');
        if (playerNameInput) {
            playerNameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    saveScoreBtn?.click();
                }
            });
        }
        
        // Make restart function globally available for backward compatibility
        window.restartGame = () => {
            if (window.game) {
                window.game.restart();
            }
        };
        
        console.log('🦕 [GAME] Mario game ready!');
    }, 100);
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DinosaurGame;
}