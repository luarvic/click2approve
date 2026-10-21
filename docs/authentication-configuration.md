# Authentication configuration

Both API hosts use one `Authentication` section for account security policies:

```json
{
  "Authentication": {
    "VerificationEnabled": true,
    "Tokens": {
      "AccessTokenLifetimeMinutes": 60,
      "RefreshTokenLifetimeDays": 7
    },
    "Passkeys": {
      "RelyingPartyId": "click2approve.com",
      "RelyingPartyName": "Click2Approve",
      "Origins": ["https://click2approve.com"]
    },
    "Password": { "RequiredLength": 8 },
    "Lockout": { "MaxFailedAttempts": 3, "DurationMinutes": 5 },
    "EmailConfirmation": { "EmailPermitLimit": 3, "EmailWindowMinutes": 15 },
    "PasswordReset": { "EmailPermitLimit": 3, "EmailWindowMinutes": 15 }
  }
}
```

`VerificationEnabled` controls email confirmation only. Development and Docker
profiles disable it; production enables it. Confirm email delivery works before
requiring verification. Password validation, lockout, and enrolled authenticator
MFA remain active regardless of this setting.

Confirmation resend and password-reset email allowances are independent and
persisted per account. Each permit limit accepts 1–1000 and each window accepts
1–1440 minutes. Authenticator MFA uses Identity's lockout policy, not email limits.
See [authenticator MFA](authenticator-mfa.md).

Set the passkey relying-party ID to your browser-facing domain, without scheme or
port, and origins to exact browser origins. Development and Docker use `localhost`
and `http://localhost:3333`. Changing the domain can make existing passkeys unusable.

Use environment keys such as `Authentication__Passkeys__RelyingPartyId` and
`Authentication__Passkeys__Origins__0`; see [configuration](configuration.md).
.NET merges array entries by index, so override every configured origin entry
when replacing a list through environment settings.
