import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { FaBuilding, FaMicrosoft } from "react-icons/fa";

let intranetLogo;
try {
  intranetLogo = require("../../assets/intranet-logo.png");
} catch (e) {
  intranetLogo = null;
}

const useQuery = () => new URLSearchParams(useLocation().search);

// 🟡 MOCK USERS – Customize emails, passwords, and tokens here
const mockUsers = {
  "hr@example.com": {
    id: "PAVEMP89424",
    password: "Paves@123",
    role: "HR",
    token: "eyJhbGciOiJSUzI1NiIsImtpZCI6ImF1dGgta2V5LTAwMSIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxNCwiZW1haWwiOiJIcjFAZXhhbXBsZS5jb20iLCJuYW1lIjoiSFIgaHIiLCJyb2xlcyI6WyJIUiJdLCJwZXJtaXNzaW9ucyI6WyJWSUVXX1VTRVJfUFVCTElDIiwiRURJVF9PV05fUFJPRklMRSIsIkRFQUNUSVZBVEVfT1dOX1BST0ZJTEUiLCJFRElUX0FOWV9VU0VSIl0sImlzcyI6Imh0dHA6Ly8xOTIuMTY4LjQuNDE6ODAwMCIsImV4cCI6MjExNTUyMTQzNX0.n8-WwBLGRuG5tiV5pLs-10EuUGAM9R3HUhpe4gff418Fs1_7K4Ju6m53jbDObpS48MpGQqsTArqgqPoqPdYGQ7LJn_8hTV7HZRJyR54r58-IxDPD2RmrrdOQ0Yq3lZc9p8ZPW5v9IHSc6Jb8tjSwJlRMufyDENCedWOPxPS2o-It6DnNKPclxTrOSzJliIl-1v0TFq31ag_9IkjPjNjoGTxdyuXoHzJoQblHo5lKgYmFJQePHI_-X2EHrcCNgibmra19Zt_MsVw4Pmn6rXdPsYA7aGhvbiiMruLw1id8MqfCnqbUvs5FX8jQv_K4qcj4G5vpT2HkUmaRzKsAzMBhWA",
  },
  "employee@example.com": {
    id: "PAVEMPDA4C6",  
    password: "Paves@123",
    role: "Employee",
    token: "eyJhbGciOiJSUzI1NiIsImtpZCI6ImF1dGgta2V5LTAwMSIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMywiZW1haWwiOiJFbXBsb3llZTFAZXhhbXBsZS5jb20iLCJuYW1lIjoiRW0gUCIsInJvbGVzIjpbIkdlbmVyYWwiXSwicGVybWlzc2lvbnMiOlsiVklFV19VU0VSX1BVQkxJQyIsIkVESVRfT1dOX1BST0ZJTEUiLCJERUFDVElWQVRFX09XTl9QUk9GSUxFIl0sImlzcyI6Imh0dHA6Ly8xOTIuMTY4LjQuODI6ODAwMCIsImV4cCI6MjExNjM1ODUyNX0.CCbujD5pjgui-O_bhAyyU7ctch8XJPV-SDTBJ-e_hm085dohU0LZICQnJ2pB5dvimeGJ7PYA85TzEVFIb6a7Mf6NeTod7DKaAw0eqPVRbNNG9yIggAkIcYsFJND8NpJhXAALHDsxcTsk6NsKkk4-xkB92IzXulnVDZwoG9gqdb04B5uuzO3VM5cd5cmfcJIPDLO6KNwbrdIbWCXG8vpPqRp5vTVu8sQjcsOr2JhiVMazfj4vfuft72kUHhASEqAqxCqUQOwmS9Qz2SymDdG-KkKQr0bWT2OvpGi63CbHPsNjc5x1WsvLtl5bSjB2cIonYG7UuwRoXr6ao-bN9k7Yrw",
  },
  "admin@example.com": {
    id: "PAVEMPC5AE8",
    password: "Paves@123",
    role: "Manager",
    token: "eyJhbGciOiJSUzI1NiIsImtpZCI6ImF1dGgta2V5LTAwMSIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxNSwiZW1haWwiOiJNYW5hZ2VyQGV4YW1wbGUuY29tIiwibmFtZSI6Ik1hbmFnZXIgTWFuYWdlciIsInJvbGVzIjpbIk1hbmFnZXIiXSwicGVybWlzc2lvbnMiOlsiVklFV19VU0VSX1BVQkxJQyIsIkVESVRfT1dOX1BST0ZJTEUiLCJERUFDVElWQVRFX09XTl9QUk9GSUxFIiwiRURJVF9BTllfVVNFUiJdLCJpc3MiOiJodHRwOi8vMTkyLjE2OC40LjQxOjgwMDAiLCJleHAiOjIxMTU1MjA5OTR9.QmRh8dsLdqZ50doOuTESKTpoE77yXpzIrheTspllvTa_p3oMAITVWEgTAHhDPZ0hpyP3NmZ4e2JbKcHajeLQQtHJ6iTwVj6kUx9I2wyBCSUYniHuntyNpc1HZlc9rAnH3U0ZDpqbXZyoDZJU-YevF7LHry2t4wEJ66hRuIVnTUfjqzb-RF-o02TjlbVWaHfE_DRLRMy08qVnX_zS7Mx_YcvMKZnGVBYTpz5ErDn23ZU9n8MymSQrgZC3KmqTGb7jUWCA-FTUKWIB2yYdyzKg1GsJDPkNlqTP4SCC65rTmM_7bRAOv0Akgdcdx4tAr0kqDfoPC6NxMEYABdb66BjWCQ"
  }
};

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
      alert(`Login error: ${error}`);
      navigate("/login", { replace: true });
      return;
    }
    if (!code) return;

    calledOnce.current = true;

    const doLogin = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_MSOffice_USER_MANAGEMENT_URL}/auth/callback?code=${encodeURIComponent(code)}`
        );
        const { access_token, redirect: redirectPath } = response.data;

        console.log("Access Token:", access_token);
        login(access_token);
        localStorage.setItem("user", JSON.stringify({ access_token: access_token }));
        window.history.replaceState({}, document.title, window.location.pathname);
        navigate(redirectPath || "/home", { replace: true });
      } catch (err) {
        const errDetail =
          err.response?.data?.error_description ||
          err.response?.data?.detail ||
          err.message;
        console.error("OAuth login failed:", err);
        alert("OAuth login failed: " + errDetail);

        window.history.replaceState({}, document.title, window.location.pathname);
        navigate("/", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    doLogin();
  }, [location.search, login, navigate]);

  // ✅ MOCK LOGIN HANDLER
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      alert("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      // 1. 🔍 Check mock users
      // if (mockUsers[email]) {
      //   if (mockUsers[email].password === password) {
      //     const token = mockUsers[email].token;
      //     login(token);
      //     // Optional: redirect based on role or fixed path
      //     const role = mockUsers[email].role;
      //     const redirectPath = role === "HR" ? "/hr-dashboard" :
      //                          role === "Super Admin" ? "/admin-dashboard" : "/home";
      //     navigate(redirectPath);
      //     return;
      //   } else {
      //     alert("Invalid password for mock user.");
      //     return;
      //   }

      // change
      if (mockUsers[email]) {
        if (mockUsers[email].password === password) {
          const { token, role, id } = mockUsers[email];

          // ✅ Store in localStorage
          // localStorage.setItem("user", JSON.stringify({ id, email, role }));

          login(token);
          const redirectPath = role === "HR" ? "/leave-management/hr" :
            role === "Super Admin" ? "/leave-management/manager" : "/home";
          navigate(redirectPath);
          return;
        } else {
          alert("Invalid password for mock user.");
          return;
        }

        //change
    }

    // 2. 🌐 Else, use real login API
    const res = await axios.post(`${import.meta.env.VITE_USER_MANAGEMENT_URL}/auth/login`, {
      email,
      password,
    });
    const token = res.data.access_token;

    login(token);
    navigate(res.data.redirect || "/home");
    // localStorage.setItem("user", JSON.stringify({ email, role: res.data.role }));

  } catch (err) {
    alert("Login failed: " + (err.response?.data?.detail || err.message));
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
          value={email}
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

        {/* 🧪 Test Accounts Guide */}
        <div className="text-xs text-gray-500 mt-4 text-left w-full">
          <p><strong>Test Users:</strong></p>
          <p><strong>Password: Paves@123</strong></p>
          <ul className="list-disc ml-5">
            <li>HR: <code>hr@example.com</code></li>
            <li>Employee: <code>employee@example.com</code></li>
            <li>Super Admin: <code>admin@example.com</code></li>
          </ul>
        </div>
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
          onClick={() => navigate("/forgot")}
          className="hover:underline hover:text-blue-600"
          type="button"
        >
          Forgot Password?
        </button>
      </div>
    </div>
  </div>
);
}
