import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import axios from "axios";
import Button from "../../../../components/Button/Button"; // ✅ Import custom Button component

const RoleForm = ({ roles, setRoles, onRoleUpdate }) => {
  const [newRole, setNewRole] = useState("");
  const [editingRole, setEditingRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("token");
  const authHeader = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8000/admin/roles", authHeader);
      setRoles(res.data);
      onRoleUpdate(res.data);
    } catch (err) {
      console.error("Failed to fetch roles:", err);
      if (err.response?.status === 401) {
        toast.success("Session expired. Please log in again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async () => {
    if (!newRole.trim()) return toast.success("Role name cannot be empty.");
    setSaving(true);
    try {
      if (editingRole) {
        await axios.put(
          `http://localhost:8000/admin/roles/${editingRole.role_id}`,
          { role_name: newRole },
          authHeader
        );
      } else {
        await axios.post("http://localhost:8000/admin/roles", { role_name: newRole }, authHeader);
      }
      setNewRole("");
      setEditingRole(null);
      fetchRoles();
    } catch (err) {
      console.error("Error saving role:", err);
      toast.error("Failed to save role");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (role) => {
    try {
      const res = await axios.get(`http://localhost:8000/admin/roles/${role.role_id}`, authHeader);
      setNewRole(res.data.role_name);
      setEditingRole(res.data);
    } catch (err) {
      console.error("Failed to fetch role details:", err);
    }
  };

  const handleDelete = async (role_id) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      try {
        await axios.delete(`http://localhost:8000/admin/roles/${role_id}`, authHeader);
        fetchRoles();
      } catch (err) {
        console.error("Failed to delete role:", err);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Role Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">
          {editingRole ? "Edit Role" : "Create New Role"}
        </h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Enter role name"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          {/* ✅ Custom Button Component */}
          <Button
            size="medium"
            variant="primary"
            onClick={handleCreateOrUpdate}
            disabled={saving}
            className={`${saving ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {saving ? "Saving..." : editingRole ? "Update Role" : "Create Role"}
          </Button>

          {editingRole && (
            <button
              onClick={() => {
                setEditingRole(null);
                setNewRole("");
              }}
              className="text-gray-500 hover:underline text-sm self-center"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Role List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Existing Roles</h3>
        {loading ? (
          <p className="text-gray-500">Loading roles...</p>
        ) : roles.length === 0 ? (
          <p className="text-gray-500">No roles found.</p>
        ) : (
          <ul className="space-y-3">
            {roles.map((role) => (
              <li
                key={role.role_id}
                className="flex justify-between items-center p-3 border rounded-md hover:shadow-sm bg-gray-50"
              >
                <span className="text-gray-800 font-medium">{role.role_name}</span>
                <div className="space-x-2">
                  <button
                    onClick={() => handleEdit(role)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(role.role_id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RoleForm;
