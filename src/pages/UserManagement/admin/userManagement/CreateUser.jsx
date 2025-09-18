import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { showStatusToast } from "../../../../components/toastfy/toast";

import FormInput from "../../../../components/forms/FormInput";
import Button from "../../../../components/Button/Button";

export default function CreateUser() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    mail: "",
    contact: "",
    password: "",
    is_active: true,
  });

  const [loading, setLoading] = useState(false); // Prevent multiple submissions
  const [toastActive, setToastActive] = useState(false); // Track active toast

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
      // Reset toastActive after 3 seconds (assuming toast disappears in 3s)
      setTimeout(() => setToastActive(false), 3000);
    }
  };

  const validateForm = () => {
    if (!form.first_name.trim()) return showSingleToast("First Name is required.");
    if (!/^[A-Za-z]*$/.test(form.first_name)) return showSingleToast("First Name must contain only letters.");
    if (!form.last_name.trim()) return showSingleToast("Last Name is required.");
    if (!/^[A-Za-z]*$/.test(form.last_name)) return showSingleToast("Last Name must contain only letters.");
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
    if (loading) return; // Prevent multiple submissions
    if (!validateForm()) return;

    setLoading(true);

    try {
      await axios.post(
        `${import.meta.env.VITE_USER_MANAGEMENT_URL}/admin/users`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showSingleToast("User created successfully!", "success");
      navigate("/user-management/users");
    } catch (err) {
      console.error("User creation failed:", err);
      showSingleToast(err?.response?.data?.detail || "Failed to create user.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-6 py-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Create New User</h1>
        <p className="text-gray-500">Fill out the form to add a new user to the system.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="First Name"
            name="first_name"
            value={form.first_name}
            onChange={(e) => {
              const value = e.target.value;
              if (/^[A-Za-z]*$/.test(value)) handleChange(e);
            }}
            placeholder="Enter first name"
            required
          />
          <FormInput
            label="Last Name"
            name="last_name"
            value={form.last_name}
            onChange={(e) => {
              const value = e.target.value;
              if (/^[A-Za-z]*$/.test(value)) handleChange(e);
            }}
            placeholder="Enter last name"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Email"
            type="email"
            name="mail"
            value={form.mail}
            onChange={(e) => {
              const value = e.target.value;
              if (/^[a-zA-Z0-9@._-]*$/.test(value)) handleChange(e);
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
              const value = e.target.value;
              if (/^\d{0,10}$/.test(value)) handleChange(e);
            }}
            placeholder="Enter 10-digit contact number"
            required
          />
        </div>

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
            name="is_active"
            checked={form.is_active}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label htmlFor="is_active" className="text-gray-700">
            Active
          </label>
        </div>

        <div className="flex gap-4">
          <Button type="submit" variant="primary" size="medium" disabled={loading}>
            {loading ? "Creating..." : "Create User"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="medium"
            onClick={() => navigate("/user-management/users")}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
