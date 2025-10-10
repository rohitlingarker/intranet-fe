import { useState, useEffect } from "react";
import {
  getPermissionGroupsByRole,
  getAvailablePermissionGroupsForRole,
  addPermissionGroupsToRole,
  removePermissionGroupFromRole,
} from "../../../../services/roleManagementService";
import Button from "../../../../components/Button/Button";
import SearchInput from "../../../../components/filter/Searchbar";
import { showStatusToast } from "../../../../components/toastfy/toast";

const PermissionGroupManagement = ({ roles }) => {
  const [dropdownRole, setDropdownRole] = useState("");
  const [selectedGroupRole, setSelectedGroupRole] = useState(null);
  const [showGroupSection, setShowGroupSection] = useState(false);
  const [groupAction, setGroupAction] = useState("");
  const [availablePermissionGroups, setAvailablePermissionGroups] = useState([]);
  const [permissionGroupsForRole, setPermissionGroupsForRole] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedGroupNames, setSelectedGroupNames] = useState([]);
  const [selectedGroupUUIDs, setSelectedGroupUUIDs] = useState([]);

  useEffect(() => {
    if (!dropdownRole) {
      setSelectedGroupRole(null);
      setShowGroupSection(false);
      return;
    }
    const found = roles.find((r) => r.role_name === dropdownRole);
    if (found) setSelectedGroupRole(found);
  }, [dropdownRole, roles]);

  const handleViewGroupForRole = async () => {
    if (!selectedGroupRole) return;
    setGroupAction("view");
    setShowGroupSection(true);
    try {
      const res = await getPermissionGroupsByRole(selectedGroupRole.role_uuid);
      setPermissionGroupsForRole(res.data);
    } catch {
      setPermissionGroupsForRole([]);
      showStatusToast("Failed to fetch permission groups", "error");
    }
  };

  const handleAddGroupForRole = async () => {
    if (!selectedGroupRole) return;
    setGroupAction("add");
    setSelectedGroupNames([]);
    setSelectedGroupUUIDs([]);
    setSearchTerm("");
    setShowGroupSection(true);
    try {
      const res = await getAvailablePermissionGroupsForRole(selectedGroupRole.role_uuid);
      setAvailablePermissionGroups(res.data);
    } catch {
      setAvailablePermissionGroups([]);
      showStatusToast("Failed to fetch available permission groups", "error");
    }
  };

  const handleDeleteGroupForRole = async () => {
    if (!selectedGroupRole) return;
    setGroupAction("delete");
    setSelectedGroupNames([]);
    setSelectedGroupUUIDs([]);
    setSearchTerm("");
    setShowGroupSection(true);
    try {
      const res = await getPermissionGroupsByRole(selectedGroupRole.role_uuid);
      setPermissionGroupsForRole(res.data);
    } catch {
      setPermissionGroupsForRole([]);
      showStatusToast("Failed to fetch permission groups", "error");
    }
  };

  const submitAddGroupsForRole = async () => {
    if (!selectedGroupUUIDs.length) return showStatusToast("Select group(s) to add", "error");
    try {
      await addPermissionGroupsToRole(selectedGroupRole.role_uuid, selectedGroupUUIDs);
      showStatusToast("Groups added successfully", "success");
      setSelectedGroupNames([]);
      setSelectedGroupUUIDs([]);
      setShowGroupSection(false);
    } catch {
      showStatusToast("Failed to add groups", "error");
    }
  };

  const submitDeleteGroupsForRole = async () => {
    if (!selectedGroupUUIDs.length) return showStatusToast("Select a group to delete", "error");
    try {
      for (const uuid of selectedGroupUUIDs) {
        await removePermissionGroupFromRole(selectedGroupRole.role_uuid, uuid);
      }
      showStatusToast("Group removed successfully", "success");
      setSelectedGroupNames([]);
      setSelectedGroupUUIDs([]);
      setShowGroupSection(false);
    } catch {
      showStatusToast("Failed to remove group", "error");
    }
  };

  // ✅ UPDATED LOGIC HERE
  const handleSelectGroup = (group) => {
    const uuidStr = group.group_uuid.toString();

    if (groupAction === "delete") {
      // Allow only one selection at a time for delete
      setSelectedGroupUUIDs([uuidStr]);
      setSelectedGroupNames([group.group_name]);
    } else {
      // Multiple selections allowed for add
      if (!selectedGroupUUIDs.includes(uuidStr)) {
        setSelectedGroupUUIDs((prev) => [...prev, uuidStr]);
        setSelectedGroupNames((prev) => [...prev, group.group_name]);
      }
    }
  };

  const handleRemoveGroup = (name) => {
    const index = selectedGroupNames.indexOf(name);
    if (index !== -1) {
      setSelectedGroupNames((prev) => prev.filter((n) => n !== name));
      setSelectedGroupUUIDs((prev) => prev.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Permission Group by Role</h3>

        <div className="flex items-center gap-4 mb-4">
          <select
            value={dropdownRole}
            onChange={(e) => setDropdownRole(e.target.value)}
            className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select the role</option>
            {roles.map((role) => (
              <option key={role.role_uuid} value={role.role_name}>
                {role.role_name}
              </option>
            ))}
          </select>
        </div>

        {selectedGroupRole && (
          <div className="flex flex-col gap-1 mb-2">
            <div className="flex justify-around items-center mb-4">
              <Button
                onClick={handleAddGroupForRole}
                className="px-3 py-2 bg-blue-900 text-white rounded hover:bg-blue-950 transition-colors font-medium"
              >
                Add
              </Button>
              <Button
                onClick={handleDeleteGroupForRole}
                className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-medium"
              >
                Delete
              </Button>
              <Button
                onClick={handleViewGroupForRole}
                className="px-3 py-2 bg-pink-900 text-white rounded hover:bg-pink-950 transition-colors font-medium"
              >
                View
              </Button>
            </div>

            {/* ADD / DELETE SECTION */}
            {showGroupSection && (groupAction === "add" || groupAction === "delete") && (
              <div className="bg-white rounded-lg shadow-md p-4 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-lg font-semibold text-gray-700">
                    {groupAction === "add" ? "Add" : "Delete"} Permission Groups for {selectedGroupRole.role_name}
                  </h4>
                  <button
                    onClick={() => {
                      setShowGroupSection(false);
                      setSelectedGroupNames([]);
                      setSelectedGroupUUIDs([]);
                    }}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    ✕ Close
                  </button>
                </div>

                <div className="mb-4">
                  <SearchInput
                    placeholder="Search by group name"
                    onSearch={(value) => setSearchTerm(value.trim().toLowerCase())}
                  />
                </div>

                <div className="mb-4">
                  <h5 className="text-md font-medium text-gray-700 mb-2">
                    {groupAction === "add" ? "Available Permission Groups" : "Current Permission Groups"}
                  </h5>
                  {groupAction === "add" && availablePermissionGroups.length === 0 && (
                    <p className="text-gray-500 text-sm">No available permission groups to add.</p>
                  )}
                  {groupAction === "delete" && permissionGroupsForRole.length === 0 && (
                    <p className="text-gray-500 text-sm">No permission groups assigned to this role.</p>
                  )}

                  <div className="max-h-40 overflow-y-auto border border-gray-200 rounded p-2">
                    {(groupAction === "add" ? availablePermissionGroups : permissionGroupsForRole)
                      .filter((group) => {
                        if (!searchTerm) return true;
                        return group.group_name.toLowerCase().includes(searchTerm);
                      })
                      .map((group, idx) => (
                        <div
                          key={group.group_uuid || idx}
                          className="flex justify-between items-center p-2 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                        >
                          <span className="font-medium text-gray-800">{group.group_name}</span>
                          <Button
                            onClick={() => handleSelectGroup(group)}
                            className="px-3 py-0.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                          >
                            {selectedGroupUUIDs.includes(group.group_uuid.toString()) ? "Selected" : "Select"}
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Selected Groups Chips */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selected group names:
                  </label>
                  {selectedGroupNames.length === 0 ? (
                    <p className="text-gray-500 text-sm">No group names selected yet.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2 border border-gray-300 rounded p-2 min-h-[44px]">
                      {selectedGroupNames.map((name, index) => (
                        <div
                          key={index}
                          className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium shadow-sm"
                        >
                          <span>{name}</span>
                          <button
                            onClick={() => handleRemoveGroup(name)}
                            className="ml-2 text-blue-600 hover:text-red-600 font-bold focus:outline-none"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  onClick={groupAction === "add" ? submitAddGroupsForRole : submitDeleteGroupsForRole}
                  disabled={!selectedGroupUUIDs.length}
                  className={`px-6 py-2 text-white rounded transition-colors font-medium ${
                    selectedGroupUUIDs.length
                      ? groupAction === "add"
                        ? "bg-blue-900 hover:bg-blue-950"
                        : "bg-red-600 hover:bg-red-700"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  {groupAction === "add" ? "Add Groups" : "Remove Group"}
                </Button>
              </div>
            )}

            {/* VIEW SECTION */}
            {showGroupSection && groupAction === "view" && (
              <div className="bg-white rounded-lg shadow-md p-4 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-lg font-semibold text-gray-700">
                    Permission Groups for {selectedGroupRole.role_name}
                  </h4>
                  <button
                    onClick={() => setShowGroupSection(false)}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    ✕ Close
                  </button>
                </div>
                {permissionGroupsForRole.length === 0 ? (
                  <p className="text-gray-500">No permission groups assigned to this role.</p>
                ) : (
                  <ul className="space-y-1">
                    {permissionGroupsForRole.map((group, idx) => (
                      <li
                        key={idx}
                        className="p-2 border rounded bg-gray-50 font-medium text-gray-800"
                      >
                        {group.group_name || group.name}
                      </li>
                    ))}
                  </ul>
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
