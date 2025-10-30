import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { X } from "lucide-react";

import FormInput from "../../../../components/forms/FormInput";
import FormDatePicker from "../../../../components/forms/FormDatePicker";
import FormSelect from "../../../../components/forms/FormSelect";
import FormTextArea from "../../../../components/forms/FormTextArea";

const CreateIssueForm = ({
  issueType: initialIssueType = "Epic",
  initialData = {},
  projectId: initialProjectId = null,
  ownerId: initialOwnerId = null,
  memberIds: initialMemberIds = [],
  onClose,
  onCreated,
}) => {
  const [issueType, setIssueType] = useState(initialIssueType);
  const [formData, setFormData] = useState({
    projectId: initialProjectId,
    ...initialData, // removed reporterId & assigneeId defaults
  });

  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [epics, setEpics] = useState([]);
  const [stories, setStories] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  };

  // ---------- Fetch Projects & Users ----------
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [projectsRes, usersRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects`, axiosConfig),
          axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/users?size=100`, axiosConfig),
        ]);
        setProjects(projectsRes.data.content || projectsRes.data || []);
        setUsers(usersRes.data.content || usersRes.data || []);
      } catch (error) {
        console.error("Error fetching projects/users:", error);
        toast.error("Failed to load projects or users.");
      }
    };
    fetchInitialData();
  }, []);

  // ---------- Fetch Dependent Data ----------
  useEffect(() => {
    const loadProjectData = async () => {
      if (!formData.projectId) {
        setEpics([]);
        setStories([]);
        setTasks([]);
        setSprints([]);
        return;
      }

      setLoading(true);
      try {
        const [epicRes, storyRes, taskRes, sprintRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${formData.projectId}/epics`, axiosConfig),
          axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${formData.projectId}/stories`, axiosConfig),
          axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${formData.projectId}/tasks`, axiosConfig),
          axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${formData.projectId}/sprints`, axiosConfig),
        ]);
        setEpics(epicRes.data || []);
        setStories(storyRes.data || []);
        setTasks(taskRes.data || []);
        setSprints(sprintRes.data || []);
      } catch (error) {
        console.error("Error fetching project data:", error);
        toast.error("Failed to load project-related data.");
      } finally {
        setLoading(false);
      }
    };
    loadProjectData();
  }, [formData.projectId]);

  // ---------- Handle Change ----------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["projectId", "epicId", "storyId", "sprintId", "reporterId", "assigneeId", "taskId"].includes(name)
        ? value ? Number(value) : null
        : value,
    }));
  };

  // ---------- Handle Submit ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    let endpoint = "/api/tasks";
    let payload = {};

    if (issueType === "Epic") {
      endpoint = "/api/epics";
      payload = {
        name: formData.name,
        description: formData.description || "",
        progressPercentage: Number(formData.progressPercentage || 0),
        projectId: Number(formData.projectId),
        reporterId: formData.reporterId ? Number(formData.reporterId) : null,
        dueDate: formData.dueDate ? `${formData.dueDate}T00:00:00` : null,
      };
    }

    if (issueType === "Story") {
      endpoint = "/api/stories";
      payload = {
        title: formData.title,
        description: formData.description || "",
        priority: formData.priority || "MEDIUM",
        status: formData.status || "BACKLOG",
        assigneeId: formData.assigneeId ? Number(formData.assigneeId) : null,
        reporterId: formData.reporterId ? Number(formData.reporterId) : null,
        projectId: Number(formData.projectId),
        sprintId: formData.sprintId || null,
        epicId: formData.epicId || null,
        storyPoints: formData.storyPoints ? Number(formData.storyPoints) : null,
        acceptanceCriteria: formData.acceptanceCriteria || "",
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
      };
    }

    if (issueType === "Task") {
      endpoint = "/api/tasks";
      payload = {
        title: formData.title,
        description: formData.description || "",
        priority: formData.priority || "MEDIUM",
        status: formData.status || "BACKLOG",
        projectId: Number(formData.projectId),
        reporterId: formData.reporterId ? Number(formData.reporterId) : null,
        assigneeId: formData.assigneeId ? Number(formData.assigneeId) : null,
        storyId: formData.storyId || null,
        sprintId: formData.sprintId || null,
        epicId: formData.epicId || null,
        estimatedHours: formData.estimatedHours ? Number(formData.estimatedHours) : null,
        actualHours: formData.actualHours ? Number(formData.actualHours) : null,
      };
    }

    if (issueType === "Bug") {
      endpoint = "/api/bugs";
      payload = {
        title: formData.title,
        description: formData.description || "",
        priority: formData.priority || "MEDIUM",
        status: formData.status || "OPEN",
        severity: formData.severity || "MINOR",
        reporter: formData.reporterId ? Number(formData.reporterId) : null,
        assignedTo: formData.assigneeId ? Number(formData.assigneeId) : null,
        projectId: Number(formData.projectId),
        sprintId: formData.sprintId || null,
        epicId: formData.epicId || null,
        taskId: formData.taskId || null,
        stepsToReproduce: formData.stepsToReproduce || "",
        expectedResult: formData.expectedResult || "",
        actualResult: formData.actualResult || "",
      };
    }

    try {
      await axios.post(`${import.meta.env.VITE_PMS_BASE_URL}${endpoint}`, payload, axiosConfig);
      toast.success(`${issueType} created successfully!`);
      setTimeout(() => {
        onCreated?.();
        onClose?.();
      }, 800);
    } catch (error) {
      console.error("Error creating issue:", error);
      toast.error(`Failed to create ${issueType}.`);
    }
  };

  const selectedProject = projects.find((p) => p.id === formData.projectId);

  // ---------- Render ----------
  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-lg relative">
      <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
        <X size={20} />
      </button>

      <ToastContainer />
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Create {issueType}
      </h2>

      {loading && <p className="text-sm text-gray-500 mb-3">Loading project data...</p>}

      <FormSelect
        label="Issue Type"
        name="issueType"
        value={issueType}
        onChange={(e) => {
          setIssueType(e.target.value);
          setFormData({
            projectId: initialProjectId, // reset without prefilling assignee/reporter
          });
        }}
        options={[
          { label: "Epic", value: "Epic" },
          { label: "Story", value: "Story" },
          { label: "Task", value: "Task" },
          { label: "Bug", value: "Bug" },
        ]}
      />

      <form onSubmit={handleSubmit} className="space-y-6 mt-4">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Project *</label>
          <input
            type="text"
            value={selectedProject ? selectedProject.name : ""}
            readOnly
            className="w-full border rounded-lg px-3 py-2 bg-gray-100 cursor-not-allowed"
          />
        </div>

        {/* Conditional forms */}
        {issueType === "Epic" && (
          <>
            <FormInput label="Epic Name *" name="name" value={formData.name || ""} onChange={handleChange} required />
            <FormTextArea label="Description" name="description" value={formData.description || ""} onChange={handleChange} />
            <FormInput label="Progress (%)" name="progressPercentage" type="number" value={formData.progressPercentage || ""} onChange={handleChange} />
            <FormDatePicker label="Due Date" name="dueDate" value={formData.dueDate || ""} onChange={handleChange} />
          </>
        )}

        {issueType === "Story" && (
          <>
            <FormInput label="Title *" name="title" value={formData.title || ""} onChange={handleChange} required />
            <FormTextArea label="Description" name="description" value={formData.description || ""} onChange={handleChange} />
            <FormSelect label="Epic" name="epicId" value={formData.epicId || ""} onChange={handleChange} options={epics.map(e => ({ label: e.name, value: e.id }))} />
            <FormSelect label="Priority *" name="priority" value={formData.priority || "MEDIUM"} onChange={handleChange} options={[
              { label: "Low", value: "LOW" },
              { label: "Medium", value: "MEDIUM" },
              { label: "High", value: "HIGH" },
              { label: "Critical", value: "CRITICAL" },
            ]} />
            <FormSelect label="Status *" name="status" value={formData.status || "BACKLOG"} onChange={handleChange} options={[
              { label: "Backlog", value: "BACKLOG" },
              { label: "To Do", value: "TODO" },
              { label: "In Progress", value: "IN_PROGRESS" },
              { label: "Done", value: "DONE" },
            ]} />
            <FormInput label="Story Points" name="storyPoints" type="number" value={formData.storyPoints || ""} onChange={handleChange} />
            <FormTextArea label="Acceptance Criteria" name="acceptanceCriteria" value={formData.acceptanceCriteria || ""} onChange={handleChange} />
            <FormSelect label="Sprint" name="sprintId" value={formData.sprintId || ""} onChange={handleChange} options={sprints.map(s => ({ label: s.name, value: s.id }))} />
            <FormSelect label="Assignee" name="assigneeId" value={formData.assigneeId || ""} onChange={handleChange} options={users.map(u => ({ label: u.name, value: u.id }))} />
            <FormSelect label="Reporter" name="reporterId" value={formData.reporterId || ""} onChange={handleChange} options={users.map(u => ({ label: u.name, value: u.id }))} />
          </>
        )}

        {issueType === "Task" && (
          <>
            <FormInput label="Title *" name="title" value={formData.title || ""} onChange={handleChange} required />
            <FormTextArea label="Description" name="description" value={formData.description || ""} onChange={handleChange} />
            <FormSelect label="Story *" name="storyId" value={formData.storyId || ""} onChange={handleChange} options={stories.map(s => ({ label: s.title, value: s.id }))} />
            <FormSelect label="Priority *" name="priority" value={formData.priority || "MEDIUM"} onChange={handleChange} options={[
              { label: "Low", value: "LOW" },
              { label: "Medium", value: "MEDIUM" },
              { label: "High", value: "HIGH" },
              { label: "Critical", value: "CRITICAL" },
            ]} />
            <FormSelect label="Status *" name="status" value={formData.status || "BACKLOG"} onChange={handleChange} options={[
              { label: "Backlog", value: "BACKLOG" },
              { label: "To Do", value: "TODO" },
              { label: "In Progress", value: "IN_PROGRESS" },
              { label: "Done", value: "DONE" },
            ]} />
            <FormSelect label="Sprint" name="sprintId" value={formData.sprintId || ""} onChange={handleChange} options={sprints.map(s => ({ label: s.name, value: s.id }))} />
            <FormSelect label="Assignee" name="assigneeId" value={formData.assigneeId || ""} onChange={handleChange} options={users.map(u => ({ label: u.name, value: u.id }))} />
            <FormSelect label="Reporter" name="reporterId" value={formData.reporterId || ""} onChange={handleChange} options={users.map(u => ({ label: u.name, value: u.id }))} />
          </>
        )}

        {issueType === "Bug" && (
          <>
            <FormInput label="Title *" name="title" value={formData.title || ""} onChange={handleChange} required />
            <FormTextArea label="Description" name="description" value={formData.description || ""} onChange={handleChange} />
            <FormSelect label="Status *" name="status" value={formData.status || "OPEN"} onChange={handleChange} options={[
              { label: "Open", value: "OPEN" },
              { label: "In Progress", value: "IN_PROGRESS" },
              { label: "Resolved", value: "RESOLVED" },
              { label: "Closed", value: "CLOSED" },
              { label: "Reopened", value: "REOPENED" },
            ]} />
            <FormSelect label="Priority *" name="priority" value={formData.priority || "MEDIUM"} onChange={handleChange} options={[
              { label: "Low", value: "LOW" },
              { label: "Medium", value: "MEDIUM" },
              { label: "High", value: "HIGH" },
              { label: "Critical", value: "CRITICAL" },
            ]} />
            <FormSelect label="Severity *" name="severity" value={formData.severity || "MINOR"} onChange={handleChange} options={[
              { label: "Minor", value: "MINOR" },
              { label: "Major", value: "MAJOR" },
              { label: "Blocker", value: "BLOCKER" },
            ]} />
            <FormSelect label="Task" name="taskId" value={formData.taskId || ""} onChange={handleChange} options={tasks.map(t => ({ label: t.title, value: t.id }))} />
            <FormSelect label="Sprint" name="sprintId" value={formData.sprintId || ""} onChange={handleChange} options={sprints.map(s => ({ label: s.name, value: s.id }))} />
            <FormSelect label="Assignee" name="assigneeId" value={formData.assigneeId || ""} onChange={handleChange} options={users.map(u => ({ label: u.name, value: u.id }))} />
            <FormSelect label="Reporter" name="reporterId" value={formData.reporterId || ""} onChange={handleChange} options={users.map(u => ({ label: u.name, value: u.id }))} />
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loading ? "Creating..." : `Create ${issueType}`}
        </button>
      </form>
    </div>
  );
};

export default CreateIssueForm;
