// Game Configuration - Parametri del gioco
export const GAME_CONFIG = {
    // Canvas settings
    canvas: {
        width: 600,
        height: 180
    },
    
    // Player settings (Mario con mestolo)
    player: {
        x: 50,
        y: 140,
        width: 40,
        height: 40,
        jumpPower: 15,
        gravity: 0.8,
        color: '#8B4513',
        groundY: 140, // Y position when on ground
        // Sprite settings per animazioni
        sprites: {
            running: ['src/assets/images/camminata1.png', 'src/assets/images/camminata2.png'],
            jumping: 'src/assets/images/salto.png',
            frameWidth: 40,
            frameHeight: 40,
            animationSpeed: 200 // milliseconds between frames
        }
    },
    
    // Ground settings
    ground: {
        x: 0,
        y: 170,
        width: 600,
        height: 10,
        color: '#8B4513',
        patternColor: '#A0522D',
        patternSize: 20
    },
    
    // Obstacle settings
    obstacles: {
        types: [
            {
                id: 'tavolo',
                width: 30,
                height: 40,
                y: 140,
                sprite: 'src/assets/images/tavolo.png',
                collisionBoxes: [
                    { x: 2, y: 2, width: 26, height: 36 }
                ]
            },
            {
                id: 'pizza',
                width: 25,
                height: 35,
                y: 145,
                sprite: 'src/assets/images/pizza.png',
                collisionBoxes: [
                    { x: 2, y: 2, width: 21, height: 31 }
                ]
            },
            {
                id: 'mestolo',
                width: 35,
                height: 30,
                y: [70, 110], // Due altezze diverse per ostacoli volanti
                sprite: 'src/assets/images/mestolo.png',
                canFly: true,
                flySpeed: 0.05, // Velocità movimento verticale (molto più lenta)
                flyAmplitude: 20, // Ampiezza movimento
                collisionBoxes: [
                    { x: 2, y: 2, width: 31, height: 26 }
                ]
            },
            {
                id: 'caffe',
                width: 28,
                height: 35,
                y: 145,
                sprite: 'src/assets/images/caffe.png',
                collisionBoxes: [
                    { x: 2, y: 2, width: 24, height: 31 }
                ]
            },
            {
                id: 'vino',
                width: 22,
                height: 38,
                y: 142,
                sprite: 'src/assets/images/vino.png',
                collisionBoxes: [
                    { x: 2, y: 2, width: 18, height: 34 }
                ]
            },
            {
                id: 'statua',
                width: 32,
                height: 45,
                y: 135,
                sprite: 'src/assets/images/statua.png',
                collisionBoxes: [
                    { x: 3, y: 3, width: 26, height: 39 }
                ]
            }
        ],
        color: '#228B22',
        minDistance: 200,
        maxDistance: 400,
        baseSpawnDelay: 1500, // milliseconds
        minSpawnDelay: 600,    // milliseconds
        flyingObstacleChance: 0.3, // 30% chance for flying obstacles
        powerUpChance: 0.15 // 15% chance for power-ups
    },
    
    // Power-up settings
    powerUps: {
        types: [
            {
                id: 'pizza_powerup',
                width: 20, // Più piccolo degli ostacoli
                height: 20,
                y: [80, 120, 150], // Tre altezze diverse
                sprite: 'src/assets/images/pizza.png',
                points: 100,
                glowColor: '#FFD700', // Colore bagliore dorato
                glowIntensity: 0.8,
                collisionBoxes: [
                    { x: 2, y: 2, width: 16, height: 16 }
                ]
            }
        ],
        baseSpawnDelay: 3000, // milliseconds
        minSpawnDelay: 2000,
        glowAnimation: {
            speed: 0.05, // Velocità animazione bagliore
            minIntensity: 0.3,
            maxIntensity: 1.0
        }
    },
    
    // Cloud settings
    clouds: {
        count: 4,
        minY: 20,
        maxY: 70,
        minWidth: 40,
        maxWidth: 80,
        minHeight: 20,
        maxHeight: 30,
        minSpeed: 0.3,
        maxSpeed: 1.5,
        color: '#E0E0E0',
        sprite: 'src/assets/images/novele.png'
    },
    
    // Game physics
    physics: {
        initialSpeed: 6,
        acceleration: 0.001,
        maxSpeed: 13,
        jumpCooldown: 300 // milliseconds
    },
    
    // Scoring
    scoring: {
        pointsPerFrame: 0.025,
        speedBonus: 0.01,
        achievementBonus: 100
    },
    
    // Animation settings
    animation: {
        groundSpeed: 3,
        playerRunSpeed: 300, // milliseconds between frames
        obstacleAnimSpeed: 200
    },
    
    // Colors and styling
    colors: {
        background: '#f7f7f7',
        player: '#8B4513',
        playerAccent: '#654321',
        ground: '#8B4513',
        groundPattern: '#A0522D',
        obstacles: '#228B22',
        clouds: '#E0E0E0',
        text: '#8B4513',
        gameOver: 'rgba(139, 69, 19, 0.9)'
    },
    
    // Game states
    states: {
        WAITING: 'waiting',
        RUNNING: 'running',
        CRASHED: 'crashed',
        GAME_OVER: 'game_over'
    },
    
    // Mobile settings
    mobile: {
        touchSensitivity: 10,
        tapToJump: true,
        tapToStart: true,
        preventScroll: true,
        forceOrientation: true, // Force landscape on mobile
        showOrientationNotice: true
    }
};

// Random name generator for anonymous players
export const RANDOM_NAMES = [
    'Mario Veloce', 'Saltatore Pro', 'Ninja del Barrino', 'Campione Anonimo',
    'Corridore Misterioso', 'Eroe Sconosciuto', 'Maestro del Salto', 'Leggenda Nascosta',
    'Asso del Gioco', 'Fenomeno Ignoto', 'Stella Segreta', 'Talento Celato',
    'Virtuoso Velato', 'Genio Incognito', 'Prodigio Privato', 'Mago Misterioso',
    'Esperto Enigmatico', 'Campione Celeste', 'Eroe Eterno', 'Leggenda Luminosa',
    'Saltatore Stellare', 'Corridore Cosmico', 'Ninja Notturno', 'Asso Astrale',
    'Maestro Magico', 'Fenomeno Fantastico', 'Virtuoso Vittorioso', 'Genio Gioioso',
    'Prodigio Perfetto', 'Talento Titanico', 'Stella Splendente', 'Eroe Epico'
];

// Utility function to get random name
export function getRandomPlayerName() {
    return RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
}

// Enhanced Sprite loader utility
export class GameSpriteLoader {
    constructor() {
        this.loadedSprites = new Map();
        this.loadingPromises = new Map();
    }
    
    async loadSprite(key, src) {
        if (this.loadedSprites.has(key)) {
            return this.loadedSprites.get(key);
        }
        
        // Prevent multiple loads of the same sprite
        if (this.loadingPromises.has(key)) {
            return this.loadingPromises.get(key);
        }
        
        const loadPromise = new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.loadedSprites.set(key, img);
                this.loadingPromises.delete(key);
                console.log(`🎮 [SPRITES] Loaded: ${key} from ${src}`);
                resolve(img);
            };
            img.onerror = () => {
                console.warn(`🎮 [SPRITES] Failed to load sprite: ${src}`);
                this.loadingPromises.delete(key);
                resolve(null);
            };
            img.src = src;
        });
        
        this.loadingPromises.set(key, loadPromise);
        return loadPromise;
    }
    
    getSprite(key) {
        return this.loadedSprites.get(key);
    }
    
    hasSprite(key) {
        return this.loadedSprites.has(key);
    }
    
    clearCache() {
        this.loadedSprites.clear();
        this.loadingPromises.clear();
    }
}

// Initialize sprite loader
export const spriteLoader = new GameSpriteLoader();

// Load sprites if enabled
export async function initializeSprites() {
    console.log('🎮 [SPRITES] Loading game sprites...');
    const loadPromises = [];
    
    // Load player sprites (running animation)
    loadPromises.push(
        spriteLoader.loadSprite('player_run1', GAME_CONFIG.player.sprites.running[0])
    );
    loadPromises.push(
        spriteLoader.loadSprite('player_run2', GAME_CONFIG.player.sprites.running[1])
    );
    loadPromises.push(
        spriteLoader.loadSprite('player_jump', GAME_CONFIG.player.sprites.jumping)
    );
    
    // Load obstacle sprites
    GAME_CONFIG.obstacles.types.forEach((obstacleType) => {
        loadPromises.push(
            spriteLoader.loadSprite(`obstacle_${obstacleType.id}`, obstacleType.sprite)
        );
    });
    
    // Load cloud sprite
    loadPromises.push(
        spriteLoader.loadSprite('cloud', GAME_CONFIG.clouds.sprite)
    );
    
    try {
        await Promise.all(loadPromises);
        console.log('🎮 [SPRITES] All sprites loaded successfully');
        console.log('🎮 [SPRITES] Loaded sprites:', Array.from(spriteLoader.loadedSprites.keys()));
        return true;
    } catch (error) {
        console.warn('🎮 [SPRITES] Some sprites failed to load, using fallback graphics');
        return false;
    }
}

// Utility functions for game calculations
export const GameUtils = {
    // Calculate distance between two points
    getDistance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    },
    
    // Check collision between two rectangles with tolerance
    checkCollision(rect1, rect2, tolerance = 2) {
        return rect1.x + tolerance < rect2.x + rect2.width - tolerance &&
               rect1.x + rect1.width - tolerance > rect2.x + tolerance &&
               rect1.y + tolerance < rect2.y + rect2.height - tolerance &&
               rect1.y + rect1.height - tolerance > rect2.y + tolerance;
    },
    
    // Get random obstacle type
    getRandomObstacleType() {
        const types = GAME_CONFIG.obstacles.types;
        
        // Separate flying and ground obstacles
        const flyingTypes = types.filter(type => type.canFly);
        const groundTypes = types.filter(type => !type.canFly);
        
        // Decide if we want a flying obstacle
        const shouldSpawnFlying = Math.random() < GAME_CONFIG.obstacles.flyingObstacleChance;
        
        if (shouldSpawnFlying && flyingTypes.length > 0) {
            return flyingTypes[Math.floor(Math.random() * flyingTypes.length)];
        } else {
            return groundTypes[Math.floor(Math.random() * groundTypes.length)];
        }
    },
    
    // Get random power-up type
    getRandomPowerUpType() {
        const types = GAME_CONFIG.powerUps.types;
        return types[Math.floor(Math.random() * types.length)];
    },
    
    // Calculate spawn distance based on speed
    getSpawnDelay(currentSpeed) {
        const baseDelay = GAME_CONFIG.obstacles.baseSpawnDelay;
        const minDelay = GAME_CONFIG.obstacles.minSpawnDelay;
        const speedRatio = currentSpeed / GAME_CONFIG.physics.initialSpeed;
        const delay = Math.max(minDelay, baseDelay - (speedRatio - 1) * 200);
        return delay + Math.random() * 300; // Add some randomness
    },
    
    // Calculate power-up spawn delay
    getPowerUpSpawnDelay(currentSpeed) {
        const baseDelay = GAME_CONFIG.powerUps.baseSpawnDelay;
        const minDelay = GAME_CONFIG.powerUps.minSpawnDelay;
        const speedRatio = currentSpeed / GAME_CONFIG.physics.initialSpeed;
        const delay = Math.max(minDelay, baseDelay - (speedRatio - 1) * 100);
        return delay + Math.random() * 500; // Add some randomness
    },
    // Mobile detection
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               window.innerWidth <= 768;
    },
    
    // Orientation detection
    isPortrait() {
        return window.innerHeight > window.innerWidth;
    },
    
    // Check if device supports orientation
    supportsOrientation() {
        return 'orientation' in window || 'onorientationchange' in window;
    }
}