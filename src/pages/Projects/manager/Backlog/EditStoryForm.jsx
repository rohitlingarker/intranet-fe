import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { X } from "lucide-react";

import FormInput from "../../../../components/forms/FormInput";
import FormSelect from "../../../../components/forms/FormSelect";
import FormTextArea from "../../../../components/forms/FormTextArea";

const EditStoryForm = ({
  storyId,
  projectId,
  onClose,
  onUpdated,
  mode = "drawer",
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    acceptanceCriteria: "",
    storyPoints: null,
    priority: "MEDIUM",

    epicId: null,
    sprintId: null,
    statusId: null,

    assigneeId: null,
    reporterId: null,
  });

  const [users, setUsers] = useState([]);
  const [epics, setEpics] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  // ===================== LOAD INITIAL DATA =====================
  useEffect(() => {
    const loadData = async () => {
      try {
        const [storyRes, userRes, epicRes, sprintRes, statusRes] =
          await Promise.all([
            axios.get(
              `${import.meta.env.VITE_PMS_BASE_URL}/api/stories/${storyId}`,
              axiosConfig
            ),
            axios.get(
              `${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/members-with-owner`,
              axiosConfig
            ),
            axios.get(
              `${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/epics`,
              axiosConfig
            ),
            axios.get(
              `${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/sprints`,
              axiosConfig
            ),
            axios.get(
              `${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/statuses`,
              axiosConfig
            ),
          ]);

        const data = storyRes.data;

        setFormData({
          title: data.title || "",
          description: data.description || "",
          acceptanceCriteria: data.acceptanceCriteria || "",
          storyPoints: data.storyPoints || "",
          priority: data.priority || "MEDIUM",

          epicId: data.epicId || "",
          sprintId: data.sprintId || "",
          statusId: data.statusId || "",

          assigneeId: data.assigneeId || "",
          reporterId: data.reporterId || "",
        });

        setUsers(userRes.data.content || userRes.data || []);
        setEpics(epicRes.data || []);
        setSprints(sprintRes.data || []);
        setStatuses(statusRes.data || []);
      } catch (err) {
        console.error("Error loading story:", err);
        toast.error("Failed to load story.");
      } finally {
        setLoading(false);
      }
    };

    if (storyId && projectId) loadData();
  }, [storyId, projectId]);

  // ===================== HANDLE INPUT =====================
  const handleChange = (e) => {
    const { name, value } = e.target;

    const numericFields = [
      "epicId",
      "sprintId",
      "assigneeId",
      "reporterId",
      "storyPoints",
      "statusId",
    ];

    setFormData((prev) => ({
      ...prev,
      [name]: numericFields.includes(name)
        ? value
          ? Number(value)
          : null
        : value,
    }));
  };

  // ===================== SUBMIT =====================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      title: formData.title,
      description: formData.description,
      acceptanceCriteria: formData.acceptanceCriteria,
      storyPoints: formData.storyPoints,
      assigneeId: formData.assigneeId,
      reporterId: formData.reporterId,
      projectId: Number(projectId),
      epicId: formData.epicId,
      sprintId: formData.sprintId,
      statusId: formData.statusId,
      priority: formData.priority,
    };

    try {
      await axios.put(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/stories/${storyId}`,
        payload,
        axiosConfig
      );

      toast.success("Story updated successfully!");
      setTimeout(() => {
        onUpdated?.();
        onClose?.();
      }, 500);
    } catch (error) {
      console.error("Error updating:", error);
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Failed to update story";

      toast.error(msg, {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  // ===================== LOADING STATE =====================
  if (loading) {
    return (
      <p className="text-gray-600 text-center py-6">Loading story details...</p>
    );
  }

  // ===================== WRAPPER =====================
  const Wrapper = ({ children }) => {
    if (mode === "modal") {
      return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="absolute inset-0" onClick={onClose} />

          <div
            className="relative bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col z-50"
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </div>
        </div>
      );
    }

    // Drawer Mode
    return (
      <div
        className="h-full w-full flex flex-col bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    );
  };

  // ===================== UI =====================
  return (
    <Wrapper>
      {/* HEADER */}
      <div className="p-6 border-b flex justify-between items-center">
        <h2 className="text-xl font-semibold">Edit User Story</h2>
        <button onClick={onClose}>
          <X className="text-gray-600" />
        </button>
      </div>

      {/* BODY */}
      <div className="p-6 flex-1 overflow-y-auto space-y-6">
        <FormInput
          label="Title *"
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

        <FormSelect
          label="Epic"
          name="epicId"
          value={formData.epicId || ""}
          onChange={handleChange}
          options={[
            { label: "Select Epic", value: "" },
            ...epics.map((e) => ({ label: e.name, value: e.id })),
          ]}
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
              ...statuses.map((s) => ({ label: s.name, value: s.id })),
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Story Points"
            name="storyPoints"
            type="number"
            value={formData.storyPoints || ""}
            onChange={handleChange}
          />

          <FormSelect
            label="Sprint"
            name="sprintId"
            value={formData.sprintId || ""}
            onChange={handleChange}
            options={[
              { label: "Select Sprint", value: "" },
              ...sprints.map((s) => ({ label: s.name, value: s.id })),
            ]}
          />
        </div>

        <FormTextArea
          label="Acceptance Criteria"
          name="acceptanceCriteria"
          value={formData.acceptanceCriteria}
          onChange={handleChange}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormSelect
            label="Assignee"
            name="assigneeId"
            value={formData.assigneeId || ""}
            onChange={handleChange}
            options={[
              { label: "Select Assignee", value: "" },
              ...users.map((u) => ({ label: u.name, value: u.id })),
            ]}
          />

          <FormSelect
            label="Reporter"
            name="reporterId"
            value={formData.reporterId || ""}
            onChange={handleChange}
            options={[
              { label: "Select Reporter", value: "" },
              ...users.map((u) => ({ label: u.name, value: u.id })),
            ]}
          />
        </div>
      </div>

      {/* FOOTER */}
      <div className="sticky bottom-0 bg-white border-t p-4 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          Cancel
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={handleSubmit}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Update Story"}
        </button>
      </div>
    </Wrapper>
  );
};

export default EditStoryForm;
