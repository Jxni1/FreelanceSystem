using Microsoft.AspNetCore.Authorization;

namespace LabCourse2.API.Authorization
{
    public class HasPermissionAttribute : AuthorizeAttribute
    {
        public const string PolicyPrefix = "Permission:";

        public HasPermissionAttribute(string permission)
            : base($"{PolicyPrefix}{permission}")
        {
        }
    }
}
