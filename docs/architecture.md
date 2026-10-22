# Architecture

Click2Approve separates the web interface, HTTP API, and background event processing.
SQL Server stores application data; Azure Blob Storage stores files, and Azure
Queue Storage carries background events. Local development uses Azurite for Blob
and Queue Storage.

| Component | Technology | Responsibility |
| --- | --- | --- |
| UI (`ui/`) | React 19, TypeScript, Material UI, MobX, Vite | Requests, tasks, profiles, and notifications |
| Public site (`ui/docs/`) | MkDocs Material | Landing page and user documentation |
| Web API (`api/src/Click2Approve.WebApi/`) | ASP.NET Core 10, Identity | HTTP endpoints, authentication, authorization, and workflow operations |
| Event publisher (`api/src/Click2Approve.EventPublisher/`) | .NET worker | Publishes committed outbox events and schedules deletion work |
| Event consumer (`api/src/Click2Approve.EventConsumer/`) | .NET worker | Processes queued notifications, account emails, and deletion work |
| Database | SQL Server / Azure SQL, Entity Framework Core | Accounts, requests, tasks, file metadata, outbox, and notification inbox |
| Storage | Azure Blob and Queue Storage | Private attachments, public profile images, and background delivery |

## Request and event flow

1. The browser calls the API to upload files, submit requests, or complete tasks.
2. The API applies authorization and workflow rules, storing relational changes
   and associated outbox events in the database.
3. The publisher sends committed events to high, medium, or low priority queues.
4. The consumer handles delivery, including in-app notifications and optional email.
   Failed deliveries retry and can move to the corresponding poison queue.

Run both workers even when email is disabled. Otherwise notifications and queued
cleanup work will not be processed. See [database transactions](database-transactions.md)
for atomicity and retry limitations.

## Repository layout

```text
api/
  src/                 # Domain, Application, Infrastructure, API, and workers
  tests/               # Backend unit, host, and provider integration tests
  Click2Approve.Api.sln # Backend solution
ui/
  src/
    app/               # App setup and routing
    features/          # Workflow, account, and other feature areas
    layouts/           # Page layouts
    shared/            # Shared components, configuration, and theme
  tests/browser/       # Browser regression tests
  docs/                # Public site, user guides, and MkDocs theme
  public/              # Static assets
docs/                  # Developer and operator documentation
scripts/               # Repository test runner
.github/workflows/     # CI and release workflows
docker-compose.yaml    # Complete local development environment
```

Developer and operator documentation lives in the root `docs/` directory.
User-facing guide content lives in `ui/docs/content/docs/`, with navigation in
`ui/mkdocs.yml`. UI component tests also live alongside source files.

## Backend structure

- **Domain:** Shared entities and workflow concepts.
- **Application:** Use cases, authorization rules, and service/persistence interfaces.
- **Infrastructure:** EF Core persistence, Azure storage, queues, and provider integrations.
- **WebApi:** HTTP endpoints, Identity integration, and host composition.

## Shared core and commercial extension

This repository contains the open-source foundation and the only frontend.
The commercial backend extends shared projects with organization management,
collaboration, receipts, subscriptions, and other commercial behavior. Commercial
persistence and billing logic live outside this repository.

The UI uses backend-provided capabilities to show supported features. See the
[edition comparison](../ui/docs/content/docs/open-source.md).

Nginx serves the built public site at `/`, guides at `/docs/`, and React at `/app/`.
See [frontend development](../ui/README.md) for UI and documentation conventions,
[configuration](configuration.md) for host settings, and [deployment](deployment.md)
for hosting options.
