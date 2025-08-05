import { useState } from "react";
import { createGroup, updateGroup, deleteGroup } from "../../../services/Permissionapi";

export default function GroupList({
  groups,
  selectedGroupId,
  onSelectGroup,
  onGroupUpdated,
}) {
  const [newGroupName, setNewGroupName] = useState("");
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [editGroupName, setEditGroupName] = useState("");

  const handleCreate = async () => {
    if (!newGroupName.trim()) return;
    try {
      await createGroup(newGroupName);
      setNewGroupName("");
      onGroupUpdated();
    } catch (err) {
      alert("Failed to create group: " + err.response?.data?.detail || err.message);
    }
  };

  const handleEditClick = (groupId, groupName) => {
    setEditingGroupId(groupId);
    setEditGroupName(groupName);
  };

  const handleUpdate = async () => {
    try {
      await updateGroup(editingGroupId, editGroupName);
      setEditingGroupId(null);
      setEditGroupName("");
      onGroupUpdated();
    } catch (err) {
      alert("Failed to update group: " + err.response?.data?.detail || err.message);
    }
  };

  const handleDelete = async (groupId) => {
    if (!window.confirm("Are you sure you want to delete this group?")) return;
    try {
      await deleteGroup(groupId);
      onGroupUpdated();
    } catch (err) {
      alert("Failed to delete group: " + err.response?.data?.detail || err.message);
    }
  };

  return (
    <div>
      {/* Create New Group */}
      <div className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="New group name"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700"
        >
          Create
        </button>
      </div>

      {/* List of Groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groups.map((group) => (
          <div
            key={group.group_id}
            className={`border rounded-lg p-4 bg-white shadow hover:shadow-md transition ${
              selectedGroupId === group.group_id ? "ring-2 ring-blue-500" : ""
            }`}
          >
            {editingGroupId === group.group_id ? (
              <>
                <input
                  type="text"
                  value={editGroupName}
                  onChange={(e) => setEditGroupName(e.target.value)}
                  className="border p-1 rounded w-full mb-2"
                />
                <div className="flex gap-2">
                  <button
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    onClick={handleUpdate}
                  >
                    Save
                  </button>
                  <button
                    className="text-gray-600 underline"
                    onClick={() => setEditingGroupId(null)}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">{group.group_name}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditClick(group.group_id, group.group_name)}
                      className="bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 border border-green-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(group.group_id)}
                      className="bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 border border-red-300"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => onSelectGroup(group.group_id)}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 border border-blue-300"
                    >
                      View
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
