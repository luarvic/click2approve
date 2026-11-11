---
title: Funzionalità di approvazione dei documenti e accesso allo spazio di lavoro
description: Scopri quali funzionalità Click2Approve funzionano negli spazi di lavoro personali e organizzativi, inclusi passaggi di approvazione, firme, team, modelli e ricevute.
---
# Funzionalità di approvazione dei documenti e accesso all'area di lavoro {#features-and-availability}

Click2Approve combina revisione dei documenti, passaggi di approvazione, firme elettroniche e monitoraggio delle richieste. Utilizza **Personal**, il tuo spazio di lavoro per le tue richieste e attività indirizzate via email, per il lavoro individuale. Utilizza un'area di lavoro dell'organizzazione per flussi di lavoro aziendali condivisi. Il tuo spazio di lavoro, ruolo e piano determinano quali azioni puoi intraprendere.

Puoi anche collegare i tuoi strumenti tramite Click2Approve API. Vedi [Token API](api-tokens.md) per creare credenziali e autenticare le richieste di integrazione.

!!! info "Solo organizzazione"
    Dipendenti, team, delegazioni e modelli di flusso di lavoro appartengono alle organizzazioni. Seleziona un'organizzazione nel selettore dell'area di lavoro per utilizzarla. Altre funzionalità di questa guida sono disponibili anche in Personal.

## Come funziona l'approvazione dei documenti {#how-document-approval-works}

1. [Crea una richiesta](create-a-request.md) con i documenti e le istruzioni.
2. [Configura passaggi del flusso di lavoro](workflow-steps.md) per scegliere chi agisce e in quale ordine. Più persone possono rivedere nello stesso passaggio.
3. I partecipanti aprono **Tasks** per [registrare le loro decisioni](complete-a-task.md). Un passaggio può richiedere un commento, una firma elettronica o un file di risposta.
4. Apri **Requests** per [controllare l'avanzamento](track-requests.md). Al termine della richiesta, le [ricevute](receipts.md) ne conservano il risultato e le azioni registrate.

Ad esempio, due revisori possono controllare una proposta nel primo passaggio. Il cliente può poi aggiungere la propria firma in un passaggio successivo. Abilita **Require an electronic signature** in quel passaggio se serve una firma disegnata.

## Riferimento area di lavoro {#workspace-reference}

| Caratteristica | Personal | Organizzazione |
| --- | --- | --- |
| Requests, attività, passaggi ordinati e assegnatari di posta elettronica | Disponibile | Disponibile |
| Commenti obbligatori e firme elettroniche | Disponibile | Disponibile |
| Discussioni e allegati discussioni | Disponibile | Disponibile |
| Allegati risposta attività | Disponibile | Disponibile |
| Richiedi revisioni | Disponibile per richieste idonee | Disponibile per le richieste idonee |
| Dipendenti e dipendenti delegati | — | Disponibile |
| Squadre e assegnatari delle squadre | — | Disponibile |
| Delegations | — | Disponibile |
| Modelli di flusso di lavoro | — | Crea i tuoi modelli e riutilizzali condivisi all'interno dell'organizzazione |
| Ricevute e link di verifica | Visualizza, condividi ed elimina le ricevute emesse per te | Ogni membro può visualizzare, condividere ed eliminare le ricevute emesse |
| Plans, utilizzo e conservazione | Gestisci il tuo piano e le tue impostazioni | I proprietari e gli amministratori gestiscono il piano e le impostazioni |
| Profile, firma salvata, MFA, passkey e token API | Impostazioni dell'account | Le stesse impostazioni dell'account in tutti gli spazi di lavoro |

## Autorizzazioni dell'organizzazione {#organization-permissions}

I membri possono visualizzare le directory dei dipendenti, dei team e delle delegazioni. I proprietari e gli amministratori gestiscono dipendenti, team, deleghe, fatturazione e fidelizzazione. I modelli sono privati per impostazione predefinita; i loro creatori possono condividerli affinché altri membri dell'organizzazione possano visualizzarli e utilizzarli. Solo il creatore può modificare o eliminare un modello. L'accesso alle ricevute è limitato all'utente a cui viene emessa ciascuna ricevuta. Solo il proprietario può pianificare l'eliminazione dell'organizzazione.

L'accesso a una richiesta o a un'attività dipende dalla partecipazione, dalle relazioni del team e dalla delega. L'appartenenza a un'organizzazione da sola non espone tutti i flussi di lavoro né garantisce l'accesso ai record di un'altra organizzazione.

Vedi [Dipendenti e ruoli](employees.md) per il riferimento al ruolo e [Utilizzo e limiti](usage.md) per le restrizioni del piano. Apri **Plans** per le tue quote attuali e le scelte di piano disponibili.
