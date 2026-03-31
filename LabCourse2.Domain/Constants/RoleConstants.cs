namespace LabCourse2.Domain.Constants
{
    public static class RoleConstants
    {
        public const string Admin = "Admin";
        public const string Freelancer = "Freelancer";
        public const string Client = "Client";

        public static readonly string[] PublicRoles = { Freelancer, Client };
        public static readonly string[] AllRoles = { Admin, Freelancer, Client };
    }
}
