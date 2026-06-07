import { Navigate } from 'react-router-dom';
import { useAuthorization } from '../hooks/useAuthorization';

export function RoleRedirect() {
  const { isAdmin } = useAuthorization();
  return <Navigate to={isAdmin ? '/admin' : '/home'} replace />;
}
