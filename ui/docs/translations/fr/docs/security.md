---
title: Configurer l'authentification MFA et les clés d'accès
description: Protégez votre compte Click2Approve avec une application d'authentification ou un mot de passe. Découvrez comment configurer MFA, enregistrer les codes de récupération et gérer les mots de passe enregistrés.
---
# MFA et clés d'accès {#mfa-and-passkeys}

Protégez votre compte Click2Approve avec l'**authentification multifacteur (MFA)** ou une **clé d'accès**. Avec l'authentificateur MFA, vous saisissez un code provenant d'une application d'authentification après votre mot de passe. Une clé d'authentification vous permet de vous connecter via un appareil pris en charge ou une clé de sécurité, à l'aide de l'invite du navigateur.

Ces paramètres s'appliquent à votre compte sur Personal et aux espaces de travail de l'organisation.

## Activer l'authentificateur MFA {#enable-authenticator-mfa}

1. Ouvrez **User profile → Security**.
2. Activez **Use multi-factor authentication**.
3. Scannez le code QR de configuration dans votre application d'authentification ou saisissez la clé de configuration manuellement.
4. Saisissez un code de vérification de l'authentificateur pour confirmer la configuration.
5. Enregistrez les codes de récupération dans un endroit sécurisé et confirmez que vous les avez enregistrés.
6. Choisissez **Done — sign in again**, puis connectez-vous avec votre mot de passe et votre code d'authentification.

Après la configuration, la connexion par mot de passe nécessite le défi MFA supplémentaire. Le démarrage de la configuration modifie votre session : la terminer ou l'annuler nécessite de vous reconnecter.

## Codes de récupération {#recovery-codes}

Utilisez un code de récupération enregistré lorsque vous ne pouvez pas accéder à votre authentificateur.

!!! warning "Gardez les codes de récupération en sécurité"
    Chaque code est un secret et ne peut être utilisé qu’une seule fois. **Generate new recovery codes** remplace l'ensemble précédent ; enregistrez les nouveaux codes avant de les ignorer.

Générer de nouveaux codes de récupération ou désactiver MFA nécessite également de vous reconnecter une fois que vous avez terminé.

Pour désactiver MFA, utilisez l'onglet Security et effectuez la vérification demandée. Ne supprimez pas votre seule méthode de connexion fonctionnelle avant d'en tester une autre.

## Ajoutez une clé d'accès {#add-a-passkey}

1. Ouvrez **User profile → Passkeys** et choisissez la nouvelle action de clé d'accès.
2. Saisissez un nom que vous reconnaîtrez plus tard.
3. Complétez l'invite du navigateur ou de l'appareil à l'aide de votre clé biométrique, de votre code PIN ou de votre clé de sécurité.
4. Vérifiez que les informations d'identification apparaissent dans la liste.

Utilisez l'option de connexion par clé d’accès sur un appareil et un navigateur pris en charge. Les clés d'accès nécessitent un appareil et un navigateur compatibles. Gardez votre mot de passe disponible pour la récupération de compte.

## Supprimer une clé d'accès {#remove-a-passkey}

Sélectionnez les informations d'identification dans la liste Clés d'accès et utilisez l'action de suppression. Vérifiez d'abord son nom et les détails de sa dernière utilisation. Le supprimer révoque l'accès à cet identifiant ; elle ne supprime pas les autres clés d'accès enregistrées.

Après la suppression, l'application informe les gestionnaires de mots de passe compatibles afin qu'ils puissent cesser de proposer la clé d'accès supprimée. Votre navigateur ou gestionnaire de mots de passe peut ne pas prendre en charge cette mise à jour. Si le mot de passe apparaît toujours, supprimez-le manuellement de votre gestionnaire de mots de passe ; il ne peut plus vous connecter à votre compte.

En cas de perte d'authentificateur ou d'appareil indisponible, essayez votre méthode alternative configurée ou votre code de récupération. Si aucun n'est disponible, contactez l'assistance pour obtenir de l'aide.
