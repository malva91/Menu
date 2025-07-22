# Il Barrino da Mario - Menu Digitale

Una web app completa per il menu digitale del bar "Il Barrino da Mario". Realizzata esclusivamente in **HTML5, CSS3 e JavaScript Vanilla**, senza framework esterni.

## 🚀 Caratteristiche Principali

### 🗄️ **Database-First Architecture**
- **Tutti i dati dal database**: Nessun dato hardcoded nei JS
- **Cache intelligente**: Sistema di cache con timestamp per performance
- **Gestione errori**: Fallback graceful quando il database non è disponibile
- **Validazione dati**: Controlli di integrità sui dati caricati

### 📱 **Mobile-First Design**
- Interfaccia ottimizzata per smartphone
- Design responsive per tutti i dispositivi
- Navigazione touch-friendly con area di click ≥ 44px

### 🌍 **Multilingua (10+ lingue)**
- Italiano, Inglese, Francese, Tedesco, Spagnolo
- Portoghese, Russo, Cinese, Giapponese, Arabo
- Rilevamento automatico della lingua del browser
- Persistenza della lingua selezionata

### 🔥 **Firebase Integration**
- **Firestore** per gestione dati in tempo reale
- **Firebase Hosting** ready per il deploy
- Sincronizzazione automatica dei contenuti

### ♿ **Accessibilità WCAG 2.1 AA**
- Contrasto colori ottimizzato
- Navigazione da tastiera completa
- Screen reader friendly
- Aria labels e semantica HTML5

### 🍽️ **Gestione Menu Completa**
- **Solo testo e icone**: nessuna immagine
- Sistema allergeni completo con 15 categorie
- Filtri in tempo reale per allergeni
- Ricerca testuale istantanea

### 🔐 **Pannello Admin**
- Autenticazione con password (`barrino2025`)
- CRUD completo per prodotti
- Gestione traduzioni per tutte le lingue
- Controllo visibilità prodotti

### 📤 **Import/Export JSON**
- Esportazione per lingua specifica
- Importazione con anteprima
- Backup e restore facile
- Supporto traduttori esterni

## 🎨 Design

### Colori
- **Primari**: Marrone (#8B4513), Beige (#F5E6D3), Crema (#FAF7F0)
- **Accenti**: Bordeaux (#722F37)
- **Stati**: Successo, Avviso, Errore con contrasti accessibili

### Tipografia
- **Font**: Inter (Google Fonts)
- **Gerarchia**: 8 dimensioni responsive
- **Spaziatura**: Sistema a 8px per consistenza

### Layout
- **Container**: Max-width 1200px centrato
- **Griglia**: CSS Grid responsive
- **Breakpoints**: Mobile (<768px), Tablet (768-1024px), Desktop (>1024px)

## 🗂️ Struttura File

```
├── index.html              # Menu utente principale
├── admin.html              # Pannello amministratore
├── manifest.json           # PWA manifest
├── sw.js                  # Service Worker
├── server.js              # Server di sviluppo
├── package.json           # Configurazione npm
├── src/                   # Codice sorgente
│   ├── js/               # JavaScript modules
│   │   ├── firebase.js   # Configurazione Firebase
│   │   ├── menu-app.js   # Logica applicazione menu
│   │   └── admin.js      # Logica pannello admin
│   ├── utils/            # Utilities e costanti
│   │   └── constants.js  # Costanti statiche
│   ├── css/              # Fogli di stile
│   │   ├── main.css      # Stili principali
│   │   ├── variables.css # Variabili CSS
│   │   ├── components.css# Componenti UI
│   │   ├── admin.css     # Stili admin
│   │   └── responsive.css# Media queries
│   ├── components/       # Componenti riutilizzabili
│   ├── assets/          # Risorse statiche
└── README.md            # Documentazione
```

## 🗄️ Architettura Database-First

### Principi
- **Zero dati hardcoded**: Tutti i contenuti vengono dal database
- **Cache intelligente**: Sistema di cache con TTL di 5 minuti
- **Fallback graceful**: Gestione errori senza crash dell'app
- **Validazione**: Controlli di integrità sui dati caricati

### Strutture Database

**Collections Firestore:**
- `products/` - Prodotti del menu
- `categories/` - Categorie menu
- `settings/translations` - Traduzioni UI

**Dati Statici (constants.js):**
- Emoji allergeni e tag
- Icone categorie
- Bandiere e nomi lingue
- Configurazione Firebase

## 🔧 Configurazione Firebase

Il progetto è configurato con:
- **Project ID**: `orechiosco`
- **Autenticazione**: JavaScript-only per admin
- **Database**: Firestore con RLS policies
- **Hosting**: Firebase Hosting ready

## 🍕 Struttura Dati

### Prodotto
```json
{
  "id": "cappuccino",
  "category": "caffetteria",
  "price": 1.50,
  "visible": true,
  "allergens": ["latte"],
  "tags": ["vegetariano"],
  "translations": {
    "it": {
      "name": "Cappuccino",
      "description": "Caffè con latte montato"
    },
    "en": {
      "name": "Cappuccino", 
      "description": "Espresso with foamed milk"
    }
  }
}
```

### Allergeni Supportati
🌾 Glutine | 🦞 Crostacei | 🥚 Uova | 🐟 Pesce | 🥜 Arachidi | 🌿 Soia | 🥛 Latte | 🌰 Frutta a guscio | 🥬 Sedano | 🟡 Senape | ⚪ Sesamo | 🧪 Solfiti | 🌕 Lupini | 🦑 Molluschi | 🍷 Alcol

### Caratteristiche Prodotto
🐷 Maiale | 🍗 Pollo | 🥦 Vegetariano | ❄️ Congelato

## 🚀 Installazione e Avvio

### Sviluppo Locale
```bash
# Clona il repository
git clone <repository-url>

# Entra nella directory
cd il-barrino-da-mario

# Configura Firebase
# 1. Crea progetto Firebase
# 2. Abilita Firestore
# 3. Aggiorna FIREBASE_CONFIG in src/utils/constants.js

# Avvia server locale
npm run dev
```

### Popolamento Database
```bash
# Usa il pannello admin per:
# 1. Creare categorie
# 2. Aggiungere prodotti
# 3. Configurare traduzioni

# Oppure importa dati via admin panel
```

### Deploy Firebase
```bash
# Installa Firebase CLI
npm install -g firebase-tools

# Login Firebase
firebase login

# Inizializza progetto
firebase init

# Deploy
firebase deploy
```

## 📱 Progressive Web App

### Manifest Features
- **Installabile**: Aggiungibile alla home screen
- **Standalone**: Funziona come app nativa
- **Icone**: SVG ottimizzate per tutte le dimensioni
- **Shortcuts**: Accesso rapido Menu/Admin

### Service Worker
- **Cache**: Risorse statiche offline
- **Background Sync**: Sincronizzazione dati
- **Push Notifications**: Pronto per notifiche

## 🔐 Sicurezza

### Admin Panel
- **Password**: `barrino2025` (hardcoded per semplicità)
- **Session**: Autenticazione via sessionStorage
- **Firestore**: Regole di accesso pubblico in lettura

### Dati Sensibili
- **Nessuna API key esposta**: Firebase config pubblico
- **Nessun dato personale**: Solo contenuti menu
- **Validazione**: Input sanitization lato client

## 🌐 Supporto Browser

### Compatibilità
- **Chrome**: 90+ ✅
- **Firefox**: 88+ ✅
- **Safari**: 14+ ✅
- **Edge**: 90+ ✅
- **Mobile**: iOS 14+, Android 9+ ✅

### Polyfills
- **Fetch API**: Supporto nativo
- **CSS Grid**: Supporto completo
- **ES6 Modules**: Supporto moderno

## 📊 Performance

### Ottimizzazioni
- **Lazy Loading**: Immagini e moduli non critici
- **Minification**: CSS/JS ottimizzati
- **Caching**: Service Worker aggressivo
- **Compression**: Gzip/Brotli ready

### Metriche Target
- **First Paint**: <1.5s
- **LCP**: <2.5s
- **FID**: <100ms
- **CLS**: <0.1

## 🔧 Personalizzazione

### Colori
Modifica le variabili CSS in `style.css`:
```css
:root {
    --primary-brown: #8B4513;
    --primary-beige: #F5E6D3;
    --primary-cream: #FAF7F0;
    --primary-bordeaux: #722F37;
}
```

### Lingue
Aggiungi nuove lingue in `firebase.js`:
```javascript
getDefaultTranslations() {
    return {
        // Aggiungi nuova lingua
        'xx': {
            categories: {...},
            ui: {...},
            allergens: {...}
        }
    };
}
```

### Categorie
Modifica le categorie in `admin.html`:
```html
<option value="nuova_categoria">Nuova Categoria</option>
```

## 🆘 Troubleshooting

### Problemi Comuni

**Firebase non connesso**
- Verifica configurazione in `firebase.js`
- Controlla console browser per errori

**Traduzioni mancanti**
- Controlla struttura dati Firestore
- Verifica fallback a lingua italiana

**Admin non accessibile**
- Password: `barrino2025`
- Pulisci sessionStorage se necessario

**PWA non installabile**
- Verifica HTTPS (obbligatorio)
- Controlla manifest.json
- Testa Service Worker

## 📞 Supporto

Per supporto tecnico o personalizzazioni:
- **Email**: admin@ilbarrinodamario.it
- **Website**: https://ilbarrinodamario.it
- **GitHub Issues**: [Report Bug](repository-url/issues)

---

**© 2025 Il Barrino da Mario** - Realizzato con ❤️ in Italia