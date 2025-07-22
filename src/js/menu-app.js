import { LANGUAGE_FLAGS, LANGUAGE_NAMES, SUPPORTED_LANGUAGES } from '../utils/constants.js';

// Menu App - Main Application Logic
class MenuApp {
    constructor() {
        this.currentLanguage = 'it';
        this.products = [];
        this.categories = [];
        this.translations = {};
        this.filteredProducts = [];
        this.selectedAllergens = new Set();
        this.selectedTags = new Set();
        this.searchTerm = '';
        this.isLoading = false;
        
        this.init();
    }

    async init() {
        // Initialize language from localStorage or browser
        this.currentLanguage = localStorage.getItem('menu-language') || 
                              this.detectBrowserLanguage() || 'it';
        
        // Initialize UI event listeners
        this.initEventListeners();
        
        // Load data
        await this.loadData();
        
        // Update UI
        this.updateLanguageDisplay();
        this.renderMenu();
    }

    detectBrowserLanguage() {
        const browserLang = navigator.language.split('-')[0];
        return SUPPORTED_LANGUAGES.includes(browserLang) ? browserLang : 'it';
    }

    initEventListeners() {
        // Language selector
        document.getElementById('language-btn')?.addEventListener('click', () => {
            this.toggleLanguageSelector();
        });

        // Language selection
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = e.target.dataset.lang;
                this.changeLanguage(lang);
            });
        });

        // Close language selector
        document.querySelector('#language-selector .close-btn')?.addEventListener('click', () => {
            this.hideLanguageSelector();
        });

        // Filter button
        document.getElementById('filter-btn')?.addEventListener('click', () => {
            this.toggleAllergenFilter();
        });

        // Close filter
        document.querySelector('#allergen-filter .close-btn')?.addEventListener('click', () => {
            this.hideAllergenFilter();
        });

        // Allergen checkboxes
        document.querySelectorAll('#allergen-filter input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.toggleAllergenSelection(e.target.dataset.allergen, e.target.checked);
            });
        });

        // Search
        document.getElementById('search-input')?.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        // Admin button
        document.getElementById('admin-btn')?.addEventListener('click', () => {
            window.location.href = 'admin.html';
        });

        // Legend filter buttons
        document.querySelectorAll('.legend-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const allergen = e.currentTarget.dataset.allergen;
                const tag = e.currentTarget.dataset.tag;
                
                if (allergen) {
                    this.toggleLegendFilter('allergen', allergen, e.currentTarget);
                } else if (tag) {
                    this.toggleLegendFilter('tag', tag, e.currentTarget);
                }
            });
        });

        // Close modals on outside click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('language-selector') || 
                e.target.classList.contains('allergen-filter')) {
                this.hideLanguageSelector();
                this.hideAllergenFilter();
            }
        });

        // Prevent modal close when clicking inside
        document.querySelector('.language-content')?.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        document.querySelector('.filter-content')?.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideLanguageSelector();
                this.hideAllergenFilter();
            }
        });
    }

    async loadData() {
        this.showLoading();
        
        try {
            const loadPromise = Promise.all([
                window.firebaseService.getProducts(),
                window.firebaseService.getCategories(),
                window.firebaseService.getTranslations()
            ]);
            
            const [products, categories, translationsData] = await loadPromise;
            let translations = translationsData;
            
            // Validate data from database
            if (!products || products.length === 0) {
                throw new Error('No products found in database');
            }
            
            if (!categories || categories.length === 0) {
                throw new Error('No categories found in database');
            }
            
            if (!translations || Object.keys(translations).length === 0) {
                console.warn('No translations found in database, using fallback');
                translations = this.getFallbackTranslations();
            }
            
            this.products = products;
            this.categories = categories;
            this.translations = translations;
            
            // Extract available languages from translations._languages
            this.availableLanguages = [];
            if (translations._languages) {
                this.availableLanguages = Object.keys(translations._languages).filter(lang => {
                    const langData = translations._languages[lang];
                    return langData && langData.active !== false;
                });
                console.log('🌍 [MENU] Available languages from database:', this.availableLanguages);
            } else {
                console.warn('🌍 [MENU] No _languages found in translations, creating default languages');
                // Create default languages structure
                translations._languages = {
                    it: { name: 'Italiano', flag: '🇮🇹', direction: 'ltr', active: true },
                    en: { name: 'English', flag: '🇬🇧', direction: 'ltr', active: true }
                };
                this.availableLanguages = ['it', 'en'];
                
                // Save the default structure to database
                try {
                    await window.firebaseService.saveTranslations(translations);
                    console.log('🌍 [MENU] Saved default languages to database');
                } catch (error) {
                    console.warn('🌍 [MENU] Could not save default languages:', error);
                }
            }
            
            this.filteredProducts = products;
            
            this.updateUITranslations();
            this.renderMenu();
            this.updateLanguageSelector();
            
            // Ensure loading is hidden after rendering
            setTimeout(() => {
                this.hideLoading();
            }, 100);
        } catch (error) {
            console.error('Error loading data:', error);
            this.showError(`Errore nel caricamento del menu: ${error.message}. Verifica la connessione al database.`);
        }
    }

    // Minimal fallback translations for critical UI elements
    getFallbackTranslations() {
        return {
            it: {
                search_placeholder: "Cerca nel menu...",
                legend_title: "Legenda",
                legend_explanation: "Clicca su un elemento per escludere i prodotti che lo contengono",
                disclaimer_shared: "Tutti i piatti sono preparati in un ambiente condiviso",
                disclaimer_service: "Non si effettua servizio al tavolo. Ordinare al banco.",
                // Essential allergens
                glutine: "Glutine", latte: "Latte", uova: "Uova", pesce: "Pesce",
                // Essential tags
                vegetariano: "Vegetariano", congelato: "Congelato"
            },
            en: {
                search_placeholder: "Search menu...",
                legend_title: "Legend",
                legend_explanation: "Click on an item to exclude products containing it",
                disclaimer_shared: "All dishes are prepared in a shared environment",
                disclaimer_service: "No table service. Order at the counter.",
                // Essential allergens
                glutine: "Gluten", latte: "Milk", uova: "Eggs", pesce: "Fish",
                // Essential tags
                vegetariano: "Vegetarian", congelato: "Frozen"
            }
        };
    }

    // Language methods
    toggleLanguageSelector() {
        const selector = document.getElementById('language-selector');
        selector.classList.toggle('hidden');
    }

    hideLanguageSelector() {
        document.getElementById('language-selector').classList.add('hidden');
    }

    changeLanguage(lang) {
        this.currentLanguage = lang;
        localStorage.setItem('menu-language', lang);
        
        this.updateLanguageDisplay();
        this.updateUITranslations();
        this.renderMenu();
        this.hideLanguageSelector();
    }

    updateLanguageDisplay() {
        document.getElementById('current-language').textContent = LANGUAGE_FLAGS[this.currentLanguage] || '🇮🇹';
        
        // Update HTML lang attribute
        document.documentElement.lang = this.currentLanguage;
        
        // Update RTL for Arabic
        if (this.currentLanguage === 'ar') {
            document.body.dir = 'rtl';
        } else {
            document.body.dir = 'ltr';
        }
    }

    updateLanguageSelector() {
        const languageGrid = document.querySelector('.language-grid');
        if (!languageGrid) return;
        
        // Use the available languages we extracted from _languages
        const availableLanguages = this.availableLanguages || ['it', 'en'];
        
        languageGrid.innerHTML = availableLanguages
            .filter(code => LANGUAGE_NAMES[code])
            .map(code => {
                // Get language data from translations._languages if available
                const langData = this.translations._languages?.[code] || {};
                const name = langData.name || LANGUAGE_NAMES[code];
                const flag = langData.flag || LANGUAGE_FLAGS[code];
                
                return `
                <button class="lang-btn" data-lang="${code}">
                    ${flag} ${name}
                </button>
                `;
            }).join('');
        
        // Re-attach event listeners
        languageGrid.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = e.target.dataset.lang;
                this.changeLanguage(lang);
            });
        });
    }

    updateUITranslations() {
        const langTranslations = this.translations[this.currentLanguage] || this.translations.it || {};
        
        // Helper function to get translation from structured data
        const getTranslation = (category, key) => {
            if (langTranslations[category] && langTranslations[category][key]) {
                return langTranslations[category][key];
            }
            // Fallback to flat structure for backward compatibility
            return langTranslations[key] || '';
        };
        
        // Update UI elements with structured translations
        const uiElements = {
            'search-input': { attr: 'placeholder', value: getTranslation('ui', 'search_placeholder') },
            'legend-title': { text: getTranslation('ui', 'legend_title') },
            'legend-explanation': { text: getTranslation('ui', 'legend_explanation') },
            'legend-allergens-title': { text: getTranslation('ui', 'legend_allergens_title') },
            'legend-characteristics-title': { text: getTranslation('ui', 'legend_characteristics_title') },
            'filter-title': { text: getTranslation('ui', 'filter_allergens') },
            'disclaimer-shared': { text: getTranslation('ui', 'disclaimer_shared') },
            'disclaimer-service': { text: getTranslation('ui', 'disclaimer_service') },
            'review-title': { text: getTranslation('ui', 'review_title') },
            'review-subtitle': { text: getTranslation('ui', 'review_subtitle') },
            'review-button-text': { text: getTranslation('ui', 'review_button') },
            'game-invitation-title': { text: getTranslation('game', 'game_invitation_title') },
            'game-invitation-subtitle': { text: getTranslation('game', 'game_invitation_subtitle') },
            'game-button-text': { text: getTranslation('game', 'game_button_text') }
        };
        
        Object.entries(uiElements).forEach(([id, config]) => {
            const element = document.getElementById(id);
            if (element && config.value) {
                if (config.attr) {
                    element.setAttribute(config.attr, config.value);
                } else if (config.text) {
                    element.textContent = config.text;
                }
            }
        });
        
        // Update allergen and tag labels in legend
        document.querySelectorAll('[data-translation]').forEach(element => {
            const key = element.dataset.translation;
            let translation = '';
            
            // Check in allergens
            if (getTranslation('allergens', key)) {
                translation = getTranslation('allergens', key);
            }
            // Check in tags
            else if (getTranslation('tags', key)) {
                translation = getTranslation('tags', key);
            }
            // Check in categories
            else if (getTranslation('categories', key)) {
                translation = getTranslation('categories', key);
            }
            // Fallback to flat structure
            else {
                translation = langTranslations[key] || '';
            }
            
            if (translation) {
                element.textContent = translation;
            }
        });
    }

    // Filter methods
    toggleAllergenFilter() {
        const filter = document.getElementById('allergen-filter');
        filter.classList.toggle('hidden');
    }

    hideAllergenFilter() {
        document.getElementById('allergen-filter')?.classList.add('hidden');
    }

    toggleAllergenSelection(allergen, checked) {
        if (checked) {
            this.selectedAllergens.add(allergen);
        } else {
            this.selectedAllergens.delete(allergen);
        }
        this.applyFilters();
    }

    handleSearch(term) {
        this.searchTerm = term.toLowerCase();
        this.applyFilters();
    }

    applyFilters() {
        this.filteredProducts = this.products.filter(product => {
            // Visibility filter
            if (!product.visible) return false;
            
            // Allergen filter
            if (this.selectedAllergens.size > 0) {
                const hasFilteredAllergen = product.allergens.some(allergen => 
                    this.selectedAllergens.has(allergen)
                );
                if (hasFilteredAllergen) return false;
            }
            
            // Tag filter
            if (this.selectedTags.size > 0) {
                const hasFilteredTag = product.tags.some(tag => 
                    this.selectedTags.has(tag)
                );
                if (hasFilteredTag) return false;
            }
            
            // Search filter
            if (this.searchTerm) {
                const translation = product.translations[this.currentLanguage] || 
                                  product.translations.it || {};
                const name = translation.name || '';
                const description = translation.description || '';
                
                const searchableText = `${name} ${description}`.toLowerCase();
                if (!searchableText.includes(this.searchTerm)) return false;
            }
            
            return true;
        });
        
        this.renderMenu();
    }

    toggleLegendFilter(type, value, element) {
        if (type === 'allergen') {
            if (this.selectedAllergens.has(value)) {
                this.selectedAllergens.delete(value);
                element.classList.remove('legend-item-filtered');
            } else {
                this.selectedAllergens.add(value);
                element.classList.add('legend-item-filtered');
            }
        } else if (type === 'tag') {
            if (this.selectedTags.has(value)) {
                this.selectedTags.delete(value);
                element.classList.remove('legend-item-filtered');
            } else {
                this.selectedTags.add(value);
                element.classList.add('legend-item-filtered');
            }
        }
        
        this.applyFilters();
    }

    // Rendering methods
    renderMenu() {
        const menuSections = document.getElementById('menu-sections');
        const noResults = document.getElementById('no-results');
        
        if (this.filteredProducts.length === 0) {
            if (menuSections) menuSections.classList.add('hidden');
            noResults?.classList.remove('hidden');
            return;
        }
        
        if (menuSections) menuSections.classList.remove('hidden');
        noResults?.classList.add('hidden');
        
        // Group products by category
        const categorizedProducts = this.groupProductsByCategory();
        
        // Render categories
        this.renderCategories(categorizedProducts);
    }

    groupProductsByCategory() {
        const categories = {};
        
        this.filteredProducts.forEach(product => {
            if (!categories[product.category]) {
                categories[product.category] = [];
            }
            categories[product.category].push(product);
        });
        
        return categories;
    }

    renderCategories(categorizedProducts) {
        const categoryAccordion = document.getElementById('category-accordion');
        if (!categoryAccordion) return;
        
        // Get visible categories in order
        const visibleCategories = this.categories
            .filter(cat => cat.visible && categorizedProducts[cat.id])
            .sort((a, b) => a.order - b.order);
            
        const langTranslations = this.translations[this.currentLanguage] || this.translations.it || {};
        
        // Helper function to get translation from structured data
        const getTranslation = (category, key) => {
            if (langTranslations[category] && langTranslations[category][key]) {
                return langTranslations[category][key];
            }
            // Fallback to flat structure for backward compatibility
            return langTranslations[key] || key;
        };
        
        categoryAccordion.innerHTML = visibleCategories.map(category => {
            // Try to get category name from product translations first, then from UI translations
            let categoryName = '';
            if (category.translations && category.translations[this.currentLanguage]) {
                categoryName = category.translations[this.currentLanguage];
            } else if (category.translations && category.translations.it) {
                categoryName = category.translations.it;
            } else {
                // Fallback to structured translations
                categoryName = getTranslation('categories', category.id);
            }
            
            const products = categorizedProducts[category.id];
            const categoryIcon = this.getCategoryIcon(category.id);
            
            return `
            <div class="category-tab" data-category="${category.id}">
                <div class="category-header" onclick="app.toggleCategory('${category.id}')">
                    <div class="category-title">
                        <i class="category-icon ${categoryIcon}"></i>
                        <span>${categoryName}</span>
                    </div>
                    <i class="category-toggle fas fa-chevron-down"></i>
                </div>
                <div class="category-content">
                    <div class="category-products">
                        ${products.map(product => this.renderProduct(product)).join('')}
                    </div>
                </div>
            </div>
            `;
        }).join('');
        
        // Make toggleCategory available globally
        window.app = this;
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
    
    toggleCategory(categoryId) {
        const categoryTab = document.querySelector(`[data-category="${categoryId}"]`);
        if (!categoryTab) return;
        
        const isActive = categoryTab.classList.contains('active');
        
        // Close all other categories
        document.querySelectorAll('.category-tab.active').forEach(tab => {
            if (tab !== categoryTab) {
                tab.classList.remove('active');
            }
        });
        
        // Toggle current category
        if (isActive) {
            categoryTab.classList.remove('active');
        } else {
            categoryTab.classList.add('active');
        }
    }

    renderProduct(product) {
        const translation = product.translations[this.currentLanguage] || 
                          product.translations.it || {};
        const langTranslations = this.translations[this.currentLanguage] || this.translations.it || {};
        
        // Helper function to get translation from structured data
        const getTranslation = (category, key) => {
            if (langTranslations[category] && langTranslations[category][key]) {
                return langTranslations[category][key];
            }
            // Fallback to flat structure for backward compatibility
            return langTranslations[key] || key;
        };
        
        const name = translation.name || 'Nome non disponibile';
        const description = translation.description || '';
        
        // Render allergens
        const allergenIcons = product.allergens.map(allergen => {
            const allergenEmoji = this.getAllergenEmoji(allergen);
            const allergenName = getTranslation('allergens', allergen);
            return `<span class="allergen-icon-small tooltip" title="${allergenName}">${allergenEmoji}</span>`;
        }).join('');
        
        // Render tags
        const tagIcons = product.tags.map(tag => {
            const tagEmoji = this.getTagEmoji(tag);
            const tagName = getTranslation('tags', tag);
            return `<span class="product-tag">${tagEmoji} ${tagName}</span>`;
        }).join('');
        
        return `
            <article class="product-card">
                <div class="product-header">
                    <h3 class="product-name">${name}</h3>
                    <span class="product-price">€${product.price.toFixed(2)}</span>
                </div>
                ${description ? `<p class="product-description">${description}</p>` : ''}
                ${tagIcons ? `<div class="product-tags">${tagIcons}</div>` : ''}
                ${allergenIcons ? `<div class="product-allergens">${allergenIcons}</div>` : ''}
            </article>
        `;
    }

    getAllergenEmoji(allergen) {
        // Static emoji mapping (no need for database)
        return {
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
        }[allergen] || '❓';
    }

    getTagEmoji(tag) {
        // Static emoji mapping (no need for database)
        return {
            'maiale': '🐷',
            'pollo': '🍗',
            'vegetariano': '🥦',
            'congelato': '❄️'
        }[tag] || '🏷️';
    }

    // UI State methods
    showLoading() {
        if (!this.isLoading) {
            this.isLoading = true;
            const loading = document.getElementById('loading');
            const menuSections = document.getElementById('menu-sections');
            const noResults = document.getElementById('no-results');
            
            if (loading) {
                loading.classList.remove('hidden');
                loading.style.display = 'flex';
            }
            if (menuSections) menuSections.classList.add('hidden');
            if (noResults) noResults.classList.add('hidden');
        }
    }

    hideLoading() {
        if (this.isLoading) {
            this.isLoading = false;
            const loading = document.getElementById('loading');
            if (loading) {
                loading.classList.add('hidden');
                loading.style.display = 'none';
            }
        }
    }

    showError(message) {
        this.hideLoading();
        console.error(message);
        
        // Show error in UI
        const menuSections = document.getElementById('menu-sections');
        if (menuSections) {
            menuSections.innerHTML = `
                <div class="error-message">
                    <h2>Errore</h2>
                    <p>${message}</p>
                    <button onclick="location.reload()" class="btn-primary">Ricarica</button>
                </div>
            `;
            menuSections.classList.remove('hidden');
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MenuApp();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MenuApp;
}