import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-toastify";

export default function CreateTestCycleForm({ projectId, onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    cycleType: "",
    status: "",
    startDate: "",
    endDate: "",
    sprintId: null,
  });

  const [loading, setLoading] = useState(false);
  const [sprints, setSprints] = useState([]);
  const [loadingSprints, setLoadingSprints] = useState(true);

  // Fetch sprint list
  useEffect(() => {
    if (!projectId) return;

    const fetchSprints = async () => {
      try {
        const res = await axiosInstance.get(
          `${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/sprints`
        );
        setSprints(res.data || []);
      } catch (err) {
        console.error("Error fetching sprints:", err);
        toast.error("Failed to load sprints");
      } finally {
        setLoadingSprints(false);
      }
    };

    fetchSprints();
  }, [projectId]);

  // Input handler
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]:
        name === "sprintId"
          ? value === "" 
            ? null       // empty -> null
            : Number(value) // convert to number
          : value,
    });
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.cycleType || !form.startDate) {
      toast.error("Please fill all required fields");
      return;
    }

    const payload = {
      projectId,
      sprintId: form.sprintId,
      name: form.name,
      cycleType: form.cycleType,
      status: form.status || null,
      startDate: form.startDate,
      endDate: form.endDate || null,
      createdBy: 1, // TODO: set logged-in user
    };

    console.log("🚀 Sending Payload:", payload);

    try {
      setLoading(true);
      await axiosInstance.post(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/test-execution/test-cycles`,
        payload
      );
      toast.success("Test Cycle Created Successfully!");
      onSuccess && onSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create test cycle");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-lg">
      <h2 className="text-xl font-semibold mb-4">Create Test Cycle</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

  {/* Cycle Name - full width */}
  <div className="md:col-span-2">
    <label className="block text-sm font-medium mb-1">Cycle Name *</label>
    <input
      type="text"
      name="name"
      value={form.name}
      onChange={handleChange}
      className="w-full p-2 border rounded-lg"
      placeholder="Regression Cycle 1"
      required
    />
  </div>

  {/* Cycle Type */}
  <div>
    <label className="block text-sm font-medium mb-1">Cycle Type *</label>
    <select
      name="cycleType"
      value={form.cycleType}
      onChange={handleChange}
      className="w-full p-2 border rounded-lg"
      required
    >
      <option value="">Select Type</option>
      <option value="REGRESSION">REGRESSION</option>
      <option value="SMOKE">SMOKE</option>
      <option value="SANITY">SANITY</option>
      <option value="CUSTOM">CUSTOM</option>
    </select>
  </div>

  {/* Status */}
  <div>
    <label className="block text-sm font-medium mb-1">Status</label>
    <select
      name="status"
      value={form.status}
      onChange={handleChange}
      className="w-full p-2 border rounded-lg"
    >
      <option value="">Select Status</option>
      <option value="NOT_STARTED">NOT_STARTED</option>
      <option value="IN_PROGRESS">IN_PROGRESS</option>
      <option value="COMPLETED">COMPLETED</option>
      <option value="BLOCKED">BLOCKED</option>
    </select>
  </div>

  {/* Sprint Dropdown */}
  <div>
    <label className="block text-sm font-medium mb-1">Select Sprint</label>
    {loadingSprints ? (
      <p className="text-gray-500 text-sm">Loading sprints...</p>
    ) : (
      <select
        name="sprintId"
        value={form.sprintId ?? ""}
        onChange={handleChange}
        className="w-full p-2 border rounded-lg"
      >
        <option value="">No Sprint (Optional)</option>
        {sprints.map((sprint) => (
          <option key={sprint.id} value={sprint.id}>
            {sprint.name}
          </option>
        ))}
      </select>
    )}
  </div>

  {/* Start Date */}
  <div>
    <label className="block text-sm font-medium mb-1">Start Date *</label>
    <input
      type="datetime-local"
      name="startDate"
      value={form.startDate}
      onChange={handleChange}
      className="w-full p-2 border rounded-lg"
      required
    />
  </div>

  {/* End Date */}
  <div>
    <label className="block text-sm font-medium mb-1">End Date</label>
    <input
      type="datetime-local"
      name="endDate"
      value={form.endDate}
      onChange={handleChange}
      className="w-full p-2 border rounded-lg"
    />
  </div>

  {/* Submit Button - full width */}
  <div className="md:col-span-2">
    <button
      type="submit"
      disabled={loading}
      className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
    >
      {loading ? "Creating..." : "Create Cycle"}
    </button>
  </div>

</form>

    </div>
  );
}
