# Local development and testing

Run commands from the repository root unless a `cd` command is shown. Install
the .NET 10 SDK and Node.js 24, plus Docker for SQL Server and Azurite.

For the complete app in Docker, use the [quick start](../README.md#run-locally).
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
browser regression, lint, production build, and strict documentation validation.

Start Azurite with `docker compose up -d azurite`. From `ui/`, run `npm ci`,
`npx playwright install chromium`, and install the documentation dependencies
following [the UI guide](../ui/README.md#user-documentation). Then, from the repository root:

```bash
C2A_TEST_AZURITE=UseDevelopmentStorage=true node scripts/test.mjs
```

In VS Code, **Terminal → Run Task → test** supplies the Azurite setting.
SQL Server and the commercial repository are not required for this suite.
