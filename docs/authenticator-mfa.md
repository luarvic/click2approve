# Authenticator MFA

Users enroll a TOTP authenticator and save one-use recovery codes through
**User profile → Security → Use multi-factor authentication**. See the
[user security guide](../ui/docs/content/docs/security.md) for instructions.
There is no email fallback; passkey sign-in does not require an additional TOTP code.

MFA uses ASP.NET Core Identity and needs no mail provider. Disabling email
confirmation does not disable MFA for enrolled users.

For integrations, `POST /api/v1/account/login` returns HTTP 401 with
`detail: "RequiresTwoFactor"` when a valid password needs a second factor.
Resubmit with `twoFactorCode` or `twoFactorRecoveryCode`.
`POST /api/v1/account/manage/2fa` manages enrollment and recovery codes;
`GET /api/v1/account/mfa` reads status without creating a secret.

Enrollment changes rotate the security stamp and invalidate refresh tokens.
The UI signs out after security changes; already-issued access tokens retain their
normal lifetime. See [authentication configuration](authentication-configuration.md)
for shared security policies and `/swagger/` on the API host for endpoint details.
