import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// PermissionList component that supports optional Add/Delete buttons
function PermissionList({
  permissions,
  showAdd = false,
  showDelete = false,
  onAdd,
  onDelete,
}) {
  if (permissions.length === 0) {
    return <div className="text-gray-500 p-2">No permissions found.</div>;
  }
  return (
    <div className="border p-4 rounded bg-gray-50 max-h-64 overflow-y-auto space-y-2">
      {permissions.map((perm) => (
        <div
          key={perm.permission_id}
          className="flex justify-between items-center border p-2 rounded"
        >
          <div>
            <p className="font-medium">{perm.permission_code}</p>
            <p className="text-sm text-gray-600">{perm.description}</p>
          </div>
          {(showAdd || showDelete) && (
            <div className="flex gap-2">
              {showAdd && (
                <button
                  onClick={() => onAdd && onAdd(perm.permission_id)}
                  className="bg-blue-900 hover:bg-blue-700 text-white px-4 py-1 rounded"
                  type="button"
                >
                  Add
                </button>
              )}
              {showDelete && (
                <button
                  onClick={() => onDelete && onDelete(perm.permission_id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded"
                  type="button"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function PermissionGroupManagement() {
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [editingGroup, setEditingGroup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [showPermissionActions, setShowPermissionActions] = useState(false);
  const [allPermissions, setAllPermissions] = useState([]);
  const [groupPermissions, setGroupPermissions] = useState([]);
  const [showPermissionList, setShowPermissionList] = useState(false);
  const [showDeleteList, setShowDeleteList] = useState(false);
  const [showViewList, setShowViewList] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTrigger, setSearchTrigger] = useState(false);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const axiosInstance = axios.create({
    baseURL: "http://localhost:8000",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  useEffect(() => {
    fetchGroups();
    fetchAllPermissions();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/admin/groups");
      setGroups(res.data);
    } catch (err) {
      alert("Failed to fetch groups: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPermissions = async () => {
    try {
      const res = await axiosInstance.get("/admin/permissions/");
      setAllPermissions(res.data);
    } catch (err) {
      alert("Failed to fetch all permissions: " + err.message);
    }
  };

  const fetchGroupPermissions = async (groupId) => {
    try {
      const res = await axiosInstance.get(
        `/admin/groups/${groupId}/permissions`
      );
      setGroupPermissions(res.data);
    } catch (err) {
      alert("Failed to fetch group permissions: " + err.message);
    }
  };

  const handleCreateOrUpdate = async () => {
    try {
      if (!newGroupName.trim()) {
        alert("Group name cannot be empty.");
        return;
      }

      if (editingGroup) {
        await axiosInstance.put(`/admin/groups/${editingGroup.group_id}`, {
          group_name: newGroupName,
        });
      } else {
        await axiosInstance.post("/admin/groups", {
          group_name: newGroupName,
        });
      }

      resetForm();
      fetchGroups();
    } catch (err) {
      alert("Failed to save group: " + err.message);
    }
  };

  const handleEdit = (group) => {
    setNewGroupName(group.group_name);
    setEditingGroup(group);
  };

  const handleDelete = async (group_id) => {
    if (window.confirm("Are you sure you want to delete this group?")) {
      try {
        await axiosInstance.delete(`/admin/groups/${group_id}`);
        fetchGroups();
      } catch (err) {
        alert("Failed to delete group: " + err.message);
      }
    }
  };

  const resetForm = () => {
    setNewGroupName("");
    setEditingGroup(null);
  };

  const handleGroupSelect = async () => {
    if (!selectedGroupId) {
      alert("Please select a group.");
      return;
    }
    setShowPermissionActions(true);
    setShowPermissionList(false);
    setShowDeleteList(false);
    setShowViewList(false);
    setSearchTerm("");
    setSearchTrigger(false);
    await fetchGroupPermissions(selectedGroupId);
  };

  const handleAddClick = () => {
    setShowPermissionList(true);
    setShowDeleteList(false);
    setShowViewList(false);
    setSearchTerm("");
    setSearchTrigger(false);
  };

  const handleDeleteClick = () => {
    setShowDeleteList(true);
    setShowPermissionList(false);
    setShowViewList(false);
    setSearchTerm("");
    setSearchTrigger(false);
  };

  const handleViewClick = () => {
    if (!selectedGroupId) {
      alert("Please select a group.");
      return;
    }
    setShowViewList(true);
    setShowPermissionList(false);
    setShowDeleteList(false);
  };

  // Add permission to group
  const handleAddPermissionToGroup = async (permission_id) => {
    if (!selectedGroupId) {
      alert("Please select a group first.");
      return;
    }
    try {
      await axiosInstance.post(
        `/admin/groups/${selectedGroupId}/permissions`,
        [permission_id]
      );
      alert("Permission added successfully.");
      fetchGroupPermissions(selectedGroupId);
    } catch (err) {
      alert("Failed to add permission: " + err.message);
    }
  };

  // Remove permission from group
  const handleRemovePermissionFromGroup = async (permission_id) => {
    if (!selectedGroupId) {
      alert("Please select a group first.");
      return;
    }
    try {
      await axiosInstance.delete(
        `/admin/groups/${selectedGroupId}/permissions`,
        {
          data: [permission_id],
        }
      );
      alert("Permission removed successfully.");
      fetchGroupPermissions(selectedGroupId);
    } catch (err) {
      alert("Failed to remove permission: " + err.message);
    }
  };

  // Permissions not assigned to currently selected group
  const unassignedPermissions = allPermissions.filter(
    (perm) =>
      !groupPermissions.some((gp) => gp.permission_id === perm.permission_id)
  );

  // Filter permissions by search term if search triggered
  const filterPermissions = (list) => {
    if (!searchTrigger) return list;
    return list.filter(
      (perm) =>
        (perm.permission_code?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (perm.description?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );
  };

  // Ensure each groupPermission has permission_code (fill if missing)
  function enrichWithCode(permissionList) {
    return permissionList.map((perm) => {
      if (perm.permission_code) return perm;
      const found = allPermissions.find((p) => p.permission_id === perm.permission_id);
      return {
        ...perm,
        permission_code: found ? found.permission_code : "Unknown code",
      };
    });
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Permission Group Management</h2>

      {/* Create or Update Group */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <input
          type="text"
          placeholder="Group Name"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          className="w-full p-2 border rounded mb-3"
        />
        <button
          onClick={handleCreateOrUpdate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          type="button"
        >
          {editingGroup ? "Update Group" : "Create Group"}
        </button>
        {editingGroup && (
          <button
            onClick={resetForm}
            className="ml-3 text-sm text-gray-600 underline"
            type="button"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Existing Groups List */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="text-lg font-semibold mb-3">Existing Groups</h3>
        {loading ? (
          <p className="text-gray-500">Loading groups...</p>
        ) : (
          <ul className="space-y-2">
            {groups.map((group) => (
              <li
                key={group?.group_id}
                className="flex justify-between items-center border-b pb-2"
              >
                <span>{group?.group_name}</span>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEdit(group)}
                    className="text-blue-600 text-sm"
                    type="button"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(group?.group_id)}
                    className="text-red-600 text-sm"
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Group Permissions Section */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-4">Group Permissions</h3>

        {/* Select Group */}
        <div className="flex items-center gap-4 mb-4">
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="flex-1 p-2 border rounded"
            aria-label="Select group"
          >
            <option value="">-- Select Group --</option>
            {groups.map((group) => (
              <option key={group.group_id} value={group.group_id}>
                {group.group_name}
              </option>
            ))}
          </select>
          <button
            onClick={handleGroupSelect}
            className="bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-700"
            type="button"
          >
            Select
          </button>
        </div>

        {/* Parent-level Add, Delete, and View Buttons */}
        {showPermissionActions && (
          <>
            <hr className="my-4" />
            <h4 className="text-md font-semibold mb-3">Actions:</h4>
            <div className="flex justify-center gap-6 mb-6">
              <button
                onClick={handleAddClick}
                className="bg-blue-900 hover:bg-green-700 text-white px-9 py-2 rounded"
                type="button"
              >
                Add
              </button>
              <button
                onClick={handleDeleteClick}
                className="bg-blue-900 hover:bg-red-700 text-white px-9 py-2 rounded"
                type="button"
              >
                Delete
              </button>
              <button
                onClick={handleViewClick}
                className="bg-blue-900 hover:bg-blue-700 text-white px-9 py-2 rounded"
                type="button"
              >
                View
              </button>
            </div>

            {/* Search Input */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Search permissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 p-2 border rounded"
                aria-label="Search permissions"
              />
              <button
                onClick={() => setSearchTrigger(true)}
                className="bg-blue-700 text-white px-4 py-2 rounded"
                type="button"
              >
                Search
              </button>
            </div>

            {/* Add Permissions List */}
            {showPermissionList && (
              <PermissionList
                permissions={filterPermissions(unassignedPermissions)}
                showAdd={true}
                showDelete={false}
                onAdd={handleAddPermissionToGroup}
              />
            )}

            {/* Delete Permissions List */}
            {showDeleteList && (
              <PermissionList
                permissions={filterPermissions(enrichWithCode(groupPermissions))}
                showAdd={false}
                showDelete={true}
                onDelete={handleRemovePermissionFromGroup}
              />
            )}

            {/* View Permissions List (read-only, no buttons) */}
            {showViewList && (
              <PermissionList
                permissions={filterPermissions(enrichWithCode(groupPermissions))}
                showAdd={false}
                showDelete={false}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
