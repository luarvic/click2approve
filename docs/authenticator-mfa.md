# Authenticator MFA

Under **User profile → Security**, select **Use multi-factor authentication**.
Choose Continue, scan the QR code in Microsoft Authenticator, Google Authenticator,
or another TOTP app, and verify a six-digit code. Manual setup with the displayed
secret is also supported. Save the recovery codes before finishing, then sign in
again. Recovery codes are displayed once and each can be used once.

Password sign-in asks for an authenticator code when MFA is enabled. **Use a
recovery code** is available if the authenticator is unavailable. Codes, secrets,
and pending sign-in passwords are held only in component memory, never local or
session storage. The original protected destination survives the MFA step.
Passkey sign-in remains available without an additional authenticator code.

The Security page also supports replacing recovery codes and turning off MFA.
These actions use Identity's authenticated management endpoint, with a confirmation
dialog rather than the previous custom password-and-email challenge. Replacing
recovery codes invalidates the old set. Re-enabling MFA creates a fresh secret
and fresh recovery codes. There is no email fallback.

## Identity integration

- `POST /api/v1/account/login` is the native Identity endpoint. A correct password
  with outstanding MFA returns HTTP 401 with `detail: "RequiresTwoFactor"` and no
  session tokens. Submit the password again with `twoFactorCode` or
  `twoFactorRecoveryCode` to finish. Failed sign-in attempts use Identity lockout.
- `POST /api/v1/account/manage/2fa` is the native authenticated endpoint for setup,
  enrollment, removal, and recovery-code replacement. Its request and response
  use Identity's `TwoFactorRequest` and `TwoFactorResponse`.
- `GET /api/v1/account/mfa` is a read-only status adapter returning `enabled` and
  `isAvailable`. Unlike native management, it never creates an authenticator key
  or returns the secret. Merely viewing Security therefore leaves sessions intact.

Native setup and enrollment changes rotate the security stamp, invalidating old
refresh tokens. The UI signs out after changes, once recovery codes have been
saved. Starting setup and then canceling also signs out, since creating the key
already changed the stamp. Already issued access tokens retain their normal
lifetime. The application does not add a custom token issuance mechanism.

The UI uses bearer tokens and requires MFA on each password sign-in; it does not
expose a remember-browser option. Identity's native cookie-mode behavior is still
available to API callers, but the former custom device-trust cookie is never read.

`Authentication:VerificationEnabled` controls email confirmation only. Authenticator
MFA setup and management are always available to authenticated users, and enrolled
users must complete MFA at password sign-in even when email verification is disabled.
Password validation and account lockout still apply. Both editions use the same
implementation and configuration. MFA needs no mail worker.

Deployments with `VerificationEnabled=false` that previously bypassed MFA now require
authenticator codes or recovery codes for users already enrolled in MFA.

## Deployment from the former email-code implementation

No schema change is needed: Identity already stores authenticator keys and
recovery codes in its user-token table. Email enrollment cannot automatically
be converted into an authenticator secret on a user's device.

If email MFA was deployed, schedule the transition and notify affected users that
they must enroll an authenticator. Before serving traffic with the new version:

1. Stop old API instances from issuing email challenges. Drain pending account
   emails with the old workers before upgrading them; the removed email type is
   no longer supported by the new consumer. Include messages already in the queue.
2. Review the affected accounts using the SELECT below. Reset only enrollment
   that has no authenticator secret. This temporarily removes their second-factor
   requirement until they enroll again, so coordinate deployment and re-enrollment.
3. Run the transaction against the intended Azure SQL database, then deploy the
   new API, UI, and workers together. Existing authenticator enrollments are preserved.
4. Remove obsolete `Authentication:Mfa` settings and old email-MFA environment
   overrides. The former device cookie is ignored and can expire normally.

This is a one-time operational data transition, not an automatic login bypass.
The SQL has not been executed by the application or during development.

```sql
SELECT u.Id, u.Email
FROM AspNetUsers AS u
WHERE u.TwoFactorEnabled = 1
  AND NOT EXISTS (
    SELECT 1 FROM AspNetUserTokens AS t
    WHERE t.UserId = u.Id AND t.LoginProvider = '[AspNetUserStore]'
      AND t.Name = 'AuthenticatorKey' AND NULLIF(t.Value, '') IS NOT NULL
  );

BEGIN TRANSACTION;
UPDATE u
SET TwoFactorEnabled = 0,
    SecurityStamp = CONVERT(nvarchar(36), NEWID()),
    ConcurrencyStamp = CONVERT(nvarchar(36), NEWID())
FROM AspNetUsers AS u
WHERE u.TwoFactorEnabled = 1
  AND NOT EXISTS (
    SELECT 1 FROM AspNetUserTokens AS t
    WHERE t.UserId = u.Id AND t.LoginProvider = '[AspNetUserStore]'
      AND t.Name = 'AuthenticatorKey' AND NULLIF(t.Value, '') IS NOT NULL
  );
DELETE FROM AspNetUserTokens WHERE LoginProvider = 'Click2Approve.EmailMfa';
COMMIT TRANSACTION;
```

When no email MFA was deployed, skip this data transition. Confirmation and
password-reset email allowances remain separate and unchanged.
