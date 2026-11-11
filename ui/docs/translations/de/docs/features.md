---
title: Funktionen zur Dokumentgenehmigung und Zugriff auf den Arbeitsbereich
description: Sehen Sie, welche Click2Approve-Funktionen in persönlichen und organisatorischen Arbeitsbereichen funktionieren, einschließlich Genehmigungsschritten, Signaturen, Teams, Vorlagen und Belegen.
---
# Dokumentgenehmigungsfunktionen und Zugriff auf den Arbeitsbereich {#features-and-availability}

Click2Approve kombiniert Dokumentprüfung, Genehmigungsschritte, elektronische Signaturen und Anforderungsverfolgung. Nutzen Sie **Personal**, Ihren Arbeitsbereich für eigene Anfragen und per E-Mail adressierte Aufgaben, für individuelles Arbeiten. Nutzen Sie einen Organisationsarbeitsbereich für gemeinsame Geschäftsabläufe. Ihr Arbeitsbereich, Ihre Rolle und Ihr Plan bestimmen, welche Maßnahmen Sie ergreifen können.

Sie können auch Ihre eigenen Tools über Click2Approve API verbinden. Siehe [API-Tokens](api-tokens.md), um Anmeldeinformationen zu erstellen und Integrationsanfragen zu authentifizieren.

!!! info "Nur Organisation"
    Mitarbeiter, Teams, Delegationen und Workflow-Vorlagen gehören Organisationen. Wählen Sie in der Arbeitsbereichsauswahl eine Organisation aus, um sie zu verwenden. Andere Funktionen in diesem Handbuch sind auch in Personal verfügbar.

## So funktioniert die Dokumentgenehmigung {#how-document-approval-works}

1. [Erstellen Sie eine Anfrage](create-a-request.md) mit den Dokumenten und Anweisungen.
2. [Workflow-Schritte konfigurieren](workflow-steps.md), um auszuwählen, wer in welcher Reihenfolge handelt. Mehrere Personen können gleichzeitig eine Bewertung abgeben.
3. Die Teilnehmer öffnen **Tasks**, um [ihre Entscheidungen aufzuzeichnen](complete-a-task.md). Für einen Schritt kann ein Kommentar, eine elektronische Signatur oder eine Antwortdatei erforderlich sein.
4. Öffnen Sie **Requests**, um [den Fortschritt zu überprüfen](track-requests.md). Wenn die Anfrage abgeschlossen ist, bewahren [Receipts](receipts.md) das Ergebnis und die aufgezeichneten Aktionen auf.

Zum Beispiel können zwei Personen einen Vorschlag im ersten Schritt prüfen. Anschließend kann der Kunde in einem späteren Schritt unterschreiben. Aktivieren Sie dort **Require an electronic signature**, wenn eine gezeichnete Unterschrift erforderlich ist.

## Arbeitsbereichsreferenz {#workspace-reference}

| Funktion | Personal | Organisation |
| --- | --- | --- |
| Requests, Aufgaben, geordnete Schritte und E-Mail-Zuständigen | Verfügbar | Verfügbar |
| Erforderliche Kommentare und elektronische Signaturen | Verfügbar | Verfügbar |
| Diskussionen und Diskussionsanhänge | Verfügbar | Verfügbar |
| Aufgabenantwortanhänge | Verfügbar | Verfügbar |
| Überarbeitungen anfordern | Verfügbar für berechtigte Anfragen | Verfügbar für berechtigte Anfragen |
| Mitarbeiter und Mitarbeiterbeauftragte | — | Verfügbar |
| Teams und Teamverantwortliche | — | Verfügbar |
| Delegations | — | Verfügbar |
| Workflow-Vorlagen | — | Erstellen Sie Ihre eigenen und verwenden Sie innerhalb der Organisation geteilte Vorlagen wieder |
| Quittungen und Verifizierungslinks | An Sie ausgestellte Belege ansehen, teilen und löschen | Jedes Mitglied kann die ihm ausgestellten Belege einsehen, teilen und löschen |
| Plans, Nutzung und Aufbewahrung | Verwalten Sie Ihren eigenen Plan und Ihre eigenen Einstellungen | Eigentümer und Administratoren verwalten den Plan und die Einstellungen |
| Profile, gespeicherte Signatur, MFA, Passkeys und API-Tokens | Kontoeinstellungen | Gleiche Kontoeinstellungen in allen Arbeitsbereichen |

## Organisationsberechtigungen {#organization-permissions}

Mitglieder können Mitarbeiter-, Team- und Delegationsverzeichnisse anzeigen. Eigentümer und Administratoren verwalten Mitarbeiter, Teams, Delegationen, Abrechnung und Aufbewahrung. Vorlagen sind standardmäßig privat; Ihre Ersteller können sie für andere Organisationsmitglieder zur Ansicht und Verwendung freigeben. Nur der Ersteller kann eine Vorlage bearbeiten oder löschen. Der Zugriff auf die Quittung ist auf den Benutzer beschränkt, für den die jeweilige Quittung ausgestellt wurde. Nur der Eigentümer kann die Löschung einer Organisation planen.

Der Zugriff auf eine Anfrage oder Aufgabe hängt von der Teilnahme, den Teambeziehungen und der Delegation ab. Durch die Organisationsmitgliedschaft allein wird nicht jeder Workflow verfügbar gemacht oder Zugriff auf die Datensätze einer anderen Organisation gewährt.

Siehe [Mitarbeiter und Rollen](employees.md) für die Rollenreferenz und [Nutzung und Einschränkungen](usage.md) für Planeinschränkungen. Öffnen Sie **Plans** für Ihre aktuellen Freibeträge und verfügbaren Planoptionen.
