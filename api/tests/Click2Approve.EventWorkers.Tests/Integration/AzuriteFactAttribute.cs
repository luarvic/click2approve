namespace Click2Approve.EventWorkers.Tests.Integration;

/// <summary>Enables isolated Azure Queue tests when a test storage connection is supplied.</summary>
public sealed class AzuriteFactAttribute : FactAttribute
{
    public AzuriteFactAttribute()
    {
        if (string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("C2A_TEST_AZURITE")))
            Skip = "Set C2A_TEST_AZURITE to an Azurite connection string.";
    }
}
