import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import Button from "../../../../components/Button/Button"; 
import Modal from "../../../../components/Modal/modal"; // ✅ Global Modal component

const RoleForm = ({ roles, setRoles, onRoleUpdate }) => {
  const [newRole, setNewRole] = useState("");
  const [editingRole, setEditingRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // ✅ Edit Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // ✅ Delete Modal
  const [roleToDelete, setRoleToDelete] = useState(null); // Track which role to delete

  const token = localStorage.getItem("token");
  const authHeader = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_USER_MANAGEMENT_URL}/admin/roles`,
        authHeader
      );
      setRoles(res.data);
      onRoleUpdate(res.data);
    } catch (err) {
      console.error("Failed to fetch roles:", err);
      if (err.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const doSave = async () => {
    if (!newRole.trim()) {
      toast.error("Role name cannot be empty.");
      return;
    }
    setSaving(true);
    try {
      if (editingRole) {
        await axios.put(
          `${import.meta.env.VITE_USER_MANAGEMENT_URL}/admin/roles/${editingRole.role_id}`,
          { role_name: newRole },
          authHeader
        );
        toast.success("Role updated successfully!");
      } else {
        await axios.post(
          `${import.meta.env.VITE_USER_MANAGEMENT_URL}/admin/roles`,
          { role_name: newRole },
          authHeader
        );
        toast.success("Role created successfully!");
      }
      setNewRole("");
      setEditingRole(null);
      fetchRoles();
      setIsEditModalOpen(false); // ✅ Close edit modal
    } catch (err) {
      console.error("Error saving role:", err);
      // showStatusToast(err?.response?.data?.detail || err.message, "error");
      toast.error(err?.response?.data?.detail);
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    if (!roleToDelete) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_USER_MANAGEMENT_URL}/admin/roles/${roleToDelete}`,
        authHeader
      );
      toast.success("Role deleted successfully!");
      fetchRoles();
    } catch (err) {
      console.error("Failed to delete role:", err);
      toast.error("Failed to delete role");
    } finally {
      setRoleToDelete(null);
      setIsDeleteModalOpen(false); // ✅ Close delete modal
    }
  };

  const handleEdit = (role) => {
    setNewRole(role.role_name);
    setEditingRole(role);
    setIsEditModalOpen(true); // ✅ Open edit modal
  };

  const handleDeleteWithConfirm = (role_id) => {
    setRoleToDelete(role_id);
    setIsDeleteModalOpen(true); // ✅ Open delete modal
  };

  return (
    <div className="space-y-8">
      {/* Role Form (for creating new roles) */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Create New Role</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Enter role name"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <Button
            size="medium"
            variant="primary"
            onClick={doSave}
            disabled={saving}
            className={`${saving ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {saving ? "Saving..." : "Create Role"}
          </Button>
        </div>
      </div>

      {/* Role List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">
          Existing Roles
        </h3>
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
                    onClick={() => handleDeleteWithConfirm(role.role_id)}
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

      {/* ✅ Modal for Editing Role */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingRole(null);
          setNewRole("");
        }}
        title="Edit Role"
      >
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Enter role name"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <div className="flex gap-3 justify-end">
            <Button
              size="medium"
              variant="primary"
              onClick={doSave}
              disabled={saving}
              className={`${saving ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {saving ? "Saving..." : "Update Role"}
            </Button>
            <Button
              size="medium"
              variant="secondary"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingRole(null);
                setNewRole("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* ✅ Modal for Deleting Role */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Role Deletion"
      >
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this role?
        </p>
        <div className="flex gap-3 justify-end">
          <Button
            size="medium"
            variant="danger"
            onClick={doDelete}
          >
            Delete
          </Button>
          <Button
            size="medium"
            variant="secondary"
            onClick={() => setIsDeleteModalOpen(false)}
          >
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default RoleForm;
