import React, { useEffect, useState } from "react";
import axios from "axios";

interface Project {
  id: number;
  name: string;
}

interface Epic {
  name: string;
  description: string;
  status: string;
  priority: string;
  progressPercentage: number;
  dueDate: string;
  projectId: number;
}

interface CreateEpicProps {
  onClose: () => void;
}

const CreateEpic: React.FC<CreateEpicProps> = ({ onClose }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [formData, setFormData] = useState<Epic>({
    name: "",
    description: "",
    status: "TO_DO",
    priority: "LOW",
    progressPercentage: 0,
    dueDate: "",
    projectId: 0,
  });

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/projects")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data.content;
        setProjects(data || []);
      })
      .catch((err) => {
        console.error("Failed to fetch projects", err);
      });
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "progressPercentage" || name === "projectId" ? Number(value) : value,
    }));
  };

  const formatDate = (dateTime: string) => {
    return dateTime ? new Date(dateTime).toISOString().slice(0, 19) : "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formattedEpic = {
      ...formData,
      dueDate: formatDate(formData.dueDate),
    };

    const payload = [formattedEpic]; // Wrap inside array

    axios
      .post("http://localhost:8080/api/epics", payload, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then(() => {
        alert("✅ Epic(s) created successfully!");
        setFormData({
          name: "",
          description: "",
          status: "TO_DO",
          priority: "LOW",
          progressPercentage: 0,
          dueDate: "",
          projectId: 0,
        });
        onClose();
      })
      .catch((err) => {
        console.error("❌ Error creating epic:", err.response?.data || err.message);
        alert(`Failed to create epic: ${JSON.stringify(err.response?.data || err.message)}`);
      });
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-md space-y-6 relative">
      <button
        onClick={onClose}
        type="button"
        className="absolute top-4 right-4 p-1 rounded-full hover:bg-red-100 transition-colors"
        title="Close"
        aria-label="Close form"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-red-600 hover:text-red-800"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <h1 className="text-3xl font-bold text-gray-800 mb-4">Create a New Epic</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name and Description */}
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Basic Details</h2>
          <input
            type="text"
            name="name"
            placeholder="Epic Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          />

          <textarea
            name="description"
            placeholder="Epic Description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full border mt-3 border-gray-300 rounded-lg px-4 py-2"
          />
        </div>

        {/* Status & Priority */}
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Status & Priority</h2>
          <div className="grid grid-cols-2 gap-4">
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value="TO_DO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
              <option value="OPEN">Open</option>
            </select>

            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
        </div>

        {/* Progress & Due Date */}
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Progress & Deadline</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              name="progressPercentage"
              placeholder="Progress %"
              min={0}
              max={100}
              value={formData.progressPercentage}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />

            <input
              type="datetime-local"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>
        </div>

        {/* Project */}
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Select Project</h2>
          <select
            name="projectId"
            value={formData.projectId}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          >
            <option value={0}>-- Select Project --</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        {/* Submit */}
        <div className="text-center">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
          >
            Create Epic
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEpic;
