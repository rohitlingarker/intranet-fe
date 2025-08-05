import { useState } from "react";
import { assignPermissionToGroup } from "../../../services/Permissionapi";

export default function AssignPermissionModal({
  groupId,
  permissions,
  onClose,
  onAssigned,
}) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleAssign = async () => {
    if (!selectedIds.length) return;

    setLoading(true);
    try {
      await Promise.all(
        selectedIds.map((pid) => assignPermissionToGroup(pid, groupId))
      );
      onAssigned(); // Refresh the permissions list
      onClose();    // Close modal
    } catch (error) {
      console.error("Error assigning permissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (permId) => {
    setSelectedIds((prev) =>
      prev.includes(permId)
        ? prev.filter((id) => id !== permId)
        : [...prev, permId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Assign Permissions</h2>

        <div className="h-48 overflow-y-auto border border-gray-200 rounded p-2 mb-4">
          {permissions.length === 0 ? (
            <p className="text-sm text-gray-500">No permissions available.</p>
          ) : (
            permissions.map((perm) => (
              <label
                key={perm.permission_id}
                className="flex items-center gap-2 py-1"
              >
                <input
                  type="checkbox"
                  value={perm.permission_id}
                  onChange={() => togglePermission(perm.permission_id)}
                  checked={selectedIds.includes(perm.permission_id)}
                />
                <span className="text-sm text-gray-700">{perm.code}</span>
              </label>
            ))
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={selectedIds.length === 0 || loading}
            className={`px-4 py-2 rounded text-sm text-white ${
              selectedIds.length === 0 || loading
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Assigning..." : "Assign"}
          </button>
        </div>
      </div>
    </div>
  );
}
