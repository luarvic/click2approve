---
title: Erstellen Sie eine Dokumentgenehmigungsanfrage
description: Senden Sie Dokumente zur Genehmigung in Click2Approve. Fügen Sie Dateien hinzu, wählen Sie Prüfer aus, legen Sie Workflow-Schritte fest und senden Sie eine Anfrage von Privatpersonen oder einer Organisation.
---
# Erstellen Sie eine Dokumentgenehmigungsanfrage {#create-a-request}

Um ein Dokument zur Genehmigung zu senden, erstellen Sie eine **Anfrage**. Es enthält die zu überprüfenden Dateien, Anweisungen und Schritte, die jedem Teilnehmer sagen, was er tun soll. Sie können eine Genehmigung, Überprüfung oder eine elektronische Signatur anfordern.

Wählen Sie zuerst den richtigen Arbeitsbereich. Nutzen Sie **Personal**, Ihren Arbeitsbereich für Ihre eigenen Anfragen, um Arbeiten in Ihrem eigenen Namen zu versenden. Wählen Sie eine Organisation aus, um in ihrem Namen Arbeit zu senden. Ihr Arbeitsbereich bestimmt, wem die Anfrage gehört und welche Beauftragtentypen Sie verwenden können. Ein **Beauftragter** ist eine Person oder ein Team, die Sie bitten, bei einem Schritt zu handeln.

## Verfassen Sie die Anfrage {#compose-the-request}

1. [Öffnen Sie die App](/app/), wählen Sie Ihren Arbeitsbereich aus und wählen Sie **New request** oben in der Gruppe **Work** im Hauptmenü aus.
2. Wählen Sie in einer Organisation **Custom** oder **From template**. Wählen Sie eine Vorlage aus und fahren Sie mit dem Anforderungseditor fort.
3. Geben Sie einen bestimmten **Title** ein, beispielsweise „Genehmigen Sie die aktualisierte Lieferantenvereinbarung.“
4. Fügen Sie einen **Description** hinzu, der den Zweck, den Kontext und das erwartete Ergebnis erläutert.
5. Hängen Sie die [Dateien an, die die Teilnehmer überprüfen sollten](files.md).
6. Fügen Sie die [Workflow-Schritte](workflow-steps.md) hinzu und konfigurieren Sie sie.

Die Karte **Request details** gruppiert den Titel,**Files to review** und die Beschreibung. Konfigurieren Sie die Workflow-Schritte darunter.

Personal-Anfragen verwenden E-Mail-Beauftragte.

!!! info "Organisations-Beauftragte"
    In einer Organisation können Sie auch Mitarbeitern und Teams dieser Organisation Schritte zuweisen.

## Beispiel: Senden Sie einen Vorschlag zur Genehmigung und Signatur {#example-send-a-proposal-for-approval-and-signature}

1. Fügen Sie den Vorschlag unter **Files to review** hinzu.
2. Fügen Sie einen Schritt hinzu, bei dem **Action** auf **Approve** gesetzt ist, und fügen Sie dann die E-Mail-Adresse des Prüfers hinzu.
3. Wählen Sie **Add step** und setzen Sie **Action** auf **Sign**. Fügen Sie die E-Mail-Adresse des Kunden hinzu und aktivieren Sie **Require an electronic signature**.
4. Schreiben Sie **Instructions** für jeden Schritt, damit beide Personen wissen, was sie überprüfen müssen.

Der Kunde erhält eine Aufgabe, nachdem der Genehmigungsschritt erfolgreich war. Wenn mehrere Personen zuerst genehmigen müssen, fügen Sie sie dem Genehmigungsschritt hinzu und aktivieren Sie **All assignees must complete**. Siehe [Workflow-Schritte konfigurieren](workflow-steps.md) für die Abschlussregeln.

## Überprüfen und senden {#review-and-submit}

Überprüfen Sie die Dateien, Schrittreihenfolge, Aktion, Anweisungen, Teilnehmer, Abschlussregel, Sichtbarkeit und zusätzliche Anforderungen. Wenn Sie eine gezeichnete Signatur benötigen, aktivieren Sie **Require an electronic signature**; Durch die Auswahl der Aktion **Sign** allein wird sie nicht aktiviert. Wählen Sie dann **Submit** und warten Sie auf die Bestätigung, bevor Sie die Seite verlassen.

Wenn Felder hervorgehoben sind, korrigieren Sie sie und senden Sie sie erneut. Wenn ein Planlimit die Übermittlung blockiert, überprüfen Sie [Nutzung](usage.md) oder bitten Sie einen Organisationsinhaber oder -administrator um Hilfe.

Wenn der Name des Mitarbeiters Ihrer Organisation unvollständig ist, wird in einer Warnung erläutert, wie er im Datensatz angezeigt wird. Wählen Sie **Go back**, um es zu korrigieren, oder **Proceed anyway**, um es mit dem aktuellen Namen zu übermitteln. Die Mitarbeiterdetails der Organisation werden getrennt von Ihrem persönlichen Profil verwaltet.

Beim Verfassen einer benutzerdefinierten neuen Organisationsanfrage erstellt **Save template** eine private Vorlage aus dem Titel, der Beschreibung und den Schritten. Es wendet die Regeln zur Vorlagenvalidierung an und ersetzt nicht das Absenden der Anfrage. Anfragen, die über Vorlagen gestartet wurden, und Anfragerevisionen bieten diese Aktion nicht an. Siehe [Workflow-Vorlagen](templates.md).

## Nach der Übermittlung {#after-submission}

Öffnen Sie **Requests** und wählen Sie die Anfrage aus, um ihren Fortschritt zu verfolgen. Die Teilnehmer agieren, während der Workflow ihre Schritte erreicht. Die Benachrichtigungszustellung folgt den Präferenzen jedes Empfängers.

Verwenden Sie [Anfragen verfolgen und überarbeiten](track-requests.md), um Ergebnisse, Stornierungen und Überarbeitungen zu verstehen. Durch Verlassen oder Abbrechen des Bildschirms zum Verfassen werden Änderungen verworfen, ohne dass eine Bestätigung erforderlich ist. Anforderungsentwürfe werden nicht gespeichert.
