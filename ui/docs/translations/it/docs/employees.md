---
title: Gestisci i dipendenti e i ruoli dell'area di lavoro di approvazione
description: Aggiungi dipendenti a un'organizzazione Click2Approve e gestisci i loro ruoli e accessi. Confronta le autorizzazioni di Utente, Amministratore e Proprietario per i flussi di lavoro di approvazione.
---
# Dipendenti e ruoli {#employees-and-roles}

I dipendenti collegano gli account utente a un'organizzazione e forniscono le identità utilizzate per le assegnazioni e i record di controllo.

!!! info "Solo organizzazione"
    Seleziona un'organizzazione per visualizzarne i dipendenti. I proprietari e gli amministratori possono aggiungere dipendenti e gestirne l'accesso.

## Aggiungi un dipendente {#add-an-employee}

I proprietari e gli amministratori possono aprire **Employees**, avviare un nuovo dipendente e inserire indirizzo email, nome, posizione, ruolo e team. Salva il dipendente, quindi controlla il suo stato.

L'e-mail identifica l'account a cui dovrebbe essere concesso l'accesso da parte del dipendente. Controllalo prima di salvare. Il nome dell'organizzazione e la posizione di un dipendente possono differire dal suo profilo personale.

Un dipendente il cui indirizzo email non è ancora registrato inizia **Pending**. La registrazione con quell'e-mail attiva l'iscrizione. L'aggiunta di un account già registrato crea un dipendente **Active**.

## Ruoli {#roles}

| Ruolo | Autorizzazioni organizzazione |
| --- | --- |
| User (member) | Partecipa a flussi di lavoro autorizzati, visualizza le directory di dipendenti, team e delegazioni e gestisci i propri modelli |
| Admin | Gestisci dipendenti, team, delegazioni, fatturazione e fidelizzazione |
| Owner | Gestione amministrativa e autorità per pianificare l'eliminazione dell'organizzazione |

I ruoli non concedono l'accesso ad altre organizzazioni. La visibilità delle richieste e delle attività segue anche la partecipazione, le relazioni del team e la delega. I modelli sono privati per impostazione predefinita e possono essere condivisi affinché altri membri dell'organizzazione possano visualizzarli e utilizzarli. Solo il creatore del modello può modificarlo o eliminarlo, anche quando un altro membro è un proprietario o un amministratore.

L'accesso alle ricevute segue la proprietà delle ricevute, indipendentemente dal ruolo del dipendente. I proprietari e gli amministratori possono visualizzare, condividere ed eliminare solo le ricevute emesse a loro favore. Vedi [Ricevute e verifica](receipts.md).

## Stato di dipendente {#employee-status}

| Status | Significato |
| --- | --- |
| Pending | L'iscrizione non è ancora diventata attiva |
| Active | L'accesso dei dipendenti è attivo |
| Disabled | L'accesso dei dipendenti è stato disabilitato |

I proprietari e gli amministratori possono modificare i dettagli dei dipendenti autorizzati, le appartenenze ai team e l'impostazione **Active**. Disabilitare l'accesso è utile quando una persona non deve più agire per l'organizzazione.

## Rimuovi un dipendente {#remove-an-employee}

Utilizza l'azione di eliminazione disponibile solo quando il dipendente deve essere rimosso. I riferimenti esistenti possono impedire la cancellazione; leggere il messaggio di convalida e risolvere prima la relazione rilevante. La disabilitazione dell'accesso può essere appropriata quando è necessario mantenere le relazioni storiche.

Prima di modificare l'appartenenza, esamina i [team](teams.md) e le [delegazioni](delegations.md) che dipendono da quel dipendente.
