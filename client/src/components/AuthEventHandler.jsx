import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function AuthEventHandler() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const handleTheft = async () => {
      await logout();
      navigate('/auth/security-alert', { replace: true });
    };

    const handleDeactivated = async () => {
      await logout();
      navigate('/auth/login', { 
        replace: true, 
        state: { message: 'Your account has been deactivated.' } 
      });
    };

    window.addEventListener('auth:theft-detected', handleTheft);
    window.addEventListener('auth:deactivated', handleDeactivated);

    return () => {
      window.removeEventListener('auth:theft-detected', handleTheft);
      window.removeEventListener('auth:deactivated', handleDeactivated);
    };
  }, [logout, navigate]);

  return null;
}
