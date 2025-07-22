// Translation Service - Completely rewritten for new data structure
class TranslationService {
    constructor() {
        this.currentLanguage = 'it';
        this.defaultData = null;
        this.languageData = null;
        this.availableLanguages = [];
        this.isLoaded = false;
        
        this.init();
    }

    async init() {
        console.log('🌍 [TRANSLATION] Initializing translation service...');
        
        // Get language from localStorage or detect browser language
        this.currentLanguage = localStorage.getItem('app-language') || 
                              this.detectBrowserLanguage() || 'it';
        
        // Wait for Firebase service
        await this.waitForFirebaseService();
        
        // Load available languages
        await this.loadAvailableLanguages();
        
        // Load default data and current language data
        await this.loadData();
        
        this.isLoaded = true;
        console.log('🌍 [TRANSLATION] Service initialized for language:', this.currentLanguage);
        
        // Update UI
        this.updateUILanguage();
    }

    async waitForFirebaseService() {
        let attempts = 0;
        const maxAttempts = 50;
        
        while (!window.firebaseService?.isInitialized && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
    }

    detectBrowserLanguage() {
        const browserLang = navigator.language.split('-')[0];
        return browserLang;
    }

    async loadAvailableLanguages() {
        try {
            this.availableLanguages = await window.firebaseService.getAvailableLanguages();
            console.log('🌍 [TRANSLATION] Available languages:', this.availableLanguages);
        } catch (error) {
            console.error('🌍 [TRANSLATION] Error loading available languages:', error);
            this.availableLanguages = ['it'];
        }
    }

    async loadData() {
        try {
            // Load default data (products, categories structure)
            this.defaultData = await window.firebaseService.getDefaultData();
            
            // Load current language data (translations)
            this.languageData = await window.firebaseService.getLanguageData(this.currentLanguage);
            
            console.log('🌍 [TRANSLATION] Data loaded for language:', this.currentLanguage);
        } catch (error) {
            console.error('🌍 [TRANSLATION] Error loading data:', error);
            this.defaultData = { products: [], categories: [] };
            this.languageData = window.firebaseService.getEmptyLanguageData();
        }
    }

    // Main translation function
    t(key, fallback = null) {
        if (!this.languageData || !this.languageData.testi) {
            return fallback || key;
        }
        
        const translation = this.languageData.testi[key];
        if (translation) {
            return translation;
        }
        
        // Fallback to Italian if current language is not Italian
        if (this.currentLanguage !== 'it') {
            // Try to load Italian fallback (this could be cached)
            // For now, return the fallback or key
        }
        
        return fallback || key;
    }

    // Get allergen translation
    getAllergen(key) {
        if (!this.languageData || !this.languageData.allergeni) {
            return key;
        }
        
        return this.languageData.allergeni[key] || key;
    }

    // Get product translation
    getProduct(productId, field = 'name') {
        if (!this.languageData || !this.languageData.products || !this.languageData.products[productId]) {
            return '';
        }
        
        return this.languageData.products[productId][field] || '';
    }

    // Get category translation
    getCategory(categoryId) {
        if (!this.languageData || !this.languageData.categories) {
            return categoryId;
        }
        
        return this.languageData.categories[categoryId] || categoryId;
    }

    // Get merged products (default data + translations)
    getMergedProducts() {
        if (!this.defaultData || !this.defaultData.products) {
            return [];
        }
        
        return this.defaultData.products.map(product => ({
            ...product,
            name: this.getProduct(product.id, 'name'),
            description: this.getProduct(product.id, 'description')
        }));
    }

    // Get merged categories (default data + translations)
    getMergedCategories() {
        if (!this.defaultData || !this.defaultData.categories) {
            return [];
        }
        
        return this.defaultData.categories.map(category => ({
            ...category,
            name: this.getCategory(category.id)
        }));
    }

    // Change language
    async changeLanguage(language) {
        if (!this.availableLanguages.includes(language)) {
            console.warn('🌍 [TRANSLATION] Language not available:', language);
            return false;
        }
        
        this.currentLanguage = language;
        localStorage.setItem('app-language', language);
        
        // Load new language data
        await this.loadData();
        
        // Update UI
        this.updateUILanguage();
        
        console.log('🌍 [TRANSLATION] Language changed to:', language);
        return true;
    }

    // Update UI language
    updateUILanguage() {
        // Update HTML lang attribute
        document.documentElement.lang = this.currentLanguage;
        
        // Update text direction
        if (this.languageData && this.languageData.tagLingua) {
            document.body.dir = this.languageData.tagLingua.direction || 'ltr';
        }
        
        // Update current language display
        const currentLangElement = document.getElementById('current-language');
        const currentLangGameElement = document.getElementById('current-language-game');
        
        if (this.languageData && this.languageData.tagLingua) {
            const flag = this.languageData.tagLingua.flag || '🌐';
            if (currentLangElement) currentLangElement.innerHTML = flag;
            if (currentLangGameElement) currentLangGameElement.innerHTML = flag;
        }
        
        // Update all translatable elements
        this.updateTranslatableElements();
    }

    // Update elements with data-translate attribute
    updateTranslatableElements() {
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.dataset.translate;
            const translation = this.t(key);
            
            if (translation && translation !== key) {
                if (element.tagName === 'INPUT' && (element.type === 'text' || element.type === 'search')) {
                    element.placeholder = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });
    }

    // Get available languages for UI
    getAvailableLanguagesForUI() {
        return this.availableLanguages.map(langCode => {
            // We need to load each language's tagLingua data
            // For now, return basic info
            return {
                code: langCode,
                name: langCode.toUpperCase(),
                flag: this.getDefaultFlag(langCode)
            };
        });
    }

    getDefaultFlag(langCode) {
        const flags = {
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
        return flags[langCode] || '🌐';
    }

    // Admin methods
    async saveLanguageData(language, data) {
        try {
            await window.firebaseService.saveLanguageData(language, data);
            
            // Reload if it's current language
            if (language === this.currentLanguage) {
                await this.loadData();
                this.updateUILanguage();
            }
            
            console.log('🌍 [TRANSLATION] Language data saved:', language);
            return true;
        } catch (error) {
            console.error('🌍 [TRANSLATION] Error saving language data:', error);
            throw error;
        }
    }

    async createLanguage(languageCode, languageInfo) {
        try {
            await window.firebaseService.createLanguage(languageCode, languageInfo);
            await this.loadAvailableLanguages();
            console.log('🌍 [TRANSLATION] Language created:', languageCode);
            return true;
        } catch (error) {
            console.error('🌍 [TRANSLATION] Error creating language:', error);
            throw error;
        }
    }

    async deleteLanguage(languageCode) {
        try {
            await window.firebaseService.deleteLanguage(languageCode);
            await this.loadAvailableLanguages();
            
            // If current language was deleted, switch to Italian
            if (languageCode === this.currentLanguage) {
                await this.changeLanguage('it');
            }
            
            console.log('🌍 [TRANSLATION] Language deleted:', languageCode);
            return true;
        } catch (error) {
            console.error('🌍 [TRANSLATION] Error deleting language:', error);
            throw error;
        }
    }

    async exportLanguage(languageCode) {
        try {
            const exportData = await window.firebaseService.exportLanguage(languageCode);
            console.log('🌍 [TRANSLATION] Language exported:', languageCode);
            return exportData;
        } catch (error) {
            console.error('🌍 [TRANSLATION] Error exporting language:', error);
            throw error;
        }
    }

    async importLanguage(importData) {
        try {
            await window.firebaseService.importLanguage(importData);
            await this.loadAvailableLanguages();
            
            // Reload if it's current language
            if (importData.language === this.currentLanguage) {
                await this.loadData();
                this.updateUILanguage();
            }
            
            console.log('🌍 [TRANSLATION] Language imported:', importData.language);
            return true;
        } catch (error) {
            console.error('🌍 [TRANSLATION] Error importing language:', error);
            throw error;
        }
    }

    // Get current language data for admin
    getCurrentLanguageData() {
        return this.languageData;
    }

    // Get default data for admin
    getDefaultData() {
        return this.defaultData;
    }

    // Reload data (useful after admin changes)
    async reloadData() {
        await this.loadData();
        this.updateUILanguage();
    }
}

// Initialize translation service
window.translationService = new TranslationService();

export default TranslationService;