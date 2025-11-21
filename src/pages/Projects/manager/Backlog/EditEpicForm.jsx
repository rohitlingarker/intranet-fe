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

        if (epicId) {
          requests.push(
            axios.get(
              `${import.meta.env.VITE_PMS_BASE_URL}/api/epics/${epicId}`,
              axiosConfig
            )
          );
        }

        const responses = await Promise.all(requests);

        const projectData = responses[0].data;
        setProjectName(projectData.name || "");

        const statusData = responses[1].data;
        setStatuses(statusData || []);

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
          setCreatedDate(new Date().toISOString().split("T")[0]);
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

  // =====================================================
  // HANDLE CHANGE
  // =====================================================
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

  // =====================================================
  // VALIDATION
  // =====================================================
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

  // =====================================================
  // SUBMIT
  // =====================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    const payload = {
      name: formData.name,
      description: formData.description || null,
      statusId: formData.statusId,
      priority: formData.priority,
      projectId: Number(formData.projectId),
      dueDate: formData.dueDate ? `${formData.dueDate}T00:00:00` : null,
    };

    try {
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

      setLoading(false);

      // Updated fix: Close immediately, no modal flash again
      onUpdated?.();
      onClose?.();
    } catch (err) {
      console.error("Error saving epic:", err);
      toast.error(
        err.response?.data?.message || "Failed to save epic."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOADING UI
  // =====================================================
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
        <div className="bg-white rounded-xl shadow p-6 max-w-md w-full text-center">
          <p className="text-gray-600">Loading epic details...</p>
        </div>
      </div>
    );
  }

  // =====================================================
  // RENDER FORM
  // =====================================================
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg relative max-h-[90vh] overflow-y-auto no-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-6 text-gray-800">
          {epicId ? "Edit Epic" : "Create Epic"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormInput
            label="Project"
            name="projectName"
            value={projectName}
            readOnly
            disabled
          />

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

          <div className="grid grid-cols-2 gap-4">
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

            <FormSelect
              label="Status *"
              name="statusId"
              value={formData.statusId || ""}
              onChange={handleChange}
              options={[
                { label: "Select Status", value: "" },
                ...statuses.map((s) => ({
                  label: s.name,
                  value: s.id,
                })),
              ]}
            />
          </div>

          <FormDatePicker
            label="Due Date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
          />

          {createdDate && (
            <p className="text-sm text-gray-600 -mt-3">
              Created On: {createdDate}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : epicId
                ? "Save Changes"
                : "Create Epic"}
            </button>
          </div>
        </form>
      </div>

      <style>
        {`
          .no-scrollbar::-webkit-scrollbar {
            width: 0px;
          }
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}
      </style>
    </div>
  );
};

export default EditEpicForm;
