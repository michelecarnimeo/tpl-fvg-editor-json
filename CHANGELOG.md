# Changelog

## 0.7.0 - 2026-05-12

- UI e navigazione
	- Introdotta la modularizzazione della schermata editor in tre viste distinte: desktop, tablet e mobile.
	- Aggiunta una selezione automatica della vista in base alla larghezza della finestra.
	- Inserito un footer con nome progetto, versione e stato sintetico del contenuto aperto.

- Persistenza locale
	- Aggiunto autosalvataggio locale della bozza in `localStorage`.
	- Introdotto il ripristino automatico dell'ultima bozza salvata.
	- Prevista la rimozione manuale della bozza salvata quando non serve più.

- Responsive design
	- Migliorata la resa su schermi stretti con layout a schede per le matrici.
	- Ridisegnate le sezioni tablet e mobile per evitare il semplice compressing del layout desktop.
	- Resi più chiari i pulsanti e i blocchi informativi su viewport piccoli.

- Sicurezza e usabilità
	- Aggiunta una finestra di conferma personalizzata prima di cancellare una linea.
	- Mantenuta la protezione contro la cancellazione dell'ultima linea rimasta.
	- Consolidata la barra degli stati per feedback immediato sulle operazioni.

- Documentazione
	- Semplificato il README per lasciare una descrizione sintetica e diretta del progetto.
	- Aggiornata la versione interna del progetto a `0.7.0`.

## 0.1.0 - 2026-05-12

- Primo rilascio del progetto JSON editor basato su React e Vite.
- Editor iniziale per linee, fermate, prezzi e codici.
- Caricamento, modifica e download dei file JSON.
- Struttura dati pensata per linee con matrici prezzi/codici quadrate.

## 0.9.0 - 2026-07-08

- Miglioramento: Resa responsive per dispositivi mobili e viewport stretti; layout adattivo per mobile/tablet/desktop.
- Nuova: Mappa di riferimento `codice -> prezzo` caricata da `src/code-price-map.json` e mostrata nella nuova finestra di riferimento accessibile dalla home.
- Nuova: Autofill prezzi — quando inserisci un codice nella matrice, l'app cerca il prezzo corrispondente nella mappa e popola la cella prezzo solo nella cella modificata.
- Comportamento di editing: l'utente può inserire liberamente codici nel formato `E1`, `E2`, ..., `E9` senza che vengano automaticamente trasformati in `E01`/`E02` in tempo reale.
- Cambio: la conversione `E1`..`E9` → `E01`..`E09` avviene esclusivamente al momento dell'export/salvataggio JSON (funzione `serializeDatabase`).
- Robustezza lookup: in fase di autofill il lookup prova sia il codice così com'è (es. `E2`) sia la versione padded (`E02`) per trovare corrispondenze nella mappa.
- Correzione: rimossa la scrittura simmetrica automatica — ora sia `codici` che `prezzi` vengono modificati solamente nella cella su cui lavora l'utente.
- UX: cancellando il codice nella cella il prezzo corrispondente viene azzerato immediatamente; se lasci solo la lettera senza numeri il prezzo viene anch'esso azzerato.
- Formattazione: i prezzi in UI sono visualizzati con due decimali, separatore decimale a virgola e il simbolo `€` (es. `2,50 €`).
- Interfaccia: intestazioni matrici aggiornate per mostrare `n. NomeFermata` invece di numeri puri nelle colonne/righe.
- Strutturale: ordine delle matrici aggiornato per migliorare l'usabilità (codici e prezzi resi più coerenti nella vista editor).
- Manutenzione: aggiunti controlli di normalizzazione in lettura/salvataggio (`normalizeLine`, `serializeDatabase`) per mantenere la consistenza del JSON esportato.
- Developer: aggiornamento versione a `0.9.0`.

Note: resta da implementare l'editor interno della mappa `CodePriceEditor`, la persistenza degli override della mappa in `localStorage` e le funzionalità di import/export della mappa (previsti nei prossimi rilasci).
