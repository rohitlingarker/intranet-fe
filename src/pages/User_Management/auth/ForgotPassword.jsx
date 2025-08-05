import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();

  const isEmailValid = (value) => /\S+@\S+\.\S+/.test(value);

  const handleSendOtp = async () => {
    if (!email.trim()) {
      alert("Email is required to send OTP.");
      return;
    }
    if (!isEmailValid(email.trim())) {
      alert("Please enter a valid email.");
      return;
    }
    setSendingOtp(true);
    try {
      await axios.post("http://localhost:8000/auth/send-otp", {
        email: email.trim(),
      });
      setOtpSent(true);
      alert("OTP sent to your email. Check inbox/spam.");
    } catch (err) {
      console.error("sendOtp error:", err);
      alert("Failed to send OTP: " + (err.response?.data?.detail || err.message));
    } finally {
      setSendingOtp(false);
    }
  };

  const handleReset = async () => {
    if (!email.trim() || !otp.trim() || !newPassword.trim()) {
      alert("Email, OTP, and new password are required.");
      return;
    }
    if (!isEmailValid(email.trim())) {
      alert("Please enter a valid email.");
      return;
    }
    setResetting(true);
    try {
      await axios.post("http://localhost:8000/auth/forgot-password", {
        mail: email.trim(), // or "email" if your backend expects that
        otp: otp.trim(),
        new_password: newPassword,
      });
      alert("Password reset successfully!");
      navigate("/");
    } catch (err) {
      console.error("handleReset error:", err);
      alert("Error resetting password: " + (err.response?.data?.detail || err.message));
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 to-blue-100">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">
          Forgot Password
        </h2>

        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSendOtp}
              disabled={sendingOtp}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {sendingOtp ? "Sending..." : otpSent ? "Resend OTP" : "Send OTP"}
            </button>
          </div>

          {otpSent && (
            <>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </>
          )}

          <button
            onClick={handleReset}
            disabled={resetting || !otpSent}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {resetting ? "Resetting..." : "Reset Password"}
          </button>
        </div>
      </div>
    </div>
  );
}
