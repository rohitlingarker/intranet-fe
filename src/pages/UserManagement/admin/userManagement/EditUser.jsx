import { useEffect, useState } from "react";
import axios from "axios";
import FormInput from "../../../../components/forms/FormInput";
import Button from "../../../../components/Button/Button";
import { showStatusToast } from "../../../../components/toastfy/toast";

export default function EditUserForm({ userId, onSuccess, onClose }) {
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
    if (userId) {
      axios
        .get(`${import.meta.env.VITE_USER_MANAGEMENT_URL}/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          const { password, ...rest } = res.data; // ⛔ don't include password
          setUser((prev) => ({ ...prev, ...rest }));
        })
        .catch((err) => {
          console.error("Failed to fetch user:", err);
          showStatusToast("Access denied or user not found.", "error");
          onClose(); // Close modal on error
        });
    }
  }, [userId, token, onClose]);

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
        `${import.meta.env.VITE_USER_MANAGEMENT_URL}/admin/users/${userId}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onSuccess(); // Call success handler from parent
    } catch (err) {
      console.error("Update failed:", err);
      showStatusToast(
        err.response?.data?.detail || "Failed to update user.",
        "error"
      );
    } finally {
      setLoading(false); // Re-enable button
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 p-4 max-h-[60vh] overflow-y-auto"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label="First Name"
            name="first_name"
            value={user.first_name}
            onChange={(e) => {
              const value = e.target.value;
              // ✅ Allow alphabets and spaces
              if (/^[a-zA-Z\s]*$/.test(value)) {
                handleChange(e);
              }
            }}
            onKeyDown={(e) => {
              // ✅ Allow letters, space, and control keys
              if (
                !/[a-zA-Z\s]/.test(e.key) &&
                !["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight"].includes(
                  e.key
                )
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
              // ✅ Allow alphabets and spaces
              if (/^[a-zA-Z\s]*$/.test(value)) {
                handleChange(e);
              }
            }}
            onKeyDown={(e) => {
              // ✅ Allow letters, space, and control keys
              if (
                !/[a-zA-Z\s]/.test(e.key) &&
                !["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight"].includes(
                  e.key
                )
              ) {
                e.preventDefault();
              }
            }}
            placeholder="Enter last name"
          />
        </div>

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
              !["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight"].includes(
                e.key
              )
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
              !["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight"].includes(
                e.key
              )
            ) {
              e.preventDefault();
            }
          }}
          placeholder="Enter contact number"
          maxLength={10}
        />

        <FormInput
          label="New Password (Optional)"
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
            className="rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
          />
          <label htmlFor="is_active" className="text-sm text-gray-700">
            Is Active
          </label>
        </div>

        <div className="flex gap-4 pt-4 border-t sticky bottom-0 bg-white">
          <Button type="submit" disabled={loading} className="flex-1 sm:flex-none">
            {loading ? "Saving..." : "Save Changes"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
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
