using Click2Approve.Domain.Validation;
using FluentValidation;
using FluentValidation.Results;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Click2Approve.WebApi.Validation;

/// <summary>Validates controller inputs asynchronously before any action can perform work.</summary>
public sealed class RequestValidationFilter : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var failures = new List<ValidationFailure>();
        foreach (var (name, argument) in context.ActionArguments)
        {
            if (argument is Guid id && id == Guid.Empty)
                failures.Add(new ValidationFailure(name, "A non-empty identifier is required."));
            if (argument is string text && text.Length > FieldLimits.Text)
                failures.Add(new ValidationFailure(name, $"Input must not exceed {FieldLimits.Text:N0} characters."));
            if (argument is IReadOnlyCollection<Guid> ids && (ids.Count > CollectionLimits.Items || ids.Contains(Guid.Empty)))
                failures.Add(new ValidationFailure(name, $"Provide at most {CollectionLimits.Items:N0} non-empty identifiers."));
            if (argument is IFormFileCollection uploads && uploads.Count > CollectionLimits.Files)
                failures.Add(new ValidationFailure(name, $"Upload at most {CollectionLimits.Files} files at a time."));
            if (argument is null) continue;
            var validatorType = typeof(IValidator<>).MakeGenericType(argument.GetType());
            if (context.HttpContext.RequestServices.GetService(validatorType) is IValidator validator)
            {
                var result = await validator.ValidateAsync(new ValidationContext<object>(argument), context.HttpContext.RequestAborted);
                failures.AddRange(result.Errors);
            }
            if (argument is IFormFile file) ValidateFile(file, name, failures);
            if (argument is IFormFileCollection files)
                foreach (var item in files) ValidateFile(item, name, failures);
        }
        if (failures.Count > 0) throw new ValidationException(failures);
        await next();
    }

    private static void ValidateFile(IFormFile file, string name, List<ValidationFailure> failures)
    {
        if (string.IsNullOrWhiteSpace(file.FileName) || file.FileName.Length > FieldLimits.Name)
            failures.Add(new ValidationFailure(name, $"Filename must contain between 1 and {FieldLimits.Name} characters."));
        if (file.ContentType.Length > FieldLimits.Name)
            failures.Add(new ValidationFailure(name, $"Content type must not exceed {FieldLimits.Name} characters."));
    }
}
