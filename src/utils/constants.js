// Constants and Static Data - Simplified for new structure
// Only data that never changes and doesn't need database storage

// Firebase configuration
export const FIREBASE_CONFIG = {
    apiKey: "AIzaSyBqJzQ5kZ8X9Y2W3V4U5T6R7E8D9C0B1A2",
    authDomain: "orechiosco.firebaseapp.com",
    projectId: "orechiosco",
    storageBucket: "orechiosco.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456789012345678"
};

// Admin configuration
export const ADMIN_PASSWORD = 'barrino2025';

// Cache configuration
export const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
export const CACHE_KEYS = {
    DEFAULT_DATA: 'default_data',
    LANGUAGE_DATA: 'language_data',
    AVAILABLE_LANGUAGES: 'available_languages'
};

// Static emojis (these don't need translation)
export const ALLERGEN_EMOJIS = {
    'glutine': '🌾',
    'crostacei': '🦞',
    'uova': '🥚',
    'pesce': '🐟',
    'arachidi': '🥜',
    'soia': '🌿',
    'latte': '🥛',
    'frutta_guscio': '🌰',
    'sedano': '🥬',
    'senape': '🟡',
    'sesamo': '⚪',
    'solfiti': '🧪',
    'lupini': '🌕',
    'molluschi': '🦑',
    'alcol': '🍷'
};

export const TAG_EMOJIS = {
    'maiale': '🐷',
    'pollo': '🍗',
    'vegetariano': '🥦',
    'congelato': '❄️'
};

// Default language flags (static)
export const DEFAULT_LANGUAGE_FLAGS = {
    'it': '🇮🇹',
    'en': '🇬🇧',
    'fr': '🇫🇷',
    'de': '🇩🇪',
    'es': '🇪🇸',
    'pt': '🇵🇹',
    'ru': '🇷🇺',
    'zh': '🇨🇳',
    'ja': '🇯🇵',
    'ar': '🇸🇦'
};

// Available allergens list (for admin forms)
export const AVAILABLE_ALLERGENS = [
    'glutine', 'crostacei', 'uova', 'pesce', 'arachidi', 'soia', 'latte',
    'frutta_guscio', 'sedano', 'senape', 'sesamo', 'solfiti', 'lupini', 
    'molluschi', 'alcol'
];

// Available tags list (for admin forms)
export const AVAILABLE_TAGS = [
    'maiale', 'pollo', 'vegetariano', 'congelato'
];

// Default category icons
export const DEFAULT_CATEGORY_ICONS = {
    'caffetteria': 'fas fa-coffee',
    'bevande_calde': 'fas fa-mug-hot',
    'bevande_fredde': 'fas fa-glass-water',
    'dolci': 'fas fa-birthday-cake',
    'salato': 'fas fa-hamburger',
    'aperitivi': 'fas fa-cocktail',
    'vini': 'fas fa-wine-glass',
    'birre': 'fas fa-beer'
};