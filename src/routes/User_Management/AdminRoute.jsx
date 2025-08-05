import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute() {
  const { user } = useAuth();

  // Optional: Handle loading state while checking auth (if async auth is used)
  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600">Checking permissions...</p>
      </div>
    );
  }

  const roles = user?.roles || [];
  const isAdmin = roles.includes("Admin") || roles.includes("Super Admin");

  return isAdmin ? <Outlet /> : <Navigate to="/home" replace />;
}
