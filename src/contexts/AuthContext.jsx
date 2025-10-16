import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { showStatusToast } from "../components/toastfy/toast";

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isfirsttlogin, setIsfirsttlogin] = useState(false);

  const loadUser = (token) => {
    try {
      const decoded = jwtDecode(token);
      setUser(decoded);
      setIsAuthenticated(true);
    } catch {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const login = (token, isfirsttlogin = false) => {
    if (isfirsttlogin) {
      localStorage.setItem("lastPath", "/change-password");
      setIsfirsttlogin(true);
      localStorage.setItem("isfirsttlogin", true);
    } else {
      localStorage.setItem("lastPath", "/dashboard");
    }
    localStorage.setItem("token", token);
    loadUser(token);
  };

  const logout = (expired = false) => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (localStorage.getItem("isfirsttlogin")) {
      localStorage.removeItem("isfirsttlogin");
      setIsfirsttlogin(false);
    }
    setUser(null);
    setIsAuthenticated(false);
    if (expired) {
      // Navigate to login if session expired
      navigate("/", { replace: true });
    }
  };

  // ✅ Check and auto logout when token expires
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      loadUser(token);

      if (decoded.exp) {
        const currentTime = Date.now() / 1000;
        const timeLeft = decoded.exp - currentTime;

        if (timeLeft <= 0) {
          showStatusToast("Session expired. Please login again.");
          setTimeout(() => {
            logout(true);
          }, 1000);
        } else {
          const timer = setTimeout(() => {
            showStatusToast("Session expired. Please login again.");
            logout(true)}
            , timeLeft * 1000);
          return () => clearTimeout(timer);
        }
      }
    } catch (err) {
      showStatusToast("Session expired. Please login again.");
      logout(true);
    }
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) loadUser(token);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, isfirsttlogin }}>
      {children}
    </AuthContext.Provider>
  );
};
