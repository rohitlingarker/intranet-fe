"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import LoadingSpinner from "../../../components/LoadingSpinner";

const COLORS = ["#4c1d95", "#9d174d", "#6366f1", "#ec4899", "#10b981", "#f59e0b"];

const Summary = ({ projectId, projectName }) => {
  const [epics, setEpics] = useState([]);
  const [stories, setStories] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedItems, setExpandedItems] = useState({});

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const base = import.meta.env.VITE_PMS_BASE_URL;

        const [epicRes, storyRes, taskRes, bugRes] = await Promise.all([
          axios.get(`${base}/api/projects/${projectId}/epics`, { headers }),
          axios.get(`${base}/api/projects/${projectId}/stories`, { headers }),
          axios.get(`${base}/api/projects/${projectId}/tasks`, { headers }),
          axios.get(`${base}/api/bugs/project/${projectId}`, { headers }),
        ]);

        const epicsData = epicRes.data;
        const storiesData = storyRes.data;
        const tasksData = taskRes.data;
        const bugsData = bugRes.data;

        const enrichedStories = storiesData.map((story) => ({
          ...story,
          tasks: tasksData.filter((t) => t.storyId === story.id),
        }));

        const enrichedEpics = epicsData.map((epic) => ({
          ...epic,
          stories: enrichedStories.filter((s) => s.epicId === epic.id),
        }));

        setEpics(enrichedEpics);
        setStories(storiesData);
        setTasks(tasksData);
        setBugs(bugsData);
      } catch (err) {
        console.error("Failed to fetch project summary:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [projectId, token]);

  /** ---------- Helpers ---------- **/

  const prepareStatusData = (items) => {
    const statusCount = items.reduce((acc, i) => {
      acc[i.status] = (acc[i.status] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(statusCount).map(([status, value]) => ({ name: status, value }));
  };

  const preparePriorityData = () => {
    const group = (items) =>
      items.reduce((acc, i) => {
        acc[i.priority || "Unspecified"] = (acc[i.priority || "Unspecified"] || 0) + 1;
        return acc;
      }, {});

    const taskData = group(tasks);
    const storyData = group(stories);
    const bugData = group(bugs);

    const priorities = Array.from(
      new Set([...Object.keys(taskData), ...Object.keys(storyData), ...Object.keys(bugData)])
    );

    return priorities.map((p) => ({
      priority: p,
      Tasks: taskData[p] || 0,
      Stories: storyData[p] || 0,
      Bugs: bugData[p] || 0,
    }));
  };

  const prepareEpicProgressData = () => {
    return epics.map((epic) => {
      const epicStories = stories.filter((s) => s.epicId === epic.id);
      const totalStories = epicStories.length;
      const completedStories = epicStories.filter((s) => s.status === "DONE").length;
      const progress = totalStories > 0 ? (completedStories / totalStories) * 100 : 0;
      return { name: epic.name, Progress: Math.round(progress) };
    });
  };

  const prepareWorkDistributionData = () => {
    const assigned = tasks.filter((t) => t.assigneeId).length;
    const unassigned = tasks.filter((t) => !t.assigneeId).length;
    return [
      { name: "Assigned", value: assigned },
      { name: "Unassigned", value: unassigned },
    ];
  };

  const toggleExpand = (type, id) => {
    setExpandedItems((prev) => ({
      ...prev,
      [`${type}-${id}`]: !prev[`${type}-${id}`],
    }));
  };

  const renderDetails = (item) => {
    const exclude = ["id", "epicId", "storyId", "projectId", "sprintId", "tasks", "stories"];
    return (
      <div className="overflow-x-auto mb-3">
        <table className="w-full text-sm border border-gray-300 rounded shadow-sm">
          <tbody>
            {Object.entries(item).map(([key, val], i) => {
              if (exclude.includes(key)) return null;
              const display =
                typeof val === "object" && val !== null
                  ? val.name || val.username || val.title || "N/A"
                  : val;
              return (
                <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                  <td className="px-3 py-2 font-semibold border-b border-gray-200 capitalize">
                    {key.replace(/([A-Z])/g, " $1")}
                  </td>
                  <td className="px-3 py-2 border-b border-gray-200">{display ?? "N/A"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <LoadingSpinner text="Loading Project Summary..." />
      </div>
    );
  }

  /** ---------- Render ---------- **/
  const filteredEpics = epics.filter((e) =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-indigo-900">
        Project Summary: {projectName}
      </h2>

      {/* Totals */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Epics", value: epics.length },
          { label: "Stories", value: stories.length },
          { label: "Tasks", value: tasks.length },
          { label: "Bugs", value: bugs.length },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-white shadow rounded-lg p-4 text-center hover:shadow-lg transition"
          >
            <div className="text-gray-600 font-medium">{item.label}</div>
            <div className="text-3xl font-bold text-indigo-900">{item.value}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {/* Priority Distribution */}
        <div className="bg-white rounded-lg shadow p-4 hover:shadow-xl transition">
          <h4 className="font-semibold text-indigo-900 mb-3">Priority Distribution</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={preparePriorityData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="priority" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Tasks" fill="#6366f1" />
              <Bar dataKey="Stories" fill="#ec4899" />
              <Bar dataKey="Bugs" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Epic Progress */}
        <div className="bg-white rounded-lg shadow p-4 hover:shadow-xl transition">
          <h4 className="font-semibold text-indigo-900 mb-3">Epic Progress</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={prepareEpicProgressData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="Progress" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Work Distribution */}
        <div className="bg-white rounded-lg shadow p-4 hover:shadow-xl transition">
          <h4 className="font-semibold text-indigo-900 mb-3">Work Distribution</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={prepareWorkDistributionData()}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {prepareWorkDistributionData().map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search Epics..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-indigo-200"
        />
      </div>

      {/* Nested Epics/Stories/Tasks */}
      <div className="space-y-4">
        {filteredEpics.map((epic) => (
          <div key={epic.id} className="bg-white rounded shadow p-4 hover:shadow-lg transition">
            <div
              className="text-lg font-bold text-indigo-900 cursor-pointer flex justify-between items-center"
              onClick={() => toggleExpand("epic", epic.id)}
            >
              <span>Epic: {epic.name}</span>
              <span className="text-gray-500 text-sm">
                {epic.stories.length} stories
              </span>
            </div>

            {expandedItems[`epic-${epic.id}`] && (
              <div className="ml-4 mt-3 border-l-2 border-indigo-300 pl-4 space-y-3">
                {renderDetails(epic)}
                {epic.stories.map((story) => (
                  <div
                    key={story.id}
                    className="bg-gray-50 rounded p-2 hover:bg-gray-100"
                  >
                    <div
                      className="font-semibold text-pink-800 cursor-pointer flex justify-between"
                      onClick={() => toggleExpand("story", story.id)}
                    >
                      <span>Story: {story.title}</span>
                      <span className="text-gray-500 text-sm">
                        {story.tasks.length} tasks
                      </span>
                    </div>
                    {expandedItems[`story-${story.id}`] && (
                      <div className="ml-4 mt-2 border-l border-pink-200 pl-4 space-y-2">
                        {renderDetails(story)}
                        {story.tasks.map((task) => (
                          <div
                            key={task.id}
                            className="bg-white rounded p-2 shadow-sm hover:shadow-md"
                          >
                            <div
                              className="text-sm font-medium cursor-pointer flex justify-between"
                              onClick={() => toggleExpand("task", task.id)}
                            >
                              <span>Task: {task.title}</span>
                              <span className="text-gray-500">[{task.status}]</span>
                            </div>
                            {expandedItems[`task-${task.id}`] && (
                              <div className="ml-4 mt-1 text-xs text-gray-700">
                                {renderDetails(task)}
                              </div>
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
  );
};

export default Summary;
