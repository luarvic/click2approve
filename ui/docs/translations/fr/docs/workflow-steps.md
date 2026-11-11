---
title: Configurer les étapes d’un processus d’approbation documentaire
description: Organisez les étapes d’approbation ou faites intervenir plusieurs personnes dans une même étape. Définissez les réponses, signatures, commentaires et pièces jointes nécessaires.
---
# Configurer les étapes d’approbation des documents {#configure-workflow-steps}

Un processus d’approbation détermine qui intervient et dans quel ordre. Un **destinataire** est une personne ou une équipe affectée à une étape. Les étapes s’exécutent successivement ; plusieurs destinataires peuvent intervenir dans une même étape.

Utilisez **Add step** pour ajouter une étape, les flèches pour la déplacer et le bouton de suppression pour la retirer.

## Approbations successives et parallèles {#sequential-and-parallel-approvals}

Créez des étapes distinctes lorsqu’une décision doit en précéder une autre : c’est une **approbation séquentielle**. Par exemple, un relecteur approuve une proposition à l’étape 1, puis le client signe à l’étape 2.

Placez dans une même étape les personnes pouvant examiner le document simultanément : c’est une **approbation parallèle** dans cette étape. Les étapes restent successives.

| Besoin | Configuration |
| --- | --- |
| Une personne examine, puis une autre | Une étape distincte par personne |
| Deux personnes doivent approuver | Les réunir dans une étape et activer **All assignees must complete** |
| L’accord d’une personne parmi plusieurs suffit | Les réunir et laisser **All assignees must complete** désactivé |
| Une approbation suivie d’une signature dessinée | Une étape **Approve**, puis **Sign** avec **Require an electronic signature** activé |

## Choisir l’action et les participants {#choose-an-action-and-participants}

Pour chaque étape, choisissez une **Action** et rédigez des **Instructions** précises. Les actions proposées sont Approve, Sign, Confirm, Acknowledge, Review, Verify, Accept et Complete. Choisissez celle qui correspond à la décision à enregistrer.

Ajoutez les destinataires par e-mail et vérifiez les noms et adresses affichés avant l’envoi.

!!! info "Destinataires de l’organisation"
    Dans une organisation, choisissez **Employee** ou **Team** pour attribuer le travail à ses employés ou équipes. Ces types ne sont pas disponibles dans Personal.

## Exiger tous les destinataires ou un seul {#require-everyone-or-any-assignee}

Activez **All assignees must complete** pour exiger une réponse positive de chacun. Sinon, une seule réponse positive termine l’étape et ignore ses autres tâches en attente. L’option apparaît avec plusieurs destinataires ou une équipe.

Une décision négative termine la demande sans succès, même si **All assignees must complete** est désactivé. Les autres destinataires ne peuvent pas passer outre un refus.

Vous pouvez réunir deux relecteurs devant tous deux répondre, puis ajouter une étape de signature. Choisissez la règle « un seul suffit » lorsqu’un participant disponible peut fournir la décision attendue.

## Exigences supplémentaires {#additional-requirements}

Les sections **Additional requirements** et **Visibility** restent visibles dans chaque étape lors de la création, de la révision ou de la modification d’un modèle. Vérifiez-les avant de sauvegarder ou d’envoyer.

Activez les exigences utiles :

- **Require a comment** pour obtenir une explication.
- **Require an electronic signature** pour recueillir les informations de signature et un tracé.
- **Require an attachment** pour demander un fichier de réponse.

L’action et l’exigence de signature sont indépendantes. Activez cette dernière si une signature dessinée est nécessaire. Vérifiez l’ensemble pour que les participants sachent quoi fournir. Voir [Terminer une tâche](complete-a-task.md).

## Visibilité d’une étape {#step-visibility}

Le demandeur et les destinataires directs, y compris par e-mail, voient toujours l’étape. **Visibility** définit les autres personnes pouvant voir ses détails et les fichiers de réponse :

| Paramètre | Public supplémentaire |
| --- | --- |
| All participants | Les participants ayant accès à la demande |
| Assignees and organization participants | Les participants de l’organisation, pour ses processus |
| Assignees only | Aucun participant supplémentaire |

Une attribution par e-mail reste dans Personal du destinataire, même si celui-ci est employé d’une organisation. Les étapes attribuées restent visibles dans le processus, accessibles dans leur discussion et incluses dans le reçu du destinataire.

Ces réglages n’accordent ni adhésion à un espace ni accès aux autres demandes. Restreignez la visibilité lorsque les autres participants n’ont pas besoin des détails.

## Révisions {#revisions}

Lors d’un [nouvel envoi](track-requests.md), vérifiez et modifiez les étapes de la nouvelle révision. Le processus recommence à la première étape ; les anciennes décisions restent dans la révision précédente et ses reçus. Pour les processus récurrents d’une organisation, enregistrez les étapes comme [modèle](templates.md).
