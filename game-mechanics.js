// Game Mechanics - Complete game logic for Il Barrino da Mario
// This file contains all the game mechanics and should be loaded directly

// Game Configuration
const GAME_CONFIG = {
    canvas: { width: 600, height: 180 },
    
    player: {
        x: 50, y: 130, width: 40, height: 40,
        jumpPower: 15, gravity: 0.8, groundY: 130,
        sprites: {
            running: ['src/assets/images/camminata1.png', 'src/assets/images/camminata2.png'],
            jumping: 'src/assets/images/salto.png',
            animationSpeed: 200
        }
    },
    
    ground: { x: 0, y: 170, width: 600, height: 10 },
    
    obstacles: {
        types: [
            { id: 'tavolo', width: 50, height: 60, y: 110, sprite: 'src/assets/images/tavolo.png' },
            { id: 'cartoni', width: 25, height: 35, y: 135, sprite: 'src/assets/images/cartoni.png' },
            { id: 'italia', width: 35, height: 40, y: [50, 60], sprite: 'src/assets/images/italia.png', canFly: true, flySpeed: 0.005, flyAmplitude: 10 },
            { id: 'caffe', width: 35, height: 40, y: 130, sprite: 'src/assets/images/caffe.png' },
            { id: 'vino', width: 40, height: 38, y: 135, sprite: 'src/assets/images/vino.png' },
            { id: 'statua', width: 40, height: 45, y: 127, sprite: 'src/assets/images/statua.png' }
        ],
        minDistance: 200, maxDistance: 400,
        baseSpawnDelay: 1500, minSpawnDelay: 600,
        flyingObstacleChance: 0.3, powerUpChance: 0.05
    },
    
    powerUps: {
        types: [{
            id: 'pizza', width: 20, height: 20, y: [80, 120, 140],
            sprite: 'src/assets/images/PizzaPowerUp.png',
            points: 100, glowColor: '#FFD700'
        }],
        baseSpawnDelay: 3000, minSpawnDelay: 2000
    },
    
    clouds: {
        count: 4, minY: 20, maxY: 70, minWidth: 40, maxWidth: 80,
        minHeight: 20, maxHeight: 30, minSpeed: 0.3, maxSpeed: 1.5,
        sprite: 'src/assets/images/nuvole.png'
    },
    
    physics: { initialSpeed: 6, acceleration: 0.001, maxSpeed: 13, jumpCooldown: 300 },
    scoring: { pointsPerFrame: 0.025, speedBonus: 0.01, achievementBonus: 100 },
    
    colors: {
        background: '#f7f7f7', player: '#8B4513', ground: '#8B4513',
        groundPattern: '#A0522D', obstacles: '#228B22', clouds: '#E0E0E0',
        text: '#8B4513', gameOver: 'rgba(139, 69, 19, 0.9)'
    },
    
    states: { WAITING: 'waiting', RUNNING: 'running', CRASHED: 'crashed', GAME_OVER: 'game_over' }
};

// Random names for anonymous players
const RANDOM_NAMES = [
    'Mario Veloce', 'Saltatore Pro', 'Ninja del Barrino', 'Campione Anonimo',
    'Corridore Misterioso', 'Eroe Sconosciuto', 'Maestro del Salto', 'Leggenda Nascosta',
    'Asso del Gioco', 'Fenomeno Ignoto', 'Stella Segreta', 'Talento Celato',
    'Virtuoso Velato', 'Genio Incognito', 'Prodigio Privato', 'Mago Misterioso',
    'Esperto Enigmatico', 'Campione Celeste', 'Eroe Eterno', 'Leggenda Luminosa',
    'Saltatore Stellare', 'Corridore Cosmico', 'Ninja Notturno', 'Asso Astrale',
    'Maestro Magico', 'Fenomeno Fantastico', 'Virtuoso Vittorioso', 'Genio Gioioso',
    'Prodigio Perfetto', 'Talento Titanico', 'Stella Splendente', 'Eroe Epico'
];

// Sprite Loader Class
class GameSpriteLoader {
    constructor() {
        this.loadedSprites = new Map();
        this.loadingPromises = new Map();
    }
    
    async loadSprite(key, src) {
        if (this.loadedSprites.has(key)) return this.loadedSprites.get(key);
        if (this.loadingPromises.has(key)) return this.loadingPromises.get(key);
        
        const loadPromise = new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                this.loadedSprites.set(key, img);
                this.loadingPromises.delete(key);
                console.log(`🎮 [SPRITES] Loaded: ${key}`);
                resolve(img);
            };
            img.onerror = () => {
                console.warn(`🎮 [SPRITES] Failed to load: ${src}`);
                this.loadingPromises.delete(key);
                resolve(null);
            };
            img.src = src;
        });
        
        this.loadingPromises.set(key, loadPromise);
        return loadPromise;
    }
    
    getSprite(key) { return this.loadedSprites.get(key); }
    hasSprite(key) { return this.loadedSprites.has(key); }
}

// Game Utilities
const GameUtils = {
    getDistance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    },
    
    checkCollision(rect1, rect2, tolerance = 2) {
        return rect1.x + tolerance < rect2.x + rect2.width - tolerance &&
               rect1.x + rect1.width - tolerance > rect2.x + tolerance &&
               rect1.y + tolerance < rect2.y + rect2.height - tolerance &&
               rect1.y + rect1.height - tolerance > rect2.y + tolerance;
    },
    
    getRandomObstacleType() {
        const types = GAME_CONFIG.obstacles.types;
        const flyingTypes = types.filter(type => type.canFly);
        const groundTypes = types.filter(type => !type.canFly);
        
        const shouldSpawnFlying = Math.random() < GAME_CONFIG.obstacles.flyingObstacleChance;
        
        if (shouldSpawnFlying && flyingTypes.length > 0) {
            return flyingTypes[Math.floor(Math.random() * flyingTypes.length)];
        } else {
            return groundTypes[Math.floor(Math.random() * groundTypes.length)];
        }
    },
    
    getRandomPowerUpType() {
        const types = GAME_CONFIG.powerUps.types;
        return types[Math.floor(Math.random() * types.length)];
    },
    
    getSpawnDelay(currentSpeed) {
        const baseDelay = GAME_CONFIG.obstacles.baseSpawnDelay;
        const minDelay = GAME_CONFIG.obstacles.minSpawnDelay;
        const speedRatio = currentSpeed / GAME_CONFIG.physics.initialSpeed;
        const delay = Math.max(minDelay, baseDelay - (speedRatio - 1) * 200);
        return delay + Math.random() * 300;
    },
    
    getPowerUpSpawnDelay(currentSpeed) {
        const baseDelay = GAME_CONFIG.powerUps.baseSpawnDelay;
        const minDelay = GAME_CONFIG.powerUps.minSpawnDelay;
        const speedRatio = currentSpeed / GAME_CONFIG.physics.initialSpeed;
        const delay = Math.max(minDelay, baseDelay - (speedRatio - 1) * 100);
        return delay + Math.random() * 500;
    },
    
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               window.innerWidth <= 768;
    },
    
    isPortrait() { return window.innerHeight > window.innerWidth; },
    
    getRandomPlayerName() {
        return RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
    }
};

// Main Game Engine Class
class GameEngine {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.gameState = GAME_CONFIG.states.WAITING;
        this.score = 0;
        this.highScore = 0;
        this.speed = GAME_CONFIG.physics.initialSpeed;
        this.frameCount = 0;
        this.lastTime = 0;
        
        // Game objects
        this.player = {
            x: GAME_CONFIG.player.x, y: GAME_CONFIG.player.y,
            width: GAME_CONFIG.player.width, height: GAME_CONFIG.player.height,
            velocityY: 0, isJumping: false, groundY: GAME_CONFIG.player.groundY,
            animationFrame: 0, lastAnimationTime: 0
        };
        
        this.obstacles = [];
        this.powerUps = [];
        this.clouds = [];
        this.particles = [];
        
        // Timing
        this.lastObstacleTime = 0;
        this.lastPowerUpTime = 0;
        this.lastJumpTime = 0;
        this.groundOffset = 0;
        
        // Mobile and UI
        this.isMobile = GameUtils.isMobile();
        this.orientationAllowed = false;
        this.leaderboard = [];
        this.showSaveScore = false;
        this.newRecord = false;
        
        // Services
        this.translationService = null;
        this.firebaseService = null;
        this.spriteLoader = new GameSpriteLoader();
        
        this.init();
    }

    async init() {
        console.log('🎮 [GAME] Initializing game engine...');
        
        await this.waitForServices();
        this.initCanvas();
        await this.initializeSprites();
        this.initClouds();
        this.loadHighScore();
        await this.loadLeaderboard();
        this.setupEventListeners();
        this.handleMobileOrientation();
        this.updateUITranslations();
        this.gameLoop();
        
        console.log('🎮 [GAME] Game engine initialized');
    }

    async waitForServices() {
        // Wait for translation service
        let attempts = 0;
        while (!window.translationService?.isLoaded && attempts < 100) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (window.translationService?.isLoaded) {
            this.translationService = window.translationService;
        }
        
        // Wait for Firebase service
        attempts = 0;
        while (!window.firebaseService?.isInitialized && attempts < 100) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (window.firebaseService?.isInitialized) {
            this.firebaseService = window.firebaseService;
        }
    }

    async initializeSprites() {
        console.log('🎮 [SPRITES] Loading game sprites...');
        const loadPromises = [];
        
        // Load player sprites
        loadPromises.push(this.spriteLoader.loadSprite('player_run1', GAME_CONFIG.player.sprites.running[0]));
        loadPromises.push(this.spriteLoader.loadSprite('player_run2', GAME_CONFIG.player.sprites.running[1]));
        loadPromises.push(this.spriteLoader.loadSprite('player_jump', GAME_CONFIG.player.sprites.jumping));
        
        // Load obstacle sprites
        GAME_CONFIG.obstacles.types.forEach((obstacleType) => {
            loadPromises.push(this.spriteLoader.loadSprite(`obstacle_${obstacleType.id}`, obstacleType.sprite));
        });
        
        // Load power-up sprites
        GAME_CONFIG.powerUps.types.forEach((powerUpType) => {
            loadPromises.push(this.spriteLoader.loadSprite(`powerup_${powerUpType.id}`, powerUpType.sprite));
        });
        
        // Load cloud sprite
        loadPromises.push(this.spriteLoader.loadSprite('cloud', GAME_CONFIG.clouds.sprite));
        
        await Promise.all(loadPromises);
        console.log('🎮 [SPRITES] Sprites loaded');
    }

    initCanvas() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        if (!this.canvas || !this.ctx) {
            console.error('🎮 [GAME] Canvas not found');
            return;
        }
        
        this.canvas.width = GAME_CONFIG.canvas.width;
        this.canvas.height = GAME_CONFIG.canvas.height;
    }

    initClouds() {
        this.clouds = [];
        for (let i = 0; i < GAME_CONFIG.clouds.count; i++) {
            this.clouds.push({
                x: Math.random() * GAME_CONFIG.canvas.width,
                y: GAME_CONFIG.clouds.minY + Math.random() * (GAME_CONFIG.clouds.maxY - GAME_CONFIG.clouds.minY),
                width: GAME_CONFIG.clouds.minWidth + Math.random() * (GAME_CONFIG.clouds.maxWidth - GAME_CONFIG.clouds.minWidth),
                height: GAME_CONFIG.clouds.minHeight + Math.random() * (GAME_CONFIG.clouds.maxHeight - GAME_CONFIG.clouds.minHeight),
                speed: GAME_CONFIG.clouds.minSpeed + Math.random() * (GAME_CONFIG.clouds.maxSpeed - GAME_CONFIG.clouds.minSpeed)
            });
        }
    }

    setupEventListeners() {
        // Canvas input
        this.canvas.addEventListener('click', (e) => this.handleInput(e));
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleInput(e);
        });
        
        // Keyboard
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.handleInput(e);
            }
        });
        
        // Game UI buttons
        document.getElementById('restartBtn')?.addEventListener('click', () => this.restart());
        document.getElementById('leaderboard-btn')?.addEventListener('click', () => this.showLeaderboardModal());
        document.getElementById('save-score-btn')?.addEventListener('click', () => this.saveScore());
        document.getElementById('skip-save-btn')?.addEventListener('click', () => this.skipSave());
        document.getElementById('use-random-name')?.addEventListener('click', () => this.useRandomName());
        
        // Leaderboard modal
        document.getElementById('play-again-btn')?.addEventListener('click', () => {
            this.hideLeaderboardModal();
            this.restart();
        });
        document.querySelector('.close-leaderboard')?.addEventListener('click', () => this.hideLeaderboardModal());
        
        // Language selector
        document.getElementById('language-btn-game')?.addEventListener('click', () => this.toggleLanguageSelector());
        document.querySelector('#language-selector-game .close-btn')?.addEventListener('click', () => this.hideLanguageSelector());
        
        // Orientation
        document.getElementById('continue-portrait')?.addEventListener('click', () => this.allowPortraitMode());
        
        // Prevent context menu
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Orientation changes
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.handleMobileOrientation(), 100);
        });
        window.addEventListener('resize', () => this.handleMobileOrientation());
    }

    updateUITranslations() {
        if (!this.translationService) return;
        
        // Update all translatable elements
        const translations = {
            'game-title': 'game_title',
            'game-subtitle': 'game_subtitle',
            'instructions-title': 'instructions_title',
            'instruction-1': 'instruction_1',
            'instruction-2': 'instruction_2',
            'instruction-3': 'instruction_3',
            'instruction-4': 'instruction_4',
            'score-label': 'score_label',
            'high-score-label': 'high_score_label',
            'speed-label': 'speed_label',
            'game-controls-text': 'game_controls_text',
            'back-to-menu-text': 'back_to_menu_text',
            'game-over-title': 'game_over_title',
            'final-score-text': 'final_score_text',
            'restart-text': 'restart_text',
            'leaderboard-text': 'leaderboard_text',
            'leaderboard-title': 'leaderboard_title',
            'leaderboard-main-title': 'leaderboard_main_title',
            'no-scores-text': 'no_scores_text',
            'save-score-label': 'save_score_label',
            'orientation-title': 'orientation_title',
            'orientation-message': 'orientation_message',
            'orientation-note': 'orientation_note',
            'continue-portrait-text': 'continue_portrait_text',
            'random-name-text': 'random_name_suggestion',
            'no-scores-modal-text': 'no_scores_modal_text'
        };

        Object.entries(translations).forEach(([elementId, translationKey]) => {
            const element = document.getElementById(elementId);
            if (element) {
                const translation = this.translationService.t(translationKey);
                if (translation && translation !== translationKey) {
                    element.textContent = translation;
                }
            }
        });

        // Update placeholder
        const playerNameInput = document.getElementById('player-name');
        if (playerNameInput) {
            const placeholder = this.translationService.t('player_name_placeholder');
            if (placeholder && placeholder !== 'player_name_placeholder') {
                playerNameInput.placeholder = placeholder;
            }
        }

        // Update button texts with data-translation attribute
        document.querySelectorAll('[data-translation]').forEach(element => {
            const key = element.dataset.translation;
            const translation = this.translationService.t(key);
            if (translation && translation !== key) {
                element.textContent = translation;
            }
        });

        this.updateLanguageSelector();
    }

    updateLanguageSelector() {
        if (!this.translationService) return;
        
        const languageGrid = document.getElementById('language-grid-game');
        if (!languageGrid) return;
        
        const availableLanguages = this.translationService.getAvailableLanguagesForUI();
        
        languageGrid.innerHTML = availableLanguages.map(lang => `
            <button class="lang-btn" data-lang="${lang.code}">
                ${lang.flag} ${lang.name}
            </button>
        `).join('');
        
        languageGrid.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const lang = e.target.dataset.lang;
                const success = await this.translationService.changeLanguage(lang);
                if (success) {
                    this.updateUITranslations();
                    this.hideLanguageSelector();
                }
            });
        });
    }

    handleMobileOrientation() {
        if (!this.isMobile) return;
        
        const orientationNotice = document.getElementById('orientation-notice');
        const gameContainer = document.querySelector('.game-container');
        
        if (!orientationNotice || !gameContainer) return;
        
        this.orientationAllowed = localStorage.getItem('game-portrait-allowed') === 'true';
        
        if (GameUtils.isPortrait() && !this.orientationAllowed) {
            orientationNotice.classList.remove('hidden');
            gameContainer.classList.remove('portrait-allowed');
        } else {
            orientationNotice.classList.add('hidden');
            if (GameUtils.isPortrait()) {
                gameContainer.classList.add('portrait-allowed');
            }
        }
    }

    allowPortraitMode() {
        localStorage.setItem('game-portrait-allowed', 'true');
        this.orientationAllowed = true;
        this.handleMobileOrientation();
    }

    handleInput(e) {
        const now = Date.now();
        
        if (this.gameState === GAME_CONFIG.states.WAITING) {
            this.start();
        } else if (this.gameState === GAME_CONFIG.states.RUNNING) {
            if (now - this.lastJumpTime > GAME_CONFIG.physics.jumpCooldown) {
                this.jump();
                this.lastJumpTime = now;
            }
        } else if (this.gameState === GAME_CONFIG.states.GAME_OVER) {
            this.restart();
        }
    }

    start() {
        this.gameState = GAME_CONFIG.states.RUNNING;
        this.score = 0;
        this.speed = GAME_CONFIG.physics.initialSpeed;
        this.frameCount = 0;
        this.obstacles = [];
        this.powerUps = [];
        this.particles = [];
        this.lastObstacleTime = Date.now();
        this.lastPowerUpTime = Date.now();
        this.showSaveScore = false;
        this.newRecord = false;
        
        // Reset player
        this.player.y = this.player.groundY;
        this.player.velocityY = 0;
        this.player.isJumping = false;
    }

    jump() {
        if (!this.player.isJumping) {
            this.player.velocityY = -GAME_CONFIG.player.jumpPower;
            this.player.isJumping = true;
        }
    }

    restart() {
        this.hideGameOver();
        this.hideLeaderboardModal();
        this.gameState = GAME_CONFIG.states.WAITING;
        this.updateUI();
    }

    gameLoop(currentTime = 0) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    update(deltaTime) {
        if (this.gameState !== GAME_CONFIG.states.RUNNING) return;
        
        this.frameCount++;
        
        // Update score
        this.score += GAME_CONFIG.scoring.pointsPerFrame + (this.speed * GAME_CONFIG.scoring.speedBonus);
        
        // Update speed
        this.speed = Math.min(
            GAME_CONFIG.physics.maxSpeed,
            GAME_CONFIG.physics.initialSpeed + (this.frameCount * GAME_CONFIG.physics.acceleration)
        );
        
        // Update game objects
        this.updatePlayer(deltaTime);
        this.updateObstacles(deltaTime);
        this.updatePowerUps(deltaTime);
        this.updateClouds(deltaTime);
        this.updateParticles(deltaTime);
        
        // Spawn new objects
        this.spawnObstacles();
        this.spawnPowerUps();
        
        // Check collisions
        this.checkCollisions();
        
        // Update ground animation
        this.groundOffset = (this.groundOffset + this.speed) % 20;
        
        // Update UI
        this.updateUI();
    }

    updatePlayer(deltaTime) {
        // Apply gravity
        if (this.player.isJumping) {
            this.player.velocityY += GAME_CONFIG.player.gravity;
            this.player.y += this.player.velocityY;
            
            // Check if landed
            if (this.player.y >= this.player.groundY) {
                this.player.y = this.player.groundY;
                this.player.velocityY = 0;
                this.player.isJumping = false;
            }
        }
        
        // Update animation
        if (!this.player.isJumping && Date.now() - this.player.lastAnimationTime > GAME_CONFIG.player.sprites.animationSpeed) {
            this.player.animationFrame = (this.player.animationFrame + 1) % 2;
            this.player.lastAnimationTime = Date.now();
        }
    }

    updateObstacles(deltaTime) {
        this.obstacles = this.obstacles.filter(obstacle => {
            obstacle.x -= this.speed;
            
            // Update flying obstacles
            if (obstacle.canFly) {
                obstacle.flyOffset = (obstacle.flyOffset || 0) + obstacle.flySpeed * deltaTime;
                obstacle.y = obstacle.baseY + Math.sin(obstacle.flyOffset) * obstacle.flyAmplitude;
            }
            
            return obstacle.x + obstacle.width > 0;
        });
    }

    updatePowerUps(deltaTime) {
        this.powerUps = this.powerUps.filter(powerUp => {
            powerUp.x -= this.speed;
            
            // Update glow animation
            powerUp.glowOffset = (powerUp.glowOffset || 0) + 0.1;
            powerUp.currentGlow = 0.3 + (Math.sin(powerUp.glowOffset) + 1) / 2 * 0.7;
            
            return powerUp.x + powerUp.width > 0;
        });
    }

    updateClouds(deltaTime) {
        this.clouds.forEach(cloud => {
            cloud.x -= cloud.speed;
            if (cloud.x + cloud.width < 0) {
                cloud.x = GAME_CONFIG.canvas.width;
                cloud.y = GAME_CONFIG.clouds.minY + Math.random() * (GAME_CONFIG.clouds.maxY - GAME_CONFIG.clouds.minY);
            }
        });
    }

    updateParticles(deltaTime) {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.velocityX;
            particle.y += particle.velocityY;
            particle.life -= deltaTime;
            particle.alpha = particle.life / particle.maxLife;
            return particle.life > 0;
        });
    }

    spawnObstacles() {
        const now = Date.now();
        const spawnDelay = GameUtils.getSpawnDelay(this.speed);
        
        if (now - this.lastObstacleTime > spawnDelay) {
            const obstacleType = GameUtils.getRandomObstacleType();
            const obstacle = {
                ...obstacleType,
                x: GAME_CONFIG.canvas.width,
                baseY: Array.isArray(obstacleType.y) ? 
                    obstacleType.y[Math.floor(Math.random() * obstacleType.y.length)] : 
                    obstacleType.y,
                flyOffset: 0,
                flySpeed: obstacleType.flySpeed || 0,
                flyAmplitude: obstacleType.flyAmplitude || 0
            };
            
            obstacle.y = obstacle.baseY;
            this.obstacles.push(obstacle);
            this.lastObstacleTime = now;
        }
    }

    spawnPowerUps() {
        const now = Date.now();
        const spawnDelay = GameUtils.getPowerUpSpawnDelay(this.speed);
        
        if (now - this.lastPowerUpTime > spawnDelay && Math.random() < GAME_CONFIG.obstacles.powerUpChance) {
            const powerUpType = GameUtils.getRandomPowerUpType();
            const powerUp = {
                ...powerUpType,
                x: GAME_CONFIG.canvas.width,
                y: Array.isArray(powerUpType.y) ? 
                    powerUpType.y[Math.floor(Math.random() * powerUpType.y.length)] : 
                    powerUpType.y,
                glowOffset: 0,
                currentGlow: 1
            };
            
            this.powerUps.push(powerUp);
            this.lastPowerUpTime = now;
        }
    }

    checkCollisions() {
        // Check obstacle collisions
        for (let obstacle of this.obstacles) {
            if (GameUtils.checkCollision(this.player, obstacle)) {
                this.gameOver();
                return;
            }
        }
        
        // Check power-up collisions
        this.powerUps = this.powerUps.filter(powerUp => {
            if (GameUtils.checkCollision(this.player, powerUp)) {
                this.collectPowerUp(powerUp);
                return false;
            }
            return true;
        });
    }

    collectPowerUp(powerUp) {
        this.score += powerUp.points;
        
        // Create particles
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: powerUp.x + powerUp.width / 2,
                y: powerUp.y + powerUp.height / 2,
                velocityX: (Math.random() - 0.5) * 4,
                velocityY: (Math.random() - 0.5) * 4,
                life: 1000,
                maxLife: 1000,
                alpha: 1,
                color: powerUp.glowColor
            });
        }
    }

    gameOver() {
        this.gameState = GAME_CONFIG.states.GAME_OVER;
        
        // Check for new high score
        if (Math.floor(this.score) > this.highScore) {
            this.highScore = Math.floor(this.score);
            this.saveHighScore();
            this.newRecord = true;
            this.showSaveScore = true;
        } else if (this.shouldShowSaveScore()) {
            this.showSaveScore = true;
        }
        
        this.showGameOver();
    }

    shouldShowSaveScore() {
        const currentScore = Math.floor(this.score);
        return this.leaderboard.length < 10 || currentScore > this.leaderboard[this.leaderboard.length - 1].score;
    }

    showGameOver() {
        const gameOver = document.getElementById('gameOver');
        const finalScore = document.getElementById('finalScore');
        const saveScoreSection = document.getElementById('save-score-section');
        const defaultButtons = document.getElementById('default-buttons');
        
        if (gameOver) gameOver.classList.add('show');
        if (finalScore) finalScore.textContent = Math.floor(this.score);
        
        if (this.showSaveScore) {
            if (saveScoreSection) saveScoreSection.style.display = 'block';
            if (defaultButtons) defaultButtons.style.display = 'none';
            this.generateRandomName();
        } else {
            if (saveScoreSection) saveScoreSection.style.display = 'none';
            if (defaultButtons) defaultButtons.style.display = 'flex';
        }
    }

    hideGameOver() {
        const gameOver = document.getElementById('gameOver');
        if (gameOver) gameOver.classList.remove('show');
    }

    generateRandomName() {
        const randomNameBtn = document.getElementById('use-random-name');
        if (randomNameBtn) {
            const randomName = GameUtils.getRandomPlayerName();
            randomNameBtn.textContent = randomName;
            randomNameBtn.dataset.name = randomName;
        }
    }

    useRandomName() {
        const randomNameBtn = document.getElementById('use-random-name');
        const playerNameInput = document.getElementById('player-name');
        
        if (randomNameBtn && playerNameInput) {
            playerNameInput.value = randomNameBtn.dataset.name || GameUtils.getRandomPlayerName();
        }
    }

    async saveScore() {
        const playerNameInput = document.getElementById('player-name');
        const playerName = playerNameInput?.value.trim() || 'Giocatore Anonimo';
        
        const scoreEntry = {
            name: playerName,
            score: Math.floor(this.score),
            date: new Date().toLocaleDateString('it-IT'),
            timestamp: Date.now()
        };
        
        this.leaderboard.push(scoreEntry);
        this.leaderboard.sort((a, b) => b.score - a.score);
        this.leaderboard = this.leaderboard.slice(0, 10);
        
        await this.saveLeaderboard();
        this.updateLeaderboardDisplay();
        
        const saveScoreSection = document.getElementById('save-score-section');
        const defaultButtons = document.getElementById('default-buttons');
        
        if (saveScoreSection) saveScoreSection.style.display = 'none';
        if (defaultButtons) defaultButtons.style.display = 'flex';
    }

    skipSave() {
        const saveScoreSection = document.getElementById('save-score-section');
        const defaultButtons = document.getElementById('default-buttons');
        
        if (saveScoreSection) saveScoreSection.style.display = 'none';
        if (defaultButtons) defaultButtons.style.display = 'flex';
    }

    showLeaderboardModal() {
        const modal = document.getElementById('leaderboard-modal');
        if (modal) {
            modal.style.display = 'flex';
            this.updateLeaderboardModal();
        }
    }

    hideLeaderboardModal() {
        const modal = document.getElementById('leaderboard-modal');
        if (modal) modal.style.display = 'none';
    }

    updateLeaderboardModal() {
        const leaderboardList = document.getElementById('leaderboard-list');
        const noScoresModal = document.getElementById('no-scores-modal');
        
        if (!leaderboardList) return;
        
        if (this.leaderboard.length === 0) {
            leaderboardList.style.display = 'none';
            if (noScoresModal) noScoresModal.style.display = 'block';
            return;
        }
        
        leaderboardList.style.display = 'block';
        if (noScoresModal) noScoresModal.style.display = 'none';
        
        leaderboardList.innerHTML = this.leaderboard.map((entry, index) => {
            const rankClass = index === 0 ? 'top-1' : index === 1 ? 'top-2' : index === 2 ? 'top-3' : '';
            return `
                <li class="leaderboard-entry ${rankClass}">
                    <span class="rank">${index + 1}</span>
                    <span class="name">${entry.name}</span>
                    <span class="score">${entry.score}</span>
                    <span class="date">${entry.date}</span>
                </li>
            `;
        }).join('');
    }

    updateLeaderboardDisplay() {
        const leaderboardList = document.getElementById('game-leaderboard-list');
        const noScoresText = document.getElementById('no-scores-text');
        
        if (!leaderboardList) return;
        
        if (this.leaderboard.length === 0) {
            leaderboardList.innerHTML = `<li class="no-scores-game">${noScoresText?.textContent || 'Nessun punteggio salvato'}</li>`;
            return;
        }
        
        leaderboardList.innerHTML = this.leaderboard.map((entry, index) => {
            const rankClass = index === 0 ? 'top-1' : index === 1 ? 'top-2' : index === 2 ? 'top-3' : '';
            return `
                <li class="game-leaderboard-entry ${rankClass}">
                    <span class="rank">${index + 1}</span>
                    <span class="name">${entry.name}</span>
                    <span class="score">${entry.score}</span>
                    <span class="date">${entry.date}</span>
                </li>
            `;
        }).join('');
    }

    toggleLanguageSelector() {
        const selector = document.getElementById('language-selector-game');
        if (selector) selector.classList.toggle('hidden');
    }

    hideLanguageSelector() {
        const selector = document.getElementById('language-selector-game');
        if (selector) selector.classList.add('hidden');
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = GAME_CONFIG.colors.background;
        this.ctx.fillRect(0, 0, GAME_CONFIG.canvas.width, GAME_CONFIG.canvas.height);
        
        // Draw game elements
        this.drawClouds();
        this.drawGround();
        this.drawPlayer();
        this.drawObstacles();
        this.drawPowerUps();
        this.drawParticles();
        
        // Draw waiting message
        if (this.gameState === GAME_CONFIG.states.WAITING) {
            this.drawWaitingMessage();
        }
    }

    drawClouds() {
        this.clouds.forEach(cloud => {
            const sprite = this.spriteLoader.getSprite('cloud');
            if (sprite) {
                this.ctx.drawImage(sprite, cloud.x, cloud.y, cloud.width, cloud.height);
            } else {
                // Fallback cloud drawing
                this.ctx.fillStyle = GAME_CONFIG.colors.clouds;
                this.ctx.beginPath();
                this.ctx.arc(cloud.x + cloud.width * 0.2, cloud.y + cloud.height * 0.5, cloud.height * 0.3, 0, Math.PI * 2);
                this.ctx.arc(cloud.x + cloud.width * 0.5, cloud.y + cloud.height * 0.3, cloud.height * 0.4, 0, Math.PI * 2);
                this.ctx.arc(cloud.x + cloud.width * 0.8, cloud.y + cloud.height * 0.5, cloud.height * 0.3, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
    }

    drawGround() {
        // Draw ground
        this.ctx.fillStyle = GAME_CONFIG.colors.ground;
        this.ctx.fillRect(0, GAME_CONFIG.ground.y, GAME_CONFIG.canvas.width, GAME_CONFIG.ground.height);
        
        // Draw ground pattern
        this.ctx.fillStyle = GAME_CONFIG.colors.groundPattern;
        for (let x = -this.groundOffset; x < GAME_CONFIG.canvas.width; x += 20) {
            this.ctx.fillRect(x, GAME_CONFIG.ground.y, 2, GAME_CONFIG.ground.height);
        }
    }

    drawPlayer() {
        const sprite = this.getPlayerSprite();
        if (sprite) {
            this.ctx.drawImage(sprite, this.player.x, this.player.y, this.player.width, this.player.height);
        } else {
            // Fallback player drawing
            this.ctx.fillStyle = GAME_CONFIG.colors.player;
            this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
            
            // Draw simple Mario features
            this.ctx.fillStyle = '#FF0000'; // Red hat
            this.ctx.fillRect(this.player.x + 5, this.player.y, this.player.width - 10, 8);
            
            this.ctx.fillStyle = '#0000FF'; // Blue shirt
            this.ctx.fillRect(this.player.x + 8, this.player.y + 15, this.player.width - 16, 15);
        }
    }

    getPlayerSprite() {
        if (this.player.isJumping) {
            return this.spriteLoader.getSprite('player_jump');
        } else {
            const frameKey = this.player.animationFrame === 0 ? 'player_run1' : 'player_run2';
            return this.spriteLoader.getSprite(frameKey);
        }
    }

    drawObstacles() {
        this.obstacles.forEach(obstacle => {
            const sprite = this.spriteLoader.getSprite(`obstacle_${obstacle.id}`);
            if (sprite) {
                this.ctx.drawImage(sprite, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            } else {
                // Fallback obstacle drawing
                this.ctx.fillStyle = GAME_CONFIG.colors.obstacles;
                this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            }
        });
    }

    drawPowerUps() {
        this.powerUps.forEach(powerUp => {
            // Draw glow effect
            this.ctx.save();
            this.ctx.globalAlpha = powerUp.currentGlow * 0.5;
            this.ctx.fillStyle = powerUp.glowColor;
            this.ctx.beginPath();
            this.ctx.arc(
                powerUp.x + powerUp.width / 2,
                powerUp.y + powerUp.height / 2,
                powerUp.width * 0.8,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
            this.ctx.restore();
            
            // Draw power-up
            const sprite = this.spriteLoader.getSprite(`powerup_${powerUp.id}`);
            
            if (sprite) {
                this.ctx.drawImage(sprite, powerUp.x, powerUp.y, powerUp.width, powerUp.height);
            } else {
                // Fallback - draw pizza slice
                this.ctx.fillStyle = '#FFD700';
                this.ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
                
                // Draw pizza triangle
                this.ctx.fillStyle = '#FF6B35';
                this.ctx.beginPath();
                this.ctx.moveTo(powerUp.x + powerUp.width/2, powerUp.y + 2);
                this.ctx.lineTo(powerUp.x + 2, powerUp.y + powerUp.height - 2);
                this.ctx.lineTo(powerUp.x + powerUp.width - 2, powerUp.y + powerUp.height - 2);
                this.ctx.closePath();
                this.ctx.fill();
                
                // Add pepperoni dots
                this.ctx.fillStyle = '#8B0000';
                this.ctx.beginPath();
                this.ctx.arc(powerUp.x + powerUp.width/2 - 3, powerUp.y + powerUp.height/2, 1, 0, Math.PI * 2);
                this.ctx.arc(powerUp.x + powerUp.width/2 + 3, powerUp.y + powerUp.height/2, 1, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
    }

    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.alpha;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }

    drawWaitingMessage() {
        this.ctx.fillStyle = GAME_CONFIG.colors.text;
        this.ctx.font = '20px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        
        const message = this.translationService ? 
            this.translationService.t('game_controls_text') : 
            'Tocca lo schermo per iniziare';
            
        this.ctx.fillText(message, GAME_CONFIG.canvas.width / 2, GAME_CONFIG.canvas.height / 2);
    }

    updateUI() {
        // Update score
        const scoreElement = document.getElementById('score');
        if (scoreElement) scoreElement.textContent = Math.floor(this.score);
        
        // Update high score
        const highScoreElement = document.getElementById('highScore');
        if (highScoreElement) highScoreElement.textContent = this.highScore;
        
        // Update speed
        const speedElement = document.getElementById('speed');
        if (speedElement) {
            const speedMultiplier = (this.speed / GAME_CONFIG.physics.initialSpeed).toFixed(1);
            speedElement.textContent = `${speedMultiplier}x`;
        }
    }

    loadHighScore() {
        this.highScore = parseInt(localStorage.getItem('game-high-score') || '0');
    }

    saveHighScore() {
        localStorage.setItem('game-high-score', this.highScore.toString());
    }

    async loadLeaderboard() {
        // Try to load from Firebase first
        if (this.firebaseService) {
            try {
                const doc = await this.firebaseService.db.collection('game').doc('leaderboard').get();
                if (doc.exists) {
                    const data = doc.data();
                    this.leaderboard = data.scores || [];
                    this.updateLeaderboardDisplay();
                    return;
                }
            } catch (error) {
                console.warn('🎮 [GAME] Error loading leaderboard from Firebase:', error);
            }
        }
        
        // Fallback to localStorage
        const saved = localStorage.getItem('game-leaderboard');
        if (saved) {
            try {
                this.leaderboard = JSON.parse(saved);
            } catch (e) {
                this.leaderboard = [];
            }
        } else {
            this.leaderboard = [];
        }
        this.updateLeaderboardDisplay();
    }

    async saveLeaderboard() {
        // Save to Firebase first
        if (this.firebaseService) {
            try {
                await this.firebaseService.db.collection('game').doc('leaderboard').set({
                    scores: this.leaderboard,
                    lastUpdated: new Date().toISOString()
                });
            } catch (error) {
                console.warn('🎮 [GAME] Error saving leaderboard to Firebase:', error);
            }
        }
        
        // Always save to localStorage as backup
        localStorage.setItem('game-leaderboard', JSON.stringify(this.leaderboard));
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GameEngine();
});