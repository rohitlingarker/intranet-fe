import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Button from "../../../../components/Button/Button";
import SearchInput from "../../../../components/filter/Searchbar";
import { showStatusToast } from "../../../../components/toastfy/toast";
import Modal from "../../../../components/Modal/modal";

// PermissionList Component
function PermissionList({ permissions, showAdd = false, showDelete = false, onAdd, onDelete }) {
  if (permissions.length === 0) return <div className="text-gray-500 p-2">No permissions found.</div>;

  return (
    <div className="border p-4 rounded bg-gray-50 max-h-64 overflow-y-auto space-y-2">
      {permissions.map((perm) => (
        <div
          key={perm.permission_id}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center border p-2 rounded"
        >
          <div className="mb-2 sm:mb-0">
            <p className="font-medium">{perm.permission_code}</p>
            <p className="text-sm text-gray-600">{perm.description}</p>
          </div>
          {(showAdd || showDelete) && (
            <div className="flex gap-2 flex-wrap">
              {showAdd && (
                <Button
                  size="small"
                  variant="primary"
                  onClick={() => onAdd && onAdd(perm.permission_id)}
                  type="button"
                  className="w-full sm:w-auto"
                >
                  Add
                </Button>
              )}
              {showDelete && (
                <Button
                  size="small"
                  variant="danger"
                  onClick={() => onDelete && onDelete(perm.permission_id)}
                  type="button"
                  className="w-full sm:w-auto"
                >
                  Delete
                </Button>
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
  const [editGroupName, setEditGroupName] = useState("");
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

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteGroupId, setDeleteGroupId] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const axiosInstance = axios.create({
    baseURL: `${import.meta.env.VITE_USER_MANAGEMENT_URL}`,
    headers: { Authorization: `Bearer ${token}` },
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
      showStatusToast("Failed to fetch groups: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPermissions = async () => {
    try {
      const res = await axiosInstance.get("/admin/permissions/");
      setAllPermissions(res.data);
    } catch (err) {
      showStatusToast("Failed to fetch all permissions: " + err.message, "error");
    }
  };

  const fetchGroupPermissions = async (groupId) => {
    try {
      const res = await axiosInstance.get(`/admin/groups/${groupId}/permissions`);
      setGroupPermissions(res.data);
    } catch (err) {
      showStatusToast("Failed to fetch group permissions: " + err.message, "error");
    }
  };

  const handleCreate = async () => {
    if (!newGroupName.trim()) return showStatusToast("Group name cannot be empty.", "warning");
    try {
      await axiosInstance.post("/admin/groups", { group_name: newGroupName });
      showStatusToast("Group created successfully!", "success");
      setNewGroupName("");
      fetchGroups();
    } catch (err) {
      showStatusToast(err?.response?.data?.detail || err.message, "error");
    }
  };

  const handleEditClick = (group) => {
    setEditingGroup(group);
    setEditGroupName(group.group_name);
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!editGroupName.trim()) return showStatusToast("Group name cannot be empty.", "warning");
    try {
      await axiosInstance.put(`/admin/groups/${editingGroup.group_id}`, { group_name: editGroupName });
      showStatusToast("Group updated successfully!", "success");
      setShowEditModal(false);
      setEditingGroup(null);
      setEditGroupName("");
      fetchGroups();
    } catch (err) {
      showStatusToast(err?.response?.data?.detail || err.message, "error");
    }
  };

  const handleDeleteClick = (group_id) => {
    setDeleteGroupId(group_id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`/admin/groups/${deleteGroupId}`);
      fetchGroups();
      showStatusToast("Group deleted successfully!", "success");
    } catch (err) {
      showStatusToast("Failed to delete group: " + err.message, "error");
    } finally {
      setShowDeleteModal(false);
      setDeleteGroupId(null);
    }
  };

  const handleGroupSelect = async () => {
    if (!selectedGroupId) return showStatusToast("Please select a group.", "warning");
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

  const handleDeleteClickPermission = () => {
    setShowDeleteList(true);
    setShowPermissionList(false);
    setShowViewList(false);
    setSearchTerm("");
    setSearchTrigger(false);
  };

  const handleViewClick = () => {
    if (!selectedGroupId) return showStatusToast("Please select a group.", "warning");
    setShowViewList(true);
    setShowPermissionList(false);
    setShowDeleteList(false);
  };

  const handleAddPermissionToGroup = async (permission_id) => {
    if (!selectedGroupId) return showStatusToast("Please select a group first.", "warning");
    try {
      await axiosInstance.post(`/admin/groups/${selectedGroupId}/permissions`, [permission_id]);
      showStatusToast("Permission added successfully.", "success");
      fetchGroupPermissions(selectedGroupId);
    } catch (err) {
      showStatusToast("Failed to add permission: " + err.message, "error");
    }
  };

  const handleRemovePermissionFromGroup = async (permission_id) => {
    if (!selectedGroupId) return showStatusToast("Please select a group first.", "warning");
    try {
      await axiosInstance.delete(`/admin/groups/${selectedGroupId}/permissions`, { data: [permission_id] });
      showStatusToast("Permission removed successfully.", "success");
      fetchGroupPermissions(selectedGroupId);
    } catch (err) {
      showStatusToast("Failed to remove permission: " + err.message, "error");
    }
  };

  const unassignedPermissions = allPermissions.filter(
    (perm) => !groupPermissions.some((gp) => gp.permission_id === perm.permission_id)
  );

  const filterPermissions = (list) => {
    if (!searchTrigger) return list;
    return list.filter(
      (perm) =>
        (perm.permission_code?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (perm.description?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );
  };

  function enrichWithCode(permissionList) {
    return permissionList.map((perm) => {
      if (perm.permission_code) return perm;
      const found = allPermissions.find((p) => p.permission_id === perm.permission_id);
      return { ...perm, permission_code: found ? found.permission_code : "Unknown code" };
    });
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center sm:text-left">Permission Group Management</h2>

      {/* Create Group */}
      <div className="bg-white p-4 rounded shadow mb-6 flex flex-col sm:flex-row gap-3 sm:items-center">
        <input
          type="text"
          placeholder="Group Name"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          className="flex-1 p-2 border rounded w-full"
        />
        <Button size="medium" variant="primary" onClick={handleCreate} type="button" className="w-full sm:w-auto">
          Create Group
        </Button>
      </div>

      {/* Groups List */}
      <div className="bg-white p-4 rounded shadow mb-6 overflow-x-auto">
        <h3 className="text-lg font-semibold mb-3">Existing Groups</h3>
        {loading ? (
          <p className="text-gray-500">Loading groups...</p>
        ) : (
          <ul className="space-y-2">
            {groups.map((group) => (
              <li
                key={group?.group_id}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-2 gap-2"
              >
                <span>{group?.group_name}</span>
                <div className="flex gap-3 flex-wrap">
                  <Button
                    size="small"
                    variant="primary"
                    className="text-sm w-full sm:w-auto"
                    onClick={() => handleEditClick(group)}
                    type="button"
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    variant="danger"
                    className="text-sm w-full sm:w-auto"
                    onClick={() => handleDeleteClick(group?.group_id)}
                    type="button"
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)}>
        <h2 className="text-lg font-semibold mb-4">Edit Group</h2>
        <input
          type="text"
          value={editGroupName}
          onChange={(e) => setEditGroupName(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={handleUpdate} variant="primary" size="medium" className="w-full sm:w-auto">
            Save
          </Button>
          <Button
            onClick={() => setShowEditModal(false)}
            variant="secondary"
            size="medium"
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
        <p>Are you sure you want to delete this group?</p>
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <Button onClick={confirmDelete} variant="danger" size="medium" className="w-full sm:w-auto">
            Yes, Delete
          </Button>
          <Button
            onClick={() => setShowDeleteModal(false)}
            variant="secondary"
            size="medium"
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
        </div>
      </Modal>

      {/* Group Permissions */}
      <div className="bg-white p-4 rounded shadow overflow-x-auto">
        <h3 className="text-lg font-semibold mb-4">Group Permissions</h3>

        {/* Select Group */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="flex-1 p-2 border rounded w-full"
          >
            <option value="">-- Select Group --</option>
            {groups.map((group) => (
              <option key={group.group_id} value={group.group_id}>
                {group.group_name}
              </option>
            ))}
          </select>
          <Button size="medium" variant="primary" onClick={handleGroupSelect} type="button" className="w-full sm:w-auto">
            Select
          </Button>
        </div>

        {showPermissionActions && (
          <>
            <hr className="my-4" />
            <h4 className="text-md font-semibold mb-3">Actions:</h4>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-6 mb-6">
              <Button size="medium" variant="primary" onClick={handleAddClick} type="button" className="w-full sm:w-auto">
                Add
              </Button>
              <Button size="medium" variant="danger" onClick={handleDeleteClickPermission} type="button" className="w-full sm:w-auto">
                Delete
              </Button>
              <Button size="medium" variant="secondary" onClick={handleViewClick} type="button" className="w-full sm:w-auto">
                View
              </Button>
            </div>

            {/* Search Input */}
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <div className="flex-1">
                <SearchInput
                  placeholder="Search permissions..."
                  onSearch={(q) => {
                    setSearchTerm(q);
                    setSearchTrigger(q.length > 0);
                  }}
                />
              </div>
            </div>

            {/* Add Permissions */}
            {showPermissionList && (
              <PermissionList
                permissions={filterPermissions(unassignedPermissions)}
                showAdd={true}
                showDelete={false}
                onAdd={handleAddPermissionToGroup}
              />
            )}

            {/* Delete Permissions */}
            {showDeleteList && (
              <PermissionList
                permissions={filterPermissions(enrichWithCode(groupPermissions))}
                showAdd={false}
                showDelete={true}
                onDelete={handleRemovePermissionFromGroup}
              />
            )}

            {/* View Permissions */}
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
