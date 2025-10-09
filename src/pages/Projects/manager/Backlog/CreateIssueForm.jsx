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
  mode = "create",
  issueType: initialIssueType = "Epic",
  initialData = {},
  projectId: initialProjectId = null,
  ownerId: initialOwnerId = null, // reporter
  memberIds: initialMemberIds = [], // assignees
  onClose,
  onCreated,
}) => {
  const [issueType, setIssueType] = useState(initialIssueType);
  const [formData, setFormData] = useState({
    projectId: initialProjectId,
    reporterId: null,
    assigneeId: null,
  });
  const [projects, setProjects] = useState([]);
  const [epics, setEpics] = useState([]);
  const [stories, setStories] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [users, setUsers] = useState([]);

  const token = localStorage.getItem("token");
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` },
  };

  // Prefill form in edit mode
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        ...initialData,
        projectId: initialData.projectId || initialProjectId,
        reporterId: initialData.reporterId || null,
        assigneeId: initialData.assigneeId || null,
      });
    }
  }, [mode]);

  // Fetch projects, sprints, users
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, usersRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects`, axiosConfig),
          axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/users?size=100`, axiosConfig),
          //axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/sprints`, axiosConfig),
        ]);
        setProjects(projectsRes.data.content || projectsRes.data || []);
        setUsers(usersRes.data.content || usersRes.data || []);
        //setSprints(sprintsRes.data.content || sprintsRes.data || []);
      } catch (err) {
        console.error("Failed to load projects/sprints/users", err);
        toast.error("Failed to load projects, sprints, or users");
      }
    };
    fetchData();
  }, []);

  // Fetch Epics & Stories when project changes
  useEffect(() => {
    const pid = formData.projectId;
    if (pid) {
      axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${pid}/epics`, axiosConfig)
        .then((res) => setEpics(res.data));
      axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${pid}/stories`, axiosConfig)
        .then((res) => setStories(res.data));
      axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${pid}/sprints`, axiosConfig)
        .then((res) => setSprints(res.data));
    } else {
      setEpics([]);
      setStories([]);
      setSprints([]);
    }
  }, [formData.projectId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: [
        "storyPoints",
        "progressPercentage",
        "projectId",
        "epicId",
        "storyId",
        "sprintId",
        "reporterId",
        "assigneeId",
      ].includes(name)
        ? value !== "" ? Number(value) : null
        : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint =
      issueType === "Epic"
        ? "/api/epics"
        : issueType === "User Story"
        ? "/api/stories"
        : "/api/tasks";

    let payload = {};

    if (issueType === "Epic") {
      payload = {
        name: formData.name,
        description: formData.description || "",
        progressPercentage: formData.progressPercentage || 0,
        projectId: Number(formData.projectId),
        reporterId: Number(formData.reporterId),
        dueDate: formData.dueDate ? formData.dueDate + "T00:00:00" : null,
      };
    } else if (issueType === "User Story") {
      payload = {
        title: formData.title,
        description: formData.description || "",
        status: formData.status || "BACKLOG",
        priority: formData.priority || "MEDIUM",
        storyPoints: Number(formData.storyPoints || 0),
        acceptanceCriteria: formData.acceptanceCriteria || "",
        epicId: formData.epicId ? Number(formData.epicId) : null,
        reporterId: Number(formData.reporterId),
        assigneeId: formData.assigneeId ? Number(formData.assigneeId) : null,
        projectId: Number(formData.projectId),
        sprintId: formData.sprintId ? Number(formData.sprintId) : null,
      };
    } else if (issueType === "Task") {
      payload = {
        title: formData.title,
        description: formData.description || "",
        status: formData.status || "BACKLOG",
        priority: formData.priority || "MEDIUM",
        storyPoints: Number(formData.storyPoints || 0),
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        reporterId: Number(formData.reporterId),
        assigneeId: formData.assigneeId ? Number(formData.assigneeId) : null,
        storyId: Number(formData.storyId),
        sprintId: formData.sprintId ? Number(formData.sprintId) : null,
        projectId: Number(formData.projectId),
      };
    }

    try {
      if (mode === "edit") {
        await axios.put(`${import.meta.env.VITE_PMS_BASE_URL}${endpoint}/${formData.id}`, payload, axiosConfig);
        toast.success(`${issueType} updated successfully`);
      } else {
        await axios.post(`${import.meta.env.VITE_PMS_BASE_URL}${endpoint}`, payload, axiosConfig);
        toast.success(`${issueType} created successfully`);
      }
      setTimeout(() => {
        onCreated?.();
        onClose?.();
      }, 800);
    } catch (err) {
      console.error(err);
      toast.error(`Error ${mode === "edit" ? "updating" : "creating"} ${issueType}`);
    }
  };

  const selectedProject = projects.find((p) => p.id === formData.projectId);

  // Map users for reporter and assignee
  const reporterOptions = users
    .filter((u) => u.id === initialOwnerId)
    .map((u) => ({ label: u.name || u.username || `User ${u.id}`, value: u.id }));

  const assigneeOptions = users
    .filter((u) => initialMemberIds.includes(u.id))
    .map((u) => ({ label: u.name || u.username || `User ${u.id}`, value: u.id }));

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-lg relative">
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
      >
        <X size={20} />
      </button>

      <ToastContainer />
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {mode === "edit" ? `Edit ${issueType}` : `Create ${issueType}`}
      </h2>

      {mode === "create" && (
        <div className="mb-4">
          <FormSelect
            label="Issue Type"
            name="issueType"
            value={issueType}
            onChange={(e) => {
              setIssueType(e.target.value);
              setFormData({
                projectId: initialProjectId,
                reporterId: null,
                assigneeId: null,
              });
            }}
            options={[
              { label: "Epic", value: "Epic" },
              { label: "User Story", value: "User Story" },
              { label: "Task", value: "Task" },
            ]}
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project (Read-only) */}
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Project *</label>
          <input
            type="text"
            value={selectedProject ? selectedProject.name : ""}
            readOnly
            className="w-full border rounded-lg px-3 py-2 bg-gray-100 cursor-not-allowed"
          />
        </div>

        {/* Epic Form */}
        {issueType === "Epic" && (
          <>
            <FormInput label="Name *" name="name" value={formData.name || ""} onChange={handleChange} required />
            <FormTextArea label="Description (Optional)" name="description" value={formData.description || ""} onChange={handleChange} />
            <FormSelect label="Reporter *" name="reporterId" value={formData.reporterId || ""} onChange={handleChange} options={reporterOptions} required />
            <FormInput label="Progress (%) (Optional)" name="progressPercentage" type="number" value={formData.progressPercentage || ""} onChange={handleChange} />
            <FormDatePicker label="Due Date (Optional)" name="dueDate" value={formData.dueDate || ""} onChange={handleChange} />
          </>
        )}

        {/* User Story Form */}
        {issueType === "User Story" && (
          <>
            <FormInput label="Title *" name="title" value={formData.title || ""} onChange={handleChange} required />
            <FormTextArea label="Description (Optional)" name="description" value={formData.description || ""} onChange={handleChange} />
            <FormSelect
              label="Status *"
              name="status"
              value={formData.status || "BACKLOG"}
              onChange={handleChange}
              options={[
                { label: "Backlog", value: "BACKLOG" },
                { label: "To Do", value: "TODO" },
                { label: "In Progress", value: "IN_PROGRESS" },
                { label: "Done", value: "DONE" },
              ]}
              required
            />
            <FormSelect
              label="Priority *"
              name="priority"
              value={formData.priority || "MEDIUM"}
              onChange={handleChange}
              options={[
                { label: "Low", value: "LOW" },
                { label: "Medium", value: "MEDIUM" },
                { label: "High", value: "HIGH" },
                { label: "Critical", value: "CRITICAL" },
              ]}
              required
            />
            <FormInput label="Story Points (Optional)" name="storyPoints" type="number" value={formData.storyPoints || ""} onChange={handleChange} />
            <FormTextArea label="Acceptance Criteria (Optional)" name="acceptanceCriteria" value={formData.acceptanceCriteria || ""} onChange={handleChange} />
            <FormSelect label="Epic (Optional)" name="epicId" value={formData.epicId || ""} onChange={handleChange} options={epics.map((e) => ({ label: e.name, value: e.id }))} />
            <FormSelect label="Sprint (Optional)" name="sprintId" value={formData.sprintId || ""} onChange={handleChange} options={sprints.map((s) => ({ label: s.name, value: s.id }))} />
            <FormSelect label="Reporter *" name="reporterId" value={formData.reporterId || ""} onChange={handleChange} options={reporterOptions} required />
            <FormSelect label="Assignee (Optional)" name="assigneeId" value={formData.assigneeId || ""} onChange={handleChange} options={assigneeOptions} />
          </>
        )}

        {/* Task Form */}
        {issueType === "Task" && (
          <>
            <FormInput label="Title *" name="title" value={formData.title || ""} onChange={handleChange} required />
            <FormTextArea label="Description (Optional)" name="description" value={formData.description || ""} onChange={handleChange} />
            <FormSelect
              label="Status *"
              name="status"
              value={formData.status || "BACKLOG"}
              onChange={handleChange}
              options={[
                { label: "Backlog", value: "BACKLOG" },
                { label: "To Do", value: "TODO" },
                { label: "In Progress", value: "IN_PROGRESS" },
                { label: "Done", value: "DONE" },
              ]}
              required
            />
            <FormSelect
              label="Priority *"
              name="priority"
              value={formData.priority || "MEDIUM"}
              onChange={handleChange}
              options={[
                { label: "Low", value: "LOW" },
                { label: "Medium", value: "MEDIUM" },
                { label: "High", value: "HIGH" },
                { label: "Critical", value: "CRITICAL" },
              ]}
              required
            />
            <FormInput label="Story Points (Optional)" name="storyPoints" type="number" value={formData.storyPoints || ""} onChange={handleChange} />
            <FormDatePicker label="Due Date (Optional)" name="dueDate" value={formData.dueDate || ""} onChange={handleChange} />
            <FormSelect label="Story *" name="storyId" value={formData.storyId || ""} onChange={handleChange} options={stories.map((s) => ({ label: s.title, value: s.id }))} required />
            <FormSelect label="Sprint (Optional)" name="sprintId" value={formData.sprintId || ""} onChange={handleChange} options={sprints.map((s) => ({ label: s.name, value: s.id }))} />
            <FormSelect label="Reporter *" name="reporterId" value={formData.reporterId || ""} onChange={handleChange} options={reporterOptions} required />
            <FormSelect label="Assignee (Optional)" name="assigneeId" value={formData.assigneeId || ""} onChange={handleChange} options={assigneeOptions} />
          </>
        )}

        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            {mode === "edit" ? "Update" : "Create"} {issueType}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateIssueForm;
