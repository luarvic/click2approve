namespace Click2Approve.WebApi.Validation;

/// <summary>Defines the total request-body limit for attachment uploads, including multipart overhead.</summary>
public static class UploadLimits
{
    public const long MaximumRequestBodyBytes = 128L * 1024 * 1024;
}
