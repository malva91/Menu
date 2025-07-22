import { FIREBASE_CONFIG, CACHE_KEYS, CACHE_DURATION } from '../utils/constants.js';

// Firebase Service - Completely rewritten for new data structure
class FirebaseService {
    constructor() {
        this.db = null;
        this.isInitialized = false;
        this.cache = new Map();
        this.cacheTimestamps = new Map();
        this.initFirebase();
    }

    initFirebase() {
        try {
            firebase.initializeApp(FIREBASE_CONFIG);
            this.db = firebase.firestore();
            this.isInitialized = true;
            console.log('🔥 [FIREBASE] Initialized successfully');
        } catch (error) {
            console.error('🔥 [FIREBASE] Initialization failed:', error);
            this.isInitialized = false;
        }
    }

    // Cache management
    isCacheValid(key) {
        const timestamp = this.cacheTimestamps.get(key);
        if (!timestamp) return false;
        return (Date.now() - timestamp) < CACHE_DURATION;
    }

    setCache(key, data) {
        this.cache.set(key, data);
        this.cacheTimestamps.set(key, Date.now());
    }

    clearCache(type = null) {
        if (type) {
            this.cache.delete(type);
            this.cacheTimestamps.delete(type);
        } else {
            this.cache.clear();
            this.cacheTimestamps.clear();
        }
        console.log('🔥 [FIREBASE] Cache cleared:', type || 'all');
    }

    // NEW STRUCTURE: Load default data (products, categories structure)
    async getDefaultData() {
        if (!this.isInitialized) return this.getEmptyDefaultData();

        if (this.cache.has(CACHE_KEYS.DEFAULT_DATA) && this.isCacheValid(CACHE_KEYS.DEFAULT_DATA)) {
            return this.cache.get(CACHE_KEYS.DEFAULT_DATA);
        }

        try {
            const doc = await this.db.collection('data').doc('default').get();
            let defaultData = {};
            
            if (doc.exists) {
                defaultData = doc.data();
            } else {
                defaultData = this.getEmptyDefaultData();
                await this.saveDefaultData(defaultData);
            }
            
            this.setCache(CACHE_KEYS.DEFAULT_DATA, defaultData);
            console.log('🔥 [FIREBASE] Loaded default data:', Object.keys(defaultData));
            return defaultData;
        } catch (error) {
            console.error('🔥 [FIREBASE] Error loading default data:', error);
            return this.getEmptyDefaultData();
        }
    }

    getEmptyDefaultData() {
        return {
            products: [],
            categories: []
        };
    }

    async saveDefaultData(data) {
        if (!this.isInitialized) throw new Error('Firebase not initialized');
        
        try {
            await this.db.collection('data').doc('default').set(data);
            this.clearCache(CACHE_KEYS.DEFAULT_DATA);
            console.log('🔥 [FIREBASE] Default data saved');
            return data;
        } catch (error) {
            console.error('🔥 [FIREBASE] Error saving default data:', error);
            throw error;
        }
    }

    // NEW STRUCTURE: Load language data (translations, labels, etc.)
    async getLanguageData(language) {
        if (!this.isInitialized) return this.getEmptyLanguageData();

        const cacheKey = `${CACHE_KEYS.LANGUAGE_DATA}_${language}`;
        if (this.cache.has(cacheKey) && this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            const doc = await this.db.collection('data').doc(language).get();
            let languageData = {};
            
            if (doc.exists) {
                languageData = doc.data();
            } else {
                languageData = this.getEmptyLanguageData();
                await this.saveLanguageData(language, languageData);
            }
            
            this.setCache(cacheKey, languageData);
            console.log('🔥 [FIREBASE] Loaded language data for:', language);
            return languageData;
        } catch (error) {
            console.error('🔥 [FIREBASE] Error loading language data:', error);
            return this.getEmptyLanguageData();
        }
    }

    getEmptyLanguageData() {
        return {
            tagLingua: {
                active: true,
                flag: '🌐',
                direction: 'ltr',
                name: 'Unknown'
            },
            allergeni: {},
            testi: {},
            products: {},
            categories: {}
        };
    }

    async saveLanguageData(language, data) {
        if (!this.isInitialized) throw new Error('Firebase not initialized');
        
        try {
            await this.db.collection('data').doc(language).set(data);
            this.clearCache(`${CACHE_KEYS.LANGUAGE_DATA}_${language}`);
            console.log('🔥 [FIREBASE] Language data saved for:', language);
            return data;
        } catch (error) {
            console.error('🔥 [FIREBASE] Error saving language data:', error);
            throw error;
        }
    }

    // Get all available languages
    async getAvailableLanguages() {
        if (!this.isInitialized) return ['it'];

        if (this.cache.has(CACHE_KEYS.AVAILABLE_LANGUAGES) && this.isCacheValid(CACHE_KEYS.AVAILABLE_LANGUAGES)) {
            return this.cache.get(CACHE_KEYS.AVAILABLE_LANGUAGES);
        }

        try {
            const snapshot = await this.db.collection('data').get();
            const languages = [];
            
            snapshot.forEach(doc => {
                if (doc.id !== 'default') {
                    languages.push(doc.id);
                }
            });
            
            if (languages.length === 0) {
                languages.push('it'); // Default fallback
            }
            
            this.setCache(CACHE_KEYS.AVAILABLE_LANGUAGES, languages);
            console.log('🔥 [FIREBASE] Available languages:', languages);
            return languages;
        } catch (error) {
            console.error('🔥 [FIREBASE] Error loading available languages:', error);
            return ['it'];
        }
    }

    // Add new product to default data
    async addProduct(product) {
        if (!this.isInitialized) throw new Error('Firebase not initialized');

        try {
            const defaultData = await this.getDefaultData();
            defaultData.products.push(product);
            await this.saveDefaultData(defaultData);

            // Add empty translations for all languages
            const languages = await this.getAvailableLanguages();
            for (const lang of languages) {
                const langData = await this.getLanguageData(lang);
                if (!langData.products[product.id]) {
                    langData.products[product.id] = {
                        name: '',
                        description: ''
                    };
                    await this.saveLanguageData(lang, langData);
                }
            }

            console.log('🔥 [FIREBASE] Product added:', product.id);
            return product;
        } catch (error) {
            console.error('🔥 [FIREBASE] Error adding product:', error);
            throw error;
        }
    }

    // Add new category to default data
    async addCategory(category) {
        if (!this.isInitialized) throw new Error('Firebase not initialized');

        try {
            const defaultData = await this.getDefaultData();
            defaultData.categories.push(category);
            await this.saveDefaultData(defaultData);

            // Add empty translations for all languages
            const languages = await this.getAvailableLanguages();
            for (const lang of languages) {
                const langData = await this.getLanguageData(lang);
                if (!langData.categories[category.id]) {
                    langData.categories[category.id] = '';
                }
                await this.saveLanguageData(lang, langData);
            }

            console.log('🔥 [FIREBASE] Category added:', category.id);
            return category;
        } catch (error) {
            console.error('🔥 [FIREBASE] Error adding category:', error);
            throw error;
        }
    }

    // Delete product from default data and all languages
    async deleteProduct(productId) {
        if (!this.isInitialized) throw new Error('Firebase not initialized');

        try {
            const defaultData = await this.getDefaultData();
            defaultData.products = defaultData.products.filter(p => p.id !== productId);
            await this.saveDefaultData(defaultData);

            // Remove translations from all languages
            const languages = await this.getAvailableLanguages();
            for (const lang of languages) {
                const langData = await this.getLanguageData(lang);
                delete langData.products[productId];
                await this.saveLanguageData(lang, langData);
            }

            console.log('🔥 [FIREBASE] Product deleted:', productId);
        } catch (error) {
            console.error('🔥 [FIREBASE] Error deleting product:', error);
            throw error;
        }
    }

    // Delete category from default data and all languages
    async deleteCategory(categoryId) {
        if (!this.isInitialized) throw new Error('Firebase not initialized');

        try {
            const defaultData = await this.getDefaultData();
            defaultData.categories = defaultData.categories.filter(c => c.id !== categoryId);
            await this.saveDefaultData(defaultData);

            // Remove translations from all languages
            const languages = await this.getAvailableLanguages();
            for (const lang of languages) {
                const langData = await this.getLanguageData(lang);
                delete langData.categories[categoryId];
                await this.saveLanguageData(lang, langData);
            }

            console.log('🔥 [FIREBASE] Category deleted:', categoryId);
        } catch (error) {
            console.error('🔥 [FIREBASE] Error deleting category:', error);
            throw error;
        }
    }

    // Create new language
    async createLanguage(languageCode, languageInfo) {
        if (!this.isInitialized) throw new Error('Firebase not initialized');

        try {
            const defaultData = await this.getDefaultData();
            const newLanguageData = {
                tagLingua: languageInfo,
                allergeni: this.getDefaultAllergens(),
                testi: this.getDefaultTexts(),
                products: {},
                categories: {}
            };

            // Add empty translations for all products and categories
            defaultData.products.forEach(product => {
                newLanguageData.products[product.id] = {
                    name: '',
                    description: ''
                };
            });

            defaultData.categories.forEach(category => {
                newLanguageData.categories[category.id] = '';
            });

            await this.saveLanguageData(languageCode, newLanguageData);
            this.clearCache(CACHE_KEYS.AVAILABLE_LANGUAGES);

            console.log('🔥 [FIREBASE] Language created:', languageCode);
            return newLanguageData;
        } catch (error) {
            console.error('🔥 [FIREBASE] Error creating language:', error);
            throw error;
        }
    }

    // Delete language
    async deleteLanguage(languageCode) {
        if (!this.isInitialized) throw new Error('Firebase not initialized');

        try {
            await this.db.collection('data').doc(languageCode).delete();
            this.clearCache(`${CACHE_KEYS.LANGUAGE_DATA}_${languageCode}`);
            this.clearCache(CACHE_KEYS.AVAILABLE_LANGUAGES);
            console.log('🔥 [FIREBASE] Language deleted:', languageCode);
        } catch (error) {
            console.error('🔥 [FIREBASE] Error deleting language:', error);
            throw error;
        }
    }

    // Export language data
    async exportLanguage(languageCode) {
        if (!this.isInitialized) throw new Error('Firebase not initialized');

        try {
            const languageData = await this.getLanguageData(languageCode);
            const exportData = {
                language: languageCode,
                data: languageData,
                exportDate: new Date().toISOString(),
                version: '3.0'
            };

            console.log('🔥 [FIREBASE] Language exported:', languageCode);
            return exportData;
        } catch (error) {
            console.error('🔥 [FIREBASE] Error exporting language:', error);
            throw error;
        }
    }

    // Import language data
    async importLanguage(importData) {
        if (!this.isInitialized) throw new Error('Firebase not initialized');

        try {
            if (!importData.language || !importData.data) {
                throw new Error('Invalid import data format');
            }

            await this.saveLanguageData(importData.language, importData.data);
            this.clearCache(CACHE_KEYS.AVAILABLE_LANGUAGES);

            console.log('🔥 [FIREBASE] Language imported:', importData.language);
            return true;
        } catch (error) {
            console.error('🔥 [FIREBASE] Error importing language:', error);
            throw error;
        }
    }

    // Get default allergens structure
    getDefaultAllergens() {
        return {
            glutine: 'Glutine',
            crostacei: 'Crostacei',
            uova: 'Uova',
            pesce: 'Pesce',
            arachidi: 'Arachidi',
            soia: 'Soia',
            latte: 'Latte',
            frutta_guscio: 'Frutta a guscio',
            sedano: 'Sedano',
            senape: 'Senape',
            sesamo: 'Semi di sesamo',
            solfiti: 'Solfiti',
            lupini: 'Lupini',
            molluschi: 'Molluschi',
            alcol: 'Alcol'
        };
    }

    // Get default texts structure
    getDefaultTexts() {
        return {
            search_placeholder: 'Cerca nel menu...',
            loading: 'Caricamento...',
            no_results: 'Nessun risultato',
            no_results_desc: 'Non sono stati trovati prodotti che corrispondono ai tuoi criteri di ricerca.',
            legend_title: 'Legenda',
            legend_explanation: 'Clicca su un elemento per escludere i prodotti che lo contengono',
            legend_allergens_title: 'Allergeni',
            legend_characteristics_title: 'Caratteristiche',
            filter_allergens: 'Filtra allergeni da evitare',
            disclaimer_shared: 'Tutti i piatti sono preparati in un ambiente condiviso, di conseguenza non possiamo garantire che non ci siano contaminazioni',
            disclaimer_service: 'Non si effettua servizio al tavolo. Ordinare al banco.',
            review_title: 'Ti è piaciuta la tua esperienza?',
            review_subtitle: 'Lascia una recensione e aiuta altri clienti!',
            review_button: 'Lascia Recensione',
            language_selector_title: 'Seleziona Lingua / Select Language',
            game_title: 'Gioco del Dinosauro',
            game_subtitle: 'Divertiti mentre aspetti il tuo ordine!',
            game_invitation_title: 'Tempo di attesa?',
            game_invitation_subtitle: 'Divertiti con il nostro gioco del dinosauro mentre aspetti!',
            game_button_text: 'Gioca Ora',
            instructions_title: 'Come Giocare',
            instruction_1: 'Tocca lo schermo per saltare',
            instruction_2: 'Evita gli ostacoli',
            instruction_3: 'Ottieni il punteggio più alto',
            instruction_4: 'Tocca per ricominciare',
            score_label: 'Punteggio',
            high_score_label: 'Record',
            speed_label: 'Velocità',
            game_controls_text: 'Tocca lo schermo per iniziare o saltare',
            back_to_menu_text: 'Torna al Menu',
            game_over_title: 'Game Over!',
            final_score_text: 'Punteggio finale:',
            restart_text: 'Gioca Ancora',
            leaderboard_text: 'Classifica',
            leaderboard_title: '🏆 Classifica',
            leaderboard_main_title: '🏆 Classifica Migliori Punteggi',
            no_scores_text: 'Nessun punteggio salvato',
            save_score_label: 'Inserisci il tuo nome:',
            player_name_placeholder: 'Il tuo nome',
            save_score: 'Salva',
            skip_save: 'Salta',
            orientation_title: 'Ruota il dispositivo',
            orientation_message: 'Per una migliore esperienza di gioco, ruota il tuo dispositivo in orizzontale',
            continue_portrait_text: 'Continua in verticale'
        };
    }
}

// Initialize Firebase service
window.firebaseService = new FirebaseService();