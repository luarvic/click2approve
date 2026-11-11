---
title: Verwalten Sie Genehmigungs-E-Mails und In-App-Benachrichtigungen
description: Wählen Sie E-Mail- und In-App-Benachrichtigungen für Genehmigungsanfragen, Aufgaben, Chat und Belege. Finden Sie Zustellungseinstellungen und prüfen Sie, was zu tun ist, wenn eine Nachricht fehlt.
---
# Genehmigungs-E-Mails und In-App-Benachrichtigungen {#notifications}

Benachrichtigungen helfen Ihnen, zu zugewiesenen Aufgaben, Anforderungsergebnissen, Diskussionen, Belegen und Abrechnungsereignissen zurückzukehren. Legen Sie die Zustellungseinstellungen für jede Kategorie separat fest.

## Benachrichtigungen überprüfen {#review-notifications}

Öffnen Sie die Benachrichtigungsansicht der App, um In-App-Ereignisse zu überprüfen. Folgen Sie einer Benachrichtigung an die zugehörige Ressource und überprüfen Sie den aktuellen Status, bevor Sie handeln. Eine ältere Benachrichtigung kann sich auf eine Aufgabe beziehen, die inzwischen abgeschlossen, abgebrochen oder ersetzt wurde.

Benachrichtigungen und E-Mail-Betreffer zeigen **Step succeeded** oder **Step failed** und **Request succeeded** oder **Request failed** an, wenn das Ergebnis bekannt ist. E-Mail-Betreffer fügen den Titel der Anfrage hinzu. Stornierte und ersetzte Anfragen haben unterschiedliche E-Mail-Betreffs. Andere Ereignisse verwenden **New task**, **Task completed**(zur automatischen Vervollständigung),**New message** und **New receipt**.

E-Mail-Links zielen auf die entsprechende Aufgaben-, Anforderungs-, Empfangs- oder Planseite. Melden Sie sich mit dem gewünschten Konto an, wenn Sie dazu aufgefordert werden.

Konto-, Workflow- und Rechnungs-E-Mails teilen sich die Fußzeile der App mit den Links „Startseite“, „App“, „Dokumente“, „Kontakt“, „Bedingungen“ und „Datenschutz“. Über der Fußzeile werden Sicherheitshinweise und Liefererklärungen angezeigt.

## Liefereinstellungen festlegen {#set-delivery-preferences}

1. Öffnen Sie **User profile → Notifications**.
2. Überprüfen Sie die Kategorien: **Request notifications**, **Task notifications**, **Chat notifications**, **Receipt notifications**, **Retention deletion reminders** und **Billing recovery reminders**.
3. Legen Sie die Schalter **In-app** und **Email** für jede unterstützte Kategorie fest.
4. Wählen Sie **Save**.

Kategorien ohne gespeicherte Einstellungen werden aktiviert. Ändern Sie einen Schalter und wählen Sie **Save**, um Ihre Präferenz zu speichern.

Die In-App-Option **Billing recovery reminders** ist deaktiviert; Seine E-Mail-Präferenz wird getrennt von anderen Kategorien verwaltet. Einstellungen erweitern Ihren Zugriff nicht und fügen Sie nicht zum Publikum einer Diskussion hinzu.**Retention deletion reminders** warnen Anforderungs- und Belegeigentümer vor der automatischen
Aufbewahrungsbereinigung. Ihre E-Mails verweisen auf Aufbewahrungseinstellungen und den
[Aufbewahrungs- und Löschleitfaden](retention.md). Durch das Deaktivieren dieser Kategorie wird
das Löschen der Aufbewahrungszeit nicht deaktiviert.

## Fehlende Nachrichten {#missing-messages}

Überprüfen Sie Ihre E-Mail-Adresse, Ihren Spam-Ordner, Ihre Benachrichtigungseinstellungen, Ihren ausgewählten Arbeitsbereich und ob Sie ein berechtigter Empfänger sind. Die E-Mail-Zustellung kann einige Zeit dauern.

Wenn Sie jetzt handeln müssen, öffnen Sie Aufgaben oder Anfragen direkt, anstatt auf eine E-Mail zu warten. Stellen Sie bei einem Zustellungsfehler Unterstützung mit der Ereigniszeit und dem Ressourcenkontext bereit, ohne Anmeldeinformationen weiterzugeben.

## E-Mail-Tokens {#email-tokens}

Workflow-E-Mails, einschließlich Aufbewahrungserinnerungen, verbrauchen Token pro Empfänger und werden dem ursprünglichen Arbeitsbereich in Rechnung gestellt. Tokens werden vor dem Senden überprüft und belastet, wenn der E-Mail-Anbieter den Versand akzeptiert. Durch das Einreihen einer Benachrichtigung in die Warteschlange werden keine Token verbraucht. Deaktivierte E-Mail-Zustellungen werden nicht berechnet. Sicherheit, Kontowiederherstellung und Rechnungs-E-Mails sind ohne Workspace-Token-Gebühr enthalten. Siehe [Nutzung und Token](usage.md).
