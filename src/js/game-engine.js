// Game Engine - Updated for new translation system
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
        
        this.init();
    }
    
    async init() {
        console.log('🎮 [GAME] Initializing game engine...');
        
        // Wait for translation service
        await this.waitForTranslationService();
        
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
    
    async waitForTranslationService() {
        let attempts = 0;
        const maxAttempts = 50;
        
        while (!window.translationService?.isLoaded && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
    }
    
    updateUITranslations() {
        if (window.translationService) {
            window.translationService.updateTranslatableElements();
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
            const isPortrait = GameUtils.isPortrait();
            
            if (isPortrait && !this.isPortraitAllowed) {
                if (orientationNotice) {
                    orientationNotice.classList.remove('hidden');
                    orientationNotice.style.display = 'flex';
                }
                if (gameContainer) {
                    gameContainer.classList.remove('portrait-allowed');
                }
            } else {
                if (orientationNotice) {
                    orientationNotice.classList.add('hidden');
                    orientationNotice.style.display = 'none';
                }
                if (gameContainer) {
                    if (this.isPortraitAllowed || !isPortrait) {
                        gameContainer.classList.add('portrait-allowed');
                    }
                }
            }
        };
        
        // Continue in portrait button
        continuePortraitBtn?.addEventListener('click', () => {
            this.isPortraitAllowed = true;
            localStorage.setItem('game-portrait-allowed', 'true');
            checkOrientation();
        });
        
        // Load portrait preference
        this.isPortraitAllowed = localStorage.getItem('game-portrait-allowed') === 'true';
        
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
        const saveScoreSection = document.getElementById('save-score-section');
        const defaultButtons = document.getElementById('default-buttons');
        
        if (finalScoreElement) {
            finalScoreElement.textContent = Math.floor(this.score);
        }
        
        // Check if it's a new high score
        if (this.score >= this.highScore && this.score > 0) {
            // Show save score section
            if (saveScoreSection) {
                saveScoreSection.style.display = 'block';
            }
            if (defaultButtons) {
                defaultButtons.style.display = 'none';
            }
            
            // Generate random name suggestion
            const randomName = getRandomPlayerName();
            const randomNameText = document.getElementById('random-name-text');
            const useRandomNameBtn = document.getElementById('use-random-name');
            const playerNameInput = document.getElementById('player-name');
            
            if (randomNameText) {
                randomNameText.textContent = 'Suggerimento: ' + randomName;
            }
            
            if (useRandomNameBtn) {
                useRandomNameBtn.onclick = () => {
                    if (playerNameInput) {
                        playerNameInput.value = randomName;
                    }
                };
            }
            
            // Setup save score button
            const saveScoreBtn = document.getElementById('save-score-btn');
            const skipSaveBtn = document.getElementById('skip-save-btn');
            
            if (saveScoreBtn) {
                saveScoreBtn.onclick = () => this.savePlayerScore();
            }
            
            if (skipSaveBtn) {
                skipSaveBtn.onclick = () => this.skipSaveScore();
            }
        } else {
            // Show default buttons
            if (saveScoreSection) {
                saveScoreSection.style.display = 'none';
            }
            if (defaultButtons) {
                defaultButtons.style.display = 'flex';
            }
        }
        
        // Setup restart and leaderboard buttons
        const restartBtn = document.getElementById('restartBtn');
        const leaderboardBtn = document.getElementById('leaderboard-btn');
        
        if (restartBtn) {
            restartBtn.onclick = () => this.restartGame();
        }
        
        if (leaderboardBtn) {
            leaderboardBtn.onclick = () => this.showLeaderboard();
        }
        
        gameOverScreen?.classList.add('show');
        
        // Load and display leaderboard
        this.loadLeaderboard();
    }
    
    savePlayerScore() {
        const playerNameInput = document.getElementById('player-name');
        const playerName = playerNameInput?.value.trim() || 'Giocatore Anonimo';
        
        // Save score to localStorage
        const scores = this.getStoredScores();
        const newScore = {
            name: playerName,
            score: Math.floor(this.score),
            date: new Date().toLocaleDateString('it-IT')
        };
        
        scores.push(newScore);
        scores.sort((a, b) => b.score - a.score);
        scores.splice(10); // Keep only top 10
        
        localStorage.setItem('barrino-game-scores', JSON.stringify(scores));
        
        // Hide save section and show default buttons
        document.getElementById('save-score-section').style.display = 'none';
        document.getElementById('default-buttons').style.display = 'flex';
        
        // Update leaderboard display
        this.loadLeaderboard();
        
        console.log('🎮 [GAME] Score saved:', newScore);
    }
    
    skipSaveScore() {
        // Hide save section and show default buttons
        document.getElementById('save-score-section').style.display = 'none';
        document.getElementById('default-buttons').style.display = 'flex';
    }
    
    showLeaderboard() {
        const leaderboardModal = document.getElementById('leaderboard-modal');
        if (leaderboardModal) {
            leaderboardModal.classList.remove('hidden');
            leaderboardModal.style.display = 'flex';
            this.loadLeaderboardModal();
        }
        
        // Setup close button
        const closeBtn = document.querySelector('.close-leaderboard');
        if (closeBtn) {
            closeBtn.onclick = () => this.hideLeaderboard();
        }
        
        // Setup play again button
        const playAgainBtn = document.getElementById('play-again-btn');
        if (playAgainBtn) {
            playAgainBtn.onclick = () => {
                this.hideLeaderboard();
                this.restartGame();
            };
        }
    }
    
    hideLeaderboard() {
        const leaderboardModal = document.getElementById('leaderboard-modal');
        if (leaderboardModal) {
            leaderboardModal.classList.add('hidden');
            leaderboardModal.style.display = 'none';
        }
    }
    
    getStoredScores() {
        try {
            const stored = localStorage.getItem('barrino-game-scores');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('🎮 [GAME] Error loading scores:', error);
            return [];
        }
    }
    
    loadLeaderboard() {
        const leaderboardList = document.getElementById('game-leaderboard-list');
        const noScoresElement = document.querySelector('.no-scores-game');
        
        if (!leaderboardList) return;
        
        const scores = this.getStoredScores();
        
        if (scores.length === 0) {
            if (noScoresElement) {
                noScoresElement.style.display = 'block';
            }
            leaderboardList.innerHTML = '<li class="no-scores-game">Nessun punteggio salvato</li>';
            return;
        }
        
        if (noScoresElement) {
            noScoresElement.style.display = 'none';
        }
        
        leaderboardList.innerHTML = scores.map((score, index) => {
            const rank = index + 1;
            let rankClass = '';
            if (rank === 1) rankClass = 'top-1';
            else if (rank === 2) rankClass = 'top-2';
            else if (rank === 3) rankClass = 'top-3';
            
            return `
                <li class="game-leaderboard-entry ${rankClass}">
                    <span class="rank">${rank}</span>
                    <span class="name">${score.name}</span>
                    <span class="score">${score.score}</span>
                    <span class="date">${score.date}</span>
                </li>
            `;
        }).join('');
    }
    
    loadLeaderboardModal() {
        const leaderboardList = document.getElementById('leaderboard-list');
        const noScoresModal = document.getElementById('no-scores-modal');
        
        if (!leaderboardList) return;
        
        const scores = this.getStoredScores();
        
        if (scores.length === 0) {
            if (noScoresModal) {
                noScoresModal.classList.remove('hidden');
                noScoresModal.style.display = 'block';
            }
            leaderboardList.innerHTML = '';
            return;
        }
        
        if (noScoresModal) {
            noScoresModal.classList.add('hidden');
            noScoresModal.style.display = 'none';
        }
        
        leaderboardList.innerHTML = scores.map((score, index) => {
            const rank = index + 1;
            let rankClass = '';
            if (rank === 1) rankClass = 'top-1';
            else if (rank === 2) rankClass = 'top-2';
            else if (rank === 3) rankClass = 'top-3';
            
            return `
                <li class="leaderboard-entry ${rankClass}">
                    <span class="rank">${rank}</span>
                    <span class="name">${score.name}</span>
                    <span class="score">${score.score}</span>
                    <span class="date">${score.date}</span>
                </li>
            `;
        }).join('');
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