import { Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
 
// in App.jsx or index.jsx


// Auth Pages
import Login from "./pages/User_Management/auth/Login";
import LoginCallback from "./pages/User_Management/auth/LoginCallback";
import Register from "./pages/User_Management/auth/Register";
import ForgotPassword from "./pages/User_Management/auth/ForgotPassword";

// User Pages
import Home from "./pages/User_Management/user/Home";
import Profile from "./pages/User_Management/user/Profile";
import EditProfile from "./pages/User_Management/user/EditProfile";
import EditUserHr from "./pages/User_Management/user/manager/EditUserHr";

// Admin Pages
import AdminDashboard from "./pages/admin/adminDashboard/AdminDashboard";
import UserManagement from "./pages/admin/userManagement/UserManagement";
import CreateUser from "./pages/admin/userManagement/CreateUser";
import EditUser from "./pages/admin/userManagement/EditUser";
import UpdateUserRoles from "./pages/admin/userManagement/UpdateUserRoles";
import EditUserRoleForm from "./pages/admin/userManagement/EditUserRoleForm";
import RoleManagement from "./pages/admin/roleManagement/RoleManagement";
import PermissionManagement from "./pages/admin/permissionManagement/PermissionManagement";
import PermissionGroupManagement from "./pages/admin/permissionGroupManagement/PermissionGroupManagement";
import AccessPointManagement from "./pages/admin/accessPointManagement/AccessPointManagement";
import UserManagementEntry from "./pages/UserManagementEntry";
import UsersTable from "./pages/admin/userManagement/UsersTable";
import UserManagementHome from "./pages/admin/userManagement/UserManagementHome";
import GroupDetails from "./pages/admin/permissionGroupManagement/GroupDetails";


import AccessPointList from '../src/pages/admin/accessPointManagement/AccessPointList';
import AccessPointForm from '../src/pages/admin/accessPointManagement/AccessPointForm';
import AccessPointDetails from '../src/pages/admin/accessPointManagement/AccessPointDetails';
import AccessPointEdit from '../src/pages/admin/accessPointManagement/AccessPointEdit';
import AccessPointMapping from './pages/admin/accessPointManagement/AccessPointMapping';

// Layouts & Routes
import Layout from "./components/Layout";
import MainLayout from "./components/MainLayout";
import AdminRoute from "./routes/AdminRoute";

export default function App() {
  return (
    <>
    <ToastContainer position="top-center" autoClose={3000} />

    <Routes>
      
      {/* Public Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot" element={<ForgotPassword />} />

      {/* User Routes (with user layout) */}
      <Route element={<Layout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/edit" element={<EditProfile />} />
        <Route path="/edit-user/:user_id" element={<EditUserHr />} />
        <Route path="/login/callback" element={<LoginCallback />} />
      </Route>

      {/* User Management and Admin Sections (with main layout) */}
      <Route element={<MainLayout />}>
        <Route path="/user-management" element={<UserManagementEntry />}>
          <Route index element={<UserManagementHome />} />
          <Route path="users" element={<UsersTable />} />
          <Route path="users/create" element={<CreateUser />} />
          <Route path="users/edit/:id" element={<EditUser />} />
          <Route path="users/roles" element={<UpdateUserRoles />} />
          <Route path="roles" element={<RoleManagement />} />
          <Route path="roles/edit-role/:userId" element={<EditUserRoleForm />} />
          <Route path="permissions" element={<PermissionManagement />} />
          <Route path="groups" element={<PermissionGroupManagement />} />
          <Route path="groups/:groupId" element={<GroupDetails />} />
          {/* <Route path="access-points" element={<AccessPointManagement />} /> */}
          <Route path="access-points" element={<AccessPointManagement />} />
          <Route path="access-points/create" element={<AccessPointForm />} />
          <Route path="access-points/:access_id" element={<AccessPointDetails />} />
          <Route path="access-points/edit/:access_id" element={<AccessPointEdit />} />
        </Route>
        <Route path="/admin/access-point-mapping" element={<AccessPointMapping />} />
      </Route>
    </Routes>
    </>
    
  );
}
