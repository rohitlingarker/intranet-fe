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
  const [groupAction, setGroupAction] = useState("");
  const [availablePermissionGroups, setAvailablePermissionGroups] = useState([]);
  const [permissionGroupsForRole, setPermissionGroupsForRole] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroupNames, setSelectedGroupNames] = useState([]);
  const [selectedGroupUUIDs, setSelectedGroupUUIDs] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!dropdownRole) {
      setSelectedGroupRole(null);
      return;
    }
    const found = roles.find((r) => r.role_name === dropdownRole);
    if (found) setSelectedGroupRole(found);
  }, [dropdownRole, roles]);

  const handleOpenModal = async (action) => {
    if (!selectedGroupRole) return;
    setGroupAction(action);
    setSelectedGroupNames([]);
    setSelectedGroupUUIDs([]);
    setSearchTerm("");
    setShowModal(true);

    try {
      if (action === "add") {
        const res = await getAvailablePermissionGroupsForRole(selectedGroupRole.role_uuid);
        setAvailablePermissionGroups(res.data);
      } else {
        const res = await getPermissionGroupsByRole(selectedGroupRole.role_uuid);
        setPermissionGroupsForRole(res.data);
      }
    } catch {
      showStatusToast("Failed to fetch permission groups", "error");
      setAvailablePermissionGroups([]);
      setPermissionGroupsForRole([]);
    }
  };

  const handleSelectGroup = (group) => {
    const uuidStr = group.group_uuid.toString();
    if (groupAction === "delete") {
      setSelectedGroupUUIDs([uuidStr]);
      setSelectedGroupNames([group.group_name]);
    } else {
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

  const submitAddGroupsForRole = async () => {
    if (!selectedGroupUUIDs.length) return showStatusToast("Select group(s) to add", "error");
    try {
      await addPermissionGroupsToRole(selectedGroupRole.role_uuid, selectedGroupUUIDs);
      showStatusToast("Groups added successfully", "success");
      setShowModal(false);
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
      setShowModal(false);
    } catch {
      showStatusToast("Failed to remove group", "error");
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Permission Group by Role</h3>

        {/* Role Dropdown */}
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

        {/* Action Buttons */}
        {selectedGroupRole && (
          <div className="flex justify-around items-center mb-4">
            <Button
              onClick={() => handleOpenModal("add")}
              className="px-3 py-2 bg-blue-900 text-white rounded hover:bg-blue-950 transition-colors font-medium"
            >
              Add
            </Button>
            <Button
              onClick={() => handleOpenModal("delete")}
              className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-medium"
            >
              Delete
            </Button>
            <Button
              onClick={() => handleOpenModal("view")}
              className="px-3 py-2 bg-pink-900 text-white rounded hover:bg-pink-950 transition-colors font-medium"
            >
              View
            </Button>
          </div>
        )}
      </div>

      {/* Modal Popup */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg w-[600px] max-h-[80vh] overflow-y-auto p-6 relative">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-700">
                {groupAction === "add"
                  ? `Add Permission Groups for ${selectedGroupRole.role_name}`
                  : groupAction === "delete"
                  ? `Delete Permission Groups for ${selectedGroupRole.role_name}`
                  : `View Permission Groups for ${selectedGroupRole.role_name}`}
              </h4>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                ✕
              </button>
            </div>

            {/* Add / Delete Section */}
            {(groupAction === "add" || groupAction === "delete") && (
              <>
                <SearchInput
                  placeholder="Search by group name"
                  onSearch={(value) => setSearchTerm(value.trim().toLowerCase())}
                />

                <div className="mt-4 max-h-52 overflow-y-auto border border-gray-200 rounded p-2">
                  {(groupAction === "add"
                    ? availablePermissionGroups
                    : permissionGroupsForRole
                  )
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
                          {selectedGroupUUIDs.includes(group.group_uuid.toString())
                            ? "Selected"
                            : "Select"}
                        </Button>
                      </div>
                    ))}
                </div>

                {/* Selected Groups */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selected group names:
                  </label>
                  {selectedGroupNames.length === 0 ? (
                    <p className="text-gray-500 text-sm">No group names selected yet.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2 border border-gray-300 rounded p-2">
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

                <div className="flex justify-end mt-6 gap-2">
                  <Button
                    onClick={() =>
                      groupAction === "add"
                        ? submitAddGroupsForRole()
                        : submitDeleteGroupsForRole()
                    }
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
                  <Button
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}

            {/* View Section */}
            {groupAction === "view" && (
              <div className="mt-2">
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
        </div>
      )}
    </div>
  );
};

export default PermissionGroupManagement;
