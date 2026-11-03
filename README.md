<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="ui/public/logo-with-text-dark.svg">
    <img src="ui/public/logo-with-text.svg" alt="Click2Approve" width="300">
  </picture>
</p>

# Get documents approved. Keep everyone on the same page.

[![Main build status](https://github.com/luarvic/click2approve/actions/workflows/main-build.yml/badge.svg)](https://github.com/luarvic/click2approve/actions/workflows/main-build.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Turn “Have you reviewed this?” into a clear next step.** Click2Approve is an
open-source document approval and workflow system you can host yourself. Upload
files, choose who reviews or signs them, and follow every decision in one place.

**Upload documents → Set approval steps → Collect decisions and signatures → Track progress**

Use it for supplier agreements, policy acknowledgements, design reviews, or any
document that needs a decision. Free under the MIT License, including for use
within your organization.

**[Try it locally](#try-it-locally)** · **[Common questions](#common-questions)** ·
**[Documentation](#documentation)** · **[Star on GitHub](https://github.com/luarvic/click2approve)**

## Try it locally

You need [Docker with Compose](https://docs.docker.com/get-docker/) and
[Git](https://git-scm.com/downloads). No cloud account, subscription, or external
secrets are needed for the local setup.

```bash
git clone https://github.com/luarvic/click2approve.git
cd click2approve
docker compose up -d --build
```

Once the services are ready, open **[http://localhost:3333/app/](http://localhost:3333/app/)**
and create an account. Try your first workflow:

1. Choose **New request**, enter a title, and upload a document.
2. Add an approval step using your account's email as the assignee, then submit.
3. Open **Tasks** to complete the approval, then **Requests** to see the outcome.

Next, try multiple reviewers, a required comment, or a signing step with
**Require an electronic signature** enabled. Local email delivery and email
confirmation are disabled; in-app notifications work. To try a second
participant, create another account in a separate browser profile.

The [local landing page and guides](http://localhost:3333/) and
[API reference](http://localhost:5555/swagger/) are also included.

**Local data is disposable:** this demo setup has no persistent data volumes.
Running `docker compose down` removes the database and emulator data with their
containers. For production, follow the [deployment guide](docs/deployment.md).

<details>
<summary>Local services, Apple Silicon, and stopping the app</summary>

Compose starts the UI, API, event publisher, event consumer, SQL Server, and
Azurite (local Blob and Queue Storage). Keep both workers running for in-app
notifications and queued cleanup. See [configuration](docs/configuration.md) to
enable email or configure your own domain.

On Apple Silicon, enable x86-64 emulation in Docker or Colima for the SQL Server
`linux/amd64` image.

```bash
docker compose ps          # Check service status
docker compose logs -f api # View API logs
docker compose down       # Stop and remove containers
```

This setup uses SQL Server Developer Edition, which is for development and
testing. Choose a suitably licensed database for production.

</details>

## What you can do

| When you need to… | Click2Approve lets you… |
| --- | --- |
| Get the right people involved | Build multi-step workflows, with sequential steps and parallel assignees; require everyone or any one assignee to act. |
| Make the next action clear | Request approval, signature, confirmation, acknowledgement, review, verification, acceptance, or completion, with instructions and required comments. |
| Collect electronic signatures | Capture a legal name and drawn signature with IP address and browser evidence; save a reusable signature in your profile. |
| Give reviewers context | Attach multiple documents and preview files while reviewing requests and tasks. |
| Know where things stand | Track incoming tasks, request progress, and decision history; cancel or delete requests. |
| Keep people informed | Send email and in-app notifications with personal notification preferences. |
| Secure account access | Use password or passkey sign-in, authenticator-app MFA, recovery codes, email confirmation, and password reset. |
| Work from different devices | Use the responsive web interface on desktop or mobile, with a first-time guide you can replay from Support. |

## Common questions

### Can I use it in my organization for free?

**Yes.** The open-source edition is MIT-licensed: you can self-host, use, modify,
and integrate it for personal or commercial purposes without a Click2Approve
license fee. You cover your own hosting and any database, storage, or email
provider costs. See [LICENSE](LICENSE) and [license and trademark](docs/license-and-trademark.md)
for the terms and brand-use guidance.

The free edition supports individual accounts and document workflows with email
assignees. Organization workspaces, employee roles, teams, workflow templates,
discussions, revisions, and verifiable receipts are part of the
[commercial service](https://click2approve.com/). See the
[edition comparison](ui/docs/content/docs/open-source.md) for the full breakdown.

### Can I connect it to my existing systems?

**Yes, through the HTTP API and source-level extensions.** Explore the
[Swagger API reference](http://localhost:5555/swagger/) after starting the app to
see the available endpoints and authentication flows. You can build adapters
for your internal applications or extend the backend's application services.

Integration requires development and authentication; the open-source edition
does not include the commercial edition's API-token management. See the
[architecture guide](docs/architecture.md) for extension points.

### Am I tied to SQL Server or Azure?

**The architecture is designed to make providers replaceable.** Workflow rules
live in the Domain and Application layers, with persistence, file storage,
queues, and email behind interfaces. Provider implementations live in the
Infrastructure layer, keeping those choices separate from the workflow logic.

The included setup uses SQL Server / Azure SQL and Azure Blob and Queue Storage;
Azurite emulates the storage services locally. To use another RDBMS supported by
Entity Framework Core, adapt the EF provider, database mappings, and schema
scripts. To use another cloud provider, implement the storage, queue, and email
interfaces and update the host registrations and configuration.

These boundaries make it easier to adapt the system to your infrastructure.
Alternative providers require code changes and integration testing; they are
not bundled configuration switches. See [architecture](docs/architecture.md)
and [deployment](docs/deployment.md) for the current implementations.

### Can I host it on my own infrastructure?

**Yes.** The UI, API, and background workers run in containers and can be hosted
on your own servers or in a cloud environment. The included providers require
SQL Server / Azure SQL and Azure Blob and Queue Storage. A fully on-premises
installation requires replacing the Azure storage providers, as described above.
For production, configure persistent data, backups, HTTPS, secure credentials,
and email delivery using the [deployment guide](docs/deployment.md).

> **Want to start right away without setting up infrastructure?**
> Use the **[hosted Click2Approve service](https://click2approve.com/)**—we handle
> hosting so you can focus on getting documents approved. The commercial version
> adds organization workspaces, employee roles and teams, reusable workflow
> templates, discussions, document revisions, verifiable receipts, and API tokens
> for integrations. [Compare editions](ui/docs/content/docs/open-source.md).

## Documentation

- [Open-source user guide](ui/docs/content/docs/open-source.md) — getting started and edition availability.
- [Local development and testing](docs/development.md) — run from source and validate changes.
- [Configuration](docs/configuration.md) — settings, secrets, environment variables, and email.
- [Architecture](docs/architecture.md) — repository layout, components, data flow, and extension points.
- [Deployment overview](docs/deployment.md) — hosting options and production requirements.
- [License and trademark](docs/license-and-trademark.md) — MIT terms and brand use.

## Help shape Click2Approve

**Would this make your approval process easier? Give the repo a ⭐** to bookmark
it and help others discover it: **[Star Click2Approve on GitHub](https://github.com/luarvic/click2approve)**.

Have a workflow in mind, found a bug, or want to add a provider?
[Open an issue](https://github.com/luarvic/click2approve/issues) to share your use
case, suggest an improvement, or discuss a contribution.
