using Click2Approve.Application.Persistence;
using Click2Approve.Application.Services.TenantContext;
using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Services.AuditLogs;

/// <summary>
/// Adds an audit log entry.
/// </summary>
public class AuditLogService(
    IAuditLogRepository auditLogRepository,
    ITenantContext tenantContext,
    IUnitOfWork unitOfWork) : IAuditLogService
{
    private readonly IAuditLogRepository _auditLogRepository = auditLogRepository;
    private readonly ITenantContext _tenantContext = tenantContext;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;

    public async Task LogAsync(AppUser user, DateTime occurredAt, string what, string jsonData, CancellationToken cancellationToken)
    {
        var tenantId = await _tenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        await _auditLogRepository.AddAsync(new AuditLogEntry
        {
            TenantId = tenantId,
            Who = user.NormalizedEmail!,
            OccurredAt = occurredAt,
            What = what,
            Data = jsonData
        }, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
