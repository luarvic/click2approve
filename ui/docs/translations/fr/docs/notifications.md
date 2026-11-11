---
title: Gérer les e-mails d'approbation et les notifications dans l'application
description: Choisissez les notifications par e-mail et dans l'application pour les demandes d'approbation, les tâches, le chat et les reçus. Recherchez les paramètres de livraison et vérifiez quoi faire lorsqu'un message est manquant.
---
# E-mails d'approbation et notifications dans l'application {#notifications}

Les notifications vous aident à revenir aux tâches assignées, aux résultats des demandes, aux discussions, aux reçus et aux événements de facturation. Définissez les préférences de livraison séparément pour chaque catégorie.

## Examiner les notifications {#review-notifications}

Ouvrez la vue des notifications de l'application pour inspecter les événements dans l'application. Suivez une notification à la ressource associée et vérifiez l'état actuel avant d'agir. Une notification plus ancienne peut faire référence à une tâche qui a depuis été terminée, annulée ou remplacée.

Les notifications et les objets des e-mails affichent **Step succeeded** ou **Step failed** et **Request succeeded** ou **Request failed**, lorsque le résultat est connu. Les sujets de l'e-mail ajoutent le titre de la demande. Les demandes annulées et remplacées ont des objets de courrier électronique distincts. D'autres événements utilisent **New task**, **Task completed**(pour l'achèvement automatique),**New message** et **New receipt**.

Les liens de courrier électronique ciblent la tâche, la demande, le reçu ou la page Plans concernée. Connectez-vous avec le compte souhaité lorsque vous y êtes invité.

Les e-mails de compte, de flux de travail et de facturation partagent le pied de page de l'application avec les liens Accueil, Application, Docs, Contact, Conditions et Confidentialité. Les avis de sécurité et les explications de livraison apparaissent au-dessus du pied de page.

## Définir les préférences de livraison {#set-delivery-preferences}

1. Ouvrez **User profile → Notifications**.
2. Passez en revue les catégories : **Request notifications**, **Task notifications**, **Chat notifications**, **Receipt notifications**, **Retention deletion reminders** et **Billing recovery reminders**.
3. Définissez les commutateurs **In-app** et **Email** pour chaque catégorie prise en charge.
4. Choisissez **Save**.

Les catégories sans préférences enregistrées sont activées. Modifiez un commutateur et choisissez **Save** pour enregistrer vos préférences.

L'option **Billing recovery reminders** dans l'application est désactivée ; sa préférence de courrier électronique est gérée séparément des autres catégories. Les préférences n'étendent pas votre accès et ne vous ajoutent pas à l'audience d'une discussion.**Retention deletion reminders** avertit les propriétaires de demandes et de reçus avant le nettoyage automatique
de la rétention. Leurs e-mails renvoient aux paramètres de conservation et au
[guide de conservation et de suppression](retention.md). La désactivation de cette catégorie ne désactive pas la suppression de la rétention
.

## Messages manquants {#missing-messages}

Vérifiez votre adresse e-mail, votre dossier spam, vos préférences de notification, l'espace de travail sélectionné et si vous êtes un destinataire éligible. La livraison des e-mails peut prendre du temps.

Si vous devez agir maintenant, ouvrez directement les tâches ou les demandes plutôt que d'attendre un e-mail. En cas d'échec de livraison, fournissez une assistance avec l'heure de l'événement et le contexte des ressources sans partager les informations d'identification.

## Jetons d'e-mail {#email-tokens}

Les e-mails de workflow, y compris les rappels de rétention, consomment des jetons par destinataire, facturés à l'espace de travail d'origine. Les jetons sont vérifiés avant l'envoi et facturés lorsque le fournisseur de messagerie accepte l'envoi. La mise en file d'attente d'une notification ne consomme pas de jetons. Les livraisons d’e-mails désactivées ne sont pas facturées. Les e-mails de sécurité, de récupération de compte et de facturation sont inclus sans frais de jeton d'espace de travail. Voir [Utilisation et jetons](usage.md).
