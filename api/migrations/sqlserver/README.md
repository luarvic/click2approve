# SQL Server schema upgrades

Apply timestamped folders chronologically, running `01_up.sql` then `02_verify.sql`
with an authorized deployment identity. Scripts upgrade existing databases without
recreating them and are atomic and safe to rerun. The application does not apply
migrations automatically. Fresh-database EF mappings include the same schema.

## 20261113221420: guest approval contracts

Adds `ApprovalRequestStepAssignees.AccountSignInRequired` (`bit NOT NULL`, default
true) and `ApprovalRequestTasks.CompletedViaEmailLink` (`bit NULL`). Existing
assignments retain sign-in; existing decisions remain unspecified. Employee and
team assignees must require sign-in. No data is removed or new tables created.
Commercial deployments apply this folder before the corresponding private migration.
Guest authorization remains a commercial capability. These additive columns may
remain when rolling back application images.

## 20261124160000: deletion command outbox

Renames `DeletionPublishedAt` to `DeletionRequestedAt` on deletion targets and
clears legacy markers so the scheduler can recheck surviving rows. Removes the
obsolete marker from `EventOutboxMessages` and preserves pending events.

Stop the application hosts before the upgrade. Commercial deployments apply this
folder before the corresponding private migration. Start the matching application
version after verification. To roll back, restore the pre-upgrade database backup
and run the previous application version.
