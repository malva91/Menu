import { ADMIN_PASSWORD } from '../utils/constants.js';

// Admin Panel JavaScript
class AdminPanel {
    constructor() {
        this.currentEditingProduct = null;
        this.currentEditingCategory = null;
        this.products = [];
        this.categories = [];
        this.translations = {};
        this.isLoggedIn = false;
        
        this.init();
    }

    init() {
        this.checkAuthStatus();
        this.initEventListeners();
    }

    checkAuthStatus() {
        const isLoggedIn = sessionStorage.getItem('admin-logged-in') === 'true';
        
        if (isLoggedIn) {
            this.showAdminPanel();
            this.loadAdminData();
        } else {
            this.showLoginScreen();
        }
    }

    initEventListeners() {
        // Login form
        document.getElementById('login-form')?.addEventListener('submit', (e) => {
            this.handleLogin(e);
        });

        // Logout button
        document.getElementById('logout-btn')?.addEventListener('click', () => {
            this.handleLogout();
        });

        // Product management
        document.getElementById('add-product-btn')?.addEventListener('click', () => {
            this.showProductModal();
        });

        document.getElementById('product-form')?.addEventListener('submit', (e) => {
            this.handleProductSave(e);
        });

        document.getElementById('cancel-product')?.addEventListener('click', () => {
            this.hideProductModal();
        });

        // Category management
        document.getElementById('manage-categories-btn')?.addEventListener('click', () => {
            this.showCategoriesModal();
        });

        document.getElementById('add-category-btn')?.addEventListener('click', () => {
            this.showCategoryForm();
        });

        document.getElementById('category-form')?.addEventListener('submit', (e) => {
            this.handleCategorySave(e);
        });

        document.getElementById('cancel-category')?.addEventListener('click', () => {
            this.hideCategoryForm();
        });

        // Language management
        document.getElementById('manage-languages-btn')?.addEventListener('click', () => {
            this.showLanguagesModal();
        });

        document.getElementById('add-language-btn')?.addEventListener('click', () => {
            this.showLanguageForm();
        });

        document.getElementById('language-form')?.addEventListener('submit', (e) => {
            this.handleLanguageSave(e);
        });

        document.getElementById('cancel-language')?.addEventListener('click', () => {
            this.hideLanguageForm();
        });
        
        // Translations management
        document.getElementById('manage-translations-btn')?.addEventListener('click', () => {
            this.showTranslationsModal();
        });

        document.getElementById('add-translation-key-btn')?.addEventListener('click', () => {
            this.showTranslationForm();
        });

        document.getElementById('import-game-translations-btn')?.addEventListener('click', () => {
            this.importGameTranslations();
        });

        document.getElementById('import-menu-translations-btn')?.addEventListener('click', () => {
            this.importMenuTranslations();
        });

        document.getElementById('translation-form')?.addEventListener('submit', (e) => {
            this.handleTranslationSave(e);
        });

        document.getElementById('cancel-translation')?.addEventListener('click', () => {
            this.hideTranslationForm();
        });

        document.getElementById('translations-search')?.addEventListener('input', (e) => {
            this.filterTranslations(e.target.value);
        });
        
        // Import/Export
        document.getElementById('import-btn')?.addEventListener('click', () => {
            this.showImportModal();
        });

        document.getElementById('export-btn')?.addEventListener('click', () => {
            this.showExportModal();
        });

        // Export form
        document.getElementById('export-form')?.addEventListener('submit', (e) => {
            this.handleExport(e);
        });

        document.getElementById('cancel-export')?.addEventListener('click', () => {
            this.hideExportModal();
        });
        
        // Full Database Export
        document.getElementById('export-full-btn')?.addEventListener('click', () => {
            this.showExportFullModal();
        });
        
        document.getElementById('export-full-execute')?.addEventListener('click', () => {
            this.handleExportFull();
        });
        
        document.getElementById('cancel-export-full')?.addEventListener('click', () => {
            this.hideExportFullModal();
        });
        
        // Export full modal checkboxes - update preview when changed
        document.querySelectorAll('#export-full-modal input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateExportFullPreview();
            });
        });

        // Import form
        document.getElementById('import-form')?.addEventListener('submit', (e) => {
            this.handleImport(e);
        });

        document.getElementById('cancel-import')?.addEventListener('click', () => {
            this.hideImportModal();
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

        // Close modals on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.add('hidden');
                }
            });
        });

        // Filters
        document.getElementById('category-filter')?.addEventListener('change', () => {
            this.applyFilters();
        });

        document.getElementById('visibility-filter')?.addEventListener('change', () => {
            this.applyFilters();
        });

        document.getElementById('admin-search')?.addEventListener('input', () => {
            this.applyFilters();
        });
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const password = document.getElementById('admin-password').value;
        const errorDiv = document.getElementById('password-error');
        const submitBtn = document.getElementById('login-submit-btn');
        
        // Simple password check (in production, use proper authentication)
        if (password === ADMIN_PASSWORD) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Accesso...';
            
            // Simulate loading
            setTimeout(() => {
                sessionStorage.setItem('admin-logged-in', 'true');
                this.isLoggedIn = true;
                this.showAdminPanel();
                this.loadAdminData();
            }, 1000);
        } else {
            errorDiv.textContent = 'Password non corretta';
            errorDiv.classList.add('show');
            
            // Clear error after 3 seconds
            setTimeout(() => {
                errorDiv.classList.remove('show');
            }, 3000);
        }
    }

    handleLogout() {
        sessionStorage.removeItem('admin-logged-in');
        this.isLoggedIn = false;
        this.showLoginScreen();
    }

    showLoginScreen() {
        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('admin-panel').classList.add('hidden');
    }

    showAdminPanel() {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('admin-panel').classList.remove('hidden');
    }

    async loadAdminData() {
        this.showAdminLoading();
        
        try {
            const [products, categories, translations] = await Promise.all([
                window.firebaseService.getProducts(),
                window.firebaseService.getCategories(),
                window.firebaseService.getTranslations()
            ]);
            
            this.products = products;
            this.categories = categories;
            this.translations = translations;
            
            // Extract languages from translations._languages
            if (translations && translations._languages) {
                this.languages = translations._languages;
                console.log('🔥 [ADMIN] Loaded languages from database:', Object.keys(this.languages));
            } else {
                console.warn('🔥 [ADMIN] No _languages found in translations, using empty object');
                this.languages = {};
            }
            
            this.updateStatistics();
            this.populateFilters();
            this.renderProductsTable();
            
            this.hideAdminLoading();
        } catch (error) {
            console.error('Error loading admin data:', error);
            this.showAdminError('Errore nel caricamento dei dati');
        }
    }

    showAdminLoading() {
        document.getElementById('admin-loading')?.classList.remove('hidden');
    }

    hideAdminLoading() {
        document.getElementById('admin-loading')?.classList.add('hidden');
    }

    showAdminError(message) {
        this.hideAdminLoading();
        // Show error message in admin panel
        console.error(message);
    }

    updateStatistics() {
        const totalProducts = this.products.length;
        const visibleProducts = this.products.filter(p => p.visible).length;
        const totalCategories = this.categories.length;
        
        document.getElementById('total-products').textContent = totalProducts;
        document.getElementById('visible-products').textContent = visibleProducts;
        document.getElementById('total-categories').textContent = totalCategories;
    }

    populateFilters() {
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.innerHTML = '<option value="">Tutte le categorie</option>';
            this.categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.translations.it || category.id;
                categoryFilter.appendChild(option);
            });
        }

        // Populate product category select
        const productCategory = document.getElementById('product-category');
        if (productCategory) {
            productCategory.innerHTML = '';
            this.categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.translations.it || category.id;
                productCategory.appendChild(option);
            });
        }
    }

    renderProductsTable() {
        const tbody = document.getElementById('products-table-body');
        if (!tbody) return;
        
        const filteredProducts = this.getFilteredProducts();
        
        tbody.innerHTML = filteredProducts.map(product => {
            const translation = product.translations.it || {};
            const allergenIcons = product.allergens.map(allergen => 
                this.getAllergenEmoji(allergen)
            ).join(' ');
            
            return `
                <tr>
                    <td>
                        <div class="product-name">${translation.name || product.id}</div>
                        <div class="product-category">${product.category}</div>
                    </td>
                    <td>${product.category}</td>
                    <td class="product-price">€${product.price.toFixed(2)}</td>
                    <td>
                        <div class="product-allergens">
                            ${allergenIcons}
                        </div>
                    </td>
                    <td>
                        <div class="visibility-toggle">
                            <input type="checkbox" ${product.visible ? 'checked' : ''} 
                                   onchange="adminPanel.toggleProductVisibility('${product.id}', this.checked)">
                        </div>
                    </td>
                    <td>
                        <div class="table-actions">
                            <button class="btn-icon edit" onclick="adminPanel.editProduct('${product.id}')" 
                                    title="Modifica">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon delete" onclick="adminPanel.deleteProduct('${product.id}')" 
                                    title="Elimina">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    getFilteredProducts() {
        const categoryFilter = document.getElementById('category-filter')?.value || '';
        const visibilityFilter = document.getElementById('visibility-filter')?.value || '';
        const searchTerm = document.getElementById('admin-search')?.value.toLowerCase() || '';
        
        return this.products.filter(product => {
            // Category filter
            if (categoryFilter && product.category !== categoryFilter) {
                return false;
            }
            
            // Visibility filter
            if (visibilityFilter === 'visible' && !product.visible) {
                return false;
            }
            if (visibilityFilter === 'hidden' && product.visible) {
                return false;
            }
            
            // Search filter
            if (searchTerm) {
                const translation = product.translations.it || {};
                const searchableText = `${translation.name || ''} ${translation.description || ''} ${product.id}`.toLowerCase();
                if (!searchableText.includes(searchTerm)) {
                    return false;
                }
            }
            
            return true;
        });
    }

    applyFilters() {
        this.renderProductsTable();
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

    // Product management methods
    showProductModal(productId = null) {
        const modal = document.getElementById('product-modal');
        const title = document.getElementById('product-modal-title');
        
        if (productId) {
            this.currentEditingProduct = this.products.find(p => p.id === productId);
            title.textContent = 'Modifica Prodotto';
            this.populateProductForm(this.currentEditingProduct);
        } else {
            this.currentEditingProduct = null;
            title.textContent = 'Nuovo Prodotto';
            this.clearProductForm();
        }
        
        modal.classList.remove('hidden');
    }

    hideProductModal() {
        document.getElementById('product-modal').classList.add('hidden');
        this.currentEditingProduct = null;
    }

    populateProductForm(product) {
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-visible').checked = product.visible;
        
        // Populate allergens
        document.querySelectorAll('[data-allergen]').forEach(checkbox => {
            checkbox.checked = product.allergens.includes(checkbox.dataset.allergen);
        });
        
        // Populate tags
        document.querySelectorAll('[data-tag]').forEach(checkbox => {
            checkbox.checked = product.tags.includes(checkbox.dataset.tag);
        });
        
        // Populate translations
        const languages = ['it', 'en', 'fr', 'de', 'es', 'pt', 'ru', 'zh', 'ja', 'ar'];
        languages.forEach(lang => {
            const translation = product.translations[lang] || {};
            const nameInput = document.getElementById(`name-${lang}`);
            const descInput = document.getElementById(`description-${lang}`);
            
            if (nameInput) nameInput.value = translation.name || '';
            if (descInput) descInput.value = translation.description || '';
        });
    }

    clearProductForm() {
        document.getElementById('product-form').reset();
        document.getElementById('product-visible').checked = true;
    }

    async handleProductSave(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const productData = {
            id: document.getElementById('product-id').value,
            category: document.getElementById('product-category').value,
            price: parseFloat(document.getElementById('product-price').value),
            visible: document.getElementById('product-visible').checked,
            allergens: [],
            tags: [],
            translations: {}
        };
        
        // Collect allergens
        document.querySelectorAll('[data-allergen]:checked').forEach(checkbox => {
            productData.allergens.push(checkbox.dataset.allergen);
        });
        
        // Collect tags
        document.querySelectorAll('[data-tag]:checked').forEach(checkbox => {
            productData.tags.push(checkbox.dataset.tag);
        });
        
        // Collect translations
        const languages = ['it', 'en', 'fr', 'de', 'es', 'pt', 'ru', 'zh', 'ja', 'ar'];
        languages.forEach(lang => {
            const nameInput = document.getElementById(`name-${lang}`);
            const descInput = document.getElementById(`description-${lang}`);
            
            if (nameInput?.value || descInput?.value) {
                productData.translations[lang] = {
                    name: nameInput?.value || '',
                    description: descInput?.value || ''
                };
            }
        });
        
        try {
            await window.firebaseService.saveProduct(productData);
            this.hideProductModal();
            await this.loadAdminData();
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Errore nel salvataggio del prodotto');
        }
    }

    editProduct(productId) {
        this.showProductModal(productId);
    }

    async deleteProduct(productId) {
        if (!confirm('Sei sicuro di voler eliminare questo prodotto?')) {
            return;
        }
        
        try {
            await window.firebaseService.deleteProduct(productId);
            await this.loadAdminData();
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Errore nell\'eliminazione del prodotto');
        }
    }

    async toggleProductVisibility(productId, visible) {
        const product = this.products.find(p => p.id === productId);
        if (product) {
            product.visible = visible;
            try {
                await window.firebaseService.saveProduct(product);
                // Update local data
                this.products = this.products.map(p => 
                    p.id === productId ? { ...p, visible } : p
                );
                this.updateStatistics();
                this.renderProductsTable();
            } catch (error) {
                console.error('Error updating product visibility:', error);
                alert('Errore nell\'aggiornamento della visibilità');
                // Revert the change in UI
                const checkbox = document.querySelector(`input[onchange*="${productId}"]`);
                if (checkbox) checkbox.checked = !visible;
            }
        }
    }

    // Modal management
    showCategoriesModal() {
        document.getElementById('categories-modal').classList.remove('hidden');
        this.loadCategoriesList();
    }

    showImportModal() {
        document.getElementById('import-modal').classList.remove('hidden');
        this.populateImportModal();
    }

    populateImportModal() {
        // Populate languages for import
        const importLanguageSelect = document.getElementById('import-language');
        if (importLanguageSelect) {
            importLanguageSelect.innerHTML = '<option value="">Seleziona lingua</option>';
            
            // Use available languages from translations._languages or fallback
            const availableLanguages = this.languages ? Object.keys(this.languages) : ['it', 'en'];
            
            availableLanguages.forEach(langCode => {
                const langData = this.languages?.[langCode] || {};
                const langName = langData.name || this.getLanguageName(langCode);
                const langFlag = langData.flag || this.getLanguageFlag(langCode);
                
                const option = document.createElement('option');
                option.value = langCode;
                option.textContent = `${langFlag} ${langName}`;
                importLanguageSelect.appendChild(option);
            });
        }
    }

    showExportModal() {
        document.getElementById('export-modal').classList.remove('hidden');
        this.populateExportModal();
    }

    populateExportModal() {
        // Populate languages
        const exportLanguageSelect = document.getElementById('export-language');
        if (exportLanguageSelect) {
            exportLanguageSelect.innerHTML = '<option value="">Seleziona lingua</option>';
            
            // Use available languages from translations._languages or fallback
            const availableLanguages = this.languages ? Object.keys(this.languages) : ['it', 'en'];
            
            availableLanguages.forEach(langCode => {
                const langData = this.languages?.[langCode] || {};
                const langName = langData.name || this.getLanguageName(langCode);
                const langFlag = langData.flag || this.getLanguageFlag(langCode);
                
                const option = document.createElement('option');
                option.value = langCode;
                option.textContent = `${langFlag} ${langName}`;
                exportLanguageSelect.appendChild(option);
            });
        }
        
        // Populate categories
        const exportCategorySelect = document.getElementById('export-category');
        if (exportCategorySelect) {
            exportCategorySelect.innerHTML = '<option value="">Tutte le categorie</option>';
            
            this.categories.forEach(category => {
                const categoryName = category.translations?.it?.name || category.id;
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = categoryName;
                exportCategorySelect.appendChild(option);
            });
        }
    }

    showLanguagesModal() {
        document.getElementById('languages-modal').classList.remove('hidden');
        this.loadLanguagesList();
    }

    hideExportModal() {
        document.getElementById('export-modal').classList.add('hidden');
    }
    
    showExportFullModal() {
        document.getElementById('export-full-modal').classList.remove('hidden');
        this.updateExportFullPreview();
    }
    
    hideExportFullModal() {
        document.getElementById('export-full-modal').classList.add('hidden');
    }
    
    updateExportFullPreview() {
        const exportProducts = document.getElementById('export-products').checked;
        const exportCategories = document.getElementById('export-categories').checked;
        const exportTranslations = document.getElementById('export-translations').checked;
        
        // Update preview counts
        document.getElementById('preview-products-count').textContent = 
            exportProducts ? this.products.length : 0;
        document.getElementById('preview-categories-count').textContent = 
            exportCategories ? this.categories.length : 0;
        document.getElementById('preview-languages-count').textContent = 
            exportTranslations ? (this.languages ? Object.keys(this.languages).length : 0) : 0;
    }

    hideImportModal() {
        document.getElementById('import-modal').classList.add('hidden');
    }

    async handleExport(e) {
        e.preventDefault();
        
        const language = document.getElementById('export-language').value;
        const category = document.getElementById('export-category').value;
        
        if (!language) {
            alert('Seleziona una lingua per l\'esportazione');
            return;
        }
        
        try {
            // Filter products
            let productsToExport = this.products.filter(product => product.visible);
            
            if (category) {
                productsToExport = productsToExport.filter(product => product.category === category);
            }
            
            // Transform products for export
            const exportData = productsToExport.map(product => {
                const translation = product.translations[language] || product.translations.it || {};
                return {
                    id: product.id,
                    name: translation.name || product.id,
                    description: translation.description || '',
                    category: product.category,
                    price: product.price,
                    allergens: product.allergens,
                    tags: product.tags,
                    visible: product.visible
                };
            });
            
            // Create and download file
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `menu-${language}${category ? `-${category}` : ''}-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.hideExportModal();
            alert(`Esportati ${exportData.length} prodotti in ${language.toUpperCase()}`);
        } catch (error) {
            console.error('Error exporting products:', error);
            alert('Errore durante l\'esportazione');
        }
    }
    
    async handleExportFull() {
        const exportProducts = document.getElementById('export-products').checked;
        const exportCategories = document.getElementById('export-categories').checked;
        const exportTranslations = document.getElementById('export-translations').checked;
        const format = document.querySelector('input[name="export-format"]:checked').value;
        
        if (!exportProducts && !exportCategories && !exportTranslations) {
            alert('Seleziona almeno una sezione da esportare');
            return;
        }
        
        try {
            const exportData = {};
            const metadata = {
                exportDate: new Date().toISOString(),
                exportedBy: 'Il Barrino da Mario Admin',
                format: format,
                version: '1.0'
            };
            
            if (format === 'structured') {
                // Structured format for backup/restore
                exportData.metadata = metadata;
                exportData.database = {};
                
                if (exportProducts) {
                    exportData.database.products = this.products;
                }
                
                if (exportCategories) {
                    exportData.database.categories = this.categories;
                }
                
                if (exportTranslations) {
                    exportData.database.translations = this.translations;
                }
            } else {
                // Flat format for analysis
                exportData.metadata = metadata;
                
                if (exportProducts) {
                    exportData.products = this.products.map(product => ({
                        id: product.id,
                        category: product.category,
                        price: product.price,
                        visible: product.visible,
                        allergens: product.allergens,
                        tags: product.tags,
                        translations: product.translations
                    }));
                }
                
                if (exportCategories) {
                    exportData.categories = this.categories.map(category => ({
                        id: category.id,
                        order: category.order,
                        visible: category.visible,
                        translations: category.translations
                    }));
                }
                
                if (exportTranslations) {
                    exportData.translations = this.translations;
                    exportData.languages = this.languages;
                }
            }
            
            // Create filename
            const timestamp = new Date().toISOString().split('T')[0];
            const sections = [];
            if (exportProducts) sections.push('products');
            if (exportCategories) sections.push('categories');
            if (exportTranslations) sections.push('translations');
            
            const filename = `barrino-database-${sections.join('-')}-${format}-${timestamp}.json`;
            
            // Create and download file
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.hideExportFullModal();
            
            // Show success message
            const totalItems = (exportProducts ? this.products.length : 0) + 
                             (exportCategories ? this.categories.length : 0) + 
                             (exportTranslations ? 1 : 0);
            alert(`Database esportato con successo!\n\nFile: ${filename}\nElementi esportati: ${totalItems}\nFormato: ${format}`);
            
        } catch (error) {
            console.error('Error exporting full database:', error);
            alert(`Errore durante l'esportazione del database: ${error.message}`);
        }
    }

    async handleImport(e) {
        e.preventDefault();
        
        const fileInput = document.getElementById('import-file');
        const language = document.getElementById('import-language').value;
        
        if (!fileInput.files[0]) {
            alert('Seleziona un file da importare');
            return;
        }
        
        if (!language) {
            alert('Seleziona la lingua del file');
            return;
        }
        
        try {
            const file = fileInput.files[0];
            const text = await file.text();
            const products = JSON.parse(text);
            
            if (!Array.isArray(products)) {
                throw new Error('Il file deve contenere un array di prodotti');
            }
            
            const imported = await window.firebaseService.importProducts(products, language);
            
            this.hideImportModal();
            await this.loadAdminData();
            alert(`Importati ${imported} prodotti con successo!`);
        } catch (error) {
            console.error('Error importing products:', error);
            alert(`Errore durante l'importazione: ${error.message}`);
        }
    }
    // Categories management
    loadCategoriesList() {
        const categoriesList = document.getElementById('categories-list');
        if (!categoriesList) return;

        categoriesList.innerHTML = this.categories.map(category => {
            const translation = category.translations?.it || {};
            return `
                <div class="category-item">
                    <div class="category-info">
                        <h4>${translation.name || category.id}</h4>
                        <p>ID: ${category.id} | Ordine: ${category.order || 0} | ${category.visible ? 'Visibile' : 'Nascosta'}</p>
                    </div>
                    <div class="category-actions">
                        <button class="btn-icon edit" onclick="adminPanel.editCategory('${category.id}')" title="Modifica">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete" onclick="adminPanel.deleteCategory('${category.id}')" title="Elimina">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    showCategoryForm(categoryId = null) {
        const formContainer = document.getElementById('category-form-container');
        const formTitle = document.getElementById('category-form-title');
        
        if (categoryId) {
            this.currentEditingCategory = this.categories.find(c => c.id === categoryId);
            formTitle.textContent = 'Modifica Categoria';
            this.populateCategoryForm(this.currentEditingCategory);
        } else {
            this.currentEditingCategory = null;
            formTitle.textContent = 'Nuova Categoria';
            this.clearCategoryForm();
        }
        
        formContainer.classList.remove('hidden');
    }

    hideCategoryForm() {
        document.getElementById('category-form-container').classList.add('hidden');
        this.currentEditingCategory = null;
    }

    populateCategoryForm(category) {
        document.getElementById('category-id').value = category.id;
        document.getElementById('category-order').value = category.order || 1;
        document.getElementById('category-visible').checked = category.visible !== false;
        
        // Populate translations
        const languages = ['it', 'en', 'fr', 'de', 'es', 'pt', 'ru', 'zh', 'ja', 'ar'];
        languages.forEach(lang => {
            const translation = category.translations?.[lang] || {};
            const nameInput = document.getElementById(`category-name-${lang}`);
            if (nameInput) nameInput.value = translation.name || '';
        });
    }

    clearCategoryForm() {
        document.getElementById('category-form').reset();
        document.getElementById('category-visible').checked = true;
        document.getElementById('category-order').value = 1;
    }

    async handleCategorySave(e) {
        e.preventDefault();
        
        const categoryData = {
            id: document.getElementById('category-id').value,
            order: parseInt(document.getElementById('category-order').value),
            visible: document.getElementById('category-visible').checked,
            translations: {}
        };
        
        // Collect translations
        const languages = ['it', 'en', 'fr', 'de', 'es', 'pt', 'ru', 'zh', 'ja', 'ar'];
        languages.forEach(lang => {
            const nameInput = document.getElementById(`category-name-${lang}`);
            if (nameInput?.value) {
                categoryData.translations[lang] = {
                    name: nameInput.value
                };
            }
        });
        
        try {
            await window.firebaseService.saveCategory(categoryData);
            this.hideCategoryForm();
            await this.loadAdminData();
        } catch (error) {
            console.error('Error saving category:', error);
            alert('Errore nel salvataggio della categoria');
        }
    }

    editCategory(categoryId) {
        this.showCategoryForm(categoryId);
    }

    async deleteCategory(categoryId) {
        if (!confirm('Sei sicuro di voler eliminare questa categoria?')) {
            return;
        }
        
        try {
            await window.firebaseService.deleteCategory(categoryId);
            await this.loadAdminData();
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('Errore nell\'eliminazione della categoria');
        }
    }

    // Languages management
    loadLanguagesList() {
        const languagesList = document.getElementById('languages-list');
        if (!languagesList) return;

        console.log('🔥 [ADMIN] Loading languages list, available languages:', Object.keys(this.languages || {}));
        
        // Get languages from this.languages (which comes from translations._languages)
        const availableLanguages = Object.keys(this.languages || {});
        
        if (availableLanguages.length === 0) {
            languagesList.innerHTML = `
                <div class="empty-state">
                    <h3>Nessuna lingua trovata</h3>
                    <p>Non sono state trovate lingue configurate nel database.</p>
                    <p>Aggiungi lingue usando il pulsante "Nuova Lingua".</p>
                </div>
            `;
            return;
        }
        
        languagesList.innerHTML = availableLanguages.map(langCode => {
            const langData = this.languages[langCode] || {};
            const langName = langData.name || langCode;
            const langFlag = langData.flag || this.getLanguageFlag(langCode);
            const isActive = langData.active !== false;
            const direction = langData.direction || 'ltr';
            
            return `
                <div class="language-item">
                    <div class="language-info">
                        <h4><span class="language-flag">${langFlag}</span> ${langName}</h4>
                        <p>Codice: ${langCode} | Direzione: ${direction.toUpperCase()} | ${isActive ? 'Attiva' : 'Inattiva'}</p>
                    </div>
                    <div class="language-actions">
                        <button class="btn-icon edit" onclick="adminPanel.editLanguage('${langCode}')" title="Modifica">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete" onclick="adminPanel.deleteLanguage('${langCode}')" title="Elimina">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    getLanguageName(code) {
        const names = {
            'it': 'Italiano', 'en': 'English', 'fr': 'Français', 'de': 'Deutsch',
            'es': 'Español', 'pt': 'Português', 'ru': 'Русский', 'zh': '中文',
            'ja': '日本語', 'ar': 'العربية'
        };
        return names[code] || code;
    }

    getLanguageFlag(code) {
        const flags = {
            'it': '🇮🇹', 'en': '🇬🇧', 'fr': '🇫🇷', 'de': '🇩🇪',
            'es': '🇪🇸', 'pt': '🇵🇹', 'ru': '🇷🇺', 'zh': '🇨🇳',
            'ja': '🇯🇵', 'ar': '🇸🇦'
        };
        return flags[code] || '🏳️';
    }

    showLanguageForm(langCode = null) {
        const formContainer = document.getElementById('language-form-container');
        const formTitle = document.getElementById('language-form-title');
        
        if (langCode) {
            formTitle.textContent = 'Modifica Lingua';
            this.populateLanguageForm(langCode);
        } else {
            formTitle.textContent = 'Nuova Lingua';
            this.clearLanguageForm();
        }
        
        formContainer.classList.remove('hidden');
    }

    hideLanguageForm() {
        document.getElementById('language-form-container').classList.add('hidden');
    }

    populateLanguageForm(langCode) {
        const langData = this.languages[langCode] || {};
        
        document.getElementById('language-code').value = langCode;
        document.getElementById('language-name').value = langData.name || this.getLanguageName(langCode);
        document.getElementById('language-flag').value = langData.flag || this.getLanguageFlag(langCode);
        document.getElementById('language-direction').value = langData.direction || 'ltr';
        document.getElementById('language-active').checked = langData.active !== false;
    }

    clearLanguageForm() {
        document.getElementById('language-form').reset();
        document.getElementById('language-direction').value = 'ltr';
        document.getElementById('language-active').checked = true;
    }

    async handleLanguageSave(e) {
        e.preventDefault();
        
        const langCode = document.getElementById('language-code').value;
        const langName = document.getElementById('language-name').value;
        const langFlag = document.getElementById('language-flag').value;
        const langDirection = document.getElementById('language-direction').value;
        const langActive = document.getElementById('language-active').checked;
        
        try {
            // Update the languages data
            const updatedTranslations = { ...this.translations };
            if (!updatedTranslations._languages) {
                updatedTranslations._languages = {};
            }
            
            updatedTranslations._languages[langCode] = {
                name: langName,
                flag: langFlag,
                direction: langDirection,
                active: langActive
            };
            
            // Save to Firebase (try both locations for compatibility)
            await window.firebaseService.saveTranslations(updatedTranslations);
            
            // Also save to translations collection for backup
            try {
                await window.firebaseService.db.collection('translations').doc('_languages').set(updatedTranslations._languages);
                console.log('🔥 [ADMIN] Also saved languages to translations/_languages');
            } catch (backupError) {
                console.warn('🔥 [ADMIN] Could not save backup to translations/_languages:', backupError);
            }
            
            // Update local data
            this.translations = updatedTranslations;
            this.languages = updatedTranslations._languages;
            
            this.hideLanguageForm();
            this.loadLanguagesList();
            
            alert(`Lingua ${langName} salvata con successo!`);
        } catch (error) {
            console.error('Error saving language:', error);
            alert('Errore nel salvataggio della lingua');
        }
    }

    editLanguage(langCode) {
        this.showLanguageForm(langCode);
    }

    async deleteLanguage(langCode) {
        if (langCode === 'it') {
            alert('Non è possibile eliminare la lingua italiana (lingua predefinita)');
            return;
        }
        
        const langData = this.languages[langCode] || {};
        const langName = langData.name || this.getLanguageName(langCode);
        
        if (!confirm(`Sei sicuro di voler eliminare la lingua ${langName}?`)) {
            return;
        }
        
        try {
            // Update the languages data
            const updatedTranslations = { ...this.translations };
            if (updatedTranslations._languages && updatedTranslations._languages[langCode]) {
                delete updatedTranslations._languages[langCode];
            }
            
            // Save to Firebase
            await window.firebaseService.saveTranslations(updatedTranslations);
            
            // Update local data
            this.translations = updatedTranslations;
            this.languages = updatedTranslations._languages || {};
            
            this.loadLanguagesList();
            
            alert(`Lingua ${langName} eliminata con successo!`);
        } catch (error) {
            console.error('Error deleting language:', error);
            alert('Errore nell\'eliminazione della lingua');
        }
    }

    // Translations management
    showTranslationsModal() {
        document.getElementById('translations-modal').classList.remove('hidden');
        this.loadTranslationsList();
    }

    loadTranslationsList() {
        const translationsList = document.getElementById('translations-list');
        if (!translationsList) return;

        console.log('🔥 [ADMIN] Loading translations list');
        
        // Get all translation keys from all languages
        const allKeys = new Set();
        const availableLanguages = Object.keys(this.translations).filter(key => key !== '_languages');
        
        availableLanguages.forEach(lang => {
            if (this.translations[lang] && typeof this.translations[lang] === 'object') {
                Object.keys(this.translations[lang]).forEach(key => {
                    allKeys.add(key);
                });
            }
        });

        if (allKeys.size === 0) {
            translationsList.innerHTML = `
                <div class="empty-state">
                    <h3>Nessuna traduzione trovata</h3>
                    <p>Non sono state trovate traduzioni nel database.</p>
                    <p>Usa i pulsanti "Importa" per aggiungere le traduzioni predefinite.</p>
                </div>
            `;
            return;
        }

        const sortedKeys = Array.from(allKeys).sort();
        
        translationsList.innerHTML = sortedKeys.map(key => {
            // Get category based on key prefix
            const category = this.getTranslationCategory(key);
            
            // Get Italian translation as preview
            const italianValue = this.translations.it?.[key] || 'Non tradotto';
            
            // Count how many languages have this key
            const translatedCount = availableLanguages.filter(lang => 
                this.translations[lang] && this.translations[lang][key]
            ).length;
            
            return `
                <div class="translation-key-item" data-key="${key}">
                    <div class="translation-key-info">
                        <h4>${key}</h4>
                        <p>
                            <span class="translation-key-category">${category}</span>
                            ${italianValue} (${translatedCount}/${availableLanguages.length} lingue)
                        </p>
                    </div>
                    <div class="translation-key-actions">
                        <button class="btn-icon edit" onclick="adminPanel.editTranslation('${key}')" title="Modifica">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete" onclick="adminPanel.deleteTranslation('${key}')" title="Elimina">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    getTranslationCategory(key) {
        if (key.startsWith('game_') || key.includes('leaderboard') || key.includes('score')) return 'Gioco';
        if (key.startsWith('search_') || key.includes('menu') || key.includes('legend')) return 'Menu';
        if (key.startsWith('admin_') || key.includes('import') || key.includes('export')) return 'Admin';
        if (['glutine', 'latte', 'uova', 'pesce', 'arachidi', 'soia', 'frutta_guscio', 'sedano', 'senape', 'sesamo', 'solfiti', 'lupini', 'molluschi', 'crostacei', 'alcol'].includes(key)) return 'Allergeni';
        if (['vegetariano', 'congelato', 'maiale', 'pollo'].includes(key)) return 'Tag';
        if (['caffetteria', 'dolci', 'salato', 'aperitivi', 'bevande_fredde', 'bevande_calde', 'birre', 'vini'].includes(key)) return 'Categorie';
        return 'UI';
    }

    showTranslationForm(key = null) {
        const formContainer = document.getElementById('translation-form-container');
        const formTitle = document.getElementById('translation-form-title');
        
        if (key) {
            formTitle.textContent = 'Modifica Traduzione';
            this.populateTranslationForm(key);
        } else {
            formTitle.textContent = 'Nuova Traduzione';
            this.clearTranslationForm();
        }
        
        formContainer.classList.remove('hidden');
    }

    hideTranslationForm() {
        document.getElementById('translation-form-container').classList.add('hidden');
    }

    populateTranslationForm(key) {
        document.getElementById('translation-key').value = key;
        document.getElementById('translation-category').value = this.getTranslationCategoryValue(key);
        
        // Populate translations
        const languages = ['it', 'en', 'fr', 'de', 'es', 'pt', 'ru', 'zh', 'ja', 'ar'];
        languages.forEach(lang => {
            const input = document.getElementById(`translation-value-${lang}`);
            if (input) {
                input.value = this.translations[lang]?.[key] || '';
            }
        });
    }

    getTranslationCategoryValue(key) {
        if (key.startsWith('game_') || key.includes('leaderboard') || key.includes('score')) return 'game';
        if (key.startsWith('search_') || key.includes('menu') || key.includes('legend')) return 'menu';
        if (key.startsWith('admin_') || key.includes('import') || key.includes('export')) return 'admin';
        if (['glutine', 'latte', 'uova', 'pesce', 'arachidi', 'soia', 'frutta_guscio', 'sedano', 'senape', 'sesamo', 'solfiti', 'lupini', 'molluschi', 'crostacei', 'alcol'].includes(key)) return 'allergens';
        if (['vegetariano', 'congelato', 'maiale', 'pollo'].includes(key)) return 'tags';
        if (['caffetteria', 'dolci', 'salato', 'aperitivi', 'bevande_fredde', 'bevande_calde', 'birre', 'vini'].includes(key)) return 'categories';
        return 'ui';
    }

    clearTranslationForm() {
        document.getElementById('translation-form').reset();
        document.getElementById('translation-category').value = 'ui';
    }

    async handleTranslationSave(e) {
        e.preventDefault();
        
        const key = document.getElementById('translation-key').value;
        const category = document.getElementById('translation-category').value;
        
        try {
            // Update translations for all languages
            const updatedTranslations = { ...this.translations };
            
            const languages = ['it', 'en', 'fr', 'de', 'es', 'pt', 'ru', 'zh', 'ja', 'ar'];
            languages.forEach(lang => {
                const input = document.getElementById(`translation-value-${lang}`);
                if (input && input.value.trim()) {
                    if (!updatedTranslations[lang]) {
                        updatedTranslations[lang] = {};
                    }
                    updatedTranslations[lang][key] = input.value.trim();
                }
            });
            
            // Save to Firebase
            await window.firebaseService.saveTranslations(updatedTranslations);
            
            // Update local data
            this.translations = updatedTranslations;
            
            this.hideTranslationForm();
            this.loadTranslationsList();
            
            alert(`Traduzione "${key}" salvata con successo!`);
        } catch (error) {
            console.error('Error saving translation:', error);
            alert('Errore nel salvataggio della traduzione');
        }
    }

    editTranslation(key) {
        this.showTranslationForm(key);
    }

    async deleteTranslation(key) {
        if (!confirm(`Sei sicuro di voler eliminare la traduzione "${key}"?`)) {
            return;
        }
        
        try {
            // Update translations by removing the key from all languages
            const updatedTranslations = { ...this.translations };
            
            Object.keys(updatedTranslations).forEach(lang => {
                if (lang !== '_languages' && updatedTranslations[lang] && updatedTranslations[lang][key]) {
                    delete updatedTranslations[lang][key];
                }
            });
            
            // Save to Firebase
            await window.firebaseService.saveTranslations(updatedTranslations);
            
            // Update local data
            this.translations = updatedTranslations;
            
            this.loadTranslationsList();
            
            alert(`Traduzione "${key}" eliminata con successo!`);
        } catch (error) {
            console.error('Error deleting translation:', error);
            alert('Errore nell\'eliminazione della traduzione');
        }
    }

    filterTranslations(searchTerm) {
        const items = document.querySelectorAll('.translation-key-item');
        const term = searchTerm.toLowerCase();
        
        items.forEach(item => {
            const key = item.dataset.key.toLowerCase();
            const text = item.textContent.toLowerCase();
            
            if (key.includes(term) || text.includes(term)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    async importGameTranslations() {
        if (!confirm('Questo importerà tutte le traduzioni del gioco. Continuare?')) {
            return;
        }
        
        try {
            const gameTranslations = this.getGameTranslations();
            const updatedTranslations = { ...this.translations };
            
            // Merge game translations
            Object.keys(gameTranslations).forEach(lang => {
                if (!updatedTranslations[lang]) {
                    updatedTranslations[lang] = {};
                }
                Object.assign(updatedTranslations[lang], gameTranslations[lang]);
            });
            
            // Save to Firebase
            await window.firebaseService.saveTranslations(updatedTranslations);
            
            // Update local data
            this.translations = updatedTranslations;
            
            this.loadTranslationsList();
            
            alert('Traduzioni del gioco importate con successo!');
        } catch (error) {
            console.error('Error importing game translations:', error);
            alert('Errore nell\'importazione delle traduzioni del gioco');
        }
    }

    async importMenuTranslations() {
        if (!confirm('Questo importerà tutte le traduzioni del menu. Continuare?')) {
            return;
        }
        
        try {
            const menuTranslations = this.getMenuTranslations();
            const updatedTranslations = { ...this.translations };
            
            // Merge menu translations
            Object.keys(menuTranslations).forEach(lang => {
                if (!updatedTranslations[lang]) {
                    updatedTranslations[lang] = {};
                }
                Object.assign(updatedTranslations[lang], menuTranslations[lang]);
            });
            
            // Save to Firebase
            await window.firebaseService.saveTranslations(updatedTranslations);
            
            // Update local data
            this.translations = updatedTranslations;
            
            this.loadTranslationsList();
            
            alert('Traduzioni del menu importate con successo!');
        } catch (error) {
            console.error('Error importing menu translations:', error);
            alert('Errore nell\'importazione delle traduzioni del menu');
        }
    }

    getGameTranslations() {
        return {
            it: {
                // Game invitation
                game_invitation_title: "Tempo di attesa?",
                game_invitation_subtitle: "Divertiti con il nostro gioco del dinosauro mentre aspetti!",
                game_button_text: "Gioca Ora",
                
                // Game UI
                game_title: "Gioco del Dinosauro",
                game_subtitle: "Divertiti mentre aspetti il tuo ordine!",
                instructions_title: "Come Giocare",
                instruction_1: "Tocca lo schermo per saltare (o premi SPAZIO su desktop)",
                instruction_2: "Evita tavoli, pizze e mestoli per continuare a correre",
                instruction_3: "Più a lungo resisti, più alto sarà il tuo punteggio",
                instruction_4: "Tocca per ricominciare dopo il game over",
                
                // Game stats
                score_label: "Punteggio",
                high_score_label: "Record",
                speed_label: "Velocità",
                
                // Game controls
                game_controls_text: "Tocca lo schermo per iniziare o saltare",
                back_to_menu_text: "Torna al Menu",
                
                // Game over
                game_over_title: "Game Over!",
                new_record_title: "Nuovo Record!",
                final_score_text: "Punteggio finale:",
                restart_text: "Gioca Ancora",
                
                // Leaderboard
                leaderboard_text: "Classifica",
                leaderboard_title: "🏆 Classifica",
                leaderboard_main_title: "🏆 Classifica Migliori Punteggi",
                no_scores_text: "Nessun punteggio salvato. Gioca per essere il primo!",
                no_scores_modal_text: "Nessun punteggio salvato",
                
                // Score saving
                save_score_label: "Inserisci il tuo nome per la classifica:",
                use_suggestion: "Usa questo",
                player_name_placeholder: "Il tuo nome o lascia vuoto per nome casuale",
                save_score: "Salva Punteggio",
                skip_save: "Salta",
                play_again: "Gioca Ancora",
                
                // Orientation
                orientation_title: "Ruota il dispositivo",
                orientation_message: "Per una migliore esperienza di gioco, ruota il tuo dispositivo in orizzontale",
                orientation_note: "Il gioco è ottimizzato per la modalità landscape",
                continue_portrait_text: "Continua in verticale",
                random_name_suggestion: "Suggerimento:"
            },
            en: {
                // Game invitation
                game_invitation_title: "Waiting time?",
                game_invitation_subtitle: "Have fun with our dinosaur game while you wait!",
                game_button_text: "Play Now",
                
                // Game UI
                game_title: "Dinosaur Game",
                game_subtitle: "Have fun while waiting for your order!",
                instructions_title: "How to Play",
                instruction_1: "Tap the screen to jump (or press SPACE on desktop)",
                instruction_2: "Avoid tables, pizzas and ladles to keep running",
                instruction_3: "The longer you survive, the higher your score",
                instruction_4: "Tap to restart after game over",
                
                // Game stats
                score_label: "Score",
                high_score_label: "High Score",
                speed_label: "Speed",
                
                // Game controls
                game_controls_text: "Tap the screen to start or jump",
                back_to_menu_text: "Back to Menu",
                
                // Game over
                game_over_title: "Game Over!",
                new_record_title: "New Record!",
                final_score_text: "Final score:",
                restart_text: "Play Again",
                
                // Leaderboard
                leaderboard_text: "Leaderboard",
                leaderboard_title: "🏆 Leaderboard",
                leaderboard_main_title: "🏆 Top Scores Leaderboard",
                no_scores_text: "No scores saved. Play to be the first!",
                no_scores_modal_text: "No scores saved",
                
                // Score saving
                save_score_label: "Enter your name for the leaderboard:",
                use_suggestion: "Use this",
                player_name_placeholder: "Your name or leave empty for random name",
                save_score: "Save Score",
                skip_save: "Skip",
                play_again: "Play Again",
                
                // Orientation
                orientation_title: "Rotate Device",
                orientation_message: "For a better gaming experience, rotate your device to landscape",
                orientation_note: "The game is optimized for landscape mode",
                continue_portrait_text: "Continue in Portrait",
                random_name_suggestion: "Suggestion:"
            }
            // Aggiungi altre lingue se necessario...
        };
    }

    getMenuTranslations() {
        return {
            it: {
                // Search and navigation
                search_placeholder: "Cerca nel menu...",
                
                // Legend
                legend_title: "Legenda",
                legend_explanation: "Clicca su un elemento per escludere i prodotti che lo contengono",
                legend_allergens_title: "Allergeni",
                legend_characteristics_title: "Caratteristiche",
                
                // Disclaimers
                disclaimer_shared: "Tutti i piatti sono preparati in un ambiente condiviso, di conseguenza non possiamo garantire che non ci siano contaminazioni",
                disclaimer_service: "Non si effettua servizio al tavolo. Ordinare al banco.",
                
                // UI states
                loading: "Caricamento menu...",
                no_results: "Nessun risultato trovato",
                no_results_desc: "Prova a cambiare i filtri o la ricerca",
                
                // Filters
                filter_allergens: "Filtra allergeni da evitare",
                
                // Review invitation
                review_title: "Ti è piaciuta la tua esperienza?",
                review_subtitle: "Lascia una recensione e aiuta altri clienti!",
                review_button: "Lascia Recensione"
            },
            en: {
                // Search and navigation
                search_placeholder: "Search menu...",
                
                // Legend
                legend_title: "Legend",
                legend_explanation: "Click on an item to exclude products containing it",
                legend_allergens_title: "Allergens",
                legend_characteristics_title: "Characteristics",
                
                // Disclaimers
                disclaimer_shared: "All dishes are prepared in a shared environment, therefore we cannot guarantee that there is no cross-contamination",
                disclaimer_service: "No table service provided. Please order at the counter.",
                
                // UI states
                loading: "Loading menu...",
                no_results: "No results found",
                no_results_desc: "Try changing filters or search",
                
                // Filters
                filter_allergens: "Filter allergens to avoid",
                
                // Review invitation
                review_title: "Did you enjoy your experience?",
                review_subtitle: "Leave a review and help other customers!",
                review_button: "Leave Review"
            }
            // Aggiungi altre lingue se necessario...
        };
    }
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminPanel = new AdminPanel();
});