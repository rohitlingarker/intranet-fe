import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import FormInput from "../../../../components/forms/FormInput"; // Adjust path as needed
import Button from "../../../../components/Button/Button"; // Adjust path as needed

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

  useEffect(() => {
    axios
      .get(`${import.meta.env.USER_MANAGEMENT_URL}/admin/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setUser((prev) => ({ ...prev, ...res.data })))
      .catch((err) => {
        console.error("Failed to fetch user:", err);
        alert("Access denied or user not found.");
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
    try {
      const payload = { ...user };
      if (!payload.password) delete payload.password;

      await axios.put(
        `${import.meta.env.USER_MANAGEMENT_URL}/admin/users/${id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("User updated successfully!");
      navigate("/user-management/users");
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update user.");
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
          onChange={handleChange}
          placeholder="Enter first name"
        />
        <FormInput
          label="Last Name"
          name="last_name"
          value={user.last_name}
          onChange={handleChange}
          placeholder="Enter last name"
        />
        <FormInput
          label="Email"
          name="mail"
          type="email"
          value={user.mail}
          onChange={handleChange}
          placeholder="Enter email"
        />
        <FormInput
          label="Contact"
          name="contact"
          value={user.contact}
          onChange={(e) => {
            // Allow only numbers
            const value = e.target.value;
            if (/^\d{0,10}$/.test(value)) {
              handleChange(e); // update only if valid
            }
          }}
          onKeyDown={(e) => {
            // Block non-numeric keys except Backspace, Delete, Tab, Arrow keys
            if (
              !/[0-9]/.test(e.key) &&
              ![
                "Backspace",
                "Delete",
                "Tab",
                "ArrowLeft",
                "ArrowRight",
              ].includes(e.key)
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
          placeholder="Enter new password"
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
          <Button type="submit">Save Changes</Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/user-management/users")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
