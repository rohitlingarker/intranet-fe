import React, { useState } from "react";
import axiosInstance from "../../../../../api/axiosInstance";

export default function AddTestStoryModal({ projectId, onClose }) {
  const [name, setName] = useState("");
  const [linkedStoryId, setLinkedStoryId] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return alert("Story name is required");

    setSaving(true);

    try {
      const payload = {
        projectId: Number(projectId),
        name: name.trim(),
        description: description.trim(),
        linkedStoryId: linkedStoryId ? Number(linkedStoryId) : null,
      };

      await axiosInstance.post("/api/test-design/test-stories", payload);

      alert("Test Story created");
      onClose();
      window.location.reload(); // reload whole test design tree
    } catch (err) {
      console.error("Create Test Story FAILED →", err);
      alert("Failed to create test story");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[480px] p-5 rounded-xl shadow-lg">

        <h2 className="text-lg font-semibold mb-4">Add Test Story</h2>

        <div className="space-y-3">
          <div>
            <label className="text-sm">Story Name</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter test story name"
            />
          </div>

          <div>
            <label className="text-sm">Linked PMS Story ID (optional)</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={linkedStoryId}
              onChange={(e) => setLinkedStoryId(e.target.value)}
              placeholder="Enter PMS story ID"
            />
          </div>

          <div>
            <label className="text-sm">Description</label>
            <textarea
              className="w-full border rounded px-3 py-2"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
            />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button className="px-4 py-2 bg-gray-200 rounded" onClick={onClose}>
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Create"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
