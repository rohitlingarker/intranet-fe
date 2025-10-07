import Navbar from "../../../../components/Navbar/Navbar";
import Button from "../../../../components/Button/Button";
import Pagination from "../../../../components/Pagination/pagination";
import FormInput from "../../../../components/forms/FormInput";
import { Pencil, Trash } from "lucide-react";
import Modal from "../../../../components/Modal/modal";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify"; // ✅ For single toast
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

  // 🔹 Utility: Show single toast at a time
  const showSingleToast = (msg, type) => {
    toast.dismiss(); // ✅ Dismiss any existing toast
    showStatusToast(msg, type);
  };

  // 🔹 Enhanced validation helper
  const validatePermissionCode = (code) => {
    if (!code.trim()) {
      showSingleToast("Enter the permission", "error");
      return false;
    }
    
    // Check if contains capital letters
    if (!/[A-Z]/.test(code)) {
      showSingleToast("Permission code must contain at least one capital letter", "error");
      return false;
    }
    
    // Check allowed characters (letters, spaces, hyphens, underscores)
    const validCharsRegex = /^[A-Za-z\s-_]+$/;
    if (!validCharsRegex.test(code)) {
      showSingleToast(
        "Permission code can only contain letters, spaces, hyphens, and underscores",
        "error"
      );
      return false;
    }
    
    return true;
  };

  // 🔹 Description validation helper
  const validateDescription = (desc) => {
    if (!desc.trim()) {
      showSingleToast("Description shouldn't be empty", "error");
      return false;
    }
    
    // Check if contains only text (letters, spaces, and basic punctuation)
    const textOnlyRegex = /^[A-Za-z\s.,!?-_()]+$/;
    if (!textOnlyRegex.test(desc)) {
      showSingleToast("Description should contain only text format", "error");
      return false;
    }
    
    return true;
  };

  // 🔹 Add Permission
  const handleCreate = async () => {
    if (!validatePermissionCode(newPermission)) return;
    if (!validateDescription(description)) return;

    try {
      const payload = {
        permission_code: newPermission,
        description,
      };

      if (mode === "withGroup") {
        payload.group_uuid = selectedGroup;
      }

      await axiosInstance.post("/admin/permissions/", payload);
      showSingleToast("Permission created successfully!", "success");

      resetForm();
      fetchPermissions();
    } catch (err) {
      console.error("Error creating permission", err);

      if (err.response?.data?.detail) {
        showSingleToast(err.response.data.detail, "error");
      } else {
        showSingleToast("Failed to create permission", "error");
      }
    }
  };

  // 🔹 Update Permission (from modal)
  const handleUpdate = async () => {
    if (!validatePermissionCode(editCode)) return;
    if (!validateDescription(editDescription)) return;

    try {
      await axiosInstance.put(`/admin/permissions/${editingPermission.permission_uuid}`, {
        permission_code: editCode,
        description: editDescription,
      });

      if (mode === "withGroup") {
        await axiosInstance.put(`/admin/permissions/${editingPermission.permission_uuid}/group`, {
          group_uuid: editGroup,
        });
      }

      showSingleToast("Permission updated successfully!", "success");
      setShowModal(false);
      fetchPermissions();
    } catch (err) {
      console.error("Error updating permission", err);

      if (err.response?.data?.detail) {
        showSingleToast(err.response.data.detail, "error");
      } else {
        showSingleToast("Failed to update permission", "error");
      }
    }
  };

  const handleEdit = (permission) => {
    setEditingPermission(permission);
    setEditCode(permission.permission_code);
    setEditDescription(permission.description || "");
    setEditGroup(permission.group_uuid || "");
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
      showSingleToast("Permission deleted successfully!", "success");
    } catch (err) {
      console.error("Failed to delete permission", err);
      showSingleToast("Failed to delete permission", "error");
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

  // 🔹 Handle permission code input with validation
  const handlePermissionChange = (e) => {
    const value = e.target.value;
    // Allow only letters, spaces, hyphens, underscores
    if (/^[A-Za-z\s-_]*$/.test(value)) {
      setNewPermission(value);
    }
  };

  // 🔹 Handle description input with validation
  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    // Allow only text format (letters, spaces, basic punctuation)
    if (/^[A-Za-z\s.,!?-_()]*$/.test(value)) {
      setNewDescription(value);
    }
  };

  // 🔹 Handle edit permission code input with validation
  const handleEditPermissionChange = (e) => {
    const value = e.target.value;
    // Allow only letters, spaces, hyphens, underscores
    if (/^[A-Za-z\s-_]*$/.test(value)) {
      setEditCode(value);
    }
  };

  // 🔹 Handle edit description input with validation
  const handleEditDescriptionChange = (e) => {
    const value = e.target.value;
    // Allow only text format (letters, spaces, basic punctuation)
    if (/^[A-Za-z\s.,!?-_()]*$/.test(value)) {
      setEditDescription(value);
    }
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
          onChange={handlePermissionChange}
          placeholder="e.g., READ_USER (must contain capital letters)"
          className="mb-3"
        />

        <FormInput
          type="text"
          label="Description"
          padding="medium"
          placeholder="Enter description (text only)"
          value={description}
          onChange={handleDescriptionChange}
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
              <option key={g.group_uuid} value={g.group_uuid}>
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
              key={perm.permission_uuid}
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
                  onClick={() => handleDeleteClick(perm.permission_uuid)}
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
          onChange={handleEditPermissionChange}
          placeholder="e.g., READ_USER (must contain capital letters)"
          className="mb-3"
        />
        <FormInput
          type="text"
          label="Description"
          placeholder="Enter description (text only)"
          value={editDescription}
          onChange={handleEditDescriptionChange}
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
              <option key={g.group_uuid} value={g.group_uuid}>
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