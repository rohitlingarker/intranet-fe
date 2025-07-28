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

const CreateEpic: React.FC = () => {
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
    axios.get("http://localhost:8080/api/projects")
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : res.data.content;
        setProjects(data || []);
      })
      .catch(err => {
        console.error("Failed to fetch projects", err);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "progressPercentage" ? Number(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    axios.post("http://localhost:8080/api/epics", formData)
      .then(() => {
        alert("Epic created successfully!");
        setFormData({
          name: "",
          description: "",
          status: "TO_DO",
          priority: "LOW",
          progressPercentage: 0,
          dueDate: "",
          projectId: 0,
        });
      })
      .catch(err => {
        console.error("Error creating epic:", err);
        alert("Failed to create epic.");
      });
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow space-y-4">
      <h2 className="text-xl font-bold mb-4">Create Epic</h2>
      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          type="text"
          name="name"
          placeholder="Epic Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded px-3 py-2"
        />

        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />

        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded px-3 py-2"
        >
          <option value="TO_DO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DONE">Done</option>
        </select>

        <select
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded px-3 py-2"
        >
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>

        <input
          type="number"
          name="progressPercentage"
          placeholder="Progress %"
          value={formData.progressPercentage}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />

        <input
          type="datetime-local"
          name="dueDate"
          value={formData.dueDate}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />

        <select
          name="projectId"
          value={formData.projectId}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded px-3 py-2"
        >
          <option value="">Select Project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Create Epic
        </button>
      </form>
    </div>
  );
};

export default CreateEpic;
