import { useAuth } from '../context/AuthContext';
import { hasRole, hasAnyRole, hasAllRoles } from '../lib/jwt';
import { ROLES } from '../constants/roles';

export function useAuthorization() {
  const { user } = useAuth();
  const profileType = (user?.profileType ?? '').toLowerCase();

  const isClientByRole = hasRole(user, ROLES.CLIENT);
  const isFreelancerByRole = hasRole(user, ROLES.FREELANCER);

  return {
    can: (role) => hasRole(user, role),
    canAny: (roles) => hasAnyRole(user, roles),
    canAll: (roles) => hasAllRoles(user, roles),
    profileType: user?.profileType ?? null,
    isAdmin: hasRole(user, ROLES.ADMIN),
    isFreelancer: isFreelancerByRole || profileType === 'freelancer',
    isClient: isClientByRole || profileType === 'client',
  };
}
