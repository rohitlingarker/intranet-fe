import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { X } from "lucide-react";

import FormInput from "../../../../components/forms/FormInput";
import FormSelect from "../../../../components/forms/FormSelect";
import FormTextArea from "../../../../components/forms/FormTextArea";
import FormDatePicker from "../../../../components/forms/FormDatePicker";

const EditEpicForm = ({ epicId, projectId, onClose, onUpdated }) => {
  const [formData, setFormData] = useState(null);
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(true);
  const [createdDate, setCreatedDate] = useState(null);

  const token = localStorage.getItem("token");
  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  // ---------- Fetch Epic + Project Data ----------
  useEffect(() => {
    const fetchData = async () => {
      try {
        let projectNameValue = "";

        // Fetch project name
        if (projectId) {
          const projectRes = await axios.get(
            `${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}`,
            axiosConfig
          );
          projectNameValue = projectRes.data?.name || "";
          setProjectName(projectNameValue);
        }

        // Fetch epic if editing
        if (epicId) {
          const epicRes = await axios.get(
            `${import.meta.env.VITE_PMS_BASE_URL}/api/epics/${epicId}`,
            axiosConfig
          );
          const epic = epicRes.data;

          setCreatedDate(epic.createdAt ? epic.createdAt.split("T")[0] : null);

          setFormData({
            name: epic.name || "",
            description: epic.description || "",
            status: epic.status || "OPEN",
            priority: epic.priority || "MEDIUM",
            // progressPercentage: epic.progressPercentage || 0,
            dueDate: epic.dueDate ? epic.dueDate.split("T")[0] : "",
            projectId: epic.project?.id || projectId || "",
          });

          if (!projectNameValue && epic.project?.name) {
            setProjectName(epic.project.name);
          }
        } else {
          // Default form for creating new epic
          setFormData({
            name: "",
            description: "",
            status: "OPEN",
            priority: "MEDIUM",
            progressPercentage: 0,
            dueDate: "",
            projectId: projectId || "",
          });
          setCreatedDate(new Date().toISOString().split("T")[0]); // use today's date for new epic
        }
      } catch (error) {
        console.error("Error loading epic data:", error);
        toast.error("Failed to load epic details.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [epicId, projectId]);

  // ---------- Handle Change ----------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "progressPercentage" ? Number(value) : value,
    }));
  };

  // ---------- Validation ----------
  const validateForm = () => {
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

  // ---------- Submit ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData) return;

    if (!validateForm()) return;

    const payload = {
      name: formData.name,
      description: formData.description,
      status: formData.status,
      priority: formData.priority,
      progressPercentage: Number(formData.progressPercentage || 0),
      dueDate: formData.dueDate ? `${formData.dueDate}T00:00:00` : null,
      projectId: Number(formData.projectId),
    };

    try {
      let response;
      if (epicId) {
        response = await axios.put(
          `${import.meta.env.VITE_PMS_BASE_URL}/api/epics/${epicId}`,
          payload,
          axiosConfig
        );
        toast.success("✅ Epic updated successfully!");
      } else {
        response = await axios.post(
          `${import.meta.env.VITE_PMS_BASE_URL}/api/epics`,
          payload,
          axiosConfig
        );
        toast.success("✅ Epic created successfully!");
      }

      onUpdated?.(response.data);

      setTimeout(() => {
        onClose?.();
      }, 1000);
    } catch (error) {
      console.error("Error saving epic:", error);
      toast.error(error.response?.data?.message || "❌ Failed to save epic.");
    }
  };

  // ---------- Loading State ----------
  if (loading || !formData) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg text-center">
          <p className="text-gray-600">Loading epic details...</p>
        </div>
      </div>
    );
  }

  // ---------- Render ----------
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg relative max-h-[90vh] overflow-y-auto no-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <ToastContainer position="top-right" autoClose={2000} />
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            {epicId ? "Edit Epic" : "Create Epic"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <FormInput
              label="Project"
              name="projectName"
              value={projectName || ""}
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

            <FormSelect
              label="Status *"
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
              label="Priority *"
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

            {/* <FormInput
              label="Progress (%)"
              name="progressPercentage"
              type="number"
              min="0"
              max="100"
              value={formData.progressPercentage || ""}
              onChange={handleChange}
            /> */}

            <FormDatePicker
              label="Due Date"
              name="dueDate"
              value={formData.dueDate || ""}
              onChange={handleChange}
            />
            {createdDate && (
              <p className="text-sm text-gray-500 -mt-3">
                Created on: {createdDate}
              </p>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
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
      </div>

      <style>
        {`
          .no-scrollbar::-webkit-scrollbar {
            width: 0px;
            background: transparent;
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
