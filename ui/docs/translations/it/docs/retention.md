---
title: Conservazione e cancellazione dei record di approvazione
description: Scopri per quanto tempo Click2Approve conserva richieste, ricevute e file. Esamina le impostazioni di conservazione e cosa succede quando elimini un record o un'organizzazione.
---
# Conservazione ed eliminazione {#retention-and-deletion}

Scegli per quanto tempo conservare richieste, ricevute e notifiche in ogni area di lavoro. I controlli di eliminazione dipendono dalla risorsa e dalle tue autorizzazioni.

## Imposta conservazione {#set-retention}

1. Seleziona l'area di lavoro e apri **Retention**.
2. Esamina i periodi **Requests**, **Receipts** e **Notifications** sui piani gratuiti e di prova oppure **Requests and receipts** e **Notifications** sui piani a pagamento. I valori del cursore intermedio vengono visualizzati in una piccola bolla sopra il cursore; gli endpoint sono **1 month** e **Never delete**.
3. Se il tuo piano e le tue autorizzazioni consentono modifiche, scegli un periodo per ciascuno e seleziona **Save**.

Gli utenti di Personal gestiscono le proprie impostazioni; i proprietari e gli amministratori gestiscono quelle dell’organizzazione. Personal Free e Business Trial conservano richieste e notifiche per un mese. Le ricevute vengono conservate per cinque anni in Personal Free e per un mese in Business Trial, dalla loro creazione. I piani a pagamento permettono di configurare **Requests and receipts** e **Notifications**, inclusa l’opzione **Never delete**.

Quando la prova gratuita o Business Personal diventa attiva, entrambi i periodi cambiano automaticamente in un mese, inclusa un'impostazione **Never delete** precedente. Un downgrade pianificato mantiene le impostazioni di conservazione attuali fino al termine del periodo di pagamento. Le richieste e le notifiche più vecchie di un mese diventano idonee per la pulizia in background. La pulizia delle ricevute segue il periodo di ricezione del piano corrente, anche per le ricevute esistenti; l'aggiornamento prima della pulizia può estenderne la conservazione.

!!! warning "La conservazione non è un backup"
    I record possono essere rimossi mediante pulizia in background dopo il periodo di conservazione. Scegli una policy che supporti le tue esigenze di tenuta dei registri prima di accumulare un'importante cronologia del flusso di lavoro.

## Promemoria di conservazione {#retention-reminders}

Prima che le richieste e le ricevute raggiungano la scadenza di conservazione, i loro proprietari ricevono
**Retention deletion reminders**. Il periodo di preavviso standard è di una settimana. Ciascun
promemoria identifica il record interessato e la relativa data di eliminazione. Le email si collegano a quel record, alle impostazioni di conservazione dell'area di lavoro e a questa guida.
I promemoria delle richieste vanno al richiedente; i promemoria della ricevuta vanno solo al proprietario della ricevuta.
Ogni richiesta o ricevuta genera un sollecito; la modifica della scadenza di conservazione
non reimposta il promemoria.

Gestisci la consegna di **In-app** e **Email** in **User profile → Notifications → Retention deletion reminders**.
Entrambi iniziano abilitati. La disabilitazione dei promemoria non disabilita la pulizia della conservazione. Per
conservare i record più a lungo, modifica il periodo di conservazione se il tuo piano e le tue autorizzazioni
lo consentono, oppure contatta il proprietario o l'amministratore della tua organizzazione.
I promemoria via email utilizzano [token email di notifica](usage.md) e richiedono
token sufficienti nel area di lavoro.

I promemoria seguono le tue preferenze di notifica e i normali tentativi di consegna.
La pulizia della conservazione segue la pianificazione configurata anche se un promemoria è disabilitato
o non può essere recapitato. I promemoria si applicano alla richiesta automatica e alla conservazione delle ricevute;
la pulizia delle notifiche, l'eliminazione manuale, l'eliminazione dell'organizzazione e quella relativa ai pagamenti
la pulizia seguono le proprie regole.

## Elimina singoli record {#delete-individual-records}

Utilizza l'azione di eliminazione offerta per una richiesta, attività, ricevuta, dipendente, team, modello o delega solo quando intendi rimuovere quel record. Leggi la conferma e qualsiasi messaggio di convalida.

Solo il proprietario di una ricevuta può eliminarla manualmente. L'eliminazione manuale e la pulizia della conservazione rimuovono insieme la ricevuta e i relativi collegamenti di verifica. L'eliminazione della ricevuta non rimuove la richiesta originale o le ricevute degli altri partecipanti. La rimozione della richiesta originale non rimuove le relative conferme.

Una relazione da un altro record può impedirne l'eliminazione. Risolvere la relazione identificata ove appropriato. I tentativi ripetuti non rimuovono la dipendenza.

Una richiesta con una revisione più recente non può essere eliminata mentre quella revisione vi fa riferimento. Inizia con l'ultima revisione quando rimuovi una catena di revisioni. Pulizia delle pianificazioni di eliminazione; attendi che la revisione venga rimossa prima di riprovare con la versione precedente.

L'eliminazione di una richiesta la rende immediatamente idonea alla pulizia in background, indipendentemente dalla sua età. I token consumati in precedenza non vengono rimborsati.

Le ricevute preservano i metadati e gli hash dei file senza estendere la conservazione degli allegati. L'eliminazione di una ricevuta non elimina né pianifica la pulizia dei suoi allegati originali.

I file associati ai record del flusso di lavoro eliminati possono essere programmati per la pulizia successiva, quindi il contenuto e l'utilizzo archiviati potrebbero non scomparire immediatamente. Gli avatar del profilo e i loghi dell'organizzazione possono essere rimossi immediatamente se sostituiti o eliminati.

## Elimina un'organizzazione {#delete-an-organization}

!!! warning "L'eliminazione dell'organizzazione rimuove l'accesso immediatamente"
    Solo il proprietario può pianificare l'eliminazione dell'organizzazione. L'organizzazione scompare immediatamente dalla selezione dello spazio di lavoro e diventa inaccessibile; l'elaborazione in background rimuove i relativi dati in un secondo momento. Conserva i record richiesti prima di confermare. Il ritardo della pulizia non è un'opzione di recupero.

## Rimozione relativa al pagamento {#payment-related-removal}

La sospensione del pagamento ha una propria scadenza. Risolvi i pagamenti non riusciti tramite [Piani](plans-and-billing.md) prima di tale scadenza. La scadenza cancella le organizzazioni imprenditoriali; Gli spazi di lavoro Personal perdono i dati del flusso di lavoro e tornano a Personal Free mantenendo identità e profilo. Un'impostazione di conservazione non sovrascrive questo processo di recupero della fatturazione.
