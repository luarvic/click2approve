using Click2Approve.Application.Services.AuditLogService;
using Click2Approve.Application.Persistence;
using Click2Approve.Application.Services.TenantContext;
using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Services.AuditLogService;

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

    public async Task LogAsync(AppUser user, DateTime when, string what, string jsonData, CancellationToken cancellationToken)
    {
        var tenantId = await _tenantContext.GetRequiredTenantIdAsync(user, cancellationToken);
        await _auditLogRepository.AddAsync(new AuditLogEntry
        {
            TenantId = tenantId,
            Who = user.NormalizedEmail!,
            When = when,
            What = what,
            Data = jsonData
        }, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
