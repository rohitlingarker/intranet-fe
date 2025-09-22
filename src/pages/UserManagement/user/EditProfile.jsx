import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../contexts/AuthContext";
import { showStatusToast } from "../../../components/toastfy/toast"; // ✅ custom toast wrapper

// Simple reusable Modal component
function Modal({ open, title, message, onConfirm, onCancel, loading }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-2xl shadow-lg w-96 p-6">
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <p className="text-gray-600 mb-4">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-md border border-gray-300 bg-gray-100 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            {loading ? "Saving..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EditProfile() {
  const { user } = useAuth();
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  // Load user profile on mount
  useEffect(() => {
    if (user?.email) {
      axios
        .get(`${import.meta.env.VITE_USER_MANAGEMENT_URL}/general_user/profile`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((res) => setForm(res.data))
        .catch((err) => {
          console.error("Failed to fetch profile", err);
          showStatusToast("Failed to load profile.", "error");
        });
    }
  }, [user]);

  // Handle form field changes
  const handleChange = (e) => {
    if (e.target.name === "contact") {
      const value = e.target.value.replace(/\D/g, "").slice(0, 10); // keep only numbers, max 10
      setForm({ ...form, [e.target.name]: value });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  // Save profile function
  const doSave = async () => {
    if (!form.password || form.password.trim() === "") {
      showStatusToast("Password is required", "error");
      return;
    }

    if (!form.contact || form.contact.length !== 10) {
      showStatusToast("Contact number must be exactly 10 digits.", "error");
      return;
    }

    try {
      setSaving(true);
      const response = await axios.put(
        `${import.meta.env.VITE_USER_MANAGEMENT_URL}/general_user/profile`,
        form,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      console.log("Response:", response.data);
      showStatusToast("Profile updated!", "success");
      navigate("/profile");
    } catch (err) {
      console.error("Update failed:", err);
      showStatusToast(
        "Update failed: " + (err.response?.data?.detail || err.message),
        "error"
      );
    } finally {
      setSaving(false);
      setShowModal(false);
    }
  };

  const handleSave = () => setShowModal(true);
  const handleCancel = () => navigate("/profile");

  if (!user) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-xl mx-auto p-6">
      <div className="bg-white shadow-md border border-gray-200 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-blue-700 mb-6">Edit Profile</h2>

        <div className="space-y-4">
          {/* First Name */}
          <div>
            <label className="block font-medium mb-1">First Name</label>
            <input
              type="text"
              name="first_name"
              value={form.first_name || ""}
              onChange={(e) => {
                // ✅ Allow alphabets + spaces only
                if (/^[A-Za-z ]*$/.test(e.target.value)) handleChange(e);
              }}
              placeholder="Enter your first name"
              className="w-full border px-3 py-2 rounded-md"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block font-medium mb-1">Last Name</label>
            <input
              type="text"
              name="last_name"
              value={form.last_name || ""}
              onChange={(e) => {
                // ✅ Allow alphabets + spaces only
                if (/^[A-Za-z ]*$/.test(e.target.value)) handleChange(e);
              }}
              placeholder="Enter your last name"
              className="w-full border px-3 py-2 rounded-md"
            />
          </div>

          {/* Contact */}
          <div>
            <label className="block font-medium mb-1">Contact</label>
            <input
              type="text"
              name="contact"
              value={form.contact || ""}
              onChange={(e) => {
                if (/^[0-9]*$/.test(e.target.value) && e.target.value.length <= 10)
                  handleChange(e);
              }}
              placeholder="Enter contact number"
              className="w-full border px-3 py-2 rounded-md"
              maxLength={10}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block font-medium mb-1">New Password</label>
            <input
              type="password"
              name="password"
              value={form.password || ""}
              onChange={handleChange}
              placeholder="Enter new password"
              className="w-full border px-3 py-2 rounded-md"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-4">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="w-full bg-gray-100 border border-gray-300 py-2 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        open={showModal}
        title="Confirm Profile Edit"
        message="Are you sure you want to save these changes?"
        onConfirm={doSave}
        onCancel={() => setShowModal(false)}
        loading={saving}
      />
    </div>
  );
}
