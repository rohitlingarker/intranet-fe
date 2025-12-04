import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { X } from "lucide-react";

export default function AddStepsModal({ caseId, onClose }) {
  const [existingSteps, setExistingSteps] = useState([]);
  const [newSteps, setNewSteps] = useState([{ action: "", expectedResult: "" }]);
  const [loading, setLoading] = useState(false);

  // Load existing steps
  useEffect(() => {
    const loadSteps = async () => {
      try {
        const res = await axiosInstance.get(
          `${import.meta.env.VITE_PMS_BASE_URL}/api/test-design/steps/test-cases/${caseId}`
        );
        setExistingSteps(res.data || []);
      } catch (err) {
        console.error("Failed to load steps", err);
      }
    };

    loadSteps();
  }, [caseId]);

  const addRow = () =>
    setNewSteps([...newSteps, { action: "", expectedResult: "" }]);

  const removeRow = (i) =>
    setNewSteps(newSteps.filter((_, idx) => idx !== i));

  const updateRow = (i, key, value) => {
    const updated = [...newSteps];
    updated[i][key] = value;
    setNewSteps(updated);
  };

  const handleSave = async () => {
    const validSteps = newSteps.filter(
      (s) => s.action.trim() || s.expectedResult.trim()
    );

    if (!validSteps.length) {
      alert("Add at least one step");
      return;
    }

    setLoading(true);

    try {
      // Build final step array
      const updatedSteps = [
        ...existingSteps.map((s) => ({
          id: s.id,
          stepNumber: s.stepNumber,
          action: s.action,
          expectedResult: s.expectedResult,
        })),
        ...validSteps.map((s, i) => ({
          stepNumber: existingSteps.length + (i + 1),
          action: s.action,
          expectedResult: s.expectedResult,
        })),
      ];

      // Backend expects ONLY an array of steps
      await axiosInstance.post(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/test-design/steps/test-cases/${caseId}`,
        updatedSteps
      );

      alert("Steps added successfully");
      onClose();
      window.location.reload();
    } catch (err) {
      console.error("Failed to save steps", err);
      alert("Failed to add steps");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[600px] p-5 rounded-xl shadow-lg max-h-[80vh] overflow-auto">
        
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Add Steps</h2>
          <X className="cursor-pointer" onClick={onClose} />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between">
            <label className="text-sm">New Steps</label>
            <button
              onClick={addRow}
              className="text-sm text-blue-600"
            >
              + Add Step
            </button>
          </div>

          {newSteps.map((row, i) => (
            <div key={i} className="grid grid-cols-12 gap-2">

              <input
                className="col-span-5 border rounded px-2 py-1"
                placeholder={`Action #${i + 1}`}
                value={row.action}
                onChange={(e) => updateRow(i, "action", e.target.value)}
              />

              <input
                className="col-span-6 border rounded px-2 py-1"
                placeholder="Expected result"
                value={row.expectedResult}
                onChange={(e) => updateRow(i, "expectedResult", e.target.value)}
              />

              <button
                className="col-span-1 text-red-500"
                onClick={() => removeRow(i)}
              >
                ✕
              </button>

            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button className="px-4 py-2 bg-gray-200 rounded" onClick={onClose}>
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            {loading ? "Saving..." : "Save Steps"}
          </button>
        </div>

      </div>
    </div>
  );
}
