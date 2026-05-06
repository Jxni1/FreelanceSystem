import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AuthEventHandler } from "./components/AuthEventHandler";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppShell } from "./components/AppShell";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { SecurityAlertPage } from "./pages/auth/SecurityAlertPage";
import { ROLES } from "./constants/roles";
const DashboardPage = lazy(() => import("./pages/dashboard/DashboardPage"));
const AdminPanelPage = lazy(() => import("./pages/admin/AdminPanelPage"));
const ProfilePage = lazy(() => import("./pages/profile/ProfilePage"));

import { AdminLayout } from "./pages/admin/AdminLayout";
import EditProfilePage from "./pages/profile/EditProfile";
const ProjectsListPage = lazy(() =>
  import("./pages/projects/ProjectsListPage")
);
const ProjectDetailsPage = lazy(() =>
  import("./pages/projects/ProjectDetailsPage")
);
const ProjectFormPage = lazy(() => import("./pages/projects/ProjectFormPage"));

const SkillsListPage = lazy(() =>
  import("./pages/admin/skills/SkillsListPage")
);
const SkillFormPage = lazy(() => import("./pages/admin/skills/SkillFormPage"));

const AdminUsersPage = lazy(() => import("./pages/admin/AdminUsersPage"));




const ContractsListPage = lazy(() =>
  import("./pages/contracts/ContractsListPage")
);
const ContractDetailsPage = lazy(() =>
  import("./pages/contracts/ContractDetailPage")
);
const ContractFormPage = lazy(() =>
  import("./pages/contracts/ContractFormPage")
);
const ProjectWorkflowPage = lazy(() =>
  import("./pages/milestones/ProjectWorkFlowPage")
);

const GlobalSuspenseLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-950">
    <div className="flex flex-col items-center gap-4">
      <div
        className="w-10 h-10 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin"
        aria-hidden="true"
      />
      <span className="text-sm font-medium text-slate-300 uppercase tracking-widest animate-pulse">
        Loading Page...
      </span>
    </div>
  </div>
);

// test

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AuthEventHandler />
        <Suspense fallback={<GlobalSuspenseLoader />}>
          <Routes>
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/register" element={<RegisterPage />} />
            <Route
              path="/auth/security-alert"
              element={<SecurityAlertPage />}
            />

            <Route element={<ProtectedRoute />}>
              <Route element={<AppShell />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/profile/edit" element={<EditProfilePage />} />
                <Route path="/projects" element={<ProjectsListPage />} />
                <Route path="/projects/new" element={<ProjectFormPage />} />
                <Route path="/projects/:id" element={<ProjectDetailsPage />} />
                <Route
                  path="/projects/:id/edit"
                  element={<ProjectFormPage />}
                />
                <Route
                  path="/admin/contracts"
                  element={<ContractsListPage />}
                />
                <Route
                  path="/admin/contracts/new"
                  element={<ContractFormPage />}
                />
                <Route
                  path="/admin/contracts/:id"
                  element={<ContractDetailsPage />}
                />
                <Route
                  path="/admin/contracts/:id/edit"
                  element={<ContractFormPage />}
                />
                <Route
                  path="/admin/contracts/:id/workflow"
                  element={<ProjectWorkflowPage />}
                />
                <Route
                  path="/contracts/:id/workflow"
                  element={<ProjectWorkflowPage />}
                />
                <Route
                  path="/projects/:id/workflow"
                  element={<ProjectWorkflowPage />}
                />
                <Route
                  path="/admin/contracts/:id/edit"
                  element={<ContractFormPage />}
                />
                <Route path="/admin/skills" element={<SkillsListPage />} />
               <Route element={<ProtectedRoute requiredRoles={[ROLES.ADMIN]} />}>
  <Route path="/admin" element={<AdminLayout />}>
    <Route index element={<AdminPanelPage />} />
    <Route path="users" element={<AdminUsersPage />} />
    <Route path="projects" element={<ProjectsListPage />} />
    <Route path="contracts" element={<ContractsListPage />} />
    <Route path="contracts/new" element={<ContractFormPage />} />
    <Route path="contracts/:id" element={<ContractDetailsPage />} />
    <Route path="contracts/:id/edit" element={<ContractFormPage />} />
    <Route path="contracts/:id/workflow" element={<ProjectWorkflowPage />} />
    <Route path="reports" element={<div className="text-slate-100">Reports page coming soon.</div>} />
  </Route>

</Route>
              </Route>

            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
