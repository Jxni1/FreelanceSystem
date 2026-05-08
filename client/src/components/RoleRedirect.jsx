import { Navigate } from 'react-router-dom';
import { useAuthorization } from '../hooks/useAuthorization';

export function RoleRedirect({ freelancerTo = '/discover', defaultTo = '/home' }) {
  const { isFreelancer } = useAuthorization();
  return <Navigate to={isFreelancer ? freelancerTo : defaultTo} replace />;
}
