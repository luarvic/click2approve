# Configuration

The checked-in Docker and Development profiles are enough to run locally without
external secrets. They use SQL Server development credentials and Azurite, disable
email confirmation, and turn off email delivery. These settings are for local use.

## Where settings live

Each .NET host has its own `appsettings.json` and environment overrides in
`api/src/Click2Approve.WebApi/`, `Click2Approve.EventPublisher/`, or
`Click2Approve.EventConsumer/`. Configure each process independently.

Compose selects `Docker` through `ASPNETCORE_ENVIRONMENT` for the API and
`DOTNET_ENVIRONMENT` for the workers. When running from source, set these to
`Development` in the corresponding terminals to load the local profiles.

Use environment variables to override settings, replacing `:` with `__` and
numbering array entries from zero. For example, `UI:BaseUrl` becomes `UI__BaseUrl`
and `AllowedOrigins:0` becomes `AllowedOrigins__0`. Keep credentials in your local
secret store or deployment secret manager, outside source control. A `.env` file
alone does not configure the .NET hosts: Compose must explicitly pass those
values through `environment` or `env_file`.

## Runtime settings

| Environment variable | Hosts | Purpose |
| --- | --- | --- |
| `ConnectionStrings__Default` | API, publisher, consumer | SQL Server / Azure SQL connection string; all hosts must use the same database |
| `FileStorage__ConnectionString` | API, consumer | Blob Storage connection string, including Azurite locally |
| `FileStorage__ServiceUri` | API, consumer | Blob service URL when using Azure token authentication instead of a connection string |
| `FileStorage__PrivateContainerName` | API, consumer | Private attachments container; default `private` |
| `FileStorage__PublicContainerName` | API, consumer | Public profile images container; default `public` |
| `EventQueue__ConnectionString` | Publisher, consumer | Queue Storage connection string, including Azurite locally |
| `EventQueue__ServiceUri` | Publisher, consumer | Queue service URL when using Azure token authentication |
| `Azure__ManagedIdentityClientId` | API, publisher, consumer | Optional user-assigned managed identity client ID for Azure service clients |
| `UI__BaseUrl` | API, consumer | Browser-facing origin used in account and notification links |
| `UI__AppPath` | API, consumer | React app path; default `/app` |
| `AllowedOrigins__0` | API | Permitted browser origin for CORS; use additional numbered entries as needed |
| `Authentication__VerificationEnabled` | API | Require confirmed email; default `true`, local profiles `false` |
| `Authentication__Passkeys__RelyingPartyId` | API | Passkey domain, without scheme or port; `localhost` for local use |
| `Authentication__Passkeys__Origins__0` | API | Exact allowed browser origin, including scheme and port |
| `Email__IsEnabled` | Consumer | Send email; default `true`, local profiles `false` |
| `Email__FromEmailAddress` | Consumer | Verified Azure Communication Services sender address |
| `AzureEmailCommunication__Endpoint` | Consumer | Azure Communication Services endpoint for email delivery |
| `Email__LogoUrl` | Consumer | Optional publicly reachable absolute logo URL for email |
| `Limitations__MaxAttachmentFileSizeBytes` | API | Attachment limit; default 52,428,800 bytes (50 MiB) |
| `Limitations__MaxAvatarFileSizeBytes` | API | Avatar limit; default 4,194,304 bytes (4 MiB) |

When using storage service URLs, leave the corresponding connection strings empty;
a nonempty connection string takes precedence. Azure clients use
`DefaultAzureCredential`, optionally selecting a managed identity by client ID.
SQL authentication is configured separately in `ConnectionStrings__Default`.

Keep queue names and storage container names consistent between hosts. The worker
settings also expose polling, concurrency, and retry limits; see their
`appsettings.json` files.

## Email providers and Azure retirement

Microsoft lists ACS Email for retirement on September 30, 2028. Its alternatives
are not direct equivalents: HVE is internal-only and Exchange Online has mailbox
and tenant limits. Review the [official retirement guidance](https://learn.microsoft.com/en-us/azure/communication-services/acs-retirement-and-breaking-changes-guide#acs-email)
before choosing a provider (checked October 21, 2026).

The consumer currently registers `AzureEmailCommunicationService`. A non-Azure
[`EmailService`](../api/src/Click2Approve.Infrastructure/Email/EmailService.cs)
adapter already uses [FluentEmail](https://github.com/lukencode/FluentEmail), but
is not wired up. Using it requires a sender package (such as SMTP/MailKit), sender
credentials and From address, and replacement of the Azure `IEmailService`
registration. Its unsuccessful send results must also be handled for queue retries.
There is no environment-variable switch for this integration. Blob and Queue
Storage remain separate Azure dependencies.

## Enable email

For the currently registered Azure provider:

1. Configure an Azure Communication Services Email resource with a verified sender.
2. Set the consumer's `AzureEmailCommunication__Endpoint`,
   `Email__FromEmailAddress`, and `Email__IsEnabled=true`. Provide an Azure identity
   with email-send access; the email client uses token authentication, not an ACS
   connection string or access key.
3. Set the same browser-facing `UI__BaseUrl` and `UI__AppPath` in the API and consumer.
4. Run both publisher and consumer. Verify email delivery before enabling
   `Authentication__VerificationEnabled=true` in the API.

The default email logo uses `UI__BaseUrl` + `UI__AppPath` + `/logo-with-text.png`.
Override `Email__LogoUrl` with a publicly reachable HTTPS image if needed; remote
email clients cannot fetch localhost images. Configure the sender display name
with the email provider, separately from the From address.

For delivery problems, check both worker logs and queue backlogs, verify the sender
and identity permissions, and check poison queues. Provider acceptance does not
prove inbox delivery. To diagnose Azure calls, temporarily set the consumer's
`Logging__LogLevel__Azure.Core=Information` (default `Warning`).

See [authentication configuration](authentication-configuration.md) for confirmation,
lockout, and passkey policies. Authenticator MFA does not require email.

## Passkeys on localhost

Both Development and Docker profiles set the passkey domain to `localhost` and
allow `http://localhost:3333`. No additional passkey configuration is needed for
the local Compose setup. Open the app using `localhost`, rather than an IP address
or another hostname, so the browser domain matches the configured passkey domain.

## Frontend build settings

Vite embeds settings at build time; they are public browser configuration and
must never contain secrets. Changing a running Nginx container's environment does
not update the compiled app.

| Setting | Purpose |
| --- | --- |
| `VITE_API_BASE_URI` | API base URL visible to the browser |
| `VITE_UI_BASE_URI` | Public UI origin |
| `VITE_APP_UPDATE_CHECK_MINUTES` | Production release-check interval in minutes (default `5`); also checks at startup and reloads when a new build is detected |
| `GOOGLE_ANALYTICS_ID` | Optional GA4 measurement ID (`G-...`) for the app, legacy help, landing page, and docs; unset or empty disables Analytics |
| `DOCS_SITE_URL` | Public site's canonical origin, including trailing `/` |
| `DOCS_API_BASE_URI` | API base URL used for the public site's Swagger link |

Local values live in `ui/.env.development`; production values in
`ui/.env.production` currently point to `https://click2approve.com`. For your own
domain, update the selected Vite environment file before building. The UI Dockerfile
selects it with the `ENV` build argument (`production` by default; Compose uses
`development`). Pass `DOCS_SITE_URL` and `DOCS_API_BASE_URI` as Docker build arguments
for the public site. Analytics is disabled by default. To enable it, pass
`--build-arg GOOGLE_ANALYTICS_ID=G-YOURID` when building the UI image. For builds
outside Docker, set `GOOGLE_ANALYTICS_ID` in the environment for both `npm run build`
and `mkdocs build --strict`. The measurement ID is public configuration, not a secret.
See [frontend development](../ui/README.md#user-documentation).

## Upload limits

The attachment endpoint accepts request bodies up to 128 MiB, including multipart
overhead. Larger batches must be split across requests. If increasing file-size
settings, review the endpoint and multipart limits as well as reverse-proxy or IIS
request filtering. See [deployment](deployment.md) for the production checklist.
