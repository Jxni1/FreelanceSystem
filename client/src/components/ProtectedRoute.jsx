import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasAnyRole } from '../lib/jwt';

export function ProtectedRoute({ requiredRoles = [] }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin" aria-hidden="true" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (requiredRoles.length > 0 && !hasAnyRole(user, requiredRoles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
