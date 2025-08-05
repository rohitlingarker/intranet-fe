import { useAuth } from "../../../context/AuthContext";
import { Outlet } from "react-router-dom";

export default function UserManagement() {
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes("Admin") || user?.roles?.includes("Super Admin");

  if (!isAdmin) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">User Management</h2>
        <p className="text-red-600">You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">User Management</h2>
      <Outlet />
    </div>
  );
}
