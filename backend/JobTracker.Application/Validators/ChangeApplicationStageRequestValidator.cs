using FluentValidation;
using JobTracker.Application.DTOs.Applications;

namespace JobTracker.Application.Validators;

public class ChangeApplicationStageRequestValidator : AbstractValidator<ChangeApplicationStageRequest>
{
    public ChangeApplicationStageRequestValidator()
    {
        RuleFor(x => x.Comment)
            .MaximumLength(500)
            .When(x => !string.IsNullOrWhiteSpace(x.Comment));
    }
}