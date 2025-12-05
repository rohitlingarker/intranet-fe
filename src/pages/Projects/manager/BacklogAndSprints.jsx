// FULL UPDATED BacklogAndSprints.jsx
// --- All sprint buttons fixed
// --- Status update works inside sprint also
// --- Pass statuses + onChangeStatus to SprintColumn

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import StoryCard from "./Sprint/StoryCard";
import SprintColumn from "./Sprint/SprintColumn";
import CreateSprintModal from "./Sprint/CreateSprintModal";
import CreateIssueForm from "./Backlog/CreateIssueForm";

const BacklogAndSprints = ({ projectId }) => {
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [showSprintModal, setShowSprintModal] = useState(false);
  const [editingSprint, setEditingSprint] = useState(null);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchStories = async () => {
    const res = await axios.get(
      `${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/stories`,
      { headers }
    );
    setStories(res.data);
  };

  const fetchSprints = async () => {
    const res = await axios.get(
      `${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/sprints`,
      { headers }
    );
    setSprints(res.data);
  };

  const fetchStatuses = async () => {
    const res = await axios.get(
      `${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/statuses`,
      { headers }
    );
    setStatuses(res.data);
  };

  useEffect(() => {
    fetchStatuses();
    fetchSprints();
    fetchStories();
  }, []);

  const getStory = async (id) => {
    const res = await axios.get(
      `${import.meta.env.VITE_PMS_BASE_URL}/api/stories/${id}`,
      { headers }
    );
    return res.data;
  };

  const moveStoryToSprint = async (storyId, sprintId) => {
    const story = await getStory(storyId);
    await axios.put(
      `${import.meta.env.VITE_PMS_BASE_URL}/api/stories/${storyId}`,
      { ...story, sprintId },
      { headers }
    );
    toast.success(`Story moved to Sprint`);
    fetchStories();
  };

  const moveStoryToBacklog = async (storyId) => {
    const story = await getStory(storyId);
    await axios.put(
      `${import.meta.env.VITE_PMS_BASE_URL}/api/stories/${storyId}`,
      { ...story, sprintId: null },
      { headers }
    );
    toast.success("Story moved to Backlog");
    fetchStories();
  };

  const changeStoryStatus = async (storyId, statusId) => {
    const story = await getStory(storyId);
    await axios.put(
      `${import.meta.env.VITE_PMS_BASE_URL}/api/stories/${storyId}`,
      { ...story, statusId },
      { headers }
    );
    toast.success("Status updated");
    fetchStories();
  };

  const changeSprintStatus = async (sprintId, action) => {
    await axios.put(
      `${import.meta.env.VITE_PMS_BASE_URL}/api/sprints/${sprintId}/${action}`,
      {},
      { headers }
    );
    toast.success("Sprint updated");
    fetchSprints();
  };

  const deleteSprint = async (id) => {
  if (!id) {
    toast.error("Invalid sprint ID.");
    return;
  }

  const deleteSprint = async (id) => {
  if (!id) {
    toast.error("Invalid sprint ID.");
    return;
  }

 const deleteSprint = async (id) => {
  // if (!id) {
  //   toast.error("Invalid sprint ID.");
  //   return;
  // }

  try {
    await axios.delete(
      `${import.meta.env.VITE_PMS_BASE_URL}/api/sprints/${id}`,
      { headers }
    );

    toast.success("Sprint deleted successfully");
    fetchSprints();

  } catch (error) {
    console.error("Delete sprint error:", error);

    toast.dismiss(); // reset old toasts

    const status = error.response?.status;
    const backendMsg = error.response?.data?.message?.toLowerCase() || "";

    // Run toast OUTSIDE event chain (DnD fix)
    setTimeout(() => {

      // 1️⃣ Access Denied (403)
      if (status === 403) {
        toast.error("You do not have permission to delete this sprint.");
        return;
      }

      // 2️⃣ FK constraint (stories exist inside sprint)
      if (
        backendMsg.includes("constraint") ||
        backendMsg.includes("foreign key") ||
        backendMsg.includes("referential")
      ) {
        toast.error(
          "This sprint contains stories or tasks. Move them before deleting."
        );
        return;
      }

      // 3️⃣ Backend error message
      if (backendMsg) {
        toast.error(
          backendMsg.charAt(0).toUpperCase() + backendMsg.slice(1)
        );
        return;
      }

      // 4️⃣ Fallback
      toast.error("Failed to delete sprint. Please try again.");

    }, 50);
  }
};
  }
}

  return (
    <DndProvider backend={HTML5Backend}>
      <ToastContainer />

      <div className="p-6 max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Backlog & Sprint Planning —</h1>

          <div className="flex items-center gap-4">
            <button
              onClick={() =>
                navigate(`/projects/${projectId}/issuetracker`, {
                  state: { projectId },
                })
              }
              className="px-4 py-2 rounded-lg bg-white shadow hover:shadow-md border"
            >
              Issue Tracker
            </button>

            <button
              className="px-6 py-2 rounded-lg bg-indigo-700 text-white hover:brightness-95"
              onClick={() => {
                setEditingSprint(null);
                setShowSprintModal(true);
              }}
            >
              + Create Sprint
            </button>

            <button
              onClick={() => setShowIssueForm(true)}
              className="px-4 py-2 rounded-lg bg-white shadow hover:shadow-md border"
            >
              + Create Issue
            </button>
          </div>
        </div>

        {/* SPRINT LIST */}
        <div className="space-y-3">
          {sprints.map((sp) => (
            <SprintColumn
              key={sp.id}
              sprint={sp}
              stories={stories.filter((s) => s.sprintId === sp.id)}
              statuses={statuses}            // FIXED
              onDropStory={moveStoryToSprint}
              onChangeStatus={changeSprintStatus}
              onEditSprint={() => {
                setEditingSprint(sp);
                setShowSprintModal(true);
              }}
              onDeleteSprint={deleteSprint}
              onChangeStoryStatus={changeStoryStatus} // FIXED
            />
          ))}
        </div>

        {/* BACKLOG */}
        <div className="mt-8 border rounded-xl p-5 bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-3">Backlog</h2>

          {stories.filter((s) => !s.sprintId).map((st) => (
            <StoryCard
              key={st.id}
              story={st}
              statuses={statuses}
              onAddToSprint={moveStoryToSprint}
              onMoveToBacklog={moveStoryToBacklog}
              onChangeStatus={changeStoryStatus}
              sprints={sprints}
            />
          ))}
        </div>
      </div>

      {/* ISSUE FORM */}
      {showIssueForm && (
        <CreateIssueForm
          projectId={projectId}
          onClose={() => setShowIssueForm(false)}
          onCreated={fetchStories}
        />
      )}

      {/* CREATE / EDIT SPRINT */}
      <CreateSprintModal
        isOpen={showSprintModal}
        sprint={editingSprint}
        projectId={projectId}
        onClose={() => setShowSprintModal(false)}
        onCreated={fetchSprints}
      />
    </DndProvider>
  );
};



export default BacklogAndSprints;
