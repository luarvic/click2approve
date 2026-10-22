namespace Click2Approve.Domain.Validation;

/// <summary>Defines input collection ceilings shared by request and command validation.</summary>
public static class CollectionLimits
{
    public const int Items = 1000;
    public const int Files = 100;
    public const int WorkflowSteps = 100;
    public const int StepAssignees = 100;
    public const int NotificationActionItems = 100;
}
