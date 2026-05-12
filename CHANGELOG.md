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
