---
title: Aufbewahrung und Löschung von Genehmigungsdatensätzen
description: Erfahren Sie, wie lange Click2Approve Anfragen, Belege und Dateien aufbewahrt. Überprüfen Sie die Aufbewahrungseinstellungen und was passiert, wenn Sie einen Datensatz oder eine Organisation löschen.
---
# Aufbewahrung und Löschung {#retention-and-deletion}

Wählen Sie, wie lange Anfragen, Belege und Benachrichtigungen in jedem Arbeitsbereich aufbewahrt werden sollen. Löschkontrollen hängen von der Ressource und Ihren Berechtigungen ab.

## Aufbewahrung festlegen {#set-retention}

1. Wählen Sie den Arbeitsbereich aus und öffnen Sie **Retention**.
2. Sehen Sie sich die Zeiträume **Requests**, **Receipts** und **Notifications** für kostenlose und Testpläne bzw.**Requests and receipts** und **Notifications** für kostenpflichtige Pläne an. Zwischenwerte des Schiebereglers werden in einer kleinen Blase über dem Schiebereglergriff angezeigt. Die Endpunkte sind **1 month** und **Never delete**.
3. Wenn Ihr Plan und Ihre Berechtigungen Änderungen zulassen, wählen Sie jeweils einen Zeitraum und dann **Save** aus.

Personal-Nutzer verwalten ihre eigenen Einstellungen; Eigentümer und Administratoren die ihrer Organisation. Bei Personal Free und Business Trial werden Anfragen und Benachrichtigungen einen Monat aufbewahrt. Ergebnisnachweise bleiben bei Personal Free fünf Jahre und bei Business Trial einen Monat ab Erstellung erhalten. Kostenpflichtige Tarife erlauben einstellbare Zeiträume für **Requests and receipts** und **Notifications**, einschließlich **Never delete**.

Wenn die kostenlose oder geschäftliche Testversion von Personal aktiv wird, ändern sich beide Zeiträume automatisch auf einen Monat, einschließlich einer vorherigen **Never delete**-Einstellung. Bei einem geplanten Downgrade bleiben Ihre aktuellen Aufbewahrungseinstellungen bis zum Ende des bezahlten Zeitraums erhalten. Anfragen und Benachrichtigungen, die älter als einen Monat sind, können dann im Hintergrund bereinigt werden. Die Belegbereinigung folgt dem Belegzeitraum des aktuellen Plans, auch für vorhandene Belege; Ein Upgrade vor der Bereinigung kann ihre Aufbewahrung verlängern.

!!! warning "Aufbewahrung ist kein Backup"
    Datensätze können nach ihrem Aufbewahrungszeitraum durch eine Hintergrundbereinigung entfernt werden. Wählen Sie eine Richtlinie, die Ihre Aufzeichnungsanforderungen unterstützt, bevor wichtige Workflow-Verläufe gesammelt werden.

## Aufbewahrungserinnerungen {#retention-reminders}

Bevor Anfragen und Belege ihre Aufbewahrungsfrist erreichen, erhalten ihre Besitzer
**Retention deletion reminders**. Die Regelkündigungsfrist beträgt eine Woche. Jede
Erinnerung identifiziert den betroffenen Datensatz und sein Löschdatum. E-Mails verweisen auf diesen Datensatz, die Aufbewahrungseinstellungen des Arbeitsbereichs und dieses Handbuch.
Anfrageerinnerungen gehen an den Anforderer; Quittungserinnerungen gehen nur an den Besitzer der Quittung.
Jede Anfrage oder Quittung generiert eine Erinnerung; Durch Ändern der Aufbewahrungsfrist
wird diese Erinnerung nicht zurückgesetzt.

Verwalten Sie die Zustellung **In-app** und **Email** unter **User profile → Notifications → Retention deletion reminders**.
Beide werden aktiviert. Durch das Deaktivieren von Erinnerungen wird die Aufbewahrungsbereinigung nicht deaktiviert. Um
Datensätze länger aufzubewahren, ändern Sie den Aufbewahrungszeitraum, wenn Ihr Plan und Ihre Berechtigungen
dies zulassen, oder wenden Sie sich an den Eigentümer oder Administrator Ihrer Organisation.
E-Mail-Erinnerungen verwenden [Benachrichtigungs-E-Mail-Tokens](usage.md) und erfordern ausreichend
Tokens im Arbeitsbereich.

Erinnerungen folgen Ihren Benachrichtigungseinstellungen und normalen Zustellungswiederholungen.
Die Aufbewahrungsbereinigung folgt dem konfigurierten Zeitplan, auch wenn eine Erinnerung deaktiviert ist
oder nicht zugestellt werden kann. Erinnerungen gelten für die automatische Aufbewahrung von Anfragen und Belegen.
Benachrichtigungsbereinigung, manuelle Löschung, Organisationslöschung und zahlungsbezogene
Bereinigung folgen ihren eigenen Regeln.

## Einzelne Datensätze löschen {#delete-individual-records}

Verwenden Sie die angebotene Löschaktion für eine Anfrage, Aufgabe, Quittung, einen Mitarbeiter, Team, Vorlage oder Delegation nur dann, wenn Sie beabsichtigen, diesen Datensatz zu entfernen. Lesen Sie die Bestätigung und alle Validierungsmeldungen.

Nur der Besitzer einer Quittung kann sie manuell löschen. Durch das manuelle Löschen und die Aufbewahrungsbereinigung werden die Quittung und ihre Verifizierungslinks zusammen entfernt. Durch das Löschen Ihrer Quittung werden weder die ursprüngliche Anfrage noch die Quittungen anderer Teilnehmer gelöscht. Durch das Entfernen der ursprünglichen Anfrage werden ihre Belege nicht entfernt.

Eine Beziehung aus einem anderen Datensatz kann das Löschen verhindern. Lösen Sie gegebenenfalls die identifizierte Beziehung auf. Durch wiederholte Wiederholungsversuche wird die Abhängigkeit nicht entfernt.

Eine Anfrage mit einer neueren Revision kann nicht gelöscht werden, solange diese Revision darauf verweist. Beginnen Sie mit der neuesten Revision, wenn Sie eine Revisionskette entfernen. Löschpläne, Bereinigung; Warten Sie, bis diese Revision entfernt wurde, bevor Sie es erneut mit der Vorgängerversion versuchen.

Durch das Löschen einer Anfrage ist sie sofort für die Hintergrundbereinigung berechtigt, unabhängig von ihrem Alter. Zuvor verbrauchte Token werden nicht erstattet.

Belege bewahren Dateimetadaten und Hashes, ohne die Aufbewahrung von Anhängen zu verlängern. Durch das Löschen einer Quittung werden die ursprünglichen Anhänge nicht gelöscht und auch nicht zur Bereinigung eingeplant.

Dateien, die mit gelöschten Workflow-Datensätzen verknüpft sind, können für eine spätere Bereinigung geplant werden, sodass ihr gespeicherter Inhalt und ihre Verwendung möglicherweise nicht sofort verschwinden. Profil-Avatare und Organisationslogos können sofort entfernt werden, wenn sie ersetzt oder gelöscht werden.

## Eine Organisation löschen {#delete-an-organization}

!!! warning "Durch das Löschen einer Organisation wird der Zugriff sofort entfernt"
    Nur der Eigentümer kann das Löschen einer Organisation planen. Die Organisation verschwindet sofort aus der Arbeitsbereichsauswahl und ist nicht mehr zugänglich; Die Hintergrundverarbeitung entfernt ihre Daten später. Bewahren Sie erforderliche Aufzeichnungen vor der Bestätigung auf. Die Bereinigungsverzögerung ist keine Wiederherstellungsoption.

## Zahlungsbedingte Entfernung {#payment-related-removal}

Die Zahlungsaussetzung hat ihre eigene Frist. Beheben Sie fehlgeschlagene Zahlungen über [Pläne](plans-and-billing.md) vor Ablauf dieser Frist. Ablauf entfernt Unternehmensorganisationen; Personal-Arbeitsbereiche verlieren Workflow-Daten und kehren zu Personal Free zurück, während Identität und Profil erhalten bleiben. Eine Aufbewahrungseinstellung setzt diesen Abrechnungswiederherstellungsprozess nicht außer Kraft.
