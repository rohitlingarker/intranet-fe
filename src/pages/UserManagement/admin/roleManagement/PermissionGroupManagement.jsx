import { useState } from "react";
import {
  getPermissionGroupsByRole,
  getAvailablePermissionGroupsForRole,
  addPermissionGroupsToRole,
  updatePermissionGroupsForRole,
  removePermissionGroupFromRole,
} from "../../../../services/roleManagementService";
import Button from "../../../../components/Button/Button";
import SearchInput from "../../../../components/filter/Searchbar";
import FormInput from "../../../../components/forms/FormInput";
import { toast } from "react-toastify";

const PermissionGroupManagement = ({ roles }) => {
  const [selectedGroupRole, setSelectedGroupRole] = useState(null);
  const [permissionGroupsForRole, setPermissionGroupsForRole] = useState([]);
  const [showGroupSection, setShowGroupSection] = useState(false);
  const [availablePermissionGroups, setAvailablePermissionGroups] = useState(
    []
  );
  const [groupAction, setGroupAction] = useState("");
  const [groupIdsInput, setGroupIdsInput] = useState("");
  const [groupToDelete, setGroupToDelete] = useState("");
  const [dropdownRole, setDropdownRole] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

 

  const handleViewGroupForRole = async () => {
    if (!selectedGroupRole) return;
    setGroupAction("view");
    setShowGroupSection(true);
    try {
      const res = await getPermissionGroupsByRole(selectedGroupRole.role_id);
      setPermissionGroupsForRole(res.data);
    } catch {
      setPermissionGroupsForRole([]);
      toast.error("Failed to fetch permission groups for this role");
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
      toast.error("Failed to fetch permission groups for this role");
    }
  };

  const handleAddGroupForRole = async () => {
    setGroupAction("add");
    setGroupIdsInput("");
    setSearchTerm("");
    setShowGroupSection(true);
    try {
      const res = await getAvailablePermissionGroupsForRole(
        selectedGroupRole.role_id
      );
      setAvailablePermissionGroups(res.data);
    } catch {
      setAvailablePermissionGroups([]);
      toast.error("Failed to fetch available permission groups");
    }
  };

  const submitAddGroupsForRole = async () => {
    if (!groupIdsInput.trim())
      return toast.success("Enter group IDs (comma separated)");
    try {
      const groupIds = groupIdsInput
        .split(",")
        .map((id) => parseInt(id.trim(), 10));
      await addPermissionGroupsToRole(selectedGroupRole.role_id, groupIds);
      toast.success("Groups added successfully");
      setGroupIdsInput("");
      setShowGroupSection(false);
      const res = await getAvailablePermissionGroupsForRole(
        selectedGroupRole.role_id
      );
      setAvailablePermissionGroups(res.data);
    } catch {
      toast.error("Failed to add groups");
    }
  };

  const submitDeleteGroupForRole = async () => {
    if (!groupToDelete.trim()) return toast.success("Enter group ID to delete");
    try {
      await removePermissionGroupFromRole(
        selectedGroupRole.role_id,
        groupToDelete
      );
      toast.success("Group removed successfully");
      setGroupToDelete("");
      setShowGroupSection(false);
      const res = await getPermissionGroupsByRole(selectedGroupRole.role_id);
      setPermissionGroupsForRole(res.data);
    } catch {
      toast.error("Failed to remove group");
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">
          Permission Group by Role
        </h3>

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
            {roles.map((role) => (
              <option key={role.role_name} value={role.role_name}>
                {role.role_name}
              </option>
            ))}
          </select>
          <Button
            className="px-6 py-2 bg-blue-900 text-white rounded hover:bg-blue-950 transition-colors font-medium"
            onClick={() => {
              const found = roles.find((r) => r.role_name === dropdownRole);
              if (found) {
                setSelectedGroupRole(found);
              } else {
                ("Please select a valid role.");
              }
            }}
          >
            Select Role
          </Button>
        </div>

        {selectedGroupRole && (
          <div className="flex flex-col gap-1 mb-2">
            <div className="flex justify-around">
              <Button
                onClick={handleAddGroupForRole}
                className="px-3 py-2 bg-blue-900 text-white rounded hover:bg-blue-950 transition-colors font-medium"
              >
                Add
              </Button>
              <Button
                onClick={handleDeleteGroupForRole}
                className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-600 transition-colors font-medium"
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

            {/* ADD Section with Search */}
            {showGroupSection && groupAction === "add" && (
              <div className="bg-white rounded-lg shadow-md p-4 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-lg font-semibold text-gray-700">
                    Add Permission Groups for {selectedGroupRole.role_name}
                  </h4>
                  <button
                    onClick={() => {
                      setShowGroupSection(false);
                      setAvailablePermissionGroups([]);
                      setGroupIdsInput("");
                      setSearchTerm("");
                    }}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    ✕ Close
                  </button>
                </div>

                <div className="mb-4">
                  <SearchInput
                    placeholder="Search by group name or ID"
                    onSearch={(value) =>
                      setSearchTerm(value.trim().toLowerCase())
                    }
                  />
                </div>

                <div className="mb-4">
                  <h5 className="text-md font-medium text-gray-700 mb-2">
                    Available Permission Groups:
                  </h5>
                  {availablePermissionGroups.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      No available permission groups to add.
                    </p>
                  ) : (
                    <div className="max-h-40 overflow-y-auto border border-gray-200 rounded p-2">
                      {availablePermissionGroups
                        .filter((group) => {
                          if (!searchTerm) return true;
                          const name = group.group_name?.toLowerCase() || "";
                          const id = String(group.group_id || "");
                          return (
                            name.includes(searchTerm) || id.includes(searchTerm)
                          );
                        })
                        .map((group, index) => (
                          <div
                            key={group.group_id || index}
                            className="flex justify-between items-center p-2 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                          >
                            <div>
                              <span className="font-medium text-gray-800">
                                {group.group_name}
                              </span>
                              <span className="text-sm text-gray-500 ml-2">
                                (ID: {group.group_id})
                              </span>
                            </div>
                            <Button
                              onClick={() => {
                                const currentIds = groupIdsInput
                                  ? groupIdsInput
                                      .split(",")
                                      .map((id) => id.trim())
                                  : [];
                                const newIds = [
                                  ...currentIds,
                                  group.group_id.toString(),
                                ];
                                setGroupIdsInput(newIds.join(", "));
                              }}
                              className="px-3 py-0.3 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                            >
                              Add
                            </Button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selected Group IDs:
                  </label>
                  <FormInput
                    // label="Selected Group IDs:"
                    name="groupIds"
                    placeholder="Enter comma-separated group IDs (e.g., 1,2,3)"
                    value={groupIdsInput}
                    onChange={(e) => setGroupIdsInput(e.target.value)}
                  />
                </div>

                <Button
                  onClick={submitAddGroupsForRole}
                  disabled={!groupIdsInput.trim()}
                  className={`px-6 py-2 text-white rounded transition-colors font-medium ${
                    groupIdsInput.trim()
                      ? "bg-blue-900 hover:bg-blue-950"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  Add Groups
                </Button>
              </div>
            )}

            {/* VIEW Section */}
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
                  <p className="text-gray-500">
                    No permission groups assigned to this role.
                  </p>
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

            {/* DELETE Section */}
            {showGroupSection && groupAction === "delete" && (
              <div className="bg-white rounded-lg shadow-md p-4 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-lg font-semibold text-gray-700">
                    Delete Permission Group for {selectedGroupRole.role_name}
                  </h4>
                  <button
                    onClick={() => {
                      setShowGroupSection(false);
                      setPermissionGroupsForRole([]);
                      setGroupToDelete("");
                    }}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    ✕ Close
                  </button>
                </div>

                <div className="mb-4">
                  <h5 className="text-md font-medium text-gray-700 mb-2">
                    Current Permission Groups:
                  </h5>
                  {permissionGroupsForRole.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      No permission groups assigned to this role.
                    </p>
                  ) : (
                    <div className="max-h-40 overflow-y-auto border border-gray-200 rounded p-2">
                      {permissionGroupsForRole.map((group, index) => (
                        <div
                          key={group.group_id || index}
                          className="flex justify-between items-center p-2 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                        >
                          <div>
                            <span className="font-medium text-gray-800">
                              {group.group_name}
                            </span>
                            <span className="text-sm text-gray-500 ml-2">
                              (ID: {group.group_id})
                            </span>
                          </div>
                          <Button
                            onClick={() =>
                              setGroupToDelete(group.group_id.toString())
                            }
                            className="px-2.5 py-0.4 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                          >
                            Select
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Group ID to Delete:
                  </label>
                  <input
                    type="text"
                    placeholder="Enter group ID to delete"
                    value={groupToDelete}
                    onChange={(e) => setGroupToDelete(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>

                <Button
                  onClick={submitDeleteGroupForRole}
                  disabled={!groupToDelete.trim()}
                  className={`px-6 py-2 text-white rounded transition-colors font-medium ${
                    groupToDelete.trim()
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  Remove Group
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PermissionGroupManagement;
