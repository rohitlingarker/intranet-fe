import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { X } from "lucide-react";
 
import FormInput from "../../../../components/forms/FormInput";
import FormSelect from "../../../../components/forms/FormSelect";
import FormTextArea from "../../../../components/forms/FormTextArea";
 
const EditTaskForm = ({ taskId, projectId, onClose, onUpdated, mode="drawer" }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    statusId: "",
    sprintId: "", 
    assigneeId: "",
    reporterId: "",
    storyId: "",
    isBillable: "false",
  });
 
  const [originalData, setOriginalData] = useState(null);
  const [users, setUsers] = useState([]);
  const [stories, setStories] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
 
  if (!taskId || !projectId) return null;
 
  const token = localStorage.getItem("token");
  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
 
  // 🔥 Fetch Task + Dropdowns
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [taskRes, userRes, storyRes, sprintRes, statusRes] =
          await Promise.all([
            axios.get(
              `${import.meta.env.VITE_PMS_BASE_URL}/api/tasks/${taskId}`,
              axiosConfig
            ),
            axios.get(
              `${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/members-with-owner`,
              axiosConfig
            ),
            axios.get(
              `${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/stories`,
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
 
        const task = taskRes.data;
 
        // 🔥 Ensure all IDs are strings (VERY IMPORTANT for prefill)
        const normalized = {
          title: task.title ?? "",
          description: task.description ?? "",
          priority: task.priority ?? "MEDIUM",
        
          statusId: task.statusId ? String(task.statusId) : "",
          storyId: task.storyId ? String(task.storyId) : "",
          sprintId: task.sprintId ? String(task.sprintId) : "",
          assigneeId: task.assigneeId ? String(task.assigneeId) : "",
          reporterId: task.reporterId ? String(task.reporterId) : "",
          startDate: task.startDate ? task.startDate : "",
          dueDate: task.dueDate ? task.dueDate : "",
          isBillable: task.billable ? "true" : "false",
        };
 
 
        setOriginalData(normalized);
        setFormData(normalized);
 
        setUsers(userRes.data.content || userRes.data || []);
        setStories(storyRes.data || []);
        setSprints(sprintRes.data || []);
        setStatuses(statusRes.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load task details");
      } finally {
        setLoading(false);
      }
    };
 
    fetchData();
  }, [taskId, projectId]);
 
  // 🔥 Handle Input Change (Keep values as STRING)
  const handleChange = (e) => {
    const { name, value } = e.target;
 
    setFormData((prev) => ({
      ...prev,
      [name]: value, // keep as string always
    }));
  };
 
  // 🔥 Build Changed Fields Only
  const buildUpdatedPayload = () => {
    const payload = {};
    if (!originalData) return formData;
 
    Object.keys(formData).forEach((key) => {
      if (String(formData[key]) !== String(originalData[key])) {
        if (key === "isBillable") {
          payload[key] = formData[key] === "true";
        } else {
          // convert only here for backend
          const numericKeys = ["statusId", "sprintId", "assigneeId", "reporterId", "storyId"];
          payload[key] = numericKeys.includes(key) && formData[key] !== ""
            ? Number(formData[key])
            : formData[key];
        }
      }
    });
 
    return payload;
  };
 
  // 🔥 Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
 
    const updatedPayload = buildUpdatedPayload();
    updatedPayload.projectId = Number(projectId);
 
    try {
      await axios.put(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/tasks/${taskId}`,
        updatedPayload,
        axiosConfig
      );
      if(mode==="drawer"){
        console.log("mode=", mode);
      toast.success("Task updated successfully!")
      }
      setTimeout(() => {
        onUpdated?.();
        onClose?.();
      }, 1200);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update task");
    }
  };

  const Wrapper = ({ children }) => {
    if (mode === "modal") {
      return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50" onClick={onClose}>
          <div className="bg-white rounded-2xl w-full max-w-lg relative max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            {children}
          </div>
        </div>
      );
    }
    return (
      <div className="w-full h-full flex flex-col bg-white">
        {children}
      </div>
    );
  };
 
  if (loading) {
    return (
      <Wrapper>
        <div className="text-center py-10">Loading task...</div>
      </Wrapper>
    );
  }
 
  // UI
  return (
  <Wrapper>
    {/* HEADER */}
    <div className="flex justify-between items-center p-6 border-b">
      <h2 className="text-xl font-semibold">Edit Task</h2>

      <button onClick={onClose}>
        <X className="text-gray-600" />
      </button>
    </div>

    {/* BODY (scrollable) */}
    <div className="p-6 overflow-y-auto flex-1 space-y-6">
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
        value={formData.statusId}
        onChange={handleChange}
        options={[
          { label: "Select Status", value: "" },
          ...statuses.map((st) => ({
            label: st.name,
            value: String(st.id),
          })),
        ]}
      />

      <FormSelect
        label="Sprint"
        name="sprintId"
        value={formData.sprintId}
        onChange={handleChange}
        options={[
          { label: "Select Sprint", value: "" },
          ...sprints.map((s) => ({
            label: s.name,
            value: String(s.id),
          })),
        ]}
      />

      <FormSelect
        label="Story"
        name="storyId"
        value={formData.storyId}
        onChange={handleChange}
        options={[
          { label: "Select Story", value: "" },
          ...stories.map((story) => ({
            label: story.title,
            value: String(story.id),
          })),
        ]}
      />

      <FormSelect
        label="Assignee"
        name="assigneeId"
        value={formData.assigneeId}
        onChange={handleChange}
        options={[
          { label: "Unassigned", value: "" },
          ...users.map((u) => ({
            label: u.name,
            value: String(u.id),
          })),
        ]}
      />

      <FormSelect
        label="Reporter"
        name="reporterId"
        value={formData.reporterId}
        onChange={handleChange}
        options={[
          { label: "Select Reporter", value: "" },
          ...users.map((u) => ({
            label: u.name,
            value: String(u.id),
          })),
        ]}
      />
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
        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
      >
        Save Changes
      </button>
    </div>
  </Wrapper>
);

};
 
export default EditTaskForm;