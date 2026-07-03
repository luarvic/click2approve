using Click2Approve.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace Click2Approve.Application.Persistence;

/// <summary>
/// Defines the persistence operations required by application services.
/// </summary>
public interface IApiDbContext
{
    DbSet<ApprovalRequest> ApprovalRequests { get; set; }
    DbSet<ApprovalRequestTask> ApprovalRequestTasks { get; set; }
    DbSet<AuditLogEntry> AuditLogEntries { get; set; }
    DbSet<UserFile> UserFiles { get; set; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
