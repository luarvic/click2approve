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

`ApiDbContext` disables EF execution-strategy retries, including outside explicit
transactions. Failures propagate to callers; the application does not replay
intermediate saves or external side effects. Queue redelivery has its own retry policy.

A connection failure during commit can leave the outcome unknown: the database
may have committed even though the caller received an exception. There is no
automatic commit verification or replay; inspect persisted state before repeating
an operation that could produce duplicates or external effects.

Standalone audited saves wrap data and audit records in one explicit transaction.
Inside an existing transaction they join it. These guarantees apply to the
asynchronous unit-of-work save path; synchronous saves, other EF save overloads, and bulk SQL operations do
not run this auditing override.
