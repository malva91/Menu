// Admin Panel - Rewritten for new translation system
class AdminPanel {
    constructor() {
        this.isLoggedIn = false;
        this.currentView = 'products';
        this.currentLanguage = 'it';
        this.defaultData = null;
        this.languageData = null;
        this.availableLanguages = [];
        
        this.init();
    }

    async init() {
        console.log('⚙️ [ADMIN] Initializing admin panel...');
        
        // Check login status
        this.checkLoginStatus();
        
        if (this.isLoggedIn) {
            await this.initAdminPanel();
        } else {
            this.showLoginScreen();
        }
    }

    checkLoginStatus() {
        // Simple session check (in production, use proper authentication)
        this.isLoggedIn = sessionStorage.getItem('admin-logged-in') === 'true';
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

    async handleLogin() {
        const password = document.getElementById('admin-password').value;
        const errorElement = document.getElementById('password-error');
        
        // Clear previous errors
        errorElement.textContent = '';
        errorElement.classList.remove('show');
        
        if (password === 'barrino2025') {
            sessionStorage.setItem('admin-logged-in', 'true');
            this.isLoggedIn = true;
            
            document.getElementById('login-screen').classList.add('hidden');
            document.getElementById('admin-panel').classList.remove('hidden');
            
            await this.initAdminPanel();
        } else {
            errorElement.textContent = 'Password non corretta';
            errorElement.classList.add('show');
            
            // Clear password field
            document.getElementById('admin-password').value = '';
        }
    }

    async initAdminPanel() {
        console.log('⚙️ [ADMIN] Initializing admin panel interface...');
        
        // Wait for services
        await this.waitForServices();
        
        // Load data
        await this.loadData();
        
        // Initialize event listeners
        this.initEventListeners();
        
        // Show products view by default
        this.showProductsView();
        
        console.log('⚙️ [ADMIN] Admin panel initialized');
    }

    async waitForServices() {
        let attempts = 0;
        const maxAttempts = 100;
        
        while ((!window.firebaseService?.isInitialized || !window.translationService?.isLoaded) && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
    }

    async loadData() {
        try {
            this.defaultData = await window.firebaseService.getDefaultData();
            this.availableLanguages = await window.firebaseService.getAvailableLanguages();
            this.languageData = await window.firebaseService.getLanguageData(this.currentLanguage);
            
            console.log('⚙️ [ADMIN] Data loaded');
        } catch (error) {
            console.error('⚙️ [ADMIN] Error loading data:', error);
        }
    }

    initEventListeners() {
        // Navigation buttons
        document.getElementById('add-product-btn')?.addEventListener('click', () => {
            this.showAddProductModal();
        });

        document.getElementById('manage-translations-btn')?.addEventListener('click', () => {
            this.showTranslationsModal();
        });

        document.getElementById('export-btn')?.addEventListener('click', () => {
            this.showExportModal();
        });

        document.getElementById('logout-btn')?.addEventListener('click', () => {
            this.logout();
        });

        // Modal close buttons
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                modal?.classList.add('hidden');
            });
        });

        // Product form
        document.getElementById('product-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleProductSubmit();
        });

        // Cancel buttons
        document.getElementById('cancel-product')?.addEventListener('click', () => {
            document.getElementById('product-modal').classList.add('hidden');
        });
    }

    // Products View
    showProductsView() {
        this.currentView = 'products';
        this.renderProductsTable();
        this.updateStats();
    }

    renderProductsTable() {
        const tbody = document.getElementById('products-table-body');
        if (!tbody || !this.defaultData) return;

        const products = this.defaultData.products || [];
        
        tbody.innerHTML = products.map(product => {
            const productName = this.languageData?.products?.[product.id]?.name || product.id;
            const categoryName = this.languageData?.categories?.[product.category] || product.category;
            
            return `
                <tr>
                    <td class="product-name">${productName}</td>
                    <td class="product-category">${categoryName}</td>
                    <td class="product-price">€${product.price.toFixed(2)}</td>
                    <td class="product-allergens">
                        ${product.allergens.map(a => this.getAllergenEmoji(a)).join(' ')}
                    </td>
                    <td>
                        <div class="visibility-toggle">
                            <input type="checkbox" ${product.visible ? 'checked' : ''} 
                                   onchange="adminPanel.toggleProductVisibility('${product.id}', this.checked)">
                        </div>
                    </td>
                    <td>
                        <div class="table-actions">
                            <button class="btn-icon edit" onclick="adminPanel.editProduct('${product.id}')" title="Modifica">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon delete" onclick="adminPanel.deleteProduct('${product.id}')" title="Elimina">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        // Make adminPanel available globally
        window.adminPanel = this;
    }

    updateStats() {
        if (!this.defaultData) return;

        const products = this.defaultData.products || [];
        const categories = this.defaultData.categories || [];
        
        document.getElementById('total-products').textContent = products.length;
        document.getElementById('visible-products').textContent = products.filter(p => p.visible).length;
        document.getElementById('total-categories').textContent = categories.length;
        document.getElementById('total-languages').textContent = this.availableLanguages.length;
    }

    // Product Management
    showAddProductModal() {
        const modal = document.getElementById('product-modal');
        const title = document.getElementById('product-modal-title');
        
        title.textContent = 'Nuovo Prodotto';
        this.clearProductForm();
        this.populateCategorySelect();
        modal.classList.remove('hidden');
    }

    clearProductForm() {
        document.getElementById('product-form').reset();
        document.getElementById('product-visible').checked = true;
    }

    populateCategorySelect() {
        const select = document.getElementById('product-category');
        if (!select || !this.defaultData) return;

        const categories = this.defaultData.categories || [];
        
        select.innerHTML = categories.map(category => {
            const categoryName = this.languageData?.categories?.[category.id] || category.id;
            return `<option value="${category.id}">${categoryName}</option>`;
        }).join('');
    }

    async handleProductSubmit() {
        try {
            const formData = new FormData(document.getElementById('product-form'));
            
            const product = {
                id: formData.get('product-id'),
                category: formData.get('product-category'),
                price: parseFloat(formData.get('product-price')),
                visible: formData.get('product-visible') === 'on',
                allergens: this.getSelectedAllergens(),
                tags: this.getSelectedTags()
            };

            await window.firebaseService.addProduct(product);
            
            // Reload data and update UI
            await this.loadData();
            this.renderProductsTable();
            this.updateStats();
            
            // Close modal
            document.getElementById('product-modal').classList.add('hidden');
            
            this.showMessage('Prodotto aggiunto con successo!', 'success');
        } catch (error) {
            console.error('⚙️ [ADMIN] Error adding product:', error);
            this.showMessage('Errore nell\'aggiunta del prodotto: ' + error.message, 'error');
        }
    }

    getSelectedAllergens() {
        const allergens = [];
        document.querySelectorAll('[data-allergen]:checked').forEach(checkbox => {
            allergens.push(checkbox.dataset.allergen);
        });
        return allergens;
    }

    getSelectedTags() {
        const tags = [];
        document.querySelectorAll('[data-tag]:checked').forEach(checkbox => {
            tags.push(checkbox.dataset.tag);
        });
        return tags;
    }

    async toggleProductVisibility(productId, visible) {
        try {
            const product = this.defaultData.products.find(p => p.id === productId);
            if (product) {
                product.visible = visible;
                await window.firebaseService.saveDefaultData(this.defaultData);
                this.showMessage('Visibilità prodotto aggiornata', 'success');
            }
        } catch (error) {
            console.error('⚙️ [ADMIN] Error updating product visibility:', error);
            this.showMessage('Errore nell\'aggiornamento della visibilità', 'error');
        }
    }

    async deleteProduct(productId) {
        if (!confirm('Sei sicuro di voler eliminare questo prodotto?')) return;

        try {
            await window.firebaseService.deleteProduct(productId);
            await this.loadData();
            this.renderProductsTable();
            this.updateStats();
            this.showMessage('Prodotto eliminato con successo!', 'success');
        } catch (error) {
            console.error('⚙️ [ADMIN] Error deleting product:', error);
            this.showMessage('Errore nell\'eliminazione del prodotto: ' + error.message, 'error');
        }
    }

    // Translations Management
    showTranslationsModal() {
        const modal = document.getElementById('translations-modal');
        this.renderTranslationsInterface();
        modal.classList.remove('hidden');
    }

    renderTranslationsInterface() {
        const container = document.getElementById('translations-container');
        if (!container) return;

        container.innerHTML = `
            <div class="translations-header">
                <h3>Gestione Traduzioni</h3>
                <div class="language-selector-admin">
                    <label for="translation-language">Lingua:</label>
                    <select id="translation-language">
                        ${this.availableLanguages.map(lang => `
                            <option value="${lang}" ${lang === this.currentLanguage ? 'selected' : ''}>
                                ${lang.toUpperCase()}
                            </option>
                        `).join('')}
                    </select>
                    <button class="btn-secondary" onclick="adminPanel.loadLanguageForTranslation()">
                        Carica
                    </button>
                </div>
            </div>
            
            <div class="translations-sections">
                <div class="translation-section">
                    <h4><i class="fas fa-language"></i> Informazioni Lingua</h4>
                    <div class="form-group">
                        <label>Nome:</label>
                        <input type="text" id="lang-name" value="${this.languageData?.tagLingua?.name || ''}">
                    </div>
                    <div class="form-group">
                        <label>Flag:</label>
                        <input type="text" id="lang-flag" value="${this.languageData?.tagLingua?.flag || ''}">
                    </div>
                    <div class="form-group">
                        <label>Direzione:</label>
                        <select id="lang-direction">
                            <option value="ltr" ${this.languageData?.tagLingua?.direction === 'ltr' ? 'selected' : ''}>LTR</option>
                            <option value="rtl" ${this.languageData?.tagLingua?.direction === 'rtl' ? 'selected' : ''}>RTL</option>
                        </select>
                    </div>
                </div>

                <div class="translation-section">
                    <h4><i class="fas fa-exclamation-triangle"></i> Allergeni</h4>
                    <div class="translation-fields">
                        ${this.renderAllergenFields()}
                    </div>
                </div>

                <div class="translation-section">
                    <h4><i class="fas fa-comments"></i> Testi Interface</h4>
                    <div class="translation-fields">
                        ${this.renderTextFields()}
                    </div>
                </div>

                <div class="translation-section">
                    <h4><i class="fas fa-box"></i> Prodotti</h4>
                    <div class="translation-fields">
                        ${this.renderProductFields()}
                    </div>
                </div>

                <div class="translation-section">
                    <h4><i class="fas fa-list"></i> Categorie</h4>
                    <div class="translation-fields">
                        ${this.renderCategoryFields()}
                    </div>
                </div>
            </div>

            <div class="translations-actions">
                <button class="btn-primary" onclick="adminPanel.saveTranslations()">
                    <i class="fas fa-save"></i> Salva Traduzioni
                </button>
                <button class="btn-secondary" onclick="adminPanel.exportLanguage()">
                    <i class="fas fa-download"></i> Esporta Lingua
                </button>
                <button class="btn-secondary" onclick="adminPanel.showImportLanguage()">
                    <i class="fas fa-upload"></i> Importa Lingua
                </button>
            </div>
        `;
    }

    renderAllergenFields() {
        const allergens = ['glutine', 'crostacei', 'uova', 'pesce', 'arachidi', 'soia', 'latte', 
                          'frutta_guscio', 'sedano', 'senape', 'sesamo', 'solfiti', 'lupini', 'molluschi', 'alcol'];
        
        return allergens.map(allergen => `
            <div class="form-group">
                <label>${this.getAllergenEmoji(allergen)} ${allergen}:</label>
                <input type="text" data-allergen="${allergen}" 
                       value="${this.languageData?.allergeni?.[allergen] || ''}"
                       placeholder="Traduzione per ${allergen}">
            </div>
        `).join('');
    }

    renderTextFields() {
        const commonTexts = [
            'search_placeholder', 'loading', 'no_results', 'legend_title', 'disclaimer_service',
            'review_title', 'review_button', 'game_title', 'score_label', 'back_to_menu_text'
        ];
        
        return commonTexts.map(textKey => `
            <div class="form-group">
                <label>${textKey}:</label>
                <input type="text" data-text="${textKey}" 
                       value="${this.languageData?.testi?.[textKey] || ''}"
                       placeholder="Traduzione per ${textKey}">
            </div>
        `).join('');
    }

    renderProductFields() {
        if (!this.defaultData?.products) return '<p>Nessun prodotto trovato</p>';
        
        return this.defaultData.products.map(product => `
            <div class="product-translation">
                <h5>${product.id}</h5>
                <div class="form-group">
                    <label>Nome:</label>
                    <input type="text" data-product="${product.id}" data-field="name"
                           value="${this.languageData?.products?.[product.id]?.name || ''}"
                           placeholder="Nome del prodotto">
                </div>
                <div class="form-group">
                    <label>Descrizione:</label>
                    <textarea data-product="${product.id}" data-field="description"
                              placeholder="Descrizione del prodotto">${this.languageData?.products?.[product.id]?.description || ''}</textarea>
                </div>
            </div>
        `).join('');
    }

    renderCategoryFields() {
        if (!this.defaultData?.categories) return '<p>Nessuna categoria trovata</p>';
        
        return this.defaultData.categories.map(category => `
            <div class="form-group">
                <label><i class="${category.icon || 'fas fa-utensils'}"></i> ${category.id}:</label>
                <input type="text" data-category="${category.id}"
                       value="${this.languageData?.categories?.[category.id] || ''}"
                       placeholder="Nome della categoria">
            </div>
        `).join('');
    }

    async loadLanguageForTranslation() {
        const selectedLang = document.getElementById('translation-language').value;
        this.currentLanguage = selectedLang;
        
        try {
            this.languageData = await window.firebaseService.getLanguageData(selectedLang);
            this.renderTranslationsInterface();
            this.showMessage(`Lingua ${selectedLang} caricata`, 'success');
        } catch (error) {
            console.error('⚙️ [ADMIN] Error loading language:', error);
            this.showMessage('Errore nel caricamento della lingua', 'error');
        }
    }

    async saveTranslations() {
        try {
            const updatedLanguageData = {
                tagLingua: {
                    name: document.getElementById('lang-name').value,
                    flag: document.getElementById('lang-flag').value,
                    direction: document.getElementById('lang-direction').value,
                    active: true
                },
                allergeni: {},
                testi: {},
                products: {},
                categories: {}
            };

            // Collect allergen translations
            document.querySelectorAll('[data-allergen]').forEach(input => {
                const allergen = input.dataset.allergen;
                updatedLanguageData.allergeni[allergen] = input.value;
            });

            // Collect text translations
            document.querySelectorAll('[data-text]').forEach(input => {
                const textKey = input.dataset.text;
                updatedLanguageData.testi[textKey] = input.value;
            });

            // Collect product translations
            document.querySelectorAll('[data-product]').forEach(input => {
                const productId = input.dataset.product;
                const field = input.dataset.field;
                
                if (!updatedLanguageData.products[productId]) {
                    updatedLanguageData.products[productId] = {};
                }
                updatedLanguageData.products[productId][field] = input.value;
            });

            // Collect category translations
            document.querySelectorAll('[data-category]').forEach(input => {
                const categoryId = input.dataset.category;
                updatedLanguageData.categories[categoryId] = input.value;
            });

            await window.firebaseService.saveLanguageData(this.currentLanguage, updatedLanguageData);
            this.languageData = updatedLanguageData;
            
            this.showMessage('Traduzioni salvate con successo!', 'success');
        } catch (error) {
            console.error('⚙️ [ADMIN] Error saving translations:', error);
            this.showMessage('Errore nel salvataggio delle traduzioni: ' + error.message, 'error');
        }
    }

    // Export/Import
    showExportModal() {
        const modal = document.getElementById('export-modal');
        this.populateExportLanguageSelect();
        modal.classList.remove('hidden');
    }

    populateExportLanguageSelect() {
        const select = document.getElementById('export-language');
        if (!select) return;

        select.innerHTML = '<option value="">Seleziona lingua</option>' +
            this.availableLanguages.map(lang => `
                <option value="${lang}">${lang.toUpperCase()}</option>
            `).join('');
    }

    async exportLanguage() {
        const language = document.getElementById('export-language').value;
        if (!language) {
            this.showMessage('Seleziona una lingua da esportare', 'warning');
            return;
        }

        try {
            const exportData = await window.firebaseService.exportLanguage(language);
            
            // Download as JSON file
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `barrino-${language}-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            document.getElementById('export-modal').classList.add('hidden');
            this.showMessage(`Lingua ${language} esportata con successo!`, 'success');
        } catch (error) {
            console.error('⚙️ [ADMIN] Error exporting language:', error);
            this.showMessage('Errore nell\'esportazione: ' + error.message, 'error');
        }
    }

    showImportLanguage() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => this.handleImportFile(e.target.files[0]);
        input.click();
    }

    async handleImportFile(file) {
        if (!file) return;

        try {
            const text = await file.text();
            const importData = JSON.parse(text);
            
            await window.firebaseService.importLanguage(importData);
            await this.loadData();
            
            this.showMessage(`Lingua ${importData.language} importata con successo!`, 'success');
        } catch (error) {
            console.error('⚙️ [ADMIN] Error importing language:', error);
            this.showMessage('Errore nell\'importazione: ' + error.message, 'error');
        }
    }

    // Utility methods
    getAllergenEmoji(allergen) {
        const emojis = {
            'glutine': '🌾', 'crostacei': '🦞', 'uova': '🥚', 'pesce': '🐟',
            'arachidi': '🥜', 'soia': '🌿', 'latte': '🥛', 'frutta_guscio': '🌰',
            'sedano': '🥬', 'senape': '🟡', 'sesamo': '⚪', 'solfiti': '🧪',
            'lupini': '🌕', 'molluschi': '🦑', 'alcol': '🍷'
        };
        return emojis[allergen] || '❓';
    }

    showMessage(message, type = 'info') {
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}`;
        messageEl.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;
        
        // Add to page
        const container = document.querySelector('.admin-content .container');
        if (container) {
            container.insertBefore(messageEl, container.firstChild);
            
            // Auto remove after 5 seconds
            setTimeout(() => {
                messageEl.remove();
            }, 5000);
        }
    }

    logout() {
        sessionStorage.removeItem('admin-logged-in');
        location.reload();
    }
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminPanel = new AdminPanel();
});