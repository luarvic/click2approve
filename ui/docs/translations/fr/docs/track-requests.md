---
title: Suivre l’état d’approbation et réviser les demandes
description: Vérifiez le statut d'approbation du document dans les demandes. Consultez les décisions enregistrées, annulez le travail actif ou utilisez Resoumettre pour lancer une demande éligible avec des fichiers révisés.
---
# Suivre le statut d'approbation et réviser les demandes {#track-and-revise-requests}

Pour vérifier le statut d'approbation d'un document, ouvrez **Requests** dans l'espace de travail propriétaire de la demande. Utilisez **Personal**, votre espace de travail pour vos propres demandes, pour le travail que vous avez envoyé personnellement. Pour le travail envoyé au nom d'une organisation, sélectionnez cette organisation.

Utilisez les filtres disponibles pour rechercher la demande, puis ouvrez ses détails pour examiner les fichiers, les étapes, les participants et les actions enregistrées. Pour les actions qui vous sont assignées, ouvrez plutôt **Tasks** ; voir [Terminer une tâche](complete-a-task.md).

## Lire la progression et les résultats {#read-progress-and-outcomes}

Les étapes du workflow apparaissent sous le résumé de la demande. Chaque en-tête d'étape affiche son numéro et son action, par exemple **Step 1 · Approve**. Développez l'en-tête pour voir la règle d'achèvement, la visibilité, les exigences et les responsables d'origine. Les icônes des responsables identifient les équipes, les employés et les adresses e-mail. Les cartes de tâches restent visibles lorsque vous réduisez les détails de l'étape.

Développez une tâche pour voir **Assigned via** si elle provient d'une affectation d'équipe. Un **Upcoming task** montre une personne dont la tâche n'a pas encore commencé.**From organization**, lorsqu'il est affiché sur une tâche, nomme son organisation enregistrée. Personal est un espace de travail, pas une organisation.

La puce d'état dans l'en-tête de chaque demande ou carte de tâche indique son état actuel, y compris lorsque la carte est réduite.

| État | Signification |
| --- | --- |
| Pending | Le travail soumis est en attente de progression |
| Started | Le workflow est en cours |
| Completed — Succeeded | Le workflow s'est terminé avec succès |
| Completed — Failed | Le workflow s'est terminé avec un résultat infructueux |
| Canceled | La requête a été arrêtée |
| Superseded | Une révision plus récente a remplacé cette demande |

Les actions de tâches individuelles peuvent avoir des étiquettes plus spécifiques, telles que Signé ou Rejeté. Une tâche ignorée ne signifie pas que le participant a pris une décision ; un autre résultat aurait peut-être déjà résolu l'étape. Les demandes automatiquement complétées et les tâches ignorées ou annulées affichent leur statut et leur heure d'achèvement sans champ **Completed by**.

## Annuler une demande {#cancel-a-request}

Ouvrez une demande en attente ou démarrée que vous êtes autorisé à gérer, choisissez **Cancel request** et confirmez. L'annulation arrête le flux de travail. Rouvrez la demande pour vérifier son état final avant de contacter les participants.

## Révisez et soumettez à nouveau {#revise-and-resubmit}

Révisez les demandes éligibles dans Personal ou dans une organisation.

Par exemple, un évaluateur peut choisir **Request changes** et expliquer qu'une proposition a le mauvais prix. Utilisez **Resubmit** pour remplacer la proposition et lancer une nouvelle révision. L'ajout d'un fichier à [Chat](discussions.md) ne remplace pas les fichiers de révision actuels de la demande.

1. Ouvrez une demande éligible et choisissez **Resubmit**.
2. Passez en revue les fichiers, les instructions et les étapes du flux de travail de la révision précédente.
3. Mettez à jour les fichiers, les instructions et les étapes pour la nouvelle révision.
4. Vérifiez les participants et choisissez **Submit**.

La nouvelle soumission crée une nouvelle révision et remplace la demande précédente. L'action est proposée uniquement sur les demandes éligibles en attente, démarrées ou terminées qui n'ont pas abouti et qui n'ont pas de révision plus récente. Une demande terminée avec succès ne peut pas être soumise à nouveau via cette action.

La nouvelle révision démarre son flux de travail à partir de la première étape. Les décisions antérieures restent enregistrées sur la révision précédente et ses récépissés ; ils n'effectuent pas les tâches dans la nouvelle révision. Passez en revue chaque étape et chaque participant avant de soumettre à nouveau.

Utilisez **Show revision changes**, le cas échéant, pour inspecter les fichiers ajoutés, remplacés et supprimés. Les fichiers remplacés ou supprimés restent le contexte de la révision et ne font pas partie des fichiers en cours à réviser.

## Préserver le résultat {#preserve-the-result}

[Receipts](receipts.md) enregistre le résultat de la demande et les actions enregistrées de chaque participant, sous réserve de visibilité des étapes. Ils sont créés lorsqu'une demande se termine, est annulée ou est remplacée par une nouvelle révision. Vérifiez la [conservation et suppression](retention.md) avant de supprimer une demande ou de recourir à un accès à long terme.

Une révision plus récente empêche la suppression de la demande à laquelle elle fait référence. Planifiez d'abord la suppression de la dernière révision, puis attendez le nettoyage en arrière-plan avant de supprimer son prédécesseur. La suppression d'une demande ne supprime pas les reçus des participants.
