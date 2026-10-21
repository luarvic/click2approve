# Deployment overview

The open-source edition can run in Azure or on your own infrastructure. Compose is
for local development; production hosting needs persistent storage, secure
configuration, and operational monitoring. For the commercial service, visit
[Click2Approve](https://click2approve.com/).

## Workloads and dependencies

Deploy the UI, API, event publisher, and event consumer using the Dockerfiles in
`ui/` and `api/`. Both workers are needed for notifications and queued cleanup.
Provide SQL Server or Azure SQL, Azure Blob Storage for files, and Azure Queue
Storage for background events.

Enabled email currently uses Azure Communication Services Email. Review its
[retirement and the non-Azure FluentEmail integration option](configuration.md#email-providers-and-azure-retirement)
before deployment. See [configuration](configuration.md) for settings and secrets.

## Azure

One possible setup uses Azure Container Apps for the UI, API, and consumer, an
always-running container or VM for the polling publisher, Azure SQL, and an Azure
Storage account with Blob and Queue services.

Grant workload identities the required database, storage, and email permissions.
The consumer can scale on its three priority queues; the publisher needs an active
process to discover SQL outbox work. Configure networking, HTTPS ingress, and
monitoring for your environment.

## On-premises

Run the application workloads on container hosts or VMs with SQL Server and a
reverse proxy providing HTTPS. Azure Blob and Queue Storage are still required
by the current providers; replacing them requires code changes. Azurite is a local
emulator. The email integration option is described above.

## Production essentials

- **Data:** Use persistent storage and tested backups. Compose data is disposable;
  its SQL Server Developer Edition image is for development.
- **Schema upgrades:** The API uses `EnsureCreated()` to initialize empty databases.
  It does not migrate existing schemas; plan and validate upgrades separately.
- **Storage permissions:** Keep attachments private and allow blob-level public
  reads for profile images. Runtime identities need the required data access.
- **Domain and routes:** Serve the site at `/`, guides at `/docs/`, and app at
  `/app/`. Route `/api/` and `/swagger/` to the API for a shared origin, or set a
  separate API URL and CORS origins. Rebuild the UI for your domain.
- **Security:** Replace development credentials, use production profiles, configure
  HTTPS passkey origins, and verify account email delivery. Persist Data Protection
  keys and share them between API replicas so Identity tokens survive restarts.
- **Operations:** Monitor API and workers, outbox and queue backlogs, poison queues,
  storage, and delivery failures. Align proxy and API upload limits.
- **Public pages:** Review branding and bundled Terms and Privacy before publishing.
  See [license and trademark](license-and-trademark.md).
