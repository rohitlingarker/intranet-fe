import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react'; // Add this line if using lucide icons

interface Project {
  id: number;
  name: string;
}

interface CreateSprintProps {
  onClose?: () => void;
}

const CreateSprint: React.FC<CreateSprintProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    goal: '',
    startDate: '',
    endDate: '',
    status: 'PLANNING',
    projectId: '',
  });

  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/projects');
        const content = Array.isArray(response.data.content)
          ? response.data.content
          : response.data;
        setProjects(content);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };
    fetchProjects();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      goal: formData.goal,
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: formData.status,
      projectId: parseInt(formData.projectId),
    };

    try {
      await axios.post('http://localhost:8080/api/sprints', payload);
      alert('✅ Sprint created successfully!');
      setFormData({
        name: '',
        goal: '',
        startDate: '',
        endDate: '',
        status: 'PLANNING',
        projectId: '',
      });
      if (onClose) onClose(); // Optional: close on successful submit
    } catch (error) {
      console.error('Error creating sprint:', error);
    }
  };

  return (
    <div className="relative max-w-xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          <X size={20} /> {/* Or use simple ×: <span className="text-xl">×</span> */}
        </button>
      )}

      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Create a New Sprint</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block font-medium text-gray-700 mb-1">Sprint Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700 mb-1">Goal</label>
          <textarea
            name="goal"
            value={formData.goal}
            onChange={handleChange}
            rows={3}
            className="w-full border border-gray-300 p-2 rounded-md resize-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700 mb-1">Start Date</label>
          <input
            type="datetime-local"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700 mb-1">End Date</label>
          <input
            type="datetime-local"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700 mb-1">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="PLANNING">Planning</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <div>
          <label className="block font-medium text-gray-700 mb-1">Project</label>
          <select
            name="projectId"
            value={formData.projectId}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select a Project --</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-center">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Create Sprint
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSprint;
