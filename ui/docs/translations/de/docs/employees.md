---
title: Verwalten Sie Mitarbeiter und Genehmigungsarbeitsbereichsrollen
description: Fügen Sie Mitarbeiter zu einer Click2Approve-Organisation hinzu und verwalten Sie deren Rollen und Zugriff. Vergleichen Sie Benutzer-, Administrator- und Besitzerberechtigungen für Genehmigungsworkflows.
---
# Mitarbeiter und Rollen {#employees-and-roles}

Mitarbeiter verbinden Benutzerkonten mit einer Organisation und stellen die Identitäten bereit, die für Zuweisungen und Prüfdatensätze verwendet werden.

!!! info "Nur Organisation"
    Wählen Sie eine Organisation aus, um ihre Mitarbeiter anzuzeigen. Eigentümer und Administratoren können Mitarbeiter hinzufügen und deren Zugriff verwalten.

## Einen Mitarbeiter hinzufügen {#add-an-employee}

Eigentümer und Administratoren können **Employees** öffnen, einen neuen Mitarbeiter erstellen und dessen E-Mail-Adresse, Namen, Position, Rolle und Teams eingeben. Speichern Sie den Mitarbeiter und überprüfen Sie dann seinen Status.

Die E-Mail identifiziert das Konto, das Mitarbeiterzugriff erhalten soll. Überprüfen Sie es vor dem Speichern. Der Organisationsname und die Position eines Mitarbeiters können von seinem persönlichen Profil abweichen.

Ein Mitarbeiter, dessen E-Mail-Adresse noch nicht registriert ist, beginnt mit **Pending**. Durch die Registrierung mit dieser E-Mail wird die Mitgliedschaft aktiviert. Durch das Hinzufügen eines bereits registrierten Kontos wird ein **Active** Mitarbeiter erstellt.

## Rollen {#roles}

| Rolle | Organisationsberechtigungen |
| --- | --- |
| User (member) | Nehmen Sie an autorisierten Arbeitsabläufen teil, sehen Sie sich Mitarbeiter-, Team- und Delegationsverzeichnisse an und verwalten Sie ihre eigenen Vorlagen |
| Admin | Verwalten Sie Mitarbeiter, Teams, Delegationen, Abrechnung und Aufbewahrung |
| Owner | Administrative Verwaltung plus die Berechtigung, die Löschung von Organisationen zu planen |

Rollen gewähren anderen Organisationen keinen Zugriff. Die Sichtbarkeit von Anforderungen und Aufgaben folgt auch der Teilnahme, den Teambeziehungen und der Delegation. Vorlagen sind standardmäßig privat und können für andere Organisationsmitglieder zur Ansicht und Verwendung freigegeben werden. Nur der Ersteller der Vorlage kann sie bearbeiten oder löschen, auch wenn ein anderes Mitglied Eigentümer oder Administrator ist.

Der Zugriff auf den Beleg folgt dem Besitz des Belegs, unabhängig von der Mitarbeiterrolle. Eigentümer und Administratoren können nur für sie selbst ausgestellte Belege anzeigen, teilen und löschen. Siehe [Belege und Verifizierung](receipts.md).

## Mitarbeiterstatus {#employee-status}

| Status | Bedeutung |
| --- | --- |
| Pending | Die Mitgliedschaft ist noch nicht aktiv |
| Active | Mitarbeiterzugriff ist aktiv |
| Disabled | Der Mitarbeiterzugriff wurde deaktiviert |

Eigentümer und Administratoren können zulässige Mitarbeiterdetails, Teammitgliedschaften und die Einstellung **Active** bearbeiten. Das Deaktivieren des Zugriffs ist nützlich, wenn eine Person nicht mehr für die Organisation tätig sein soll.

## Einen Mitarbeiter entfernen {#remove-an-employee}

Verwenden Sie die verfügbare Löschaktion nur, wenn der Mitarbeiter entfernt werden soll. Vorhandene Verweise können eine Löschung verhindern; Lesen Sie zunächst die Validierungsnachricht und lösen Sie die entsprechende Beziehung auf. Das Deaktivieren des Zugriffs kann sinnvoll sein, wenn historische Beziehungen bestehen bleiben müssen.

Bevor Sie die Mitgliedschaft ändern, überprüfen Sie [Teams](teams.md) und [Delegationen](delegations.md), die von diesem Mitarbeiter abhängen.
