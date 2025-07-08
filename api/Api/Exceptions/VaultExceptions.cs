using System.Net;

namespace Api.Exceptions;

public class VaultNotFound(string propertyName, string properties) : MyException($"Vault with {propertyName} '{properties}' not found.")
{
    public override HttpStatusCode StatusCode => HttpStatusCode.NotFound;
}

public class VaultsNotFound(string propertyName, string properties) : MyException($"Vaults with {propertyName} '{properties}' not found.")
{
    public override HttpStatusCode StatusCode => HttpStatusCode.NotFound;
}