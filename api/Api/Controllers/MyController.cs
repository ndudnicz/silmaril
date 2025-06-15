using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("v1/[controller]")]
public abstract class MyControllerV1: ControllerBase
{
    protected MyControllerV1() {}
}