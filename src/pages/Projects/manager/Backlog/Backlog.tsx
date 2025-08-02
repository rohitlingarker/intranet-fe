import React, { useEffect, useState } from "react";
import axios from "axios";
import CreateEpic from "./epic";
import CreateUserStory from "./userstory";
import CreateSprint from "./sprint";
import CreateTaskModal from "./tasks";
import { Plus } from "lucide-react";

interface Epic {
  id: number;
  name: string;
  status: string;
}

interface Story {
  id: number;
  title: string;
  status: string;
  epic?: { id: number } | number;
  reporter?: { id: number } | number;
  project?: { id: number } | number;
  sprint?: { id: number } | number;
}

interface Task {
  id: number;
  title: string;
  status: string;
  project?: { id: number } | number;
  reporter?: { id: number } | number;
  story?: { id: number } | number;
  sprint?: { id: number } | number;
  assignee?: { id: number } | number;
}

const Backlog: React.FC = () => {
  const projectId = 1;
  const projectName = "Demo Project";

  const [issueType, setIssueType] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  const [epics, setEpics] = useState<Epic[]>([]);
  const [expandedEpicId, setExpandedEpicId] = useState<number | null>(null);
  const [stories, setStories] = useState<Record<number, Story[]>>({});
  const [expandedStoryId, setExpandedStoryId] = useState<number | null>(null);
  const [tasks, setTasks] = useState<Record<number, Task[]>>({});

  // Editable epic state
  const [editingEpicId, setEditingEpicId] = useState<number | null>(null);
  const [editingEpicData, setEditingEpicData] = useState<{ name: string; status: string }>({
    name: "",
    status: "",
  });

  // Editable story state
  const [editingStoryId, setEditingStoryId] = useState<number | null>(null);
  const [editingStoryData, setEditingStoryData] = useState<{ title: string; status: string }>({
    title: "",
    status: "",
  });

  // Editable task state
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingTaskData, setEditingTaskData] = useState<{ title: string; status: string }>({
    title: "",
    status: "",
  });

  // Load epics on mount
  useEffect(() => {
    axios
      .get(`http://localhost:8080/api/projects/${projectId}/epics`)
      .then((res) => {
        if (Array.isArray(res.data)) {
          setEpics(res.data);
        } else {
          console.error("Expected array for epics, got:", res.data);
          setEpics([]);
        }
      })
      .catch((err) => {
        console.error("Failed to load epics", err);
        setEpics([]);
      });
  }, [projectId]);

  const fetchStories = (epicId: number) => {
    if (stories[epicId]) {
      setExpandedEpicId(expandedEpicId === epicId ? null : epicId);
      return;
    }

    axios
      .get(`http://localhost:8080/api/stories/epic/${epicId}`)
      .then((res) => {
        if (Array.isArray(res.data)) {
          setStories((prev) => ({ ...prev, [epicId]: res.data }));
          setExpandedEpicId(epicId);
          setExpandedStoryId(null);
        } else {
          console.error("Expected array for stories, got:", res.data);
        }
      })
      .catch((err) => console.error("Failed to load stories", err));
  };

  const fetchTasks = (storyId: number) => {
    if (tasks[storyId]) {
      setExpandedStoryId(expandedStoryId === storyId ? null : storyId);
      return;
    }

    axios
      .get(`http://localhost:8080/api/stories/${storyId}/tasks`)
      .then((res) => {
        if (Array.isArray(res.data)) {
          setTasks((prev) => ({ ...prev, [storyId]: res.data }));
          setExpandedStoryId(storyId);
        } else {
          console.error("Expected array for tasks, got:", res.data);
        }
      })
      .catch((err) => console.error("Failed to load tasks", err));
  };

  // Editable epic handlers
  const startEditEpic = (epic: Epic) => {
    setEditingEpicId(epic.id);
    setEditingEpicData({ name: epic.name, status: epic.status });
  };

  const cancelEditEpic = () => {
    setEditingEpicId(null);
    setEditingEpicData({ name: "", status: "" });
  };

  const saveEditEpic = () => {
    if (editingEpicId === null) return;
    axios
      .put(`http://localhost:8080/api/epics/${editingEpicId}`, editingEpicData)
      .then(() => {
        setEpics((prev) =>
          prev.map((epic) =>
            epic.id === editingEpicId ? { ...epic, ...editingEpicData } : epic
          )
        );
        cancelEditEpic();
      })
      .catch((err) => {
        alert("Failed to update epic: " + (err.response?.data || err.message));
      });
  };

  // Editable story handlers
  const startEditStory = (story: Story) => {
    setEditingStoryId(story.id);
    setEditingStoryData({ title: story.title, status: story.status });
  };

  const cancelEditStory = () => {
    setEditingStoryId(null);
    setEditingStoryData({ title: "", status: "" });
  };

  const saveEditStory = (epicId: number) => {
    if (editingStoryId === null) return;

    // Find full story object for relations
    const storyToUpdate = stories[epicId]?.find((s) => s.id === editingStoryId);
    if (!storyToUpdate) {
      alert("Story not found!");
      return;
    }

    // Build payload including relations as nested objects with IDs
    const payload = {
      ...storyToUpdate,
      title: editingStoryData.title,
      status: editingStoryData.status,
      epic: storyToUpdate.epic ? { id: (storyToUpdate.epic as any).id || storyToUpdate.epic } : undefined,
      reporter: storyToUpdate.reporter
        ? { id: (storyToUpdate.reporter as any).id || storyToUpdate.reporter }
        : undefined,
      project: storyToUpdate.project
        ? { id: (storyToUpdate.project as any).id || storyToUpdate.project }
        : undefined,
      sprint: storyToUpdate.sprint ? { id: (storyToUpdate.sprint as any).id || storyToUpdate.sprint } : undefined,
    };

    axios
      .put(`http://localhost:8080/api/stories/${editingStoryId}`, payload)
      .then(() => {
        setStories((prev) => ({
          ...prev,
          [epicId]: prev[epicId].map((story) =>
            story.id === editingStoryId ? { ...story, ...editingStoryData } : story
          ),
        }));
        cancelEditStory();
      })
      .catch((err) => {
        alert("Failed to update story: " + (err.response?.data || err.message));
      });
  };

  // Editable task handlers
  const startEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingTaskData({ title: task.title, status: task.status });
  };

  const cancelEditTask = () => {
    setEditingTaskId(null);
    setEditingTaskData({ title: "", status: "" });
  };

  const saveEditTask = (storyId: number) => {
    if (editingTaskId === null) return;

    // Find full task object for relations
    const taskToUpdate = tasks[storyId]?.find((t) => t.id === editingTaskId);
    if (!taskToUpdate) {
      alert("Task not found!");
      return;
    }

    // Build payload including relations as nested objects with IDs
    const payload = {
      ...taskToUpdate,
      title: editingTaskData.title,
      status: editingTaskData.status,
      project: taskToUpdate.project ? { id: (taskToUpdate.project as any).id || taskToUpdate.project } : undefined,
      reporter: taskToUpdate.reporter ? { id: (taskToUpdate.reporter as any).id || taskToUpdate.reporter } : undefined,
      story: taskToUpdate.story ? { id: (taskToUpdate.story as any).id || taskToUpdate.story } : undefined,
      sprint: taskToUpdate.sprint ? { id: (taskToUpdate.sprint as any).id || taskToUpdate.sprint } : undefined,
      assignee: taskToUpdate.assignee ? { id: (taskToUpdate.assignee as any).id || taskToUpdate.assignee } : undefined,
    };

    axios
      .put(`http://localhost:8080/api/tasks/${editingTaskId}`, payload)
      .then(() => {
        setTasks((prev) => ({
          ...prev,
          [storyId]: prev[storyId].map((task) =>
            task.id === editingTaskId ? { ...task, ...editingTaskData } : task
          ),
        }));
        cancelEditTask();
      })
      .catch((err) => {
        alert("Failed to update task: " + (err.response?.data || err.message));
      });
  };

  // Delete handlers (same as before)
  const deleteEpic = (epicId: number) => {
    if (window.confirm("Delete this epic?")) {
      axios
        .delete(`http://localhost:8080/api/epics/${epicId}`)
        .then(() => {
          setEpics((prev) => prev.filter((e) => e.id !== epicId));
        })
        .catch((err) => {
          console.error("DELETE error:", err.response?.data || err.message);
          alert("Failed to delete epic.");
        });
    }
  };

  const deleteStory = (storyId: number, epicId: number) => {
    if (window.confirm("Delete this story?")) {
      axios
        .delete(`http://localhost:8080/api/stories/${storyId}`)
        .then(() => {
          setStories((prev) => ({
            ...prev,
            [epicId]: prev[epicId].filter((s) => s.id !== storyId),
          }));
        })
        .catch((err) => alert("Failed to delete story: " + err.message));
    }
  };

  const deleteTask = (taskId: number, storyId: number) => {
    if (window.confirm("Delete this task?")) {
      axios
        .delete(`http://localhost:8080/api/tasks/${taskId}`)
        .then(() => {
          setTasks((prev) => ({
            ...prev,
            [storyId]: prev[storyId].filter((t) => t.id !== taskId),
          }));
        })
        .catch((err) => alert("Failed to delete task: " + err.message));
    }
  };

  const renderForm = () => {
    switch (issueType) {
      case "EPIC":
        return <CreateEpic onClose={() => setIssueType("")} />;
      case "STORY":
        return <CreateUserStory onClose={() => setIssueType("")} />;
      case "TASK":
        return <CreateTaskModal onClose={() => setIssueType("")} />;
      case "SPRINT":
        return <CreateSprint onClose={() => setIssueType("")} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-6 px-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <div className="relative">
            <button
              onClick={() => setShowDropdown((prev) => !prev)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <Plus size={18} /> Create Issue
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-44 bg-white border rounded-lg shadow-md z-10">
                {["EPIC", "STORY", "TASK"].map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setIssueType(type);
                      setShowDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    {type === "EPIC" && "🧩 Epic"}
                    {type === "STORY" && "📘 User Story"}
                    {type === "TASK" && "✅ Task"}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setIssueType("SPRINT")}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            <Plus size={18} /> Create Sprint
          </button>
        </div>
      </div>

      <div className="transition-all duration-300">{renderForm()}</div>

      <div className="p-6 bg-gray-50 rounded shadow mt-8">
        <h3 className="text-2xl font-bold mb-4">Summary for {projectName}</h3>

        {epics.length === 0 && <p>No epics found.</p>}

        <div className="space-y-4">
          {Array.isArray(epics) &&
            epics.map((epic) => (
              <div key={epic.id} className="border p-4 rounded bg-white shadow">
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => fetchStories(epic.id)}
                >
                  {editingEpicId === epic.id ? (
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={editingEpicData.name}
                        onChange={(e) =>
                          setEditingEpicData((d) => ({ ...d, name: e.target.value }))
                        }
                        className="border rounded px-2 py-1"
                        placeholder="Epic Name"
                      />
                      <select
                        value={editingEpicData.status}
                        onChange={(e) =>
                          setEditingEpicData((d) => ({ ...d, status: e.target.value }))
                        }
                        className="border rounded px-2 py-1"
                      >
                        <option value="PLANNING">PLANNING</option>
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="COMPLETED">COMPLETED</option>
                      </select>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          saveEditEpic();
                        }}
                        className="text-green-600 hover:underline"
                      >
                        Save
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          cancelEditEpic();
                        }}
                        className="text-red-600 hover:underline"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="font-semibold text-lg text-blue-600">
                        🧩 Epic: {epic.name} ({epic.status})
                      </span>
                      <div className="flex gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditEpic(epic);
                          }}
                          className="text-blue-600 hover:underline"
                          title="Edit epic"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteEpic(epic.id);
                          }}
                          className="text-red-600 hover:underline"
                          title="Delete epic"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {expandedEpicId === epic.id && (
                  <div className="ml-6 mt-2 space-y-2">
                    {(stories[epic.id]?.length ?? 0) === 0 && (
                      <p className="text-gray-500">No stories.</p>
                    )}

                    {stories[epic.id]?.map((story) => (
                      <div key={story.id} className="border p-3 rounded bg-gray-50">
                        <div
                          className="flex justify-between items-center cursor-pointer"
                          onClick={() => fetchTasks(story.id)}
                        >
                          {editingStoryId === story.id ? (
                            <div className="flex gap-2 items-center w-full">
                              <input
                                type="text"
                                value={editingStoryData.title}
                                onChange={(e) =>
                                  setEditingStoryData((d) => ({ ...d, title: e.target.value }))
                                }
                                className="border rounded px-2 py-1 flex-grow"
                                placeholder="Story Title"
                              />
                              <select
                                value={editingStoryData.status}
                                onChange={(e) =>
                                  setEditingStoryData((d) => ({ ...d, status: e.target.value }))
                                }
                                className="border rounded px-2 py-1"
                              >
                                <option value="BACKLOG">BACKLOG</option>
                                <option value="TODO">TODO</option>
                                <option value="IN_PROGRESS">INPROGRESS</option>
                                <option value="DONE">DONE</option>
                              </select>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  saveEditStory(epic.id);
                                }}
                                className="text-green-600 hover:underline"
                              >
                                Save
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  cancelEditStory();
                                }}
                                className="text-red-600 hover:underline"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <>
                              <span className="text-gray-700 font-medium">
                                📘 Story: {story.title} ({story.status})
                              </span>
                              <div className="flex gap-3">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEditStory(story);
                                  }}
                                  className="text-blue-600 hover:underline"
                                  title="Edit story"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteStory(story.id, epic.id);
                                  }}
                                  className="text-red-600 hover:underline"
                                  title="Delete story"
                                >
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>

                        {expandedStoryId === story.id && (
                          <div className="ml-6 mt-2 space-y-1">
                            {(tasks[story.id]?.length ?? 0) === 0 && (
                              <p className="text-gray-400">No tasks.</p>
                            )}
                            {tasks[story.id]?.map((task) => (
                              <div
                                key={task.id}
                                className="bg-white border rounded p-2 flex justify-between items-center"
                              >
                                {editingTaskId === task.id ? (
                                  <>
                                    <input
                                      type="text"
                                      value={editingTaskData.title}
                                      onChange={(e) =>
                                        setEditingTaskData((d) => ({
                                          ...d,
                                          title: e.target.value,
                                        }))
                                      }
                                      className="border rounded px-2 py-1 flex-grow mr-2"
                                    />
                                    <select
                                      value={editingTaskData.status}
                                      onChange={(e) =>
                                        setEditingTaskData((d) => ({
                                          ...d,
                                          status: e.target.value,
                                        }))
                                      }
                                      className="border rounded px-2 py-1 mr-2"
                                    >
                                      <option value="BACKLOG">BACKLOG</option>
                                      <option value="TODO">TODO</option>
                                      <option value="IN_PROGRESS">INPROGRESS</option>
                                      <option value="DONE">DONE</option>
                                    </select>
                                    <button
                                      onClick={() => saveEditTask(story.id)}
                                      className="text-green-600 hover:underline mr-1"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => cancelEditTask()}
                                      className="text-red-600 hover:underline"
                                    >
                                      Cancel
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <span className="flex-grow text-gray-800">
                                      ✅ {task.title} ({task.status})
                                    </span>
                                    <div className="flex gap-3">
                                      <button
                                        onClick={() => startEditTask(task)}
                                        className="text-blue-600 hover:underline"
                                        title="Edit task"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => deleteTask(task.id, story.id)}
                                        className="text-red-600 hover:underline"
                                        title="Delete task"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Backlog;
 