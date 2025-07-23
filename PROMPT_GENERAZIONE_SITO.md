# Prompt per Generazione Sito "Il Barrino da Mario"

## 🎯 Obiettivo
Crea un menu digitale multilingue per il bar "Il Barrino da Mario" con sistema di traduzioni completamente gestito da database Firebase, pannello admin e gioco integrato.

## 🏗️ Architettura del Sistema

### **Struttura Database Firebase**
```
collections/
├── data/
│   ├── default/           # Dati strutturali (prodotti, categorie, prezzi)
│   ├── it/               # Traduzioni italiane
│   ├── en/               # Traduzioni inglesi
│   ├── fr/               # Traduzioni francesi
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
    active: true
  },
  allergeni: {
    glutine: "Glutine",
    latte: "Latte",
    // ... tutti i 15 allergeni
  },
  testi: {
    search_placeholder: "Cerca nel menu...",
    loading: "Caricamento...",
    legend_title: "Legenda",
    // ... tutti i testi UI
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
- Header con logo e controlli lingua/filtri
- Sezione ricerca con disclaimer
- Legenda allergeni e caratteristiche (cliccabili per filtrare)
- Invito al gioco del dinosauro
- Menu a fisarmonica per categorie
- Cards prodotti con nome, prezzo, descrizione, allergeni, tags
- Footer con invito recensioni e link admin
- **TUTTI I TESTI** devono essere caricati dal database tramite `data-translate` o JavaScript

### **2. admin.html - Pannello Admin**
- Login con password: `barrino2025`
- Gestione prodotti (CRUD)
- **Gestione traduzioni per lingua**:
  - Selezione lingua
  - Modifica traduzioni per categoria (UI, Allergeni, Prodotti, Categorie)
  - Salvataggio nel database
- **Export/Import lingue**:
  - Esporta lingua specifica in JSON
  - Importa traduzioni tradotte
- Statistiche e filtri
- I testi admin possono essere hardcoded (non tradotti)

### **3. gioco.html - Gioco del Dinosauro**
- Carica le meccaniche da `game-mechanics.js`
- Header mobile con controllo lingua
- Avviso orientamento per mobile
- Istruzioni di gioco
- Canvas di gioco
- Classifica sempre visibile
- Tutti i testi tradotti dal database

## 🔧 Servizi JavaScript

### **1. firebase.js - Servizio Database**
```javascript
class FirebaseService {
  // Gestione cache (5 minuti TTL)
  // getDefaultData() - dati strutturali
  // getLanguageData(lang) - traduzioni lingua
  // saveDefaultData(data) - salva struttura
  // saveLanguageData(lang, data) - salva traduzioni
  // getAvailableLanguages() - lingue disponibili
  // exportLanguage(lang) - esporta JSON
  // importLanguage(data) - importa JSON
  // CRUD prodotti/categorie
}
```

### **2. translation-service.js - Servizio Traduzioni**
```javascript
class TranslationService {
  // t(key, fallback) - traduzione testo
  // getAllergen(key) - traduzione allergene
  // getProduct(id, field) - traduzione prodotto
  // getCategory(id) - traduzione categoria
  // getMergedProducts() - prodotti + traduzioni
  // getMergedCategories() - categorie + traduzioni
  // changeLanguage(lang) - cambia lingua
  // updateUILanguage() - aggiorna interfaccia
}
```

### **3. menu-app.js - App Menu Principale**
```javascript
class MenuApp {
  // Gestione filtri (allergeni, ricerca, tags)
  // Rendering menu dinamico
  // Gestione accordion categorie
  // Integrazione con translation service
  // Aggiornamento UI reattivo
}
```

### **4. admin.js - Pannello Admin**
```javascript
class AdminPanel {
  // Login/logout
  // CRUD prodotti/categorie
  // Interfaccia traduzioni per lingua
  // Export/import JSON lingue
  // Statistiche e gestione
}
```

## 🎮 Integrazione Gioco
- Carica `game-mechanics.js` (fornito separatamente)
- Tutti i testi del gioco devono essere tradotti
- Classifica salvata su Firebase
- Supporto mobile con orientamento

## 🌍 Sistema Traduzioni

### **Caratteristiche Chiave:**
1. **Tutto dal database** - Nessun testo hardcoded nel frontend
2. **Fallback intelligente** - Se traduzione manca, usa italiano
3. **Cache 5 minuti** - Performance ottimizzata
4. **Export/Import** - Workflow traduttori esterni
5. **Aggiornamento real-time** - Cambio lingua istantaneo

### **Elementi Non Tradotti (nel database default):**
- Prezzi prodotti
- Icone allergeni (emoji: 🌾🦞🥚🐟🥜🌿🥛🌰🥬🟡⚪🧪🌕🦑🍷)
- Icone caratteristiche (🐷🍗🥦❄️)
- Icone categorie (fas fa-coffee, etc.)
- Struttura dati (ID, ordini, visibilità)

### **Workflow Traduzione:**
1. Admin esporta lingua (es. inglese) → JSON
2. Traduttore esterno traduce il JSON
3. Admin importa JSON tradotto
4. Nuova lingua disponibile automaticamente

## 🎨 Design Requirements

### **Stile:**
- Font: Inter
- Colori: Marrone (#8B4513), Beige (#F5E6D3), Bordeaux (#722F37)
- Design mobile-first responsive
- Animazioni fluide e micro-interazioni
- Accessibilità WCAG 2.1 AA

### **Componenti UI:**
- Header sticky con gradiente
- Cards prodotti con hover effects
- Accordion categorie animato
- Modali per lingua/filtri
- Loading states e transizioni
- Bottoni con stati hover/active

## 📦 File Structure
```
├── index.html              # Menu utente
├── admin.html              # Pannello admin  
├── gioco.html              # Gioco dinosauro
├── manifest.json           # PWA manifest
├── src/
│   ├── js/
│   │   ├── firebase.js           # Servizio database
│   │   ├── translation-service.js # Servizio traduzioni
│   │   ├── menu-app.js           # App menu
│   │   ├── admin.js              # Pannello admin
│   │   └── game-mechanics.js     # Meccaniche gioco (fornito)
│   ├── css/
│   │   ├── main.css              # Stili base
│   │   ├── variables.css         # Variabili CSS
│   │   ├── components.css        # Componenti UI
│   │   ├── responsive.css        # Media queries
│   │   ├── admin.css             # Stili admin
│   │   └── game.css              # Stili gioco
│   └── utils/
│       └── constants.js          # Costanti e config
```

## 🔐 Configurazione

### **Firebase Config (constants.js):**
```javascript
export const FIREBASE_CONFIG = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com", 
  projectId: "your-project-id",
  // ... altre config
};
```

### **Cache e Performance:**
- Cache traduzioni: 5 minuti TTL
- Lazy loading immagini
- Service worker per PWA
- Compressione assets

## ✅ Checklist Implementazione

### **Core Features:**
- [ ] Database Firebase con struttura corretta
- [ ] Servizio traduzioni completo
- [ ] Menu dinamico con filtri
- [ ] Pannello admin funzionale
- [ ] Export/Import traduzioni
- [ ] Gioco integrato con traduzioni
- [ ] Design responsive

### **Traduzioni:**
- [ ] Tutti i testi UI dal database
- [ ] Sistema fallback italiano
- [ ] Cambio lingua real-time
- [ ] Export JSON per traduttori
- [ ] Import traduzioni completate

### **UX/UI:**
- [ ] Loading states
- [ ] Error handling
- [ ] Animazioni fluide
- [ ] Accessibilità
- [ ] Mobile optimization

## 🚀 Note Implementazione

1. **Priorità traduzioni**: Ogni testo visibile deve essere nel database
2. **Performance**: Cache intelligente per evitare chiamate eccessive
3. **Fallback**: Sistema robusto per testi mancanti
4. **Admin UX**: Interfaccia semplice per gestire traduzioni
5. **Workflow**: Export → Traduci → Import deve essere fluido

Questo sistema permette di avere un sito completamente multilingue con gestione professionale delle traduzioni, mantenendo performance ottimali e UX eccellente.