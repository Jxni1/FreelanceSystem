import { useAuth } from '../context/AuthContext';
import { hasRole, hasAnyRole, hasAllRoles } from '../lib/jwt';
import { ROLES } from '../constants/roles';

export function useAuthorization() {
  const { user } = useAuth();

  return {
    can: (role) => hasRole(user, role),
    canAny: (roles) => hasAnyRole(user, roles),
    canAll: (roles) => hasAllRoles(user, roles),
    profileType: user?.profileType ?? null,
    isAdmin: hasRole(user, ROLES.ADMIN),
    isFreelancer: hasRole(user, ROLES.FREELANCER),
    isClient: hasRole(user, ROLES.CLIENT),
  };
}
