// Translation Service - New centralized translation system
import { TRANSLATION_KEYS, DEFAULT_LANGUAGE_FLAGS } from '../utils/constants.js';

class TranslationService {
    constructor() {
        this.currentLanguage = 'it';
        this.availableLanguages = {};
        this.translations = {};
        this.fallbackTranslations = {};
        this.isLoaded = false;
        
        this.init();
    }

    async init() {
        // Get language from localStorage or detect browser language
        this.currentLanguage = localStorage.getItem('app-language') || 
                              this.detectBrowserLanguage() || 'it';
        
        await this.loadLanguages();
        await this.loadTranslations();
        
        this.isLoaded = true;
        console.log('🌍 [TRANSLATION] Service initialized for language:', this.currentLanguage);
    }

    detectBrowserLanguage() {
        const browserLang = navigator.language.split('-')[0];
        return browserLang;
    }

    async loadLanguages() {
        try {
            this.availableLanguages = await window.firebaseService.getLanguages();
            console.log('🌍 [TRANSLATION] Loaded languages:', Object.keys(this.availableLanguages));
        } catch (error) {
            console.error('🌍 [TRANSLATION] Error loading languages:', error);
            this.availableLanguages = {
                it: { name: 'Italiano', flag: '🇮🇹', direction: 'ltr', active: true, isDefault: true }
            };
        }
    }

    async loadTranslations(language = null) {
        const targetLanguage = language || this.currentLanguage;
        
        try {
            const translations = await window.firebaseService.getTranslations(targetLanguage);
            
            if (language) {
                this.translations[language] = translations;
            } else {
                this.translations[targetLanguage] = translations;
            }
            
            console.log('🌍 [TRANSLATION] Loaded translations for:', targetLanguage);
        } catch (error) {
            console.error('🌍 [TRANSLATION] Error loading translations:', error);
            
            // Create fallback translations
            if (!this.translations[targetLanguage]) {
                this.translations[targetLanguage] = this.createEmptyTranslationStructure();
            }
        }
    }

    createEmptyTranslationStructure() {
        const structure = {};
        
        Object.entries(TRANSLATION_KEYS).forEach(([category, keys]) => {
            structure[category] = {};
            keys.forEach(key => {
                structure[category][key] = '';
            });
        });
        
        return structure;
    }

    // Get translation
    t(category, key, language = null) {
        const targetLanguage = language || this.currentLanguage;
        const langTranslations = this.translations[targetLanguage] || {};
        
        if (langTranslations[category] && langTranslations[category][key]) {
            return langTranslations[category][key];
        }
        
        // Fallback to Italian if available
        if (targetLanguage !== 'it' && this.translations.it) {
            const fallback = this.translations.it[category];
            if (fallback && fallback[key]) {
                return fallback[key];
            }
        }
        
        // Return key as fallback
        return key;
    }

    // Get product translation
    getProductTranslation(product, field, language = null) {
        const targetLanguage = language || this.currentLanguage;
        
        if (product.translations && product.translations[targetLanguage]) {
            return product.translations[targetLanguage][field] || '';
        }
        
        // Fallback to Italian
        if (targetLanguage !== 'it' && product.translations && product.translations.it) {
            return product.translations.it[field] || '';
        }
        
        return '';
    }

    // Get category translation
    getCategoryTranslation(category, language = null) {
        const targetLanguage = language || this.currentLanguage;
        
        if (category.translations && category.translations[targetLanguage]) {
            return category.translations[targetLanguage];
        }
        
        // Fallback to Italian
        if (targetLanguage !== 'it' && category.translations && category.translations.it) {
            return category.translations.it;
        }
        
        return category.id;
    }

    // Language management
    async changeLanguage(language) {
        if (!this.availableLanguages[language]) {
            console.warn('🌍 [TRANSLATION] Language not available:', language);
            return false;
        }
        
        this.currentLanguage = language;
        localStorage.setItem('app-language', language);
        
        // Load translations if not already loaded
        if (!this.translations[language]) {
            await this.loadTranslations(language);
        }
        
        // Update UI
        this.updateUILanguage();
        
        console.log('🌍 [TRANSLATION] Language changed to:', language);
        return true;
    }

    updateUILanguage() {
        // Update HTML lang attribute
        document.documentElement.lang = this.currentLanguage;
        
        // Update text direction for RTL languages
        const langData = this.availableLanguages[this.currentLanguage];
        if (langData && langData.direction === 'rtl') {
            document.body.dir = 'rtl';
        } else {
            document.body.dir = 'ltr';
        }
        
        // Update current language display
        const currentLangElement = document.getElementById('current-language');
        if (currentLangElement && langData) {
            currentLangElement.textContent = langData.flag || DEFAULT_LANGUAGE_FLAGS[this.currentLanguage] || '🌐';
        }
        
        // Update all translatable elements
        this.updateTranslatableElements();
    }

    updateTranslatableElements() {
        // Update elements with data-translate attribute
        document.querySelectorAll('[data-translate]').forEach(element => {
            const [category, key] = element.dataset.translate.split('.');
            if (category && key) {
                const translation = this.t(category, key);
                if (translation) {
                    if (element.tagName === 'INPUT' && element.type === 'text') {
                        element.placeholder = translation;
                    } else {
                        element.textContent = translation;
                    }
                }
            }
        });
    }

    // Get available languages for UI
    getAvailableLanguages() {
        return Object.entries(this.availableLanguages)
            .filter(([code, data]) => data.active !== false)
            .map(([code, data]) => ({
                code,
                name: data.name,
                flag: data.flag || DEFAULT_LANGUAGE_FLAGS[code] || '🌐',
                direction: data.direction || 'ltr',
                isDefault: data.isDefault || false
            }));
    }

    // Admin methods
    async saveTranslations(language, translations) {
        try {
            await window.firebaseService.saveTranslations(language, translations);
            this.translations[language] = translations;
            console.log('🌍 [TRANSLATION] Translations saved for:', language);
            return true;
        } catch (error) {
            console.error('🌍 [TRANSLATION] Error saving translations:', error);
            throw error;
        }
    }

    async createLanguage(code, data) {
        try {
            // Add to languages
            this.availableLanguages[code] = data;
            await window.firebaseService.saveLanguages(this.availableLanguages);
            
            // Create empty translation structure
            const emptyTranslations = this.createEmptyTranslationStructure();
            await this.saveTranslations(code, emptyTranslations);
            
            console.log('🌍 [TRANSLATION] Language created:', code);
            return true;
        } catch (error) {
            console.error('🌍 [TRANSLATION] Error creating language:', error);
            throw error;
        }
    }

    async deleteLanguage(code) {
        if (this.availableLanguages[code]?.isDefault) {
            throw new Error('Cannot delete default language');
        }
        
        try {
            // Remove from languages
            delete this.availableLanguages[code];
            await window.firebaseService.saveLanguages(this.availableLanguages);
            
            // Delete translations
            await window.firebaseService.deleteTranslations(code);
            delete this.translations[code];
            
            console.log('🌍 [TRANSLATION] Language deleted:', code);
            return true;
        } catch (error) {
            console.error('🌍 [TRANSLATION] Error deleting language:', error);
            throw error;
        }
    }

    // Export translations for specific language
    async exportLanguageTranslations(language) {
        try {
            const translations = await window.firebaseService.getTranslations(language);
            const exportData = {
                language: language,
                languageData: this.availableLanguages[language],
                translations: translations,
                exportDate: new Date().toISOString(),
                version: '2.0'
            };
            
            return exportData;
        } catch (error) {
            console.error('🌍 [TRANSLATION] Error exporting language translations:', error);
            throw error;
        }
    }

    // Import translations for specific language
    async importLanguageTranslations(data) {
        try {
            if (!data.language || !data.translations) {
                throw new Error('Invalid translation data format');
            }
            
            // Update language data if provided
            if (data.languageData) {
                this.availableLanguages[data.language] = data.languageData;
                await window.firebaseService.saveLanguages(this.availableLanguages);
            }
            
            // Save translations
            await this.saveTranslations(data.language, data.translations);
            
            console.log('🌍 [TRANSLATION] Language translations imported:', data.language);
            return true;
        } catch (error) {
            console.error('🌍 [TRANSLATION] Error importing language translations:', error);
            throw error;
        }
    }
}

// Initialize translation service
window.translationService = new TranslationService();

export default TranslationService;