import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";

import LoginPage from "./pages/LoginPage";
import Layout from "./components/Layout/Layout";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";

// Timesheets
import TimesheetHistoryPage from "./pages/Timesheet/TimesheetHistoryPage";
import ManagerApprovalPage from "./pages/Timesheet/ManagerApproval/ManagerApprovalPage";


import IntranetForm from "./components/forms/IntranetForm";

// ✅ Project Management
import ProjectDashboard from './pages/Projects/manager/ProjectDashboard';
import Summary from './pages/Projects/manager/Summary';
import Backlog from './pages/Projects/manager/Backlog/Backlog';
import Board from './pages/Projects/manager/Board';
import CreateProjectModal from './pages/Projects/manager/CreateProjectModal';
import ProjectTabs from './pages/Projects/manager/ProjectTabs';
import ReadOnlyDashboard from './pages/Projects/User/ReadOnlyDashboard';
import AdminDashboard from './pages/Projects/Admin/admindashboard';
import UserBacklog from './pages/Projects/User/UserBacklog/userbacklog';
import UserProjectTabs from './pages/Projects/User/UserProjectTabs';
import ProjectList from './pages/Projects/manager/ProjectList';
import UserProjectList from './pages/Projects/User/UserProjectList';
import EmployeePerformance from './pages/Projects/manager/EmployeePerformance';



// ✅ User Management
import CreateUser from "./pages/UserManagement/admin/userManagement/CreateUser";
import EditUser from "./pages/UserManagement/admin/userManagement/EditUser";
import UpdateUserRoles from "./pages/UserManagement/admin/userManagement/UpdateUserRoles";
import EditUserRoleForm from "./pages/UserManagement/admin/userManagement/EditUserRoleForm";
import UsersTable from "./pages/UserManagement/admin/userManagement/UsersTable";

// ✅ Roles & Permissions
import RoleManagement from "./pages/UserManagement/admin/roleManagement/RoleManagement";
import PermissionManagement from "./pages/UserManagement/admin/permissionManagement/PermissionManagement";
import PermissionGroupManagement from "./pages/UserManagement/admin/permissionGroupManagement/PermissionGroupManagement";
import GroupDetails from "./pages/UserManagement/admin/permissionGroupManagement/GroupDetails";

import AccessPointForm from "./pages/UserManagement/admin/accessPointManagement/AccessPointForm";
import AccessPointDetails from "./pages/UserManagement/admin/accessPointManagement/AccessPointDetails";
import AccessPointEdit from "./pages/UserManagement/admin/accessPointManagement/AccessPointEdit";
import AccessPointMapping from "./pages/UserManagement/admin/accessPointManagement/AccessPointMapping";
import AccessPointManagement from "./pages/UserManagement/admin/accessPointManagement/AccessPointManagement";

import Profile from "./pages/UserManagement/user/Profile";
import EditProfile from "./pages/UserManagement/user/EditProfile";


import Register from "./pages/UserManagement/auth/Register";
import ForgotPassword from "./pages/UserManagement/auth/ForgotPassword";

// 🔒 Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/" />;
};

// ✅ Save last path on every navigation
const SaveLastPath = () => {
  const location = useLocation();
  useEffect(() => {
    localStorage.setItem("lastPath", location.pathname);
  }, [location.pathname]);
  return null;
};

// ✅ Project Manager Demo Layout
const ProjectManager = () => {
  const [showCreateProjectModal, setShowCreateProjectModal] = React.useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
     

      {/* <div className="flex-1 flex flex-col">
        <ProjectTabs selectedTab="summary" onTabSelect={() => {}} />
        <main className="flex-1 overflow-auto bg-white">
          <Summary project={null} tasks={[]} />
        </main>
      </div>

      <CreateProjectModal
        isOpen={showCreateProjectModal}
        onClose={() => setShowCreateProjectModal(false)}
        onProjectCreated={() => {}}
      /> */}
    </div>
  );
};


// ✅ Application Routes
const AppRoutes = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      const lastPath = localStorage.getItem("lastPath");
      if (lastPath && lastPath !== "/" && lastPath !== "/login") {
        navigate(lastPath, { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [isAuthenticated, navigate]);

  return (
    <>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot" element={<ForgotPassword />} />

        {/* Protected Routes */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Main */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/timesheets" element={<TimesheetHistoryPage />} />
          <Route path="/managerapproval" element={<ManagerApprovalPage />} />
          <Route path="/intranet-form" element={<IntranetForm />} />

          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<EditProfile />} />

          {/* Projects */}
          <Route path="/projects/dashboard" element={<AdminDashboard />} />
        <Route path="/projects/developer" element={<ReadOnlyDashboard />} />
        <Route path="/projects/manager" element={<ProjectDashboard />} />
       
        <Route path="/projects/*" element={<ProjectManager />} />
        <Route path="/projects/:projectId" element={<ProjectTabs />} />
        <Route path="/projects/user/:projectId" element={<UserProjectTabs />} />
        <Route path="/projects/list" element={<ProjectList />} />
        <Route path="/projects/userprojectlist" element={<UserProjectList />} />
        <Route path="/projects/performance" element={<EmployeePerformance />} />

          {/* User Management */}
          
          <Route path="/user-management/users" element={<UsersTable />} />
          <Route path="/user-management/users/create" element={<CreateUser />} />
          <Route path="/user-management/users/edit/:id" element={<EditUser />} />
          <Route path="/user-management/users/roles" element={<UpdateUserRoles />} />
          <Route path="/user-management/roles/edit-role/:userId" element={<EditUserRoleForm />} />
          <Route path="/user-management/roles" element={<RoleManagement />} />
          <Route path="/user-management/permissions" element={<PermissionManagement />} />
          <Route path="/user-management/groups" element={<PermissionGroupManagement />} />
          <Route path="/user-management/groups/:groupId" element={<GroupDetails />} />
          <Route path="/user-management/access-points" element={<AccessPointManagement />} />
          <Route path="/user-management/access-points/create" element={<AccessPointForm />} />
          <Route path="/user-management/access-points/:access_id" element={<AccessPointDetails />} />
          <Route path="/user-management/access-points/edit/:access_id" element={<AccessPointEdit />} />
          <Route path="/user-management/access-points/admin/access-point-mapping" element={<AccessPointMapping />} />
        </Route>
      </Routes>
      <SaveLastPath />
    </>
  );
};

// 🚀 App Entry Point
function App() {
  return (
    <>
    <ToastContainer position="top-center" autoClose={3000} />
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <div className="min-h-screen bg-gray-50">
            <AppRoutes />
          </div>
        </NotificationProvider>
      </AuthProvider>
    </Router>
    </>
  );
}

export default App;
