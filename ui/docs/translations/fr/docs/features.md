---
title: Fonctionnalités d’approbation des documents et accès à l’espace de travail
description: Découvrez quelles fonctionnalités du Click2Approve fonctionnent dans les espaces de travail personnels et d'organisation, notamment les étapes d'approbation, les signatures, les équipes, les modèles et les reçus.
---
# Fonctionnalités d'approbation de documents et accès à l'espace de travail {#features-and-availability}

Click2Approve combine l'examen des documents, les étapes d'approbation, les signatures électroniques et le suivi des demandes. Utilisez **Personal**, votre espace de travail pour vos propres demandes et tâches adressées par e-mail, pour un travail individuel. Utilisez un espace de travail d'organisation pour les flux de travail d'entreprise partagés. Votre espace de travail, votre rôle et votre plan déterminent les actions que vous pouvez entreprendre.

Vous pouvez également connecter vos propres outils via le Click2Approve API. Consultez les [jetons API](api-tokens.md) pour créer des informations d'identification et authentifier les demandes d'intégration.

!!! info "Organisation uniquement"
    Les employés, les équipes, les délégations et les modèles de workflow appartiennent à des organisations. Sélectionnez une organisation dans le sélecteur d’espace de travail pour les utiliser. D'autres fonctionnalités de ce guide sont également disponibles dans Personal.

## Comment fonctionne l'approbation des documents {#how-document-approval-works}

1. [Créer une demande](create-a-request.md) avec les documents et instructions.
2. [Configurer les étapes du workflow](workflow-steps.md) pour choisir qui agit et dans quel ordre. Plusieurs personnes peuvent réviser en même temps.
3. Les participants ouvrent **Tasks** pour [enregistrer leurs décisions](complete-a-task.md). Une étape peut nécessiter un commentaire, une signature électronique ou un fichier de réponse.
4. Ouvrez **Requests** pour [vérifier la progression](track-requests.md). Une fois la demande terminée, [receipts](receipts.md) conserve son résultat et les actions enregistrées.

Par exemple, deux personnes peuvent examiner une proposition à la première étape, puis le client ajouter sa signature à une étape suivante. Activez **Require an electronic signature** dans cette étape si une signature dessinée est nécessaire.

## Référence de l'espace de travail {#workspace-reference}

| Fonctionnalité | Personal | Organisation |
| --- | --- | --- |
| Requests, tâches, étapes ordonnées et destinataires de courrier électronique | Disponible | Disponible |
| Commentaires et signatures électroniques requis | Disponible | Disponible |
| Discussions et pièces jointes aux discussions | Disponible | Disponible |
| Pièces jointes de réponse à la tâche | Disponible | Disponible |
| Demander des révisions | Disponible pour les demandes éligibles | Disponible pour les demandes éligibles |
| Employés et délégués d'employés | — | Disponible |
| Équipes et responsables d'équipe | — | Disponible |
| Delegations | — | Disponible |
| Modèles de flux de travail | — | Créez vos propres modèles et réutilisez-les partagés au sein de l'organisation |
| Reçus et liens de vérification | Afficher, partager et supprimer les reçus qui vous ont été délivrés | Chaque membre peut consulter, partager et supprimer les reçus qui lui sont délivrés |
| Plans, utilisation et conservation | Gérez votre propre forfait et vos paramètres | Les propriétaires et les administrateurs gèrent le plan et les paramètres |
| Profile, signature enregistrée, MFA, clés d'accès et jetons API | Paramètres du compte | Les mêmes paramètres de compte dans tous les espaces de travail |

## Autorisations de l'organisation {#organization-permissions}

Les membres peuvent consulter les répertoires des employés, des équipes et des délégations. Les propriétaires et les administrateurs gèrent les employés, les équipes, les délégations, la facturation et la fidélisation. Les modèles sont privés par défaut ; leurs créateurs peuvent les partager pour que d'autres membres de l'organisation puissent les consulter et les utiliser. Seul le créateur peut modifier ou supprimer un modèle. L'accès aux reçus est limité à l'utilisateur auquel chaque reçu est émis. Seul le propriétaire peut planifier la suppression de l'organisation.

L'accès à une demande ou à une tâche dépend de la participation, des relations d'équipe et de la délégation. L'adhésion à une organisation à elle seule n'expose pas tous les flux de travail ni n'accorde l'accès aux enregistrements d'une autre organisation.

Voir [Employés et rôles](employees.md) pour la référence du rôle et [Utilisation et limites](usage.md) pour les restrictions du plan. Ouvrez **Plans** pour connaître vos allocations actuelles et les choix de forfaits disponibles.
