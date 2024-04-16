using click2approve.WebAPI.Models;

namespace click2approve.WebAPI.Tests.Models;

/// <summary>
///  Represents a test scenario for UserFileController class.
/// </summary>
public class UserFileControllerTestScenarioData
{
  public required Credentials Credentials { get; set; }
  public string? AccessToken { get; set; }
  public required Dictionary<string, string> FilesToUpload { get; set; }
  public List<UserFile> UploadedFiles { get; set; } = [];
}
