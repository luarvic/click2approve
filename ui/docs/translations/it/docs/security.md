---
title: Configura l'autenticazione MFA e le passkey
description: Proteggi il tuo account Click2Approve con un'app di autenticazione o una passkey. Scopri come configurare l'MFA, salvare i codici di ripristino e gestire le passkey registrate.
---
# MFA e passkey {#mfa-and-passkeys}

Proteggi il tuo account Click2Approve con l'**autenticazione a più fattori (MFA)** o una **passkey**. Con l'autenticatore MFA, inserisci un codice da un'app di autenticazione dopo la password. Una passkey ti consente di accedere tramite un dispositivo supportato o una chiave di sicurezza, utilizzando la richiesta del browser.

Queste impostazioni si applicano al tuo account in Personal e negli spazi di lavoro dell'organizzazione.

## Abilita l'autenticatore MFA {#enable-authenticator-mfa}

1. Apri **User profile → Security**.
2. Abilita **Use multi-factor authentication**.
3. Scansiona il codice QR di configurazione nell'app di autenticazione o inserisci manualmente la chiave di configurazione.
4. Inserisci un codice di verifica dall'autenticatore per confermare la configurazione.
5. Salva i codici di ripristino in un luogo sicuro e conferma di averli salvati.
6. Scegli **Done — sign in again**, quindi accedi con la tua password e il codice di autenticazione.

Dopo la configurazione, l'accesso con password richiede la verifica aggiuntiva MFA. L'avvio della configurazione modifica la sessione: per completarla o annullarla è necessario effettuare nuovamente l'accesso.

## Codici di ripristino {#recovery-codes}

Utilizza un codice di ripristino salvato quando non riesci ad accedere all'autenticatore.

!!! warning "Mantieni i codici di ripristino al sicuro"
    Ogni codice è un segreto e può essere utilizzato una sola volta. **Generate new recovery codes** sostituisce il set precedente; salva i nuovi codici prima di eliminarli.

Anche per generare nuovi codici di ripristino o disattivare MFA è necessario effettuare nuovamente l'accesso al termine.

Per disattivare MFA, utilizzare la scheda Security e completare la verifica richiesta. Non rimuovere il tuo unico metodo di accesso funzionante prima di testarne un altro.

## Aggiungi una passkey {#add-a-passkey}

1. Apri **User profile → Passkeys** e scegli la nuova azione della passkey.
2. Inserisci un nome che riconoscerai in seguito.
3. Completa la richiesta del browser o del dispositivo utilizzando il codice biometrico, il PIN o la chiave di sicurezza.
4. Verifica che le credenziali siano visualizzate nell'elenco.

Utilizza l'opzione di accesso con passkey su un dispositivo e un browser supportati. Le passkey richiedono un dispositivo e un browser compatibili. Mantieni la tua password disponibile per il recupero dell'account.

## Rimuovi una passkey {#remove-a-passkey}

Seleziona la credenziale nell'elenco Passkey e utilizza l'azione di rimozione. Controlla prima il nome e i dettagli dell'ultimo utilizzo. La sua rimozione revoca l'accesso a quella credenziale; non rimuove le altre passkey registrate.

Dopo la rimozione, l'app avvisa i gestori di password compatibili in modo che possano smettere di offrire la passkey rimossa. Il tuo browser o gestore di password potrebbe non supportare questo aggiornamento. Se la passkey viene ancora visualizzata, rimuovila manualmente dal tuo gestore password; non potrà più accedere al tuo account.

In caso di smarrimento di un autenticatore o di un dispositivo non disponibile, prova il metodo alternativo configurato o il codice di ripristino. Se nessuno è disponibile, contatta l'assistenza per ricevere aiuto.
