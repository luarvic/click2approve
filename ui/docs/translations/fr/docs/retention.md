---
title: Conservation et suppression des enregistrements d'approbation
description: Découvrez combien de temps Click2Approve conserve les demandes, les reçus et les fichiers. Passez en revue les paramètres de conservation et ce qui se passe lorsque vous supprimez un enregistrement ou une organisation.
---
# Conservation et suppression {#retention-and-deletion}

Choisissez la durée de conservation des demandes, des reçus et des notifications dans chaque espace de travail. Les contrôles de suppression dépendent de la ressource et de vos autorisations.

## Définir la rétention {#set-retention}

1. Sélectionnez l'espace de travail et ouvrez **Retention**.
2. Consultez les périodes **Requests**, **Receipts** et **Notifications** sur les forfaits gratuits et d'essai, ou **Requests and receipts** et **Notifications** sur les forfaits payants. Les valeurs intermédiaires du curseur apparaissent dans une petite bulle au-dessus de la poignée du curseur ; les points de terminaison sont **1 month** et **Never delete**.
3. Si votre forfait et vos autorisations autorisent les modifications, choisissez une période pour chacun et sélectionnez **Save**.

Les utilisateurs de Personal gèrent leurs propres paramètres ; les propriétaires et administrateurs gèrent ceux de leur organisation. Personal Free et Business Trial conservent les demandes et notifications un mois. Les reçus sont conservés cinq ans avec Personal Free et un mois avec Business Trial, à compter de leur création. Les forfaits payants permettent de configurer **Requests and receipts** et **Notifications**, y compris **Never delete**.

Lorsque l'essai gratuit ou Business de Personal devient actif, les deux périodes passent automatiquement à un mois, y compris un paramètre **Never delete** précédent. Une rétrogradation planifiée conserve vos paramètres de rétention actuels jusqu'à la fin de la période payante. Les demandes et notifications datant de plus d’un mois deviennent alors éligibles au nettoyage en arrière-plan. Le nettoyage des reçus suit la période de réception du plan actuel, y compris pour les reçus existants ; la mise à niveau avant le nettoyage peut prolonger leur rétention.

!!! warning "La rétention n'est pas une sauvegarde"
    Les enregistrements peuvent être supprimés par un nettoyage en arrière-plan après leur période de conservation. Choisissez une politique qui prend en charge vos besoins en matière de tenue de dossiers avant d'accumuler un historique de flux de travail important.

## Rappels de conservation {#retention-reminders}

Avant que les demandes et les reçus n'atteignent leur date limite de conservation, leurs propriétaires reçoivent
**Retention deletion reminders**. Le délai de préavis standard est d'une semaine. Chaque
rappel identifie l'enregistrement concerné et sa date de suppression. Les e-mails renvoient à cet enregistrement, aux paramètres de conservation de l'espace de travail et à ce guide.
Les rappels de demande sont envoyés au demandeur ; les rappels de reçu sont adressés uniquement au propriétaire du reçu.
Chaque demande ou reçu génère un rappel ; la modification de sa date limite de conservation
ne réinitialise pas ce rappel.

Gérez la livraison **In-app** et **Email** sous **User profile → Notifications → Retention deletion reminders**.
Les deux démarrent activés. La désactivation des rappels ne désactive pas le nettoyage de la rétention. Pour
conserver les enregistrements plus longtemps, modifiez la période de conservation si votre plan et vos autorisations
le permettent, ou contactez le propriétaire ou l'administrateur de votre organisation.
Les rappels par e-mail utilisent des [jetons d'e-mail de notification](usage.md) et nécessitent suffisamment de
jetons dans le espace de travail.

Les rappels suivent vos préférences de notification et vos tentatives de livraison normales.
Le nettoyage de rétention suit son calendrier configuré même si un rappel est désactivé
ou ne peut pas être envoyé. Les rappels s'appliquent à la conservation automatique des demandes et des reçus ;
le nettoyage des notifications, la suppression manuelle, la suppression de l'organisation et le nettoyage lié aux paiements
suivent leurs propres règles.

## Supprimer des enregistrements individuels {#delete-individual-records}

Utilisez l'action de suppression proposée pour une demande, une tâche, un reçu, un employé, une équipe, modèle ou délégation uniquement lorsque vous avez l’intention de supprimer cet enregistrement. Lisez la confirmation et tout message de validation.

Seul le propriétaire d'un reçu peut le supprimer manuellement. La suppression manuelle et le nettoyage de la conservation suppriment tous deux le reçu et ses liens de vérification. La suppression de votre reçu ne supprime pas la demande originale ni les reçus des autres participants. La suppression de la demande d'origine ne supprime pas ses reçus.

Une relation avec un autre enregistrement peut empêcher la suppression. Résolvez la relation identifiée, le cas échéant. Les tentatives répétées ne suppriment pas la dépendance.

Une requête avec une révision plus récente ne peut pas être supprimée tant que cette révision y fait référence. Commencez par la dernière révision lors de la suppression d’une chaîne de révision. Nettoyage des programmes de suppression ; attendez que cette révision soit supprimée avant de réessayer son prédécesseur.

La suppression d'une requête la rend immédiatement éligible au nettoyage en arrière-plan, quel que soit son âge. Les jetons précédemment consommés ne sont pas remboursés.

Les reçus préservent les métadonnées et les hachages des fichiers sans prolonger la conservation des pièces jointes. La suppression d'un reçu ne supprime ni ne planifie le nettoyage de ses pièces jointes d'origine.

Les fichiers associés aux enregistrements de flux de travail supprimés peuvent être programmés pour un nettoyage ultérieur, de sorte que leur contenu stocké et leur utilisation ne peuvent pas disparaître immédiatement. Les avatars de profil et les logos d'organisation peuvent être supprimés immédiatement lorsqu'ils sont remplacés ou supprimés.

## Supprimer une organisation {#delete-an-organization}

!!! warning "La suppression de l'organisation supprime l'accès immédiatement"
    Seul le propriétaire peut planifier la suppression de l'organisation. L'organisation disparaît immédiatement de la sélection de l'espace de travail et devient inaccessible ; le traitement en arrière-plan supprime ses données plus tard. Conservez les enregistrements requis avant de confirmer. Le délai de nettoyage n'est pas une option de récupération.

## Suppression liée au paiement {#payment-related-removal}

La suspension du paiement a sa propre date limite. Résolvez les échecs de paiement via [Plans](plans-and-billing.md) avant cette date limite. L'expiration supprime les organisations commerciales ; Les espaces de travail Personal perdent les données de flux de travail et reviennent à Personal Free tout en conservant leur identité et leur profil. Un paramètre de conservation ne remplace pas ce processus de récupération de la facturation.
