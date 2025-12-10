// src/pages/Projects/manager/BacklogAndSprints.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { DndProvider, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Plus, List } from "lucide-react";
import { ToastContainer } from "react-toastify";   // ✅ Added
import { showStatusToast } from "../../../components/toastfy/toast";

import Button from "../../../components/Button/Button";
import StoryCard from "./Sprint/StoryCard";
import SprintColumn from "./Sprint/SprintColumn";
import CreateSprintModal from "./Sprint/CreateSprintModal";
import CreateIssueForm from "./CreateIssue/CreateIssueForm";
import TaskCard from "./Sprint/TaskCard";
import EditTaskForm from "./Backlog/EditTaskForm";
import EditStoryForm from "./Backlog/EditStoryForm";
import RightSidePanel from "./Sprint/RightSidePanel";
import SprintDetailsPanel from "./Sprint/SprintDetailsPanel";
import SprintPendingModal from "./Sprint/SprintPendingModal";

const BacklogAndSprints = ({ projectId, projectName }) => {
  const navigate = useNavigate();

  const [stories, setStories] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [epics, setEpics] = useState([]);
  const [backlogStories, setBacklogStories] = useState([]);
  const [backlogTasks, setBacklogTasks] = useState([]);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [showSprintModal, setShowSprintModal] = useState(false);
  const [selectedStoryId, setSelectedStoryId] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedSprintId, setSelectedSprintId] = useState(null);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState("story");
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [pendingData, setPendingData] = useState(null);

  const token = localStorage.getItem("token");
  // const headers = { Authorization: `Bearer ${token}` };

  // =======================================
  // Fetch a single story
  // =======================================
  const fetchStoryById = async (storyId) => {
    const res = await axios.get(
      `${import.meta.env.VITE_PMS_BASE_URL}/api/stories/${storyId}`,
      { headers }
    );
    return res.data;
  };

  const buildUpdatedStoryBody = (story, sprintId) => ({
    id: story.id,
    title: story.title,
    description: story.description,
    acceptanceCriteria: story.acceptanceCriteria,
    storyPoints: story.storyPoints,
    assigneeId: story.assigneeId || story.assignee?.id || null,
    reporterId: story.reporterId || story.reporter?.id || null,
    projectId: projectId,
    epicId: story.epicId || story.epic?.id || null,
    sprintId: sprintId,
    startDate: story.startDate,
    statusId: story.statusId || story.status?.id,
    priority: story.priority,
    dueDate: story.dueDate,
  });

  // =======================================
  // Move Story (Sprint <-> Backlog)
  // =======================================
  const handleDropStory = async (storyId, sprintId) => {
    showStatusToast(
      sprintId ? "Moving story to sprint..." : "Moving story to backlog...",
      "loading",
      2000
    );

    // Optimistic UI update
    setStories((prev) =>
      prev.map((s) => (s.id === storyId ? { ...s, sprintId } : s))
    );

    try {
      const fullStory = await fetchStoryById(storyId);
      const body = buildUpdatedStoryBody(fullStory, sprintId);

      await axios.put(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/stories/${storyId}`,
        body,
        { headers }
      );

      showStatusToast(
        sprintId ? "Story moved successfully!" : "Moved to backlog",
        "success",
        3000
      );

      fetchStories();
    } catch (err) {
      showStatusToast("Failed to move story", "error", 3000);
      fetchStories(); // rollback to server truth
    }
  };

  // =======================================
  // Sprint Start / Complete
  // =======================================
  const handleSprintStatus = async (sprintId, action) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/sprints/${sprintId}/${action}`,
        {},
        { headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        } }
      );

      toast.success(
  action === "start" ? "Sprint started" : "Sprint completed",
  { autoClose: 2000 }
);

      fetchSprints();
      fetchStories();
    } catch (err) {
      const data = err.response?.data || {};

      if (action === "complete" && data.code === "SPRINT_COMPLETION_VALIDATION_ERROR") {
        setPendingData({
          sprintId,
          tasks: data.data?.pendingTasks || [],
          stories: data.data?.pendingStories || [],
        });
        setShowPendingModal(true);
        return;
      }

     toast.error(data.message || "Failed to update sprint", {
  autoClose: 2000,
});

    }
  };

  // =======================================
  // Move Task
  // =======================================
  const handleDropTask = async (taskId, sprintId) => {
    console.log("handleDropTask called with:", sprintId);
    toast.info("Moving task...", { autoClose: 2000 });
    try {
      await axios.patch(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/tasks/${taskId}/assign-sprint/${sprintId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }
        },
      );
      toast.success("Task moved!", { autoClose: 2000 });
      fetchTasks();
    } catch (err) {
    toast.error("Failed to move task", { autoClose: 2000 });
    }
  };

  // =======================================
  // Fetch Data
  // =======================================
  const fetchStories = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/stories`,
        { headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }}
      );

      const list = Array.isArray(res.data) ? res.data : res.data.content || [];
      setStories(list);
      setBacklogStories(list.filter((s) => !s.sprintId));
    } catch {
      toast.error("Failed to fetch stories", { autoClose: 2000 });

    }
  };

  const fetchTasks = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/tasks`,
        { headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        } }
      );

      const list = Array.isArray(res.data) ? res.data : res.data.content || [];
      setTasks(list);
      setBacklogTasks(list.filter((t) => !t.sprintId));
    } catch {
      toast.error("Failed to fetch tasks", { autoClose: 2000 });
    }
  };

  const fetchEpics = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/epics`,
        { headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        } }
      );

      setEpics(Array.isArray(res.data) ? res.data : res.data.content || []);
    } catch {
      toast.error("Failed to fetch epics", { autoClose: 2000 });
    }
  };

  const fetchSprints = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/sprints`,
        { headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        } }
      );

      setSprints(Array.isArray(res.data) ? res.data : res.data.content || []);
    } catch {
      toast.error("Failed to fetch sprints", { autoClose: 2000 });
    }
  };
  // =======================================
// Delete Sprint
// =======================================
const handleDeleteSprint = async (sprintId) => {
  const ok = window.confirm("Are you sure you want to delete this sprint?");
  if (!ok) return;

  try {
    await axios.delete(
      `${import.meta.env.VITE_PMS_BASE_URL}/api/sprints/${sprintId}`,
      { headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      } }
    );

    toast.success("Sprint deleted successfully");
    fetchSprints();
    fetchStories();
  } catch (err) {
    toast.error("Failed to delete sprint", { autoClose: 2000 });
  }
};


  useEffect(() => {
    fetchStories();
    fetchTasks();
    fetchSprints();
    fetchEpics();
  }, [projectId]);

  // =======================================
  // Backlog Drop Zone
  // =======================================// =======================================
// Backlog Drop Zone (UPDATED)
// =======================================
const BacklogDropWrapper = ({ children }) => {
  const [{ isOver }, dropRef] = useDrop(() => ({
    accept: ["STORY", "TASK"],   // 👈 accept BOTH
    drop: (item) => {
      if (item.type === "TASK") {
        handleDropTask(item.id, null);   // move TASK to backlog
      } else {
        handleDropStory(item.id, null);  // move STORY to backlog
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={dropRef}
      className={`transition border rounded p-4 shadow-sm ${
        isOver ? "bg-green-100 border-green-500" : "bg-white"
      }`}
    >
      {children}
    </div>
  );
};


  const activeAndPlanningSprints = sprints.filter(
    (s) => s.status === "ACTIVE" || s.status === "PLANNING"
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Toast Container — MUST EXIST for instant toasts */}
        <ToastContainer position="top-right" autoClose={2000} /> {/* ✅ Added */}

        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-indigo-900">
            Backlog & Sprint Planning – {projectName}
          </h1>

          <div className="flex gap-3">
            <Button
              size="medium"
              variant="outline"
              className="flex items-center gap-2"
              onClick={() =>
                navigate(`/projects/${projectId}/issuetracker`, { state: { projectId } })
              }
            >
              <List size={18} /> Issue Tracker
            </Button>

            <Button className="flex items-center gap-2" onClick={() => setShowSprintModal(true)}>
              <Plus size={18} /> Create Sprint
            </Button>

            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setShowIssueForm(true)}
            >
              <Plus size={18} /> Create Issue
            </Button>
          </div>
        </div>

        {/* Sprints */}
        <div className="space-y-4">
          {activeAndPlanningSprints.map((sprint) => {
            const sprintStories = stories.filter(
              (s) => s.sprintId === sprint.id || s.sprint?.id === sprint.id
            );
            const sprintTasks = tasks.filter(
              (t) => t.sprintId === sprint.id || t.sprint?.id === sprint.id
            );

            return (
              <SprintColumn
                key={sprint.id}
                sprint={sprint}
                stories={sprintStories}
                tasks={sprintTasks}
                epics={epics}
                allStories={stories}
                sprints={activeAndPlanningSprints}
                onDropStory={handleDropStory}
                onDropTask={handleDropTask}
                onChangeStatus={handleSprintStatus}
                onDeleteSprint={handleDeleteSprint}
                onEditSprint={(s) => {
                  setSelectedSprintId(s.id);
                  setPanelMode("sprint");
                  setRightPanelOpen(true);
                }}
                onSelectEpic={() => {}}
                onStoryClick={(id) => {
                  setPanelMode("story");
                  setSelectedStoryId(id);
                  setRightPanelOpen(true);
                }}
                onTaskClick={(id) => {
                  setPanelMode("task");
                  setSelectedTaskId(id);
                  setRightPanelOpen(true);
                }}
              />
            );
          })}
        </div>

        {/* Backlog */}
        <BacklogDropWrapper>
          <h2 className="text-lg font-semibold text-indigo-900 mb-3">Product Backlog</h2>

          <h3 className="text-md font-semibold text-blue-700 mb-1">Stories</h3>

          {backlogStories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              sprints={activeAndPlanningSprints}
              epics={epics}
              onAddToSprint={handleDropStory}
              onClick={() => {
                setPanelMode("story");
                setSelectedStoryId(story.id);
                setRightPanelOpen(true);
              }}
            />
          ))}

          <h3 className="text-md font-semibold text-green-700 mb-1">Tasks</h3>

          {backlogTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              stories={stories}
              sprints={activeAndPlanningSprints}
              onAddToSprint={handleDropTask}
              onClick={() => {
                setPanelMode("task");
                setSelectedTaskId(task.id);
                setRightPanelOpen(true);
              }}
            />
          ))}
        </BacklogDropWrapper>
      </div>

      {/* Modals */}
      {showIssueForm && (
        <CreateIssueForm
          onClose={() => setShowIssueForm(false)}
          onCreated={() => {
            fetchStories();
            fetchTasks();
          }}
          projectId={projectId}
        />
      )}

      <CreateSprintModal
        isOpen={showSprintModal}
        projectId={projectId}
        onClose={() => setShowSprintModal(false)}
        onCreated={(newSprint) => setSprints((prev) => [...prev, newSprint])}
      />

      <RightSidePanel isOpen={rightPanelOpen} onClose={() => setRightPanelOpen(false)}>
        {panelMode === "story" && selectedStoryId && (
          <EditStoryForm
            storyId={selectedStoryId}
            projectId={projectId}
            mode="drawer"
            onClose={() => setRightPanelOpen(false)}
            onUpdated={() => {
              fetchStories();
              setRightPanelOpen(false);
            }}
          />
        )}

        {panelMode === "task" && selectedTaskId && (
          <EditTaskForm
            taskId={selectedTaskId}
            projectId={projectId}
            mode="drawer"
            onClose={() => setRightPanelOpen(false)}
            onUpdated={() => {
              fetchTasks();
              setRightPanelOpen(false);
            }}
          />
        )}

        {panelMode === "sprint" && selectedSprintId && (
          <SprintDetailsPanel
            sprintId={selectedSprintId}
            projectId={projectId}
            onClose={() => setRightPanelOpen(false)}
            onUpdated={() => {
              fetchSprints();
              setRightPanelOpen(false);
            }}
          />
        )}
      </RightSidePanel>

      <SprintPendingModal
        isOpen={showPendingModal}
        pendingData={pendingData}
        sprints={sprints}
        onClose={() => setShowPendingModal(false)}
        refresh={() => {
          fetchSprints();
          fetchStories();
        }}
      />
    </DndProvider>
  );
};

export default BacklogAndSprints;
