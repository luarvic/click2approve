using Click2Approve.Application.Models.Files;
using Click2Approve.Domain.Validation;
using FluentValidation;

namespace Click2Approve.Application.Validation.Inputs;

/// <summary>Validates uploaded metadata and actual byte counts before storing files.</summary>
public sealed class UploadedFileValidator : AbstractValidator<UploadedFile>
{
    public UploadedFileValidator()
    {
        RuleFor(file => file.FileName).NotEmpty().MaximumLength(FieldLimits.Name);
        RuleFor(file => file.ContentType).NotNull().MaximumLength(FieldLimits.Name);
        RuleFor(file => file.Length).GreaterThanOrEqualTo(0)
            .Must((file, length) => file.Bytes is not null && file.Bytes.LongLength == length)
            .WithMessage("File size does not match the uploaded content.");
    }
}
