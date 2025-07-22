# Il Barrino da Mario - Menu Digitale v2.0

Una web app completa per il menu digitale del bar "Il Barrino da Mario" con sistema di traduzione completamente rinnovato e gestito da database.

## 🚀 Nuove Caratteristiche v2.0

### 🌍 **Sistema Traduzioni Completamente Rinnovato**
- **Tutto dal database**: Ogni testo del sito è ora gestito tramite database
- **Gestione lingue dinamica**: Aggiungi/rimuovi lingue dal pannello admin
- **Traduzioni strutturate**: Organizzate per categoria (UI, Gioco, Allergeni, ecc.)
- **Import/Export per lingua**: Esporta una lingua, falla tradurre, reimportala
- **Fallback intelligente**: Sistema di fallback automatico all'italiano

### 🔧 **Pannello Admin Semplificato**
- **Aggiungi**: Crea prodotti e categorie (senza traduzioni iniziali)
- **Traduzioni**: Gestisci tutte le traduzioni per lingua e categoria
- **Esporta**: Esporta dati completi o per singola lingua
- **Importa**: Importa traduzioni complete o parziali

### 🗄️ **Nuova Struttura Database**
```
collections/
├── products/           # Prodotti (senza traduzioni hardcoded)
├── categories/         # Categorie (senza traduzioni hardcoded)  
├── translations/       # Traduzioni per lingua
│   ├── it/            # Traduzioni italiane
│   ├── en/            # Traduzioni inglesi
│   └── ...            # Altre lingue
└── settings/
    └── languages/     # Configurazione lingue disponibili
```

### 📱 **Caratteristiche Mantenute**
- Design mobile-first responsive
- PWA con installazione
- Gioco del dinosauro integrato
- Sistema allergeni completo
- Cache intelligente
- Accessibilità WCAG 2.1 AA

## 🗂️ Struttura File Rinnovata

```
├── index.html                    # Menu utente
├── admin.html                    # Pannello admin semplificato
├── gioco.html                    # Gioco del dinosauro
├── src/
│   ├── js/
│   │   ├── firebase.js           # Servizio Firebase rinnovato
│   │   ├── translation-service.js # Nuovo servizio traduzioni
│   │   ├── menu-app.js           # App menu semplificata
│   │   ├── admin.js              # Admin panel rinnovato
│   │   └── game-engine.js        # Motore gioco aggiornato
│   ├── utils/
│   │   └── constants.js          # Solo costanti statiche
│   └── css/                      # Stili invariati
```

## 🌍 Sistema Traduzioni

### Struttura Traduzioni Database
```javascript
// Collection: translations/it
{
  ui: {
    search_placeholder: "Cerca nel menu...",
    legend_title: "Legenda",
    // ... altre traduzioni UI
  },
  game: {
    game_title: "Gioco del Dinosauro",
    score_label: "Punteggio",
    // ... altre traduzioni gioco
  },
  allergens: {
    glutine: "Glutine",
    latte: "Latte",
    // ... altri allergeni
  },
  tags: {
    vegetariano: "Vegetariano",
    // ... altri tag
  }
}
```

### Gestione Lingue
```javascript
// Collection: settings/languages
{
  it: { name: 'Italiano', flag: '🇮🇹', direction: 'ltr', active: true, isDefault: true },
  en: { name: 'English', flag: '🇬🇧', direction: 'ltr', active: true },
  fr: { name: 'Français', flag: '🇫🇷', direction: 'ltr', active: true },
  // ... altre lingue
}
```

## 🔧 Pannello Admin Rinnovato

### Funzionalità Principali

1. **Aggiungi Prodotto/Categoria**
   - Crea elementi base senza traduzioni
   - Le traduzioni si aggiungono successivamente

2. **Gestione Traduzioni**
   - Seleziona lingua e categoria
   - Modifica tutte le traduzioni per quella combinazione
   - Salvataggio automatico nel database

3. **Import/Export Lingue**
   - Esporta traduzioni per una lingua specifica
   - Importa traduzioni tradotte esternamente
   - Formato JSON strutturato

4. **Export Completo**
   - Esporta tutto il database
   - Backup completo del sistema

## 🚀 Workflow Traduzione

### Aggiungere una Nuova Lingua

1. **Admin Panel** → **Traduzioni**
2. Seleziona lingua esistente come base
3. **Esporta Lingua** → Scarica JSON
4. Fai tradurre il file JSON
5. **Importa Lingua** → Carica JSON tradotto
6. La nuova lingua è disponibile automaticamente

### Esempio File Esportazione
```json
{
  "language": "zh",
  "languageData": {
    "name": "中文",
    "flag": "🇨🇳",
    "direction": "ltr",
    "active": true
  },
  "translations": {
    "ui": {
      "search_placeholder": "搜索菜单...",
      "legend_title": "图例"
    },
    "game": {
      "game_title": "恐龙游戏",
      "score_label": "分数"
    }
  },
  "exportDate": "2025-01-XX",
  "version": "2.0"
}
```

## 📊 Vantaggi del Nuovo Sistema

### ✅ **Miglioramenti**
- **Scalabilità**: Aggiungi infinite lingue senza modificare codice
- **Manutenibilità**: Traduzioni centralizzate nel database
- **Flessibilità**: Modifica traduzioni senza deploy
- **Collaborazione**: Traduttori esterni possono lavorare sui JSON
- **Consistenza**: Sistema di fallback garantisce sempre contenuti

### 🔄 **Processo Semplificato**
1. **Sviluppatore**: Crea prodotti/categorie
2. **Admin**: Gestisce traduzioni via pannello
3. **Traduttore**: Lavora su file JSON esportati
4. **Admin**: Importa traduzioni completate
5. **Utente**: Vede sito completamente tradotto

## 🛠️ Installazione e Configurazione

### Setup Iniziale
```bash
# 1. Configura Firebase
# 2. Aggiorna FIREBASE_CONFIG in src/utils/constants.js
# 3. Avvia il server
npm run dev
```

### Popolamento Database
1. Accedi al pannello admin (password: `barrino2025`)
2. Aggiungi categorie base
3. Aggiungi prodotti
4. Gestisci traduzioni per ogni lingua
5. Testa il sito in diverse lingue

### Aggiungere Nuova Lingua
1. **Admin** → **Traduzioni**
2. Seleziona lingua base (es. italiano)
3. **Esporta Lingua**
4. Traduci il file JSON
5. **Importa Lingua** con il file tradotto

## 🔐 Sicurezza e Performance

- **Cache intelligente**: 5 minuti TTL per traduzioni
- **Fallback system**: Sempre contenuti disponibili
- **Validazione**: Controlli integrità dati
- **Ottimizzazione**: Caricamento lazy delle traduzioni

## 📞 Supporto

Per supporto tecnico o personalizzazioni:
- **Documentazione**: Questo README
- **Struttura**: Codice completamente commentato
- **Esempi**: File di esempio per import/export

---

**© 2025 Il Barrino da Mario v2.0** - Sistema traduzioni completamente rinnovato ❤️