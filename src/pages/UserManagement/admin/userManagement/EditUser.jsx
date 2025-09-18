import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import FormInput from "../../../../components/forms/FormInput";
import Button from "../../../../components/Button/Button";
import { showStatusToast } from "../../../../components/toastfy/toast";

export default function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [user, setUser] = useState({
    first_name: "",
    last_name: "",
    mail: "",
    contact: "",
    password: "",
    is_active: true,
  });

  const [loading, setLoading] = useState(false); // Track API request

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_USER_MANAGEMENT_URL}/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const { password, ...rest } = res.data; // ⛔ don't include password
        setUser((prev) => ({ ...prev, ...rest }));
      })
      .catch((err) => {
        console.error("Failed to fetch user:", err);
        showStatusToast("Access denied or user not found.", "error");
        navigate("/user-management/users");
      });
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUser((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (user.contact.length !== 10) {
      showStatusToast("Contact number must be exactly 10 digits.", "error");
      return;
    }

    setLoading(true); // Disable button

    try {
      const payload = { ...user };
      if (!payload.password) delete payload.password;

      await axios.put(
        `${import.meta.env.VITE_USER_MANAGEMENT_URL}/admin/users/${id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showStatusToast("User updated successfully!", "success");
      navigate("/user-management/users");
    } catch (err) {
      console.error("Update failed:", err);
      showStatusToast( err.response?.data?.detail||"Failed to update user.", "error");
    } finally {
      setLoading(false); // Re-enable button
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold text-blue-700 mb-4">Edit User</h2>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 shadow rounded-lg"
      >
      <FormInput
  label="First Name"
  name="first_name"
  value={user.first_name}
  onChange={(e) => {
    const value = e.target.value;
    // Allow only alphabets
    if (/^[a-zA-Z]*$/.test(value)) {
      handleChange(e);
    }
  }}
  onKeyDown={(e) => {
    // Allow only letters and control keys
    if (
      !/[a-zA-Z]/.test(e.key) &&
      !["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight"].includes(e.key)
    ) {
      e.preventDefault();
    }
  }}
  placeholder="Enter first name"
/>

<FormInput
  label="Last Name"
  name="last_name"
  value={user.last_name}
  onChange={(e) => {
    const value = e.target.value;
    // Allow only alphabets
    if (/^[a-zA-Z]*$/.test(value)) {
      handleChange(e);
    }
  }}
  onKeyDown={(e) => {
    // Allow only letters and control keys
    if (
      !/[a-zA-Z]/.test(e.key) &&
      !["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight"].includes(e.key)
    ) {
      e.preventDefault();
    }
  }}
  placeholder="Enter last name"
/>
<FormInput
  label="Email"
  name="mail"
  type="email"
  value={user.mail}
  onChange={(e) => {
    const value = e.target.value;
    // Allow only letters, numbers, @, ., _, -
    if (/^[a-zA-Z0-9@._-]*$/.test(value)) {
      handleChange(e);
    }
  }}
  onKeyDown={(e) => {
    // Allow letters, numbers, @, ., _, - and control keys
    if (
      !/[a-zA-Z0-9@._-]/.test(e.key) &&
      !["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight"].includes(e.key)
    ) {
      e.preventDefault();
    }
  }}
  placeholder="Enter email"
/>

        <FormInput
          label="Contact"
          name="contact"
          value={user.contact}
          onChange={(e) => {
            const value = e.target.value;
            if (/^\d{0,10}$/.test(value)) {
              handleChange(e);
            }
          }}
          onKeyDown={(e) => {
            if (
              !/[0-9]/.test(e.key) &&
              !["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight"].includes(e.key)
            ) {
              e.preventDefault();
            }
          }}
          placeholder="Enter contact number"
          maxLength={10}
        />
        <FormInput
          label="New Password ()"
          name="password"
          type="password"
          value={user.password}
          onChange={handleChange}
          placeholder="Leave blank to keep current password"
        />
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_active"
            checked={user.is_active}
            onChange={handleChange}
            id="is_active"
          />
          <label htmlFor="is_active" className="text-sm text-gray-700">
            Is Active
          </label>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
          <Button
            type="button"
            variant="secondary"
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
