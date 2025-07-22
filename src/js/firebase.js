import { FIREBASE_CONFIG, CACHE_KEYS, CACHE_DURATION } from '../utils/constants.js';

// Firebase Configuration and Service
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
            // Initialize Firebase
            firebase.initializeApp(FIREBASE_CONFIG);
            this.db = firebase.firestore();
            this.isInitialized = true;
            
            console.log('🔥 [FIREBASE] Initialized successfully');
        } catch (error) {
            console.error('🔥 [FIREBASE] Initialization failed:', error);
            this.handleOfflineMode();
        }
    }

    handleOfflineMode() {
        console.warn('🔥 [FIREBASE] Running in offline mode with default data');
        this.isInitialized = false;
    }

    // Check if cache is valid
    isCacheValid(key) {
        const timestamp = this.cacheTimestamps.get(key);
        if (!timestamp) return false;
        return (Date.now() - timestamp) < CACHE_DURATION;
    }

    // Set cache with timestamp
    setCache(key, data) {
        this.cache.set(key, data);
        this.cacheTimestamps.set(key, Date.now());
    }

    async getProducts() {
        if (!this.isInitialized) {
            console.warn('🔥 [FIREBASE] Not initialized, returning empty array');
            return [];
        }

        // Check cache first
        if (this.cache.has(CACHE_KEYS.PRODUCTS) && this.isCacheValid(CACHE_KEYS.PRODUCTS)) {
            console.log('🔥 [FIREBASE] Loaded products from cache');
            return this.cache.get(CACHE_KEYS.PRODUCTS);
        }

        try {
            const snapshot = await this.db.collection('products').get();
            const products = [];
            
            snapshot.forEach(doc => {
                products.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            // Cache the results
            this.setCache(CACHE_KEYS.PRODUCTS, products);
            console.log('🔥 [FIREBASE] Loaded', products.length, 'products');
            return products;
        } catch (error) {
            console.error('🔥 [FIREBASE] Error loading products:', error);
            return [];
        }
    }

    async getCategories() {
        if (!this.isInitialized) {
            console.warn('🔥 [FIREBASE] Not initialized, returning empty array');
            return [];
        }

        // Check cache first
        if (this.cache.has(CACHE_KEYS.CATEGORIES) && this.isCacheValid(CACHE_KEYS.CATEGORIES)) {
            console.log('🔥 [FIREBASE] Loaded categories from cache');
            return this.cache.get(CACHE_KEYS.CATEGORIES);
        }

        try {
            const snapshot = await this.db.collection('categories').get();
            const categories = [];
            
            snapshot.forEach(doc => {
                categories.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            // Sort by order
            categories.sort((a, b) => (a.order || 0) - (b.order || 0));
            
            // Cache the results
            this.setCache(CACHE_KEYS.CATEGORIES, categories);
            console.log('🔥 [FIREBASE] Loaded', categories.length, 'categories');
            return categories;
        } catch (error) {
            console.error('🔥 [FIREBASE] Error loading categories:', error);
            return [];
        }
    }

    async getTranslations() {
        if (!this.isInitialized) {
            console.warn('🔥 [FIREBASE] Not initialized, returning empty object');
            return {};
        }

        // Check cache first
        if (this.cache.has(CACHE_KEYS.TRANSLATIONS) && this.isCacheValid(CACHE_KEYS.TRANSLATIONS)) {
            console.log('🔥 [FIREBASE] Loaded translations from cache');
            return this.cache.get(CACHE_KEYS.TRANSLATIONS);
        }

        try {
            // Try to get translations from settings/translations first
            let doc = await this.db.collection('settings').doc('translations').get();
            let translations = {};
            
            if (doc.exists) {
                translations = doc.data();
                console.log('🔥 [FIREBASE] Found translations in settings/translations');
            } else {
                console.warn('🔥 [FIREBASE] No translations found in settings/translations, trying direct translations collection');
                
                // Try to get from translations collection directly
                const translationsSnapshot = await this.db.collection('translations').get();
                if (!translationsSnapshot.empty) {
                    translationsSnapshot.forEach(doc => {
                        if (doc.id === '_languages') {
                            translations._languages = doc.data();
                        } else {
                            translations[doc.id] = doc.data();
                        }
                    });
                    console.log('🔥 [FIREBASE] Found translations in translations collection');
                } else {
                    console.warn('🔥 [FIREBASE] No translations found in any location, creating default structure');
                    translations = this.createDefaultTranslations();
                }
            }
            
            console.log('🔥 [FIREBASE] Raw translations data:', translations);
            console.log('🔥 [FIREBASE] Languages found:', translations._languages ? Object.keys(translations._languages) : 'none');
            
            // Cache the results
            this.setCache(CACHE_KEYS.TRANSLATIONS, translations);
            console.log('🔥 [FIREBASE] Loaded translations with', translations._languages ? Object.keys(translations._languages).length : 0, 'languages');
            return translations;
        } catch (error) {
            console.error('🔥 [FIREBASE] Error loading translations:', error);
            console.log('🔥 [FIREBASE] Returning default translations due to error');
            return this.createDefaultTranslations();
        }
    }

    createDefaultTranslations() {
        // Create a structured translation system
        const translations = {
            _languages: {
                it: { name: 'Italiano', flag: '🇮🇹', direction: 'ltr', active: true },
                en: { name: 'English', flag: '🇬🇧', direction: 'ltr', active: true }
            }
        };
        
        // Add structured translations for Italian
        translations.it = {
            ui: {
                search_placeholder: "Cerca nel menu...",
                loading: "Caricamento menu...",
                no_results: "Nessun risultato trovato",
                no_results_desc: "Prova a cambiare i filtri o la ricerca",
                legend_title: "Legenda",
                legend_explanation: "Clicca su un elemento per escludere i prodotti che lo contengono",
                legend_allergens_title: "Allergeni",
                legend_characteristics_title: "Caratteristiche",
                filter_allergens: "Filtra allergeni da evitare",
                disclaimer_shared: "Tutti i piatti sono preparati in un ambiente condiviso, di conseguenza non possiamo garantire che non ci siano contaminazioni",
                disclaimer_service: "Non si effettua servizio al tavolo. Ordinare al banco.",
                review_title: "Ti è piaciuta la tua esperienza?",
                review_subtitle: "Lascia una recensione e aiuta altri clienti!",
                review_button: "Lascia Recensione"
            },
            game: {
                game_title: "Gioco del Dinosauro",
                game_subtitle: "Divertiti mentre aspetti il tuo ordine!",
                game_invitation_title: "Tempo di attesa?",
                game_invitation_subtitle: "Divertiti con il nostro gioco del dinosauro mentre aspetti!",
                game_button_text: "Gioca Ora",
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
                new_record_title: "Nuovo Record!",
                final_score_text: "Punteggio finale:",
                restart_text: "Gioca Ancora",
                leaderboard_text: "Classifica",
                leaderboard_title: "🏆 Classifica",
                leaderboard_main_title: "🏆 Classifica Migliori Punteggi",
                no_scores_text: "Nessun punteggio salvato. Gioca per essere il primo!",
                no_scores_modal_text: "Nessun punteggio salvato",
                save_score_label: "Inserisci il tuo nome per la classifica:",
                use_suggestion: "Usa questo",
                player_name_placeholder: "Il tuo nome o lascia vuoto per nome casuale",
                save_score: "Salva Punteggio",
                skip_save: "Salta",
                play_again: "Gioca Ancora",
                orientation_title: "Ruota il dispositivo",
                orientation_message: "Per una migliore esperienza di gioco, ruota il tuo dispositivo in orizzontale",
                orientation_note: "Il gioco è ottimizzato per la modalità landscape",
                continue_portrait_text: "Continua in verticale",
                random_name_suggestion: "Suggerimento:"
            },
            allergens: {
                glutine: "Glutine",
                crostacei: "Crostacei",
                uova: "Uova",
                pesce: "Pesce",
                arachidi: "Arachidi",
                soia: "Soia",
                latte: "Latte",
                frutta_guscio: "Frutta a guscio",
                sedano: "Sedano",
                senape: "Senape",
                sesamo: "Semi di sesamo",
                solfiti: "Solfiti",
                lupini: "Lupini",
                molluschi: "Molluschi",
                alcol: "Alcol"
            },
            tags: {
                maiale: "Maiale",
                pollo: "Pollo",
                vegetariano: "Vegetariano",
                congelato: "Prodotto congelato"
            },
            categories: {
                caffetteria: "Caffetteria",
                bevande_calde: "Bevande Calde",
                bevande_fredde: "Bevande Fredde",
                dolci: "Dolci",
                salato: "Salato",
                aperitivi: "Aperitivi",
                vini: "Vini",
                birre: "Birre"
            }
        };
        
        // Add structured translations for English
        translations.en = {
            ui: {
                search_placeholder: "Search menu...",
                loading: "Loading menu...",
                no_results: "No results found",
                no_results_desc: "Try changing filters or search",
                legend_title: "Legend",
                legend_explanation: "Click on an item to exclude products containing it",
                legend_allergens_title: "Allergens",
                legend_characteristics_title: "Characteristics",
                filter_allergens: "Filter allergens to avoid",
                disclaimer_shared: "All dishes are prepared in a shared environment, therefore we cannot guarantee that there is no cross-contamination",
                disclaimer_service: "No table service provided. Please order at the counter.",
                review_title: "Did you enjoy your experience?",
                review_subtitle: "Leave a review and help other customers!",
                review_button: "Leave Review"
            },
            game: {
                game_title: "Dinosaur Game",
                game_subtitle: "Have fun while waiting for your order!",
                game_invitation_title: "Waiting time?",
                game_invitation_subtitle: "Have fun with our dinosaur game while you wait!",
                game_button_text: "Play Now",
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
                new_record_title: "New Record!",
                final_score_text: "Final score:",
                restart_text: "Play Again",
                leaderboard_text: "Leaderboard",
                leaderboard_title: "🏆 Leaderboard",
                leaderboard_main_title: "🏆 Top Scores Leaderboard",
                no_scores_text: "No scores saved. Play to be the first!",
                no_scores_modal_text: "No scores saved",
                save_score_label: "Enter your name for the leaderboard:",
                use_suggestion: "Use this",
                player_name_placeholder: "Your name or leave empty for random name",
                save_score: "Save Score",
                skip_save: "Skip",
                play_again: "Play Again",
                orientation_title: "Rotate Device",
                orientation_message: "For a better gaming experience, rotate your device to landscape",
                orientation_note: "The game is optimized for landscape mode",
                continue_portrait_text: "Continue in Portrait",
                random_name_suggestion: "Suggestion:"
            },
            allergens: {
                glutine: "Gluten",
                crostacei: "Crustaceans",
                uova: "Eggs",
                pesce: "Fish",
                arachidi: "Peanuts",
                soia: "Soy",
                latte: "Milk",
                frutta_guscio: "Nuts",
                sedano: "Celery",
                senape: "Mustard",
                sesamo: "Sesame seeds",
                solfiti: "Sulfites",
                lupini: "Lupins",
                molluschi: "Mollusks",
                alcol: "Alcohol"
            },
            tags: {
                maiale: "Pork",
                pollo: "Chicken",
                vegetariano: "Vegetarian",
                congelato: "Frozen"
            },
            categories: {
                caffetteria: "Coffee Shop",
                bevande_calde: "Hot Drinks",
                bevande_fredde: "Cold Drinks",
                dolci: "Desserts",
                salato: "Savory",
                aperitivi: "Aperitifs",
                vini: "Wines",
                birre: "Beers"
            }
        };
        
        return translations;
    }

    // Clear cache when data is updated
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

    // Admin methods
    async saveProduct(product) {
        if (!this.isInitialized) {
            throw new Error('Firebase not initialized');
        }

        try {
            if (product.id && product.id !== 'new') {
                await this.db.collection('products').doc(product.id).set(product);
            } else {
                const docRef = await this.db.collection('products').add(product);
                product.id = docRef.id;
            }
            
            // Clear cache to force reload
            this.clearCache(CACHE_KEYS.PRODUCTS);
            console.log('🔥 [FIREBASE] Product saved:', product.id);
            return product;
        } catch (error) {
            console.error('🔥 [FIREBASE] Error saving product:', error);
            throw error;
        }
    }

    async deleteProduct(productId) {
        if (!this.isInitialized) {
            throw new Error('Firebase not initialized');
        }

        try {
            await this.db.collection('products').doc(productId).delete();
            // Clear cache to force reload
            this.clearCache(CACHE_KEYS.PRODUCTS);
            console.log('🔥 [FIREBASE] Product deleted:', productId);
        } catch (error) {
            console.error('🔥 [FIREBASE] Error deleting product:', error);
            throw error;
        }
    }

    async saveCategory(category) {
        if (!this.isInitialized) {
            throw new Error('Firebase not initialized');
        }

        try {
            await this.db.collection('categories').doc(category.id).set(category);
            // Clear cache to force reload
            this.clearCache(CACHE_KEYS.CATEGORIES);
            console.log('🔥 [FIREBASE] Category saved:', category.id);
            return category;
        } catch (error) {
            console.error('🔥 [FIREBASE] Error saving category:', error);
            throw error;
        }
    }

    async deleteCategory(categoryId) {
        if (!this.isInitialized) {
            throw new Error('Firebase not initialized');
        }

        try {
            await this.db.collection('categories').doc(categoryId).delete();
            // Clear cache to force reload
            this.clearCache(CACHE_KEYS.CATEGORIES);
            console.log('🔥 [FIREBASE] Category deleted:', categoryId);
        } catch (error) {
            console.error('🔥 [FIREBASE] Error deleting category:', error);
            throw error;
        }
    }

    async saveTranslations(translations) {
        if (!this.isInitialized) {
            throw new Error('Firebase not initialized');
        }

        try {
            await this.db.collection('settings').doc('translations').set(translations);
            // Clear cache to force reload
            this.clearCache(CACHE_KEYS.TRANSLATIONS);
            console.log('🔥 [FIREBASE] Translations saved');
            return translations;
        } catch (error) {
            console.error('🔥 [FIREBASE] Error saving translations:', error);
            throw error;
        }
    }

    async importProducts(products, language = 'it') {
        if (!this.isInitialized) {
            throw new Error('Firebase not initialized');
        }

        try {
            const batch = this.db.batch();
            let imported = 0;

            for (const product of products) {
                if (!product.id) continue;

                const docRef = this.db.collection('products').doc(product.id);
                
                // Get existing product or create new one
                const existingDoc = await docRef.get();
                let productData;

                if (existingDoc.exists) {
                    // Update existing product
                    productData = existingDoc.data();
                    
                    // Update basic fields if provided
                    if (product.price !== undefined) productData.price = product.price;
                    if (product.category !== undefined) productData.category = product.category;
                    if (product.visible !== undefined) productData.visible = product.visible;
                    if (product.allergens !== undefined) productData.allergens = product.allergens;
                    if (product.tags !== undefined) productData.tags = product.tags;
                    
                    // Update translations
                    if (!productData.translations) productData.translations = {};
                    if (!productData.translations[language]) productData.translations[language] = {};
                    
                    if (product.name) productData.translations[language].name = product.name;
                    if (product.description) productData.translations[language].description = product.description;
                } else {
                    // Create new product
                    productData = {
                        id: product.id,
                        category: product.category || 'dolci',
                        price: product.price || 0,
                        visible: product.visible !== undefined ? product.visible : true,
                        allergens: product.allergens || [],
                        tags: product.tags || [],
                        translations: {
                            [language]: {
                                name: product.name || product.id,
                                description: product.description || ''
                            }
                        }
                    };
                }

                batch.set(docRef, productData);
                imported++;
            }

            await batch.commit();
            // Clear cache to force reload
            this.clearCache(CACHE_KEYS.PRODUCTS);
            console.log('🔥 [FIREBASE] Imported', imported, 'products');
            return imported;
        } catch (error) {
            console.error('🔥 [FIREBASE] Error importing products:', error);
            throw error;
        }
    }
}

// Initialize Firebase service
window.firebaseService = new FirebaseService();