---
title: Verbinden Sie Genehmigungsworkflows mit API-Tokens
description: Erstellen Sie ein Click2Approve-API-Token für Ihre Integration, senden Sie es als Bearer-Token und erkunden Sie die API-Referenz. Erfahren Sie, wie Token-Berechtigungen und -Widerrufe funktionieren.
---
# API-Tokens für Genehmigungsworkflow-Integrationen {#api-tokens}

Verwenden Sie Click2Approve API, um Ihre eigenen Tools zu verbinden und Genehmigungsworkflows zu automatisieren. Mit API-Tokens können Integrationen über Ihr Benutzerkonto auf API zugreifen. Verwalten Sie sie in Ihrem Profil, unabhängig davon, ob Sie in Personal oder einer Organisation arbeiten.

## Erstellen Sie ein Token {#create-a-token}

1. Öffnen Sie **User profile → API tokens**.
2. Wählen Sie **New API token**.
3. Geben Sie einen erkennbaren Namen und bei Bedarf ein Ablaufdatum ein.
4. Erstellen Sie das Token und kopieren Sie seinen Wert, bevor Sie den Dialog schließen.
5. Bewahren Sie es für die beabsichtigte Integration sicher auf.

!!! warning "Kopieren Sie das Token vor dem Schließen"
    Der vollständige Wert wird nur einmal angezeigt. Speichern Sie es sicher und halten Sie es von Nachrichten, Screenshots und der Quellcodeverwaltung fern. Wenn Sie es verlieren, erstellen Sie einen Ersatz und widerrufen Sie das alte Token.

## Entdecken Sie die API {#explore-the-api}

Öffnen Sie die [API-Referenz (Swagger-Benutzeroberfläche)]({{ api_reference_url }}){target="_blank" rel="noopener noreferrer"} zum Durchsuchen von Endpunkten, Anforderungsfeldern und Antworten.

Um eine authentifizierte Anforderung zu versuchen, wählen Sie **Authorize**, fügen Sie Ihr API-Token ohne das `Bearer`-Präfix ein und bestätigen Sie. Swagger fügt den Autorisierungsheader für Sie hinzu. Wählen Sie einen Endpunkt, wählen Sie **Try it out**, füllen Sie die erforderlichen Felder aus und wählen Sie **Execute** aus. Diese Anfragen verwenden Ihr Konto und können echte Daten erstellen, ändern oder löschen.

Kontosicherheitsendpunkte erfordern eine interaktive Anmeldesitzung und können nicht mit API-Tokens verwendet werden.

## Verwenden Sie ein Token in Ihrer Integration {#use-a-token-in-your-integration}

Senden Sie Ihr Token in der `Authorization`-Header bei jeder API-Anfrage:

```http
Authorization: Bearer YOUR_API_TOKEN
```

Ersetzen Sie `YOUR_API_TOKEN` durch den Wert, den Sie beim Erstellen des Tokens kopiert haben. Token funktionieren mit den Berechtigungen Ihres Kontos. Durch die Tokenerstellung wird kein Zugriff auf die Arbeit eines anderen Benutzers oder die Ressourcen einer anderen Organisation gewährt; Die Autorisierung gilt weiterhin.

## Widerrufen eines Tokens {#revoke-a-token}

Wählen Sie das Token in der Liste aus, wählen Sie **Revoke** und bestätigen Sie. Aktualisieren Sie alle Integrationen, die sie verwendet haben, mit Ersatzanmeldeinformationen. Widerrufen Sie nicht verwendete Token und Anmeldeinformationen, von denen Sie vermuten, dass sie offengelegt wurden.

API-Tokens sind Kontoeinstellungen. Beim Wechseln des Arbeitsbereichs wird kein separater Satz von Token erstellt.
