import Navbar from "../../../../components/Navbar/Navbar";
import SearchInput from "../../../../components/filter/Searchbar";
import Button from "../../../../components/Button/Button";
import Pagination from "../../../../components/Pagination/pagination";
import FormInput from "../../../../components/forms/FormInput"
import { Pencil, Trash } from "lucide-react";
 
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
 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
 
  const totalPages = Math.ceil(permissions.length / itemsPerPage);
 
  const paginatedPermissions = permissions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
 
 
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };
 
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };
 
 
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
 
 
      {/* Form */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <FormInput
          label="Permission Code"
          name="permission_code"
          value={newPermission}
          onChange={(e) => setNewPermission(e.target.value)}
          placeholder="e.g., READ_USER"
          className="mb-3" // This will be ignored unless you explicitly forward `className` inside FormInput
        />
 
 
        <FormInput
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setNewDescription(e.target.value)}
          className="w-full p-2 border rounded mb-3"
        />
 
        <br />
 
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
          onClick={handleCreateOrUpdate}
          variant="primary"
          size="medium"
        >
          {editingPermission ? "Update" : "Create"}
        </Button>
 
        {editingPermission && (
          <Button
            onClick={resetForm}
            variant="secondary"
            size="medium"
            className="ml-3"
          >
            Cancel
          </Button>
        )}
 
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
                  onClick={() => handleDelete(perm.permission_id)}
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
          onPrevious={handlePreviousPage}
          onNext={handleNextPage}
        />
      </div>
    </div>
  );
}
 