import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import { jwtDecode } from "jwt-decode";
import { set } from "date-fns";

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
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

  const login = (token,isfirsttlogin = false) => {
    if(isfirsttlogin){
      localStorage.setItem("lastPath", "/change-password");
      setIsfirsttlogin(true);
      localStorage.setItem("isfirsttlogin", true);
    }else{
      localStorage.setItem("lastPath", "/dashboard");
    }
    localStorage.setItem("token", token);
    loadUser(token);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // if (localStorage.getItem("isfirsttlogin")){
    //   localStorage.removeItem("isfirsttlogin");
    //   setIsfirsttlogin(false);
    // }
    setUser(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      loadUser(token);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout,isfirsttlogin }}>
      {children}
    </AuthContext.Provider>
  );
};
