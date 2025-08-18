import { Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext"; // your auth hook

const ProtectedRoute = ({ element: Component, allowedRoles }) => {
  const { user } = useAuth(); // Example: { name: "John", role: "manager" }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Component />;
};

export default ProtectedRoute;
