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
    ...initialData,
  });

  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [epics, setEpics] = useState([]);
  const [stories, setStories] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStorySprint, setSelectedStorySprint] = useState(null);

  const token = localStorage.getItem("token");
  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  // Helper: normalize numeric/id inputs -> Number or null
  const normalizeIdValue = (val) => {
    if (val === undefined || val === null || val === "") return null;
    const n = Number(val);
    return Number.isNaN(n) ? null : n;
  };

  // ---------- Fetch Projects & Users ----------
  useEffect(() => {
    const pid = initialProjectId;
    const fetchInitialData = async () => {
      try {
        const [projectsRes, usersRes] = await Promise.all([
          axios.get(
            `${import.meta.env.VITE_PMS_BASE_URL}/api/projects`,
            axiosConfig
          ),
          axios.get(
            `${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${pid}/members-with-owner`,
            axiosConfig
          ),
        ]);

        setProjects(projectsRes.data.content || projectsRes.data || []);
        setUsers(usersRes.data.content || usersRes.data || []);
      } catch (error) {
        console.error("Error fetching projects/users:", error);
        toast.error("Failed to load projects or users.");
      }
    };
    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Fetch Dependent Data ----------
  useEffect(() => {
    const loadProjectData = async () => {
      if (!formData.projectId) {
        setEpics([]);
        setStories([]);
        setTasks([]);
        setSprints([]);
        setStatuses([]);
        return;
      }

      setLoading(true);
      try {
        const [epicRes, storyRes, taskRes, sprintRes] = await Promise.all([
          axios.get(
            `${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${formData.projectId}/epics`,
            axiosConfig
          ),
          axios.get(
            `${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${formData.projectId}/stories`,
            axiosConfig
          ),
          axios.get(
            `${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${formData.projectId}/tasks`,
            axiosConfig
          ),
          axios.get(
            `${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${formData.projectId}/sprints`,
            axiosConfig
          ),
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

  // ---------- Fetch statuses (required for Story & Task) ----------
  useEffect(() => {
    const fetchStatuses = async () => {
      if (!formData.projectId) {
        setStatuses([]);
        return;
      }
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${formData.projectId}/statuses`,
          axiosConfig
        );
        // Expecting array of { id, name, sortOrder }
        setStatuses(res.data || []);
      } catch (error) {
        console.error("Error fetching statuses:", error);
        toast.error("Failed to load statuses.");
      }
    };
    fetchStatuses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.projectId]);

  // ---------- Handle story selection effect to capture sprint (if story has sprint object) ----------
  useEffect(() => {
    if (!formData.storyId) {
      setSelectedStorySprint(null);
      return;
    }
    const s = stories.find((st) => st.id === Number(formData.storyId));
    if (s) {
      // story might have sprint object or sprintId field, handle both
      const sprintIdFromStory = s.sprint?.id ?? s.sprintId ?? null;
      setSelectedStorySprint(sprintIdFromStory ? Number(sprintIdFromStory) : null);
    } else {
      setSelectedStorySprint(null);
    }
  }, [formData.storyId, stories]);

  // ---------- Handle Change ----------
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target ?? {};
    // Special: some custom components may call onChange with (name, value) - support that if needed
    if (typeof name === "undefined" && Array.isArray(e)) {
      // ignore; not used here
    }

    setFormData((prev) => {
      const updated = { ...prev };

      // boolean for checkbox/select representing billable
      if (name === "isBillable") {
        updated[name] = value === "true" || value === true || checked === true;
        return updated;
      }

      // IDs that must be numeric or null
      const idFields = ["projectId", "epicId", "storyId", "sprintId", "reporterId", "assigneeId", "statusId"];

      if (idFields.includes(name)) {
        updated[name] = normalizeIdValue(value);
        // If story changed, and story has a sprint, set sprintId to story's sprint if not explicitly chosen
        if (name === "storyId") {
          const selectedStory = stories.find((s) => s.id === Number(value));
          const sprintFromStory = selectedStory ? (selectedStory.sprint?.id ?? selectedStory.sprintId ?? null) : null;
          updated.sprintId = sprintFromStory;
        }
      } else {
        // default: string fields (title, description, priority, acceptanceCriteria, etc.)
        updated[name] = value;
      }

      return updated;
    });
  };

  // ---------- Handle Submit ----------
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation: require projectId and statusId and title for Task/Story
    if (!formData.projectId) {
      toast.error("Project is required.");
      return;
    }

    let endpoint = "/api/tasks";
    let payload = {};

    // EPIC payload (kept as before)
    if (issueType === "Epic") {
      endpoint = "/api/epics";
      payload = {
        name: formData.name,
        description: formData.description || null,
        statusId: Number(formData.statusId),

        priority: formData.priority || "MEDIUM",
        projectId: Number(formData.projectId),
        reporterId: normalizeIdValue(formData.reporterId),
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
      };
    }

    // STORY payload (must include statusId, projectId, title)
    if (issueType === "Story") {
      if (!formData.title) {
        toast.error("Title is required for Story.");
        return;
      }
      if (!formData.statusId) {
        toast.error("Status is required for Story.");
        return;
      }

      endpoint = "/api/stories";
      payload = {
        title: formData.title,
        description: formData.description || null,
        acceptanceCriteria: formData.acceptanceCriteria || null,
        storyPoints: formData.storyPoints ? Number(formData.storyPoints) : 0,
        assigneeId: normalizeIdValue(formData.assigneeId),
        reporterId: normalizeIdValue(formData.reporterId),
        projectId: Number(formData.projectId),
        epicId: normalizeIdValue(formData.epicId),
        sprintId: normalizeIdValue(formData.sprintId),
        statusId: Number(formData.statusId),
        priority: formData.priority || "LOW",
        startDate: formData.startDate? `${formData.startDate}T00:00:00` :null,
        dueDate: formData.dueDate ? `${formData.dueDate}T00:00:00` : null
      };
    }
    // EPIC payload (must include name/title, projectId, statusId)
if (issueType === "Epic") {
  if (!formData.name) {
    toast.error("Epic Name is required.");
    return;
  }
  if (!formData.statusId) {
    toast.error("Status is required for Epic.");
    return;
  }
  if (!formData.projectId) {
    toast.error("Project is required for Epic.");
    return;
  }

  endpoint = "/api/epics";
  payload = {
    name: formData.name,
    description: formData.description || null,
    statusId: Number(formData.statusId),
    priority: formData.priority || "MEDIUM",
    projectId: Number(formData.projectId),
    reporterId: normalizeIdValue(formData.reporterId),
    assigneeId: normalizeIdValue(formData.assigneeId),
    startDate: formData.startDate,
    dueDate: formData.dueDate
      ? new Date(formData.dueDate).toISOString()
      : null,
  };
}




    // TASK payload (must include statusId, projectId, title)
    if (issueType === "Task") {
      if (!formData.title) {
        toast.error("Title is required for Task.");
        return;
      }
      if (!formData.statusId) {
        toast.error("Status is required for Task.");
        return;
      }

      endpoint = "/api/tasks";
      payload = {
        title: formData.title,
        description: formData.description || null,
        statusId: Number(formData.statusId),
        priority: formData.priority || "LOW",
        storyPoints: formData.storyPoints ? Number(formData.storyPoints) : 0,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        projectId: Number(formData.projectId),
        reporterId: normalizeIdValue(formData.reporterId),
        storyId: normalizeIdValue(formData.storyId),
        assigneeId: normalizeIdValue(formData.assigneeId),
        sprintId: normalizeIdValue(formData.sprintId) ?? normalizeIdValue(selectedStorySprint),
        billable: !!formData.isBillable,
      };
    }

    // BUG payload (kept largely as before; status here uses string names in original)
    if (issueType === "Bug") {
      endpoint = "/api/bugs";
      payload = {
        title: formData.title,
        description: formData.description || null,
        priority: formData.priority || "MEDIUM",
        status: formData.status || "Open",
        severity: formData.severity || "MINOR",
        type: formData.type || null,
        reporter: normalizeIdValue(formData.reporterId),
        assignedTo: normalizeIdValue(formData.assigneeId),
        projectId: Number(formData.projectId),
        sprintId: normalizeIdValue(formData.sprintId),
        epicId: normalizeIdValue(formData.epicId),
        taskId: normalizeIdValue(formData.taskId),
        stepsToReproduce: formData.stepsToReproduce || null,
        expectedResult: formData.expectedResult || null,
        actualResult: formData.actualResult || null,
        attachments: formData.attachments || null,
      };
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_PMS_BASE_URL}${endpoint}`,
        payload,
        axiosConfig
      );
      toast.success(`${issueType} created successfully!`);
      // keep a small delay for UX then call callbacks
      setTimeout(() => {
        onCreated?.();
        onClose?.();
      }, 600);
    } catch (error) {
      console.error("Error creating issue:", error);
      toast.error(
        error.response?.data?.message ||
          `Failed to create ${issueType}. Please try again`
      );
    }
  };

  const selectedProject = projects.find((p) => p.id === formData.projectId);
  const today = new Date().toISOString().split("T")[0];

  // ---------- Render ----------
  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-lg relative">
      <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
       
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
          // reset only the fields that should be cleared when switching type
          setIssueType(e.target.value);
          setFormData({ projectId: initialProjectId });
        }}
        options={[
          { label: "Epic", value: "Epic" },
          { label: "Story", value: "Story" },
          { label: "Task", value: "Task" },
          { label: "Bug", value: "Bug" },
        ]}
      />

      <form onSubmit={handleSubmit} className="space-y-6 mt-4">
        {/* Project */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Project *
          </label>
          <input
            type="text"
            value={selectedProject ? selectedProject.name : ""}
            readOnly
            className="w-full border rounded-lg px-3 py-2 bg-gray-100 cursor-not-allowed"
          />
        </div>

        {/* ---------- Epic ---------- */}
        {issueType === "Epic" && (
          <>
            <FormInput
              label="Epic Name *"
              name="name"
              value={formData.name || ""}
              onChange={handleChange}
              required
            />

            <FormTextArea
              label="Description"
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
            />

            {/* ENUM Status */}
            <FormSelect
  label="Status *"
  name="statusId"
  value={formData.statusId ?? ""}
  onChange={handleChange}
  options={statuses.map((s) => ({ label: s.name, value: s.id }))}
  required
/>


            <FormSelect
              label="Priority"
              name="priority"
              value={formData.priority || "MEDIUM"}
              onChange={handleChange}
              options={[
                { label: "Low", value: "LOW" },
                { label: "Medium", value: "MEDIUM" },
                { label: "High", value: "HIGH" },
                { label: "Critical", value: "CRITICAL" },
              ]}
            />
             <FormDatePicker
              label="Start Date"
              name="startDate"
              value={formData.startDate || ""}
              onChange={handleChange}
              min={today}
            />
            <FormDatePicker
              label="Due Date"
              name="dueDate"
              value={formData.dueDate || ""}
              onChange={handleChange}
              min={today}
            />
          </>
        )}

        {/* ---------- Story ---------- */}
        {issueType === "Story" && (
          <>
            <FormInput label="Title *" name="title" value={formData.title || ""} onChange={handleChange} required />
            <FormTextArea label="Description" name="description" value={formData.description || ""} onChange={handleChange} />
            <FormTextArea label="Acceptance Criteria" name="acceptanceCriteria" value={formData.acceptanceCriteria || ""} onChange={handleChange} />
            <FormInput label="Story Points" name="storyPoints" type="number" value={formData.storyPoints || ""} onChange={handleChange} />

            <FormSelect
              label="Status *"
              name="statusId"
              value={formData.statusId ?? ""}
              onChange={handleChange}
              options={statuses.map((s) => ({ label: s.name, value: s.id }))}
            />

            <FormSelect
              label="Priority"
              name="priority"
              value={formData.priority || "LOW"}
              onChange={handleChange}
              options={[
                { label: "Low", value: "LOW" },
                { label: "Medium", value: "MEDIUM" },
                { label: "High", value: "HIGH" },
                { label: "Critical", value: "CRITICAL" },
              ]}
            />

            <FormDatePicker
              label="Start Date"
              name="startDate"
              value={formData.startDate || ""}
              onChange={handleChange}
              min={today}
            />

            <FormDatePicker
              label="Due Date"
              name="dueDate"
              value={formData.dueDate || ""}
              onChange={handleChange}
              min={today}
            />

            <FormSelect label="Epic" name="epicId" value={formData.epicId ?? ""} onChange={handleChange} options={epics.map(e => ({ label: e.name, value: e.id }))} />
            <FormSelect label="Sprint" name="sprintId" value={formData.sprintId ?? ""} onChange={handleChange} options={sprints.map(s => ({ label: s.name, value: s.id }))} />
            <FormSelect label="Assignee" name="assigneeId" value={formData.assigneeId ?? ""} onChange={handleChange} options={users.map(u => ({ label: u.name, value: u.id }))} />
            <FormSelect label="Reporter *" name="reporterId" value={formData.reporterId ?? ""} onChange={handleChange} options={users.map(u => ({ label: u.name, value: u.id }))} />
          </>
        )}

        {/* ---------- Task ---------- */}
        {issueType === "Task" && (
          <>
            <FormInput label="Title *" name="title" value={formData.title || ""} onChange={handleChange} required />
            <FormTextArea label="Description" name="description" value={formData.description || ""} onChange={handleChange} />

            <FormSelect label="Story" name="storyId" value={formData.storyId ?? ""} onChange={handleChange} options={stories.map(s => ({ label: s.title, value: s.id }))} />

            <FormSelect
              label="Status *"
              name="statusId"
              value={formData.statusId ?? ""}
              onChange={handleChange}
              options={statuses.map((s) => ({ label: s.name, value: s.id }))}
            />

            <FormSelect
              label="Priority"
              name="priority"
              value={formData.priority || "MEDIUM"}
              onChange={handleChange}
              options={[
                { label: "Low", value: "LOW" },
                { label: "Medium", value: "MEDIUM" },
                { label: "High", value: "HIGH" },
                { label: "Critical", value: "CRITICAL" },
              ]}
            />


            <FormSelect label="Sprint" name="sprintId" value={formData.sprintId ?? ""} onChange={handleChange} options={sprints.map(s => ({ label: s.name, value: s.id }))} />
            <FormSelect label="Assignee" name="assigneeId" value={formData.assigneeId ?? ""} onChange={handleChange} options={users.map(u => ({ label: u.name, value: u.id }))} />
            <FormSelect label="Reporter *" name="reporterId" value={formData.reporterId ?? ""} onChange={handleChange} options={users.map(u => ({ label: u.name, value: u.id }))} />
             <FormDatePicker
              label="Due Date"
              name="dueDate"
              value={formData.dueDate || ""}
              onChange={handleChange}
              min={today}
            />

            <FormSelect
              label="Billable"
              name="isBillable"
              value={String(!!formData.isBillable)}
              onChange={handleChange}
              options={[
                { label: "Yes", value: "true" },
                { label: "No", value: "false" },
              ]}
            />
          </>
        )}

        {/* ---------- Bug ---------- */}
        {issueType === "Bug" && (
          <>
            <FormInput
              label="Title *"
              name="title"
              value={formData.title || ""}
              onChange={handleChange}
              required
            />

            {/* ENUM Status (unchanged) */}
            <FormSelect
              label="Status *"
              name="status"
              value={formData.status || "OPEN"}
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
              value={formData.priority || "MEDIUM"}
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
              value={formData.severity || "MINOR"}
              onChange={handleChange}
              options={[
                { label: "Minor", value: "MINOR" },
                { label: "Major", value: "MAJOR" },
                { label: "Blocker", value: "BLOCKER" },
              ]}
            />
            <FormInput label="Type" name="type" value={formData.type || ""} onChange={handleChange} placeholder="e.g. UI Bug, Functional Bug, Performance Issue" />
            <FormSelect label="Task" name="taskId" value={formData.taskId ?? ""} onChange={handleChange} options={tasks.map(t => ({ label: t.title, value: t.id }))} />
            <FormSelect label="Sprint" name="sprintId" value={formData.sprintId ?? ""} onChange={handleChange} options={sprints.map(s => ({ label: s.name, value: s.id }))} />
            <FormSelect label="Epic" name="epicId" value={formData.epicId ?? ""} onChange={handleChange} options={epics.map(e => ({ label: e.name, value: e.id }))} />
            <FormSelect label="Assignee" name="assigneeId" value={formData.assigneeId ?? ""} onChange={handleChange} options={users.map(u => ({ label: u.name, value: u.id }))} />
            <FormSelect label="Reporter *" name="reporterId" value={formData.reporterId ?? ""} onChange={handleChange} options={users.map(u => ({ label: u.name, value: u.id }))} />
            <FormTextArea label="Steps to Reproduce" name="stepsToReproduce" value={formData.stepsToReproduce || ""} onChange={handleChange} placeholder="Step-by-step instructions to reproduce the bug" />
            <FormTextArea label="Expected Result" name="expectedResult" value={formData.expectedResult || ""} onChange={handleChange} />
            <FormTextArea label="Actual Result" name="actualResult" value={formData.actualResult || ""} onChange={handleChange} />
            <FormInput label="Attachments" name="attachments" value={formData.attachments || ""} onChange={handleChange} placeholder="Paste file URL or path" />
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loading ? "loading..." : `Create ${issueType}`}
        </button>
      </form>
    </div>
  );
};

export default CreateIssueForm;
