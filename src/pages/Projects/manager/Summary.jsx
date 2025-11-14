"use client";

import React, { useEffect, useState, useMemo } from "react";
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

// Note: Ensure useMemo is imported from 'react' at the top:
// import React, { useEffect, useState, useMemo } from "react";

const COLORS = [
  "#312e81", "#4338ca", "#4f46e5", "#6366f1",
  "#831843", "#9d174d", "#be185d", "#db2777",
  "#e879f9", "#c026d3",
];

const stageProgressMap = {
  INITIATION: 5,
  PLANNING: 15,
  DESIGN: 30,
  DEVELOPMENT: 65,
  TESTING: 80,
  DEPLOYMENT: 90,
  MAINTENANCE: 98,
  COMPLETED: 100,
};

const stageColorMap = {
  INITIATION: "linear-gradient(90deg, #6366f1, #818cf8)",
  PLANNING: "linear-gradient(90deg, #4338ca, #6366f1)",
  DESIGN: "linear-gradient(90deg, #2563eb, #60a5fa)",
  DEVELOPMENT: "linear-gradient(90deg, #4f46e5, #818cf8)",
  TESTING: "linear-gradient(90deg, #9333ea, #c084fc)",
  DEPLOYMENT: "linear-gradient(90deg, #16a34a, #86efac)",
  MAINTENANCE: "linear-gradient(90deg, #eab308, #facc15)",
  COMPLETED: "linear-gradient(90deg, #22c55e, #86efac)",
};

// Map issue types to a distinct color for the distribution bars
const typeBarColorMap = {
    Task: "#4f46e5", // Indigo
    Story: "#10b981", // Emerald
    Subtask: "#0ea5e9", // Sky
    Epic: "#9333ea", // Violet
    Bug: "#ef4444", // Red
    Other: "#6b7280", // Gray
};


const Summary = ({ projectId, projectName }) => {
  const [epics, setEpics] = useState([]);
  const [stories, setStories] = useState([]);
  // NOTE: If your tasks array includes subtasks, you'll need to separate them.
  // For this code, we'll assume a field like 'isSubtask' or 'type' exists on the task object
  const [tasks, setTasks] = useState([]); 
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectStage, setProjectStage] = useState("");
  const [projectProgress, setProjectProgress] = useState(0);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const base = import.meta.env.VITE_PMS_BASE_URL;

        const projectRes = await axios.get(`${base}/api/projects/${projectId}`, { headers });
        const stage = projectRes.data.currentStage || "INITIATION";
        const upperStage = stage.toUpperCase();

        setProjectStage(upperStage);
        setProjectProgress(stageProgressMap[upperStage] || 0);

        const [epicRes, storyRes, taskRes, bugRes] = await Promise.all([
          axios.get(`${base}/api/projects/${projectId}/epics`, { headers }),
          axios.get(`${base}/api/projects/${projectId}/stories`, { headers }),
          axios.get(`${base}/api/projects/${projectId}/tasks`, { headers }),
          axios.get(`${base}/api/bugs/project/${projectId}`, { headers }),
        ]);

        setEpics(epicRes.data);
        setStories(storyRes.data);
        setTasks(taskRes.data);
        setBugs(bugRes.data);
      } catch (err) {
        console.error("Failed to fetch project summary:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [projectId, token]);

  /** ---------- Chart Data Preparation (Memoized) ---------- **/

  // NEW: Function to prepare data for the "Types of work" distribution chart
  const workItemDistributionData = useMemo(() => {
    // Separate Tasks and Subtasks from the 'tasks' array (assuming a 'type' field)
    const taskItems = tasks.filter(t => t.type?.toLowerCase() === 'task' || !t.type);
    const subtaskItems = tasks.filter(t => t.type?.toLowerCase() === 'subtask');
    
    // Get the raw counts
    const counts = {
      Task: taskItems.length,
      Story: stories.length,
      Subtask: subtaskItems.length,
      Epic: epics.length,
      Bug: bugs.length,
    };

    // Calculate the total number of work items
    const totalItems = Object.values(counts).reduce((sum, count) => sum + count, 0);

    if (totalItems === 0) return [];

    // Calculate percentages and format the data
    const distribution = Object.entries(counts)
      .filter(([, count]) => count > 0) // Only show types that have items
      .map(([type, count]) => {
        const percentage = ((count / totalItems) * 100);
        return {
          type: type,
          count: count,
          percentage: Math.round(percentage),
        };
      });

    // Sort by percentage for cleaner display
    return distribution.sort((a, b) => b.percentage - a.percentage);
  }, [epics, stories, tasks, bugs]);


  const prepareTasksByAssigneeData = useMemo(() => {
    if (!tasks.length) return [];
    const grouped = {};
    tasks.forEach((task) => {
      const name =
        task.assignee?.username ||
        task.assignee?.name ||
        task.assigneeName ||
        "Unassigned";
      grouped[name] = (grouped[name] || 0) + 1;
    });
    return Object.entries(grouped)
      .map(([name, value]) => ({ name: `${name} (${value})`, value }))
      .sort((a, b) => b.value - a.value);
  }, [tasks]);

  const preparePriorityData = useMemo(() => {
    const groupByPriority = (items) => {
      const result = {};
      items.forEach((i) => {
        const p = i.priority || "Unspecified";
        result[p] = (result[p] || 0) + 1;
      });
      return result;
    };

    const taskData = groupByPriority(tasks);
    const storyData = groupByPriority(stories);
    const bugData = groupByPriority(bugs);

    const allPriorities = Array.from(
      new Set([...Object.keys(taskData), ...Object.keys(storyData), ...Object.keys(bugData)])
    );

    return allPriorities.map((p) => ({
      priority: p,
      Tasks: taskData[p] || 0,
      Stories: storyData[p] || 0,
      Bugs: bugData[p] || 0,
    }));
  }, [tasks, stories, bugs]);

  /** ---------- ✅ Updated Types of Work Data (Done vs Remaining) ---------- **/
  const prepareWorkTypeData = () => {
    const getDoneAndRemaining = (items) => {
      if (!items.length) return { done: 0, remaining: 0 };
      const done = items.filter(
        (i) =>
          i.status?.toUpperCase() === "DONE" ||
          i.status?.toUpperCase() === "CLOSED" ||
          i.status?.toUpperCase() === "COMPLETED"
      ).length;
      const total = items.length;
      return {
        done: done,
        remaining:total-done,
      };
    };

    // const epicData = getDoneAndRemaining(epics);
    const storyData = getDoneAndRemaining(stories);
    const taskData = getDoneAndRemaining(tasks);
    const bugData = getDoneAndRemaining(bugs);

    return [
      // { type: "Epics", Done: parseFloat(epicData.done), Remaining: parseFloat(epicData.remaining) },
      { type: "Stories", Done: parseFloat(storyData.done), Remaining: parseFloat(storyData.remaining) },
      { type: "Tasks", Done: parseFloat(taskData.done), Remaining: parseFloat(taskData.remaining) },
      { type: "Bugs", Done: parseFloat(bugData.done), Remaining: parseFloat(bugData.remaining) },
    ];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <LoadingSpinner text="Loading Project Summary..." />
      </div>
    );
  }

  const progressBarColor =
    stageColorMap[projectStage] || "linear-gradient(90deg, #4f46e5, #818cf8)";

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-2 text-indigo-900">
        Project Summary: {projectName}
      </h2>

      { /* Project Stage Progress Bar */}
      <div className="bg-white shadow rounded-lg p-4 mb-8">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-semibold text-indigo-900">Project Stage</h4>
          <span className="text-sm font-medium text-gray-600">
            {projectStage} ({projectProgress}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full">
          <div
            className="h-4 rounded-full transition-all duration-700"
            style={{
              width: `${projectProgress}%`,
              background: progressBarColor,
            }}
          ></div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
            <div className="text-gray-500 font-medium">{item.label}</div>
            <div className="text-3xl font-bold text-indigo-900">
              {item.value}
            </div>
          </div>
        ))}
      </div>

     {/* Charts Section - 2x2 Grid Layout */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
  {/* Priority Distribution */}
  <div className="bg-white rounded-lg shadow p-5 hover:shadow-xl transition">
    <h4 className="font-semibold text-indigo-900 mb-3">Priority Distribution</h4>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={preparePriorityData()}
        margin={{ top: 20, right: 20, left: 10, bottom: 40 }}
        barGap={6}
        barCategoryGap="25%"
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="priority"
          tick={{ fontSize: 12, fill: "#374151" }}
          interval={0}
          angle={-20}
          textAnchor="end"
        />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Legend />
        <Bar dataKey="Tasks" fill="#312e81" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Stories" fill="#9d174d" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Bugs" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>

  {/* Epic Progress */}
  <div className="bg-white rounded-lg shadow p-5 hover:shadow-xl transition">
  <h4 className="font-semibold text-indigo-900 mb-3">Epic Progress</h4>
  <ResponsiveContainer width="100%" height={Math.max(300, epics.length * 50)}>
    <BarChart
      layout="vertical"
      data={epics.map((epic) => ({
        Epic: epic.name,
        Progress: Number(epic.progressPercentage) || 0,
      }))}
      margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis type="number" domain={[0, 100]} unit="%" />
      <YAxis
        dataKey="Epic"
        type="category"
        width={120}
        tick={{ fontSize: 12 }}
      />
      <Tooltip formatter={(v) => [`${v}%`, "Progress"]} />
      <Bar dataKey="Progress" fill="#4f46e5" barSize={25} />
    </BarChart>
  </ResponsiveContainer>
</div>

  {/* Tasks by Assignee */}
  <div className="bg-white rounded-lg shadow p-5 hover:shadow-xl transition">
    <h4 className="font-semibold text-indigo-900 mb-3">Tasks by Assignee</h4>
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={prepareTasksByAssigneeData()}
          cx="50%"
          cy="50%"
          outerRadius={100}
          labelLine={false}
          dataKey="value"
        >
          {prepareTasksByAssigneeData().map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v) => `${v} Tasks`} />
      </PieChart>
    </ResponsiveContainer>
    <div className="flex flex-wrap justify-center gap-2 mt-2">
      {prepareTasksByAssigneeData().map((entry, i) => (
        <div key={i} className="flex items-center space-x-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: COLORS[i % COLORS.length] }}
          />
          <span className="text-xs text-gray-700">{entry.name}</span>
        </div>
      ))}
    </div>
  </div>

  {/* Types of Work (Done vs Remaining) */}
  <div className="bg-white rounded-lg shadow p-5 hover:shadow-xl transition">
  <h4 className="font-semibold text-indigo-900 mb-3">
    Types of Work (Done vs Remaining)
  </h4>
  <ResponsiveContainer width="100%" height={300}>
    <BarChart
      layout="vertical"
      data={prepareWorkTypeData()} // data should have { type, Done, Remaining, Total }
      margin={{ top: 10, right: 20, left: 80, bottom: 10 }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis type="number" allowDecimals={false} />
      <YAxis dataKey="type" type="category" />
      <Tooltip
        formatter={(value, name, props) => [
          `${value} tasks`,
          name === "Done" ? "Completed" : "Remaining",
        ]}
        labelFormatter={(label) => `Type: ${label}`}
      />
      <Legend />
      <Bar dataKey="Done" stackId="a" fill="#312e81" barSize={25} /> {/* indigo-900 */}
      <Bar dataKey="Remaining" stackId="a" fill="#831843" barSize={25} /> {/* pink-900 */}
    </BarChart>
  </ResponsiveContainer>
</div>
</div>


    </div>
  );
};

export default Summary;