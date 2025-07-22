// Database Importer - Popola il database con i dati dal JSON
class DatabaseImporter {
    constructor() {
        this.jsonData = null;
        this.defaultData = { products: [], categories: [] };
        this.languageData = {};
        this.availableLanguages = [];
    }

    async importFromJSON(jsonData) {
        console.log('📥 [IMPORTER] Starting database import...');
        this.jsonData = jsonData;
        
        try {
            // 1. Processa i dati di default (products, categories)
            this.processDefaultData();
            
            // 2. Processa le traduzioni per ogni lingua
            this.processLanguageData();
            
            // 3. Salva tutto nel database
            await this.saveToDatabase();
            
            console.log('📥 [IMPORTER] Import completed successfully!');
            return true;
        } catch (error) {
            console.error('📥 [IMPORTER] Import failed:', error);
            throw error;
        }
    }

    processDefaultData() {
        console.log('📥 [IMPORTER] Processing default data...');
        
        // Processa prodotti - rimuove le traduzioni e mantiene solo i dati strutturali
        this.defaultData.products = this.jsonData.database.products.map(product => ({
            id: product.id,
            category: product.category,
            price: product.price,
            visible: product.visible,
            allergens: product.allergens || [],
            tags: product.tags || []
        }));

        // Processa categorie - rimuove le traduzioni e mantiene solo i dati strutturali
        this.defaultData.categories = this.jsonData.database.categories.map(category => ({
            id: category.id,
            visible: category.visible,
            order: category.order || 0,
            icon: this.getCategoryIcon(category.id)
        }));

        console.log('📥 [IMPORTER] Default data processed:', {
            products: this.defaultData.products.length,
            categories: this.defaultData.categories.length
        });
    }

    getCategoryIcon(categoryId) {
        const icons = {
            'caffetteria': 'fas fa-coffee',
            'bevande_calde': 'fas fa-mug-hot',
            'bevande_fredde': 'fas fa-glass-water',
            'dolci': 'fas fa-birthday-cake',
            'salato': 'fas fa-hamburger',
            'aperitivi': 'fas fa-cocktail',
            'vini': 'fas fa-wine-glass',
            'birre': 'fas fa-beer'
        };
        return icons[categoryId] || 'fas fa-utensils';
    }

    processLanguageData() {
        console.log('📥 [IMPORTER] Processing language data...');
        
        // Estrai le lingue disponibili dalle traduzioni
        const languagesFromTranslations = Object.keys(this.jsonData.database.translations);
        const languagesFromProducts = new Set();
        const languagesFromCategories = new Set();

        // Trova tutte le lingue dai prodotti
        this.jsonData.database.products.forEach(product => {
            if (product.translations) {
                Object.keys(product.translations).forEach(lang => {
                    languagesFromProducts.add(lang);
                });
            }
        });

        // Trova tutte le lingue dalle categorie
        this.jsonData.database.categories.forEach(category => {
            if (category.translations) {
                Object.keys(category.translations).forEach(lang => {
                    languagesFromCategories.add(lang);
                });
            }
        });

        // Combina tutte le lingue
        this.availableLanguages = [...new Set([
            ...languagesFromTranslations,
            ...languagesFromProducts,
            ...languagesFromCategories
        ])].filter(lang => lang !== '_languages');

        console.log('📥 [IMPORTER] Found languages:', this.availableLanguages);

        // Processa ogni lingua
        this.availableLanguages.forEach(lang => {
            this.languageData[lang] = this.processLanguage(lang);
        });
    }

    processLanguage(languageCode) {
        console.log(`📥 [IMPORTER] Processing language: ${languageCode}`);
        
        const langData = {
            tagLingua: this.getLanguageInfo(languageCode),
            allergeni: this.getAllergenTranslations(languageCode),
            testi: this.getTextTranslations(languageCode),
            products: this.getProductTranslations(languageCode),
            categories: this.getCategoryTranslations(languageCode)
        };

        return langData;
    }

    getLanguageInfo(languageCode) {
        const languagesInfo = this.jsonData.database.translations._languages;
        
        if (languagesInfo && languagesInfo[languageCode]) {
            return languagesInfo[languageCode];
        }

        // Fallback per lingue non definite
        const defaultFlags = {
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

        const defaultNames = {
            'it': 'Italiano',
            'en': 'English',
            'fr': 'Français',
            'de': 'Deutsch',
            'es': 'Español',
            'pt': 'Português',
            'ru': 'Русский',
            'zh': '中文',
            'ja': '日本語',
            'ar': 'العربية'
        };

        return {
            active: true,
            flag: defaultFlags[languageCode] || '🌐',
            direction: languageCode === 'ar' ? 'rtl' : 'ltr',
            name: defaultNames[languageCode] || languageCode.toUpperCase()
        };
    }

    getAllergenTranslations(languageCode) {
        const translations = this.jsonData.database.translations[languageCode];
        if (!translations) return {};

        const allergens = {};
        const allergenKeys = [
            'glutine', 'crostacei', 'uova', 'pesce', 'arachidi', 'soia', 'latte',
            'frutta_guscio', 'sedano', 'senape', 'sesamo', 'solfiti', 'lupini', 
            'molluschi', 'alcol'
        ];

        allergenKeys.forEach(key => {
            if (translations[key]) {
                allergens[key] = translations[key];
            }
        });

        return allergens;
    }

    getTextTranslations(languageCode) {
        const translations = this.jsonData.database.translations[languageCode];
        if (!translations) return {};

        const texts = {};
        const textKeys = [
            'search_placeholder', 'loading', 'no_results', 'no_results_desc',
            'legend_title', 'legend_explanation', 'legend_allergens_title', 'legend_characteristics_title',
            'filter_allergens', 'disclaimer_shared', 'disclaimer_service',
            'review_title', 'review_subtitle', 'review_button',
            'language_selector_title', 'game_title', 'game_subtitle',
            'game_invitation_title', 'game_invitation_subtitle', 'game_button_text',
            'instructions_title', 'instruction_1', 'instruction_2', 'instruction_3', 'instruction_4',
            'score_label', 'high_score_label', 'speed_label', 'game_controls_text',
            'back_to_menu_text', 'game_over_title', 'final_score_text', 'restart_text',
            'leaderboard_text', 'leaderboard_title', 'leaderboard_main_title', 'no_scores_text',
            'save_score_label', 'player_name_placeholder', 'save_score', 'skip_save',
            'orientation_title', 'orientation_message', 'continue_portrait_text',
            'new_record_title', 'random_name_suggestion', 'use_suggestion', 'play_again',
            'no_scores_modal_text', 'orientation_note'
        ];

        textKeys.forEach(key => {
            if (translations[key]) {
                texts[key] = translations[key];
            }
        });

        // Aggiungi anche le traduzioni per caratteristiche
        const characteristicKeys = ['vegetariano', 'maiale', 'pollo'];
        characteristicKeys.forEach(key => {
            if (translations[key]) {
                texts[key] = translations[key];
            }
        });

        return texts;
    }

    getProductTranslations(languageCode) {
        const products = {};
        
        this.jsonData.database.products.forEach(product => {
            if (product.translations && product.translations[languageCode]) {
                products[product.id] = {
                    name: product.translations[languageCode].name || '',
                    description: product.translations[languageCode].description || ''
                };
            } else {
                // Crea entry vuota per prodotti senza traduzione
                products[product.id] = {
                    name: '',
                    description: ''
                };
            }
        });

        return products;
    }

    getCategoryTranslations(languageCode) {
        const categories = {};
        
        this.jsonData.database.categories.forEach(category => {
            if (category.translations && category.translations[languageCode]) {
                categories[category.id] = category.translations[languageCode];
            } else {
                // Usa l'ID come fallback
                categories[category.id] = category.id;
            }
        });

        return categories;
    }

    async saveToDatabase() {
        console.log('📥 [IMPORTER] Saving to database...');
        
        if (!window.firebaseService?.isInitialized) {
            throw new Error('Firebase service not initialized');
        }

        try {
            // 1. Salva i dati di default
            console.log('📥 [IMPORTER] Saving default data...');
            await window.firebaseService.saveDefaultData(this.defaultData);

            // 2. Salva i dati per ogni lingua
            for (const [languageCode, langData] of Object.entries(this.languageData)) {
                console.log(`📥 [IMPORTER] Saving language data for: ${languageCode}`);
                await window.firebaseService.saveLanguageData(languageCode, langData);
            }

            console.log('📥 [IMPORTER] All data saved successfully!');
        } catch (error) {
            console.error('📥 [IMPORTER] Error saving to database:', error);
            throw error;
        }
    }

    // Metodo per importare da file JSON caricato
    async importFromFile(file) {
        try {
            const text = await file.text();
            const jsonData = JSON.parse(text);
            return await this.importFromJSON(jsonData);
        } catch (error) {
            console.error('📥 [IMPORTER] Error reading file:', error);
            throw new Error('Errore nella lettura del file JSON: ' + error.message);
        }
    }

    // Metodo per importare da URL
    async importFromURL(url) {
        try {
            const response = await fetch(url);
            const jsonData = await response.json();
            return await this.importFromJSON(jsonData);
        } catch (error) {
            console.error('📥 [IMPORTER] Error fetching from URL:', error);
            throw new Error('Errore nel caricamento da URL: ' + error.message);
        }
    }
}

// Esporta per uso globale
window.DatabaseImporter = DatabaseImporter;
export default DatabaseImporter;