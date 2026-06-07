import { Navigate } from 'react-router-dom';
import { useAuthorization } from '../../hooks/useAuthorization';
import ClientHomePage from './ClientHomePage';
import FreelancerHomePage from './FreelancerHomePage';

export default function DashboardPage() {
  const { isAdmin, isFreelancer } = useAuthorization();

  if (isAdmin) return <Navigate to="/admin" replace />;
  if (isFreelancer) return <FreelancerHomePage />;
  return <ClientHomePage />;
}
