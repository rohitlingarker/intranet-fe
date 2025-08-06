import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
 
export default function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
 
  const [user, setUser] = useState({
    first_name: "",
    last_name: "",
    mail: "",
    contact: "",
    password: "",         // 🔑 Add password field
    is_active: true
  });
 
  useEffect(() => {
    axios
      .get(`http://localhost:8000/admin/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
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
      [name]: type === "checkbox" ? checked : value
    }));
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...user };
      if (!payload.password) delete payload.password; // Don't send password if empty
 
      await axios.put(
        `http://localhost:8000/admin/users/${id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
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
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 shadow rounded-lg">
        <input
          type="text"
          name="first_name"
          placeholder="First Name"
          value={user.first_name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          name="last_name"
          placeholder="Last Name"
          value={user.last_name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="email"
          name="mail"
          placeholder="Email"
          value={user.mail}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          name="contact"
          placeholder="Contact"
          value={user.contact}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="New Password (leave blank to keep current)"
          value={user.password}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_active"
            checked={user.is_active}
            onChange={handleChange}
          />
          <label htmlFor="is_active">Is Active</label>
        </div>
        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={() => navigate("/user-management/users")}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}