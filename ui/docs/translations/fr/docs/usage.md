---
title: Utilisation, jetons et limites de stockage des processus d’approbation
description: Découvrez quelles opérations Click2Approve consomment des jetons, comment le stockage est mesuré et ce qui se passe à la limite. Estimez un processus à partir d’un exemple.
---
# Utilisation et jetons {#usage-and-tokens}

Sélectionnez un espace et ouvrez **Usage** pour consulter son solde, sa période de facturation et son stockage occupé. Le tableau sous les indicateurs détaille les actions et leurs **Tokens used**, y compris les valeurs nulles. Les actions sont classées par consommation décroissante, puis par ordre alphabétique à égalité, sur les montants précis avant arrondi. Les indicateurs Tokens et Storage affichent l’utilisé et le disponible avec une barre de quota. Les jetons affichés sont arrondis à l’entier inférieur ; la comptabilité et les barres conservent les fractions.

## Quota mensuel {#monthly-allowance}

Chaque offre comprend des jetons. Personal Free se renouvelle mensuellement à partir de sa date initiale. Les offres payantes suivent la période payée et vérifiée. Business Trial reçoit un seul quota pour son mois d’essai. Les jetons inutilisés expirent sans report ni transfert entre espaces.

| Offre | Prix mensuel en USD, hors taxes | Jetons inclus | Stockage |
| --- | --- | --- | --- |
| Personal Free | $0 | 1 000 par mois | 1 GB |
| Personal Pro | $20 | 50 000 par mois | 10 GB |
| Business Trial | $0 pour un mois seulement | 10 000, une seule fois | 1 GB |
| Business Pro | $100 | 300 000 par mois | 100 GB |

## Opérations qui consomment des jetons {#what-uses-tokens}

Les tarifs sont les suivants :

| Action | Jetons |
| --- | --- |
| Téléverser un fichier | 1 par MB |
| Afficher ou télécharger un fichier | 2 par MB |
| E-mail de processus | 5 par destinataire |
| Envoyer ou renvoyer une demande | 10 |
| Créer une tâche | 2 par tâche |

Lire les détails ou listes, terminer une tâche et annuler une demande ne consomment pas de jetons. L’envoi et le renvoi ont le même tarif.

Les transferts utilisent le MB décimal, soit 1 000 000 d’octets. Les petits fichiers consomment des fractions sans arrondi systématique à un MB. Les aperçus transfèrent aussi des données. Une copie déjà en cache ne déclenche pas de transfert serveur supplémentaire. Les transferts réussis sont facturés sur les octets du document, sans la surcharge d’encodage des URL de données.

Demandes et tâches sont imputées à l’espace d’origine du processus, même si l’approbateur utilise sa boîte personnelle. Les fichiers des pages de tâche ou de discussion appartiennent à l’espace de la demande, qui paie leur transfert et leur stockage. Ceux d’une nouvelle demande appartiennent à l’espace sélectionné. Vérification du compte, réinitialisation du mot de passe, messages de sécurité et de facturation, et ressources publiques de marque ne consomment pas ces jetons.

## Exemple de processus {#example-workflow}

Avec 10 MB téléversés, 10 MB affichés ou téléchargés, cinq e-mails livrés à un destinataire chacun, une demande envoyée et cinq tâches créées, la consommation est de **75 jetons** :

| Activité | Calcul | Jetons utilisés |
| --- | --- | --- |
| Téléverser 10 MB | 10 × 1 | 10 |
| Afficher ou télécharger 10 MB | 10 × 2 | 20 |
| Cinq e-mails à un destinataire chacun | 5 × 5 | 25 |
| Envoyer une demande | 1 × 10 | 10 |
| Créer cinq tâches | 5 × 2 | 10 |
| **Total**| |**75** |

Terminer ces tâches ne consomme pas directement de jetons. Les transferts, e-mails, renvois et tâches des étapes suivantes sont facturés séparément aux tarifs ci-dessus.

## Facturation et solde insuffisant {#charging-and-insufficient-tokens}

Téléversements, téléchargements et e-mails vérifient le solde avant de démarrer, puis facturent le travail effectué. Les téléversements échoués et e-mails non envoyés ne sont pas facturés. Un téléchargement interrompu est facturé sur les octets transférés. Joindre ou supprimer un fichier déjà téléversé ne rembourse pas son coût.

Des opérations simultanées peuvent rendre le solde négatif. Les opérations payantes suivantes restent bloquées jusqu’au retour de jetons disponibles.

Des limites de débit et de concurrence protègent aussi le service. Réessayez ultérieurement en cas de limitation temporaire.

Si le solde est insuffisant, les nouvelles opérations facturées sont bloquées. Les demandes et tâches existantes restent accessibles, mais afficher des fichiers nécessite toujours des jetons. Terminer une tâche peut en créer pour l’étape suivante, au tarif de création de tâche. Consultez **Plans** pour vérifier votre quota. Supprimer une fiche ne rembourse pas les jetons consommés.

## Le stockage est une limite distincte {#storage-is-a-separate-limit}

Le stockage mesure les fichiers occupant actuellement de l’espace, y compris ceux en attente de nettoyage. Ce n’est pas un quota de téléversement mensuel. Conserver un fichier ne consomme pas d’autres jetons, mais occupe la capacité de l’offre jusqu’à sa suppression.

Choisissez la [durée de conservation](retention.md) selon vos besoins. Un changement d’offre planifié conserve les droits payants actuels jusqu’à sa prise d’effet. Une montée en gamme n’active les droits qu’après paiement vérifié ; ouvrir Checkout ne suffit pas.
