// Game Engine - Sistema di gioco ottimizzato con traduzioni strutturate
import { GAME_CONFIG, GameUtils, spriteLoader, initializeSprites, getRandomPlayerName } from './game-config.js';

class GameEngine {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.gameState = GAME_CONFIG.states.WAITING;
        this.score = 0;
        this.highScore = 0;
        this.speed = GAME_CONFIG.physics.initialSpeed;
        this.frameCount = 0;
        this.lastJumpTime = 0;
        
        // Game objects
        this.player = null;
        this.obstacles = [];
        this.powerUps = [];
        this.clouds = [];
        this.ground = null;
        
        // Animation
        this.animationId = null;
        this.lastObstacleSpawn = 0;
        this.lastPowerUpSpawn = 0;
        
        // Sprites and animation
        this.playerAnimationFrame = 0;
        this.lastPlayerAnimationTime = 0;
        
        // Mobile support
        this.isMobile = GameUtils.isMobile();
        this.isPortraitAllowed = false;
        
        // Translations
        this.translations = {};
        this.currentLanguage = 'it';
        
        this.init();
    }
    
    async init() {
        console.log('🎮 [GAME] Initializing game engine...');
        
        // Load translations first
        await this.loadTranslations();
        
        // Initialize canvas
        this.initCanvas();
        
        // Initialize game objects
        this.initGameObjects();
        
        // Load sprites
        await initializeSprites();
        
        // Initialize controls
        this.initControls();
        
        // Load high score
        this.loadHighScore();
        
        // Handle orientation
        this.handleOrientation();
        
        // Update UI with translations
        this.updateUITranslations();
        
        // Start game loop
        this.gameLoop();
        
        console.log('🎮 [GAME] Game engine initialized successfully');
    }
    
    async loadTranslations() {
        // Get current language from localStorage or detect browser language
        this.currentLanguage = localStorage.getItem('game-language') || 
                              this.detectBrowserLanguage() || 'it';
        
        try {
            // Wait for Firebase service to be available
            await this.waitForFirebase();
            
            const translationsData = await window.firebaseService.getTranslations();
            this.translations = translationsData;
            
            console.log('🌍 [GAME] Translations loaded for language:', this.currentLanguage);
        } catch (error) {
            console.warn('🌍 [GAME] Could not load translations, using fallback');
            this.translations = this.getFallbackTranslations();
        }
    }
    
    async waitForFirebase() {
        let attempts = 0;
        const maxAttempts = 50;
        
        while (!window.firebaseService && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (window.firebaseService) {
            // Wait for Firebase to be initialized
            attempts = 0;
            while (!window.firebaseService.isInitialized && attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
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
                game: {
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
                    final_score_text: "Punteggio finale:",
                    restart_text: "Gioca Ancora",
                    leaderboard_text: "Classifica",
                    leaderboard_main_title: "🏆 Classifica Migliori Punteggi",
                    no_scores_text: "Nessun punteggio salvato. Gioca per essere il primo!",
                    save_score_label: "Inserisci il tuo nome per la classifica:",
                    use_suggestion: "Usa questo",
                    player_name_placeholder: "Il tuo nome o lascia vuoto per nome casuale",
                    save_score: "Salva Punteggio",
                    skip_save: "Salta",
                    orientation_title: "Ruota il dispositivo",
                    orientation_message: "Per una migliore esperienza di gioco, ruota il tuo dispositivo in orizzontale",
                    orientation_note: "Il gioco è ottimizzato per la modalità landscape",
                    continue_portrait_text: "Continua in verticale",
                    random_name_suggestion: "Suggerimento:"
                }
            },
            en: {
                game: {
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
                    final_score_text: "Final score:",
                    restart_text: "Play Again",
                    leaderboard_text: "Leaderboard",
                    leaderboard_main_title: "🏆 Top Scores Leaderboard",
                    no_scores_text: "No scores saved. Play to be the first!",
                    save_score_label: "Enter your name for the leaderboard:",
                    use_suggestion: "Use this",
                    player_name_placeholder: "Your name or leave empty for random name",
                    save_score: "Save Score",
                    skip_save: "Skip",
                    orientation_title: "Rotate Device",
                    orientation_message: "For a better gaming experience, rotate your device to landscape",
                    orientation_note: "The game is optimized for landscape mode",
                    continue_portrait_text: "Continue in Portrait",
                    random_name_suggestion: "Suggestion:"
                }
            }
        };
    }
    
    // Get translation helper
    t(key) {
        const langTranslations = this.translations[this.currentLanguage] || this.translations.it || {};
        
        // Try structured approach first
        if (langTranslations.game && langTranslations.game[key]) {
            return langTranslations.game[key];
        }
        
        // Fallback to flat structure for backward compatibility
        return langTranslations[key] || key;
    }
    
    updateUITranslations() {
        // Update all game UI elements with translations
        const elements = {
            'game-title': this.t('game_title'),
            'game-subtitle': this.t('game_subtitle'),
            'instructions-title': this.t('instructions_title'),
            'instruction-1': this.t('instruction_1'),
            'instruction-2': this.t('instruction_2'),
            'instruction-3': this.t('instruction_3'),
            'instruction-4': this.t('instruction_4'),
            'score-label': this.t('score_label'),
            'high-score-label': this.t('high_score_label'),
            'speed-label': this.t('speed_label'),
            'game-controls-text': this.t('game_controls_text'),
            'back-to-menu-text': this.t('back_to_menu_text'),
            'game-over-title': this.t('game_over_title'),
            'final-score-text': this.t('final_score_text'),
            'restart-text': this.t('restart_text'),
            'leaderboard-text': this.t('leaderboard_text'),
            'leaderboard-main-title': this.t('leaderboard_main_title'),
            'no-scores-text': this.t('no_scores_text'),
            'save-score-label': this.t('save_score_label'),
            'use-random-name': this.t('use_suggestion'),
            'save-score-btn': this.t('save_score'),
            'skip-save-btn': this.t('skip_save'),
            'orientation-title': this.t('orientation_title'),
            'orientation-message': this.t('orientation_message'),
            'orientation-note': this.t('orientation_note'),
            'continue-portrait-text': this.t('continue_portrait_text'),
            'random-name-text': this.t('random_name_suggestion')
        };
        
        Object.entries(elements).forEach(([id, text]) => {
            const element = document.getElementById(id);
            if (element && text) {
                element.textContent = text;
            }
        });
        
        // Update placeholder
        const playerNameInput = document.getElementById('player-name');
        if (playerNameInput) {
            playerNameInput.placeholder = this.t('player_name_placeholder');
        }
    }
    
    initCanvas() {
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            console.error('🎮 [GAME] Canvas element not found');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = GAME_CONFIG.canvas.width;
        this.canvas.height = GAME_CONFIG.canvas.height;
        
        console.log('🎮 [GAME] Canvas initialized:', this.canvas.width, 'x', this.canvas.height);
    }
    
    initGameObjects() {
        // Initialize player
        this.player = {
            x: GAME_CONFIG.player.x,
            y: GAME_CONFIG.player.y,
            width: GAME_CONFIG.player.width,
            height: GAME_CONFIG.player.height,
            velocityY: 0,
            isJumping: false,
            isOnGround: true
        };
        
        // Initialize ground
        this.ground = {
            x: GAME_CONFIG.ground.x,
            y: GAME_CONFIG.ground.y,
            width: GAME_CONFIG.ground.width,
            height: GAME_CONFIG.ground.height
        };
        
        // Initialize clouds
        this.initClouds();
        
        console.log('🎮 [GAME] Game objects initialized');
    }
    
    initClouds() {
        this.clouds = [];
        for (let i = 0; i < GAME_CONFIG.clouds.count; i++) {
            this.clouds.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * (GAME_CONFIG.clouds.maxY - GAME_CONFIG.clouds.minY) + GAME_CONFIG.clouds.minY,
                width: Math.random() * (GAME_CONFIG.clouds.maxWidth - GAME_CONFIG.clouds.minWidth) + GAME_CONFIG.clouds.minWidth,
                height: Math.random() * (GAME_CONFIG.clouds.maxHeight - GAME_CONFIG.clouds.minHeight) + GAME_CONFIG.clouds.minHeight,
                speed: Math.random() * (GAME_CONFIG.clouds.maxSpeed - GAME_CONFIG.clouds.minSpeed) + GAME_CONFIG.clouds.minSpeed
            });
        }
    }
    
    initControls() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.handleJump();
            }
        });
        
        // Touch controls
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleJump();
        });
        
        // Mouse controls
        this.canvas.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleJump();
        });
        
        // Prevent context menu on long press
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        
        console.log('🎮 [GAME] Controls initialized');
    }
    
    handleOrientation() {
        if (!this.isMobile) return;
        
        const orientationNotice = document.getElementById('orientation-notice');
        const gameContainer = document.querySelector('.game-container');
        const continuePortraitBtn = document.getElementById('continue-portrait');
        
        const checkOrientation = () => {
            if (GameUtils.isPortrait() && !this.isPortraitAllowed) {
                orientationNotice?.classList.remove('hidden');
                gameContainer?.classList.remove('portrait-allowed');
            } else {
                orientationNotice?.classList.add('hidden');
                if (this.isPortraitAllowed) {
                    gameContainer?.classList.add('portrait-allowed');
                }
            }
        };
        
        // Continue in portrait button
        continuePortraitBtn?.addEventListener('click', () => {
            this.isPortraitAllowed = true;
            checkOrientation();
        });
        
        // Check orientation on load and resize
        checkOrientation();
        window.addEventListener('orientationchange', () => {
            setTimeout(checkOrientation, 100);
        });
        window.addEventListener('resize', checkOrientation);
    }
    
    handleJump() {
        const now = Date.now();
        
        if (this.gameState === GAME_CONFIG.states.WAITING) {
            this.startGame();
            return;
        }
        
        if (this.gameState === GAME_CONFIG.states.GAME_OVER) {
            this.restartGame();
            return;
        }
        
        if (this.gameState === GAME_CONFIG.states.RUNNING && 
            this.player.isOnGround && 
            now - this.lastJumpTime > GAME_CONFIG.physics.jumpCooldown) {
            
            this.player.velocityY = -GAME_CONFIG.player.jumpPower;
            this.player.isJumping = true;
            this.player.isOnGround = false;
            this.lastJumpTime = now;
        }
    }
    
    startGame() {
        this.gameState = GAME_CONFIG.states.RUNNING;
        this.score = 0;
        this.speed = GAME_CONFIG.physics.initialSpeed;
        this.obstacles = [];
        this.powerUps = [];
        this.frameCount = 0;
        this.lastObstacleSpawn = 0;
        this.lastPowerUpSpawn = 0;
        
        // Reset player position
        this.player.y = GAME_CONFIG.player.groundY;
        this.player.velocityY = 0;
        this.player.isJumping = false;
        this.player.isOnGround = true;
        
        console.log('🎮 [GAME] Game started');
    }
    
    restartGame() {
        // Hide game over screen
        document.getElementById('gameOver')?.classList.remove('show');
        document.getElementById('save-score-section').style.display = 'none';
        document.getElementById('default-buttons').style.display = 'flex';
        
        this.startGame();
    }
    
    gameLoop() {
        this.update();
        this.render();
        
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        if (this.gameState !== GAME_CONFIG.states.RUNNING) return;
        
        this.frameCount++;
        
        // Update player physics
        this.updatePlayer();
        
        // Update game speed
        this.updateSpeed();
        
        // Spawn obstacles
        this.spawnObstacles();
        
        // Spawn power-ups
        this.spawnPowerUps();
        
        // Update obstacles
        this.updateObstacles();
        
        // Update power-ups
        this.updatePowerUps();
        
        // Update clouds
        this.updateClouds();
        
        // Check collisions
        this.checkCollisions();
        
        // Update score
        this.updateScore();
        
        // Update UI
        this.updateGameUI();
    }
    
    updatePlayer() {
        // Apply gravity
        if (!this.player.isOnGround) {
            this.player.velocityY += GAME_CONFIG.physics.gravity;
        }
        
        // Update position
        this.player.y += this.player.velocityY;
        
        // Ground collision
        if (this.player.y >= GAME_CONFIG.player.groundY) {
            this.player.y = GAME_CONFIG.player.groundY;
            this.player.velocityY = 0;
            this.player.isJumping = false;
            this.player.isOnGround = true;
        }
        
        // Update animation
        this.updatePlayerAnimation();
    }
    
    updatePlayerAnimation() {
        const now = Date.now();
        if (now - this.lastPlayerAnimationTime > GAME_CONFIG.player.sprites.animationSpeed) {
            this.playerAnimationFrame = (this.playerAnimationFrame + 1) % 2;
            this.lastPlayerAnimationTime = now;
        }
    }
    
    updateSpeed() {
        if (this.speed < GAME_CONFIG.physics.maxSpeed) {
            this.speed += GAME_CONFIG.physics.acceleration;
        }
    }
    
    spawnObstacles() {
        const now = Date.now();
        const spawnDelay = GameUtils.getSpawnDelay(this.speed);
        
        if (now - this.lastObstacleSpawn > spawnDelay) {
            const obstacleType = GameUtils.getRandomObstacleType();
            
            let y = obstacleType.y;
            if (Array.isArray(y)) {
                y = y[Math.floor(Math.random() * y.length)];
            }
            
            const obstacle = {
                x: this.canvas.width,
                y: y,
                width: obstacleType.width,
                height: obstacleType.height,
                type: obstacleType.id,
                canFly: obstacleType.canFly || false,
                flyOffset: 0,
                flySpeed: obstacleType.flySpeed || 0,
                flyAmplitude: obstacleType.flyAmplitude || 0,
                originalY: y
            };
            
            this.obstacles.push(obstacle);
            this.lastObstacleSpawn = now;
        }
    }
    
    spawnPowerUps() {
        const now = Date.now();
        const spawnDelay = GameUtils.getPowerUpSpawnDelay(this.speed);
        
        if (now - this.lastPowerUpSpawn > spawnDelay && Math.random() < GAME_CONFIG.powerUps.powerUpChance) {
            const powerUpType = GameUtils.getRandomPowerUpType();
            
            let y = powerUpType.y;
            if (Array.isArray(y)) {
                y = y[Math.floor(Math.random() * y.length)];
            }
            
            const powerUp = {
                x: this.canvas.width,
                y: y,
                width: powerUpType.width,
                height: powerUpType.height,
                type: powerUpType.id,
                points: powerUpType.points,
                glowIntensity: 0.5,
                glowDirection: 1
            };
            
            this.powerUps.push(powerUp);
            this.lastPowerUpSpawn = now;
        }
    }
    
    updateObstacles() {
        this.obstacles = this.obstacles.filter(obstacle => {
            obstacle.x -= this.speed;
            
            // Flying obstacle movement
            if (obstacle.canFly) {
                obstacle.flyOffset += obstacle.flySpeed;
                obstacle.y = obstacle.originalY + Math.sin(obstacle.flyOffset) * obstacle.flyAmplitude;
            }
            
            return obstacle.x + obstacle.width > 0;
        });
    }
    
    updatePowerUps() {
        this.powerUps = this.powerUps.filter(powerUp => {
            powerUp.x -= this.speed;
            
            // Update glow animation
            powerUp.glowIntensity += powerUp.glowDirection * GAME_CONFIG.powerUps.glowAnimation.speed;
            if (powerUp.glowIntensity >= GAME_CONFIG.powerUps.glowAnimation.maxIntensity) {
                powerUp.glowDirection = -1;
            } else if (powerUp.glowIntensity <= GAME_CONFIG.powerUps.glowAnimation.minIntensity) {
                powerUp.glowDirection = 1;
            }
            
            return powerUp.x + powerUp.width > 0;
        });
    }
    
    updateClouds() {
        this.clouds.forEach(cloud => {
            cloud.x -= cloud.speed;
            if (cloud.x + cloud.width < 0) {
                cloud.x = this.canvas.width;
                cloud.y = Math.random() * (GAME_CONFIG.clouds.maxY - GAME_CONFIG.clouds.minY) + GAME_CONFIG.clouds.minY;
            }
        });
    }
    
    checkCollisions() {
        // Check obstacle collisions
        for (const obstacle of this.obstacles) {
            if (GameUtils.checkCollision(this.player, obstacle, 5)) {
                this.gameOver();
                return;
            }
        }
        
        // Check power-up collisions
        this.powerUps = this.powerUps.filter(powerUp => {
            if (GameUtils.checkCollision(this.player, powerUp, 2)) {
                this.score += powerUp.points;
                return false; // Remove power-up
            }
            return true;
        });
    }
    
    updateScore() {
        this.score += GAME_CONFIG.scoring.pointsPerFrame;
        this.score += this.speed * GAME_CONFIG.scoring.speedBonus;
    }
    
    updateGameUI() {
        document.getElementById('score').textContent = Math.floor(this.score);
        document.getElementById('highScore').textContent = Math.floor(this.highScore);
        document.getElementById('speed').textContent = (this.speed / GAME_CONFIG.physics.initialSpeed).toFixed(1) + 'x';
    }
    
    gameOver() {
        this.gameState = GAME_CONFIG.states.GAME_OVER;
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
        }
        
        // Show game over screen
        this.showGameOverScreen();
        
        console.log('🎮 [GAME] Game over. Score:', Math.floor(this.score));
    }
    
    showGameOverScreen() {
        const gameOverScreen = document.getElementById('gameOver');
        const finalScoreElement = document.getElementById('finalScore');
        
        if (finalScoreElement) {
            finalScoreElement.textContent = Math.floor(this.score);
        }
        
        // Check if it's a new high score
        if (this.score >= this.highScore) {
            const gameOverTitle = document.getElementById('game-over-title');
            if (gameOverTitle) {
                gameOverTitle.textContent = this.t('new_record_title');
            }
            
            // Show save score section
            document.getElementById('save-score-section').style.display = 'block';
            document.getElementById('default-buttons').style.display = 'none';
            
            // Generate random name suggestion
            const randomName = getRandomPlayerName();
            const randomNameText = document.getElementById('random-name-text');
            const useRandomNameBtn = document.getElementById('use-random-name');
            
            if (randomNameText) {
                randomNameText.textContent = this.t('random_name_suggestion') + ' ' + randomName;
            }
            
            if (useRandomNameBtn) {
                useRandomNameBtn.onclick = () => {
                    document.getElementById('player-name').value = randomName;
                };
            }
        }
        
        gameOverScreen?.classList.add('show');
    }
    
    loadHighScore() {
        const saved = localStorage.getItem('barrino-game-highscore');
        this.highScore = saved ? parseFloat(saved) : 0;
    }
    
    saveHighScore() {
        localStorage.setItem('barrino-game-highscore', this.highScore.toString());
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = GAME_CONFIG.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render clouds
        this.renderClouds();
        
        // Render ground
        this.renderGround();
        
        // Render player
        this.renderPlayer();
        
        // Render obstacles
        this.renderObstacles();
        
        // Render power-ups
        this.renderPowerUps();
    }
    
    renderClouds() {
        this.clouds.forEach(cloud => {
            const cloudSprite = spriteLoader.getSprite('cloud');
            if (cloudSprite) {
                this.ctx.drawImage(cloudSprite, cloud.x, cloud.y, cloud.width, cloud.height);
            } else {
                // Fallback cloud rendering
                this.ctx.fillStyle = GAME_CONFIG.colors.clouds;
                this.ctx.beginPath();
                this.ctx.arc(cloud.x + cloud.width * 0.2, cloud.y + cloud.height * 0.5, cloud.height * 0.3, 0, Math.PI * 2);
                this.ctx.arc(cloud.x + cloud.width * 0.5, cloud.y + cloud.height * 0.3, cloud.height * 0.4, 0, Math.PI * 2);
                this.ctx.arc(cloud.x + cloud.width * 0.8, cloud.y + cloud.height * 0.5, cloud.height * 0.3, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
    }
    
    renderGround() {
        // Ground base
        this.ctx.fillStyle = GAME_CONFIG.colors.ground;
        this.ctx.fillRect(this.ground.x, this.ground.y, this.ground.width, this.ground.height);
        
        // Ground pattern
        this.ctx.fillStyle = GAME_CONFIG.colors.groundPattern;
        for (let x = 0; x < this.ground.width; x += GAME_CONFIG.ground.patternSize) {
            this.ctx.fillRect(x, this.ground.y, 2, this.ground.height);
        }
    }
    
    renderPlayer() {
        let playerSprite = null;
        
        if (this.player.isJumping || !this.player.isOnGround) {
            playerSprite = spriteLoader.getSprite('player_jump');
        } else {
            const runSprite = this.playerAnimationFrame === 0 ? 'player_run1' : 'player_run2';
            playerSprite = spriteLoader.getSprite(runSprite);
        }
        
        if (playerSprite) {
            this.ctx.drawImage(playerSprite, this.player.x, this.player.y, this.player.width, this.player.height);
        } else {
            // Fallback player rendering
            this.ctx.fillStyle = GAME_CONFIG.colors.player;
            this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
            
            // Simple Mario-like details
            this.ctx.fillStyle = '#FF0000'; // Red hat
            this.ctx.fillRect(this.player.x + 5, this.player.y, this.player.width - 10, 8);
            
            this.ctx.fillStyle = '#0000FF'; // Blue shirt
            this.ctx.fillRect(this.player.x + 8, this.player.y + 15, this.player.width - 16, 15);
        }
    }
    
    renderObstacles() {
        this.obstacles.forEach(obstacle => {
            const obstacleSprite = spriteLoader.getSprite(`obstacle_${obstacle.type}`);
            
            if (obstacleSprite) {
                this.ctx.drawImage(obstacleSprite, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            } else {
                // Fallback obstacle rendering
                this.ctx.fillStyle = GAME_CONFIG.colors.obstacles;
                
                switch (obstacle.type) {
                    case 'tavolo':
                        // Table shape
                        this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height - 10);
                        this.ctx.fillRect(obstacle.x + 2, obstacle.y + obstacle.height - 10, 4, 10);
                        this.ctx.fillRect(obstacle.x + obstacle.width - 6, obstacle.y + obstacle.height - 10, 4, 10);
                        break;
                    case 'pizza':
                        // Triangle pizza slice
                        this.ctx.fillStyle = '#FFD700';
                        this.ctx.beginPath();
                        this.ctx.moveTo(obstacle.x, obstacle.y + obstacle.height);
                        this.ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height);
                        this.ctx.lineTo(obstacle.x + obstacle.width / 2, obstacle.y);
                        this.ctx.closePath();
                        this.ctx.fill();
                        break;
                    case 'mestolo':
                        // Ladle shape
                        this.ctx.fillStyle = '#8B4513';
                        this.ctx.fillRect(obstacle.x, obstacle.y + obstacle.height / 2 - 2, obstacle.width - 8, 4);
                        this.ctx.beginPath();
                        this.ctx.arc(obstacle.x + obstacle.width - 8, obstacle.y + obstacle.height / 2, 8, 0, Math.PI * 2);
                        this.ctx.fill();
                        break;
                    default:
                        this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                }
            }
        });
    }
    
    renderPowerUps() {
        this.powerUps.forEach(powerUp => {
            // Render glow effect
            this.ctx.save();
            this.ctx.shadowColor = GAME_CONFIG.powerUps.types[0].glowColor;
            this.ctx.shadowBlur = 10 * powerUp.glowIntensity;
            
            const powerUpSprite = spriteLoader.getSprite(`obstacle_${powerUp.type.replace('_powerup', '')}`);
            
            if (powerUpSprite) {
                this.ctx.drawImage(powerUpSprite, powerUp.x, powerUp.y, powerUp.width, powerUp.height);
            } else {
                // Fallback power-up rendering
                this.ctx.fillStyle = '#FFD700';
                this.ctx.beginPath();
                this.ctx.moveTo(powerUp.x, powerUp.y + powerUp.height);
                this.ctx.lineTo(powerUp.x + powerUp.width, powerUp.y + powerUp.height);
                this.ctx.lineTo(powerUp.x + powerUp.width / 2, powerUp.y);
                this.ctx.closePath();
                this.ctx.fill();
            }
            
            this.ctx.restore();
        });
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.gameEngine = new GameEngine();
});

export default GameEngine;