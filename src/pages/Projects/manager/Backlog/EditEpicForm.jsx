import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { X } from "lucide-react";

import FormInput from "../../../../components/forms/FormInput";
import FormSelect from "../../../../components/forms/FormSelect";
import FormTextArea from "../../../../components/forms/FormTextArea";
import FormDatePicker from "../../../../components/forms/FormDatePicker";

const EditEpicForm = ({ epicId, projectId, onClose, onUpdated }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    statusId: "",
    priority: "MEDIUM",
    dueDate: "",
    projectId: projectId,
  });

  const [projectName, setProjectName] = useState("");
  const [statuses, setStatuses] = useState([]);
  const [createdDate, setCreatedDate] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  // =====================================================
  // FETCH DATA
  // =====================================================
  useEffect(() => {
    const loadData = async () => {
      try {
        const requests = [
          axios.get(
            `${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}`,
            axiosConfig
          ),
          axios.get(
            `${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/statuses`,
            axiosConfig
          ),
        ];

        // If editing, also fetch epic
        if (epicId) {
          requests.push(
            axios.get(
              `${import.meta.env.VITE_PMS_BASE_URL}/api/epics/${epicId}`,
              axiosConfig
            )
          );
        }

        const responses = await Promise.all(requests);

        // Project Name
        const projectData = responses[0].data;
        setProjectName(projectData.name || "");

        // Statuses
        const statusData = responses[1].data;
        setStatuses(statusData || []);

        // Epic Data (if editing)
        if (epicId && responses[2]) {
          const epic = responses[2].data;

          setFormData({
            name: epic.name || "",
            description: epic.description || "",
            statusId: epic.statusId || "",
            priority: epic.priority || "MEDIUM",
            dueDate: epic.dueDate ? epic.dueDate.split("T")[0] : "",
            projectId: Number(epic.project?.id || projectId),
          });

          setCreatedDate(
            epic.createdAt ? epic.createdAt.split("T")[0] : null
          );
        } else {
          // Default form for creating new epic
          setCreatedDate(new Date().toISOString().split("T")[0]);
          setFormData({
            name: "",
            description: "",
            status: "OPEN",
            priority: "MEDIUM",
            progressPercentage: 0,
            dueDate: "",
            projectId: projectId || "",
          });
        }
      } catch (err) {
        console.error("Error loading epic:", err);
        toast.error("Failed to load epic details.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [epicId, projectId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    const numericFields = ["statusId"];

    setFormData((prev) => ({
      ...prev,
      [name]: numericFields.includes(name)
        ? value
          ? Number(value)
          : null
        : value,
    }));
  };

  const validateForm = () => {
    if (!formData.name) {
      toast.error("Epic name is required.");
      return false;
    }

    if (createdDate && formData.dueDate) {
      const due = new Date(formData.dueDate);
      const created = new Date(createdDate);
      if (due < created) {
        toast.error("Due date cannot be earlier than the created date.");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    const payload = {
      name: formData.name,
      description: formData.description || null,
      statusId: formData.statusId,
      priority: formData.priority,
      dueDate: formData.dueDate ? `${formData.dueDate}T00:00:00` : null,
    };

    try {
      let response;

      if (epicId) {
        await axios.put(
          `${import.meta.env.VITE_PMS_BASE_URL}/api/epics/${epicId}`,
          payload,
          axiosConfig
        );
        toast.success("Epic updated successfully!");
      } else {
        await axios.post(
          `${import.meta.env.VITE_PMS_BASE_URL}/api/epics`,
          payload,
          axiosConfig
        );
        toast.success("Epic created successfully!");
      }

      setTimeout(() => {
        onUpdated?.();
        onClose?.();
      }, 800);
    } catch (error) {
      console.error("Error saving epic:", error);
      toast.error(error.response?.data?.message || "Failed to save epic");
    }
  };

  if (loading || !formData) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
        <div className="bg-white rounded-xl shadow p-6 max-w-md w-full text-center">
          <p className="text-gray-600">Loading epic details...</p>
        </div>
      </div>
    );
  }

  // ---------- FINAL UI WITH STICKY FOOTER + OUTSIDE CLICK ----------
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose} // outside click closes modal
    >
      <ToastContainer />
      <div
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col relative"
        onClick={(e) => e.stopPropagation()} // Don’t close when clicking inside
      >
        {/* HEADER */}
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {epicId ? "Edit Epic" : "Create Epic"}
          </h2>
          <button onClick={onClose}>
            <X className="text-gray-600" />
          </button>
        </div>

        {/* BODY (SCROLLABLE) */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          <FormInput label="Project" value={projectName} readOnly disabled />

          <FormInput
            label="Epic Name *"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <FormTextArea
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />

          <FormSelect
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={[
              { label: "Open", value: "OPEN" },
              { label: "In Progress", value: "IN_PROGRESS" },
              { label: "Completed", value: "COMPLETED" },
              { label: "On Hold", value: "ON_HOLD" },
            ]}
          />

          <FormSelect
            label="Priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            options={[
              { label: "Low", value: "LOW" },
              { label: "Medium", value: "MEDIUM" },
              { label: "High", value: "HIGH" },
              { label: "Critical", value: "CRITICAL" },
            ]}
          />

          <FormDatePicker
            label="Due Date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
          />

          {createdDate && (
            <p className="text-sm text-gray-500 -mt-3">
              Created on: {createdDate}
            </p>
          )}
        </div>

        {/* STICKY FOOTER */}
        <div className="sticky bottom-0 bg-white p-4 border-t flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {epicId ? "Save Changes" : "Create Epic"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditEpicForm;
