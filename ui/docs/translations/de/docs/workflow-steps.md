---
title: Konfigurieren Sie Workflow-Schritte für die Dokumentgenehmigung
description: Richten Sie Genehmigungsschritte der Reihe nach ein oder lassen Sie mehrere Prüfer gleichzeitig agieren. Wählen Sie alle oder einige Beauftragte, erforderliche Unterschriften, Kommentare und Anhänge aus.
---
# Schritte des Dokumentgenehmigungsworkflows konfigurieren {#configure-workflow-steps}

Ein Genehmigungsworkflow definiert, wer an einem Dokument in welcher Reihenfolge handelt. Ein **Zuständiger** ist eine Person oder ein Team, die einem Schritt zugewiesen ist. Schritte laufen nacheinander ab. Mehrere Beauftragte können am selben Schritt agieren.

Verwenden Sie **Add step**, um einen weiteren Schritt zu erstellen, die Pfeilsteuerelemente, um seine Reihenfolge zu ändern, und die Schaltfläche „Entfernen“, um ihn zu löschen.

## Sequentielle und parallele Genehmigungen {#sequential-and-parallel-approvals}

Verwenden Sie separate Schritte, wenn eine Entscheidung vor einer anderen erfolgen muss. Es handelt sich hierbei um eine **sequenzielle Genehmigung**. Beispielsweise genehmigt ein Prüfer ein Angebot in Schritt 1, dann unterzeichnet ein Kunde in Schritt 2.

Versetzen Sie Personen in denselben Schritt, wenn sie gleichzeitig prüfen können. Dies ist eine **parallele Genehmigung** innerhalb dieses Schritts. Die Schritte selbst werden weiterhin in der richtigen Reihenfolge ausgeführt.

| Sie brauchen… | Konfigurieren Sie den Workflow auf diese Weise |
| --- | --- |
| Ein Rezensent, gefolgt von einem anderen | Fügen Sie für jeden Prüfer einen separaten Schritt hinzu |
| Zwei Gutachter, die beide zustimmen müssen | Fügen Sie beide zu einem Schritt hinzu und aktivieren Sie **All assignees must complete** |
| Zustimmung einer oder mehrerer Personen | Fügen Sie sie einem Schritt hinzu und lassen Sie **All assignees must complete** deaktiviert |
| Genehmigung mit anschließender gezeichneter Unterschrift | Fügen Sie einen **Approve**-Schritt und dann einen **Sign**-Schritt mit aktiviertem **Require an electronic signature** hinzu. |

## Wählen Sie eine Aktion und Teilnehmer aus. {#choose-an-action-and-participants}

Wählen Sie für jeden Schritt eine **Action** und geben Sie klare **Instructions** an. Verfügbar sind Approve, Sign, Confirm, Acknowledge, Review, Verify, Accept und Complete. Wählen Sie die Aktion, die der benötigten Entscheidung entspricht.

Fügen Sie Beauftragte per E-Mail hinzu und überprüfen Sie die angezeigten Namen und Adressen vor dem Absenden.

!!! info "Beauftragte der Organisation"
    Wählen Sie in einer Organisation **Employee** oder **Team** aus, um Arbeit zuzuweisen innerhalb der aktuellen Organisation. Diese Beauftragtentypen sind in Personal nicht verfügbar.

## Erfordern Sie alle oder jeden Beauftragten {#require-everyone-or-any-assignee}

Aktivieren Sie **All assignees must complete**, um eine erfolgreiche Antwort von jedem Beauftragten zu verlangen. Wenn diese Option deaktiviert ist, schließt eine erfolgreiche Antwort den Schritt ab und überspringt die anderen ausstehenden Aufgaben. Der Schalter erscheint, wenn ein Schritt mehrere Beauftragte oder eine Teamzuweisung hat.

Eine negative Entscheidung stoppt die Anfrage mit einem erfolglosen Ergebnis, selbst wenn **All assignees must complete** deaktiviert ist. Mit dieser Option können andere Beauftragte eine Ablehnung nicht außer Kraft setzen.

Verwenden Sie beispielsweise einen Schritt für zwei Prüfer, die beide handeln müssen, gefolgt von einem separaten Unterzeichnungsschritt. Verwenden Sie die Option „Beliebiger Beauftragter“, wenn ein verfügbarer Teilnehmer die erforderliche Entscheidung treffen kann.

## Zusätzliche Anforderungen {#additional-requirements}

Die Abschnitte **Additional requirements** und **Visibility** bleiben in jedem Schritt sichtbar, während Sie eine Anfrage erstellen oder überarbeiten oder eine Vorlage bearbeiten. Überprüfen Sie ihre Einstellungen, bevor Sie sie speichern oder senden.

Aktivieren Sie die Anforderungen, die der Teilnehmer erfüllen muss:

- **Require a comment** zum Sammeln einer Erklärung.
- **Require an electronic signature** zum Sammeln von Unterschriftsdetails und einer gezeichneten Unterschrift.
- **Require an attachment** zum Sammeln einer Antwortdatei.

Die Aktionsbezeichnung und die Anforderung der elektronischen Signatur sind separate Einstellungen. Aktivieren Sie die Signaturanforderung, wenn eine gezeichnete Signatur erforderlich ist. Überprüfen Sie die Anforderungen zusammen mit der ausgewählten Aktion, damit die Teilnehmer wissen, was sie bereitstellen müssen. Siehe [Eine Aufgabe abschließen](complete-a-task.md).

## Schrittsichtbarkeit {#step-visibility}

Der Anforderer und die direkten Beauftragten eines Schritts können diesen Schritt immer sehen, einschließlich der E-Mail-Beauftragten. **Visibility** steuert, wer sonst noch seine Details und Antwortanhänge sehen kann:

| Einstellung | Zusätzliche Zielgruppe |
| --- | --- |
| All participants | Teilnehmer mit Zugriff auf die Anfrage |
| Assignees and organization participants | Organisationsteilnehmer; verfügbar für Organisationsworkflows |
| Assignees only | Keine zusätzlichen Teilnehmer |

E-Mail-Zuweisungen bleiben im Personal-Arbeitsbereich des Empfängers, auch wenn seine E-Mail einem Mitarbeiter der Organisation gehört. Zugewiesene Schritte bleiben im Workflow sichtbar, für den Schritt-Chat verfügbar und in der Quittung des Empfängers enthalten.

Diese Einstellungen gewähren keine Workspace-Mitgliedschaft oder Zugriff auf nicht verwandte Anfragen. Wählen Sie eine eingeschränkte Einstellung, wenn andere Teilnehmer die Details des Schritts nicht benötigen.

## Überarbeitungen {#revisions}

Wenn Sie [eine Anfrage erneut einreichen](track-requests.md), überprüfen und bearbeiten Sie die Schritte für die neue Revision. Der Arbeitsablauf beginnt wieder beim ersten Schritt; Frühere Entscheidungen bleiben in der vorherigen Revision und ihren Belegen erfasst. Speichern Sie die Schritte für häufig verwendete Organisationsworkflows als [Vorlage](templates.md).
