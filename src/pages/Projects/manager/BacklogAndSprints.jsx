// src/pages/Projects/manager/BacklogAndSprints.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Plus, List, X, ChevronDown, ChevronUp } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Button from "../../../components/Button/Button";
import StoryCard from "./Sprint/StoryCard";
import SprintColumn from "./Sprint/SprintColumn";
import CreateSprintModal from "./Sprint/CreateSprintModal";
import CreateIssueForm from "./CreateIssue/CreateIssueForm";
import TaskCard from "./Sprint/TaskCard"; 
import EditTaskForm from "./Backlog/EditTaskForm";
import EditStoryForm from "./Backlog/EditStoryForm";
import RightSidePanel from "./Sprint/RightSidePanel";
import { id } from "date-fns/locale/id";

const BacklogAndSprints = ({ projectId, projectName }) => {
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [epics,setEpics] = useState([]);
  const [backlogStories, setBacklogStories] = useState([]);
  const [backlogTasks, setBacklogTasks] = useState([]);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [showSprintModal, setShowSprintModal] = useState(false);
  const [expandedSprint, setExpandedSprint] = useState(null);
  const [selectedStoryId, setSelectedStoryId] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [panelContent, setPanelContent] = useState(null);
  const [panelMode, setPanelMode] = useState("story");

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  /** ==============================
   * Fetch Data
   ============================== */
  const fetchStories = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/stories`,
        { headers }
      );
      const list = Array.isArray(res.data) ? res.data : res.data.content || [];
      setStories(list);
      setBacklogStories(list.filter((s) => !s.sprintId && !s.sprint));
      //setBacklogTasks(list.filter((t) => !t.sprintId && !t.sprint));
    } catch (err) {
      console.error("Failed to fetch stories", err);
      toast.error("Failed to fetch stories");
    }
  };
  const fetchTasks = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/tasks`,
        { headers }
      );

      const list = Array.isArray(res.data) ? res.data : res.data.content || [];

      setTasks(list); // You need: const [tasks, setTasks] = useState([]);

      setBacklogTasks(list.filter((t) => !t.sprintId && !t.sprint));
      //console.log("BACKLOG TASKS:", list.filter((t) => t.sprintId === null));
    } catch (err) {
      console.error("Failed to fetch tasks", err);
      toast.error("Failed to fetch tasks");
    }
  };
  const fetchEpics = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/epics`,
        { headers }
      );
      const list = Array.isArray(res.data) ? res.data : res.data.content || [];
      // console.log("Fetched epics:", list);
      // return list;
      setEpics(list);
    } catch (err) {
      console.error("Failed to fetch epics", err);
      toast.error("Failed to fetch epics");
      return [];
    }
  }


  const fetchSprints = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/sprints`,
        { headers }
      );
      const list = Array.isArray(res.data) ? res.data : res.data.content || [];
      setSprints(list);
    } catch (err) {
      console.error("Failed to fetch sprints", err);
      toast.error("Failed to fetch sprints");
    }
  };

  useEffect(() => {
    fetchStories();
    fetchTasks();
    fetchSprints();
    fetchEpics();
  }, [projectId]);

  const goToIssueTracker = () => {
    navigate(`/projects/${projectId}/issuetracker`, {
      state: { projectId },
    });
  };

  /** ==============================
   * Handlers
   ============================== */
  const handleDropStory = async (storyId, sprintId) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/stories/${storyId}/assign-sprint`,
        { sprintId },
        { headers }
      );
      toast.success("Story moved successfully");
      fetchStories();
    } catch (err) {
      console.error("Failed to assign story", err);
      toast.error("Failed to assign story");
    }
  };

  const handleSprintStatus = async (sprintId, action) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/sprints/${sprintId}/${action}`,
        {},
        { headers }
      );
      toast.success(`Sprint ${action === "start" ? "started" : "completed"}!`);
      setSprints((prev) =>
        prev.map((s) => (s.id === sprintId ? res.data : s))
      );
      fetchStories();
    } catch (err) {
      console.error("Failed to update sprint", err);
      toast.error("Failed to update sprint");
    }
  };

  const handleAttachTaskToStory = async (taskId,storyId) =>{
    try{
      await axios.put(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/tasks/${taskId}/assign-story/${storyId}`,
        {storyId},
        {headers}
      );
      toast.success("Task attached to story successfully");
      fetchTasks();
    } catch (err) {
      console.error("Failed to attach task to story", err);
      toast.error("Failed to attach task to story");
    }
  }
  const handleSelectEpic = async (storyId, epicId) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/stories/${storyId}/assign-epic/${epicId}`,
        {},
        { headers }
      );

      toast.success("Story attached to epic successfully");
      fetchStories(); // refresh UI
    } catch (err) {
      console.error("Failed to assign epic", err);
      toast.error("Failed to attach story to epic");
    }
  };


  /** ==============================
   * UI Helpers
   ============================== */
  const activeAndPlanningSprints = sprints.filter(
    (s) => s.status === "ACTIVE" || s.status === "PLANNING"
  );

  /** ==============================
   * Render
   ============================== */
  return (
    <DndProvider backend={HTML5Backend}>
      <ToastContainer />
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* ===== Header ===== */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-indigo-900">
            Backlog & Sprint Planning – {projectName}
          </h1>
          <div className="flex gap-3">
            <Button
              size="medium"
              variant="outline"
              className="flex items-center gap-2"
              onClick={goToIssueTracker}
            >
              <List size={18} /> Issue Tracker
            </Button>

            <Button
              onClick={() => setShowSprintModal(true)}
              className="flex items-center gap-2"
            >
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

        {/* ===== Sprint List (Expandable Panels) ===== */}
        {/* ===== Sprint List (Expandable Panels) ===== */}
<div className="space-y-4">
  {activeAndPlanningSprints.length === 0 ? (
    <p className="text-gray-400 italic">No active or planning sprints.</p>
  ) : (
    activeAndPlanningSprints.map((sprint) => {
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
          onSelectEpic={handleSelectEpic}
          onSelectParentStory={handleAttachTaskToStory}
          onDropStory={handleDropStory}
          onChangeStatus={handleSprintStatus}
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
    })
  )}
</div>


        {/* ===== Backlog Section ===== */}
        <div className="bg-white border rounded-xl p-4 shadow-sm">
  <h2 className="text-lg font-semibold text-indigo-900 mb-3">
    Product Backlog
  </h2>

  {/* ---- Stories Section ---- */}
  <h3 className="text-md font-semibold text-blue-700 mb-1">Stories</h3>

  {backlogStories.length === 0 ? (
    <p className="text-gray-400 italic mb-3">No stories in backlog.</p>
  ) : (
    <div className="space-y-2 mb-4">
      {backlogStories.map((story) => (
        <StoryCard
          key={story.id}
          story={story}
          sprints={activeAndPlanningSprints}
          epics={epics}
          onAddToSprint={handleDropStory}
          onSelectEpic={handleSelectEpic}
          onClick={() => {
            setPanelMode("story");
            setSelectedStoryId(story.id);
            setRightPanelOpen(true);
          }}
        />
      ))}
    </div>
  )}

  {/* ---- Tasks Section ---- */}
  <h3 className="text-md font-semibold text-green-700 mb-1">Tasks</h3>

  {backlogTasks.length === 0 ? (
    <p className="text-gray-400 italic">No tasks in backlog.</p>
  ) : (
    <div className="space-y-2">
      {backlogTasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          sprints={activeAndPlanningSprints}
          stories={stories}
          onAddToSprint={handleDropStory}
          onSelectParentStory={handleAttachTaskToStory}
          onClick={() => {
            setPanelMode("task");
            setSelectedTaskId(task.id);
            setRightPanelOpen(true);
          }}
        />
      ))}
    </div>
  )}
</div>


      </div>

      {/* ===== Modals ===== */}
      {showIssueForm && (
  <CreateIssueForm
    onClose={() => setShowIssueForm(false)}
    onCreated={() => fetchStories()}
    projectId={projectId}
  />
)}

      <CreateSprintModal
        isOpen={showSprintModal}
        projectId={projectId}
        onClose={() => setShowSprintModal(false)}
        onCreated={(newSprint) => setSprints((prev) => [...prev, newSprint])}
      />

      <RightSidePanel
        isOpen={rightPanelOpen}
        onClose={() => setRightPanelOpen(false)}
      >
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
      </RightSidePanel>

    </DndProvider>
  );
};

export default BacklogAndSprints;
