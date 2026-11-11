---
title: Gérer les employés et les rôles de l'espace de travail d'approbation
description: Ajoutez des employés à une organisation Click2Approve et gérez leurs rôles et leurs accès. Comparez les autorisations d'utilisateur, d'administrateur et de propriétaire pour les flux de travail d'approbation.
---
# Employés et rôles {#employees-and-roles}

Les employés connectent les comptes d'utilisateurs à une organisation et fournissent les identités utilisées pour les affectations et les enregistrements d'audit.

!!! info "Organisation uniquement"
    Sélectionnez une organisation pour afficher ses employés. Les propriétaires et les administrateurs peuvent ajouter des employés et gérer leur accès.

## Ajouter un employé {#add-an-employee}

Les propriétaires et les administrateurs peuvent ouvrir **Employees**, créer un nouvel employé et saisir son adresse e-mail, son nom, son poste, son rôle et ses équipes. Enregistrez l'employé, puis vérifiez son statut.

L'e-mail identifie le compte qui doit recevoir l'accès des employés. Vérifiez-le avant de sauvegarder. Le nom de l'organisation et le poste d'un employé peuvent différer de son profil personnel.

Un employé dont l'adresse e-mail n'est pas encore enregistrée commence **Pending**. L'inscription avec cet e-mail active l'adhésion. L'ajout d'un compte déjà enregistré crée un employé **Active**.

## Rôles {#roles}

| Rôle | Autorisations de l'organisation |
| --- | --- |
| User (member) | Participez aux flux de travail autorisés, consultez les répertoires des employés, des équipes et des délégations, et gérez leurs propres modèles |
| Admin | Gérer les employés, les équipes, les délégations, la facturation et la fidélisation |
| Owner | Gestion administrative et autorité pour planifier la suppression d'organisations |

Les rôles n'accordent pas l'accès à d'autres organisations. La visibilité des demandes et des tâches suit également la participation, les relations d’équipe et la délégation. Les modèles sont privés par défaut et peuvent être partagés pour que d'autres membres de l'organisation puissent les consulter et les utiliser. Seul le créateur du modèle peut le modifier ou le supprimer, y compris lorsqu'un autre membre est propriétaire ou administrateur.

L'accès au reçu suit la propriété du reçu, quel que soit le rôle de l'employé. Les propriétaires et les administrateurs peuvent afficher, partager et supprimer uniquement les reçus qui leur ont été délivrés. Voir [Reçus et vérification](receipts.md).

## Statut de l'employé {#employee-status}

| Status | Signification |
| --- | --- |
| Pending | L'adhésion n'est pas encore active |
| Active | L'accès des employés est actif |
| Disabled | L'accès des employés a été désactivé |

Les propriétaires et les administrateurs peuvent modifier les détails des employés autorisés, les adhésions aux équipes et le paramètre **Active**. La désactivation de l'accès est utile lorsqu'une personne ne doit plus agir pour l'organisation.

## Supprimer un employé {#remove-an-employee}

Utilisez l'action de suppression disponible uniquement lorsque l'employé doit être supprimé. Les références existantes peuvent empêcher la suppression ; lisez le message de validation et résolvez d'abord la relation pertinente. La désactivation de l'accès peut être appropriée lorsque les relations historiques doivent être conservées.

Avant de modifier l'adhésion, examinez les [équipes](teams.md) et les [délégations](delegations.md) qui dépendent de cet employé.
