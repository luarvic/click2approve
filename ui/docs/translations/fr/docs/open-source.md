---
title: Système d'approbation de documents open source
description: Auto-hébergé Click2Approve, un système d'approbation de documents gratuit sous licence MIT avec des flux de travail en plusieurs étapes, plusieurs réviseurs et des signatures électroniques. Comparez les éditions.
---
# Système d'approbation de documents open source {#open-source-document-approval-system}

Click2Approve est un système d'approbation de documents open source gratuit sous licence MIT que vous pouvez héberger sur votre propre infrastructure. Téléchargez des documents, attribuez des réviseurs par adresse e-mail et suivez leurs décisions via un flux de travail d'approbation en plusieurs étapes. Vous pouvez demander des signatures électroniques et exiger des commentaires lorsqu'une tâche nécessite une explication.

L'édition open source prend en charge les comptes individuels et les flux de documents personnels pour un usage personnel ou commercial. Il n'y a pas de frais de licence Click2Approve ; vous couvrez vos frais d’infrastructure et de fournisseur. Consultez le [code source et les instructions d'auto-hébergement](https://github.com/luarvic/click2approve) pour commencer.

La version commerciale ajoute des espaces de travail d'organisation, des outils de collaboration et des contrôles d'utilisation et de conservation par abonnement. Les autres guides de ce portail décrivent le service commercial ; utilisez cette comparaison pour vérifier quelles fonctionnalités s'appliquent à l'édition open source.

## Exemple : examiner et approuver une proposition {#example-review-and-approve-a-proposal}

1. Téléchargez une proposition et ajoutez une étape d'approbation pour les personnes qui doivent l'examiner.
2. Choisissez si toutes les personnes affectées à l'étape doivent répondre ou si n'importe quel réviseur peut la terminer. Les étapes du workflow s'exécutent dans l'ordre, avec plusieurs personnes chargées d'agir au sein de chaque étape.
3. Ajoutez une étape de signature si la proposition nécessite également une signature électronique.
4. Suivez la progression de la demande et les décisions enregistrées à partir de **Requests**. Chaque participant trouve le travail qui lui est assigné dans **Tasks**.

Voir [Créer une demande](create-a-request.md) et [Configurer les étapes du flux de travail](workflow-steps.md) pour les contrôles du flux de travail. Les reçus partageables et la vérification des fichiers sont des fonctionnalités commerciales ; consultez la comparaison ci-dessous lors du choix d'une édition.

## Comparaison des fonctionnalités {#feature-comparison}

| Fonctionnalité | Open source | Commercial |
| --- | --- | --- |
| Personal requêtes et tâches avec fichiers téléchargés | Inclus | Inclus |
| Plusieurs étapes de flux de travail, destinataires en série ou parallèles et règles d'exécution toutes/toutes | Inclus | Inclus |
| Actions d'approbation, de signature, de confirmation, d'accusé de réception, de révision, de vérification, d'acceptation et d'achèvement | Inclus | Inclus |
| Commentaires et signatures électroniques requis | Inclus | Inclus |
| Suivi, annulation et suppression des demandes | Inclus | Inclus |
| Profils, signatures enregistrées, connexion par mot de passe, MFA et mots de passe | Inclus | Inclus |
| Notifications par e-mail et dans l'application | Inclus | Inclus |
| Espaces de travail de l'organisation, employés, rôles et employés affectés | Indisponible | Inclus |
| Équipes et responsables d'équipe | Indisponible | Inclus |
| Delegations | Indisponible | Inclus |
| Modèles de flux de travail d'organisation | Indisponible | Inclus |
| Discussions et pièces jointes aux discussions | Indisponible | Inclus |
| Pièces jointes aux réponses aux tâches et fichiers de réponses requis | Indisponible | Inclus |
| Demander des révisions et des comparaisons de fichiers entre les révisions | Indisponible | Inclus |
| Receipts, liens de vérification partageables et vérification de fichiers | Indisponible | Inclus |
| Jetons API pour les intégrations | Indisponible | Inclus |
| Plans d'abonnement, rapports d'utilisation des jetons et facturation | Indisponible | Inclus |
| Paramètres de rétention de l'espace de travail et nettoyage automatique de la rétention | Indisponible | Inclus |

Les fonctionnalités commerciales dépendent de votre espace de travail, de votre rôle, de votre participation et des limites du forfait. Voir [Fonctionnalités et disponibilité](features.md) pour les autorisations de l'espace de travail et [Forfaits et facturation](plans-and-billing.md) pour les abonnements. La livraison des e-mails dans une installation auto-hébergée nécessite un fournisseur de messagerie.

## Utilisez l'application open source {#use-the-open-source-app}

1. Inscrivez-vous ou connectez-vous avec votre compte.
2. Choisissez **New request**, téléchargez vos fichiers et configurez les étapes du flux de travail avec les adresses e-mail des destinataires. Voir [Créer une demande](create-a-request.md) et [Configurer les étapes du flux de travail](workflow-steps.md) pour les contrôles de flux de travail partagés.
3. Utilisez **Requests** pour suivre le travail que vous avez envoyé et **Tasks** pour effectuer les actions qui vous sont assignées. Voir [Terminer une tâche](complete-a-task.md) pour les commentaires et les signatures ; des pièces jointes de réponse sont disponibles dans la version commerciale.

La navigation dans l'organisation et les outils commerciaux sont cachés dans l'application open source. Vous pouvez gérer votre profil, votre signature enregistrée, vos préférences de notification, MFA et vos mots de passe via le menu du profil.

## Source et auto-hébergement {#source-and-self-hosting}

Consultez le [dépôt open source](https://github.com/luarvic/click2approve) pour le code source, la licence MIT, la configuration de Docker et les instructions d'auto-hébergement. Visitez le [service Click2Approve](../index.md) pour la version commerciale.
