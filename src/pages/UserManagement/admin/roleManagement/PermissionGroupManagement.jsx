import { useState } from "react";
import { 
  getPermissionGroupsByRole,
  getAvailablePermissionGroupsForRole,
  addPermissionGroupsToRole,
  updatePermissionGroupsForRole,
  removePermissionGroupFromRole
} from "../../../../services/roleManagementService";

const PermissionGroupManagement = ({ roles }) => {
  const [selectedGroupRole, setSelectedGroupRole] = useState(null);
  const [permissionGroupsForRole, setPermissionGroupsForRole] = useState([]);
  const [showGroupSection, setShowGroupSection] = useState(false);
  const [availablePermissionGroups, setAvailablePermissionGroups] = useState([]);
  const [groupAction, setGroupAction] = useState("");
  const [groupIdsInput, setGroupIdsInput] = useState("");
  const [groupToDelete, setGroupToDelete] = useState("");
  const [dropdownRole, setDropdownRole] = useState("");

  const allowedRoles = [
    { label: "Super Admin", value: "Super Admin" },
    { label: "Admin", value: "Admin" },
    { label: "HR", value: "HR" },
    { label: "General", value: "General" },
  ];

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
    <div className="space-y-8">
      {/* Permission Group by Role Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
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
    </div>
  );
};

export default PermissionGroupManagement;