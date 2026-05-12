# TPL FVG Editor JSON

Web app React + Vite per leggere, modificare e salvare file JSON del tabellario TPL.

## Funzionalita

- Upload di un file JSON
- Editor guidato per linee e fermate
- Modifica matrici prezzi e codici (cell-by-cell)
- Validazione base della struttura
- Download del nuovo `database.json`

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

Il progetto e statico e pronto per Vercel senza configurazioni speciali: importa il repository e usa il comando build `npm run build`.
