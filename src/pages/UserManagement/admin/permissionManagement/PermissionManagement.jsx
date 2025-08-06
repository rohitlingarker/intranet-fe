import { useEffect, useState } from "react";
import axios from "axios";

export default function PermissionManagement() {
  const [permissions, setPermissions] = useState([]);
  const [groups, setGroups] = useState([]);
  const [newPermission, setNewPermission] = useState("");
  const [description, setNewDescription] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [editingPermission, setEditingPermission] = useState(null);
  const [mode, setMode] = useState("basic"); // "basic" or "withGroup"

  const token = localStorage.getItem("token");

  const axiosInstance = axios.create({
    baseURL: "http://localhost:8000",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  useEffect(() => {
    fetchPermissions();
    fetchGroups();
  }, []);

  const fetchPermissions = async () => {
    try {
      const res = await axiosInstance.get("/admin/permissions/");
      setPermissions(res.data);
    } catch (err) {
      console.error("Failed to fetch permissions", err);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await axiosInstance.get("/admin/groups");
      setGroups(res.data);
    } catch (err) {
      console.error("Failed to fetch groups", err);
    }
  };

  const handleCreateOrUpdate = async () => {
    try {
      if (editingPermission) {
        await axiosInstance.put(`/admin/permissions/${editingPermission.permission_id}`, {
          permission_code: newPermission,
          description,
        });

        if (mode === "withGroup") {
          await axiosInstance.put(`/admin/permissions/${editingPermission.permission_id}/group`, {
            group_id: selectedGroup,
          });
        }
      } else {
        const payload = {
          permission_code: newPermission,
          description,
        };

        if (mode === "withGroup") {
          payload.group_id = selectedGroup;
        }

        await axiosInstance.post("/admin/permissions/", payload);
      }

      resetForm();
      fetchPermissions();
    } catch (err) {
      console.error("Error saving permission", err);
      alert("Failed to save permission");
    }
  };

  const handleEdit = (permission) => {
    setNewPermission(permission.permission_code);
    setNewDescription(permission.description || "");
    setSelectedGroup(permission.group_id || "");
    setEditingPermission(permission);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this permission?")) {
      try {
        await axiosInstance.delete(`/admin/permissions/${id}`);
        fetchPermissions();
      } catch (err) {
        console.error("Failed to delete permission", err);
      }
    }
  };

  const resetForm = () => {
    setNewPermission("");
    setNewDescription("");
    setSelectedGroup("");
    setEditingPermission(null);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Permission Management</h2>

      {/* Header Navigation */}
      <div className="flex gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded ${mode === "basic" ? "bg-blue-900 text-white" : "bg-gray-200"}`}
          onClick={() => setMode("basic")}
        >
          Create Permission Only
        </button>
        <button
          className={`px-4 py-2 rounded ${mode === "withGroup" ? "bg-blue-900 text-white" : "bg-gray-200"}`}
          onClick={() => setMode("withGroup")}
        >
          Create Permission with Group
        </button>
      </div>

      {/* Form */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <input
          type="text"
          placeholder="Permission code (e.g., READ_USER)"
          value={newPermission}
          onChange={(e) => setNewPermission(e.target.value)}
          className="w-full p-2 border rounded mb-3"
        />

        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setNewDescription(e.target.value)}
          className="w-full p-2 border rounded mb-3"
        />

        {mode === "withGroup" && (
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(Number(e.target.value))}
            className="w-full p-2 border rounded mb-3"
          >
            <option value="">-- Select Permission Group --</option>
            {groups.map((g) => (
              <option key={g.group_id} value={g.group_id}>
                {g.group_name}
              </option>
            ))}
          </select>
        )}

        <button
          onClick={handleCreateOrUpdate}
          className="bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-950"
        >
          {editingPermission ? "Update" : "Create"}
        </button>

        {editingPermission && (
          <button
            onClick={resetForm}
            className="ml-3 text-sm text-gray-600 underline"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Permissions Table */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-3">Existing Permissions</h3>
        <ul className="space-y-2">
          {permissions.map((perm) => (
            <li
              key={perm.permission_id}
              className="flex justify-between items-center border-b pb-2"
            >
              <span>
                <span className="font-medium">{perm.permission_code}</span>{" "}
                <span className="text-gray-500 text-sm">
                  ({perm.group_name || "No Group"})
                </span>
              </span>
              <div className="flex gap-3">
                <button
                  onClick={() => handleEdit(perm)}
                  className="text-blue-900 text-sm hover:text-blue-950"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(perm.permission_id)}
                  className="text-red-600 text-sm hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
