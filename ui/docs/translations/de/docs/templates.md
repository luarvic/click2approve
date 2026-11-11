---
title: Verwenden Sie Workflow-Vorlagen für die Dokumentgenehmigung wieder
description: Speichern Sie Genehmigungsschritte und Teilnehmer als Vorlage in einer Organisation. Starten Sie neue Anfragen aus Ihren Vorlagen und überprüfen Sie jedes Mal die Dateien und Beauftragten.
---
# Workflow-Vorlagen für die Dokumentgenehmigung wiederverwenden {#workflow-templates}

Verwenden Sie Workflow-Vorlagen, wenn Sie Dokumente häufig durch denselben Genehmigungsprozess senden. Eine Vorlage speichert Anfrageschritte und Teilnehmer innerhalb einer Organisation. Sie fügen die aktuellen Dokumente hinzu, wenn Sie jede Anfrage erstellen.

Speichern Sie beispielsweise einen Schritt zur Angebotsprüfung, gefolgt von einem Signierschritt. Wiederholen Sie diese Schritte für den nächsten Vorschlag und überprüfen Sie dann die Prüfer, den Unterzeichner und die Dateien, bevor Sie sie einreichen.

Jede Vorlage gehört der Person, die sie erstellt. Vorlagen sind standardmäßig privat. Wählen Sie **Shared** aus, damit andere aktive Mitglieder derselben Organisation eine Vorlage anzeigen und verwenden können. Nur der Ersteller kann es bearbeiten oder löschen, auch wenn ein anderes Mitglied Eigentümer oder Administrator ist.

!!! info "Nur Organisation"
    Wählen Sie eine Organisation aus, um Workflow-Vorlagen zu erstellen und wiederzuverwenden. Vorlagen gehören zu dieser Organisation und sind in Personal nicht verfügbar.

## Erstellen Sie eine Vorlage {#create-a-template}

Öffnen Sie **Templates** in der Organisation und erstellen Sie eine Vorlage mit einem beschreibenden Namen und wiederverwendbaren Schritten. Konfigurieren Sie Aktionen, Anweisungen, Beauftragte, Abschlussregeln, Sichtbarkeit und zusätzliche Anforderungen und speichern Sie sie dann.

Wählen Sie **Shared** aus, wenn andere Organisationsmitglieder es wiederverwenden sollen. Lassen Sie es deaktiviert, um die Vorlage privat zu halten. In der Vorlagenliste werden **Shared** und **Owner** angezeigt, damit Sie verfügbare Workflows und ihre Ersteller identifizieren können.

Namen freigegebener Vorlagen müssen innerhalb der Organisation eindeutig sein. Die Namen privater Vorlagen müssen innerhalb Ihrer eigenen privaten Vorlagen in dieser Organisation eindeutig sein. Sie können sowohl eine freigegebene **Budget**-Vorlage als auch eine private **Budget**-Vorlage besitzen. Auch das Umbenennen einer Vorlage oder das Ändern von **Shared** muss diese Regeln erfüllen.

Beim Erstellen einer neuen Anfrage in einer Organisation ohne Vorlage erstellt **Save template** eine private Vorlage aus Titel, Beschreibung und Schritten. Es werden dieselben Regeln zur Vorlagenvalidierung angewendet und eine vorhandene Vorlage wird nicht überschrieben. Wenn der Titel mit einem Ihrer privaten Vorlagennamen in Konflikt steht, wählen Sie vor dem Speichern einen anderen Titel. Überprüfen Sie, was Sie speichern: Eine Workflow-Vorlage speichert die Schrittkonfiguration und nicht eine abgeschlossene Anfrage oder ihre aufgezeichneten Entscheidungen.

## Starten Sie eine Anfrage aus einer Vorlage {#start-a-request-from-a-template}

1. Wählen Sie **New request** in derselben Organisation.
2. Wählen Sie **From template**, wählen Sie eine Ihrer Vorlagen oder eine freigegebene Organisationsvorlage und fahren Sie fort.
3. Geben Sie den Titel, die Beschreibung und die aktuellen Dokumente der Anfrage ein.
4. Überprüfen Sie jeden Teilnehmer und Schritt, bevor Sie **Submit** auswählen.

Vorlagen bieten eine Startkonfiguration. Prüfen Sie, ob Mitarbeiter und Teams noch für die neue Anfrage geeignet sind. Gehen Sie nicht davon aus, dass eine Vorlage die Dateien für eine bestimmte Transaktion bereitstellt.

Der Picker gruppiert **Private templates** und **Shared templates** separat. Wählen Sie den Namen aus der entsprechenden Gruppe, wenn beide eine Vorlage mit demselben Namen enthalten.

Der Editor lädt die Vorlage, bevor Sie mit der Bearbeitung beginnen. Sein Name und seine Beschreibung liefern den ersten Anforderungstext. Ändern Sie sie vor dem Absenden für die aktuelle Anfrage.

## Vorlagen pflegen {#maintain-templates}

Öffnen Sie **Templates**, um Ihre wiederkehrenden Anweisungen und Teilnehmerauswahlen zu aktualisieren. Jedes aktive Organisationsmitglied kann seine eigenen Vorlagen erstellen und verwalten. Durch das Bearbeiten einer Vorlage werden bereits übermittelte Anfragen nicht geändert.

Von anderen Mitgliedern geteilte Vorlagen werden in einer schreibgeschützten Ansicht geöffnet. Bitten Sie den Ersteller, die Vorlage zu aktualisieren, wenn sich die wiederverwendbaren Schritte ändern müssen. Durch das Löschen von **Shared** wird der Zugriff anderer Mitglieder auf die Vorlage entfernt. Bereits daraus erstellte Anfragen behalten ihren kopierten Workflow.**Save template** ist nur für benutzerdefinierte neue Anfragen verfügbar. Um eine vorhandene Vorlage zu ändern, verwenden Sie **Templates**. Von einer Vorlage gestartete Anforderungen und Anforderungsrevisionen bieten **Save template** nicht an.

Entfernen Sie nicht verwendete Vorlagen mit der verfügbaren Löschaktion. Wenn das Löschen durch einen Verweis blockiert wird, befolgen Sie die Validierungsmeldung, anstatt es wiederholt zu versuchen.
