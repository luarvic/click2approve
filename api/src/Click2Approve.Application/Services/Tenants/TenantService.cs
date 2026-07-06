using Click2Approve.Application.Persistence;
using Click2Approve.Domain.Models;

namespace Click2Approve.Application.Services.Tenants;

/// <summary>
/// Implements tenant business operations.
/// </summary>
public class TenantService(
    ITenantRepository tenantRepository,
    IUnitOfWork unitOfWork) : ITenantService
{
    private readonly ITenantRepository _tenantRepository = tenantRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;

    public virtual async Task<Tenant> CreateDefaultForUserAsync(AppUser user, CancellationToken cancellationToken)
    {
        var existingTenant = await _tenantRepository.GetDefaultForUserAsync(user, cancellationToken);
        if (existingTenant is not null)
        {
            return existingTenant;
        }

        var tenant = await _tenantRepository.AddAsync(new Tenant
        {
            BusinessName = GetDefaultBusinessName(user),
            Email = user.Email,
            Owner = user
        }, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return tenant;
    }

    public virtual async Task<Tenant> GetRequiredDefaultForUserAsync(AppUser user, CancellationToken cancellationToken)
    {
        return await _tenantRepository.GetDefaultForUserAsync(user, cancellationToken)
            ?? await CreateDefaultForUserAsync(user, cancellationToken);
    }

    protected static string GetDefaultBusinessName(AppUser user)
    {
        var email = user.Email ?? user.UserName ?? user.Id;
        var atIndex = email.IndexOf('@', StringComparison.Ordinal);
        return atIndex > 0 ? email[..atIndex] : email;
    }
}
