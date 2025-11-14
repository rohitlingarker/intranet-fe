import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
  const [statusList, setStatusList] = useState([]); // ✅ NEW (for status master)
  const [loading, setLoading] = useState(false);
  const [selectedStorySprint, setSelectedStorySprint] = useState(null);
 
  const token = localStorage.getItem("token");
  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  // ---------------------------
  // Fetch Status Master
  // ---------------------------
  useEffect(() => {
    const pid = initialProjectId;
    const fetchStatuses = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${pid}/statuses`,
          axiosConfig
        );
        setStatusList(res.data || []);
      } catch (err) {
        console.error("Error fetching statuses", err);
      }
    };
    fetchStatuses();
  }, []);

  // ---------------------------
  // Story → auto-select sprint
  // ---------------------------
  const handleStoryChange = (storyId) => {
    const story = stories.find((s) => s.id === storyId);
    if (story && story.sprint) {
      setSelectedStorySprint(story.sprint.id);
    } else {
      setSelectedStorySprint(null);
    }
  };

  // ---------------------------
  // Fetch Projects & Users
  // ---------------------------
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
  }, []);

  // ---------------------------
  // Fetch epics, stories, tasks, sprints
  // ---------------------------
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

  // ---------------------------
  // Handle Form Change
  // ---------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
 
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]:
          [
            "projectId",
            "epicId",
            "storyId",
            "sprintId",
            "reporterId",
            "assigneeId",
            "statusId",
          ].includes(name) // ✅ added statusId
            ? value
              ? Number(value)
              : null
            : name === "isBillable"
            ? value === "true"
            : value,
      };
 
      if (name === "storyId" && value) {
        const selectedStory = stories.find((s) => s.id === Number(value));
        updated.sprintId = selectedStory ? selectedStory.sprintId || null : null;
      }
 
      return updated;
    });
  };

  // ---------------------------
  // Handle Submit
  // ---------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    let endpoint = "";
    let payload = {};

    // ---------------------------
    // EPIC (uses ENUM)
    // ---------------------------
    if (issueType === "Epic") {
      endpoint = "/api/epics";
      payload = {
        name: formData.name,
        description: formData.description || "",
        status: formData.status || "OPEN",
        priority: formData.priority || "MEDIUM",
        // progressPercentage: Number(formData.progressPercentage || 0),
        projectId: Number(formData.projectId),
        reporterId: formData.reporterId || null,
        dueDate: formData.dueDate ? `${formData.dueDate}T00:00:00` : null,
      };
    }

    // ---------------------------
    // STORY (uses statusId)
    // ---------------------------
    if (issueType === "Story") {
      endpoint = "/api/stories";
      payload = {
        title: formData.title,
        description: formData.description || "",
        priority: formData.priority || "MEDIUM",
        statusId: formData.statusId, // ✅ updated
        assigneeId: formData.assigneeId || null,
        reporterId: formData.reporterId || null,
        projectId: Number(formData.projectId),
        sprintId: formData.sprintId || null,
        epicId: formData.epicId || null,
        storyPoints: formData.storyPoints ? Number(formData.storyPoints) : null,
        acceptanceCriteria: formData.acceptanceCriteria || "",
        startDate: formData.startDate
          ? new Date(formData.startDate).toISOString()
          : null,
        endDate: formData.endDate
          ? new Date(formData.endDate).toISOString()
          : null,
      };
    }

    // ---------------------------
    // TASK (uses statusId)
    // ---------------------------
    if (issueType === "Task") {
      endpoint = "/api/tasks";
      payload = {
        title: formData.title,
        description: formData.description || "",
        priority: formData.priority || "MEDIUM",
        statusId: formData.statusId, // ✅ updated
        projectId: Number(formData.projectId),
        reporterId: formData.reporterId || null,
        assigneeId: formData.assigneeId || null,
        storyId: formData.storyId || null,
        sprintId: formData.sprintId || selectedStorySprint || null,
        epicId: formData.epicId || null,
        estimatedHours: formData.estimatedHours
          ? Number(formData.estimatedHours)
          : null,
        actualHours: formData.actualHours
          ? Number(formData.actualHours)
          : null,
        billable: formData.isBillable,
      };
    }

    // ---------------------------
    // BUG (uses ENUM)
    // ---------------------------
    if (issueType === "Bug") {
      endpoint = "/api/bugs";
      payload = {
        title: formData.title,
        description: formData.description || "",
        priority: formData.priority,
        status: formData.status,
        severity: formData.severity,
        type: formData.type,
        reporter: formData.reporterId || null,
        assignedTo: formData.assigneeId || null,
        projectId: Number(formData.projectId),
        sprintId: formData.sprintId || null,
        epicId: formData.epicId || null,
        taskId: formData.taskId || null,
        stepsToReproduce: formData.stepsToReproduce,
        expectedResult: formData.expectedResult,
        actualResult: formData.actualResult,
        attachments: formData.attachments,
      };
    }
 
    try {
      await axios.post(
        `${import.meta.env.VITE_PMS_BASE_URL}${endpoint}`,
        payload,
        axiosConfig
      );
      toast.success(`${issueType} created successfully!`);

      setTimeout(() => {
        onCreated?.();
        onClose?.();
      }, 700);
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

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-lg relative">
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
      >
        ✕
      </button>
 
      <ToastContainer />

      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Create {issueType}
      </h2>

      {loading && (
        <p className="text-sm text-gray-500 mb-3">Loading project data...</p>
      )}

      {/* Issue Type Switch */}
      <FormSelect
        label="Issue Type"
        name="issueType"
        value={issueType}
        onChange={(e) => {
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

        {/* ============= EPIC ============= */}
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
              label="Status"
              name="status"
              value={formData.status || "OPEN"}
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
              value={formData.priority || "MEDIUM"}
              onChange={handleChange}
              options={[
                { label: "Low", value: "LOW" },
                { label: "Medium", value: "MEDIUM" },
                { label: "High", value: "HIGH" },
                { label: "Critical", value: "CRITICAL" },
              ]}
            />

            <FormInput
              label="Progress (%)"
              name="progressPercentage"
              type="number"
              value={formData.progressPercentage || ""}
              onChange={handleChange}
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

        {/* ============= STORY ============= */}
        {issueType === "Story" && (
          <>
            <FormInput
              label="Title *"
              name="title"
              value={formData.title || ""}
              onChange={handleChange}
              required
            />

            {/* Status (using status master) */}
            <FormSelect
              label="Status *"
              name="statusId"
              value={formData.statusId || ""}
              onChange={handleChange}
              options={statusList.map((s) => ({
                label: s.name,
                value: s.id,
              }))}
            />

            <FormSelect
              label="Epic"
              name="epicId"
              value={formData.epicId || ""}
              onChange={handleChange}
              options={epics.map((e) => ({
                label: e.name,
                value: e.id,
              }))}
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

            <FormInput
              label="Story Points"
              name="storyPoints"
              type="number"
              value={formData.storyPoints || ""}
              onChange={handleChange}
            />

            <FormTextArea
              label="Acceptance Criteria"
              name="acceptanceCriteria"
              value={formData.acceptanceCriteria || ""}
              onChange={handleChange}
            />

            <FormDatePicker
              label="Start Date"
              name="startDate"
              value={formData.startDate || ""}
              onChange={handleChange}
              min={today}
            />

            <FormDatePicker
              label="End Date"
              name="endDate"
              value={formData.endDate || ""}
              onChange={handleChange}
              min={today}
            />

            <FormSelect
              label="Sprint"
              name="sprintId"
              value={formData.sprintId || ""}
              onChange={handleChange}
              options={sprints.map((s) => ({
                label: s.name,
                value: s.id,
              }))}
            />

            <FormSelect
              label="Assignee"
              name="assigneeId"
              value={formData.assigneeId || ""}
              onChange={handleChange}
              options={users.map((u) => ({
                label: u.name,
                value: u.id,
              }))}
            />

            <FormSelect
              label="Reporter *"
              name="reporterId"
              value={formData.reporterId || ""}
              onChange={handleChange}
              options={users.map((u) => ({
                label: u.name,
                value: u.id,
              }))}
            />
          </>
        )}

        {/* ============= TASK ============= */}
        {issueType === "Task" && (
          <>
            <FormInput
              label="Title *"
              name="title"
              value={formData.title || ""}
              onChange={handleChange}
              required
            />

            {/* Status Master */}
            <FormSelect
              label="Status *"
              name="statusId"
              value={formData.statusId || ""}
              onChange={handleChange}
              options={statusList.map((s) => ({
                label: s.name,
                value: s.id,
              }))}
            />

            <FormSelect
              label="Story"
              name="storyId"
              value={formData.storyId || ""}
              onChange={handleChange}
              options={stories.map((s) => ({
                label: s.title,
                value: s.id,
              }))}
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

            <FormSelect
              label="Sprint"
              name="sprintId"
              value={formData.sprintId || ""}
              onChange={handleChange}
              options={sprints.map((s) => ({
                label: s.name,
                value: s.id,
              }))}
            />

            <FormSelect
              label="Assignee"
              name="assigneeId"
              value={formData.assigneeId || ""}
              onChange={handleChange}
              options={users.map((u) => ({
                label: u.name,
                value: u.id,
              }))}
            />

            <FormSelect
              label="Reporter *"
              name="reporterId"
              value={formData.reporterId || ""}
              onChange={handleChange}
              options={users.map((u) => ({
                label: u.name,
                value: u.id,
              }))}
            />

            <FormSelect
              label="Billable"
              name="isBillable"
              value={String(formData.isBillable)}
              onChange={handleChange}
              options={[
                { label: "Yes", value: "true" },
                { label: "No", value: "false" },
              ]}
            />
          </>
        )}

        {/* ============= BUG ============= */}
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

            <FormInput
              label="Type"
              name="type"
              value={formData.type || ""}
              onChange={handleChange}
              placeholder="UI Bug, Functional Bug, etc."
            />

            <FormSelect
              label="Task"
              name="taskId"
              value={formData.taskId || ""}
              onChange={handleChange}
              options={tasks.map((t) => ({
                label: t.title,
                value: t.id,
              }))}
            />

            <FormSelect
              label="Sprint"
              name="sprintId"
              value={formData.sprintId || ""}
              onChange={handleChange}
              options={sprints.map((s) => ({
                label: s.name,
                value: s.id,
              }))}
            />

            <FormSelect
              label="Epic"
              name="epicId"
              value={formData.epicId || ""}
              onChange={handleChange}
              options={epics.map((e) => ({
                label: e.name,
                value: e.id,
              }))}
            />

            <FormSelect
              label="Assignee"
              name="assigneeId"
              value={formData.assigneeId || ""}
              onChange={handleChange}
              options={users.map((u) => ({
                label: u.name,
                value: u.id,
              }))}
            />

            <FormSelect
              label="Reporter *"
              name="reporterId"
              value={formData.reporterId || ""}
              onChange={handleChange}
              options={users.map((u) => ({
                label: u.name,
                value: u.id,
              }))}
            />

            <FormTextArea
              label="Steps"
              name="stepsToReproduce"
              value={formData.stepsToReproduce || ""}
              onChange={handleChange}
            />

            <FormTextArea
              label="Expected Result"
              name="expectedResult"
              value={formData.expectedResult || ""}
              onChange={handleChange}
            />

            <FormTextArea
              label="Actual Result"
              name="actualResult"
              value={formData.actualResult || ""}
              onChange={handleChange}
            />

            <FormInput
              label="Attachments"
              name="attachments"
              value={formData.attachments || ""}
              onChange={handleChange}
            />
          </>
        )}
 
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loading ? "Saving..." : `Create ${issueType}`}
        </button>
      </form>
    </div>
  );
};
 
export default CreateIssueForm;