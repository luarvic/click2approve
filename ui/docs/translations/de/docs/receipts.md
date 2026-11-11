---
title: Ergebnisnachweise und Prüfung von Dokumentdateien
description: Öffnen Sie eine Aufzeichnung der Genehmigungsentscheidungen und Unterschriften von Dokumenten. Teilen Sie eine Quittung über einen Bestätigungslink und prüfen Sie, ob eine Datei mit der aufgezeichneten Kopie übereinstimmt.
---
# Ergebnisnachweise und Prüfung von Dokumentdateien {#receipts-and-verification}

Ein **Beleg** ist ein Datensatz, den Click2Approve erstellt, wenn eine Anfrage abgeschlossen ist. Es bewahrt die Anfragedetails, das Ergebnis und die aufgezeichneten Aktionen der Teilnehmer auf, einschließlich der Signaturen, sofern bereitgestellt. Verwenden Sie es, um zu sehen, wer gehandelt hat und welches Ergebnis aufgezeichnet wurde.

Sie können eine Quittung über einen Bestätigungslink teilen. Die Person mit dem Link kann den Datensatz überprüfen und prüfen, ob ihre Kopie eines Dokuments mit einer auf der Quittung aufgezeichneten Datei übereinstimmt.

!!! info "Wer kann Quittungen verwalten?"
    Nur der Benutzer, für den eine Quittung ausgestellt wurde, kann sie im Arbeitsbereich öffnen oder löschen und ihre Verifizierungslinks verwalten. Dies gilt sowohl für Personal als auch für Organisationen; Eigentümer und Administratoren können über ihre Rolle keine Belege anderer Personen öffnen.

Sobald eine Anfrage abgeschlossen, abgebrochen oder durch eine neue Überarbeitung ersetzt wird, erhalten der Anfragesteller und alle Personen, denen eine Aufgabe zugewiesen wurde, einen Ergebnisnachweis. Pro Person, Arbeitsbereich und Überarbeitung der Anfrage entsteht genau ein Nachweis, auch bei mehreren Aufgaben oder wenn die Person zugleich Anfragesteller ist. Die Aufgabe muss dafür nicht abgeschlossen sein; der gespeicherte Status unterscheidet eine Zuweisung von einer ausgeführten Handlung. Für Schritte, aus denen keine Aufgabe entstanden ist, wird kein Nachweis für die vorgesehenen Bearbeiter erstellt.

## Öffnen Sie einen Beleg {#open-a-receipt}

Öffnen Sie **Receipts** in dem Arbeitsbereich, in dem Sie die Anfrage gesendet oder Ihre Aufgabe abgeschlossen haben, und wählen Sie dann den Beleg für diese Anfrage aus. Der Kartenkopf **Receipt** enthält die Kurznummer, die passenden Anforderungs- und Aufgabenkartenköpfe. Auf der Karte werden die vollständige ID und das Datum angezeigt, gefolgt von den Abschnitten **Request** und **Task** mit den aufgezeichneten Details, Ergebnissen, Teilnehmern, Aktionen und Unterschriften, sofern vorhanden.

Die Abschnittsüberschriften **Request** und **Task** enthalten ihre Kurznummern sowohl in Workspace-Belegen als auch auf freigegebenen Verifizierungsseiten. Vollständige Anfrage- und Aufgaben-IDs bleiben in den aufgezeichneten Details erhalten, sofern verfügbar.

Empfangsdaten verwenden Ihr lokales Datum und Ihre lokale Uhrzeit ohne Sekunden. Leere Felder und die erste Revisionsnummer werden ausgeblendet.

Beim Drucken können die Abschnitte „Anfrage“ und „Aufgabe“ seitenübergreifend fortgesetzt werden. Abschnittsüberschriften bleiben in ihrer ersten Zeile und einzelne Detailzeilen und Signaturen bleiben zusammen, wenn sie auf eine Seite passen.

Eine Quittung bewahrt den aufgezeichneten Kontext der abgeschlossenen Arbeit. Durch die teilnehmerspezifische Sichtbarkeit können die in einer Quittung enthaltenen Schritte eingeschränkt werden. Eine Quittung ist von der Live-Anfrage getrennt.

## Erstellen Sie einen Bestätigungslink {#create-a-verification-link}

1. Öffnen Sie eine Quittung, die Sie verwalten können.
2. Wählen Sie **Share**.
3. Wählen Sie **New link**, legen Sie **Expires** fest und erstellen Sie den Link.
4. Wählen Sie den erstellten Link in der Liste aus, um dessen Bestätigungs-URL zu öffnen, kopieren Sie ihn dann und teilen Sie ihn mit dem vorgesehenen Empfänger.

Der QR-Code auf der Quittungskarte öffnet denselben Bestätigungslink. Wählen Sie das Click2Approve-Logo oder den Markennamen über der Karte aus, um die Startseite zu öffnen.

!!! warning "Jeder mit dem Link kann die Quittung anzeigen"
    Ein aktiver Verifizierungslink öffnet die Quittung, ohne dass eine Workspace-Mitgliedschaft erforderlich ist. Überprüfen Sie es, bevor Sie es teilen: Der Inhalt kann Namen, Entscheidungen und Unterschriften enthalten.

## Überprüfen Sie eine Datei {#verify-a-file}

Öffnen Sie eine Quittung in Ihrem Arbeitsbereich oder einen aktiven Bestätigungslink und wählen Sie **Verify file**. Wählen Sie Ihre Kopie des Dokuments aus. Ihr Browser berechnet seinen **SHA-256 hash**, einen Wert basierend auf dem Inhalt der Datei. Click2Approve vergleicht diesen Wert mit den auf der Quittung aufgezeichneten Hashes und zeigt an, ob die Datei mit einer Anforderungsdatei oder dem Antwortanhang eines Teilnehmers übereinstimmt. Diese Prüfung liest Ihre ausgewählte Datei im Browser; Diese Kopie wird nicht hochgeladen.

Wenn Ihnen beispielsweise jemand ein genehmigtes Angebot und den zugehörigen Empfangslink sendet, öffnen Sie den Link und verwenden Sie **Verify file**, um das Angebot zu überprüfen. Eine Datei mit geändertem Inhalt stimmt nicht mit dem aufgezeichneten Hash überein, selbst wenn ihr Dateiname derselbe ist.

Das Ergebnis erscheint über **Verify file**. **File verified** identifiziert den passenden Anhang und seine Anfrage oder Aufgabe.**File does not match** bedeutet, dass keine aufgezeichnete Datei denselben Hash hat. Überprüfen Sie, ob Sie die richtige Version ausgewählt haben, und versuchen Sie es erneut.

Die Überprüfung erfolgt anhand der Dateimetadaten und Hashes, die in der Quittung gespeichert sind. Es funktioniert immer noch, nachdem die ursprünglichen Anhänge entfernt wurden. Durch das Aufbewahren einer Quittung bleiben die gespeicherten Anhänge nicht erhalten.

Eine Übereinstimmung bestätigt, dass der Dateiinhalt mit einer aufgezeichneten Datei übereinstimmt. Es werden weder die Ansprüche des Dokuments bewertet noch die Identität des Unterzeichners unabhängig überprüft.

## Teilen Sie nicht weiter {#stop-sharing}

Wählen Sie unter **Share** den Link aus, wählen Sie **Remove** und bestätigen Sie, wenn der Zugriff nicht mehr erforderlich ist. Ein abgelaufener oder widerrufener Link stellt die Quittung nicht mehr bereit. Durch das Erstellen eines weiteren Links wird der Ablauf eines vorhandenen Links nicht verlängert.

Wenn die Überprüfung fehlschlägt, fragen Sie den Eigentümer der Quittung nach einem aktuellen Link. Öffentliche Verifizierungslinks bieten Zugriff auf diese Quittung, nicht auf die Anfragen, Aufgaben oder Verzeichnisse der Organisation.

## Quittungsaufbewahrung {#receipt-retention}

Die Hintergrundbereinigung entfernt Quittungen und ihre Verifizierungslinks gemäß der [Aufbewahrungsrichtlinie des Quittungsarbeitsbereichs](retention.md), gemessen ab der Quittungserstellung:

| Planen | Aufbewahrung von Quittungen |
| --- | --- |
| Personal Free | Fünf Jahre |
| Business Trial | Ein Monat |
| Bezahlte Pläne | Der konfigurierte **Requests and receipts**-Zeitraum, einschließlich **Never delete** |

Der Beleg eines persönlichen Beauftragten folgt den Richtlinien seines Personal-Arbeitsbereichs, unabhängig vom Plan der anfordernden Organisation. Durch die Änderung von Plänen ändern sich die Richtlinien für vorhandene Belege, die noch nicht entfernt wurden. Durch das Löschen der ursprünglichen Anfrage werden die zugehörigen Belege nicht gelöscht. Durch das Entfernen des Arbeitsbereichs und die zahlungsbezogene Bereinigung können Belege dennoch früher entfernt werden.

Ein Bestätigungslink ist keine unabhängige Sicherung des Belegs. Durch das Widerrufen eines Links wird die Freigabe beendet, ohne dass die Quittung gelöscht wird.

## Löschen Sie Ihre Quittung {#delete-your-receipt}

Wählen Sie **Delete** auf Ihrer Quittung aus und bestätigen Sie dann in **Delete receipt**. Dadurch werden Ihre Quittung und alle darin enthaltenen Verifizierungslinks dauerhaft entfernt. Der ursprüngliche Antrag oder die an andere Teilnehmer ausgestellten Quittungen werden nicht gelöscht. Eigentümer und Administratoren können nur für sie selbst ausgestellte Belege löschen.

Um die Freigabe zu beenden und Ihren Beleg aufzubewahren, widerrufen Sie stattdessen dessen Bestätigungslinks.
