[![Main build status](https://github.com/luarvic/click2approve/actions/workflows/main-build.yml/badge.svg)](https://github.com/luarvic/click2approve/actions/workflows/main-build.yml)

# Click2Approve

Click2Approve is an open-source document approval and workflow system. Upload
files, request approvals or electronic signatures, and track decisions in one
place. This MIT-licensed edition is the core used by the commercial version,
sharing its workflow engine and web interface.

Need organization workspaces, teams, workflow templates, discussions, revisions,
or verifiable receipts? Explore the [commercial service](https://click2approve.com/)
and the [edition comparison](ui/docs/content/docs/open-source.md).

## Table of contents

- [Features](#features)
- [Run locally](#run-locally)
- [Documentation](#documentation)

## Features

- **Document approval workflows:** Build multi-step workflows with sequential or
  parallel assignees and all/any completion rules.
- **Flexible task actions:** Request approval, signature, confirmation,
  acknowledgement, review, verification, acceptance, or completion, with optional
  instructions and required comments.
- **Electronic signatures:** Collect a legal name and drawn signature with IP
  address and browser evidence; save a reusable signature in your profile.
- **File uploads and previews:** Attach multiple documents and preview files
  while reviewing requests and tasks.
- **Request and task tracking:** Follow progress and decision history, manage
  incoming tasks, and cancel or delete requests.
- **Email and in-app notifications:** Keep requesters and assignees informed of
  tasks and outcomes, with personal notification preferences.
- **Account security:** Use password or passkey sign-in, authenticator-app MFA,
  recovery codes, email confirmation, and password reset.
- **First-time user guide:** Tour profile settings, notifications, and navigation;
  replay the guide from Support.
- **Responsive web interface:** Manage personal workflows from desktop or mobile.

## Run locally

Install [Docker with Compose](https://docs.docker.com/get-docker/) and
[Git](https://git-scm.com/downloads), then run:

```bash
git clone https://github.com/luarvic/click2approve.git
cd click2approve
docker compose build
docker compose up -d
```

Open [http://localhost:3333/app/](http://localhost:3333/app/) and create an account.
The landing page and user guides are at [http://localhost:3333/](http://localhost:3333/).
The API reference is at [http://localhost:5555/swagger/](http://localhost:5555/swagger/).

Compose starts the UI, API, event publisher, event consumer, SQL Server, and
Azurite (local Blob and Queue Storage). No external accounts or secrets are
needed: the local profiles include development credentials, disable email
confirmation, and turn off email delivery. In-app notifications still use both workers.
See [configuration](docs/configuration.md) to enable email or configure your own domain.

On Apple Silicon, enable x86-64 emulation in Docker or Colima for the SQL Server
`linux/amd64` image.

```bash
docker compose ps          # Check service status
docker compose logs -f api # View API logs
docker compose down       # Stop and remove containers
```

**Local data is disposable:** Compose defines no persistent data volumes.
`docker compose down` removes the database and emulator data with their containers.

## Documentation

- [Local development and testing](docs/development.md) — run from source and validate changes.
- [Configuration](docs/configuration.md) — settings, secrets, environment variables, and email.
- [Architecture](docs/architecture.md) — repository layout, components, data flow, and commercial extensions.
- [Deployment overview](docs/deployment.md) — Azure and on-premises hosting considerations.
- [License and trademark](docs/license-and-trademark.md) — MIT terms and brand use.
- [User guides](ui/docs/content/docs/index.md) — product documentation; check the
  [edition comparison](ui/docs/content/docs/open-source.md) for open-source availability.

For bugs and feature requests, [open a GitHub issue](https://github.com/luarvic/click2approve/issues).
