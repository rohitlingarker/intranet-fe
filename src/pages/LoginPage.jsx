import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { FaBuilding, FaMicrosoft } from "react-icons/fa";
import { showStatusToast } from "../components/toastfy/toast";
 
let intranetLogo;
try {
  intranetLogo = require("../../assets/intranet-logo.png");
} catch (e) {
  intranetLogo = null;
}
 
const useQuery = () => new URLSearchParams(useLocation().search);
 
export default function LoginPage() {
  const [email, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const query = useQuery();
 
  const calledOnce = useRef(false);
 
  useEffect(() => {
    if (calledOnce.current) return;
 
    const params = new URLSearchParams(location.search);
    const code = params.get("code");
    const error = params.get("error");
 
    if (error) {
      showStatusToast(`Login error: ${error}`, "error");
      navigate("/login", { replace: true });
      return;
    }
    if (!code) return;
 
    calledOnce.current = true;
 
    const doLogin = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_USER_MANAGEMENT_URL}/auth/callback?code=${encodeURIComponent(code)}`
        );
        const { access_token, redirect: redirectPath } = response.data;
 
        navigate(redirectPath || "/dashboard", { replace: true });
        login(access_token);
        localStorage.setItem("user", JSON.stringify({ access_token }));
        window.history.replaceState({}, document.title, window.location.pathname);
       
      } catch (err) {
        const errDetail =
          err.response?.data?.error_description ||
          err.response?.data?.detail ||
          err.message;
        console.error("OAuth login failed:", err);
        showStatusToast("OAuth login failed: " + errDetail, "error");
 
        window.history.replaceState({}, document.title, window.location.pathname);
        navigate("/", { replace: true });
      } finally {
        setLoading(false);
      }
    };
 
    doLogin();
  }, [location.search, login, navigate]);
 
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showStatusToast("Please enter both email and password.", "error");
      return;
    }
 
    setLoading(true);
 
    try {
      const res = await axios.post(`${import.meta.env.VITE_USER_MANAGEMENT_URL}/auth/login`, {
        email,
        password,
      });
      const token = res.data.access_token;
 
      navigate(res?.data?.redirect || "/dashboard", { replace: true });

      setTimeout(() => {
      login(token);
      }, 1000);
     
 
    } catch (err) {
      showStatusToast("Login failed: " + (err.response?.data?.detail || err.message), "error");
    } finally {
      setLoading(false);
    }
  };
 
  const handleMicrosoftLogin = () => {
    window.location.href = `${import.meta.env.VITE_USER_MANAGEMENT_URL}/auth/ms-login`;
  };
 
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#101a36]">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-10 flex flex-col items-center">
        <div className="bg-[#27348b] rounded-xl p-4 mb-6 flex items-center justify-center">
          {intranetLogo ? (
            <img src={intranetLogo} alt="Intranet Logo" className="w-16 h-16" />
          ) : (
            <FaBuilding className="text-white text-4xl" />
          )}
        </div>
        <h2 className="text-3xl font-bold text-blue-900 text-center mb-6">
          Enterprise Intranet
        </h2>
        <div className="w-full space-y-4">
          <div className="flex flex-col gap-3">
            <button
              onClick={handleMicrosoftLogin}
              type="button"
              className="flex items-center justify-center gap-3 w-full px-4 py-2 border border-gray-300 rounded-lg bg-white hover:shadow-md transition text-sm font-medium"
              disabled={loading}
            >
              <div className="p-1 rounded bg-[#f3f3f3]">
                <FaMicrosoft className="text-2xl text-[#5c5c5c]" />
              </div>
              <span className="flex-1 text-gray-800">
                Continue with Microsoft
              </span>
            </button>
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-gray-300" />
              <span className="mx-3 text-xs text-gray-400 font-medium">or</span>
              <div className="flex-grow border-t border-gray-300" />
            </div>
          </div>
 
          <input
            type="email"
            placeholder="Email address"
            value={email || ""}
            onChange={(e) => setMail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50"
          />
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-[#276ef1] text-white py-2 rounded-lg hover:bg-[#1d265c] transition disabled:opacity-50 text-lg font-semibold"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>
        <div className="flex justify-between mt-6 text-sm text-gray-600 w-full">
          <button
            onClick={() => navigate("/register")}
            className="hover:underline hover:text-blue-600"
            type="button"
          >
            Create Account
          </button>
          <button
            onClick={() => navigate("/reset-password")}
            className="hover:underline hover:text-blue-600"
            type="button"
          >
            Reset Password?
          </button>
        </div>
      </div>
    </div>
  );
}