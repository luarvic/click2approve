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

`VerificationEnabled=false` bypasses email-confirmation and MFA enforcement together,
without changing enrollment. Password validation and lockout remain active.
Development and Docker configurations disable verification; production enables it.
When verification is enabled for an existing unconfirmed session, the UI signs the
user out and redirects to Sign in with an error toast explaining that email
verification is required. Users can request another verification email from Sign in.

Each email allowance is per account, persisted across requests and restarts, and
independent of the other allowance. Confirmation allowance applies to resend requests;
registration retains its existing behavior. Windows start with the first request
and reset on the next request after expiry. Confirmation/password-reset permit
limits accept 1–1000 and windows accept 1–1440 minutes.
Authenticator codes and recovery codes use ASP.NET Core Identity, with the common
account lockout settings above. There are no MFA email limits, resend settings,
or custom code-lifetime settings. See [authenticator MFA](authenticator-mfa.md).

Passkey relying-party settings and permitted browser origins live under
`Authentication:Passkeys`. Preserve the existing values when migrating so registered
passkeys continue working. Development overrides use `localhost` and the local UI
origin. For environment overrides, use keys such as
`Authentication__Passkeys__RelyingPartyId` and `Authentication__Passkeys__Origins__0`.

## Deployment migration

Old keys are no longer read. Update environment variables, deployment settings,
and local user secrets using this mapping (replace `:` with `__` for environment variables):

| Previous key | New key |
| --- | --- |
| `Identity:RequireConfirmedEmail` | `Authentication:VerificationEnabled` |
| `Identity:Password:RequiredLength` | `Authentication:Password:RequiredLength` |
| `Identity:Lockout:MaxFailedAccessAttempts` | `Authentication:Lockout:MaxFailedAttempts` |
| `Identity:Lockout:LockoutTimeSpanInMinutes` | `Authentication:Lockout:DurationMinutes` |
| `Authentication:BearerTokenExpirationInMinutes` | `Authentication:Tokens:AccessTokenLifetimeMinutes` |
| `Authentication:RefreshTokenExpirationInDays` | `Authentication:Tokens:RefreshTokenLifetimeDays` |
| `Passkeys:*` | `Authentication:Passkeys:*` |
| `Authentication:Mfa:*` (and earlier email-MFA settings) | Removed; use native authenticator MFA |
| `RateLimiting:Identity:EmailPermitLimit` | Both `Authentication:EmailConfirmation:EmailPermitLimit` and `Authentication:PasswordReset:EmailPermitLimit` |
| `RateLimiting:Identity:WindowInMinutes` | Both `Authentication:EmailConfirmation:EmailWindowMinutes` and `Authentication:PasswordReset:EmailWindowMinutes` |

Lockout is enabled for new users; the previous `Identity:Lockout:AllowedForNewUsers`
setting is removed. No schema migration is required. Confirmation/reset counters
now use distinct rows in the existing Identity user-token table. Legacy shared
account-email counters remain in the schema but are ignored, so each of these two
allowances starts fresh after deployment. Obsolete MFA state can be removed as described in the authenticator migration guide.
