---
title: Configurare i passaggi del flusso di lavoro di approvazione del documento
description: Imposta i passaggi di approvazione in ordine o consenti a più revisori di agire in un unico passaggio. Scegli tutti o alcuni assegnatari, firme, commenti e allegati richiesti.
---
# Configura i passaggi del flusso di lavoro di approvazione del documento {#configure-workflow-steps}

Un flusso di lavoro di approvazione definisce chi agisce su un documento e in quale ordine. Un **assegnatario** è una persona o un team assegnato a un passaggio. I passaggi si susseguono uno dopo l'altro. Diversi assegnatari possono agire nello stesso passaggio.

Utilizza **Add step** per creare un altro passaggio, i controlli freccia per modificarne l'ordine e il pulsante Rimuovi per eliminarlo.

## Approvazioni sequenziali e parallele {#sequential-and-parallel-approvals}

Utilizza passaggi separati quando una decisione deve precedere un'altra. Questa è un'**approvazione sequenziale**. Ad esempio, un revisore approva una proposta nel passaggio 1, quindi un cliente accede al passaggio 2.

Inserisci le persone nello stesso passaggio quando possono rivedere contemporaneamente. Si tratta di un'**approvazione parallela** all'interno di questo passaggio. I passaggi stessi vengono comunque eseguiti in ordine.

| Hai bisogno di… | Configura il flusso di lavoro in questo modo |
| --- | --- |
| Un recensore, seguito da un altro | Aggiungi un passaggio separato per ciascun revisore |
| Due revisori che devono approvare entrambi | Aggiungi entrambi a un passaggio e attiva **All assignees must complete** |
| Approvazione da parte di una qualsiasi delle numerose persone | Aggiungili a un passaggio e lascia **All assignees must complete** disabilitato |
| Approvazione seguita da firma apposta | Aggiungi un passaggio **Approve**, quindi un passaggio **Sign** con **Require an electronic signature** abilitato |

## Scegli un'azione e i partecipanti {#choose-an-action-and-participants}

Per ogni passaggio, scegli una **Action** e scrivi **Instructions** chiare. Le azioni disponibili sono Approve, Sign, Confirm, Acknowledge, Review, Verify, Accept e Complete. Scegli quella che corrisponde alla decisione da registrare.

Aggiungi gli assegnatari tramite email e controlla i nomi e gli indirizzi visualizzati prima dell'invio.

!!! info "Assegnatari dell'organizzazione"
    In un'organizzazione, seleziona **Employee** o **Team** per assegnare il lavoro all’interno dell’attuale organizzazione. Questi tipi di assegnatario non sono disponibili in Personal.

## Richiedi a tutti o a qualsiasi assegnatario {#require-everyone-or-any-assignee}

Abilita **All assignees must complete** per richiedere una risposta positiva da ogni assegnatario. Con questa opzione disabilitata, una risposta riuscita completa il passaggio e salta le altre attività in sospeso. L'interruttore viene visualizzato quando un passaggio ha più assegnatari o un'assegnazione di squadra.

Una decisione negativa interrompe la richiesta con esito negativo, anche quando **All assignees must complete** è disabilitato. L'opzione non consente ad altri assegnatari di ignorare un rifiuto.

Ad esempio, utilizza un passaggio per due revisori che devono agire entrambi, seguito da un passaggio di firma separato. Utilizza l'opzione qualsiasi assegnatario quando un partecipante disponibile può fornire la decisione richiesta.

## Requisiti aggiuntivi {#additional-requirements}

Le sezioni **Additional requirements** e **Visibility** rimangono visibili in ogni passaggio durante la creazione o la revisione di una richiesta o la modifica di un modello. Controlla le impostazioni prima di salvare o inviare.

Abilita i requisiti che il partecipante deve soddisfare:

- **Require a comment** per raccogliere una spiegazione.
- **Require an electronic signature** per raccogliere i dettagli della firma e una firma disegnata.
- **Require an attachment** per raccogliere un file di risposta.

L'etichetta dell'azione e il requisito della firma elettronica sono impostazioni separate. Abilita il requisito della firma quando è necessaria una firma apposta. Esaminare i requisiti insieme all'azione selezionata in modo che i partecipanti sappiano cosa fornire. Vedi [Completare un'attività](complete-a-task.md).

## Visibilità del passaggio {#step-visibility}

Il richiedente e gli assegnatari diretti di un passaggio possono sempre vedere quel passaggio, inclusi gli assegnatari email. **Visibility** controlla chi altro può vedere i suoi dettagli e gli allegati delle risposte:

| Impostazione | Pubblico aggiuntivo |
| --- | --- |
| All participants | Partecipanti con accesso alla richiesta |
| Assignees and organization participants | Partecipanti all'organizzazione; disponibile per i flussi di lavoro dell'organizzazione |
| Assignees only | Nessun partecipante aggiuntivo |

Le assegnazioni email rimangono nell'area di lavoro Personal del destinatario, anche quando l'email appartiene a un dipendente dell'organizzazione. I passaggi assegnati rimangono visibili nel flusso di lavoro, disponibili per la chat dei passaggi e inclusi nella ricevuta del destinatario.

Queste impostazioni non concedono l'appartenenza all'area di lavoro o l'accesso a richieste non correlate. Scegli un'impostazione limitata quando gli altri partecipanti non hanno bisogno dei dettagli del passaggio.

## Revisioni {#revisions}

Quando [invii nuovamente una richiesta](track-requests.md), rivedi e modifica i passaggi per la nuova revisione. Il suo flusso di lavoro ricomincia dal primo passaggio; le decisioni precedenti restano registrate sulla revisione precedente e sulle relative ricevute. Per i flussi di lavoro dell'organizzazione utilizzati di frequente, salva i passaggi come [modello](templates.md).
