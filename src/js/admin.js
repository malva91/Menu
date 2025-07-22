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
        
        document.getElementById('manage-languages-btn')?.addEventListener('click', () => {
            this.showLanguagesModal();
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
        if (!modal) {
            this.createTranslationsModal();
        } else {
            modal.classList.remove('hidden');
        }
        this.loadTranslationsInterface();
    }

    createTranslationsModal() {
        const modalHTML = `
            <div id="translations-modal" class="modal" role="dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Gestione Traduzioni</h2>
                        <button class="close-btn" aria-label="Chiudi">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="translations-controls">
                            <div class="form-group">
                                <label for="translation-language-select">Lingua:</label>
                                <select id="translation-language-select">
                                    ${Object.entries(this.languages).map(([code, data]) => 
                                        `<option value="${code}">${data.flag || DEFAULT_LANGUAGE_FLAGS[code] || '🌐'} ${data.name}</option>`
                                    ).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="translation-category-select">Categoria:</label>
                                <select id="translation-category-select">
                                    <option value="ui">Interfaccia Utente</option>
                                    <option value="game">Gioco</option>
                                    <option value="allergens">Allergeni</option>
                                    <option value="tags">Caratteristiche</option>
                                </select>
                            </div>
                            <button id="load-translations-btn" class="btn-primary">Carica Traduzioni</button>
                        </div>
                        <div id="translations-editor" class="translations-editor">
                            <!-- Translation fields will be loaded here -->
                        </div>
                        <div class="form-actions">
                            <button id="save-translations-btn" class="btn-primary">Salva Traduzioni</button>
                            <button id="export-language-btn" class="btn-secondary">Esporta Lingua</button>
                            <button id="import-language-btn" class="btn-secondary">Importa Lingua</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Add event listeners
        document.getElementById('load-translations-btn').addEventListener('click', () => {
            this.loadTranslationsForEditing();
        });
        
        document.getElementById('save-translations-btn').addEventListener('click', () => {
            this.saveTranslations();
        });
        
        document.getElementById('export-language-btn').addEventListener('click', () => {
            this.exportLanguage();
        });
        
        document.getElementById('import-language-btn').addEventListener('click', () => {
            this.importLanguage();
        });
        
        document.querySelector('#translations-modal .close-btn').addEventListener('click', () => {
            document.getElementById('translations-modal').classList.add('hidden');
        });
    }

    loadTranslationsInterface() {
        const modal = document.getElementById('translations-modal');
        modal.classList.remove('hidden');
        
        // Update language select
        const languageSelect = document.getElementById('translation-language-select');
        if (languageSelect) {
            languageSelect.innerHTML = Object.entries(this.languages).map(([code, data]) => 
                `<option value="${code}">${data.flag || DEFAULT_LANGUAGE_FLAGS[code] || '🌐'} ${data.name}</option>`
            ).join('');
        }
    }

    async loadTranslationsForEditing() {
        const language = document.getElementById('translation-language-select').value;
        const category = document.getElementById('translation-category-select').value;
        
        if (!language || !category) return;
        
        try {
            const translations = await window.firebaseService.getTranslations(language);
            const categoryTranslations = translations[category] || {};
            
            this.renderTranslationEditor(category, categoryTranslations);
        } catch (error) {
            console.error('🔧 [ADMIN] Error loading translations:', error);
            this.showMessage('Errore nel caricamento delle traduzioni', 'error');
        }
    }

    renderTranslationEditor(category, translations) {
        const editor = document.getElementById('translations-editor');
        const keys = TRANSLATION_KEYS[category] || [];
        
        editor.innerHTML = `
            <h3>Traduzioni per categoria: ${category}</h3>
            <div class="translation-fields">
                ${keys.map(key => `
                    <div class="form-group">
                        <label for="trans-${key}">${key}:</label>
                        <input type="text" id="trans-${key}" value="${translations[key] || ''}" 
                               placeholder="Inserisci traduzione per ${key}">
                    </div>
                `).join('')}
            </div>
        `;
    }

    async saveTranslations() {
        const language = document.getElementById('translation-language-select').value;
        const category = document.getElementById('translation-category-select').value;
        
        if (!language || !category) return;
        
        try {
            // Get current translations for this language
            const currentTranslations = await window.firebaseService.getTranslations(language);
            
            // Update the specific category
            if (!currentTranslations[category]) {
                currentTranslations[category] = {};
            }
            
            // Collect values from form
            const keys = TRANSLATION_KEYS[category] || [];
            keys.forEach(key => {
                const input = document.getElementById(`trans-${key}`);
                if (input) {
                    currentTranslations[category][key] = input.value.trim();
                }
            });
            
            // Save to database
            await window.firebaseService.saveTranslations(language, currentTranslations);
            
            this.showMessage('Traduzioni salvate con successo', 'success');
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