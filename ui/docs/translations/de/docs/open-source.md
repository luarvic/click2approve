---
title: Open-Source-Dokumentgenehmigungssystem
description: Selbsthoster Click2Approve, ein kostenloses, vom MIT lizenziertes Dokumentgenehmigungssystem mit mehrstufigen Arbeitsabläufen, mehreren Prüfern und elektronischen Signaturen. Editionen vergleichen.
---
# Open-Source-Dokumentgenehmigungssystem {#open-source-document-approval-system}

Click2Approve ist ein kostenloses, MIT-lizenziertes Open-Source-Dokumentgenehmigungssystem, das Sie auf Ihrer eigenen Infrastruktur hosten können. Laden Sie Dokumente hoch, weisen Sie Prüfer per E-Mail-Adresse zu und verfolgen Sie ihre Entscheidungen über einen mehrstufigen Genehmigungsworkflow. Sie können elektronische Signaturen anfordern und Kommentare anfordern, wenn eine Aufgabe einer Erklärung bedarf.

Die Open-Source-Edition unterstützt individuelle Konten und persönliche Dokument-Workflows für den persönlichen oder kommerziellen Gebrauch. Es gibt keine Click2Approve-Lizenzgebühr; Sie decken Ihre Infrastruktur- und Providerkosten. Sehen Sie sich den [Quellcode und die Anweisungen zum Selbsthosting](https://github.com/luarvic/click2approve) an, um loszulegen.

Die kommerzielle Version fügt Organisationsarbeitsbereiche, Tools für die Zusammenarbeit sowie abonnementbasierte Nutzungs- und Aufbewahrungskontrollen hinzu. Die anderen Leitfäden in diesem Portal beschreiben den kommerziellen Service; Verwenden Sie diesen Vergleich, um zu überprüfen, welche Funktionen für die Open-Source-Edition gelten.

## Beispiel: Überprüfen und genehmigen Sie einen Vorschlag {#example-review-and-approve-a-proposal}

1. Laden Sie einen Vorschlag hoch und fügen Sie einen Genehmigungsschritt für die Personen hinzu, die ihn prüfen müssen.
2. Wählen Sie aus, ob jeder, der dem Schritt zugewiesen ist, antworten muss oder ob ein einzelner Prüfer ihn abschließen kann. Workflow-Schritte werden der Reihe nach ausgeführt, wobei in jedem Schritt mehrere Beauftragte agieren können.
3. Fügen Sie einen Signaturschritt hinzu, wenn der Vorschlag auch eine elektronische Signatur benötigt.
4. Verfolgen Sie den Fortschritt der Anfrage und aufgezeichnete Entscheidungen von **Requests**. Jeder Teilnehmer findet seine zugewiesene Arbeit in **Tasks**.

Siehe [Eine Anfrage erstellen](create-a-request.md) und [Workflow-Schritte konfigurieren](workflow-steps.md) für die Workflow-Steuerelemente. Gemeinsam nutzbare Belege und Dateiverifizierung sind kommerzielle Funktionen; Sehen Sie sich den Vergleich unten an, wenn Sie eine Edition auswählen.

## Funktionsvergleich {#feature-comparison}

| Funktion | Open-Source | Kommerziell |
| --- | --- | --- |
| Personal Anfragen und Aufgaben mit hochgeladenen Dateien | Im Lieferumfang enthalten | Enthalten |
| Mehrere Workflow-Schritte, serielle oder parallele Beauftragte und alle/beliebige Abschlussregeln | Im Lieferumfang enthalten | Enthalten |
| Genehmigungs-, Unterschrifts-, Bestätigungs-, Bestätigungs-, Überprüfungs-, Verifizierungs-, Annahme- und Abschlussaktionen | Im Lieferumfang enthalten | Enthalten |
| Erforderliche Kommentare und elektronische Signaturen | Im Lieferumfang enthalten | Enthalten |
| Nachverfolgung, Stornierung und Löschung von Anfragen | Im Lieferumfang enthalten | Enthalten |
| Profile, gespeicherte Signaturen, Passwort-Anmeldung, MFA und Passkeys | Im Lieferumfang enthalten | Enthalten |
| E-Mail- und In-App-Benachrichtigungen | Im Lieferumfang enthalten | Enthalten |
| Organisationsarbeitsbereiche, Mitarbeiter, Rollen und zugewiesene Mitarbeiter | Nicht verfügbar | Enthalten |
| Teams und Teamverantwortliche | Nicht verfügbar | Im Lieferumfang enthalten |
| Delegations | Nicht verfügbar | Enthalten |
| Workflow-Vorlagen für Organisationen | Nicht verfügbar | Enthalten |
| Diskussionen und Diskussionsanhänge | Nicht verfügbar | Enthalten |
| Aufgabenantwortanhänge und erforderliche Antwortdateien | Nicht verfügbar | Enthalten |
| Revisionen und Dateivergleiche zwischen Revisionen anfordern | Nicht verfügbar | Enthalten |
| Receipts, gemeinsam nutzbare Verifizierungslinks und Dateiverifizierung | Nicht verfügbar | Enthalten |
| API-Tokens für Integrationen | Nicht verfügbar | Enthalten |
| Abonnementpläne, Token-Nutzungsberichte und Abrechnung | Nicht verfügbar | Enthalten |
| Aufbewahrungseinstellungen für den Arbeitsbereich und automatische Aufbewahrungsbereinigung | Nicht verfügbar | Enthalten |

Kommerzielle Funktionen hängen von Ihrem Arbeitsbereich, Ihrer Rolle, Ihrer Teilnahme und den Planbeschränkungen ab. Siehe [Funktionen und Verfügbarkeit](features.md) für Workspace-Berechtigungen und [Pläne und Abrechnung](plans-and-billing.md) für Abonnements. Für die E-Mail-Zustellung in einer selbst gehosteten Installation ist ein E-Mail-Anbieter erforderlich.

## Verwenden Sie die Open-Source-App {#use-the-open-source-app}

1. Registrieren Sie sich oder melden Sie sich mit Ihrem Konto an.
2. Wählen Sie **New request**, laden Sie Ihre Dateien hoch und konfigurieren Sie Workflow-Schritte mit den E-Mail-Adressen der Beauftragten. Siehe [Eine Anfrage erstellen](create-a-request.md) und [Workflow-Schritte konfigurieren](workflow-steps.md) für die freigegebenen Workflow-Steuerelemente.
3. Verwenden Sie **Requests**, um die von Ihnen gesendete Arbeit zu verfolgen, und **Tasks**, um Ihnen zugewiesene Aktionen abzuschließen. Kommentare und Unterschriften finden Sie unter [Eine Aufgabe abschließen](complete-a-task.md). Antwortanhänge sind in der kommerziellen Version verfügbar.

Organisationsnavigation und kommerzielle Tools sind in der Open-Source-App verborgen. Sie können Ihr Profil, Ihre gespeicherte Signatur, Benachrichtigungseinstellungen, MFA und Passkeys über das Profilmenü verwalten.

## Quelle und Selbsthosting {#source-and-self-hosting}

Siehe das [Open-Source-Repository](https://github.com/luarvic/click2approve) für Quellcode, die MIT-Lizenz, Docker-Setup und Selbsthosting-Anweisungen. Besuchen Sie den [Click2Approve-Dienst](../index.md) für die kommerzielle Version.
