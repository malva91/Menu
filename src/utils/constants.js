// Constants and Static Data
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
    PRODUCTS: 'products',
    CATEGORIES: 'categories',
    TRANSLATIONS: 'translations',
    LANGUAGES: 'languages'
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

export const CATEGORY_ICONS = {
    'caffetteria': 'fas fa-coffee',
    'bevande_calde': 'fas fa-mug-hot',
    'bevande_fredde': 'fas fa-glass-water',
    'dolci': 'fas fa-birthday-cake',
    'salato': 'fas fa-hamburger',
    'aperitivi': 'fas fa-cocktail',
    'vini': 'fas fa-wine-glass',
    'birre': 'fas fa-beer'
};

// Translation keys structure for validation
export const TRANSLATION_KEYS = {
    // UI Interface
    ui: [
        'search_placeholder',
        'loading',
        'no_results',
        'no_results_desc',
        'legend_title',
        'legend_explanation',
        'legend_allergens_title',
        'legend_characteristics_title',
        'filter_allergens',
        'disclaimer_shared',
        'disclaimer_service',
        'review_title',
        'review_subtitle',
        'review_button',
        'language_selector_title'
    ],
    
    // Game
    game: [
        'game_title',
        'game_subtitle',
        'game_invitation_title',
        'game_invitation_subtitle',
        'game_button_text',
        'instructions_title',
        'instruction_1',
        'instruction_2',
        'instruction_3',
        'instruction_4',
        'score_label',
        'high_score_label',
        'speed_label',
        'game_controls_text',
        'back_to_menu_text',
        'game_over_title',
        'new_record_title',
        'final_score_text',
        'restart_text',
        'leaderboard_text',
        'leaderboard_title',
        'leaderboard_main_title',
        'no_scores_text',
        'save_score_label',
        'player_name_placeholder',
        'save_score',
        'skip_save',
        'orientation_title',
        'orientation_message',
        'continue_portrait_text'
    ],
    
    // Allergens
    allergens: [
        'glutine',
        'crostacei',
        'uova',
        'pesce',
        'arachidi',
        'soia',
        'latte',
        'frutta_guscio',
        'sedano',
        'senape',
        'sesamo',
        'solfiti',
        'lupini',
        'molluschi',
        'alcol'
    ],
    
    // Tags
    tags: [
        'maiale',
        'pollo',
        'vegetariano',
        'congelato'
    ]
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