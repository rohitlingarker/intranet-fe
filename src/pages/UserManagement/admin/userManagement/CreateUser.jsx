import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
 
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
 
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8000/admin/users", form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("User created successfully!");
      navigate("/user-management/users");
    } catch (err) {
      console.error("User creation failed:", err);
      toast.error("Failed to create user.");
    }
  };
 
  return (
    <div className="px-6 py-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Create New User</h1>
        <p className="text-gray-500">
          Fill out the form to add a new user to the system.
        </p>
      </div>
 
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="First Name"
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            placeholder="Enter first name"
            required
          />
          <FormInput
            label="Last Name"
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
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
            onChange={handleChange}
            placeholder="Enter email"
            required
          />
          <FormInput
            label="Contact"
            type="tel"
            name="contact"
            value={form.contact}
            onChange={handleChange}
            placeholder="Enter contact number"
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
          <Button type="submit" variant="primary" size="medium">
            Create User
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="medium"
            onClick={() => navigate("/user-management/users")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
 