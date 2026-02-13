namespace Click2Approve.WebAPI.Tests.Models;

/// <summary>
///  Represents a test data entry for UserFileController class.
/// </summary>
public class UserFileControllerTestDataEntry
{
  public required Credentials Credentials { get; set; }
  public required Dictionary<string, string> FilesToUpload { get; set; }
}
