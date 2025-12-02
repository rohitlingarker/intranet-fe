import React, { useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { X } from "lucide-react";

export default function AddCaseModal({ scenarioId, onClose }) {
  const [title, setTitle] = useState("");
  const [preConditions, setPreConditions] = useState("");
  const [priority, setPriority] = useState("LOW");
  const [type, setType] = useState("FUNCTIONAL");
  const [steps, setSteps] = useState([{ action: "", expectedResult: "" }]);
  const [saving, setSaving] = useState(false);

  const addStep = () => {
    setSteps([...steps, { action: "", expectedResult: "" }]);
  };

  const updateStep = (index, field, value) => {
    const updated = [...steps];
    updated[index][field] = value;
    setSteps(updated);
  };

  const removeStep = (index) => {
    const updated = steps.filter((_, i) => i !== index);
    setSteps(updated);
  };

  const handleSave = async () => {
    if (!title.trim()) return alert("Case title is required");
    if (!scenarioId) return alert("No scenario selected");

    setSaving(true);

    try {
      const payload = {
        scenarioId: Number(scenarioId),
        title: title.trim(),
        preConditions: preConditions.trim(),
        type,
        priority,
        steps: steps
          .filter((s) => s.action.trim() || s.expectedResult.trim())
          .map((s) => ({
            action: s.action,
            expectedResult: s.expectedResult
          }))
      };

      await axiosInstance.post("/api/test-design/test-cases", payload);

      alert("Test Case Created");
      onClose();
      window.location.reload();
    } catch (err) {
      console.error("Create Case FAILED →", err);
      alert("Failed to create test case");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[650px] max-h-[80vh] overflow-auto p-5 rounded-xl shadow-lg">
        <div className="flex justify-between mb-4">
          <h2 className="text-lg font-semibold">Add Test Case</h2>
          <X className="cursor-pointer" onClick={onClose} />
        </div>

        <div className="space-y-4">

          <div>
            <label className="text-sm">Title</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter case title"
            />
          </div>

          <div>
            <label className="text-sm">Pre-Conditions</label>
            <textarea
              className="w-full border rounded px-3 py-2"
              value={preConditions}
              onChange={(e) => setPreConditions(e.target.value)}
              rows={2}
              placeholder="Enter pre-conditions"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm">Type</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="FUNCTIONAL">FUNCTIONAL</option>
                <option value="REGRESSION">REGRESSION</option>
                <option value="SMOKE">SMOKE</option>
                <option value="SECURITY">SECURITY</option>
              </select>
            </div>

            <div>
              <label className="text-sm">Priority</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between">
              <label className="text-sm">Steps</label>
              <button onClick={addStep} className="text-blue-600 text-sm">+ Add Step</button>
            </div>

            <div className="space-y-2 mt-2">
              {steps.map((step, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-start">
                  <input
                    className="col-span-5 border rounded px-2 py-1"
                    placeholder={`Action #${i + 1}`}
                    value={step.action}
                    onChange={(e) => updateStep(i, "action", e.target.value)}
                  />
                  <input
                    className="col-span-6 border rounded px-2 py-1"
                    placeholder="Expected Result"
                    value={step.expectedResult}
                    onChange={(e) => updateStep(i, "expectedResult", e.target.value)}
                  />
                  <button
                    className="col-span-1 text-red-500"
                    onClick={() => removeStep(i)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button className="px-4 py-2 bg-gray-200 rounded" onClick={onClose}>
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Create Case"}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
