import { useEffect, useState } from "react";
import axios from "axios";

export default function PermissionGroupManagement() {
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [editGroupName, setEditGroupName] = useState("");
  const [editingGroupId, setEditingGroupId] = useState(null);

  const token = localStorage.getItem("token");

  const axiosInstance = axios.create({
    baseURL: "http://localhost:8000",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await axiosInstance.get("/admin/groups");
      setGroups(res.data);
    } catch (err) {
      alert("Failed to fetch groups: " + err.response?.data?.detail || err.message);
    }
  };

  const fetchPermissions = async (groupId) => {
    try {
      setSelectedGroupId(groupId);
      const res = await axiosInstance.get(`/admin/groups/${groupId}/permissions`);
      setPermissions(res.data);
    } catch (err) {
      alert("Failed to fetch permissions: " + err.response?.data?.detail || err.message);
    }
  };

  const handleCreate = async () => {
    if (!newGroupName.trim()) return;
    try {
      await axiosInstance.post("/admin/groups", {
        group_name: newGroupName,
      });
      setNewGroupName("");
      fetchGroups();
    } catch (err) {
      alert("Failed to create group: " + err.response?.data?.detail || err.message);
    }
  };

  const handleEdit = (groupId, groupName) => {
    setEditingGroupId(groupId);
    setEditGroupName(groupName);
  };

  const handleUpdate = async () => {
    try {
      await axiosInstance.put(`/admin/groups/${editingGroupId}`, {
        group_name: editGroupName,
      });
      setEditingGroupId(null);
      setEditGroupName("");
      fetchGroups();
    } catch (err) {
      alert("Failed to update group: " + err.response?.data?.detail || err.message);
    }
  };

  const handleDelete = async (groupId) => {
    if (!window.confirm("Are you sure you want to delete this group?")) return;
    try {
      await axiosInstance.delete(`/admin/groups/${groupId}`);
      if (selectedGroupId === groupId) setPermissions([]);
      fetchGroups();
    } catch (err) {
      alert("Failed to delete group: " + err.response?.data?.detail || err.message);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-blue-800 mb-6">Permission Group Management</h2>

      {/* Create Group */}
      <div className="flex items-center gap-3 mb-8">
        <input
          type="text"
          placeholder="Enter new group name"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Create
        </button>
      </div>

      {/* List Groups */}
      <div className="grid md:grid-cols-2 gap-6">
        {groups.map((group) => (
          <div
            key={group.group_id}
            className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-all"
          >
            {editingGroupId === group.group_id ? (
              <>
                <input
                  type="text"
                  value={editGroupName}
                  onChange={(e) => setEditGroupName(e.target.value)}
                  className="border border-gray-300 p-2 rounded w-full mb-3"
                />
                <div className="flex justify-end gap-3">
                  <button
                    className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                    onClick={handleUpdate}
                  >
                    Save
                  </button>
                  <button
                    className="text-gray-500 hover:underline"
                    onClick={() => setEditingGroupId(null)}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {group.group_name}
                  </h3>
                  <div className="flex gap-3 text-sm font-medium">
                    <button
                      onClick={() => fetchPermissions(group.group_id)}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEdit(group.group_id, group.group_name)}
                      className="text-green-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(group.group_id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Permissions */}
      {selectedGroupId && (
        <div className="mt-10">
          <h4 className="text-xl font-semibold text-blue-700 mb-3">
            Permissions in Selected Group
          </h4>
          {permissions.length === 0 ? (
            <p className="text-gray-500 italic">No permissions assigned.</p>
          ) : (
            <ul className="grid sm:grid-cols-2 gap-4">
              {permissions.map((perm, idx) => (
                <li
                  key={idx}
                  className="border border-gray-200 rounded-md p-4 bg-gray-50 shadow-sm"
                >
                  <p className="font-semibold text-gray-700">{perm.code}</p>
                  <p className="text-sm text-gray-600">{perm.description}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
