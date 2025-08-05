import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";

export default function EditUserRoleForm() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { admin } = useAuth();

  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const authHeader = {
    headers: { Authorization: `Bearer ${token}` },
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchUser(), fetchAllRoles(), fetchAssignedRoles()]);
    } catch (err) {
      console.error("Initialization failed", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    const res = await axios.get(
      `http://localhost:8000/admin/users/${userId}`,
      authHeader
    );
    setUser(res.data);
  };

  const fetchAllRoles = async () => {
    const res = await axios.get("http://localhost:8000/admin/roles", authHeader);
    setRoles(res.data);
  };

  const fetchAssignedRoles = async () => {
    const res = await axios.get(
      `http://localhost:8000/admin/users/${userId}/roles`,
      authHeader
    );
    setSelectedRoleIds(res.data.map((r) => r.role_id));
  };

  const toggleRole = (roleId) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSave = async () => {
    try {
      await axios.put(
        `http://localhost:8000/admin/users/${userId}/role`,
        { role_ids: selectedRoleIds },
        authHeader
      );
      alert("Roles updated successfully!");
      navigate(`/user-management/users/roles`);
    } catch (err) {
      console.error("Failed to update roles", err);
      alert("Update failed.");
    }
  };

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-64 text-blue-600 text-lg font-medium">
        Loading user information...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Edit Roles for{" "}
          <span className="text-blue-600">
            {user.first_name} {user.last_name}
          </span>
        </h2>

        <p className="mb-4 text-gray-500">Assign or unassign user roles:</p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {roles.map((role) => (
            <label
              key={role.role_id}
              className="flex items-center gap-3 text-gray-700"
            >
              <input
                type="checkbox"
                checked={selectedRoleIds.includes(role.role_id)}
                onChange={() => toggleRole(role.role_id)}
                className="accent-blue-600 w-4 h-4"
              />
              <span>{role.role_name}</span>
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl shadow-md"
          >
            Save Changes
          </button>
          <button
            onClick={() => navigate(`/user-management/users/roles`)}
            className="text-gray-500 hover:underline"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
