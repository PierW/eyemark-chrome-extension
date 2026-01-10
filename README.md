# EyeMark

**EyeMark** è un’estensione per Chrome che evidenzia automaticamente gli annunci immobiliari già visualizzati su **Idealista** e **Immobiliare**. Riduce il tempo perso rivedendo annunci già visti e ti permette di concentrarti solo sulle nuove opportunità.

---

## 🚀 Funzionalità

- Evidenzia annunci già visti con **offuscamento + badge “👁️ Già visto”**
- Salvataggio persistente tramite `chrome.storage.local`
- Toggle ON/OFF direttamente dalla popup
- Reset totale degli annunci già visti dalla popup
- Supporta **infinite scroll** e aggiornamenti dinamici (es. zoom su mappa)
- Tutti i dati rimangono **locali nel browser** – privacy al 100%

---

## 📦 Installazione (sviluppo)

1. Clona questo repository:

```bash
git clone https://github.com/PierW/eyemark-chrome-extension EyeMark
```

2. Apri Chrome → chrome://extensions/

3. Attiva Modalità sviluppatore

4. Clicca Carica estensione non pacchettizzata

5. Seleziona la cartella EyeMark/

## 📝 Privacy

Nessun dato personale viene raccolto

Tutti gli annunci già visti sono salvati localmente nel browser

Non c’è alcun tracciamento o invio verso server esterni

## ⚡ Tecnologie

Chrome Extension MV3

JavaScript vanilla

MutationObserver per aggiornamenti dinamici

Storage locale Chrome (chrome.storage.local)

## 👨‍💻 Contributi

Pull request e segnalazioni di bug sono benvenute. Sentiti libero di forkare e adattare l’estensione per altri siti immobiliari.

## 📄 Licenza

MIT License

