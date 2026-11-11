---
title: Créer une demande d'approbation de document
description: Envoyez les documents pour approbation dans Click2Approve. Ajoutez des fichiers, choisissez des réviseurs, définissez les étapes du flux de travail et soumettez une demande depuis un personnel ou une organisation.
---
# Créer une demande d'approbation de document {#create-a-request}

Pour envoyer un document pour approbation, créez une **demande**. Il contient les fichiers à examiner, les instructions et les étapes indiquant à chaque participant quoi faire. Vous pouvez demander une approbation, une révision ou une signature électronique.

Choisissez d'abord le bon espace de travail. Utilisez **Personal**, votre espace de travail pour vos propres demandes, pour envoyer du travail en votre propre nom. Sélectionnez une organisation pour envoyer du travail en son nom. Votre espace de travail détermine à qui appartient la demande et quels types de destinataires vous pouvez utiliser. Une **personne** est une personne ou une équipe à qui vous demandez d'agir sur une étape.

## Composez la demande {#compose-the-request}

1. [Ouvrez l'application](/app/), sélectionnez votre espace de travail et choisissez **New request** en haut du groupe **Work** dans le menu principal.
2. Dans une organisation, choisissez **Custom** ou **From template**. Pour un modèle, sélectionnez-le et passez à l'éditeur de requêtes.
3. Saisissez un **Title** spécifique, tel que « Approuver le contrat fournisseur mis à jour ».
4. Ajoutez un **Description** expliquant l'objectif, le contexte et le résultat attendu.
5. Joignez les [fichiers que les participants devraient examiner](files.md).
6. Ajoutez et configurez les [étapes du workflow](workflow-steps.md).

La carte **Request details** regroupe le titre,**Files to review** et la description. Configurez les étapes du workflow en dessous.

Les requêtes Personal utilisent des destinataires par courrier électronique.

!!! info "Destinataires de l'organisation"
    Dans une organisation, vous pouvez également attribuer des étapes aux employés et aux équipes de cette organisation.

## Exemple : envoyer une proposition pour approbation et signature {#example-send-a-proposal-for-approval-and-signature}

1. Ajoutez la proposition sous **Files to review**.
2. Ajoutez une étape avec **Action** défini sur **Approve**, puis ajoutez l'adresse e-mail du réviseur.
3. Choisissez **Add step** et définissez son **Action** sur **Sign**. Ajoutez l'adresse e-mail du client et activez **Require an electronic signature**.
4. Écrivez **Instructions** pour chaque étape afin que les deux personnes sachent quoi vérifier.

Le client reçoit une tâche une fois l'étape d'approbation réussie. Si plusieurs personnes doivent d'abord approuver, ajoutez-les à l'étape d'approbation et activez **All assignees must complete**. Voir [Configurer les étapes du flux de travail](workflow-steps.md) pour les règles d'achèvement.

## Examinez et soumettez {#review-and-submit}

Vérifiez les fichiers, l'ordre des étapes, l'action, les instructions, les participants, la règle d'achèvement, la visibilité et les exigences supplémentaires. Si vous avez besoin d'une signature dessinée, cochez **Require an electronic signature**; le choix de l'action **Sign** seul ne l'active pas. Choisissez ensuite **Submit** et attendez la confirmation avant de quitter la page.

Si les champs sont en surbrillance, corrigez-les et soumettez à nouveau. Si une limite de plan bloque la soumission, inspectez [Utilisation](usage.md) ou demandez de l'aide au propriétaire ou à l'administrateur de votre organisation.

Si le nom de l'employé de votre organisation est incomplet, un avertissement explique comment il apparaîtra dans l'enregistrement. Choisissez **Go back** pour le corriger ou **Proceed anyway** pour soumettre avec le nom actuel. Les détails des employés de l'organisation sont gérés séparément de votre profil personnel.

Lors de la rédaction d'une nouvelle demande d'organisation personnalisée, **Save template** crée un modèle privé à partir du titre, de la description et des étapes. Il applique les règles de validation du modèle et ne remplace pas le dépôt de la demande. Les demandes lancées à partir de modèles et les demandes de révision ne proposent pas cette action. Voir [Modèles de workflow](templates.md).

## Après soumission {#after-submission}

Ouvrez **Requests** et sélectionnez la demande pour suivre sa progression. Les participants agissent au fur et à mesure que le flux de travail atteint leurs étapes. L'envoi des notifications suit les préférences de chaque destinataire.

Utilisez [Suivi et révision des demandes](track-requests.md) pour comprendre les résultats, les annulations et les révisions. Quitter ou annuler l'écran de rédaction annule les modifications sans demander de confirmation. Les brouillons de demande ne sont pas enregistrés.
