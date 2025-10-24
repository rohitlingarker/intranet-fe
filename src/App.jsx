import React, { useEffect } from "react";
import "react-phone-input-2/lib/style.css";

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
import InitialPasswordSetup  from "./pages/UserManagement/auth/InitialPasswordSetup";
import Layout from "./components/Layout/Layout";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
// Timesheets
import TimesheetHistoryPage from "./pages/Timesheet/TimesheetHistoryPage";
import ManagerApprovalPage from "./pages/Timesheet/ManagerApproval/ManagerApprovalPage";
import DashboardPage from "./pages/Timesheet/DashboardPage";  
import ManagerDashboard from "./pages/Timesheet/ManagerDashboard";
import IntranetForm from "./components/forms/IntranetForm";

// ✅ Project Management
import ProjectDashboard from "./pages/Projects/manager/ProjectDashboard";
import Summary from "./pages/Projects/manager/Summary";
import Backlog from "./pages/Projects/manager/Backlog/Backlog";
import Board from "./pages/Projects/manager/Board";
import CreateProjectModal from "./pages/Projects/manager/CreateProjectModal";
import ProjectTabs from "./pages/Projects/manager/ProjectTabs";
import ReadOnlyDashboard from "./pages/Projects/User/ReadOnlyDashboard";
// import AdminDashboard from './pages/Projects/Admin/AdminDashboard';
import UserBacklog from "./pages/Projects/User/UserBacklog/userbacklog";
import UserProjectTabs from "./pages/Projects/User/UserProjectTabs";
import ProjectList from "./pages/Projects/manager/ProjectList";
import UserProjectList from "./pages/Projects/User/UserProjectList";
import EmployeePerformance from "./pages/Projects/manager/EmployeePerformance";
import Userprofile from "./pages/Projects/User/Userprofile";
import IssueTracker from "./pages/Projects/manager/Backlog/IssueTracker";
import ViewSheet from "./pages/Projects/manager/Backlog/ViewSheet";
import ProjectStatusReportWrapper from "./pages/Projects/manager/ProjectStatusReportWrapper";

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

import EmployeePanel from "./pages/leave_management/EmployeePanel";
import AdminPanel from "./pages/leave_management/AdminPanel";
import HRManageTools from "./pages/leave_management/HRManageTools";
import EmployeeLeaveBalances from "./pages/leave_management/models/EmployeeLeaveBalances";
import Unauthorized from "./pages/leave_management/Unauthorized";
import EditHolidaysPage from "./pages/leave_management/models/EditHolidaysPage";
// import ManagerDashboard from "./pages/Timesheet/ManagerDashboard";
import LeavePolicy from "./pages/leave_management/models/LeavePolicy";
import LeaveDetailsPage from "./pages/leave_management/charts/LeaveDetailsPage";
// import ProtectedRoute from "./pages/leave_management/ProtectedRoutes";

import { showStatusToast } from "./components/toastfy/toast";


const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user,logout } = useAuth();
  const location = useLocation();
  const isfirsttlogin = localStorage.getItem("isfirsttlogin");

  // console.log("isfirsttlogin:", isfirsttlogin);

 

  // ✅ Redirect if first login
  if (isfirsttlogin === "true") {
    logout();
    localStorage.setItem("isfirsttlogin", true);
    showStatusToast("Please change your password first.");
    return <Navigate to="/" replace />;

  }

  // ✅ If not authenticated, go to login
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location.pathname }} replace />;
  }

  // ✅ Role-based restriction check
  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = user?.roles?.some((role) => allowedRoles.includes(role));
    console.log("ProtectedRoute check:", {
      isAuthenticated,
      user,
      allowedRoles,
      match: hasRole,
    });

    if (!hasRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // ✅ Default: render protected content
  return <>{children}</>;
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
  const [showCreateProjectModal, setShowCreateProjectModal] =
    React.useState(false);

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
  const { isAuthenticated,logout} = useAuth();
  const navigate = useNavigate();
  
  
useEffect(() => {

  if (isAuthenticated) {

    const lastPath = localStorage.getItem("lastPath");
 
    // Special case first

    if (lastPath === "/change-password") {

      navigate("/change-password", { replace: true });
    } 

    // Other valid last paths

    else if (lastPath && lastPath !== "/" && lastPath !== "/login") {

      navigate(lastPath, { replace: true });

    } 

    // Default fallback

    else {

      navigate("/", { replace: true });

    }

  }

}, [isAuthenticated, navigate]);

 


  return (
    <>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ForgotPassword />} />
        {/* Unauthorized should be here */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/change-password" element={<InitialPasswordSetup />}/>
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
          {/* <Route path="/projects/manager" element={<ProjectManager />} /> */}
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/timesheets" element={<TimesheetHistoryPage />} />
          <Route path="/managerapproval" element={<ManagerApprovalPage />} />
          <Route path="/timesheets/dashboard" element={<DashboardPage />} />
          <Route path="/timesheets/managerdashboard" element={<ManagerDashboard />} />
          <Route path="/intranet-form" element={<IntranetForm />} />

          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<EditProfile />} />

          {/* Projects */}
          {/* <Route path="/projects/dashboard" element={<AdminDashboard />} /> */}
          <Route path="/projects/developer" element={<ReadOnlyDashboard />} />

          <Route
            path="/projects/manager"
            element={
              <ProtectedRoute allowedRoles={["Manager"]}>
                <ProjectDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="/projects" element={<ProjectManager />} />
          <Route path="/projects/:projectId" element={<ProjectTabs />} />
          <Route path="/projects/list" element={<ProjectList />} />
          <Route path="/projects/:projectId/issuetracker" element={<IssueTracker />} />
          <Route
            path="/projects/performance"
            element={<EmployeePerformance />}
          />
          <Route path="/projects/user/myprofile" element={<Userprofile />} />
          <Route path="/projects/userlist" element={<UserProjectList />} />
          {/* <Route path="/projects/user/:userId" element={<UserProjectDashboard />} /> */}
          <Route
            path="/projects/userbacklog/:projectId"
            element={<UserBacklog />}
          />
          {/* <Route path="/projects/admin" element={<AdminDashboard />} /> */}
          <Route
            path="/projects/user/:projectId"
            element={<UserProjectTabs />}
          />
          
           <Route path="/projects/:projectId/issues/:type/:id/view" element={<ViewSheet />} />

          <Route path="/projects/:projectId/status-report" element={<ProjectStatusReportWrapper />} />
          {/* User Management */}

          <Route path="/user-management/users" element={<UsersTable />} />
          
          <Route
            path="/user-management/users/create"
            element={<CreateUser />}
          />
          <Route
            path="/user-management/users/edit/:id"
            element={<EditUser />}
          />
          <Route
            path="/user-management/users/roles"
            element={<UpdateUserRoles />}
          />
          <Route
            path="/user-management/roles/edit-role/:userId"
            element={<EditUserRoleForm />}
          />
          <Route path="/user-management/roles" element={<RoleManagement />} />
          <Route
            path="/user-management/permissions"
            element={<PermissionManagement />}
          />
          <Route
            path="/user-management/groups"
            element={<PermissionGroupManagement />}
          />
          <Route
            path="/user-management/groups/:groupId"
            element={<GroupDetails />}
          />
          <Route
            path="/user-management/access-points"
            element={<AccessPointManagement />}
          />
          <Route
            path="/user-management/access-points/create"
            element={<AccessPointForm />}
          />
          <Route
            path="/user-management/access-points/:access_uuid"
            element={<AccessPointDetails />}
          />
          <Route
            path="/user-management/access-points/edit/:access_uuid"
            element={<AccessPointEdit />}
          />
          <Route
            path="/user-management/access-points/admin/access-point-mapping"
            element={<AccessPointMapping />}
          />

          {/* <Route
            path="/user-management/users"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Super Admin"]}>
                <UsersTable />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-management/users/create"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Super Admin"]}>
                <CreateUser />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-management/users/edit/:id"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Super Admin"]}>
                <EditUser />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-management/users/roles"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Super Admin"]}>
                <UpdateUserRoles />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-management/roles/edit-role/:userId"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Super Admin"]}>
                <EditUserRoleForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-management/roles"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Super Admin"]}>
                <RoleManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-management/permissions"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Super Admin"]}>
                <PermissionManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-management/groups"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Super Admin"]}>
                <PermissionGroupManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-management/groups/:groupId"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Super Admin"]}>
                <GroupDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-management/access-points"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Super Admin"]}>
                <AccessPointManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-management/access-points/create"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Super Admin"]}>
                <AccessPointForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-management/access-points/:access_id"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Super Admin"]}>
                <AccessPointDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-management/access-points/edit/:access_id"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Super Admin"]}>
                <AccessPointEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-management/access-points/admin/access-point-mapping"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Super Admin"]}>
                <AccessPointMapping />
              </ProtectedRoute>
            }
          /> */}

          {/* Leave Management */}
          <Route
            path="/leave-management"
            element={
              <ProtectedRoute allowedRoles={["General", "HR", "Manager", "Hr-Manager"]}>
                <EmployeePanel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leave-management/manager"
            element={
              <ProtectedRoute allowedRoles={["Manager"]}>
                <AdminPanel />
              </ProtectedRoute>
            }
          />

          <Route
            path="/leave-management/hr"
            element={
              <ProtectedRoute allowedRoles={["HR"]}>
                <HRManageTools />
              </ProtectedRoute>
            }
          />
          <Route
            path={`/employee-leave-balance`}
            element={
              <ProtectedRoute allowedRoles={["HR"]}>
                <EmployeeLeaveBalances/>
              </ProtectedRoute>
            }
          />
          <Route
            path={`/edit-holidays`}
            element={
              <ProtectedRoute allowedRoles={["HR"]}>
                <EditHolidaysPage/>
              </ProtectedRoute>
            }
          />
          <Route path="/leave-policy" element={
          <ProtectedRoute>
            <LeavePolicy />
          </ProtectedRoute>
        } />
        <Route path="/unauthorized" element={<Unauthorized />} />
          <Route 
            path={`/leave-details/:employeeId/:leaveName`}
            element={
              <ProtectedRoute allowedRoles={["General", "HR", "Manager", "Hr-Manager"]}>
                <LeaveDetailsPage />
              </ProtectedRoute>
            }
          />
        </Route>
        {/* <Route path="/unauthorized" element={<Unauthorized />} /> */}
      </Routes>
      <SaveLastPath />
{/* <<<<<<<<< Temporary merge branch 1
      {/* <Routes>
          <Route path="/unauthorized" element={<Unauthorized />} />
        </Routes> */}
{/* ========= */}
      {/* <Routes>
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes> */}
{/* >>>>>>>>> Temporary merge branch 2 */}
    </>
  );
};

// 🚀 App Entry Point
function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
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
