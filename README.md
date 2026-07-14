![Main build status](https://github.com/luarvic/click2approve/actions/workflows/main-build.yml/badge.svg)

# Click2Approve

`Click2Approve` is a free, open-source document approval system. It provides a
responsive web UI for uploading files, sending approval requests, collecting
review decisions, and tracking request history.

## Table of Contents

1. [Features](#features)
2. [Demo](#demo)
3. [Quick Start](#quick-start)
4. [Local Development](#local-development)
5. [On-Premises Hosting](#on-premises-hosting)
6. [Architecture](#architecture)
7. [License and Trademark](#license-and-trademark)

## Features

- Upload and manage files.
- Send documents for approval by entering approver email addresses.
- Review incoming approval requests.
- Track sent requests, inbox items, and archived approvals.
- Notify requesters and approvers by email when email delivery is enabled.
- Run the complete stack locally with Docker Compose.

## Demo

Visit [Click2Approve.com](https://click2approve.com/) to see the application in
use.

If you find this project useful, please star the repository to support ongoing
development and visibility.

## Quick Start

### Prerequisites

- [Docker Desktop](https://docs.docker.com/get-docker/)
- [Git](https://git-scm.com/downloads)

### Run the Application

```bash
git clone https://github.com/luarvic/click2approve.git
cd click2approve
docker compose build
docker compose up -d
```

Open [http://localhost:3333/](http://localhost:3333/) in a browser.

The Docker Compose setup starts:

| Service | Container | Port | Purpose |
| --- | --- | --- | --- |
| `ui` | `click2approve-ui-1` | `3333` | React single-page application served by Nginx |
| `api` | `click2approve-api-1` | `5555` | ASP.NET Core Web API |
| `db` | `click2approve-db-1` | `3306` | MySQL database |

### Useful Docker Commands

```bash
docker compose ps
docker compose logs -f api
docker compose down
```

Use `docker compose down -v` only when you also want to delete the local MySQL
volume.

## Local Development

The Docker setup is the fastest way to run the complete application. For code
changes, you can also run and validate the UI and API directly.

### API

The API is an ASP.NET Core application targeting .NET 10. The solution file is
located at `api/Click2Approve.Api.sln`.

```bash
cd api
dotnet restore Click2Approve.Api.sln
dotnet build Click2Approve.Api.sln
dotnet test Click2Approve.Api.sln
```

To run the API locally from source, start a local MySQL database first from the
repository root:

```bash
docker compose up -d db
```

Then run the Web API project:

```bash
dotnet run --project api/src/Click2Approve.WebApi/Click2Approve.WebApi.csproj
```

The development profile listens on
[http://localhost:5555/](http://localhost:5555/). Swagger is available at
[http://localhost:5555/swagger](http://localhost:5555/swagger).

The API reads its local development settings from
`api/src/Click2Approve.WebApi/appsettings.Development.json`. The Docker profile
uses `appsettings.Docker.json`, which points the API at the Compose `db` service
and disables email delivery by default.

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
place the UI and API behind your reverse proxy or load balancer, and persist the
database and uploaded-file storage on managed volumes.

For production, configure environment-specific secrets and settings instead of
using the sample credentials in `docker-compose.yaml`. At minimum, review:

- MySQL credentials and database storage.
- API connection strings.
- Email provider settings.
- Public UI base URL and allowed origins.
- TLS termination and DNS.
- Backup and restore procedures for the database and uploaded files.

## Architecture

The application consists of three containerized services:

- Client-side UI: React TypeScript 18.2.
- Server-side API: ASP.NET Core 10.
- Relational database: MySQL 8.4.

### Client-Side UI

The UI provides the browser-based experience for uploading files, submitting
approval requests, reviewing tasks, and viewing request state.

It is written in [TypeScript](https://www.typescriptlang.org/) and uses:

- [React](https://react.dev/)
- [Material UI](https://mui.com/material-ui/)
- [MobX](https://mobx.js.org/react-integration.html)
- [Vite](https://vite.dev/)

The production container builds the TypeScript source into a single-page
application and serves it with [Nginx](https://www.nginx.com/).

### Server-Side API

The API exposes the HTTP endpoints used by the UI and implements the approval
workflow, identity, file, and notification behavior.

It is written in [C#](https://learn.microsoft.com/en-us/dotnet/csharp/) and
uses:

- [ASP.NET Core](https://dotnet.microsoft.com/en-us/apps/aspnet)
- [Entity Framework Core](https://learn.microsoft.com/en-us/ef/core/)
- [ASP.NET Core Identity](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity)
- [Hangfire](https://www.hangfire.io/)

The API stores relational data in MySQL and uses filesystem storage for uploaded
files.

### Relational Database

MySQL stores user accounts, approval requests, approval tasks, file metadata,
and other application data required by the API.

## License and Trademark

This project is licensed under the MIT License. See [LICENSE](LICENSE).

Click2Approve is a registered trademark of Rostislav Semenov in the United
States. The MIT License applies to the software, but does not grant permission
to use the Click2Approve name, logo, or trademarks except as required to
identify this software.

