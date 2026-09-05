![Main build status](https://github.com/luarvic/click2approve/actions/workflows/main-build.yml/badge.svg)

# Click2Approve

`Click2Approve` is a free, open-source document workflow system. It provides a
responsive web UI for uploading files, sending workflow requests, collecting
decisions and discussion, and tracking request history.

## Table of Contents

1. [Features](#features)
2. [Demo](#demo)
3. [Quick Start](#quick-start)
4. [Local Development](#local-development)
5. [On-Premises Hosting](#on-premises-hosting)
6. [Architecture](#architecture)
7. [License and Trademark](#license-and-trademark)

## Features

- Sign up, sign in with a password or passkey, confirm email addresses, reset
  passwords, and use authenticated browser sessions through the built-in
  account API.
- Compose workflow requests with one or more files, a title, description, and
  email-based assignees.
- Build multi-step workflows with serial or parallel assignee steps, choosing approval, signature, confirmation,
  acknowledgement, review, verification, acceptance, or completion actions, with optional instructions and
  positive-result comment or electronic-signature requirements.
- Track sent workflow requests in Requests, inspect request details, see
  in-progress request state, cancel pending requests, and delete requests.
- Review incoming tasks in Tasks, filter, sort, and paginate the list; open
  task details, preview attached files, record decisions with comments, and
  see the uncompleted task count.
- Capture electronic-signature evidence when required by a task, including legal name,
  signature strokes, IP address, and browser data on completed tasks.
- Maintain a user profile with display name, avatar, reusable signature,
  and email notification preferences.
- Notify requesters and assignees by email when email delivery is enabled,
  including account, task, cancellation, deletion, and review notifications.
- Review in-app notifications with Received-date sorting, pagination, and filters for notification type, read status,
  details, and Received date range.

## Demo

Visit [Click2Approve.com](https://click2approve.com/) to see the application in
use.

If you find this project useful, please star the repository to support ongoing
development and visibility.

## Quick Start

### Prerequisites

- [Docker Desktop](https://docs.docker.com/get-docker/)
- [Git](https://git-scm.com/downloads)

On Apple Silicon Macs, configure Docker or Colima for x86-64 emulation. The
local SQL Server Developer Edition image runs as `linux/amd64`.

### Run the Application

```bash
git clone https://github.com/luarvic/click2approve.git
cd click2approve
docker compose build
docker compose up -d
```

Open [http://localhost:3333/](http://localhost:3333/) in a browser.

The Docker Compose setup starts:

| Service           | Container                         | Port             | Purpose                                           |
| ----------------- | --------------------------------- | ---------------- | ------------------------------------------------- |
| `ui`              | `click2approve-ui-1`              | `3333`           | React single-page application served by Nginx     |
| `api`             | `click2approve-api-1`             | `5555`           | ASP.NET Core Web API                              |
| `event-publisher` | `click2approve-event-publisher-1` | —                | Publishes committed outbox events to the queue    |
| `event-consumer`  | `click2approve-event-consumer-1`  | —                | Delivers queue messages, including notifications  |
| `db`              | `click2approve-db-1`              | `1433`           | SQL Server database                               |
| `azurite`         | `click2approve-azurite-1`         | `10000`, `10001` | Azure Storage emulator for files and event queues |

### Useful Docker Commands

```bash
docker compose ps
docker compose logs -f api
docker compose down
```

The Compose file does not define a database volume, so `docker compose down`
removes the local SQL Server container and its data, including the event outbox and notification inbox.

## Local Development

The Docker setup is the fastest way to run the complete application. For code
changes, you can also run and validate the UI, API, event publisher, and event consumer directly.

### API

The API is an ASP.NET Core application targeting .NET 10. The solution file is
located at `api/Click2Approve.Api.sln`.

```bash
cd api
dotnet restore Click2Approve.Api.sln
dotnet build Click2Approve.Api.sln
dotnet test Click2Approve.Api.sln
```

To run the API locally from source, start the local SQL Server database and Azure
Blob Storage emulator first from the repository root:

```bash
docker compose up -d db azurite
```

The local Azurite image configures blob CORS for the development UI origin
(`http://localhost:3333`) when it starts.

Then run the Web API project:

```bash
dotnet run --project api/src/Click2Approve.WebApi/Click2Approve.WebApi.csproj
```

Run the event publisher and event consumer in separate terminals. The publisher
publishes committed outbox messages; the consumer processes Azure Queue deliveries,
including email and in-app notifications:

```bash
dotnet run --project api/src/Click2Approve.EventPublisher/Click2Approve.EventPublisher.csproj
dotnet run --project api/src/Click2Approve.EventConsumer/Click2Approve.EventConsumer.csproj
```

The development profile listens on
[http://localhost:5555/](http://localhost:5555/). Swagger is available at
[http://localhost:5555/swagger](http://localhost:5555/swagger).

The API reads its local development settings from
`api/src/Click2Approve.WebApi/appsettings.Development.json`. The Docker profile
uses `appsettings.Docker.json`, which points the API at the Compose `db` service
and `azurite` service and disables email delivery by default.

### UI

The UI is a React 18 and TypeScript application in `ui`.

```bash
cd ui
npm ci
npm run build
npm test -- --run
```

For interactive UI development:

```bash
npm run dev
```

## On-Premises Hosting

The Docker Compose setup can be used as a starting point for an on-premises
deployment. Run the UI, API, and database containers on your own infrastructure,
place the UI and API behind your reverse proxy or load balancer, and use Azure
Blob Storage for uploaded files.

For production, configure environment-specific secrets and settings instead of
using the sample credentials in `docker-compose.yaml`. At minimum, review:

- SQL Server credentials and database storage.
- API connection strings.
- Private and public Azure Blob Storage connection strings and container access policies.
- Email provider settings.
- Public UI base URL and allowed origins.
- TLS termination and DNS.
- Backup and restore procedures for the database and uploaded files.

## Architecture

The application consists of five containerized services:

- Client-side UI: React TypeScript 18.2.
- Server-side API: ASP.NET Core 10.
- Event publisher: ASP.NET Core worker that publishes committed outbox messages.
- Event consumer: ASP.NET Core worker that processes queued event deliveries.
- Relational database: SQL Server, with Azure SQL Database supported for managed hosting.

### Client-Side UI

The UI provides the browser-based experience for uploading files, submitting
workflow requests, reviewing tasks, discussing work, and viewing request state.

It is written in [TypeScript](https://www.typescriptlang.org/) and uses:

- [React](https://react.dev/)
- [Material UI](https://mui.com/material-ui/)
- [MobX](https://mobx.js.org/react-integration.html)
- [Vite](https://vite.dev/)

The production container builds the TypeScript source into a single-page
application and serves it with [Nginx](https://www.nginx.com/).

UI contribution conventions, including ownership of theme, styles, and settings,
are documented in [ui/README.md](ui/README.md).

### Server-Side API

The API exposes the HTTP endpoints used by the UI and implements workflow,
identity, file, discussion, and notification behavior.

It is written in [C#](https://learn.microsoft.com/en-us/dotnet/csharp/) and
uses:

- [ASP.NET Core](https://dotnet.microsoft.com/en-us/apps/aspnet)
- [Entity Framework Core](https://learn.microsoft.com/en-us/ef/core/)
- [ASP.NET Core Identity](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity)

The API stores relational data in SQL Server and uses filesystem storage for uploaded
files.

### Relational Database

SQL Server stores user accounts, workflow requests, tasks, file metadata,
and other application data required by the API.

## License and Trademark

This project is licensed under the MIT License. See [LICENSE](LICENSE).

Click2Approve is a registered trademark of Rostislav Semenov in the United
States. The MIT License applies to the software, but does not grant permission
to use the Click2Approve name, logo, or trademarks except as required to
identify this software.
