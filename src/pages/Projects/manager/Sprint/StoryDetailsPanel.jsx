import React, { useEffect, useState } from 'react';
import axios from 'axios';

const StoryDetailsPanel = ({ storyId, onClose }) => {
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEpicDropdown, setShowEpicDropdown] = useState(false);
  const [epics, setEpics] = useState([]);

  const token = localStorage.getItem("token");
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // Fetch story details
  useEffect(() => {
    if (!storyId) return;
    const fetchStory = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_PMS_BASE_URL}/api/stories/${storyId}`,
          { headers }
        );
        setStory(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStory();
  }, [storyId]);

  // Fetch all epics for the project
  useEffect(() => {
    if (!story?.projectId) return;
    const fetchEpics = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${story.projectId}/epics`,
          { headers }
        );
        setEpics(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchEpics();
  }, [story]);

  const handleAssignEpic = async (epicId) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/stories/`,
        { epicId },
        { headers }
      );
      const epic = epics.find(e => e.id === epicId);
      setStory({ ...story, epicId, epic });
      setShowEpicDropdown(false);
    } catch (error) {
      console.error(error);
    }
  };

  if (!storyId) return null;

  return (
    <div className="fixed inset-0 flex z-50">
      {/* Overlay */}
      <div
        className="flex-1 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>

      {/* Slide-over panel */}
      <div className="w-96 bg-white shadow-2xl p-6 overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 font-bold"
        >
          X
        </button>

        {loading ? (
          <p className="text-gray-500">Loading story details...</p>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-indigo-900">{story.title}</h2>

            {/* Status & Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-100 p-2 rounded">
                <span className="text-gray-600 text-sm font-medium">Status</span>
                <p className="font-semibold">{story.status}</p>
              </div>
              <div className="bg-gray-100 p-2 rounded">
                <span className="text-gray-600 text-sm font-medium">Priority</span>
                <p className="font-semibold">{story.priority}</p>
              </div>
            </div>

            {/* Epic Selector */}
            <div className="bg-gray-100 p-2 rounded relative">
              <span className="text-gray-600 text-sm font-medium">Epic</span>
              <div className="flex items-center justify-between">
                <p>{story.epic?.name || "None"}</p>
                <button
                  onClick={() => setShowEpicDropdown(!showEpicDropdown)}
                  className="text-blue-600 hover:underline text-sm font-medium"
                >
                  + Epic
                </button>
              </div>

              {/* Dropdown with epics */}
              {showEpicDropdown && (
                <div className="absolute mt-2 bg-white border rounded shadow-lg w-full z-10 max-h-40 overflow-y-auto">
                  {epics.map((epic) => (
                    <div
                      key={epic.id}
                      onClick={() => handleAssignEpic(epic.id)}
                      className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                    >
                      {epic.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reporter & Assignee */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-100 p-2 rounded">
                <span className="text-gray-600 text-sm font-medium">Reporter</span>
                <p>{story.reporter?.name}</p>
              </div>
              <div className="bg-gray-100 p-2 rounded">
                <span className="text-gray-600 text-sm font-medium">Assignee</span>
                <p>{story.assignee?.name || "Unassigned"}</p>
              </div>
            </div>

            {/* Project & Sprint */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-100 p-2 rounded">
                <span className="text-gray-600 text-sm font-medium">Project ID</span>
                <p>{story.projectId}</p>
              </div>
              <div className="bg-gray-100 p-2 rounded">
                <span className="text-gray-600 text-sm font-medium">Sprint ID</span>
                <p>{story.sprintId || "None"}</p>
              </div>
            </div>

            {/* Timestamps */}
            <div className="bg-gray-50 p-2 rounded border">
              <span className="text-gray-600 text-sm font-medium">Created At</span>
              <p>{new Date(story.createdAt).toLocaleString()}</p>
              <span className="text-gray-600 text-sm font-medium mt-1 block">Updated At</span>
              <p>{new Date(story.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryDetailsPanel;
