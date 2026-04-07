import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AuthEventHandler } from './components/AuthEventHandler';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { SecurityAlertPage } from './pages/auth/SecurityAlertPage';
import { ROLES } from './constants/roles';

const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const AdminPanelPage = lazy(() => import('./pages/admin/AdminPanelPage'));
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'));

const GlobalSuspenseLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin" aria-hidden="true" />
      <span className="text-sm font-medium text-slate-500 uppercase tracking-widest animate-pulse">Loading Page...</span>
    </div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AuthEventHandler />
        <Suspense fallback={<GlobalSuspenseLoader />}>
          <Routes>
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/register" element={<RegisterPage />} />
            <Route path="/auth/security-alert" element={<SecurityAlertPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            <Route element={<ProtectedRoute requiredRoles={[ROLES.ADMIN]} />}>
              <Route path="/admin" element={<AdminPanelPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
