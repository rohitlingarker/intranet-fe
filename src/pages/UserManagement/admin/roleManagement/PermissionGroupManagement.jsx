import { useState } from "react";
import {
  getPermissionGroupsByRole,
  getAvailablePermissionGroupsForRole,
  addPermissionGroupsToRole,
  updatePermissionGroupsForRole,
  removePermissionGroupFromRole
} from "../../../../services/roleManagementService";

// ✅ Reusable UI Components
const Button = ({ children, onClick, disabled = false, variant = "primary" }) => {
  const baseClasses =
    "px-6 py-2 rounded font-medium transition-colors focus:outline-none focus:ring-2";
  const variants = {
    primary: "bg-blue-900 text-white hover:bg-blue-950 focus:ring-blue-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    disabled: "bg-gray-400 text-white cursor-not-allowed"
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${disabled ? variants.disabled : variants[variant]}`}
    >
      {children}
    </button>
  );
};

const SearchBar = ({ placeholder, value, onChange }) => (
  <input
    type="text"
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
  />
);

const PermissionGroupManagement = ({ roles }) => {
  const [selectedGroupRole, setSelectedGroupRole] = useState(null);
  const [permissionGroupsForRole, setPermissionGroupsForRole] = useState([]);
  const [showGroupSection, setShowGroupSection] = useState(false);
  const [availablePermissionGroups, setAvailablePermissionGroups] = useState([]);
  const [groupAction, setGroupAction] = useState("");
  const [groupIdsInput, setGroupIdsInput] = useState("");
  const [groupToDelete, setGroupToDelete] = useState("");
  const [dropdownRole, setDropdownRole] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // ✅ For filtering lists

  const allowedRoles = [
    { label: "Super Admin", value: "Super Admin" },
    { label: "Admin", value: "Admin" },
    { label: "HR", value: "HR" },
    { label: "General", value: "General" }
  ];

  // ✅ Filtered lists based on search
  const filteredAvailableGroups = availablePermissionGroups.filter((group) =>
    group.group_name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredCurrentGroups = permissionGroupsForRole.filter((group) =>
    group.group_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ Handlers
  const handleViewGroupForRole = async () => {
    if (!selectedGroupRole) return;
    setGroupAction("view");
    setShowGroupSection(true);
    try {
      const res = await getPermissionGroupsByRole(selectedGroupRole.role_id);
      setPermissionGroupsForRole(res.data);
    } catch {
      setPermissionGroupsForRole([]);
      alert("Failed to fetch permission groups for this role");
    }
  };

  const handleEditGroupForRole = async () => {
    setGroupAction("edit");
    setGroupIdsInput("");
    setShowGroupSection(true);
    try {
      const res = await getPermissionGroupsByRole(selectedGroupRole.role_id);
      setPermissionGroupsForRole(res.data);
    } catch {
      setPermissionGroupsForRole([]);
      alert("Failed to fetch permission groups for this role");
    }
  };

  const handleDeleteGroupForRole = async () => {
    setGroupAction("delete");
    setGroupToDelete("");
    setShowGroupSection(true);
    try {
      const res = await getPermissionGroupsByRole(selectedGroupRole.role_id);
      setPermissionGroupsForRole(res.data);
    } catch {
      setPermissionGroupsForRole([]);
      alert("Failed to fetch permission groups for this role");
    }
  };

  const handleAddGroupForRole = async () => {
    setGroupAction("add");
    setGroupIdsInput("");
    setShowGroupSection(true);
    try {
      const res = await getAvailablePermissionGroupsForRole(selectedGroupRole.role_id);
      setAvailablePermissionGroups(res.data);
    } catch {
      setAvailablePermissionGroups([]);
      alert("Failed to fetch available permission groups");
    }
  };

  const submitAddGroupsForRole = async () => {
    if (!groupIdsInput.trim()) return alert("Enter group IDs (comma separated)");
    try {
      const groupIds = groupIdsInput.split(",").map((id) => parseInt(id.trim(), 10));
      await addPermissionGroupsToRole(selectedGroupRole.role_id, groupIds);
      alert("Groups added successfully");
      setGroupIdsInput("");
      setShowGroupSection(false);
    } catch {
      alert("Failed to add groups");
    }
  };

  const submitEditGroupsForRole = async () => {
    if (!groupIdsInput.trim()) return alert("Enter group IDs (comma separated)");
    try {
      const groupIds = groupIdsInput.split(",").map((id) => parseInt(id.trim(), 10));
      await updatePermissionGroupsForRole(selectedGroupRole.role_id, groupIds);
      alert("Groups updated successfully");
      setShowGroupSection(false);
    } catch {
      alert("Failed to update groups");
    }
  };

  const submitDeleteGroupForRole = async () => {
    if (!groupToDelete.trim()) return alert("Enter group ID to delete");
    try {
      await removePermissionGroupFromRole(selectedGroupRole.role_id, groupToDelete);
      alert("Group removed successfully");
      setGroupToDelete("");
      setShowGroupSection(false);
    } catch {
      alert("Failed to remove group");
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Permission Group by Role</h3>

        {/* Step 1: Role Dropdown */}
        <div className="flex items-center gap-4 mb-4">
          <select
            value={dropdownRole}
            onChange={(e) => {
              setDropdownRole(e.target.value);
              setSelectedGroupRole(null);
              setShowGroupSection(false);
            }}
            className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select the role</option>
            {allowedRoles.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
          <Button
            onClick={() => {
              const found = roles.find((r) => r.role_name === dropdownRole);
              if (found) setSelectedGroupRole(found);
              else alert("Please select a valid role.");
            }}
          >
            Select Role
          </Button>
        </div>

        {/* Step 2: Action Buttons */}
        {selectedGroupRole && (
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex justify-between gap-4">
              <Button onClick={handleAddGroupForRole}>Add</Button>
              <Button onClick={handleEditGroupForRole}>Edit</Button>
              <Button onClick={handleDeleteGroupForRole}>Delete</Button>
              <Button onClick={handleViewGroupForRole}>View</Button>
            </div>

            {/* Step 3: Group Management */}
            {showGroupSection && (
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-gray-700 capitalize">
                    {groupAction} Permission Groups for {selectedGroupRole.role_name}
                  </h4>
                  <button
                    onClick={() => {
                      setShowGroupSection(false);
                      setSearchTerm("");
                    }}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    ✕ Close
                  </button>
                </div>

                {/* ✅ Search Bar */}
                {(groupAction === "add" || groupAction === "edit" || groupAction === "delete") && (
                  <div className="mb-4">
                    <SearchBar
                      placeholder="Search groups..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                )}

                {/* Render respective section */}
                {groupAction === "add" && (
                  <>
                    {/* Available Groups List */}
                    <div className="mb-4 max-h-40 overflow-y-auto border border-gray-200 rounded p-2">
                      {filteredAvailableGroups.length === 0 ? (
                        <p className="text-gray-500 text-sm">No available permission groups.</p>
                      ) : (
                        filteredAvailableGroups.map((group) => (
                          <div
                            key={group.group_id}
                            className="flex justify-between items-center p-2 border-b last:border-b-0 hover:bg-gray-50"
                          >
                            <span>{group.group_name} (ID: {group.group_id})</span>
                            <Button
                              onClick={() => {
                                const currentIds = groupIdsInput ? groupIdsInput.split(",").map(id => id.trim()) : [];
                                const newIds = [...currentIds, group.group_id.toString()];
                                setGroupIdsInput(newIds.join(", "));
                              }}
                            >
                              Add
                            </Button>
                          </div>
                        ))
                      )}
                    </div>

                    <SearchBar
                      placeholder="Enter comma-separated IDs"
                      value={groupIdsInput}
                      onChange={(e) => setGroupIdsInput(e.target.value)}
                    />

                    <div className="mt-4">
                      <Button
                        onClick={submitAddGroupsForRole}
                        disabled={!groupIdsInput.trim()}
                      >
                        Add Groups
                      </Button>
                    </div>
                  </>
                )}

                {groupAction === "view" && (
                  <ul className="space-y-1">
                    {permissionGroupsForRole.length === 0 ? (
                      <p className="text-gray-500">No permission groups assigned to this role.</p>
                    ) : (
                      permissionGroupsForRole.map((group, idx) => (
                        <li
                          key={idx}
                          className="p-2 border rounded bg-gray-50 font-medium text-gray-800"
                        >
                          {group.group_name}
                        </li>
                      ))
                    )}
                  </ul>
                )}

                {groupAction === "edit" && (
                  <>
                    <div className="mb-4 max-h-40 overflow-y-auto border border-gray-200 rounded p-2">
                      {filteredCurrentGroups.length === 0 ? (
                        <p className="text-gray-500 text-sm">No permission groups assigned.</p>
                      ) : (
                        filteredCurrentGroups.map((group) => (
                          <div
                            key={group.group_id}
                            className="flex justify-between items-center p-2 border-b last:border-b-0 hover:bg-gray-50"
                          >
                            <span>{group.group_name} (ID: {group.group_id})</span>
                            <Button
                              onClick={() => {
                                const currentIds = groupIdsInput ? groupIdsInput.split(",").map(id => id.trim()) : [];
                                const newIds = [...currentIds, group.group_id.toString()];
                                setGroupIdsInput(newIds.join(", "));
                              }}
                            >
                              Add
                            </Button>
                          </div>
                        ))
                      )}
                    </div>

                    <SearchBar
                      placeholder="Enter comma-separated IDs"
                      value={groupIdsInput}
                      onChange={(e) => setGroupIdsInput(e.target.value)}
                    />

                    <div className="mt-4">
                      <Button
                        onClick={submitEditGroupsForRole}
                        disabled={!groupIdsInput.trim()}
                      >
                        Update Groups
                      </Button>
                    </div>
                  </>
                )}

                {groupAction === "delete" && (
                  <>
                    <div className="mb-4 max-h-40 overflow-y-auto border border-gray-200 rounded p-2">
                      {filteredCurrentGroups.length === 0 ? (
                        <p className="text-gray-500 text-sm">No permission groups assigned.</p>
                      ) : (
                        filteredCurrentGroups.map((group) => (
                          <div
                            key={group.group_id}
                            className="flex justify-between items-center p-2 border-b last:border-b-0 hover:bg-gray-50"
                          >
                            <span>{group.group_name} (ID: {group.group_id})</span>
                            <Button
                              variant="danger"
                              onClick={() => setGroupToDelete(group.group_id.toString())}
                            >
                              Select
                            </Button>
                          </div>
                        ))
                      )}
                    </div>

                    <SearchBar
                      placeholder="Enter group ID to delete"
                      value={groupToDelete}
                      onChange={(e) => setGroupToDelete(e.target.value)}
                    />

                    <div className="mt-4">
                      <Button
                        variant="danger"
                        onClick={submitDeleteGroupForRole}
                        disabled={!groupToDelete.trim()}
                      >
                        Remove Group
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PermissionGroupManagement;
