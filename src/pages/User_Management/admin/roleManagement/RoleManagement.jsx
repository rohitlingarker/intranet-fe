import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Pencil, Trash2 } from "lucide-react";
import { 
  getAccessPointsByRole, 
  getAvailableAccessPointsForRole, 
  mapAccessPointToRole, 
  removeAccessPointFromRole,
  getAllAccessPoints,
  getPermissionsByRole,
  getPermissionGroupsByRole,
  getAvailablePermissionGroupsForRole,
  addPermissionGroupsToRole,
  updatePermissionGroupsForRole,
  removePermissionGroupFromRole
} from "../../../services/roleManagementService";

export default function RoleManagement() {
  const [roles, setRoles] = useState([]);
  const [newRole, setNewRole] = useState("");
  const [editingRole, setEditingRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [accessPoints, setAccessPoints] = useState([]);
  const [availableAccessPoints, setAvailableAccessPoints] = useState([]);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [showPermissions, setShowPermissions] = useState(false);
  const [permissionGroups, setPermissionGroups] = useState([]);
  const [showGroups, setShowGroups] = useState(false);
  const [groupAction, setGroupAction] = useState("");
  const [groupInput, setGroupInput] = useState("");
  const [groupIdsInput, setGroupIdsInput] = useState("");
  const [groupToDelete, setGroupToDelete] = useState("");
  const [showRoleList, setShowRoleList] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRoles, setFilteredRoles] = useState([]);
  const searchTimeout = useRef(null);
  const [selectedGroupRole, setSelectedGroupRole] = useState(null);
  const [permissionGroupsForRole, setPermissionGroupsForRole] = useState([]);
  const [showGroupSection, setShowGroupSection] = useState(false);
  const [availablePermissionGroups, setAvailablePermissionGroups] = useState([]);
  const allowedRoles = [
    { label: "Super Admin", value: "Super Admin" },
    { label: "Admin", value: "Admin" },
    { label: "HR", value: "HR" },
    { label: "General", value: "General" },
  ];
  const [dropdownRole, setDropdownRole] = useState("");

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
    } catch (err) {
      console.error("Failed to fetch roles:", err);
      if (err.response?.status === 401) {
        alert("Session expired. Please log in again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAccessPoints = async () => {
    try {
      const res = await getAllAccessPoints();
      setAccessPoints(res.data);
    } catch (err) {
      console.error("Failed to fetch access points:", err);
    }
  };

  const fetchAvailableAccessPoints = async (roleId) => {
    try {
      const res = await getAvailableAccessPointsForRole(roleId);
      setAvailableAccessPoints(res.data);
    } catch (err) {
      console.error("Failed to fetch available access points:", err);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchAccessPoints();
  }, []);

  // Debounced search for roles (Super Admin, Admin, HR, General)
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      const allowedRoles = ["Super Admin", "Admin", "HR", "General"];
      const filtered = roles.filter(role =>
        allowedRoles.includes(role.role_name) &&
        role.role_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRoles(filtered);
    }, 300); // 300ms debounce
    return () => clearTimeout(searchTimeout.current);
  }, [searchTerm, roles]);

  const handleCreateOrUpdate = async () => {
    if (!newRole.trim()) return alert("Role name cannot be empty.");
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
      alert("Failed to save role");
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

  // Access Point Button Handlers
  const handleViewPermission = async (role) => {
    setSelectedRole(role);
    try {
      const res = await getPermissionsByRole(role.role_id);
      setRolePermissions(res.data);
      setShowPermissions(true);
    } catch (err) {
      console.error("Failed to fetch permissions for role:", err);
      alert("Failed to fetch permissions for this role");
    }
  };

  const handleAddAccessPoint = async (role) => {
    setSelectedRole(role);
    try {
      await fetchAvailableAccessPoints(role.role_id);
      alert(`Add access point functionality for role: ${role.role_name}`);
    } catch (err) {
      console.error("Failed to fetch available access points:", err);
      alert("Failed to fetch available access points");
    }
  };

  const handleEditAccessPoint = async (role) => {
    setSelectedRole(role);
    try {
      const res = await getAccessPointsByRole(role.role_id);
      console.log("Current access points for role:", res.data);
      alert(`Edit access points for role: ${role.role_name}`);
    } catch (err) {
      console.error("Failed to fetch access points for role:", err);
      alert("Failed to fetch access points for this role");
    }
  };

  const handleDeleteAccessPoint = async (role) => {
    setSelectedRole(role);
    try {
      const res = await getAccessPointsByRole(role.role_id);
      console.log("Current access points for role:", res.data);
      alert(`Delete access points for role: ${role.role_name}`);
    } catch (err) {
      console.error("Failed to fetch access points for role:", err);
      alert("Failed to fetch access points for this role");
    }
  };

  const handleViewAccessPoint = async (role) => {
    setSelectedRole(role);
    try {
      const res = await getAccessPointsByRole(role.role_id);
      console.log("Access points for role:", res.data);
      alert(`Viewing access points for role: ${role.role_name}`);
    } catch (err) {
      console.error("Failed to fetch access points for role:", err);
      alert("Failed to fetch access points for this role");
    }
  };

  // Permission Group Button Handlers
  const handleViewGroups = async (role) => {
    setSelectedRole(role);
    setGroupAction("view");
    try {
      const res = await getPermissionGroupsByRole(role.role_id);
      setPermissionGroups(res.data);
      setShowGroups(true);
    } catch (err) {
      console.error("Failed to fetch permission groups for role:", err);
      alert("Failed to fetch permission groups for this role");
    }
  };

  const handleAddGroups = async (role) => {
    setSelectedRole(role);
    setGroupAction("add");
    setGroupIdsInput("");
    setShowGroups(true);
  };

  const handleEditGroups = async (role) => {
    setSelectedRole(role);
    setGroupAction("edit");
    setGroupIdsInput("");
    setShowGroups(true);
  };

  const handleDeleteGroups = async (role) => {
    setSelectedRole(role);
    setGroupAction("delete");
    setGroupToDelete("");
    setShowGroups(true);
  };

  // Group Actions
  const submitAddGroups = async () => {
    if (!groupIdsInput.trim()) return alert("Enter group IDs (comma separated)");
    try {
      const groupIds = groupIdsInput.split(",").map((id) => parseInt(id.trim(), 10));
      await addPermissionGroupsToRole(selectedRole.role_id, groupIds);
      alert("Groups added successfully");
      setShowGroups(false);
    } catch (err) {
      alert("Failed to add groups");
    }
  };

  const submitEditGroups = async () => {
    if (!groupIdsInput.trim()) return alert("Enter group IDs (comma separated)");
    try {
      const groupIds = groupIdsInput.split(",").map((id) => parseInt(id.trim(), 10));
      await updatePermissionGroupsForRole(selectedRole.role_id, groupIds);
      alert("Groups updated successfully");
      setShowGroups(false);
    } catch (err) {
      alert("Failed to update groups");
    }
  };

  const submitDeleteGroup = async () => {
    if (!groupToDelete.trim()) return alert("Enter group ID to delete");
    try {
      await removePermissionGroupFromRole(selectedRole.role_id, groupToDelete);
      alert("Group removed successfully");
      setShowGroups(false);
    } catch (err) {
      alert("Failed to remove group");
    }
  };

  // Permission by Role Button Handler (Step 1)
  const handleShowRoleList = () => {
    setShowRoleList(true);
  };

  // Handler for View button
  const handleViewGroupForRole = async () => {
    if (!selectedGroupRole) return;
    setGroupAction("view");
    setShowGroupSection(true);
    try {
      const res = await getPermissionGroupsByRole(selectedGroupRole.role_id);
      setPermissionGroupsForRole(res.data);
    } catch (err) {
      setPermissionGroupsForRole([]);
      alert("Failed to fetch permission groups for this role");
    }
  };

  // Handler for Edit button
  const handleEditGroupForRole = async () => {
    setGroupAction("edit");
    setGroupIdsInput("");
    setShowGroupSection(true);
    try {
      const res = await getPermissionGroupsByRole(selectedGroupRole.role_id);
      setPermissionGroupsForRole(res.data);
    } catch (err) {
      console.error("Failed to fetch permission groups for role:", err);
      setPermissionGroupsForRole([]);
      alert("Failed to fetch permission groups for this role");
    }
  };

  // Handler for Delete button
  const handleDeleteGroupForRole = async () => {
    setGroupAction("delete");
    setGroupToDelete("");
    setShowGroupSection(true);
    try {
      const res = await getPermissionGroupsByRole(selectedGroupRole.role_id);
      setPermissionGroupsForRole(res.data);
    } catch (err) {
      console.error("Failed to fetch permission groups for role:", err);
      setPermissionGroupsForRole([]);
      alert("Failed to fetch permission groups for this role");
    }
  };

  // Handler for Add button
  const handleAddGroupForRole = async () => {
    setGroupAction("add");
    setGroupIdsInput("");
    setShowGroupSection(true);
    try {
      const res = await getAvailablePermissionGroupsForRole(selectedGroupRole.role_id);
      setAvailablePermissionGroups(res.data);
    } catch (err) {
      console.error("Failed to fetch available permission groups:", err);
      setAvailablePermissionGroups([]);
      alert("Failed to fetch available permission groups");
    }
  };

  // Submit Add
  const submitAddGroupsForRole = async () => {
    if (!groupIdsInput.trim()) return alert("Enter group IDs (comma separated)");
    try {
      const groupIds = groupIdsInput.split(",").map((id) => parseInt(id.trim(), 10));
      await addPermissionGroupsToRole(selectedGroupRole.role_id, groupIds);
      alert("Groups added successfully");
      setGroupIdsInput("");
      setShowGroupSection(false);
      // Refresh available groups after adding
      try {
        const res = await getAvailablePermissionGroupsForRole(selectedGroupRole.role_id);
        setAvailablePermissionGroups(res.data);
      } catch (err) {
        console.error("Failed to refresh available groups:", err);
      }
    } catch (err) {
      alert("Failed to add groups");
    }
  };

  // Submit Edit
  const submitEditGroupsForRole = async () => {
    if (!groupIdsInput.trim()) return alert("Enter group IDs (comma separated)");
    try {
      const groupIds = groupIdsInput.split(",").map((id) => parseInt(id.trim(), 10));
      await updatePermissionGroupsForRole(selectedGroupRole.role_id, groupIds);
      alert("Groups updated successfully");
      setShowGroupSection(false);
    } catch (err) {
      alert("Failed to update groups");
    }
  };

  // Submit Delete
  const submitDeleteGroupForRole = async () => {
    if (!groupToDelete.trim()) return alert("Enter group ID to delete");
    try {
      await removePermissionGroupFromRole(selectedGroupRole.role_id, groupToDelete);
      alert("Group removed successfully");
      setGroupToDelete("");
      setShowGroupSection(false);
      // Refresh permission groups after deletion
      try {
        const res = await getPermissionGroupsByRole(selectedGroupRole.role_id);
        setPermissionGroupsForRole(res.data);
      } catch (err) {
        console.error("Failed to refresh permission groups:", err);
      }
    } catch (err) {
      alert("Failed to remove group");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold text-blue-800 mb-6">Role Management</h2>

      {/* Role Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
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
          <button
            onClick={handleCreateOrUpdate}
            disabled={saving}
            className={`px-6 py-2 rounded text-white font-medium ${
              saving ? "bg-blue-300 cursor-not-allowed" : "bg-blue-900 hover:bg-blue-950"
            }`}
          >
            {saving ? "Saving..." : editingRole ? "Update Role" : "Create Role"}
          </button>
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

      {/* Permission Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-8">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-700">Permission by Role</h3>
          <button 
            onClick={handleShowRoleList}
            className="px-6 py-2 bg-blue-900 text-white rounded hover:bg-blue-950 transition-colors font-medium"
          >
            View
          </button>
        </div>

        {/* Role List Modal/Section for Permission by Role */}
        {showRoleList && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-700">Select a Role</h3>
              <button 
                onClick={() => setShowRoleList(false)}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                ✕ Close
              </button>
            </div>
            {roles.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No roles found.</p>
            ) : (
              <ul className="space-y-2">
                {roles.map((role) => (
                  <li
                    key={role.role_id}
                    className="flex justify-between items-center p-3 border rounded-md bg-gray-50 cursor-pointer hover:bg-blue-100"
                    onClick={async () => {
                      setShowRoleList(false);
                      setSelectedRole(role);
                      try {
                        const res = await getPermissionsByRole(role.role_id);
                        setRolePermissions(res.data);
                        setShowPermissions(true);
                      } catch (err) {
                        setShowPermissions(false);
                        alert("Failed to fetch permissions for this role");
                      }
                    }}
                  >
                    <span className="font-medium text-gray-800">{role.role_name}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Permissions Display Section (for Permission by Role) */}
        {showPermissions && selectedRole && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-700">
                Permissions for Role: {selectedRole.role_name}
              </h3>
              <button 
                onClick={() => setShowPermissions(false)}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                ✕ Close
              </button>
            </div>
            {rolePermissions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No permissions assigned to this role.</p>
            ) : (
              <div className="space-y-2">
                {rolePermissions.map((permission, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-md bg-gray-50">
                    <div>
                      <span className="font-medium text-gray-800">{permission.code}</span>
                      {permission.description && (
                        <p className="text-sm text-gray-600 mt-1">{permission.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Permission Group by Role Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Permission Group by Role</h3>
        {/* Step 1: Dropdown and Select Role Button (Horizontal) */}
        <div className="flex items-center gap-4 mb-4">
          <select
            value={dropdownRole}
            onChange={e => {
              setDropdownRole(e.target.value);
              setSelectedGroupRole(null);
              setShowGroupSection(false);
            }}
            className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select the role</option>
            {allowedRoles.map(role => (
              <option key={role.value} value={role.value}>{role.label}</option>
            ))}
          </select>
          <button
            className="px-6 py-2 bg-blue-900 text-white rounded hover:bg-blue-950 transition-colors font-medium"
            onClick={() => {
              const found = roles.find(r => r.role_name === dropdownRole);
              if (found) {
                setSelectedGroupRole(found);
              } else {
                alert('Please select a valid role.');
              }
            }}
          >
            Select Role
          </button>
        </div>
        {/* Step 2: Action Buttons for Chosen Role */}
        {selectedGroupRole && (
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex justify-between">
              <button onClick={handleAddGroupForRole} className="px-6 py-2 bg-blue-900 text-white rounded hover:bg-blue-950 transition-colors font-medium">Add</button>
              <button onClick={handleEditGroupForRole} className="px-6 py-2 bg-blue-900 text-white rounded hover:bg-blue-950 transition-colors font-medium">Edit</button>
              <button onClick={handleDeleteGroupForRole} className="px-6 py-2 bg-blue-900 text-white rounded hover:bg-blue-950 transition-colors font-medium">Delete</button>
              <button onClick={handleViewGroupForRole} className="px-6 py-2 bg-blue-900 text-white rounded hover:bg-blue-950 transition-colors font-medium">View</button>
            </div>
            {/* Step 3: Group Management Section */}
            {showGroupSection && groupAction === "add" && (
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-lg font-semibold text-gray-700">Add Permission Groups for {selectedGroupRole.role_name}</h4>
                  <button onClick={() => {
                    setShowGroupSection(false);
                    setAvailablePermissionGroups([]);
                    setGroupIdsInput("");
                  }} className="text-gray-500 hover:text-gray-700 text-sm">✕ Close</button>
                </div>
                
                {/* Available Permission Groups List */}
                <div className="mb-4">
                  <h5 className="text-md font-medium text-gray-700 mb-2">Available Permission Groups:</h5>
                  {availablePermissionGroups.length === 0 ? (
                    <p className="text-gray-500 text-sm">No available permission groups to add.</p>
                  ) : (
                    <div className="max-h-40 overflow-y-auto border border-gray-200 rounded p-2">
                      {availablePermissionGroups.map((group, index) => (
                        <div key={group.group_id || index} className="flex justify-between items-center p-2 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                          <div>
                            <span className="font-medium text-gray-800">{group.group_name}</span>
                            <span className="text-sm text-gray-500 ml-2">(ID: {group.group_id})</span>
                          </div>
                          <button
                            onClick={() => {
                              const currentIds = groupIdsInput ? groupIdsInput.split(',').map(id => id.trim()) : [];
                              const newIds = [...currentIds, group.group_id.toString()];
                              setGroupIdsInput(newIds.join(', '));
                            }}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                          >
                            Add
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Manual Input Section */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Selected Group IDs:</label>
                  <input
                    type="text"
                    placeholder="Enter comma-separated group IDs (e.g., 1,2,3)"
                    value={groupIdsInput}
                    onChange={e => setGroupIdsInput(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                
                <button 
                  onClick={submitAddGroupsForRole} 
                  disabled={!groupIdsInput.trim()}
                  className={`px-6 py-2 text-white rounded transition-colors font-medium ${
                    groupIdsInput.trim() 
                      ? 'bg-blue-900 hover:bg-blue-950' 
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  Add Groups
                </button>
              </div>
            )}
            {showGroupSection && groupAction === "view" && (
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-lg font-semibold text-gray-700">Permission Groups for {selectedGroupRole.role_name}</h4>
                  <button onClick={() => setShowGroupSection(false)} className="text-gray-500 hover:text-gray-700 text-sm">✕ Close</button>
                </div>
                {permissionGroupsForRole.length === 0 ? (
                  <p className="text-gray-500">No permission groups assigned to this role.</p>
                ) : (
                  <ul className="space-y-1">
                    {permissionGroupsForRole.map((group, idx) => (
                      <li key={idx} className="p-2 border rounded bg-gray-50 font-medium text-gray-800">{group.group_name || group.name}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {showGroupSection && groupAction === "edit" && (
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-lg font-semibold text-gray-700">Edit Permission Groups for {selectedGroupRole.role_name}</h4>
                  <button onClick={() => {
                    setShowGroupSection(false);
                    setPermissionGroupsForRole([]);
                    setGroupIdsInput("");
                  }} className="text-gray-500 hover:text-gray-700 text-sm">✕ Close</button>
                </div>
                
                {/* Current Permission Groups List */}
                <div className="mb-4">
                  <h5 className="text-md font-medium text-gray-700 mb-2">Current Permission Groups:</h5>
                  {permissionGroupsForRole.length === 0 ? (
                    <p className="text-gray-500 text-sm">No permission groups assigned to this role.</p>
                  ) : (
                    <div className="max-h-40 overflow-y-auto border border-gray-200 rounded p-2">
                      {permissionGroupsForRole.map((group, index) => (
                        <div key={group.group_id || index} className="flex justify-between items-center p-2 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                          <div>
                            <span className="font-medium text-gray-800">{group.group_name}</span>
                            <span className="text-sm text-gray-500 ml-2">(ID: {group.group_id})</span>
                          </div>
                          <button
                            onClick={() => {
                              const currentIds = groupIdsInput ? groupIdsInput.split(',').map(id => id.trim()) : [];
                              const newIds = [...currentIds, group.group_id.toString()];
                              setGroupIdsInput(newIds.join(', '));
                            }}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                          >
                            Add
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Manual Input Section */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Group IDs to Update:</label>
                  <input
                    type="text"
                    placeholder="Enter comma-separated group IDs (e.g., 1,2,3)"
                    value={groupIdsInput}
                    onChange={e => setGroupIdsInput(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                
                <button 
                  onClick={submitEditGroupsForRole} 
                  disabled={!groupIdsInput.trim()}
                  className={`px-6 py-2 text-white rounded transition-colors font-medium ${
                    groupIdsInput.trim() 
                      ? 'bg-blue-900 hover:bg-blue-950' 
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  Update Groups
                </button>
              </div>
            )}
            {showGroupSection && groupAction === "delete" && (
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-lg font-semibold text-gray-700">Delete Permission Group for {selectedGroupRole.role_name}</h4>
                  <button onClick={() => {
                    setShowGroupSection(false);
                    setPermissionGroupsForRole([]);
                    setGroupToDelete("");
                  }} className="text-gray-500 hover:text-gray-700 text-sm">✕ Close</button>
                </div>
                
                {/* Current Permission Groups List */}
                <div className="mb-4">
                  <h5 className="text-md font-medium text-gray-700 mb-2">Current Permission Groups:</h5>
                  {permissionGroupsForRole.length === 0 ? (
                    <p className="text-gray-500 text-sm">No permission groups assigned to this role.</p>
                  ) : (
                    <div className="max-h-40 overflow-y-auto border border-gray-200 rounded p-2">
                      {permissionGroupsForRole.map((group, index) => (
                        <div key={group.group_id || index} className="flex justify-between items-center p-2 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                          <div>
                            <span className="font-medium text-gray-800">{group.group_name}</span>
                            <span className="text-sm text-gray-500 ml-2">(ID: {group.group_id})</span>
                          </div>
                          <button
                            onClick={() => setGroupToDelete(group.group_id.toString())}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                          >
                            Select
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Manual Input Section */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Group ID to Delete:</label>
                  <input
                    type="text"
                    placeholder="Enter group ID to delete"
                    value={groupToDelete}
                    onChange={e => setGroupToDelete(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
                
                <button 
                  onClick={submitDeleteGroupForRole} 
                  disabled={!groupToDelete.trim()}
                  className={`px-6 py-2 text-white rounded transition-colors font-medium ${
                    groupToDelete.trim() 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  Remove Group
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Permission Group Management Section */}
      {showGroups && selectedRole && (
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-700">
              Manage Permission Groups for Role: {selectedRole.role_name}
            </h3>
            <button 
              onClick={() => setShowGroups(false)}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              ✕ Close
            </button>
          </div>

          {groupAction === "view" && (
            <div className="space-y-2">
              <h4 className="text-lg font-medium text-gray-800">Current Groups:</h4>
              {permissionGroups.length === 0 ? (
                <p className="text-gray-500">No groups assigned to this role.</p>
              ) : (
                <ul className="space-y-1">
                  {permissionGroups.map((group, index) => (
                    <li key={index} className="flex justify-between items-center p-2 border rounded-md bg-gray-100">
                      <span className="font-medium text-gray-800">{group.name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {groupAction === "add" && (
            <div className="space-y-2">
              <h4 className="text-lg font-medium text-gray-800">Add Groups</h4>
              <p className="text-sm text-gray-600">Enter comma-separated group IDs to add:</p>
              <input
                type="text"
                placeholder="e.g., 1, 2, 3"
                value={groupIdsInput}
                onChange={(e) => setGroupIdsInput(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={submitAddGroups}
                className="px-6 py-2 bg-blue-900 text-white rounded hover:bg-blue-950 transition-colors font-medium"
              >
                Add Groups
              </button>
            </div>
          )}

          {groupAction === "edit" && (
            <div className="space-y-2">
              <h4 className="text-lg font-medium text-gray-800">Edit Groups</h4>
              <p className="text-sm text-gray-600">Enter comma-separated group IDs to update:</p>
              <input
                type="text"
                placeholder="e.g., 1, 2, 3"
                value={groupIdsInput}
                onChange={(e) => setGroupIdsInput(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={submitEditGroups}
                className="px-6 py-2 bg-blue-900 text-white rounded hover:bg-blue-950 transition-colors font-medium"
              >
                Update Groups
              </button>
            </div>
          )}

          {groupAction === "delete" && (
            <div className="space-y-2">
              <h4 className="text-lg font-medium text-gray-800">Delete Group</h4>
              <p className="text-sm text-gray-600">Enter the ID of the group to delete:</p>
              <input
                type="text"
                placeholder="e.g., 1"
                value={groupToDelete}
                onChange={(e) => setGroupToDelete(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
              />
              <button
                onClick={submitDeleteGroup}
                className="px-6 py-2 bg-blue-900 text-white rounded hover:bg-blue-950 transition-colors font-medium"
              >
                Remove Group
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
