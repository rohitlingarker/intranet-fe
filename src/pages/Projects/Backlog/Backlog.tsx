import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CreateEpic from "./epic";
import CreateSprint from "./sprint";
import CreateTaskModal from "./tasks";
import CreateUserStory from "./userstory";
import axios from "axios";

interface Epic {
  id: number;
  name: string;
  description: string;
}

interface UserStory {
  id: number;
  title: string;
  description: string;
  epicId?: number;
}

interface Task {
  id: number;
  title: string;
  status: string;
  storyId?: number;
}

export default function Backlog() {
  const { projectId: projectIdStr } = useParams<{ projectId: string }>();

  // Convert projectId string to number
  const projectId = projectIdStr ? Number(projectIdStr) : undefined;

  const [showEpic, setShowEpic] = useState(false);
  const [showSprint, setShowSprint] = useState(false);
  const [showTask, setShowTask] = useState(false);
  const [showUserStory, setShowUserStory] = useState(false);

  const [epics, setEpics] = useState<Epic[]>([]);
  const [stories, setStories] = useState<UserStory[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!projectId || isNaN(projectId)) return;

    const fetchData = async () => {
      try {
        const [epicRes, storyRes, taskRes] = await Promise.all([
          axios.get(`http://localhost:8080/api/projects/${projectId}/epics`),
          axios.get(`http://localhost:8080/api/projects/${projectId}/stories`),
          axios.get(`http://localhost:8080/api/projects/${projectId}/tasks`),
        ]);

        setEpics(Array.isArray(epicRes.data) ? epicRes.data : []);
        setStories(Array.isArray(storyRes.data) ? storyRes.data : []);
        setTasks(Array.isArray(taskRes.data) ? taskRes.data : []);
      } catch (error) {
        console.error("Error fetching backlog data:", error);
      }
    };

    fetchData();
  }, [projectId]);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Backlog Management</h1>

      {/* Button Group */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={() => setShowEpic(!showEpic)}
        >
          {showEpic ? "Hide Epic" : "Create Epic"}
        </button>

        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={() => setShowSprint(!showSprint)}
        >
          {showSprint ? "Hide Sprint" : "Create Sprint"}
        </button>

        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={() => setShowUserStory(!showUserStory)}
        >
          {showUserStory ? "Hide Story" : "Create Story"}
        </button>

        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={() => setShowTask(!showTask)}
        >
          {showTask ? "Hide Task" : "Create Task"}
        </button>
      </div>

      <div className="space-y-8">
        {showEpic && (
          <div className="p-4 border rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Create Epic</h2>
            <CreateEpic />
          </div>
        )}

        <div className="border rounded p-4 shadow">
          <h2 className="text-xl font-semibold mb-2">Epics</h2>
          {epics.length === 0 ? (
            <p>No epics available.</p>
          ) : (
            <ul className="list-disc list-inside">
              {epics.map((epic) => (
                <li key={epic.id}>
                  <strong>{epic.name}</strong>: {epic.description}
                </li>
              ))}
            </ul>
          )}
        </div>

        {showSprint && (
          <div className="p-4 border rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Create Sprint</h2>
            <CreateSprint />
          </div>
        )}

        {showUserStory && (
          <div className="p-4 border rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Create User Story</h2>
            <CreateUserStory />
          </div>
        )}

        <div className="border rounded p-4 shadow">
          <h2 className="text-xl font-semibold mb-2">User Stories</h2>
          {stories.length === 0 ? (
            <p>No user stories available.</p>
          ) : (
            <ul className="list-disc list-inside">
              {stories.map((story) => (
                <li key={story.id}>
                  <strong>{story.title}</strong>: {story.description}
                  {story.epicId && (
                    <span className="ml-2 text-sm text-gray-500">
                      (Epic ID: {story.epicId})
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {showTask && (
          <div className="p-4 border rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Create Task</h2>
            <CreateTaskModal />
          </div>
        )}

        <div className="border rounded p-4 shadow">
          <h2 className="text-xl font-semibold mb-2">Tasks</h2>
          {tasks.length === 0 ? (
            <p>No tasks available.</p>
          ) : (
            <ul className="list-disc list-inside">
              {tasks.map((task) => (
                <li key={task.id}>
                  <strong>{task.title}</strong> - {task.status}
                  {task.storyId && (
                    <span className="ml-2 text-sm text-gray-500">
                      (Story ID: {task.storyId})
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
