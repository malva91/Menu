// Menu App - Rewritten for new translation system
class MenuApp {
    constructor() {
        this.products = [];
        this.categories = [];
        this.filteredProducts = [];
        this.selectedAllergens = new Set();
        this.selectedTags = new Set();
        this.searchTerm = '';
        this.isLoading = false;
        
        this.init();
    }

    async init() {
        console.log('📱 [MENU] Initializing menu app...');
        
        // Wait for translation service to be ready
        await this.waitForTranslationService();
        
        // Initialize UI event listeners
        this.initEventListeners();
        
        // Load data
        await this.loadData();
        
        // Update UI
        this.renderMenu();
        
        console.log('📱 [MENU] Menu app initialized');
    }

    async waitForTranslationService() {
        let attempts = 0;
        const maxAttempts = 100;
        
        while (!window.translationService?.isLoaded && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.translationService?.isLoaded) {
            console.warn('📱 [MENU] Translation service not ready, using fallback');
        }
    }

    initEventListeners() {
        // Language selector
        document.getElementById('language-btn')?.addEventListener('click', () => {
            this.toggleLanguageSelector();
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
            if (!window.translationService.isLoaded) {
                throw new Error('Translation service not ready');
            }
            
            // Get merged data from translation service
            this.products = window.translationService.getMergedProducts();
            this.categories = window.translationService.getMergedCategories();
            this.filteredProducts = this.products;
            
            if (this.products.length === 0) {
                throw new Error('No products found in database');
            }
            
            if (this.categories.length === 0) {
                throw new Error('No categories found in database');
            }
            
            this.updateLanguageSelector();
            this.updateAllergenLabels();
            this.renderMenu();
            
            setTimeout(() => {
                this.hideLoading();
            }, 100);
        } catch (error) {
            console.error('📱 [MENU] Error loading data:', error);
            this.showError(`Errore nel caricamento del menu: ${error.message}`);
        }
    }

    // Language methods
    toggleLanguageSelector() {
        const selector = document.getElementById('language-selector');
        selector?.classList.toggle('hidden');
    }

    hideLanguageSelector() {
        document.getElementById('language-selector')?.classList.add('hidden');
    }

    async changeLanguage(language) {
        const success = await window.translationService.changeLanguage(language);
        if (success) {
            await this.loadData(); // Reload data with new language
            this.hideLanguageSelector();
        }
    }

    updateLanguageSelector() {
        const languageGrid = document.querySelector('.language-grid');
        if (!languageGrid) return;
        
        const availableLanguages = window.translationService.getAvailableLanguagesForUI();
        
        languageGrid.innerHTML = availableLanguages.map(lang => `
            <button class="lang-btn" data-lang="${lang.code}">
                ${lang.flag} ${lang.name}
            </button>
        `).join('');
        
        // Re-attach event listeners
        languageGrid.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = e.target.dataset.lang;
                this.changeLanguage(lang);
            });
        });
    }

    updateAllergenLabels() {
        // Update allergen labels in legend and filter
        document.querySelectorAll('[data-allergen]').forEach(element => {
            const allergen = element.dataset.allergen;
            const translation = window.translationService.getAllergen(allergen);
            const textElement = element.querySelector('.legend-text, .allergen-label');
            if (textElement && translation) {
                textElement.textContent = translation;
            }
        });
    }

    // Filter methods
    toggleAllergenFilter() {
        const filter = document.getElementById('allergen-filter');
        filter?.classList.toggle('hidden');
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
                const searchableText = `${product.name} ${product.description}`.toLowerCase();
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
        const noResults = document.getElementById('no-results');
        
        if (this.filteredProducts.length === 0) {
            noResults?.classList.remove('hidden');
            this.renderCategories({});
            return;
        }
        
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
            .sort((a, b) => (a.order || 0) - (b.order || 0));
        
        categoryAccordion.innerHTML = visibleCategories.map(category => {
            const products = categorizedProducts[category.id];
            const categoryIcon = this.getCategoryIcon(category);
            
            return `
            <div class="category-tab" data-category="${category.id}">
                <div class="category-header" onclick="app.toggleCategory('${category.id}')">
                    <div class="category-title">
                        <i class="category-icon ${categoryIcon}"></i>
                        <span>${category.name}</span>
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
    
    getCategoryIcon(category) {
        if (category.icon) {
            return category.icon;
        }
        
        // Fallback icons
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
        
        return icons[category.id] || 'fas fa-utensils';
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
        const name = product.name || 'Nome non disponibile';
        const description = product.description || '';
        
        // Render allergens
        const allergenIcons = product.allergens.map(allergen => {
            const allergenEmoji = this.getAllergenEmoji(allergen);
            const allergenName = window.translationService.getAllergen(allergen);
            return `<span class="allergen-icon-small tooltip" title="${allergenName}">${allergenEmoji}</span>`;
        }).join('');
        
        // Render tags
        const tagIcons = product.tags.map(tag => {
            const tagEmoji = this.getTagEmoji(tag);
            const tagName = this.getTagName(tag);
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
        const emojis = {
            'glutine': '🌾', 'crostacei': '🦞', 'uova': '🥚', 'pesce': '🐟',
            'arachidi': '🥜', 'soia': '🌿', 'latte': '🥛', 'frutta_guscio': '🌰',
            'sedano': '🥬', 'senape': '🟡', 'sesamo': '⚪', 'solfiti': '🧪',
            'lupini': '🌕', 'molluschi': '🦑', 'alcol': '🍷'
        };
        return emojis[allergen] || '❓';
    }

    getTagEmoji(tag) {
        const emojis = {
            'maiale': '🐷', 'pollo': '🍗', 'vegetariano': '🥦', 'congelato': '❄️'
        };
        return emojis[tag] || '🏷️';
    }

    getTagName(tag) {
        const names = {
            'maiale': 'Maiale',
            'pollo': 'Pollo', 
            'vegetariano': 'Vegetariano',
            'congelato': 'Prodotto congelato'
        };
        return names[tag] || tag;
    }

    // UI State methods
    showLoading() {
        if (!this.isLoading) {
            this.isLoading = true;
            const loading = document.getElementById('loading');
            
            if (loading) {
                loading.classList.remove('hidden');
                loading.style.display = 'flex';
            }
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
        console.error('📱 [MENU] Error:', message);
        
        const categoryAccordion = document.getElementById('category-accordion');
        if (categoryAccordion) {
            categoryAccordion.innerHTML = `
                <div class="error-message">
                    <h2>Errore</h2>
                    <p>${message}</p>
                    <button onclick="location.reload()" class="btn-primary">Ricarica</button>
                </div>
            `;
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MenuApp();
});