---
title: Sistema di approvazione dei documenti open source
description: Self-host Click2Approve, un sistema gratuito di approvazione dei documenti con licenza MIT con flussi di lavoro in più fasi, più revisori e firme elettroniche. Confronta le edizioni.
---
# Sistema di approvazione dei documenti open source {#open-source-document-approval-system}

Click2Approve è un sistema di approvazione dei documenti open source gratuito con licenza MIT che puoi ospitare sulla tua infrastruttura. Carica documenti, assegna revisori in base all'indirizzo e-mail e monitora le loro decisioni attraverso un flusso di lavoro di approvazione in più fasi. Puoi richiedere firme elettroniche e richiedere commenti quando un'attività richiede una spiegazione.

L'edizione open source supporta account individuali e flussi di lavoro di documenti personali per uso personale o commerciale. Non è previsto alcun canone per la licenza Click2Approve; copri i costi dell'infrastruttura e del provider. Consulta il [codice sorgente e le istruzioni di self-hosting](https://github.com/luarvic/click2approve) per iniziare.

La versione commerciale aggiunge spazi di lavoro organizzativi, strumenti di collaborazione e controlli di utilizzo e conservazione basati su abbonamento. Le altre guide presenti in questo portale descrivono il servizio commerciale; utilizza questo confronto per verificare quali funzionalità si applicano all'edizione open source.

## Esempio: rivedere e approvare una proposta {#example-review-and-approve-a-proposal}

1. Carica una proposta e aggiungi un passaggio di approvazione per le persone che devono esaminarla.
2. Scegli se tutti gli utenti assegnati al passaggio devono rispondere o se un solo revisore può completarlo. I passaggi del flusso di lavoro vengono eseguiti in ordine, con più assegnatari in grado di agire all'interno di ogni passaggio.
3. Aggiungi un passaggio di firma se la proposta necessita anche di una firma elettronica.
4. Tieni traccia dello stato di avanzamento della richiesta e delle decisioni registrate da **Requests**. Ogni partecipante trova il lavoro assegnato in **Tasks**.

Vedi [Crea una richiesta](create-a-request.md) e [Configura i passaggi del flusso di lavoro](workflow-steps.md) per i controlli del flusso di lavoro. Le ricevute condivisibili e la verifica dei file sono funzionalità commerciali; guarda il confronto di seguito quando scegli un'edizione.

## Confronto delle funzionalità {#feature-comparison}

| Caratteristica | Open source | Commerciale |
| --- | --- | --- |
| Personal richieste e attività con file caricati | Incluso | Incluso |
| Passaggi multipli del flusso di lavoro, assegnatari seriali o paralleli e tutte/qualsiasi regola di completamento | Incluso | Incluso |
| Azioni di approvazione, firma, conferma, riconoscimento, revisione, verifica, accettazione e completamento | Incluso | Incluso |
| Commenti obbligatori e firme elettroniche | Incluso | Incluso |
| Richiedi tracciamento, cancellazione ed eliminazione | Incluso | Incluso |
| Profili, firme salvate, accesso con password, MFA e passkey | Incluso | Incluso |
| Notifiche e-mail e in-app | Incluso | Incluso |
| Aree di lavoro dell'organizzazione, dipendenti, ruoli e assegnatari dei dipendenti | Non disponibile | Incluso |
| Squadre e assegnatari delle squadre | Non disponibile | Incluso |
| Delegations | Non disponibile | Incluso |
| Modelli di flusso di lavoro dell'organizzazione | Non disponibile | Incluso |
| Discussioni e allegati discussioni | Non disponibile | Incluso |
| Allegati di risposta all'attività e file di risposta richiesti | Non disponibile | Incluso |
| Richiedi revisioni e confronti di file tra revisioni | Non disponibile | Incluso |
| Receipts, collegamenti di verifica condivisibili e verifica dei file | Non disponibile | Incluso |
| Token API per integrazioni | Non disponibile | Incluso |
| Piani di abbonamento, reporting sull'utilizzo dei token e fatturazione | Non disponibile | Incluso |
| Impostazioni di conservazione dell'area di lavoro e pulizia automatica della conservazione | Non disponibile | Incluso |

Le funzionalità commerciali dipendono dallo spazio di lavoro, dal ruolo, dalla partecipazione e dai limiti del piano. Vedi [Funzionalità e disponibilità](features.md) per le autorizzazioni dello spazio di lavoro e [Piani e fatturazione](plans-and-billing.md) per gli abbonamenti. Il recapito della posta elettronica in un'installazione self-hosted richiede un provider di posta elettronica.

## Utilizza l'app open source {#use-the-open-source-app}

1. Registrati o accedi con il tuo account.
2. Scegli **New request**, carica i tuoi file e configura i passaggi del flusso di lavoro con gli indirizzi email degli assegnatari. Vedi [Crea una richiesta](create-a-request.md) e [Configura i passaggi del flusso di lavoro](workflow-steps.md) per i controlli del flusso di lavoro condiviso.
3. Utilizza **Requests** per tenere traccia del lavoro inviato e **Tasks** per completare le azioni assegnate a te. Vedere [Completare un'attività](complete-a-task.md) per commenti e firme; gli allegati di risposta sono disponibili nella versione commerciale.

La navigazione dell'organizzazione e gli strumenti commerciali sono nascosti nell'app open source. Puoi gestire il tuo profilo, la firma salvata, le preferenze di notifica, MFA e le passkey tramite il menu del profilo.

## sorgente e hosting autonomo {#source-and-self-hosting}

Consulta il [repository open source](https://github.com/luarvic/click2approve) per il codice sorgente, la licenza MIT, la configurazione di Docker e le istruzioni di hosting autonomo. Visita il [servizio Click2Approve](../index.md) per la versione commerciale.
