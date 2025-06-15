using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Api.Controllers.Attributes;

public class ValidateUserIdMatchesDtoAttribute(string dtoPropertyName = "UserId") : ActionFilterAttribute
{
    public override void OnActionExecuting(ActionExecutingContext context)
    {
        var user = context.HttpContext.User;
        var userIdClaim = user.FindFirst(ClaimTypes.Name)?.Value;

        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var claimUserId))
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        var dto = context.ActionArguments.Values.FirstOrDefault();
        if (dto == null)
        {
            context.Result = new BadRequestObjectResult("Missing request body.");
            return;
        }

        var dtoProperty = dto.GetType().GetProperty(dtoPropertyName);
        if (dtoProperty == null)
        {
            context.Result = new BadRequestObjectResult($"Property {dtoPropertyName} not found.");
            return;
        }

        var dtoUserId = dtoProperty.GetValue(dto);
        if (dtoUserId == null || !Guid.TryParse(dtoUserId.ToString(), out var dtoGuid))
        {
            context.Result = new BadRequestObjectResult("Invalid UserId in body.");
            return;
        }

        if (dtoGuid != claimUserId)
        {
            context.Result = new BadRequestObjectResult("User ID mismatch.");
        }
    }
}
