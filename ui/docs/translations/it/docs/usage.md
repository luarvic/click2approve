---
title: Utilizzo del flusso di lavoro di approvazione, token e limiti di archiviazione
description: Scopri quali azioni Click2Approve utilizzano i token, come viene misurata l'archiviazione dei file e cosa succede con un limite. Utilizza un esempio per stimare l'utilizzo del flusso di lavoro di un documento.
---
# Utilizzo e token {#usage-and-tokens}

Seleziona un'area di lavoro e apri **Usage** per visualizzare il saldo dei token, il periodo di fatturazione e lo spazio di archiviazione totale occupato. La tabella sotto i riquadri elenca ciascuna azione e il relativo **Tokens used**, comprese le voci con zero token. Le azioni sono ordinate in base ai gettoni utilizzati, a partire dal più alto, con ordine alfabetico per importi uguali. L'ordinamento utilizza importi precisi prima dell'arrotondamento della visualizzazione. I riquadri Token e Archiviazione mostrano gli importi utilizzati e disponibili con una barra delle quote. Gli importi dei token visualizzati vengono arrotondati per difetto ai token interi; le barre della contabilità e delle quote mantengono la precisione frazionaria.

## Quota mensile di token {#monthly-allowance}

Ogni piano include token. In Personal Free si rinnovano ogni mese dalla data di inizio del primo periodo. Nei piani a pagamento vengono assegnati per ciascun periodo di fatturazione con pagamento confermato. Business Trial riceve una sola quota per il mese di prova. I token inutilizzati scadono: non passano al periodo successivo e non possono essere trasferiti tra spazi di lavoro.

| Piano | Prezzo mensile (USD, tasse escluse) | Gettoni inclusi | Archiviazione |
| --- | --- | --- | --- |
| Personal Free | $0 | 1.000 al mese | 1GB |
| Personal Pro | $20 | 50.000 al mese | 10GB |
| Business Trial | $ 0 solo per un mese | 10.000 una volta | 1GB |
| Business Pro | $100 | 300.000 al mese | 100 GB |

## Cosa utilizza i token {#what-uses-tokens}

Le tariffe dei token sono:

| Action | Gettoni |
| --- | --- |
| Carica | 1 per MB |
| Visualizza o scarica un file | 2 per MB |
| E-mail del flusso di lavoro | 5 per destinatario |
| Invia o invia nuovamente una richiesta | 10 |
| Crea un'attività | 2 per attività |

La lettura dei dettagli o degli elenchi delle richieste e delle attività, il completamento delle attività e l'annullamento delle richieste non vengono misurati e non consumano token. L'invio e il nuovo invio utilizzano la stessa tariffa.

I trasferimenti utilizzano MB decimali (1.000.000 di byte). I file di piccole dimensioni consumano token frazionari, anziché arrotondare ciascun file a un MB. Anche le anteprime dei file trasferiscono i dati. La visualizzazione di una copia già memorizzata nella cache dal browser non provoca un altro trasferimento del server. I trasferimenti di file riusciti vengono addebitati per byte di documento, senza il sovraccarico di codifica dell'URL dei dati.

Le richieste e le attività vengono addebitate all'area di lavoro del flusso di lavoro di origine, anche quando un approvatore utilizza una casella di posta personale. I caricamenti dalle pagine di attività e discussione appartengono all'area di lavoro della richiesta, che ne paga il caricamento, l'archiviazione e i download. I caricamenti effettuati durante la preparazione di una nuova richiesta appartengono all'area di lavoro selezionata. La verifica dell'account, la reimpostazione della password, gli avvisi di sicurezza, le email di fatturazione e le risorse di branding pubblico non consumano token dell'area di lavoro.

## Esempio di flusso di lavoro {#example-workflow}

Un flusso di lavoro con 10 MB caricati, 10 MB visualizzati o scaricati, cinque consegne di destinatari email di flusso di lavoro, una richiesta inviata e cinque attività create utilizza **75 token**:

| Attività | Calcolo | Tokens used |
| --- | --- | --- |
| Carica 10 MB | 10×1 | 10 |
| Visualizza o scarica 10 MB | 10×2 | 20 |
| Invia cinque e-mail di flusso di lavoro a un destinatario ciascuna | 5×5 | 25 |
| Invia una richiesta | 1×10 | 10 |
| Crea cinque attività | 5×2 | 10 |
| **Total**| |**75** |

Il completamento di tali attività non consuma di per sé token. Ulteriori trasferimenti di file, email, reinvii o attività create da passaggi successivi del flusso di lavoro vengono addebitati separatamente alle tariffe indicate sopra.

## Addebito e token insufficienti {#charging-and-insufficient-tokens}

Caricamenti, download ed email del flusso di lavoro controllano i token disponibili prima di iniziare e addebitano direttamente il lavoro completato. I caricamenti non riusciti e le e-mail non inviate non vengono addebitati. I download interrotti vengono addebitati per i byte di documento trasferiti. Allegare o eliminare un file caricato non rimborsa il costo di caricamento.

Azioni simultanee possono portare il saldo sotto lo zero; ulteriori azioni addebitate vengono bloccate finché i token non sono disponibili.

I limiti di burst e di concorrenza proteggono anche il servizio. Un'azione temporaneamente limitata può essere ritentata in seguito.

Quando i token sono insufficienti, le nuove azioni addebitate vengono bloccate. I record di richieste e attività esistenti rimangono accessibili; la visualizzazione dei file richiede ancora token. Il completamento di un'attività può creare attività per il passaggio successivo, che richiede token alla velocità di creazione dell'attività. Apri **Plans** per verificare la tua indennità. L'eliminazione di un record non rimborsa i token già consumati.

## Lo spazio di archiviazione è un limite separato {#storage-is-a-separate-limit}

L'archiviazione misura i file che attualmente occupano spazio, inclusi i file programmati in attesa di pulizia. Non si tratta di una nuova quota di caricamento ogni mese. Conservare un file non consuma token aggiuntivi, ma viene conteggiato nella capacità di archiviazione del tuo piano finché non viene rimosso.

Scegli [conservazione](retention.md) per quanto tempo hai bisogno dei record. Una modifica del piano pianificata mantiene il diritto pagato corrente finché non diventa effettivo. Un aggiornamento a pagamento si attiva dopo il pagamento verificato; non concede token semplicemente perché è stato aperto il Checkout.
