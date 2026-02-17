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
    id: "14",
    password: "Paves@123",
    role: "HR",
    token: "eyJhbGciOiJSUzI1NiIsImtpZCI6ImF1dGgta2V5LTAwMSIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0OSwiZW1haWwiOiJockBleGFtcGxlLmNvbSIsIm5hbWUiOiJIIFIiLCJyb2xlcyI6WyJIUiJdLCJwZXJtaXNzaW9ucyI6WyJWSUVXX1VTRVJfUFVCTElDIiwiRURJVF9PV05fUFJPRklMRSIsIkRFQUNUSVZBVEVfT1dOX1BST0ZJTEUiLCJWSUVXX1VTRVJfQUxMIiwiRURJVF9BTllfVVNFUiJdLCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAiLCJleHAiOjIxMTQ0ODE2NTR9.ib8ybqzrN3Y5sb7cazUUaa43fu0EPjRHCmBiYgnDnQvSeypFJ7fayKm14XsnczrcyeZGOzxTHskU15rZrDurq_mpdkTB0qisG0vC2dgTtmlXUxwJbu88rwLSKERp9WlrJQwpDF6VucGOw3bp6NjgROoWlwY8wt9o53iMRoZr0uclkCOg5E5V_1KinzfOWIezNMIVFwQO858Cz494kv80wreFprOZy64ftEaGx6vEpOaKRaDuKvzdiT98GkGdMHWuHAu7zl388gVcLRuOkw_u9YBOhlxV4MwL2cNjUzcymSI3jFXF02aHwtaxM5g5uzIBvrxnYDPke_SaBWYGLoeBxg"
  },
  "employee@example.com": {
    id: "13",
    password: "Paves@123",
    role: "Employee",
    token: "eyJhbGciOiJSUzI1NiIsImtpZCI6ImF1dGgta2V5LTAwMSIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMywiZW1haWwiOiJFbXBsb3llZTFAZXhhbXBsZS5jb20iLCJuYW1lIjoiRW0gUCIsInJvbGVzIjpbIkdlbmVyYWwiXSwicGVybWlzc2lvbnMiOlsiVklFV19VU0VSX1BVQkxJQyIsIkVESVRfT1dOX1BST0ZJTEUiLCJERUFDVElWQVRFX09XTl9QUk9GSUxFIl0sImlzcyI6Imh0dHA6Ly8xOTIuMTY4LjIuMzc6ODAwMCIsImV4cCI6MjExODAwNTI0N30.IMV7jeK3Tf6X36eiITjAifjwYw7wuvwJ4Jwtun-9-AjXb8HmKXuI8zCiJmDXs678pUJmhDgQSMh83oNCFv7lbtQD9oMGnY5Pk95HjXNfuX76icDT3cLUYLnqop2J1Nf6r4ujfU3qSsWXR_4mSC6_x0LiTvQU6QVYvQZtxhS2OqT5uvPnQWJPQNHCKv7oQSdV3KrguFD_KIivWUpXQLkiMofNVpJDd6QS7JDSiJCyogD5YnABPxqMaPrz9wkOEJrvwEzrxWb-opIDNxVfaNa_iiE6hm7Gjn9eTUTFEk2cFrvPp5YOckVcPBDhJGwCzBpAVF8mUKEZexXxkcU0qGZOag"
  },
  "admin@example.com": {
    id: "15",
    password: "Paves@123",
    role: "Manager",
    token: "eyJhbGciOiJSUzI1NiIsImtpZCI6ImF1dGgta2V5LTAwMSIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo1MSwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsIm5hbWUiOiJhZCBtaW4iLCJyb2xlcyI6WyJTdXBlciBBZG1pbiJdLCJwZXJtaXNzaW9ucyI6WyJBRERfR1JPVVAiLCJBRERfUEVSTUlTU0lPTiIsIkFERF9ST0xFIiwiQUREX1VTRVIiLCJERUFDVElWQVRFX09XTl9QUk9GSUxFIiwiREVMRVRFX0dST1VQIiwiREVMRVRFX1BFUk1JU1NJT04iLCJERUxFVEVfUk9MRSIsIkRFTEVURV9VU0VSIiwiRURJVF9BTllfVVNFUiIsIkVESVRfR1JPVVAiLCJFRElUX09XTl9QUk9GSUxFIiwiRURJVF9QRVJNSVNTSU9OIiwiRURJVF9ST0xFIiwiTUFOQUdFX0VORFBPSU5UUyIsIlZJRVdfR1JPVVAiLCJWSUVXX1BFUk1JU1NJT04iLCJWSUVXX1JPTEUiLCJWSUVXX1VTRVJfQUxMIiwiVklFV19VU0VSX1BVQkxJQyJdLCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAiLCJleHAiOjIxMTQ0ODE3MjF9.x2dMfFAbal7YiGK88KcEdZNrsZwV5ub49YER-zVTZBjr1gfxM922qUSd8qADy3Y1aqD0l3tPkxVtReNUnhA3XbMv1KpNUHfERpNW7VoXJ6_YIrrDIvMQEm45pzimF5q19n0aObX_axs-GKFIAp0Y-bJ3fVB_NX-TZGQG5X1Z0w7R0tX9_DI-zG9lIXgHYFx1Z7dLFr6JAeRVuBQjO5gYxmdG4EOdZPOeRZOY387EYwiH1-UIzGzibZ7D0JTQjqOvSUqCD4t1QF1xAbNo6ZpCq8Xj2-BBvOglZqVfaQYvVT9aylIQrR0aY36PwQHhYEYDNjYotbBf370CrSRM5gHvYg"
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
          `http://localhost:8000/auth/callback?code=${encodeURIComponent(code)}`
        );
        const { access_token, redirect: redirectPath } = response.data;

        console.log("Access Token:", access_token);
        login(access_token);
        localStorage.setItem("user", JSON.stringify({ email, role: mockUsers[email].role }));
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
          localStorage.setItem("user", JSON.stringify({ id, email, role }));

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
    const res = await axios.post("http://localhost:8000/auth/login", {
      email,
      password,
    });
    const token = res.data.access_token;

    login(token);
    navigate(res.data.redirect || "/home");
    localStorage.setItem("user", JSON.stringify({ email, role: res.data.role }));

  } catch (err) {
    alert("Login failed: " + (err.response?.data?.detail || err.message));
  } finally {
    setLoading(false);
  }
};

const handleMicrosoftLogin = () => {
  window.location.href = "http://localhost:8000/auth/ms-login";
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