import { useEffect, useState } from 'react';

/**
 * Custom hook for managing user permissions and roles
 * Provides methods to check if user has specific permissions or roles
 */
export const usePermissions = () => {
  const [permissions, setPermissions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load permissions from localStorage on mount
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

  /**
   * Check if user has a specific permission
   * @param {string} permission - The permission name (e.g., "projects.create")
   * @returns {boolean} True if user has the permission
   */
  const hasPermission = (permission) => {
    if (!Array.isArray(permissions)) return false;
    return permissions.includes(permission);
  };

  /**
   * Check if user has a specific role
   * @param {string} role - The role name (e.g., "Admin", "Client", "Freelancer")
   * @returns {boolean} True if user has the role
   */
  const hasRole = (role) => {
    if (!Array.isArray(roles)) return false;
    return roles.includes(role);
  };

  /**
   * Check if user has ANY of the specified permissions
   * @param {string[]} permissionList - Array of permission names
   * @returns {boolean} True if user has at least one of the permissions
   */
  const hasAnyPermission = (permissionList) => {
    if (!Array.isArray(permissionList) || !Array.isArray(permissions)) return false;
    return permissionList.some((p) => permissions.includes(p));
  };

  /**
   * Check if user has ALL of the specified permissions
   * @param {string[]} permissionList - Array of permission names
   * @returns {boolean} True if user has all the permissions
   */
  const hasAllPermissions = (permissionList) => {
    if (!Array.isArray(permissionList) || !Array.isArray(permissions)) return false;
    return permissionList.every((p) => permissions.includes(p));
  };

  /**
   * Check if user has ANY of the specified roles
   * @param {string[]} roleList - Array of role names
   * @returns {boolean} True if user has at least one of the roles
   */
  const hasAnyRole = (roleList) => {
    if (!Array.isArray(roleList) || !Array.isArray(roles)) return false;
    return roleList.some((r) => roles.includes(r));
  };

  /**
   * Update permissions and roles from the API
   * Fetches fresh data from backend
   * @param {Function} apiCall - Function to call the API endpoint
   */
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
