// Admin Panel - Completely rewritten for new translation system
import { ADMIN_PASSWORD, TRANSLATION_KEYS, DEFAULT_LANGUAGE_FLAGS } from '../utils/constants.js';

class AdminPanel {
    constructor() {
        this.isAuthenticated = false;
        this.currentEditingProduct = null;
        this.currentEditingCategory = null;
        this.currentEditingLanguage = null;
        this.currentTranslationLanguage = 'it';
        this.currentTranslationCategory = 'ui';
        
        this.init();
    }

    async init() {
        // Check authentication
        this.checkAuthentication();
        
        if (this.isAuthenticated) {
            await this.initAdminPanel();
        } else {
            this.showLoginScreen();
        }
    }

    checkAuthentication() {
        const auth = sessionStorage.getItem('admin-auth');
        this.isAuthenticated = auth === 'authenticated';
    }

    showLoginScreen() {
        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('admin-panel').classList.add('hidden');
        
        // Login form handler
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
    }

    handleLogin() {
        const password = document.getElementById('admin-password').value;
        const errorElement = document.getElementById('password-error');
        
        if (password === ADMIN_PASSWORD) {
            sessionStorage.setItem('admin-auth', 'authenticated');
            this.isAuthenticated = true;
            this.initAdminPanel();
        } else {
            errorElement.textContent = 'Password non corretta';
            errorElement.classList.add('show');
        }
    }

    async initAdminPanel() {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('admin-panel').classList.remove('hidden');
        
        // Wait for services to be ready
        await this.waitForServices();
        
        // Initialize event listeners
        this.initEventListeners();
        
        // Load and display data
        await this.loadData();
        
        console.log('🔧 [ADMIN] Panel initialized');
    }

    async waitForServices() {
        let attempts = 0;
        const maxAttempts = 50;
        
        while ((!window.firebaseService || !window.translationService) && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
    }

    initEventListeners() {
        // Main action buttons
        document.getElementById('add-product-btn')?.addEventListener('click', () => {
            this.showProductModal();
        });
        
        document.getElementById('manage-categories-btn')?.addEventListener('click', () => {
            this.showCategoriesModal();
        });
        
        document.getElementById('manage-translations-btn')?.addEventListener('click', () => {
            this.showTranslationsModal();
        });
        
        document.getElementById('export-btn')?.addEventListener('click', () => {
            this.showExportModal();
        });
        
        document.getElementById('import-btn')?.addEventListener('click', () => {
            this.showImportModal();
        });
        
        document.getElementById('logout-btn')?.addEventListener('click', () => {
            this.logout();
        });

        // Modal close buttons
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    modal.classList.add('hidden');
                }
            });
        });

        // Product form
        document.getElementById('product-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProduct();
        });

        document.getElementById('cancel-product')?.addEventListener('click', () => {
            document.getElementById('product-modal').classList.add('hidden');
        });

        // Search and filters
        document.getElementById('admin-search')?.addEventListener('input', (e) => {
            this.filterProducts(e.target.value);
        });

        document.getElementById('category-filter')?.addEventListener('change', (e) => {
            this.filterProductsByCategory(e.target.value);
        });

        document.getElementById('visibility-filter')?.addEventListener('change', (e) => {
            this.filterProductsByVisibility(e.target.value);
        });
    }

    async loadData() {
        this.showLoading();
        
        try {
            const [products, categories, languages] = await Promise.all([
                window.firebaseService.getProducts(),
                window.firebaseService.getCategories(),
                window.firebaseService.getLanguages()
            ]);
            
            this.products = products || [];
            this.categories = categories || [];
            this.languages = languages || {};
            
            this.updateStatistics();
            this.renderProductsTable();
            this.updateCategoryFilters();
            
            this.hideLoading();
        } catch (error) {
            console.error('🔧 [ADMIN] Error loading data:', error);
            this.showError('Errore nel caricamento dei dati: ' + error.message);
        }
    }

    updateStatistics() {
        const totalProducts = this.products.length;
        const visibleProducts = this.products.filter(p => p.visible).length;
        const totalCategories = this.categories.length;
        const totalLanguages = Object.keys(this.languages).length;
        
        document.getElementById('total-products').textContent = totalProducts;
        document.getElementById('visible-products').textContent = visibleProducts;
        document.getElementById('total-categories').textContent = totalCategories;
        document.getElementById('total-languages').textContent = totalLanguages;
    }

    renderProductsTable() {
        const tbody = document.getElementById('products-table-body');
        if (!tbody) return;
        
        tbody.innerHTML = this.products.map(product => {
            const name = this.getProductName(product);
            const categoryName = this.getCategoryName(product.category);
            const allergenIcons = product.allergens.map(a => this.getAllergenEmoji(a)).join(' ');
            
            return `
                <tr>
                    <td class="product-name">${name}</td>
                    <td class="product-category">${categoryName}</td>
                    <td class="product-price">€${product.price.toFixed(2)}</td>
                    <td class="product-allergens">${allergenIcons}</td>
                    <td class="visibility-toggle">
                        <input type="checkbox" ${product.visible ? 'checked' : ''} 
                               onchange="adminPanel.toggleProductVisibility('${product.id}', this.checked)">
                    </td>
                    <td class="table-actions">
                        <button class="btn-icon edit" onclick="adminPanel.editProduct('${product.id}')" title="Modifica">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete" onclick="adminPanel.deleteProduct('${product.id}')" title="Elimina">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
        
        // Make adminPanel available globally
        window.adminPanel = this;
    }

    getProductName(product) {
        if (product.translations && product.translations.it) {
            return product.translations.it.name || product.id;
        }
        return product.id;
    }

    getCategoryName(categoryId) {
        const category = this.categories.find(c => c.id === categoryId);
        if (category && category.translations && category.translations.it) {
            return category.translations.it;
        }
        return categoryId;
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

    updateCategoryFilters() {
        const categoryFilter = document.getElementById('category-filter');
        const productCategorySelect = document.getElementById('product-category');
        
        if (categoryFilter) {
            categoryFilter.innerHTML = '<option value="">Tutte le categorie</option>' +
                this.categories.map(cat => 
                    `<option value="${cat.id}">${this.getCategoryName(cat.id)}</option>`
                ).join('');
        }
        
        if (productCategorySelect) {
            productCategorySelect.innerHTML = this.categories.map(cat => 
                `<option value="${cat.id}">${this.getCategoryName(cat.id)}</option>`
            ).join('');
        }
    }

    // Product management
    showProductModal(productId = null) {
        const modal = document.getElementById('product-modal');
        const title = document.getElementById('product-modal-title');
        const form = document.getElementById('product-form');
        
        if (productId) {
            // Edit mode
            const product = this.products.find(p => p.id === productId);
            if (!product) return;
            
            title.textContent = 'Modifica Prodotto';
            this.populateProductForm(product);
            this.currentEditingProduct = productId;
        } else {
            // Add mode
            title.textContent = 'Nuovo Prodotto';
            form.reset();
            this.currentEditingProduct = null;
            
            // Set defaults
            document.getElementById('product-visible').checked = true;
        }
        
        modal.classList.remove('hidden');
    }

    populateProductForm(product) {
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-visible').checked = product.visible;
        
        // Allergens
        document.querySelectorAll('[data-allergen]').forEach(checkbox => {
            const allergen = checkbox.dataset.allergen;
            checkbox.checked = product.allergens.includes(allergen);
        });
        
        // Tags
        document.querySelectorAll('[data-tag]').forEach(checkbox => {
            const tag = checkbox.dataset.tag;
            checkbox.checked = product.tags.includes(tag);
        });
        
        // Translations
        const languages = ['it', 'en', 'fr', 'de', 'es', 'pt', 'ru', 'zh', 'ja', 'ar'];
        languages.forEach(lang => {
            const nameInput = document.getElementById(`name-${lang}`);
            const descInput = document.getElementById(`description-${lang}`);
            
            if (nameInput && product.translations && product.translations[lang]) {
                nameInput.value = product.translations[lang].name || '';
            }
            if (descInput && product.translations && product.translations[lang]) {
                descInput.value = product.translations[lang].description || '';
            }
        });
    }

    async saveProduct() {
        try {
            const formData = new FormData(document.getElementById('product-form'));
            
            const product = {
                id: document.getElementById('product-id').value || this.generateProductId(),
                category: document.getElementById('product-category').value,
                price: parseFloat(document.getElementById('product-price').value),
                visible: document.getElementById('product-visible').checked,
                allergens: [],
                tags: [],
                translations: {}
            };
            
            // Collect allergens
            document.querySelectorAll('[data-allergen]:checked').forEach(checkbox => {
                product.allergens.push(checkbox.dataset.allergen);
            });
            
            // Collect tags
            document.querySelectorAll('[data-tag]:checked').forEach(checkbox => {
                product.tags.push(checkbox.dataset.tag);
            });
            
            // Collect translations
            const languages = ['it', 'en', 'fr', 'de', 'es', 'pt', 'ru', 'zh', 'ja', 'ar'];
            languages.forEach(lang => {
                const nameInput = document.getElementById(`name-${lang}`);
                const descInput = document.getElementById(`description-${lang}`);
                
                if (nameInput && nameInput.value.trim()) {
                    if (!product.translations[lang]) product.translations[lang] = {};
                    product.translations[lang].name = nameInput.value.trim();
                    product.translations[lang].description = descInput ? descInput.value.trim() : '';
                }
            });
            
            await window.firebaseService.saveProduct(product);
            
            // Update local data
            if (this.currentEditingProduct) {
                const index = this.products.findIndex(p => p.id === this.currentEditingProduct);
                if (index !== -1) {
                    this.products[index] = product;
                }
            } else {
                this.products.push(product);
            }
            
            this.renderProductsTable();
            this.updateStatistics();
            document.getElementById('product-modal').classList.add('hidden');
            
            this.showMessage('Prodotto salvato con successo', 'success');
        } catch (error) {
            console.error('🔧 [ADMIN] Error saving product:', error);
            this.showMessage('Errore nel salvataggio: ' + error.message, 'error');
        }
    }

    generateProductId() {
        const name = document.getElementById('name-it').value.trim();
        if (name) {
            return name.toLowerCase()
                .replace(/[àáâãäå]/g, 'a')
                .replace(/[èéêë]/g, 'e')
                .replace(/[ìíîï]/g, 'i')
                .replace(/[òóôõö]/g, 'o')
                .replace(/[ùúûü]/g, 'u')
                .replace(/[^a-z0-9]/g, '_')
                .replace(/_+/g, '_')
                .replace(/^_|_$/g, '');
        }
        return 'product_' + Date.now();
    }

    async toggleProductVisibility(productId, visible) {
        try {
            const product = this.products.find(p => p.id === productId);
            if (!product) return;
            
            product.visible = visible;
            await window.firebaseService.saveProduct(product);
            
            this.updateStatistics();
            this.showMessage('Visibilità aggiornata', 'success');
        } catch (error) {
            console.error('🔧 [ADMIN] Error updating visibility:', error);
            this.showMessage('Errore nell\'aggiornamento', 'error');
        }
    }

    editProduct(productId) {
        this.showProductModal(productId);
    }

    async deleteProduct(productId) {
        if (!confirm('Sei sicuro di voler eliminare questo prodotto?')) return;
        
        try {
            await window.firebaseService.deleteProduct(productId);
            
            // Update local data
            this.products = this.products.filter(p => p.id !== productId);
            
            this.renderProductsTable();
            this.updateStatistics();
            this.showMessage('Prodotto eliminato', 'success');
        } catch (error) {
            console.error('🔧 [ADMIN] Error deleting product:', error);
            this.showMessage('Errore nell\'eliminazione: ' + error.message, 'error');
        }
    }

    // Translation management
    showTranslationsModal() {
        const modal = document.getElementById('translations-modal');
        modal.classList.remove('hidden');
        this.loadAllTranslations();
    }

    async loadAllTranslations() {
        try {
            // Carica tutte le traduzioni esistenti
            const allTranslations = await window.firebaseService.getTranslations();
            
            // Carica prodotti e categorie per le loro traduzioni
            const [products, categories] = await Promise.all([
                window.firebaseService.getProducts(),
                window.firebaseService.getCategories()
            ]);
            
            this.renderTranslationsEditor(allTranslations, products, categories);
        } catch (error) {
            console.error('🔧 [ADMIN] Error loading translations:', error);
            this.showMessage('Errore nel caricamento delle traduzioni', 'error');
        }
    }

    renderTranslationsEditor(allTranslations, products, categories) {
        const container = document.getElementById('translations-container');
        const languages = ['it', 'en', 'fr', 'de', 'es', 'pt', 'ru', 'zh', 'ja', 'ar'];
        
        container.innerHTML = `
            <div class="translations-tabs">
                ${languages.map((lang, index) => `
                    <button class="translation-tab ${index === 0 ? 'active' : ''}" data-lang="${lang}">
                        ${DEFAULT_LANGUAGE_FLAGS[lang] || '🌐'} ${this.getLanguageName(lang)}
                    </button>
                `).join('')}
            </div>
            
            <div class="translations-content">
                ${languages.map((lang, index) => `
                    <div class="translation-panel ${index === 0 ? 'active' : ''}" data-lang="${lang}">
                        ${this.renderLanguageTranslations(lang, allTranslations[lang] || {}, products, categories)}
                    </div>
                `).join('')}
            </div>
            
            <div class="translations-actions">
                <button id="save-all-translations" class="btn-primary">Salva Tutte le Traduzioni</button>
                <button id="export-translations" class="btn-secondary">Esporta Traduzioni</button>
                <button id="import-translations" class="btn-secondary">Importa Traduzioni</button>
            </div>
        `;
        
        // Aggiungi event listeners per i tab
        document.querySelectorAll('.translation-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const lang = e.target.dataset.lang;
                this.switchTranslationTab(lang);
            });
        });
        
        // Event listeners per azioni
        document.getElementById('save-all-translations').addEventListener('click', () => {
            this.saveAllTranslations();
        });
        
        document.getElementById('export-translations').addEventListener('click', () => {
            this.exportAllTranslations();
        });
        
        document.getElementById('import-translations').addEventListener('click', () => {
            this.importTranslations();
        });
    }

    renderLanguageTranslations(language, translations, products, categories) {
        const uiTranslations = translations.ui || {};
        const gameTranslations = translations.game || {};
        const allergenTranslations = translations.allergens || {};
        const tagTranslations = translations.tags || {};
        
        return `
            <div class="translation-sections">
                <!-- Interfaccia Utente -->
                <div class="translation-section">
                    <h3><i class="fas fa-desktop"></i> Interfaccia Utente</h3>
                    <div class="translation-fields">
                        ${TRANSLATION_KEYS.ui.map(key => `
                            <div class="form-group">
                                <label>${key}:</label>
                                <input type="text" 
                                       data-lang="${language}" 
                                       data-category="ui" 
                                       data-key="${key}"
                                       value="${uiTranslations[key] || ''}" 
                                       placeholder="Traduzione per ${key}">
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Gioco -->
                <div class="translation-section">
                    <h3><i class="fas fa-gamepad"></i> Gioco</h3>
                    <div class="translation-fields">
                        ${TRANSLATION_KEYS.game.map(key => `
                            <div class="form-group">
                                <label>${key}:</label>
                                <input type="text" 
                                       data-lang="${language}" 
                                       data-category="game" 
                                       data-key="${key}"
                                       value="${gameTranslations[key] || ''}" 
                                       placeholder="Traduzione per ${key}">
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Allergeni -->
                <div class="translation-section">
                    <h3><i class="fas fa-exclamation-triangle"></i> Allergeni</h3>
                    <div class="translation-fields">
                        ${TRANSLATION_KEYS.allergens.map(key => `
                            <div class="form-group">
                                <label>${this.getAllergenEmoji(key)} ${key}:</label>
                                <input type="text" 
                                       data-lang="${language}" 
                                       data-category="allergens" 
                                       data-key="${key}"
                                       value="${allergenTranslations[key] || ''}" 
                                       placeholder="Traduzione per ${key}">
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Tag/Caratteristiche -->
                <div class="translation-section">
                    <h3><i class="fas fa-tags"></i> Caratteristiche</h3>
                    <div class="translation-fields">
                        ${TRANSLATION_KEYS.tags.map(key => `
                            <div class="form-group">
                                <label>${this.getTagEmoji(key)} ${key}:</label>
                                <input type="text" 
                                       data-lang="${language}" 
                                       data-category="tags" 
                                       data-key="${key}"
                                       value="${tagTranslations[key] || ''}" 
                                       placeholder="Traduzione per ${key}">
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Prodotti -->
                <div class="translation-section">
                    <h3><i class="fas fa-utensils"></i> Prodotti</h3>
                    <div class="translation-fields">
                        ${products.map(product => `
                            <div class="product-translation">
                                <h4>${product.id}</h4>
                                <div class="form-group">
                                    <label>Nome:</label>
                                    <input type="text" 
                                           data-lang="${language}" 
                                           data-category="products" 
                                           data-key="${product.id}_name"
                                           value="${product.translations?.[language]?.name || ''}" 
                                           placeholder="Nome prodotto in ${language}">
                                </div>
                                <div class="form-group">
                                    <label>Descrizione:</label>
                                    <textarea data-lang="${language}" 
                                              data-category="products" 
                                              data-key="${product.id}_description"
                                              placeholder="Descrizione prodotto in ${language}">${product.translations?.[language]?.description || ''}</textarea>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Categorie -->
                <div class="translation-section">
                    <h3><i class="fas fa-folder"></i> Categorie</h3>
                    <div class="translation-fields">
                        ${categories.map(category => `
                            <div class="form-group">
                                <label>${category.id}:</label>
                                <input type="text" 
                                       data-lang="${language}" 
                                       data-category="categories" 
                                       data-key="${category.id}"
                                       value="${category.translations?.[language] || ''}" 
                                       placeholder="Nome categoria in ${language}">
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    switchTranslationTab(language) {
        // Rimuovi active da tutti i tab e panel
        document.querySelectorAll('.translation-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.translation-panel').forEach(panel => panel.classList.remove('active'));
        
        // Aggiungi active al tab e panel selezionati
        document.querySelector(`[data-lang="${language}"].translation-tab`).classList.add('active');
        document.querySelector(`[data-lang="${language}"].translation-panel`).classList.add('active');
    }

    async saveAllTranslations() {
        try {
            const languages = ['it', 'en', 'fr', 'de', 'es', 'pt', 'ru', 'zh', 'ja', 'ar'];
            
            for (const language of languages) {
                // Raccogli tutte le traduzioni per questa lingua
                const translations = {
                    ui: {},
                    game: {},
                    allergens: {},
                    tags: {}
                };
                
                // Raccogli traduzioni UI, Game, Allergens, Tags
                document.querySelectorAll(`input[data-lang="${language}"], textarea[data-lang="${language}"]`).forEach(input => {
                    const category = input.dataset.category;
                    const key = input.dataset.key;
                    const value = input.value.trim();
                    
                    if (value && ['ui', 'game', 'allergens', 'tags'].includes(category)) {
                        translations[category][key] = value;
                    }
                });
                
                // Salva traduzioni generali
                if (Object.keys(translations.ui).length > 0 || 
                    Object.keys(translations.game).length > 0 || 
                    Object.keys(translations.allergens).length > 0 || 
                    Object.keys(translations.tags).length > 0) {
                    await window.firebaseService.saveTranslations(language, translations);
                }
                
                // Aggiorna traduzioni prodotti
                const productUpdates = {};
                document.querySelectorAll(`input[data-lang="${language}"][data-category="products"], textarea[data-lang="${language}"][data-category="products"]`).forEach(input => {
                    const key = input.dataset.key;
                    const value = input.value.trim();
                    
                    if (value) {
                        const [productId, field] = key.split('_');
                        if (!productUpdates[productId]) {
                            productUpdates[productId] = {};
                        }
                        productUpdates[productId][field] = value;
                    }
                });
                
                // Salva traduzioni prodotti
                for (const [productId, translations] of Object.entries(productUpdates)) {
                    const product = this.products.find(p => p.id === productId);
                    if (product) {
                        if (!product.translations) product.translations = {};
                        product.translations[language] = translations;
                        await window.firebaseService.saveProduct(product);
                    }
                }
                
                // Aggiorna traduzioni categorie
                const categoryUpdates = {};
                document.querySelectorAll(`input[data-lang="${language}"][data-category="categories"]`).forEach(input => {
                    const categoryId = input.dataset.key;
                    const value = input.value.trim();
                    
                    if (value) {
                        categoryUpdates[categoryId] = value;
                    }
                });
                
                // Salva traduzioni categorie
                for (const [categoryId, translation] of Object.entries(categoryUpdates)) {
                    const category = this.categories.find(c => c.id === categoryId);
                    if (category) {
                        if (!category.translations) category.translations = {};
                        category.translations[language] = translation;
                        await window.firebaseService.saveCategory(category);
                    }
                }
            }
            
            this.showMessage('Tutte le traduzioni sono state salvate con successo', 'success');
        } catch (error) {
            console.error('🔧 [ADMIN] Error saving translations:', error);
            this.showMessage('Errore nel salvataggio delle traduzioni', 'error');
        }
    }

    async exportAllTranslations() {
        
        try {
            const exportData = await window.firebaseService.exportData({
                includeProducts: true,
                includeCategories: true,
                includeLanguages: true,
                includeTranslations: true
            });
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `traduzioni_complete_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showMessage('Traduzioni esportate con successo', 'success');
        } catch (error) {
            console.error('🔧 [ADMIN] Error exporting translations:', error);
            this.showMessage('Errore nell\'esportazione', 'error');
        }
    }

    importTranslations() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                const text = await file.text();
                const data = JSON.parse(text);
                
                await window.firebaseService.importData(data, {
                    includeProducts: true,
                    includeCategories: true,
                    includeLanguages: true,
                    includeTranslations: true
                });
                
                // Ricarica i dati
                await this.loadData();
                
                // Ricarica l'interfaccia traduzioni
                this.loadAllTranslations();
                
                this.showMessage('Traduzioni importate con successo', 'success');
            } catch (error) {
                console.error('🔧 [ADMIN] Error importing translations:', error);
                this.showMessage('Errore nell\'importazione: ' + error.message, 'error');
            }
        };
        input.click();
    }

    getLanguageName(code) {
        const names = {
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
        return names[code] || code.toUpperCase();
    }

    getTagEmoji(tag) {
        const emojis = {
            'maiale': '🐷',
            'pollo': '🍗', 
            'vegetariano': '🥦',
            'congelato': '❄️'
        };
        return emojis[tag] || '🏷️';
    }

    // Utility methods
    filterProducts(searchTerm) {
        // Implementation for product filtering
        console.log('Filtering products:', searchTerm);
    }

    filterProductsByCategory(category) {
        // Implementation for category filtering
        console.log('Filtering by category:', category);
    }

    filterProductsByVisibility(visibility) {
        // Implementation for visibility filtering
        console.log('Filtering by visibility:', visibility);
    }

    showCategoriesModal() {
        // Implementation for categories management
        console.log('Show categories modal');
    }

    logout() {
        sessionStorage.removeItem('admin-auth');
        location.reload();
    }

    showLoading() {
        const loading = document.getElementById('admin-loading');
        if (loading) {
            loading.classList.remove('hidden');
        }
    }

    hideLoading() {
        const loading = document.getElementById('admin-loading');
        if (loading) {
            loading.classList.add('hidden');
        }
    }

    showError(message) {
        this.hideLoading();
        this.showMessage(message, 'error');
    }

    showMessage(message, type = 'info') {
        // Create and show message
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;
        
        const container = document.querySelector('.admin-content .container');
        if (container) {
            container.insertBefore(messageDiv, container.firstChild);
            
            // Auto remove after 5 seconds
            setTimeout(() => {
                if (messageDiv.parentElement) {
                    messageDiv.remove();
                }
            }, 5000);
        }
    }
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AdminPanel();
});
        } catch (error) {
            console.error('🔧 [ADMIN] Error saving translations:', error);
            this.showMessage('Errore nel salvataggio delle traduzioni', 'error');
        }
    }

    async exportLanguage() {
        const language = document.getElementById('translation-language-select').value;
        if (!language) return;
        
        try {
            const exportData = await window.translationService.exportLanguageTranslations(language);
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `translations_${language}_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showMessage('Traduzioni esportate con successo', 'success');
        } catch (error) {
            console.error('🔧 [ADMIN] Error exporting language:', error);
            this.showMessage('Errore nell\'esportazione', 'error');
        }
    }

    importLanguage() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                const text = await file.text();
                const data = JSON.parse(text);
                
                await window.translationService.importLanguageTranslations(data);
                
                // Reload languages and interface
                this.languages = await window.firebaseService.getLanguages();
                this.loadTranslationsInterface();
                
                this.showMessage('Traduzioni importate con successo', 'success');
            } catch (error) {
                console.error('🔧 [ADMIN] Error importing language:', error);
                this.showMessage('Errore nell\'importazione: ' + error.message, 'error');
            }
        };
        input.click();
    }

    // Export/Import functionality
    showExportModal() {
        const modal = document.getElementById('export-modal');
        if (!modal) {
            this.createExportModal();
        } else {
            modal.classList.remove('hidden');
        }
    }

    createExportModal() {
        const modalHTML = `
            <div id="export-modal" class="modal" role="dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Esporta Dati</h2>
                        <button class="close-btn" aria-label="Chiudi">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="export-options">
                            <h3>Seleziona cosa esportare:</h3>
                            <label><input type="checkbox" id="export-products" checked> Prodotti</label>
                            <label><input type="checkbox" id="export-categories" checked> Categorie</label>
                            <label><input type="checkbox" id="export-languages" checked> Lingue</label>
                            <label><input type="checkbox" id="export-translations" checked> Traduzioni</label>
                        </div>
                        <div class="form-actions">
                            <button id="execute-export-btn" class="btn-primary">Esporta</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        document.getElementById('execute-export-btn').addEventListener('click', () => {
            this.executeExport();
        });
        
        document.querySelector('#export-modal .close-btn').addEventListener('click', () => {
            document.getElementById('export-modal').classList.add('hidden');
        });
    }

    async executeExport() {
        try {
            const options = {
                includeProducts: document.getElementById('export-products').checked,
                includeCategories: document.getElementById('export-categories').checked,
                includeLanguages: document.getElementById('export-languages').checked,
                includeTranslations: document.getElementById('export-translations').checked
            };
            
            const exportData = await window.firebaseService.exportData(options);
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `barrino_export_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            document.getElementById('export-modal').classList.add('hidden');
            this.showMessage('Dati esportati con successo', 'success');
        } catch (error) {
            console.error('🔧 [ADMIN] Error exporting data:', error);
            this.showMessage('Errore nell\'esportazione: ' + error.message, 'error');
        }
    }

    showImportModal() {
        const modal = document.getElementById('import-modal');
        if (!modal) {
            this.createImportModal();
        } else {
            modal.classList.remove('hidden');
        }
    }

    createImportModal() {
        const modalHTML = `
            <div id="import-modal" class="modal" role="dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Importa Dati</h2>
                        <button class="close-btn" aria-label="Chiudi">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="import-file">Seleziona file JSON:</label>
                            <input type="file" id="import-file" accept=".json">
                        </div>
                        <div class="import-options">
                            <h3>Seleziona cosa importare:</h3>
                            <label><input type="checkbox" id="import-products" checked> Prodotti</label>
                            <label><input type="checkbox" id="import-categories" checked> Categorie</label>
                            <label><input type="checkbox" id="import-languages" checked> Lingue</label>
                            <label><input type="checkbox" id="import-translations" checked> Traduzioni</label>
                        </div>
                        <div class="form-actions">
                            <button id="execute-import-btn" class="btn-primary">Importa</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        document.getElementById('execute-import-btn').addEventListener('click', () => {
            this.executeImport();
        });
        
        document.querySelector('#import-modal .close-btn').addEventListener('click', () => {
            document.getElementById('import-modal').classList.add('hidden');
        });
    }

    async executeImport() {
        const fileInput = document.getElementById('import-file');
        const file = fileInput.files[0];
        
        if (!file) {
            this.showMessage('Seleziona un file da importare', 'warning');
            return;
        }
        
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            const options = {
                includeProducts: document.getElementById('import-products').checked,
                includeCategories: document.getElementById('import-categories').checked,
                includeLanguages: document.getElementById('import-languages').checked,
                includeTranslations: document.getElementById('import-translations').checked
            };
            
            const imported = await window.firebaseService.importData(data, options);
            
            // Reload data
            await this.loadData();
            
            document.getElementById('import-modal').classList.add('hidden');
            this.showMessage(`Importati ${imported} elementi con successo`, 'success');
        } catch (error) {
            console.error('🔧 [ADMIN] Error importing data:', error);
            this.showMessage('Errore nell\'importazione: ' + error.message, 'error');
        }
    }

    // Utility methods
    filterProducts(searchTerm) {
        // Implementation for product filtering
        console.log('Filtering products:', searchTerm);
    }

    filterProductsByCategory(category) {
        // Implementation for category filtering
        console.log('Filtering by category:', category);
    }

    filterProductsByVisibility(visibility) {
        // Implementation for visibility filtering
        console.log('Filtering by visibility:', visibility);
    }

    showCategoriesModal() {
        // Implementation for categories management
        console.log('Show categories modal');
    }

    showLanguagesModal() {
        // Implementation for languages management
        console.log('Show languages modal');
    }

    logout() {
        sessionStorage.removeItem('admin-auth');
        location.reload();
    }

    showLoading() {
        const loading = document.getElementById('admin-loading');
        if (loading) {
            loading.classList.remove('hidden');
        }
    }

    hideLoading() {
        const loading = document.getElementById('admin-loading');
        if (loading) {
            loading.classList.add('hidden');
        }
    }

    showError(message) {
        this.hideLoading();
        this.showMessage(message, 'error');
    }

    showMessage(message, type = 'info') {
        // Create and show message
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;
        
        const container = document.querySelector('.admin-content .container');
        if (container) {
            container.insertBefore(messageDiv, container.firstChild);
            
            // Auto remove after 5 seconds
            setTimeout(() => {
                if (messageDiv.parentElement) {
                    messageDiv.remove();
                }
            }, 5000);
        }
    }
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AdminPanel();
});