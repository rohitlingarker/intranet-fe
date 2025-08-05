import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

export default function LoginCallback() {
  const [loading, setLoading] = useState(true);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const code = queryParams.get("code");
    const state = queryParams.get("state");

    if (!code) {
      alert("Missing authorization code.");
      navigate("/login", { replace: true });
      return;
    }

    (async () => {
      try {
        const res = await axios.get("http://localhost:8000/auth/callback", {
          params: { code, state },
        });

        const { access_token, redirect } = res.data;

        if (!access_token || !redirect) {
          throw new Error("Invalid response from server");
        }

        login(access_token); // save token to context/localStorage
        navigate(redirect, { replace: true });
      } catch (err) {
        console.error("Microsoft login failed", err);
        alert("Microsoft login failed: " + (err.response?.data?.detail || err.message));
        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    })();
  }, [location.search, login, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen text-white bg-[#101a36] text-xl">
      {loading ? "Signing you in with Microsoft..." : null}
    </div>
  );
}
