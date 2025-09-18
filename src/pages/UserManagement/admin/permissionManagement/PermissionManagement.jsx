import Navbar from "../../../../components/Navbar/Navbar";
import Button from "../../../../components/Button/Button";
import Pagination from "../../../../components/Pagination/pagination";
import FormInput from "../../../../components/forms/FormInput";
import { Pencil, Trash } from "lucide-react";
import Modal from "../../../../components/Modal/modal";

import { useEffect, useState } from "react";
import axios from "axios";
import { showStatusToast } from "../../../../components/toastfy/toast";

export default function PermissionManagement() {
  const [permissions, setPermissions] = useState([]);
  const [groups, setGroups] = useState([]);

  // 🔹 Add Permission Form States
  const [newPermission, setNewPermission] = useState("");
  const [description, setNewDescription] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");

  // 🔹 Edit Modal States
  const [editingPermission, setEditingPermission] = useState(null);
  const [editCode, setEditCode] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editGroup, setEditGroup] = useState("");

  const [mode, setMode] = useState("basic"); // "basic" or "withGroup"
  const [showModal, setShowModal] = useState(false); // modal for edit
  const [showDeleteModal, setShowDeleteModal] = useState(false); // modal for delete
  const [deleteId, setDeleteId] = useState(null); // which permission to delete

  const token = localStorage.getItem("token");

  const axiosInstance = axios.create({
    baseURL: `${import.meta.env.VITE_USER_MANAGEMENT_URL}`,
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

  // 🔹 Add Permission
  const handleCreate = async () => {
    try {
      const payload = {
        permission_code: newPermission,
        description,
      };

      if (mode === "withGroup") {
        payload.group_id = selectedGroup;
      }

      await axiosInstance.post("/admin/permissions/", payload);
      showStatusToast("Permission created successfully!", "success");

      resetForm();
      fetchPermissions();
    } catch (err) {
      console.error("Error creating permission", err);
      showStatusToast("Failed to create permission", "error");
    }
  };

  // 🔹 Update Permission (from modal)
  const handleUpdate = async () => {
    try {
      await axiosInstance.put(`/admin/permissions/${editingPermission.permission_id}`, {
        permission_code: editCode,
        description: editDescription,
      });

      if (mode === "withGroup") {
        await axiosInstance.put(`/admin/permissions/${editingPermission.permission_id}/group`, {
          group_id: editGroup,
        });
      }

      showStatusToast("Permission updated successfully!", "success");
      setShowModal(false);
      fetchPermissions();
    } catch (err) {
      console.error("Error updating permission", err);
      showStatusToast("Failed to update permission", "error");
    }
  };

  // 🔹 Open Edit Modal with prefilled values
  const handleEdit = (permission) => {
    setEditingPermission(permission);
    setEditCode(permission.permission_code);
    setEditDescription(permission.description || "");
    setEditGroup(permission.group_id || "");
    setShowModal(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`/admin/permissions/${deleteId}`);
      fetchPermissions();
      showStatusToast("Permission deleted successfully!", "success");
    } catch (err) {
      console.error("Failed to delete permission", err);
      showStatusToast("Failed to delete permission", "error");
    } finally {
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

  const resetForm = () => {
    setNewPermission("");
    setNewDescription("");
    setSelectedGroup("");
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(permissions.length / itemsPerPage);

  const paginatedPermissions = permissions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header Navigation */}
      <div className="mb-6">
        <Navbar
          logo="Permissions Manage"
          navItems={[
            {
              name: "Create Permission Only",
              onClick: () => setMode("basic"),
              isActive: mode === "basic",
            },
            {
              name: "Create Permission with Group",
              onClick: () => setMode("withGroup"),
              isActive: mode === "withGroup",
            },
          ]}
        />
      </div>

      {/* Input Section for Adding New Permission */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="text-lg font-semibold mb-3">Add New Permission</h3>

        <FormInput
          label="Permission Code"
          name="permission_code"
          value={newPermission}
          onChange={(e) => setNewPermission(e.target.value)}
          placeholder="e.g., READ_USER"
          className="mb-3"
        />

        <FormInput
          type="text"
          padding="medium"
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

        <Button
          onClick={handleCreate}
          variant="primary"
          size="medium"
          className="mt-3"
        >
          Add Permission
        </Button>
      </div>

      {/* Permissions Table */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-3">Existing Permissions</h3>
        <ul className="space-y-2">
          {paginatedPermissions.map((perm) => (
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
                  className="p-2 rounded hover:bg-blue-100 text-blue-900"
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteClick(perm.permission_id)}
                  className="p-2 rounded hover:bg-red-100 text-red-600"
                  title="Delete"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevious={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          onNext={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        />
      </div>

      {/* Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <h2 className="text-lg font-semibold mb-4">Edit Permission</h2>
        <FormInput
          label="Permission Code"
          name="edit_permission_code"
          value={editCode}
          onChange={(e) => setEditCode(e.target.value)}
          placeholder="e.g., READ_USER"
          className="mb-3"
        />
        <FormInput
          type="text"
          placeholder="Description"
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          className="w-full p-2 border rounded mb-3"
        />
        {mode === "withGroup" && (
          <select
            value={editGroup}
            onChange={(e) => setEditGroup(Number(e.target.value))}
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
        <div className="flex gap-3 mt-4">
          <Button onClick={handleUpdate} variant="primary" size="medium">
            Update
          </Button>
          <Button
            onClick={() => setShowModal(false)}
            variant="secondary"
            size="medium"
          >
            Cancel
          </Button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <h2 className="text-lg font-semibold mb-4">
          Are you sure you want to delete this permission?
        </h2>
        <div className="flex gap-3 mt-4">
          <Button onClick={confirmDelete} variant="danger" size="medium">
            OK
          </Button>
          <Button
            onClick={() => setShowDeleteModal(false)}
            variant="secondary"
            size="medium"
          >
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
}
