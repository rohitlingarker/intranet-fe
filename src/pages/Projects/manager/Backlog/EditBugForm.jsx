import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { X } from "lucide-react";
import FormInput from "../../../../components/forms/FormInput";
import FormSelect from "../../../../components/forms/FormSelect";
import FormTextArea from "../../../../components/forms/FormTextArea";

const EditBugForm = ({ bugId, projectId, onClose, onUpdated }) => {
  const [formData, setFormData] = useState({
    id: bugId || null,
    title: "",
    description: "",
    priority: "MEDIUM",
    status: "OPEN",
    severity: "MINOR",
    type: "",
    assignedTo: "",
    reporter: "",
    projectId: projectId || "",
    sprintId: null,
    epicId: null,
    taskId: null,
    stepsToReproduce: "",
    expectedResult: "",
    actualResult: "",
    attachments: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBug = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_PMS_BASE_URL}/api/bugs/${bugId}`
        );
        // ✅ ensure id from backend is preserved
        setFormData((prev) => ({
          ...prev,
          ...res.data,
          id: res.data.id ?? bugId,
        }));
      } catch (err) {
        toast.error("Failed to fetch bug details");
      }
    };

    if (bugId) fetchBug();
  }, [bugId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ ensure id is sent and numeric
      const payload = {
        ...formData,
        id: Number(formData.id || bugId),
        projectId: Number(formData.projectId),
        assignedTo: formData.assignedTo
          ? Number(formData.assignedTo)
          : null,
        reporter: formData.reporter ? Number(formData.reporter) : null,
        sprintId: formData.sprintId ? Number(formData.sprintId) : null,
        epicId: formData.epicId ? Number(formData.epicId) : null,
        taskId: formData.taskId ? Number(formData.taskId) : null,
      };

      console.log("PUT Payload:", payload); // 🔍 Debug log

      await axios.put(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/bugs/${bugId}`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      toast.success("Bug updated successfully!");
      onUpdated?.();
      onClose?.();
    } catch (error) {
      console.error("Error updating bug:", error.response?.data || error);
      toast.error(
        error.response?.data?.message || "Failed to update bug."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Edit Bug</h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />

          <FormTextArea
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormSelect
              label="Priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              options={["LOW", "MEDIUM", "HIGH", "CRITICAL"]}
            />
            <FormSelect
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={[
                "OPEN",
                "IN_PROGRESS",
                "RESOLVED",
                "CLOSED",
                "REOPENED",
              ]}
            />
            <FormSelect
              label="Severity"
              name="severity"
              value={formData.severity}
              onChange={handleChange}
              options={["MINOR", "MAJOR", "BLOCKER"]}
            />
          </div>

          <FormTextArea
            label="Steps To Reproduce"
            name="stepsToReproduce"
            value={formData.stepsToReproduce}
            onChange={handleChange}
          />

          <FormTextArea
            label="Expected Result"
            name="expectedResult"
            value={formData.expectedResult}
            onChange={handleChange}
          />

          <FormTextArea
            label="Actual Result"
            name="actualResult"
            value={formData.actualResult}
            onChange={handleChange}
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {loading ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBugForm;
