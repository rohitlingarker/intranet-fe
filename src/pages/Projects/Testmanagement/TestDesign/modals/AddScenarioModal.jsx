import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

export default function AddScenarioModal({ testStoryId, onClose, onCreated }) {
  const { projectId } = useParams();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("LOW");

  const [testPlans, setTestPlans] = useState([]);
  const [testPlanId, setTestPlanId] = useState("");

  const [pmsStories, setPmsStories] = useState([]);
  const [linkedStoryId, setLinkedStoryId] = useState("");

  const [loading, setLoading] = useState(false);

  /* ---------------------------------------------------------
     FETCH TEST PLANS
  ---------------------------------------------------------- */
  const fetchTestPlans = async () => {
    try {
      const res = await axiosInstance.get(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/test-design/plans/projects/${projectId}`
      );

      setTestPlans(res.data || []);
    } catch (err) {
      console.error("❌ Failed to load test plans", err);
      toast.error("Failed to load test plans");
    }
  };

  /* ---------------------------------------------------------
     FETCH PMS STORIES
  ---------------------------------------------------------- */
  const fetchPmsStories = async () => {
    try {
      const res = await axiosInstance.get(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/stories`
      );

      setPmsStories(res.data || []);
    } catch (err) {
      console.error("❌ Failed to load PMS stories", err);
      toast.error("Failed to load stories");
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchTestPlans();
      fetchPmsStories();
    }
  }, [projectId]);

  /* ---------------------------------------------------------
     SAVE NEW SCENARIO
  ---------------------------------------------------------- */
  const handleSave = async () => {
    if (!testPlanId) return toast.error("Test Plan is required");
    if (!title.trim()) return toast.error("Scenario title is required");

    setLoading(true);

    const payload = {
      testPlanId: Number(testPlanId),
      testStoryId: Number(testStoryId),
      linkedStoryId: linkedStoryId ? Number(linkedStoryId) : null,
      title: title.trim(),
      description: description.trim(),
      priority,
    };

    try {
      const res = await axiosInstance.post(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/test-design/scenarios`,
        payload
      );

      toast.success("Scenario created successfully!");

      if (onCreated) onCreated(res.data);
      onClose();
    } catch (err) {
      console.error("❌ Create scenario failed", err.response?.data || err);
      toast.error("Failed to create scenario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[520px] p-5 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Add Scenario</h2>

        <div className="space-y-3">
          {/* Test Plan */}
          <div>
            <label className="text-sm font-medium">Select Test Plan *</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={testPlanId}
              onChange={(e) => setTestPlanId(e.target.value)}
            >
              <option value="">-- Select Test Plan --</option>
              {testPlans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.title || plan.name || `Plan ${plan.id}`}
                </option>
              ))}
            </select>
          </div>

          {/* Linked Story */}
          <div>
            <label className="text-sm font-medium">Link PMS Story (optional)</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={linkedStoryId}
              onChange={(e) => setLinkedStoryId(e.target.value)}
            >
              <option value="">-- None --</option>
              {pmsStories.map((story) => (
                <option key={story.id} value={story.id}>
                  {story.title}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="text-sm font-medium">Scenario Title *</label>
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Enter scenario title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Priority */}
          <div>
            <label className="text-sm font-medium">Priority</label>
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

          {/* Description */}
          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="w-full border rounded px-3 py-2"
              rows={3}
              placeholder="Enter description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 mt-4">
            <button
              className="px-4 py-2 bg-gray-200 rounded"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              className="px-4 py-2 bg-blue-600 text-white rounded"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Saving..." : "Create Scenario"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
