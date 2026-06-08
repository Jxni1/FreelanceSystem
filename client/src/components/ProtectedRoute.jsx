import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';

export function ProtectedRoute({
  requiredRoles = [],
  requiredPermission,
  requiredRole,
  fallbackPath = '/dashboard',
  requireAll = false,
}) {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const { hasPermission, hasAllPermissions, hasRole, hasAnyRole, loading: permLoading } = usePermissions();

  if (isLoading || permLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin" aria-hidden="true" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return <Navigate to={fallbackPath} replace />;
  }

  if (requiredPermission) {
    const permissions = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission];
    const hasPermCheck = requireAll ? hasAllPermissions(permissions) : permissions.some((p) => hasPermission(p));
    if (!hasPermCheck) {
      return <Navigate to={fallbackPath} replace />;
    }
  }

  if (requiredRole) {
    const rolesArray = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const hasRoleCheck = requireAll ? rolesArray.every((r) => hasRole(r)) : rolesArray.some((r) => hasRole(r));
    if (!hasRoleCheck) {
      return <Navigate to={fallbackPath} replace />;
    }
  }

  return <Outlet />;
}
