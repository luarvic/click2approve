---
title: Token API per integrare i flussi di approvazione
description: Crea un token API Click2Approve per la tua integrazione, invialo come token Bearer ed esplora il riferimento API. Scopri come funzionano le autorizzazioni e la revoca dei token.
---
# Token API per integrare i flussi di approvazione {#api-tokens}

Utilizza Click2Approve API per connettere i tuoi strumenti e automatizzare i flussi di lavoro di approvazione. I token API consentono alle integrazioni di accedere a API tramite il tuo account utente. Gestiscili nel tuo profilo, sia che lavori in Personal o in un'organizzazione.

## Crea un token {#create-a-token}

1. Apri **User profile → API tokens**.
2. Scegli **New API token**.
3. Inserisci un nome riconoscibile e una scadenza, se necessario.
4. Crea il token e copia il suo valore prima di chiudere la finestra di dialogo.
5. Conservalo in modo sicuro per l'integrazione prevista.

!!! warning "Copia il token prima della chiusura"
    Il valore completo viene mostrato solo una volta. Archivialo in modo sicuro e tienilo lontano da messaggi, screenshot e controllo del codice sorgente. Se lo perdi, creane uno sostitutivo e revoca il vecchio token.

## Esplora API {#explore-the-api}

Apri il [riferimento API (interfaccia utente Swagger)]({{ api_reference_url }}){target="_blank" rel="noopener noreferrer"} per sfogliare endpoint, campi di richiesta e risposte.

Per provare una richiesta autenticata, scegli **Authorize**, incolla il token API senza il prefisso `Bearer` e conferma. Swagger aggiunge l'intestazione dell'autorizzazione per te. Scegli un endpoint, seleziona **Try it out**, compila i campi richiesti e seleziona **Execute**. Queste richieste utilizzano il tuo account e possono creare, modificare o eliminare dati reali.

Gli endpoint di sicurezza dell'account richiedono una sessione di accesso interattivo e non possono essere utilizzati con i token API.

## Utilizza un token nella tua integrazione {#use-a-token-in-your-integration}

Invia il tuo token nel Intestazione `Authorization` con ogni richiesta API:

```http
Authorization: Bearer YOUR_API_TOKEN
```

Sostituisci `YOUR_API_TOKEN` con il valore che hai copiato durante la creazione del token. I token agiscono con le autorizzazioni del tuo account. La creazione di token non garantisce l'accesso al lavoro di un altro utente o alle risorse di un'altra organizzazione; l'autorizzazione è ancora valida.

## Revoca un token {#revoke-a-token}

Seleziona il token nell'elenco, scegli **Revoke** e conferma. Aggiorna qualsiasi integrazione che la utilizzava con una credenziale sostitutiva. Revoca i token e le credenziali inutilizzati che sospetti siano stati esposti.

I token API sono impostazioni dell'account. Il cambio di area di lavoro non crea un set separato di token.
