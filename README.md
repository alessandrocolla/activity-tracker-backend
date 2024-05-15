# Backend server per l'applicazione Activity Tracker

Il Progetto pilota "Activity Tracker" prevede la realizzazione di un'applicazione web che automatizzi la gestione del tracciamento delle attività dei dipendenti.

Si richiede che l'applicazione venga realizzata utilizzando di base le seguenti tecnologie:

- Angular
- Node Js
- Mongo

È altresì richiesta l'analisi tecnica.

- L'applicativo deve prevedere un accesso tramite login che darà la possibilità di resettare la password qualora venga dimenticata.
- La gestione della login prevede anche un form di registrazione.
- L'applicazione visualizzerà voci di menu differenti a seconda del contesto di interesse (Impiegato/Amministratore).

## Profilo Impiegato

Nel contesto impiegato sarà possibile effettuare le seguenti attività:

1. Riempimento di un form relativo alle attività svolte nella giornata. Il form prevede come voci:

   - un campo data editabile ma precaricato con la data odierna nel formato GG/MM/YYYY.
   - un campo orario di inizio attività
   - un campo orario di fine attività
   - un menu a tendina che conterrà l'elenco delle attività disponibili memorizzate nel DB
   - un campo note.

2. Visualizzare le attività precedentemente memorizzate con la possibilità di editarle e cancellarle.

3. Modificare la password per accedere al sistema.
