import { useEffect, useState } from 'react';

export const usePermissions = () => {
  const [permissions, setPermissions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedPermissions = localStorage.getItem('userPermissions');
    const savedRoles = localStorage.getItem('userRoles');

    if (savedPermissions) {
      setPermissions(JSON.parse(savedPermissions));
    }
    if (savedRoles) {
      setRoles(JSON.parse(savedRoles));
    }

    setLoading(false);
  }, []);

  const hasPermission = (permission) => {
    if (!Array.isArray(permissions)) return false;
    return permissions.includes(permission);
  };

  const hasRole = (role) => {
    if (!Array.isArray(roles)) return false;
    return roles.includes(role);
  };

  const hasAnyPermission = (permissionList) => {
    if (!Array.isArray(permissionList) || !Array.isArray(permissions)) return false;
    return permissionList.some((p) => permissions.includes(p));
  };

  const hasAllPermissions = (permissionList) => {
    if (!Array.isArray(permissionList) || !Array.isArray(permissions)) return false;
    return permissionList.every((p) => permissions.includes(p));
  };

  const hasAnyRole = (roleList) => {
    if (!Array.isArray(roleList) || !Array.isArray(roles)) return false;
    return roleList.some((r) => roles.includes(r));
  };

  const refreshPermissions = async (apiCall) => {
    try {
      const response = await apiCall();
      if (response?.data?.permissions) {
        setPermissions(response.data.permissions);
        localStorage.setItem('userPermissions', JSON.stringify(response.data.permissions));
      }
      if (response?.data?.roles) {
        setRoles(response.data.roles);
        localStorage.setItem('userRoles', JSON.stringify(response.data.roles));
      }
    } catch (error) {
      console.error('Failed to refresh permissions:', error);
    }
  };

  return {
    permissions,
    roles,
    loading,
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
    hasAnyRole,
    refreshPermissions,
  };
};