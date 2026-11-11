---
title: Connectez les workflows d'approbation avec les jetons API
description: Créez un jeton API Click2Approve pour votre intégration, envoyez-le en tant que jeton Bearer et explorez la référence API. Découvrez comment fonctionnent les autorisations et la révocation des jetons.
---
# Jetons API pour les intégrations de flux de travail d'approbation {#api-tokens}

Utilisez le Click2Approve API pour connecter vos propres outils et automatiser les flux de travail d'approbation. Les jetons API permettent aux intégrations d'accéder au API via votre compte utilisateur. Gérez-les dans votre profil, que vous travailliez au sein de Personal ou dans une organisation.

## Créez un jeton {#create-a-token}

1. Ouvrez **User profile → API tokens**.
2. Choisissez **New API token**.
3. Entrez un nom reconnaissable et une date d'expiration si nécessaire.
4. Créez le jeton et copiez sa valeur avant de fermer la boîte de dialogue.
5. Stockez-le en toute sécurité pour l'intégration prévue.

!!! warning "Copier le jeton avant de fermer"
    La valeur complète n'est affichée qu'une seule fois. Stockez-le en toute sécurité et gardez-le à l'écart des messages, des captures d'écran et du contrôle de source. Si vous le perdez, créez un remplacement et révoquez l'ancien jeton.

## Explorez le API {#explore-the-api}

Ouvrez la [référence API (interface utilisateur Swagger)]({{ api_reference_url }}){target="_blank" rel="noopener noreferrer"} pour parcourir les points de terminaison, les champs de requête et les réponses.

Pour essayer une requête authentifiée, choisissez **Authorize**, collez votre jeton API sans le préfixe `Bearer` et confirmez. Swagger ajoute l'en-tête d'autorisation pour vous. Choisissez un point de terminaison, sélectionnez **Try it out**, remplissez les champs requis et sélectionnez **Execute**. Ces demandes utilisent votre compte et peuvent créer, modifier ou supprimer des données réelles.

Les points de terminaison de sécurité du compte nécessitent une session de connexion interactive et ne peuvent pas être utilisés avec les jetons API.

## Utilisez un jeton dans votre intégration {#use-a-token-in-your-integration}

Envoyez votre jeton dans le `Authorization` en-tête avec chaque requête API :

```http
Authorization: Bearer YOUR_API_TOKEN
```

Remplacez `YOUR_API_TOKEN` par la valeur que vous avez copiée lors de la création du jeton. Les jetons agissent avec les autorisations de votre compte. La création de jetons n'accorde pas l'accès au travail d'un autre utilisateur ou aux ressources d'une autre organisation ; l'autorisation s'applique toujours.

## Révoquer un jeton {#revoke-a-token}

Sélectionnez le jeton dans la liste, choisissez **Revoke** et confirmez. Mettez à jour toute intégration qui l'a utilisé avec un identifiant de remplacement. Révoquer les jetons et informations d'identification inutilisés dont vous soupçonnez qu'ils ont été exposés.

Les jetons API sont des paramètres de compte. Changer d'espace de travail ne crée pas un ensemble distinct de jetons.
