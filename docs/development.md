# Local development and testing

Run commands from the repository root unless a `cd` command is shown. Install
the .NET 10 SDK and Node.js 24, plus Docker for SQL Server and Azurite.

For the complete app in Docker, use the [quick start](../README.md#try-it-locally).
The instructions below run each component from source.

## API

```bash
dotnet restore api/Click2Approve.Api.sln
dotnet build api/Click2Approve.Api.sln
dotnet test api/Click2Approve.Api.sln
```

The queue and blob integration tests require `C2A_TEST_AZURITE`; see
[Complete test suite](#complete-test-suite) below.

To run the API locally from source, start the local SQL Server database and Azure
Blob and Queue Storage emulator first from the repository root:

```bash
docker compose up -d db azurite
```

Then run the Web API project:

```bash
ASPNETCORE_ENVIRONMENT=Development dotnet run --project api/src/Click2Approve.WebApi/Click2Approve.WebApi.csproj
```

Run each worker in a separate terminal for notifications and queued cleanup:

```bash
DOTNET_ENVIRONMENT=Development dotnet run --project api/src/Click2Approve.EventPublisher/Click2Approve.EventPublisher.csproj
DOTNET_ENVIRONMENT=Development dotnet run --project api/src/Click2Approve.EventConsumer/Click2Approve.EventConsumer.csproj
```

The examples use Bash/Zsh environment-variable syntax. In PowerShell, set
`$env:ASPNETCORE_ENVIRONMENT="Development"` for the API or
`$env:DOTNET_ENVIRONMENT="Development"` for each worker before running `dotnet run`.

The API listens on port 5555; its reference is at
[http://localhost:5555/swagger/](http://localhost:5555/swagger/).
See [configuration](configuration.md) for settings and email setup.

## UI

```bash
cd ui
npm ci
npm run dev
```

Open [http://localhost:3333/app/](http://localhost:3333/app/) for the React app.
The landing page and guides also need the MkDocs preview; see
[user documentation development](../ui/README.md#user-documentation).

## Complete test suite

The public test runner covers API and UI tests, Blob/Queue integration, attachment
browser regression, portal and analytics browser checks with analytics disabled
and enabled, fresh Compose startup, lint, production build, and strict documentation
validation. Browser checks run locally; public main, feature, and release CI runs
API/provider tests, UI unit tests, lint, build, and strict documentation validation.

Start Azurite with `docker compose up -d azurite`. From `ui/`, run `npm ci`,
`npx playwright install chromium`, and install the documentation dependencies
following [the UI guide](../ui/README.md#user-documentation). Then, from the repository root:

```bash
C2A_TEST_AZURITE=UseDevelopmentStorage=true node scripts/test.mjs
```

In VS Code, **Terminal → Run Task → test** supplies the Azurite setting.
The Compose regression starts its own disposable SQL Server; no separately
configured SQL Server or commercial repository is required. Docker is required
for the packaged portal and Compose checks, even with Azurite already running.

The same runner accepts `api`, `ui`, `attachments`, `portal`, `portal-analytics`,
and `compose` to run one group. For example, `node scripts/test.mjs attachments`
runs the attachment browser regression; omitting the group runs the full suite.
Only `api` and the full suite require `C2A_TEST_AZURITE`.

CI runs API and UI/docs in separate jobs without installing or launching browsers.
Run the complete local suite before merging or releasing. Attachment previews,
portal/analytics browser checks in both modes, and fresh Compose startup are
local-only because of CI timeout risk. The commercial repository follows the
same local-only browser policy.

## Docker startup check

The local Compose stack waits for a successful SQL query, then starts the API.
Workers and UI wait until the API responds after database initialization. This
prevents worker connections from blocking initial SQL Server configuration.

If the app cannot connect, inspect `docker compose ps -a` and
`docker compose logs api` from the repository root. An API startup failure can
leave the browser reporting a network error even though the UI container is up.

With Docker and the UI's Playwright Chromium installed, run:

```sh
cd ui
npm run test:compose
```

This builds and starts a separate Compose project with fresh disposable SQL
Server storage and dynamically assigned ports. It verifies snapshot isolation,
application tables, API readiness, worker startup, and the app's sign-in screen.
It removes only its own test containers and volumes when finished.
