using Click2Approve.Application.Helpers;
using Click2Approve.Application.Persistence;
using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Services.Tenants;

/// <summary>
/// Implements tenant business operations.
/// </summary>
public class TenantService(
    ITenantRepository tenantRepository,
    IApprovalRequestTaskRepository approvalRequestTaskRepository,
    IUnitOfWork unitOfWork) : ITenantService
{
    private readonly ITenantRepository _tenantRepository = tenantRepository;
    private readonly IApprovalRequestTaskRepository _approvalRequestTaskRepository = approvalRequestTaskRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;

    public virtual async Task<Tenant> CreateDefaultAsync(AppUser user, CancellationToken cancellationToken)
    {
        var existingTenant = await _tenantRepository.GetPersonalAsync(user, cancellationToken);
        if (existingTenant is not null)
        {
            return existingTenant;
        }

        var tenant = await _tenantRepository.AddAsync(new Tenant
        {
            BusinessName = GetDefaultBusinessName(user),
            Type = TenantType.Personal,
            Email = EmailHelpers.NormalizeEmailAddress(user.Email),
            Owner = user
        }, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        user.DefaultTenantId ??= tenant.Id;
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return tenant;
    }

    public virtual async Task<Tenant> GetRequiredDefaultAsync(AppUser user, CancellationToken cancellationToken)
    {
        return await _tenantRepository.GetPersonalAsync(user, cancellationToken)
            ?? await CreateDefaultAsync(user, cancellationToken);
    }

    public virtual async Task InitializeUserAsync(AppUser user, CancellationToken cancellationToken)
    {
        var tenant = await GetRequiredDefaultAsync(user, cancellationToken);
        if (user.DefaultTenantId is null)
        {
            user.DefaultTenantId = tenant.Id;
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        await ClaimEmailTasksAsync(user, tenant.Id, cancellationToken);
    }

    protected static string GetDefaultBusinessName(AppUser user)
    {
        return "Personal";
    }

    private async Task ClaimEmailTasksAsync(AppUser user, long personalTenantId, CancellationToken cancellationToken)
    {
        var updatedTaskCount = await _approvalRequestTaskRepository.ClaimEmailTasksAsync(user, personalTenantId, cancellationToken);
        if (updatedTaskCount > 0)
        {
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
