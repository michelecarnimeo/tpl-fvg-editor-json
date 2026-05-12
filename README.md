# TPL FVG Editor JSON

Editor JSON desktop per gestire linee, fermate, prezzi e codici del tabellario TPL FVG.

All'avvio l'app chiede se vuoi caricare un file JSON esistente oppure crearne uno nuovo.

## Funzionalita

- Caricamento di un file JSON dal computer
- Creazione di un nuovo file da zero
- Editor guidato per linee e fermate
- Modifica delle matrici prezzi e codici cella per cella
- Cancellazione e aggiunta di linee e fermate
- Conferma di sicurezza prima di cancellare una linea
- Download del file JSON aggiornato

## Avvio locale

```bash
npm install
npm run dev
```

## Build produzione

```bash
npm run build
npm run preview
```

## Deploy su Vercel

Il progetto e pronto per Vercel come app statica.

Impostazioni consigliate:

- Build Command: `npm run build`
- Output Directory: `dist`

## Note tecniche

- Stack: React + Vite + TypeScript
- Modalita: desktop only
- Il file di esempio `database.json` serve come riferimento per la struttura dei dati
