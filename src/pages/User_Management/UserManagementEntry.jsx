import { useAuth } from "../context/AuthContext";
import UserManagement from "./admin/userManagement/UserManagement";
import Profile from "./user/Profile";

export default function UserManagementEntry() {
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes("Admin") || user?.roles?.includes("Super Admin");

  if (isAdmin) {
    return <UserManagement />;
  }
  return <Profile />;
} 