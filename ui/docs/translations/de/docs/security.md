---
title: Richten Sie Authentifizierungs-MFA und Passkeys ein
description: Schützen Sie Ihr Click2Approve-Konto mit einer Authentifizierungs-App oder einem Passkey. Erfahren Sie, wie Sie MFA einrichten, Wiederherstellungscodes speichern und registrierte Passkeys verwalten.
---
# MFA und Passkeys {#mfa-and-passkeys}

Schützen Sie Ihr Click2Approve-Konto mit **Multi-Faktor-Authentifizierung (MFA)** oder einem **Passkey**. Beim Authentifikator MFA geben Sie nach Ihrem Passwort einen Code aus einer Authentifikator-App ein. Mit einem Passkey können Sie sich mithilfe der Eingabeaufforderung des Browsers über ein unterstütztes Gerät oder einen Sicherheitsschlüssel anmelden.

Diese Einstellungen gelten für Ihr Konto in Personal und Organisationsarbeitsbereichen.

## MFA mit Authentifizierungs-App aktivieren {#enable-authenticator-mfa}

1. Öffnen Sie **User profile → Security**.
2. Aktivieren Sie **Use multi-factor authentication**.
3. Scannen Sie den Setup-QR-Code in Ihrer Authentifizierungs-App oder geben Sie den Setup-Schlüssel manuell ein.
4. Geben Sie einen Bestätigungscode vom Authentifikator ein, um die Einrichtung zu bestätigen.
5. Speichern Sie die Wiederherstellungscodes an einem sicheren Ort und bestätigen Sie, dass Sie sie gespeichert haben.
6. Wählen Sie **Done — sign in again** und melden Sie sich dann mit Ihrem Passwort und Authentifizierungscode an.

Nach der Einrichtung erfordert die Passwortanmeldung die zusätzliche Herausforderung MFA. Durch das Starten des Setups ändert sich Ihre Sitzung: Um sie abzuschließen oder abzubrechen, müssen Sie sich erneut anmelden.

## Wiederherstellungscodes {#recovery-codes}

Verwenden Sie einen gespeicherten Wiederherstellungscode, wenn Sie nicht auf Ihren Authentifikator zugreifen können.

!!! warning "Bewahren Sie Wiederherstellungscodes sicher auf"
    Jeder Code ist geheim und kann nur einmal verwendet werden. **Generate new recovery codes** ersetzt den vorherigen Satz; Speichern Sie die neuen Codes, bevor Sie das Fenster schließen.

Das Generieren neuer Wiederherstellungscodes oder das Deaktivieren von MFA erfordert außerdem eine erneute Anmeldung, nachdem Sie fertig sind.

Um MFA zu deaktivieren, verwenden Sie die Registerkarte Security und schließen Sie die angeforderte Überprüfung ab. Entfernen Sie nicht Ihre einzige funktionierende Anmeldemethode, bevor Sie eine andere testen.

## Passkey hinzufügen {#add-a-passkey}

1. Öffnen Sie **User profile → Passkeys** und wählen Sie die neue Passkey-Aktion.
2. Geben Sie einen Namen ein, den Sie später wiedererkennen.
3. Vervollständigen Sie die Browser- oder Geräteaufforderung mit Ihrer Biometrie, PIN oder Ihrem Sicherheitsschlüssel.
4. Überprüfen Sie, ob die Anmeldeinformationen in der Liste angezeigt werden.

Verwenden Sie die Anmeldeoption „Passkey“ auf einem unterstützten Gerät und Browser. Für Passkeys sind ein kompatibles Gerät und ein kompatibler Browser erforderlich. Halten Sie Ihr Passwort für die Kontowiederherstellung bereit.

## Entfernen Sie einen Passkey {#remove-a-passkey}

Wählen Sie die Anmeldeinformationen in der Passkeys-Liste aus und verwenden Sie die Aktion „Entfernen“. Überprüfen Sie zunächst den Namen und die Angaben zur letzten Verwendung. Durch das Entfernen wird der Zugriff auf diese Anmeldeinformationen widerrufen. Andere registrierte Passkeys werden nicht entfernt.

Nach dem Entfernen benachrichtigt die App kompatible Passwort-Manager, damit diese den entfernten Passkey nicht mehr anbieten können. Ihr Browser oder Passwort-Manager unterstützt dieses Update möglicherweise nicht. Wenn der Passkey immer noch angezeigt wird, entfernen Sie ihn manuell aus Ihrem Passwort-Manager. Es kann Sie nicht mehr bei Ihrem Konto anmelden.

Bei einem verlorenen Authentifikator oder einem nicht verfügbaren Gerät versuchen Sie es mit Ihrer konfigurierten alternativen Methode oder Ihrem Wiederherstellungscode. Wenn keine verfügbar ist, wenden Sie sich an den Support, um Hilfe zu erhalten.
