---
title: Récépissés d’approbation et vérification des dossiers de documents
description: Ouvrez un enregistrement des décisions d’approbation et des signatures des documents. Partagez un reçu via un lien de vérification et vérifiez si un fichier correspond à la copie enregistrée.
---
# Reçus d'approbation et vérification des fichiers de documents {#receipts-and-verification}

Un **reçu** est un enregistrement que Click2Approve crée lorsqu'une demande se termine. Il conserve les détails de la demande, le résultat et les actions enregistrées des participants, y compris les signatures lorsqu'elles sont fournies. Utilisez-le pour voir qui a agi et quel résultat a été enregistré.

Vous pouvez partager un reçu via un lien de vérification. La personne disposant du lien peut consulter le dossier et vérifier si sa copie d'un document correspond à un fichier enregistré sur le reçu.

!!! info "Qui peut gérer les reçus ?"
    Seul l'utilisateur auquel un reçu est émis peut l'ouvrir ou le supprimer dans l'espace de travail et gérer ses liens de vérification. Cela s'applique à la fois au Personal et aux organisations ; Les propriétaires et les administrateurs ne peuvent pas ouvrir les reçus d'autres personnes via leur rôle.

Le demandeur et chaque personne ayant reçu une tâche obtiennent un reçu lorsque la demande est terminée, annulée ou remplacée par une nouvelle révision. Chaque personne reçoit un seul reçu par espace de travail et par révision de la demande, même si elle a plusieurs tâches ou est aussi demandeur. Il n’est pas nécessaire d’avoir terminé la tâche : le statut enregistré distingue une attribution d’une action effectuée. Une étape qui n’a créé aucune tâche ne génère pas de reçu pour ses destinataires.

## Ouvrez un reçu {#open-a-receipt}

Ouvrez **Receipts** dans l'espace de travail où vous avez envoyé la demande ou terminé votre tâche, puis sélectionnez le reçu pour cette demande. L'en-tête de carte **Receipt** comprend son numéro court, ses en-têtes de demande correspondante et de carte de tâche. La carte affiche son identifiant complet et sa date, suivis des sections **Request** et **Task** avec les détails enregistrés, les résultats, les participants, les actions et les signatures le cas échéant.

Les en-têtes de section **Request** et **Task** incluent leurs numéros courts dans les reçus de l'espace de travail et les pages de vérification partagées. Les ID complets des demandes et des tâches restent dans les détails enregistrés lorsqu'ils sont disponibles.

Les dates de réception utilisent votre date et heure locales sans secondes. Les champs vides et le premier numéro de révision sont masqués.

Lors de l'impression, les sections Requête et Tâche peuvent continuer sur plusieurs pages. Les titres de section restent avec leur première ligne, et les lignes de détails individuelles et les signatures restent ensemble lorsqu'elles tiennent sur une page.

Un reçu préserve le contexte enregistré du travail réalisé. La visibilité spécifique au participant peut limiter les étapes incluses dans un reçu. Un reçu est distinct de la demande en direct.

## Créer un lien de vérification {#create-a-verification-link}

1. Ouvrez un reçu que vous pouvez gérer.
2. Sélectionnez **Share**.
3. Choisissez **New link**, définissez **Expires** et créez le lien.
4. Sélectionnez le lien créé dans la liste pour ouvrir son URL de vérification, puis copiez-le et partagez-le avec le destinataire prévu.

Le code QR à l'intérieur de la carte de réception ouvre le même lien de vérification. Sélectionnez le logo Click2Approve ou le nom de la marque au-dessus de la carte pour ouvrir la page d'accueil.

!!! warning "Toute personne disposant du lien peut voir le reçu"
    Un lien de vérification actif ouvre le reçu sans nécessiter d'adhésion à l'espace de travail. Vérifiez-le avant de le partager : son contenu peut inclure des noms, des décisions et des signatures.

## Vérifier un fichier {#verify-a-file}

Ouvrez un reçu dans votre espace de travail ou un lien de vérification actif et choisissez **Verify file**. Sélectionnez votre copie du document. Votre navigateur calcule son **SHA-256 hash**, une valeur basée sur le contenu du fichier. Click2Approve compare cette valeur avec les hachages enregistrés sur le reçu et indique si le fichier correspond à un fichier de demande ou à la pièce jointe de réponse d'un participant. Cette vérification lit votre fichier sélectionné dans le navigateur ; il ne télécharge pas cette copie.

Par exemple, si quelqu'un vous envoie une proposition approuvée et son lien de réception, ouvrez le lien et utilisez **Verify file** pour vérifier la proposition. Un fichier dont le contenu a été modifié ne correspondra pas au hachage enregistré, même si son nom de fichier est le même.

Le résultat apparaît au-dessus de **Verify file**. **File verified** identifie la pièce jointe correspondante et sa demande ou tâche.**File does not match** signifie qu'aucun fichier enregistré n'a le même hachage. Vérifiez que vous avez sélectionné la bonne version et réessayez.

La vérification utilise les métadonnées du fichier et les hachages conservés dans le reçu. Cela fonctionne toujours après la suppression des pièces jointes d'origine ; conserver un reçu ne conserve pas ces pièces jointes stockées.

Une correspondance confirme que le contenu du fichier correspond à un fichier enregistré. Il n'évalue pas les affirmations du document et ne vérifie pas de manière indépendante l'identité du signataire.

## Arrêtez de partager {#stop-sharing}

Sur **Share**, sélectionnez le lien, choisissez **Remove** et confirmez lorsque l'accès n'est plus nécessaire. Un lien expiré ou révoqué ne fournit plus le reçu. La création d'un autre lien ne prolonge pas l'expiration d'un lien existant.

Si la vérification échoue, demandez au propriétaire du reçu un lien actuel. Les liens de vérification publique donnent accès à ce reçu, et non aux demandes, tâches ou répertoires de l'organisation.

## Conservation des reçus {#receipt-retention}

Le nettoyage en arrière-plan supprime les reçus et leurs liens de vérification conformément à la [politique de conservation de l'espace de travail des reçus](retention.md), mesurée à partir de la création du reçu :

| Planifier | Conservation des reçus |
| --- | --- |
| Personal Free | Cinq ans |
| Business Trial | Un mois |
| Forfaits payants | La période **Requests and receipts** configurée, y compris **Never delete** |

Le reçu d'un destinataire personnel suit la politique de son espace de travail Personal, indépendamment du plan de l'organisation demandeuse. La modification des plans modifie la politique pour les reçus existants qui n'ont pas encore été supprimés. La suppression de la demande originale ne supprime pas ses reçus. La suppression de l'espace de travail et le nettoyage lié au paiement peuvent toujours supprimer les reçus plus tôt.

Un lien de vérification n'est pas une sauvegarde indépendante de sa réception. La révocation d'un lien arrête le partage sans supprimer le reçu.

## Supprimez votre reçu {#delete-your-receipt}

Sélectionnez **Delete** sur votre reçu, puis confirmez dans **Delete receipt**. Cela supprime définitivement votre reçu et tous ses liens de vérification. Il ne supprime pas la demande originale ni les reçus délivrés aux autres participants. Les propriétaires et les administrateurs peuvent supprimer uniquement les reçus qui leur ont été délivrés.

Pour arrêter le partage tout en conservant votre reçu, révoquez plutôt ses liens de vérification.
