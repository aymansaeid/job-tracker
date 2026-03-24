using FluentValidation;
using JobTracker.Application.DTOs.Applications;

namespace JobTracker.Application.Validators;

public class UpdateJobApplicationRequestValidator : AbstractValidator<UpdateJobApplicationRequest>
{
    public UpdateJobApplicationRequestValidator()
    {
        RuleFor(x => x.CompanyName)
            .NotEmpty()
            .MaximumLength(120);

        RuleFor(x => x.JobTitle)
            .NotEmpty()
            .MaximumLength(120);

        RuleFor(x => x.JobUrl)
            .MaximumLength(500)
            .When(x => !string.IsNullOrWhiteSpace(x.JobUrl));

        RuleFor(x => x.Location)
            .MaximumLength(120)
            .When(x => !string.IsNullOrWhiteSpace(x.Location));

        RuleFor(x => x.Notes)
            .MaximumLength(2000)
            .When(x => !string.IsNullOrWhiteSpace(x.Notes));
    }
}