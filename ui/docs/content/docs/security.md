# MFA and passkeys

Protect your account with authenticator MFA and passkeys. These settings apply to your account across Personal and organization workspaces.

## Enable authenticator MFA

1. Open **User profile → Security**.
2. Enable **Use multi-factor authentication**.
3. Scan the setup QR code in your authenticator app, or enter the setup key manually.
4. Enter a verification code from the authenticator to confirm setup.
5. Save the recovery codes in a secure place and confirm that you have saved them.
6. Choose **Done — sign in again**, then sign in with your password and authenticator code.

After setup, password sign-in requires the additional MFA challenge. Starting setup changes your session: completing or canceling it requires signing in again.

## Recovery codes

Use a saved recovery code when you cannot access your authenticator.

!!! warning "Keep recovery codes safe"
    Each code is a secret and can be used only once. **Generate new recovery codes** replaces the previous set; save the new codes before dismissing them.

Generating new recovery codes or turning off MFA also requires signing in again after you finish.

To disable MFA, use the Security tab and complete the requested verification. Do not remove your only working sign-in method before testing another one.

## Add a passkey

1. Open **User profile → Passkeys** and choose the new passkey action.
2. Enter a name you will recognize later.
3. Complete the browser or device prompt using your biometric, PIN, or security key.
4. Check that the credential appears in the list.

Use the passkey sign-in option on a supported device and browser. Passkeys require a compatible device and browser. Keep your password available for account recovery.

## Remove a passkey

Select the credential in the Passkeys list and use the remove action. Check its name and last-used details first. Removing it revokes that credential's access; it does not remove other registered passkeys.

After removal, the app notifies compatible password managers so they can stop offering the removed passkey. Your browser or password manager may not support this update. If the passkey still appears, remove it manually from your password manager; it can no longer sign you in to your account.

For a lost authenticator or unavailable device, try your configured alternative method or recovery code. If none is available, contact support for help.
