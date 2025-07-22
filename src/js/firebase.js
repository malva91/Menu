import { FIREBASE_CONFIG, CACHE_KEYS, CACHE_DURATION } from '../utils/constants.js';

// Firebase Service - Completely rewritten for new translation system
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

    // Languages management
    async getLanguages() {
        if (!this.isInitialized) return this.getDefaultLanguages();

        if (this.cache.has(CACHE_KEYS.LANGUAGES) && this.isCacheValid(CACHE_KEYS.LANGUAGES)) {
            return this.cache.get(CACHE_KEYS.LANGUAGES);
        }

        try {
            const doc = await this.db.collection('settings').doc('languages').get();
            let languages = {};
            
            if (doc.exists) {
                languages = doc.data();
            } else {
                languages = this.getDefaultLanguages();
                await this.saveLanguages(languages);
            }
            
            this.setCache(CACHE_KEYS.LANGUAGES, languages);
            console.log('🔥 [FIREBASE] Loaded languages:', Object.keys(languages));
            return languages;
        } catch (error) {
            console.error('🔥 [FIREBASE] Error loading languages:', error);
            return this.getDefaultLanguages();
        }
    }

    getDefaultLanguages() {
        return {
            it: { name: 'Italiano', flag: '🇮🇹', direction: 'ltr', active: true, isDefault: true },
            en: { name: 'English', flag: '🇬🇧', direction: 'ltr', active: true, isDefault: false }
        };
    }

    async saveLanguages(languages) {
        if (!this.isInitialized) throw new Error('Firebase not initialized');
        
        try {
            await this.db.collection('settings').doc('languages').set(languages);
            this.clearCache(CACHE_KEYS.LANGUAGES);
            console.log('🔥 [FIREBASE] Languages saved');
            return languages;
        } catch (error) {
            console.error('🔥 [FIREBASE] Error saving languages:', error);
            throw error;
        }
    }

    // Products management
    async getProducts() {
        if (!this.isInitialized) return [];

        if (this.cache.has(CACHE_KEYS.PRODUCTS) && this.isCacheValid(CACHE_KEYS.PRODUCTS)) {
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
            
            this.setCache(CACHE_KEYS.PRODUCTS, products);
            console.log('🔥 [FIREBASE] Loaded', products.length, 'products');
            return products;
        } catch (error) {
            console.error('🔥 [FIREBASE] Error loading products:', error);
            return [];
        }
    }

    async saveProduct(product) {
        if (!this.isInitialized) throw new Error('Firebase not initialized');

        try {
            if (product.id && product.id !== 'new') {
                await this.db.collection('products').doc(product.id).set(product);
            } else {
                const docRef = await this.db.collection('products').add(product);
                product.id = docRef.id;
            }
            
            this.clearCache(CACHE_KEYS.PRODUCTS);
            console.log('🔥 [FIREBASE] Product saved:', product.id);
            return product;
        } catch (error) {
            console.error('🔥 [FIREBASE] Error saving product:', error);
            throw error;
        }
    }

    async deleteProduct(productId) {
        if (!this.isInitialized) throw new Error('Firebase not initialized');

        try {
            await this.db.collection('products').doc(productId).delete();
            this.clearCache(CACHE_KEYS.PRODUCTS);
            console.log('🔥 [FIREBASE] Product deleted:', productId);
        } catch (error) {
            console.error('🔥 [FIREBASE] Error deleting product:', error);
            throw error;
        }
    }

    // Categories management
    async getCategories() {
        if (!this.isInitialized) return [];

        if (this.cache.has(CACHE_KEYS.CATEGORIES) && this.isCacheValid(CACHE_KEYS.CATEGORIES)) {
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
            
            categories.sort((a, b) => (a.order || 0) - (b.order || 0));
            
            this.setCache(CACHE_KEYS.CATEGORIES, categories);
            console.log('🔥 [FIREBASE] Loaded', categories.length, 'categories');
            return categories;
        } catch (error) {
            console.error('🔥 [FIREBASE] Error loading categories:', error);
            return [];
        }
    }

    async saveCategory(category) {
        if (!this.isInitialized) throw new Error('Firebase not initialized');

        try {
            await this.db.collection('categories').doc(category.id).set(category);
            this.clearCache(CACHE_KEYS.CATEGORIES);
            console.log('🔥 [FIREBASE] Category saved:', category.id);
            return category;
        } catch (error) {
            console.error('🔥 [FIREBASE] Error saving category:', error);
            throw error;
        }
    }

    async deleteCategory(categoryId) {
        if (!this.isInitialized) throw new Error('Firebase not initialized');

        try {
            await this.db.collection('categories').doc(categoryId).delete();
            this.clearCache(CACHE_KEYS.CATEGORIES);
            console.log('🔥 [FIREBASE] Category deleted:', categoryId);
        } catch (error) {
            console.error('🔥 [FIREBASE] Error deleting category:', error);
            throw error;
        }
    }

    // New translation system
    async getTranslations(language = null) {
        if (!this.isInitialized) return {};

        const cacheKey = language ? `${CACHE_KEYS.TRANSLATIONS}_${language}` : CACHE_KEYS.TRANSLATIONS;
        
        if (this.cache.has(cacheKey) && this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            let translations = {};
            
            if (language) {
                // Get translations for specific language
                const doc = await this.db.collection('translations').doc(language).get();
                if (doc.exists) {
                    translations = doc.data();
                }
            } else {
                // Get all translations
                const snapshot = await this.db.collection('translations').get();
                snapshot.forEach(doc => {
                    translations[doc.id] = doc.data();
                });
            }
            
            this.setCache(cacheKey, translations);
            console.log('🔥 [FIREBASE] Loaded translations for:', language || 'all languages');
            return translations;
        } catch (error) {
            console.error('🔥 [FIREBASE] Error loading translations:', error);
            return {};
        }
    }

    async saveTranslations(language, translations) {
        if (!this.isInitialized) throw new Error('Firebase not initialized');

        try {
            await this.db.collection('translations').doc(language).set(translations);
            this.clearCache(CACHE_KEYS.TRANSLATIONS);
            this.clearCache(`${CACHE_KEYS.TRANSLATIONS}_${language}`);
            console.log('🔥 [FIREBASE] Translations saved for:', language);
            return translations;
        } catch (error) {
            console.error('🔥 [FIREBASE] Error saving translations:', error);
            throw error;
        }
    }

    async deleteTranslations(language) {
        if (!this.isInitialized) throw new Error('Firebase not initialized');

        try {
            await this.db.collection('translations').doc(language).delete();
            this.clearCache(CACHE_KEYS.TRANSLATIONS);
            this.clearCache(`${CACHE_KEYS.TRANSLATIONS}_${language}`);
            console.log('🔥 [FIREBASE] Translations deleted for:', language);
        } catch (error) {
            console.error('🔥 [FIREBASE] Error deleting translations:', error);
            throw error;
        }
    }

    // Export/Import functionality
    async exportData(options = {}) {
        if (!this.isInitialized) throw new Error('Firebase not initialized');

        try {
            const exportData = {};
            
            if (options.includeProducts !== false) {
                exportData.products = await this.getProducts();
            }
            
            if (options.includeCategories !== false) {
                exportData.categories = await this.getCategories();
            }
            
            if (options.includeLanguages !== false) {
                exportData.languages = await this.getLanguages();
            }
            
            if (options.includeTranslations !== false) {
                if (options.language) {
                    exportData.translations = {};
                    exportData.translations[options.language] = await this.getTranslations(options.language);
                } else {
                    exportData.translations = await this.getTranslations();
                }
            }
            
            exportData.exportDate = new Date().toISOString();
            exportData.version = '2.0';
            
            console.log('🔥 [FIREBASE] Data exported successfully');
            return exportData;
        } catch (error) {
            console.error('🔥 [FIREBASE] Error exporting data:', error);
            throw error;
        }
    }

    async importData(data, options = {}) {
        if (!this.isInitialized) throw new Error('Firebase not initialized');

        try {
            const batch = this.db.batch();
            let imported = 0;

            // Import languages
            if (data.languages && options.includeLanguages !== false) {
                const languagesRef = this.db.collection('settings').doc('languages');
                batch.set(languagesRef, data.languages);
                imported++;
            }

            // Import categories
            if (data.categories && options.includeCategories !== false) {
                for (const category of data.categories) {
                    const categoryRef = this.db.collection('categories').doc(category.id);
                    batch.set(categoryRef, category);
                    imported++;
                }
            }

            // Import products
            if (data.products && options.includeProducts !== false) {
                for (const product of data.products) {
                    const productRef = this.db.collection('products').doc(product.id);
                    batch.set(productRef, product);
                    imported++;
                }
            }

            // Import translations
            if (data.translations && options.includeTranslations !== false) {
                for (const [language, translations] of Object.entries(data.translations)) {
                    const translationRef = this.db.collection('translations').doc(language);
                    batch.set(translationRef, translations);
                    imported++;
                }
            }

            await batch.commit();
            this.clearCache(); // Clear all cache
            
            console.log('🔥 [FIREBASE] Imported', imported, 'items');
            return imported;
        } catch (error) {
            console.error('🔥 [FIREBASE] Error importing data:', error);
            throw error;
        }
    }
}

// Initialize Firebase service
window.firebaseService = new FirebaseService();