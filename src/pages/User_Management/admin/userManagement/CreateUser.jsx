import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
      alert("User created successfully!");
      navigate("/user-management/users");
    } catch (err) {
      console.error("User creation failed:", err);
      alert("Failed to create user.");
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              type="text"
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Enter first name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              type="text"
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Enter last name"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="mail"
              value={form.mail}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Enter email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
            <input
              type="text"
              name="contact"
              value={form.contact}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Enter contact number"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Create a password"
            required
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_active"
            checked={form.is_active}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label htmlFor="is_active" className="text-gray-700">Active</label>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-blue-900 hover:bg-blue-950 text-white px-6 py-2 rounded-md transition duration-200"
          >
            Create User
          </button>
          <button
            type="button"
            onClick={() => navigate("/user-management/users")}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-md transition duration-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
