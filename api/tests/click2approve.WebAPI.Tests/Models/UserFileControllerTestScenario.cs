namespace click2approve.WebAPI.Tests.Models;

/// <summary>
///  Represents a test scenario for UserFileController class.
/// </summary>
public class UserFileControllerTestScenario
{
  public required Credentials Credentials { get; set; }
  public string? AccessToken { get; set; }
  public required Dictionary<string, string> Files { get; set; }
}
