namespace Click2Approve.Domain.Validation;

/// <summary>Defines supported grid pagination bounds.</summary>
public static class PaginationLimits
{
    public const int MinimumPage = 0;
    public const int MaximumPage = 1000000;
    public const int MinimumPageSize = 1;
    public const int MaximumPageSize = 100;
}
