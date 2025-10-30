import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { X } from "lucide-react";

import FormInput from "../../../../components/forms/FormInput";
import FormSelect from "../../../../components/forms/FormSelect";
import FormTextArea from "../../../../components/forms/FormTextArea";

const EditBugForm = ({ bugId, projectId, onClose, onUpdated }) => {
  const [formData, setFormData] = useState(null);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  // ---------------- FETCH BUG DETAILS ----------------
  useEffect(() => {
    const fetchBugDetails = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_PMS_BASE_URL}/api/bugs/${bugId}`,
          axiosConfig
        );
        const bug = res.data;

        setFormData({
          id: bug.id,
          title: bug.title || "",
          description: bug.description || "",
          priority: bug.priority || "MEDIUM",
          status: bug.status || "OPEN",
          severity: bug.severity || "MINOR",
          reporter: bug.reporter || "",
          assignedTo: bug.assignedTo || "",
          projectId: bug.projectId || projectId || "",
          sprintId: bug.sprintId || "",
          epicId: bug.epicId || "",
          taskId: bug.taskId || "",
          stepsToReproduce: bug.stepsToReproduce || "",
          expectedResult: bug.expectedResult || "",
          actualResult: bug.actualResult || "",
          attachments: bug.attachments || "",
        });
      } catch (error) {
        console.error("Error fetching bug details:", error);
        toast.error("Failed to load bug details.");
      }
    };

    if (bugId) fetchBugDetails();
  }, [bugId, projectId]);

  // ---------------- FETCH RELATED DATA ----------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, taskRes, sprintRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/users?size=100`, axiosConfig),
          axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/tasks`, axiosConfig),
          axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/sprints`, axiosConfig),
        ]);
        setUsers(usersRes.data.content || usersRes.data || []);
        setTasks(taskRes.data || []);
        setSprints(sprintRes.data || []);
      } catch (error) {
        console.error("Error fetching related data:", error);
      }
    };
    if (projectId) fetchData();
  }, [projectId]);

  // ---------------- HANDLE CHANGE ----------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ---------------- HANDLE SUBMIT ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        status: formData.status,
        severity: formData.severity,
        assignedTo: formData.assignedTo ? Number(formData.assignedTo) : null,
        reporter: formData.reporter ? Number(formData.reporter) : null,
        projectId: formData.projectId ? Number(formData.projectId) : null,
        sprintId: formData.sprintId ? Number(formData.sprintId) : null,
        epicId: formData.epicId ? Number(formData.epicId) : null,
        taskId: formData.taskId ? Number(formData.taskId) : null,
        stepsToReproduce: formData.stepsToReproduce,
        expectedResult: formData.expectedResult,
        actualResult: formData.actualResult,
        attachments:
          typeof formData.attachments === "string"
            ? formData.attachments
            : JSON.stringify(formData.attachments),
      };

      await axios.put(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/bugs/${bugId}`,
        payload,
        axiosConfig
      );
      toast.success("Bug updated successfully!");
      onUpdated?.();
      onClose?.();
    } catch (error) {
      console.error("Error updating bug:", error);
      toast.error("Failed to update bug.");
    } finally {
      setLoading(false);
    }
  };

  if (!formData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-2xl shadow-xl text-center text-gray-600">
          Loading bug details...
        </div>
      </div>
    );
  }

  // ---------------- FORM UI ----------------
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl relative max-h-[90vh] flex flex-col">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold text-indigo-800 mb-4 mt-6 px-8">
          Edit Bug
        </h2>

        <div className="px-8 pb-6 overflow-y-auto scrollbar-hide">
          <form onSubmit={handleSubmit} className="space-y-5">
            <FormInput
              label="Title *"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />

            <FormTextArea
              label="Description (Optional)"
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
                { label: "Resolved", value: "RESOLVED" },
                { label: "Closed", value: "CLOSED" },
                { label: "Reopened", value: "REOPENED" },
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

            <FormSelect
              label="Severity *"
              name="severity"
              value={formData.severity}
              onChange={handleChange}
              options={[
                { label: "Minor", value: "MINOR" },
                { label: "Major", value: "MAJOR" },
                { label: "Blocker", value: "BLOCKER" },
              ]}
            />

            <FormSelect
              label="Task (Optional)"
              name="taskId"
              value={formData.taskId || ""}
              onChange={handleChange}
              options={tasks.map((t) => ({ label: t.title, value: t.id }))}
            />

            <FormSelect
              label="Sprint (Optional)"
              name="sprintId"
              value={formData.sprintId || ""}
              onChange={handleChange}
              options={sprints.map((s) => ({ label: s.name, value: s.id }))}
            />

            <FormSelect
              label="Assignee (Optional)"
              name="assignedTo"
              value={formData.assignedTo || ""}
              onChange={handleChange}
              options={users.map((u) => ({
                label: u.name || u.username,
                value: u.id,
              }))}
            />

            <FormSelect
              label="Reporter (Optional)"
              name="reporter"
              value={formData.reporter || ""}
              onChange={handleChange}
              options={users.map((u) => ({
                label: u.name || u.username,
                value: u.id,
              }))}
            />

            <FormTextArea
              label="Steps to Reproduce (Optional)"
              name="stepsToReproduce"
              value={formData.stepsToReproduce}
              onChange={handleChange}
            />

            <FormTextArea
              label="Expected Result (Optional)"
              name="expectedResult"
              value={formData.expectedResult}
              onChange={handleChange}
            />

            <FormTextArea
              label="Actual Result (Optional)"
              name="actualResult"
              value={formData.actualResult}
              onChange={handleChange}
            />

            <FormInput
              label="Attachments (Optional - File path or URL)"
              name="attachments"
              value={formData.attachments || ""}
              onChange={handleChange}
            />

            <div className="flex justify-end gap-3 pt-4">
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
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update Bug"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditBugForm;
