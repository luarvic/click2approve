namespace Click2Approve.Application.Services.Identity;

/// <summary>Configures the per-account allowance for one kind of security email.</summary>
public sealed class AccountEmailRateLimitOptions
{
    public int EmailPermitLimit { get; set; }
    public int EmailWindowMinutes { get; set; }
}
