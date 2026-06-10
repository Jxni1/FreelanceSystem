import { useAuth } from '../context/AuthContext';

export const usePermissions = () => {
  const { permissions, roles, isLoading, refreshPermissions } = useAuth();

  const hasPermission = (permission) =>
    Array.isArray(permissions) && permissions.includes(permission);

  const hasRole = (role) =>
    Array.isArray(roles) && roles.includes(role);

  const hasAnyPermission = (permissionList) =>
    Array.isArray(permissionList) &&
    Array.isArray(permissions) &&
    permissionList.some((p) => permissions.includes(p));

  const hasAllPermissions = (permissionList) =>
    Array.isArray(permissionList) &&
    Array.isArray(permissions) &&
    permissionList.every((p) => permissions.includes(p));

  const hasAnyRole = (roleList) =>
    Array.isArray(roleList) &&
    Array.isArray(roles) &&
    roleList.some((r) => roles.includes(r));

  return {
    permissions,
    roles,
    loading: isLoading,
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
    hasAnyRole,
    refreshPermissions,
  };
};
