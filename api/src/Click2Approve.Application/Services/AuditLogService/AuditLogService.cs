using Click2Approve.Application.Services.AuditLogService;
using Click2Approve.Application.Persistence;
using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Services.AuditLogService;

/// <summary>
/// Adds an audit log entry.
/// </summary>
public class AuditLogService(
    IAuditLogRepository auditLogRepository,
    IUnitOfWork unitOfWork) : IAuditLogService
{
    private readonly IAuditLogRepository _auditLogRepository = auditLogRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;

    public async Task LogAsync(string who, DateTime when, string what, string jsonData, CancellationToken cancellationToken)
    {
        await _auditLogRepository.AddAsync(new AuditLogEntry
        {
            Who = who,
            When = when,
            What = what,
            Data = jsonData
        }, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
