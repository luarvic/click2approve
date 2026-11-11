---
title: Beheben Sie fehlende Genehmigungsaufgaben und fehlgeschlagene Übermittlungen
description: Finden Sie fehlende Anfragen oder Aufgaben und lösen Sie Probleme bei der Dokumentgenehmigung in Click2Approve, einschließlich fehlgeschlagener Übermittlungen, Anmeldeproblemen und abgelaufenen Empfangslinks.
---
# Fehlerbehebung bei Dokumentengenehmigungsproblemen {#troubleshooting}

Wenn Sie eine Genehmigungsaufgabe nicht finden, keine Anfrage senden oder keinen Empfangslink öffnen können, überprüfen Sie zunächst Ihr Konto und den ausgewählten Arbeitsbereich. Öffnen Sie die Anfrage oder Aufgabe, um ihren aktuellen Status zu überprüfen. Lesen Sie dann die Fehlermeldung für die fehlgeschlagene Aktion.

## Ich kann eine Anfrage oder Aufgabe nicht finden {#i-cannot-find-a-request-or-task}

E-Mail-adressierte Aufgaben werden in **Personal** angezeigt. Mitarbeiter- und Teamzuweisungen werden in ihrer Organisation angezeigt. Überprüfen Sie die E-Mail-Adresse des Kontos, den Mitarbeiterstatus, die Teammitgliedschaft und etwaige Delegationen. Eine Aufgabe kann auch abgebrochen, übersprungen, abgeschlossen, ersetzt oder gelöscht worden sein.

Ein E-Mail-Link gewährt keinen Organisationszugriff. Siehe [Arbeitsbereiche und Navigation](workspaces.md).

Wenn **Page not found** angezeigt wird, wurde die Seite möglicherweise verschoben oder Sie haben möglicherweise keinen Zugriff darauf. Wählen Sie **Home** aus, um zurückzukehren, und überprüfen Sie dann Ihr Konto und Ihren Arbeitsbereich.

## Ein Menüelement oder eine Aktion fehlt {#a-menu-item-or-action-is-missing}

Überprüfen Sie [Funktionen und Verfügbarkeit](features.md). Mitarbeiter, Teams, Delegationen und Vorlagen benötigen einen Organisationsarbeitsbereich. Ihre Rolle, Ihr Plan oder Ihr Abrechnungsstatus können Steuerelemente ausblenden oder deaktivieren. Wählen Sie die richtige Organisation aus und bitten Sie einen Eigentümer oder Administrator, Ihren Zugriff zu überprüfen.

## Die App wird nach einem Update neu geladen {#the-app-reloads-after-an-update}

Die App wird automatisch neu geladen, wenn sie eine neue Version erkennt und die aktuelle Seite erneut öffnet. Text, den Sie nicht gespeichert haben, geht möglicherweise verloren.

## Übermittlung oder Abschluss der Aufgabe schlägt fehl {#submission-or-task-completion-fails}

Korrigieren Sie die hervorgehobenen Felder und geben Sie alle erforderlichen Kommentare, Unterschriften und Anhänge ein. Warten Sie, bis der Upload abgeschlossen ist. Überprüfen Sie [Nutzung](usage.md), wenn in der Nachricht eine Zulage erwähnt wird.

Aktualisieren Sie die Ressource, bevor Sie es nach einem API-Fehler erneut versuchen: Möglicherweise hat ein anderer Teilnehmer oder Delegierter sie bereits abgeschlossen. Überprüfen Sie Anfragen oder Aufgaben, um festzustellen, ob die ursprüngliche Aktion erfolgreich war, bevor Sie sie wiederholen.

## Ich kann eine Anfrage nicht überarbeiten {#i-cannot-revise-a-request}

Erneut senden ist nur für berechtigte Anfragen ohne neuere Überarbeitung und ohne erfolgreiches Ergebnis verfügbar. Eine neue Revision startet den Workflow neu; Bisherige Entscheidungen bleiben auf der vorherigen Revision. Siehe [Anfragen verfolgen und überarbeiten](track-requests.md).

## Ein Verifizierungslink funktioniert nicht {#a-verification-link-does-not-work}

Der Link ist möglicherweise abgelaufen, wurde widerrufen oder verweist auf einen gelöschten Ergebnisnachweis. Bitten Sie die Person, der der Nachweis gehört, um einen aktuellen Link. [Belege und Verifizierung](receipts.md).

## Ich kann mich nicht anmelden oder keine E-Mails empfangen. {#i-cannot-sign-in-or-receive-email}

Überprüfen Sie, ob eine E-Mail-Bestätigung erforderlich ist, und fordern Sie bei Bedarf eine neue Bestätigung oder eine Nachricht zum Zurücksetzen des Passworts an. Überprüfen Sie Spam und Ihre Kontoadresse. Versuchen Sie es für MFA mit einem nicht verwendeten Wiederherstellungscode. Für Passkeys versuchen Sie es mit einem registrierten kompatiblen Gerät oder mit der Passwortanmeldung.

Überprüfen Sie [Registrierung und Anmeldung](sign-in.md), [MFA und Passkeys](security.md) und [Benachrichtigungen](notifications.md).

## Die Der Arbeitsbereich ist für die Zahlung blockiert. {#the-workspace-is-blocked-for-payment}

Öffnen Sie **Plans** und befolgen Sie die Aktion zur Zahlungswiederherstellung vor der angezeigten Frist. Ein Organisationseigentümer oder -administrator muss die Zahlungen der Organisation verwalten. Siehe [Pläne und Abrechnung](plans-and-billing.md).

## Löschung ist blockiert {#deletion-is-blocked}

Lesen Sie die Abhängigkeitsmeldung. Ein anderer Datensatz kann weiterhin auf den Mitarbeiter, das Team oder die Workflow-Entität verweisen. Überprüfen Sie [Aufbewahrung und Löschung](retention.md), bevor Sie zugehörige Datensätze entfernen.

## Holen Sie sich Hilfe oder melden Sie einen Fehler {#get-help-or-report-a-bug}

Verwenden Sie die Links **Report a bug** oder **Ask question** der App. Geben Sie die zu reproduzierenden Schritte, das erwartete Ergebnis, das tatsächliche Ergebnis, die ungefähre Zeit und den relevanten Arbeitsbereichstyp an. Wenn ein API-Fehler **Details** anzeigt, überprüfen Sie die Diagnoseinformationen und geben Sie nur an, was für den Supportkanal angemessen ist.

Halten Sie Passwörter, API-Tokens, Wiederherstellungscodes, Verifizierungslinks und private Dokumente aus öffentlichen Berichten fern. Bei Konto-, E-Mail-, Sicherheits- oder Abrechnungsproblemen wenden Sie sich an den Support.
