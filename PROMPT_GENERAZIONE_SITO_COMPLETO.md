# Prompt Completo per Generazione Sito "Il Barrino da Mario"

## 🎯 Obiettivo
Crea un menu digitale multilingue completo per il bar "Il Barrino da Mario" con sistema di traduzioni completamente gestito da database Firebase, pannello admin avanzato e gioco del dinosauro integrato.

## 🏗️ Architettura del Sistema

### **Struttura Database Firebase**
```
collections/
├── data/
│   ├── default/           # Dati strutturali (prodotti, categorie, prezzi, allergeni)
│   ├── it/               # Traduzioni italiane complete
│   ├── en/               # Traduzioni inglesi complete
│   ├── fr/               # Traduzioni francesi complete
│   └── [altre lingue]/   # Altre traduzioni
```

### **Struttura Dati Default (data/default)**
```javascript
{
  products: [
    {
      id: "cappuccino",
      category: "caffetteria", 
      price: 1.50,
      visible: true,
      allergens: ["latte"],
      tags: ["vegetariano"]
    }
  ],
  categories: [
    {
      id: "caffetteria",
      visible: true,
      order: 1,
      icon: "fas fa-coffee"
    }
  ]
}
```

### **Struttura Traduzioni per Lingua (data/[lang])**
```javascript
{
  tagLingua: {
    name: "Italiano",
    flag: "🇮🇹", 
    direction: "ltr",
    active: true,
    isDefault: true
  },
  allergeni: {
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
  testi: {
    // UI Base
    search_placeholder: "Cerca nel menu...",
    loading: "Caricamento...",
    no_results: "Nessun risultato",
    no_results_desc: "Non sono stati trovati prodotti che corrispondono ai tuoi criteri di ricerca.",
    
    // Legend
    legend_title: "Legenda",
    legend_explanation: "Clicca su un elemento per escludere i prodotti che lo contengono",
    legend_allergens_title: "Allergeni",
    legend_characteristics_title: "Caratteristiche",
    filter_allergens: "Filtra allergeni da evitare",
    
    // Disclaimers
    disclaimer_shared: "Tutti i piatti sono preparati in un ambiente condiviso, di conseguenza non possiamo garantire che non ci siano contaminazioni",
    disclaimer_service: "Non si effettua servizio al tavolo. Ordinare al banco.",
    
    // Reviews
    review_title: "Ti è piaciuta la tua esperienza?",
    review_subtitle: "Lascia una recensione e aiuta altri clienti!",
    review_button: "Lascia Recensione",
    
    // Language
    language_selector_title: "Seleziona Lingua / Select Language",
    
    // Game Base
    game_title: "Gioco del Dinosauro",
    game_subtitle: "Divertiti mentre aspetti il tuo ordine!",
    game_invitation_title: "Tempo di attesa?",
    game_invitation_subtitle: "Divertiti con il nostro gioco del dinosauro mentre aspetti!",
    game_button_text: "Gioca Ora",
    
    // Game Instructions
    instructions_title: "Come Giocare",
    instruction_1: "Tocca lo schermo per saltare (o premi SPAZIO su desktop)",
    instruction_2: "Evita tavoli, pizze e mestoli per continuare a correre",
    instruction_3: "Più a lungo resisti, più alto sarà il tuo punteggio",
    instruction_4: "Tocca per ricominciare dopo il game over",
    
    // Game UI
    score_label: "Punteggio",
    high_score_label: "Record",
    speed_label: "Velocità",
    game_controls_text: "Tocca lo schermo per iniziare o saltare",
    back_to_menu_text: "Torna al Menu",
    
    // Game Over
    game_over_title: "Game Over!",
    final_score_text: "Punteggio finale:",
    restart_text: "Gioca Ancora",
    play_again: "Gioca Ancora",
    
    // Leaderboard
    leaderboard_text: "Classifica",
    leaderboard_title: "🏆 Classifica",
    leaderboard_main_title: "🏆 Classifica Migliori Punteggi",
    no_scores_text: "Nessun punteggio salvato. Gioca per essere il primo!",
    no_scores_modal_text: "Nessun punteggio salvato",
    
    // Score Saving
    save_score_label: "Inserisci il tuo nome per la classifica:",
    player_name_placeholder: "Il tuo nome",
    save_score: "Salva Punteggio",
    skip_save: "Salta",
    
    // Mobile Orientation
    orientation_title: "Ruota il dispositivo",
    orientation_message: "Per una migliore esperienza di gioco, ruota il tuo dispositivo in orizzontale",
    orientation_note: "Il gioco è ottimizzato per la modalità landscape",
    continue_portrait_text: "Continua in verticale",
    
    // Random Names
    random_name_suggestion: "Suggerimento:",
    use_suggestion: "Usa questo"
  },
  products: {
    cappuccino: {
      name: "Cappuccino",
      description: "Caffè espresso con latte montato"
    }
  },
  categories: {
    caffetteria: "Caffetteria"
  }
}
```

## 📱 Pagine da Creare

### **1. index.html - Menu Utente**
- **Header sticky** con logo "IL BARRINO DA MARIO" e controlli lingua/filtri
- **Sezione ricerca** con disclaimer professionale e search box
- **Legenda allergeni e caratteristiche** (cliccabili per filtrare)
- **Invito al gioco** del dinosauro con design accattivante
- **Menu a fisarmonica** per categorie con animazioni fluide
- **Cards prodotti** con nome, prezzo, descrizione, allergeni, tags
- **Footer** con invito recensioni Google e link admin
- **TUTTI I TESTI** devono essere caricati dal database tramite `data-translate` o JavaScript

### **2. admin.html - Pannello Admin**
- **Login** con password: `barrino2025`
- **Dashboard** con statistiche (prodotti totali, visibili, categorie, lingue)
- **Gestione prodotti** (CRUD completo)
- **Gestione traduzioni per lingua**:
  - Selezione lingua attiva
  - Modifica traduzioni per categoria (UI, Allergeni, Prodotti, Categorie)
  - Salvataggio nel database
- **Export/Import lingue**:
  - Esporta lingua specifica in JSON strutturato
  - Importa traduzioni tradotte
- **Filtri e ricerca** avanzati
- I testi admin possono essere hardcoded (non tradotti)

### **3. gioco.html - Gioco del Dinosauro**
- **Header mobile** con controllo lingua
- **Avviso orientamento** per mobile con opzione continua
- **Istruzioni di gioco** complete e tradotte
- **Canvas di gioco** responsive
- **Classifica sempre visibile** sotto il gioco
- **Tutti i testi tradotti** dal database
- **Integrazione con game-mechanics.js** (file separato)

## 🔧 Servizi JavaScript

### **1. firebase.js - Servizio Database**
```javascript
class FirebaseService {
  constructor() {
    this.db = null;
    this.isInitialized = false;
    this.cache = new Map();
    this.cacheTimestamps = new Map();
  }
  
  // Cache management (5 minuti TTL)
  isCacheValid(key) { /* ... */ }
  setCache(key, data) { /* ... */ }
  clearCache(type = null) { /* ... */ }
  
  // NEW STRUCTURE: Load default data
  async getDefaultData() { /* ... */ }
  async saveDefaultData(data) { /* ... */ }
  
  // NEW STRUCTURE: Load language data
  async getLanguageData(language) { /* ... */ }
  async saveLanguageData(language, data) { /* ... */ }
  
  // Language management
  async getAvailableLanguages() { /* ... */ }
  async createLanguage(languageCode, languageInfo) { /* ... */ }
  async deleteLanguage(languageCode) { /* ... */ }
  
  // CRUD operations
  async addProduct(product) { /* ... */ }
  async addCategory(category) { /* ... */ }
  async deleteProduct(productId) { /* ... */ }
  async deleteCategory(categoryId) { /* ... */ }
  
  // Export/Import
  async exportLanguage(languageCode) { /* ... */ }
  async importLanguage(importData) { /* ... */ }
}
```

### **2. translation-service.js - Servizio Traduzioni**
```javascript
class TranslationService {
  constructor() {
    this.currentLanguage = 'it';
    this.defaultData = null;
    this.languageData = null;
    this.availableLanguages = [];
    this.isLoaded = false;
  }
  
  // Main translation function
  t(key, fallback = null) { /* ... */ }
  
  // Specialized getters
  getAllergen(key) { /* ... */ }
  getProduct(productId, field = 'name') { /* ... */ }
  getCategory(categoryId) { /* ... */ }
  
  // Merged data for UI
  getMergedProducts() { /* ... */ }
  getMergedCategories() { /* ... */ }
  
  // Language management
  async changeLanguage(language) { /* ... */ }
  updateUILanguage() { /* ... */ }
  getAvailableLanguagesForUI() { /* ... */ }
}
```

### **3. menu-app.js - App Menu Principale**
```javascript
class MenuApp {
  constructor() {
    this.products = [];
    this.categories = [];
    this.filteredProducts = [];
    this.selectedAllergens = new Set();
    this.selectedTags = new Set();
    this.searchTerm = '';
  }
  
  // Core functionality
  async loadData() { /* ... */ }
  applyFilters() { /* ... */ }
  renderMenu() { /* ... */ }
  
  // Filter management
  toggleAllergenSelection(allergen, checked) { /* ... */ }
  toggleLegendFilter(type, value, element) { /* ... */ }
  handleSearch(term) { /* ... */ }
  
  // UI management
  updateLanguageSelector() { /* ... */ }
  updateAllergenLabels() { /* ... */ }
}
```

### **4. admin.js - Pannello Admin**
```javascript
class AdminPanel {
  constructor() {
    this.isLoggedIn = false;
    this.currentView = 'products';
    this.currentLanguage = 'it';
    this.defaultData = null;
    this.languageData = null;
    this.availableLanguages = [];
  }
  
  // Authentication
  async handleLogin() { /* ... */ }
  logout() { /* ... */ }
  
  // Data management
  async loadData() { /* ... */ }
  renderProductsTable() { /* ... */ }
  updateStats() { /* ... */ }
  
  // Product management
  showAddProductModal() { /* ... */ }
  async handleProductSubmit() { /* ... */ }
  async toggleProductVisibility(productId, visible) { /* ... */ }
  async deleteProduct(productId) { /* ... */ }
  
  // Translation management
  showTranslationsModal() { /* ... */ }
  renderTranslationsInterface() { /* ... */ }
  async loadLanguageForTranslation() { /* ... */ }
  async saveTranslations() { /* ... */ }
  
  // Export/Import
  async exportLanguage() { /* ... */ }
  async handleImportFile(file) { /* ... */ }
}
```

## 🎮 Integrazione Gioco
- **Carica `game-mechanics.js`** (fornito separatamente)
- **Tutti i testi del gioco** devono essere tradotti dal database
- **Classifica salvata** su Firebase con fallback localStorage
- **Supporto mobile** completo con gestione orientamento
- **Sprite system** con fallback per immagini mancanti

## 🌍 Sistema Traduzioni

### **Caratteristiche Chiave:**
1. **Tutto dal database** - Nessun testo hardcoded nel frontend (eccetto admin)
2. **Fallback intelligente** - Se traduzione manca, usa italiano
3. **Cache 5 minuti** - Performance ottimizzata
4. **Export/Import JSON** - Workflow traduttori esterni
5. **Aggiornamento real-time** - Cambio lingua istantaneo
6. **Gestione errori** - Graceful degradation

### **Elementi Non Tradotti (nel database default):**
- **Prezzi prodotti** (numeri)
- **Icone allergeni** (emoji: 🌾🦞🥚🐟🥜🌿🥛🌰🥬🟡⚪🧪🌕🦑🍷)
- **Icone caratteristiche** (emoji: 🐷🍗🥦❄️)
- **Icone categorie** (classi CSS: fas fa-coffee, etc.)
- **Struttura dati** (ID, ordini, visibilità, prezzi)

### **Workflow Traduzione:**
1. **Admin esporta lingua** (es. inglese) → JSON strutturato
2. **Traduttore esterno** traduce il JSON mantenendo la struttura
3. **Admin importa** JSON tradotto
4. **Nuova lingua** disponibile automaticamente nel sito

### **Formato Export JSON:**
```javascript
{
  "language": "en",
  "languageData": {
    "name": "English",
    "flag": "🇬🇧",
    "direction": "ltr",
    "active": true
  },
  "translations": {
    "ui": { /* tutti i testi UI */ },
    "game": { /* tutti i testi gioco */ },
    "allergens": { /* traduzioni allergeni */ },
    "products": { /* traduzioni prodotti */ },
    "categories": { /* traduzioni categorie */ }
  },
  "exportDate": "2025-01-XX",
  "version": "3.0"
}
```

## 🎨 Design Requirements

### **Stile Generale:**
- **Font**: Inter (Google Fonts)
- **Colori**: 
  - Primario: Marrone (#8B4513)
  - Secondario: Beige (#F5E6D3) 
  - Accento: Bordeaux (#722F37)
  - Sfondo: Cream (#FAF7F0)
- **Design**: Mobile-first responsive
- **Animazioni**: Fluide e micro-interazioni
- **Accessibilità**: WCAG 2.1 AA compliant

### **Componenti UI Specifici:**
- **Header sticky** con gradiente e backdrop-filter
- **Cards prodotti** con hover effects e shadow
- **Accordion categorie** con animazioni smooth
- **Modali** per lingua/filtri con blur background
- **Loading states** con spinner animato
- **Bottoni** con stati hover/active/disabled
- **Toast messages** per feedback utente

### **Responsive Breakpoints:**
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

## 📦 File Structure Completa
```
├── index.html                    # Menu utente
├── admin.html                    # Pannello admin  
├── gioco.html                    # Gioco dinosauro
├── manifest.json                 # PWA manifest
├── PROMPT_GENERAZIONE_SITO_COMPLETO.md  # Questo file
├── GAME_MECHANICS_COMPLETE.js    # Meccaniche gioco (separato)
├── src/
│   ├── js/
│   │   ├── firebase.js           # Servizio database
│   │   ├── translation-service.js # Servizio traduzioni
│   │   ├── menu-app.js           # App menu
│   │   ├── admin.js              # Pannello admin
│   │   ├── game-config.js        # Configurazione gioco
│   │   └── game-engine.js        # Motore gioco
│   ├── css/
│   │   ├── main.css              # Stili base
│   │   ├── variables.css         # Variabili CSS
│   │   ├── components.css        # Componenti UI
│   │   ├── responsive.css        # Media queries
│   │   ├── admin.css             # Stili admin
│   │   └── game.css              # Stili gioco
│   ├── utils/
│   │   └── constants.js          # Costanti e config
│   └── assets/
│       └── images/               # Sprite gioco
```

## 🔐 Configurazione

### **Firebase Config (constants.js):**
```javascript
export const FIREBASE_CONFIG = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com", 
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789012345678"
};

export const ADMIN_PASSWORD = 'barrino2025';
export const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
```

### **Cache e Performance:**
- **Cache traduzioni**: 5 minuti TTL con timestamp
- **Lazy loading**: Immagini e componenti non critici
- **Service worker**: Per PWA e cache offline
- **Compressione**: Assets ottimizzati

## ✅ Checklist Implementazione Completa

### **Core Features:**
- [ ] Database Firebase con struttura corretta
- [ ] Servizio traduzioni completo e funzionante
- [ ] Menu dinamico con filtri avanzati
- [ ] Pannello admin completo e intuitivo
- [ ] Export/Import traduzioni JSON
- [ ] Gioco integrato con traduzioni
- [ ] Design responsive e accessibile

### **Sistema Traduzioni:**
- [ ] Tutti i testi UI dal database (eccetto admin)
- [ ] Sistema fallback italiano robusto
- [ ] Cambio lingua real-time senza reload
- [ ] Export JSON strutturato per traduttori
- [ ] Import traduzioni con validazione
- [ ] Cache intelligente con TTL

### **UX/UI Avanzata:**
- [ ] Loading states per tutte le operazioni
- [ ] Error handling completo e user-friendly
- [ ] Animazioni fluide e performanti
- [ ] Accessibilità keyboard e screen reader
- [ ] Mobile optimization completa
- [ ] PWA installabile

### **Gioco Integrato:**
- [ ] Caricamento meccaniche da file separato
- [ ] Tutti i testi tradotti dal database
- [ ] Classifica persistente (Firebase + localStorage)
- [ ] Supporto mobile con orientamento
- [ ] Sprite system con fallback

### **Admin Panel:**
- [ ] Login sicuro con sessione
- [ ] CRUD prodotti completo
- [ ] Gestione traduzioni per lingua
- [ ] Export/Import JSON funzionante
- [ ] Statistiche e dashboard
- [ ] Interfaccia intuitiva

## 🚀 Note Implementazione Critiche

### **1. Priorità Traduzioni**
- **OGNI testo visibile** deve essere nel database
- **Nessun hardcoding** di testi nel frontend (eccetto admin)
- **Fallback system** robusto per testi mancanti
- **Cache intelligente** per performance

### **2. Performance**
- **Cache 5 minuti** per evitare chiamate eccessive
- **Lazy loading** per componenti non critici
- **Debounce** per ricerca e filtri
- **Ottimizzazione** bundle JavaScript

### **3. Admin UX**
- **Interfaccia semplice** per gestire traduzioni
- **Validazione** input e feedback immediato
- **Export/Import** con progress indicator
- **Backup automatico** prima delle modificazioni

### **4. Workflow Traduzione**
- **Export → Traduci → Import** deve essere fluido
- **Formato JSON** strutturato e documentato
- **Validazione** import per evitare errori
- **Versioning** per compatibilità

### **5. Mobile First**
- **Touch-friendly** tutti gli elementi
- **Orientamento** gestito per il gioco
- **Performance** ottimizzata per mobile
- **PWA** installabile

## 🎯 Risultato Finale

Il sistema finale sarà un **menu digitale multilingue professionale** con:

- **Gestione traduzioni** completamente automatizzata
- **Pannello admin** intuitivo per non-tecnici
- **Gioco integrato** per engagement utenti
- **Performance ottimali** con cache intelligente
- **Design responsive** e accessibile
- **Workflow traduzione** professionale per team esterni

Questo permetterà di avere un sito **completamente multilingue** con gestione professionale delle traduzioni, mantenendo **performance ottimali** e **UX eccellente** per tutti gli utenti.