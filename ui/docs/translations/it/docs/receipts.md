---
title: Ricevute di approvazione e verifica dei file
description: Aprire un registro delle decisioni e delle firme di approvazione dei documenti. Condividi una ricevuta tramite un link di verifica e controlla se un file corrisponde alla copia registrata.
---
# Ricevute di approvazione e verifica dei file {#receipts-and-verification}

Una **ricevuta** è un record che Click2Approve crea al termine di una richiesta. Conserva i dettagli della richiesta, l'esito e le azioni registrate dei partecipanti, comprese le firme ove fornite. Usalo per vedere chi ha agito e quale risultato è stato registrato.

Puoi condividere una ricevuta tramite un link di verifica. La persona con il collegamento può rivedere il record e verificare se la sua copia di un documento corrisponde a un file registrato sulla ricevuta.

!!! info "Chi può gestire le ricevute?"
    Solo l'utente a cui viene emessa una ricevuta può aprirla o eliminarla nell'area di lavoro e gestirne i collegamenti di verifica. Questo vale sia per Personal che per le organizzazioni; I proprietari e gli amministratori non possono aprire le ricevute di altre persone tramite il proprio ruolo.

Il richiedente e ogni persona che ha ricevuto un’attività ottengono una ricevuta quando la richiesta viene completata, annullata o sostituita da una nuova revisione. Ogni persona riceve una sola ricevuta per spazio di lavoro e revisione della richiesta, anche se ha più attività o è anche il richiedente. Non è necessario completare l’attività: lo stato registrato distingue l’assegnazione dall’azione eseguita. I passaggi che non hanno generato attività non emettono ricevute per gli assegnatari.

## Apri una ricevuta {#open-a-receipt}

Apri **Receipts** nell'area di lavoro in cui hai inviato la richiesta o completato l'attività, quindi seleziona la ricevuta per quella richiesta. L'intestazione della scheda **Receipt** include il numero breve, la richiesta corrispondente e le intestazioni della scheda attività. La carta mostra l'ID completo e la data, seguiti dalle sezioni **Request** e **Task** con i dettagli registrati, i risultati, i partecipanti, le azioni e le firme ove presenti.

Le intestazioni delle sezioni **Request** e **Task** includono i relativi numeri brevi sia nelle ricevute dell'area di lavoro che nelle pagine di verifica condivisa. Gli ID completi delle richieste e delle attività rimangono nei dettagli registrati quando disponibili.

Le date di ricezione utilizzano la data e l'ora locali senza secondi. I campi vuoti e il numero della prima revisione vengono nascosti.

Durante la stampa, le sezioni Richiesta e Attività possono continuare su più pagine. Le intestazioni delle sezioni rimangono nella prima riga, mentre le singole righe di dettagli e le firme rimangono insieme quando si adattano a una pagina.

Una ricevuta conserva il contesto registrato del lavoro completato. La visibilità specifica del partecipante può limitare i passaggi inclusi in una ricevuta. Una ricevuta è separata dalla richiesta in tempo reale.

## Crea un collegamento di verifica {#create-a-verification-link}

1. Apri una ricevuta che puoi gestire.
2. Seleziona **Share**.
3. Scegli **New link**, imposta **Expires** e crea il collegamento.
4. Seleziona il collegamento creato nell'elenco per aprire il relativo URL di verifica, quindi copialo e condividilo con il destinatario previsto.

Il codice QR all'interno della scheda della ricevuta apre lo stesso collegamento di verifica. Seleziona il logo Click2Approve o il nome del marchio sopra la carta per aprire la home page.

!!! warning "Chiunque abbia il collegamento può visualizzare la ricevuta"
    Un collegamento di verifica attivo apre la ricevuta senza richiedere l'iscrizione a Workspace. Esaminalo prima di condividerlo: i suoi contenuti possono includere nomi, decisioni e firme.

## Verifica un file {#verify-a-file}

Apri una ricevuta nel tuo spazio di lavoro o un collegamento di verifica attivo e scegli **Verify file**. Seleziona la tua copia del documento. Il tuo browser calcola il suo **SHA-256 hash**, un valore basato sul contenuto del file. Click2Approve confronta quel valore con gli hash registrati sulla ricevuta e mostra se il file corrisponde a un file di richiesta o all'allegato di risposta di un partecipante. Questo controllo legge il file selezionato nel browser; non carica quella copia.

Ad esempio, se qualcuno ti invia una proposta approvata e il relativo collegamento di ricevuta, apri il collegamento e utilizza **Verify file** per verificare la proposta. Un file con contenuti modificati non corrisponderà all'hash registrato, anche se il suo nome file è lo stesso.

Il risultato appare sopra **Verify file**. **File verified** identifica l'allegato corrispondente e la relativa richiesta o attività.**File does not match** significa che nessun file registrato ha lo stesso hash. Verifica di aver selezionato la versione corretta e riprova.

La verifica utilizza i metadati del file e gli hash conservati nella ricevuta. Funziona ancora dopo che gli allegati originali sono stati rimossi; conservare una ricevuta non conserva gli allegati memorizzati.

Una corrispondenza conferma che il contenuto del file corrisponde a un file registrato. Non valuta le affermazioni del documento né verifica in modo indipendente l'identità del firmatario.

## Interrompi la condivisione {#stop-sharing}

Su **Share**, seleziona il collegamento, scegli **Remove** e conferma quando l'accesso non è più necessario. Un link scaduto o revocato non fornisce più la ricevuta. La creazione di un altro collegamento non estende la scadenza di un collegamento esistente.

Se la verifica fallisce, chiedi al proprietario della ricevuta un collegamento corrente. I collegamenti di verifica pubblici forniscono l'accesso alla ricevuta, non alle richieste, alle attività o alle directory dell'organizzazione.

## Conservazione delle ricevute {#receipt-retention}

La pulizia in background rimuove le ricevute e i relativi collegamenti di verifica in base ai [criteri di conservazione](retention.md) dell'area di lavoro delle ricevute, misurati dalla creazione della ricevuta:

| Piano | Conservazione della ricevuta |
| --- | --- |
| Personal Free | Cinque anni |
| Business Trial | Un mese |
| Piani a pagamento | Il periodo **Requests and receipts** configurato, incluso **Never delete** |

La ricevuta di un assegnatario personale segue la politica dello spazio di lavoro Personal, indipendentemente dal piano dell'organizzazione richiedente. La modifica dei piani modifica la politica per le ricevute esistenti che non sono ancora state rimosse. L'eliminazione della richiesta originale non comporta l'eliminazione delle relative ricevute. La rimozione dell'area di lavoro e la pulizia relativa ai pagamenti possono comunque rimuovere le ricevute prima.

Un collegamento di verifica non è un backup indipendente della relativa ricevuta. La revoca di un collegamento interrompe la condivisione senza eliminare la ricevuta.

## Elimina la ricevuta {#delete-your-receipt}

Seleziona **Delete** sulla ricevuta, quindi conferma in **Delete receipt**. Ciò rimuoverà permanentemente la ricevuta e tutti i relativi link di verifica. Non cancella la richiesta originale o le ricevute rilasciate ad altri partecipanti. I proprietari e gli amministratori possono eliminare solo le ricevute emesse a loro stessi.

Per interrompere la condivisione conservando la ricevuta, revoca invece i relativi link di verifica.
