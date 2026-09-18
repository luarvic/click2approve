# Database transactions

Use an explicit unit-of-work transaction for atomic database workflows:

```csharp
await using var transaction = await unitOfWork.BeginTransactionAsync(cancellationToken);
// Read, validate, and update data. Intermediate saves remain in this transaction.
await unitOfWork.SaveChangesAsync(cancellationToken);
await transaction.CommitAsync(cancellationToken);
```

Disposing without committing rolls back the transaction and clears tracked state.
After a failed operation, reload entities before making further changes. Explicitly
save before committing; the transaction does not implicitly call SaveChanges.

`ApiDbContext` deliberately disables EF execution-strategy retries for all its
operations, including inherited commercial contexts and Azure SQL's default
retry policy. EF's retrying strategy conflicts with user-managed transactions:
it must own and replay the complete transaction body. We choose explicit
transaction ownership and propagate failures instead of automatically replaying
intermediate saves, billing calls, or file operations. This also disables EF
retries outside explicit transactions. Queue redelivery and provider-specific
reconciliation retain their own policies.

A connection failure during commit can leave the outcome unknown: the database
may have committed even though the caller received an exception. There is no
automatic commit verification or replay; inspect persisted state before repeating
an operation that could produce duplicates or external effects.

Standalone audited saves wrap data and audit records in one explicit transaction.
Inside an existing transaction they join it. No tracked-state snapshots or retry
callbacks are needed. These guarantees apply to the asynchronous unit-of-work
save path; synchronous saves, other EF save overloads, and bulk SQL operations do
not run this auditing override.
