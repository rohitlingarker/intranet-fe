import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CreateSprintModal = ({ isOpen, projectId, onClose, onCreated }) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    name: '',
    goal: '',
    startDate: '',
    endDate: '',
    status: 'PLANNING',
    projectId: projectId.toString(),
  });

  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects`);
        const content = Array.isArray(response.data.content)
          ? response.data.content
          : response.data;
        setProjects(content);
      } catch (error) {
        toast.error('Error fetching projects list.', { position: 'top-right', autoClose: 3000 });
        console.error('Error fetching projects:', error);
      }
    };
    fetchProjects();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toLocalDateTime = (datetimeStr) => {
    return datetimeStr.length === 16 ? `${datetimeStr}:00` : datetimeStr;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      goal: formData.goal || null, // optional
      startDate: toLocalDateTime(formData.startDate),
      endDate: toLocalDateTime(formData.endDate),
      status: formData.status,
      projectId: parseInt(formData.projectId),
    };

    try {
      const response = await axios.post(`${import.meta.env.VITE_PMS_BASE_URL}/api/sprints`, payload);

      toast.success('✅ Sprint created successfully!', {
        position: 'top-right',
        autoClose: 5000,
      });

      onCreated(response.data);

      setFormData({
        name: '',
        goal: '',
        startDate: '',
        endDate: '',
        status: 'PLANNING',
        projectId: projectId.toString(),
      });

      // Wait for toast to be visible before closing modal
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error('🚫 Error creating sprint:', error.response?.data || error.message);
      const errorMsg =
        error.response?.data?.message ||
        'Sprint creation failed. Please check your inputs.';
      toast.error(`❌ ${errorMsg}`, { position: 'top-right', autoClose: 5000 });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-md w-full max-w-xl max-h-screen overflow-y-auto p-6 relative">
        <ToastContainer />
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Create a New Sprint</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Sprint Name <span className="text-red-500">*</span>
            </label>
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
            <label className="block font-medium text-gray-700 mb-1">
              Goal <span className="text-gray-400 text-sm">(Optional)</span>
            </label>
            <textarea
              name="goal"
              value={formData.goal}
              onChange={handleChange}
              rows={3}
              className="w-full border border-gray-300 p-2 rounded-md resize-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Start Date <span className="text-red-500">*</span>
            </label>
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
            <label className="block font-medium text-gray-700 mb-1">
              End Date <span className="text-red-500">*</span>
            </label>
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
            <label className="block font-medium text-gray-700 mb-1">
              Project <span className="text-red-500">*</span>
            </label>
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
    </div>
  );
};

export default CreateSprintModal;
