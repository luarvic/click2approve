---
title: Correction des tâches d'approbation manquantes et des soumissions échouées
description: Recherchez les demandes ou les tâches manquantes et résolvez les problèmes d'approbation de documents dans Click2Approve, notamment les échecs de soumission, les problèmes de connexion et les liens de réception expirés.
---
# Dépannage des problèmes d'approbation de documents {#troubleshooting}

Si vous ne trouvez pas de tâche d'approbation, soumettez une demande ou ouvrez un lien de reçu, commencez par vérifier votre compte et l'espace de travail sélectionné. Ouvrez la demande ou la tâche pour vérifier son état actuel. Lisez ensuite le message d'erreur correspondant à l'action qui a échoué.

## Je ne trouve pas de demande ou de tâche {#i-cannot-find-a-request-or-task}

Les tâches adressées par e-mail apparaissent dans **Personal**. Les affectations des employés et des équipes apparaissent dans leur organisation. Vérifiez l'e-mail du compte, le statut de l'employé, l'appartenance à l'équipe et toute délégation. Une tâche peut également avoir été annulée, ignorée, terminée, remplacée ou supprimée.

Un lien de courrier électronique n'accorde pas l'accès à l'organisation. Voir [Espaces de travail et navigation](workspaces.md).

Si vous voyez **Page not found**, la page a peut-être été déplacée ou vous n'y avez peut-être pas accès. Sélectionnez **Home** pour revenir, puis vérifiez votre compte et votre espace de travail.

## Il manque un élément de menu ou une action {#a-menu-item-or-action-is-missing}

Vérifiez [Fonctionnalités et disponibilité](features.md). Les employés, les équipes, les délégations et les modèles nécessitent un espace de travail d'organisation. Votre rôle, votre forfait ou votre statut de facturation peuvent masquer ou désactiver les contrôles. Sélectionnez la bonne organisation et demandez à un propriétaire ou à un administrateur de vérifier votre accès.

## L'application se recharge après une mise à jour {#the-app-reloads-after-an-update}

L'application se recharge automatiquement lorsqu'elle détecte une nouvelle version et rouvre la page actuelle. Le texte que vous n'avez pas enregistré risque d'être perdu.

## La soumission ou l'achèvement de la tâche échoue {#submission-or-task-completion-fails}

Corrigez les champs en surbrillance et fournissez tous les commentaires, signatures et pièces jointes requis. Attendez la fin des téléchargements. Cochez [Utilisation](usage.md) si le message mentionne une allocation.

Actualisez la ressource avant de réessayer après une erreur API : un autre participant ou délégué l'a peut-être déjà complétée. Vérifiez les demandes ou les tâches pour déterminer si l'action d'origine a réussi avant de la répéter.

## Je ne peux pas réviser une demande {#i-cannot-revise-a-request}

La nouvelle soumission est disponible uniquement pour les demandes éligibles sans révision plus récente et sans résultat positif. Une nouvelle révision redémarre le flux de travail ; les décisions antérieures restent basées sur la révision précédente. Voir [Suivi et révision des demandes](track-requests.md).

## Un lien de vérification ne fonctionne pas {#a-verification-link-does-not-work}

Le lien peut avoir expiré, avoir été révoqué ou renvoyer à un reçu supprimé. Demandez un lien à jour au propriétaire du reçu. [Reçus et vérification](receipts.md).

## Je ne parviens pas à me connecter ou à recevoir des e-mails {#i-cannot-sign-in-or-receive-email}

Vérifiez si une confirmation par e-mail est requise et demandez un nouveau message de confirmation ou de réinitialisation du mot de passe si nécessaire. Inspectez le spam et l’adresse de votre compte. Pour MFA, essayez un code de récupération inutilisé ; pour les clés d'accès, essayez un appareil compatible enregistré ou connectez-vous par mot de passe.

Consultez [Inscription et connexion](sign-in.md), [MFA et clés d'accès](security.md) et [Notifications](notifications.md).

## L'espace de travail est bloqué pour le paiement {#the-workspace-is-blocked-for-payment}

Ouvrez **Plans** et suivez l'action de récupération du paiement avant la date limite affichée. Le propriétaire ou l'administrateur d'une organisation doit gérer les paiements de l'organisation. Voir [Forfaits et facturation](plans-and-billing.md).

## La suppression est bloquée {#deletion-is-blocked}

Lisez le message de dépendance. Un autre enregistrement peut toujours faire référence à l'employé, à l'équipe ou à l'entité de flux de travail. Vérifiez [Conservation et suppression](retention.md) avant de supprimer les enregistrements associés.

## Obtenez de l'aide ou signalez un bug {#get-help-or-report-a-bug}

Utilisez les liens **Report a bug** ou **Ask question** de l'application. Incluez les étapes de reproduction, le résultat attendu, le résultat réel, la durée approximative et le type d'espace de travail pertinent. Si une erreur API propose **Details**, examinez les informations de diagnostic et incluez uniquement ce qui est approprié pour le canal d'assistance.

Gardez les mots de passe, les jetons API, les codes de récupération, les liens de vérification et les documents privés hors des rapports publics. Pour des problèmes de compte, de messagerie, de sécurité ou de facturation, contactez l'assistance.
