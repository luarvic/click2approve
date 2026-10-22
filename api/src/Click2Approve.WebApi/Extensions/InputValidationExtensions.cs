using System.Reflection;
using Click2Approve.WebApi.Validation;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace Click2Approve.WebApi.Extensions;

/// <summary>Registers the API and application validators owned by each edition.</summary>
public static class InputValidationExtensions
{
    public static IMvcBuilder AddInputValidation(this IMvcBuilder builder, params Assembly[] assemblies)
    {
        builder.AddMvcOptions(options => options.Filters.Add<RequestValidationFilter>());
        foreach (var assembly in assemblies.Distinct())
        {
            foreach (var type in assembly.GetTypes().Where(type => !type.IsAbstract && !type.IsGenericTypeDefinition))
            {
                foreach (var contract in type.GetInterfaces().Where(contract =>
                    contract.IsGenericType && contract.GetGenericTypeDefinition() == typeof(IValidator<>)))
                    builder.Services.TryAddScoped(contract, type);
            }
        }
        return builder;
    }
}
