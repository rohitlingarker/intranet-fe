import { useState } from "react";
// ❌ No longer need useNavigate
import axios from "axios";
import { showStatusToast } from "../../../../components/toastfy/toast";
import FormInput from "../../../../components/forms/FormInput";
import Button from "../../../../components/Button/Button";

// ✅ Component is renamed and accepts props for communication
export default function CreateUserForm({ onSuccess, onClose }) {
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    mail: "",
    contact: "",
    password: "",
    is_active: true,
  });

  const [loading, setLoading] = useState(false);
  const [toastActive, setToastActive] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const showSingleToast = (message, type = "error") => {
    if (!toastActive) {
      setToastActive(true);
      showStatusToast(message, type);
      setTimeout(() => setToastActive(false), 3000);
    }
  };

  const validateForm = () => {
    if (!form.first_name.trim()) return showSingleToast("First Name is required.");
    if (!/^[A-Za-z ]*$/.test(form.first_name)) return showSingleToast("First Name must contain only letters and spaces.");
    if (!form.last_name.trim()) return showSingleToast("Last Name is required.");
    if (!/^[A-Za-z ]*$/.test(form.last_name)) return showSingleToast("Last Name must contain only letters and spaces.");
    if (!form.mail.trim()) return showSingleToast("Email is required.");
    if (!/^[a-zA-Z0-9@._-]+$/.test(form.mail)) return showSingleToast("Email contains invalid characters.");
    if (!form.contact.trim()) return showSingleToast("Contact number is required.");
    if (!/^\d{10}$/.test(form.contact)) return showSingleToast("Contact number must be exactly 10 digits.");
    if (!form.password.trim()) return showSingleToast("Password is required.");
    if (form.password.length < 6) return showSingleToast("Password must be at least 6 characters long.");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || !validateForm()) return;

    setLoading(true);

    try {
      await axios.post(
        `${import.meta.env.VITE_USER_MANAGEMENT_URL}/admin/users`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // ✅ On success, call the callback prop instead of showing toast and navigating
      onSuccess();
    } catch (err) {
      console.error("User creation failed:", err);
      showSingleToast(
        err?.response?.data?.detail || "Failed to create user.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ The component now returns only the form, as the modal provides the title and wrapper.
  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4 p-4 max-h-[60vh] overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label="First Name"
            name="first_name"
            value={form.first_name}
            onChange={(e) => {
              if (/^[A-Za-z ]*$/.test(e.target.value)) handleChange(e);
            }}
            placeholder="Enter first name"
            required
          />
          <FormInput
            label="Last Name"
            name="last_name"
            value={form.last_name}
            onChange={(e) => {
              if (/^[A-Za-z ]*$/.test(e.target.value)) handleChange(e);
            }}
            placeholder="Enter last name"
            required
          />
        </div>

        <FormInput
          label="Email"
          type="email"
          name="mail"
          value={form.mail}
          onChange={(e) => {
            if (/^[a-zA-Z0-9@._-]*$/.test(e.target.value)) handleChange(e);
          }}
          placeholder="Enter email"
          required
        />

        <FormInput
          label="Contact"
          type="tel"
          name="contact"
          value={form.contact}
          onChange={(e) => {
            if (/^\d{0,10}$/.test(e.target.value)) handleChange(e);
          }}
          placeholder="Enter 10-digit contact number"
          required
        />

        <FormInput
          label="Password"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Create a password"
          required
          minLength={6}
        />

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_active_modal" // Use a unique ID to avoid label conflicts
            name="is_active"
            checked={form.is_active}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          />
          <label htmlFor="is_active_modal" className="text-sm text-gray-700">
            Active
          </label>
        </div>

        {/* ✅ Buttons are wrapped in a container with a top border for visual separation */}
        <div className="flex gap-4 pt-4 border-t sticky bottom-0 bg-white">
          <Button 
            type="submit" 
            variant="primary" 
            size="medium" 
            disabled={loading}
            className="flex-1 sm:flex-none"
          >
            {loading ? "Creating..." : "Create User"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="medium"
            onClick={onClose} // ✅ Cancel button now calls the onClose prop
            disabled={loading}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
