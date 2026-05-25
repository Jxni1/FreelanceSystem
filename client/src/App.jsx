import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AuthEventHandler } from "./components/AuthEventHandler";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RoleRedirect } from "./components/RoleRedirect";
import { AppShell } from "./components/AppShell";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { SecurityAlertPage } from "./pages/auth/SecurityAlertPage";
import { ROLES } from "./constants/roles";
import ClientSpendingDashboard from "./pages/dashboard/ClientSpendingDashboard";
import FreelancerPortfolioPage from './pages/freelancer/FreelancerPortfolioPage';

const DashboardPage = lazy(() => import("./pages/dashboard/DashboardPage"));
const AdminPanelPage = lazy(() => import("./pages/admin/AdminPanelPage"));
const ProfilePage = lazy(() => import("./pages/profile/ProfilePage"));

import { AdminLayout } from "./pages/admin/AdminLayout";
import EditProfilePage from "./pages/profile/EditProfile";
import AdminReportsPage from "./pages/admin/reports/AdminReportsPage";
import ClientsPage from "./pages/freelancer/ClientsPage";
import ClientProjectsPage from "./pages/freelancer/ClientsProjectsPage";
import FavoriteFreelancersPage from "./pages/client/FavoriteFreelancersPage";
import NotificationsPage from "./pages/notifications/NotificationsPage";

import ConversationPage from "./pages/chat/ConversationPage";
import InboxPage from "./pages/chat/InboxPage";
import RecommendedProjectsTestPage from "./pages/ai/RecommendedProjectsTestPage";

const ProjectsListPage = lazy(() => import("./pages/projects/ProjectsListPage"));
const ProjectDetailsPage = lazy(() => import("./pages/projects/ProjectDetailsPage"));
const ProjectFormPage = lazy(() => import("./pages/projects/ProjectFormPage"));

const SkillsListPage = lazy(() => import("./pages/admin/skills/SkillsListPage"));
const SkillFormPage = lazy(() => import("./pages/admin/skills/SkillFormPage"));
const AdminUsersPage = lazy(() => import("./pages/admin/AdminUsersPage"));
const AdminSettingsListPage = lazy(() => import("./pages/admin/settings/AdminSettingsListPage"));
const AdminSettingFormPage = lazy(() => import("./pages/admin/settings/AdminSettingFormPage"));

const ContractsListPage = lazy(() => import("./pages/contracts/ContractsListPage"));
const ContractDetailsPage = lazy(() => import("./pages/contracts/ContractDetailPage"));
const ContractFormPage = lazy(() => import("./pages/contracts/ContractFormPage"));
const ProjectWorkflowPage = lazy(() => import("./pages/milestones/ProjectWorkFlowPage"));

const FreelancerDiscoverPage = lazy(() => import("./pages/freelancer/FreelancerDiscoverPage"));
const MyWorkPage = lazy(() => import("./pages/freelancer/MyWorkPage"));
const FreelancersPage = lazy(() => import("./pages/client/FreelancersPage"));

const ReviewsListPage = lazy(()=> import("./pages/reviews/ReviewsListPage"));
const ReviewFormPage = lazy(()=> import("./pages/reviews/ReviewFormPage"));

const CategoriesListPage = lazy(() => import("./pages/admin/categories/CategoriesListPage"));
const CategoryFormPage = lazy(() => import("./pages/admin/categories/CategoryFormPage"));

const ProtectedViewsDashboard = lazy(()=>import("./pages/admin/protectedViews/ProtectedViewsDashboard"));
const ProtectedViewStatsPage = lazy(()=>import("./pages/projects/ProjectViewStatsPage"));

const GlobalSuspenseLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="flex flex-col items-center gap-4">
      <div
        className="w-10 h-10 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin"
        aria-hidden="true"
      />
      <span className="text-sm font-medium text-slate-500 uppercase tracking-widest animate-pulse">
        Loading Page...
      </span>
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
              <Route element={<AppShell />}>
              

                {/* Role-aware landing: freelancers go to /discover, others to /dashboard */}
                <Route path="/dashboard" element={<RoleRedirect freelancerTo="/discover" />} />

                {/* All authenticated users */}
                <Route path="/home" element={<DashboardPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/profile/edit" element={<EditProfilePage />} />
                <Route path="/projects" element={<ProjectsListPage />} />
                <Route path="/projects/:id" element={<ProjectDetailsPage />} />
                <Route path="/projects/:id/workflow" element={<ProjectWorkflowPage />} />
                <Route path="/contracts/:id/workflow" element={<ProjectWorkflowPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                
                <Route path="/contracts/:id" element={<ContractDetailsPage />} />
               
               <Route path="/ai-test" element={<RecommendedProjectsTestPage />} />

            <Route path="/chat/new" element={<ConversationPage />} />
            <Route path="/chat/:conversationId" element={<ConversationPage />} />
            <Route path="/inbox" element={<InboxPage />} />


                {/* Freelancer only */}
                <Route element={<ProtectedRoute requiredRoles={[ROLES.FREELANCER]} />}>
                  <Route path="/discover" element={<FreelancerDiscoverPage />} />
                  <Route path="/my-work" element={<MyWorkPage />} />
                  <Route path="/clients" element={<ClientsPage/>}/>
                  <Route path="/clients/:clientId/projects" element={<ClientProjectsPage/>} />
                  <Route path="/portfolio" element={<FreelancerPortfolioPage />} />
                </Route>

                {/* Client only */}
                <Route element={<ProtectedRoute requiredRoles={[ROLES.CLIENT]} />}>
                  <Route path="/projects/new" element={<ProjectFormPage />} />
                  <Route path="/projects/:id/edit" element={<ProjectFormPage />} />
                  <Route path="/freelancers" element={<FreelancersPage />} />
                  <Route path="/reviews/new" element={<ReviewFormPage />} />
                  <Route path="/reviews/:id/edit" element={<ReviewFormPage />} />
                  <Route path="/favorite-freelancers" element={<FavoriteFreelancersPage />} />
                  <Route path="/projects/:id/stats" element={<ProtectedViewStatsPage />} />
                  <Route path="/spending" element={<ClientSpendingDashboard />} />   {/* ← add this */}
                </Route>

                {/* Client + Freelancer: their own contracts */}
                <Route element={<ProtectedRoute requiredRoles={[ROLES.CLIENT, ROLES.FREELANCER]} />}>
                  <Route path="/contracts" element={<ContractsListPage />} />
                  <Route path="/contracts/:id" element={<ContractDetailsPage />} />
                  <Route path="/contracts/:id/edit" element={<ContractFormPage />} />
                  <Route path="/reviews" element={<ReviewsListPage />} />
                </Route>

                {/* Admin only */}
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
                    <Route path="skills" element={<SkillsListPage />} />
                    <Route path="skills/new" element={<SkillFormPage />} />
                    <Route path="skills/:id/edit" element={<SkillFormPage />} />
                    <Route path="settings" element={<AdminSettingsListPage />} />
                    <Route path="settings/new" element={<AdminSettingFormPage />} />
                    <Route path="settings/:id/edit" element={<AdminSettingFormPage />} />
                    <Route path="reports" element={<AdminReportsPage />} />
                    <Route path="categories" element={<CategoriesListPage />} />
                    <Route path="categories/new" element={<CategoryFormPage />} />
                    <Route path="categories/:id/edit" element={<CategoryFormPage />} />
                    <Route path="protected-views" element={<ProtectedViewsDashboard />}/>
 
                   
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
