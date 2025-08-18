import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
  ResponsiveContainer,
} from 'recharts';
 
const COLORS = ['#4c1d95', '#9d174d', '#6366f1', '#ec4899', '#10b981', '#f59e0b'];
 
const Summary = ({ projectId, projectName }) => {
  const [epics, setEpics] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
 
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [epicRes, storyRes, taskRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/epics`),
          axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/stories`),
          axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/tasks`),
        ]);
 
        const epicsData = epicRes.data;
        const storiesData = storyRes.data;
        const tasksData = taskRes.data;
 
        const enrichedStories = storiesData.map((story) => ({
          ...story,
          tasks: tasksData.filter((task) => task.storyId === story.id),
        }));
 
        const enrichedEpics = epicsData.map((epic) => ({
          ...epic,
          stories: enrichedStories.filter((story) => story.epicId === epic.id),
        }));
 
        setEpics(enrichedEpics);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };
 
    fetchAll();
  }, [projectId]);
 
  const prepareStatusData = (items) => {
    const flatItems = items ?? [];
    const filteredItems =
      filterStatus === 'ALL'
        ? flatItems
        : flatItems.filter((item) => item.status === filterStatus);
 
    const statusCount = filteredItems.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});
 
    return Object.entries(statusCount).map(([status, count]) => ({
      name: status,
      value: count,
    }));
  };
 
  const allStories = epics.flatMap((e) => e.stories || []);
  const allTasks = allStories.flatMap((s) => s.tasks || []);
 
  const filteredEpics = epics.filter((epic) =>
    epic.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
 
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h3 className="text-xl font-semibold mb-4 text-indigo-900">
        Summary for {projectName}
      </h3>
 
      {/* Totals */}
      <div className="flex gap-8 mb-6">
        <div className="bg-white text-black px-4 py-3 rounded shadow w-1/3 text-center">
          <div className="text-sm font-medium">Total Epics</div>
          <div className="text-2xl font-bold">{epics.length}</div>
        </div>
        <div className="bg-white text-black px-4 py-3 rounded shadow w-1/3 text-center">
          <div className="text-sm font-medium">Total Stories</div>
          <div className="text-2xl font-bold">{allStories.length}</div>
        </div>
        <div className="bg-white text-black px-4 py-3 rounded shadow w-1/3 text-center">
          <div className="text-sm font-medium">Total Tasks</div>
          <div className="text-2xl font-bold">{allTasks.length}</div>
        </div>
      </div>
 
      {/* Status Charts */}
      <div className="flex flex-wrap gap-6 mb-8">
        {/* Epics - Bar Chart */}
        <div className="bg-white rounded-xl shadow p-4 w-full md:w-[30%]">
          <h4 className="text-base font-semibold text-indigo-900 mb-3">Epics Status</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={prepareStatusData(epics)}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#4c1d95" />
            </BarChart>
          </ResponsiveContainer>
        </div>
 
        {/* Stories - Donut Chart */}
        <div className="bg-white rounded-xl shadow p-4 w-full md:w-[30%]">
          <h4 className="text-base font-semibold text-pink-800 mb-3">Stories Status</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={prepareStatusData(allStories)}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                label
              >
                {prepareStatusData(allStories).map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
 
        {/* Tasks - Pie Chart */}
        <div className="bg-white rounded-xl shadow p-4 w-full md:w-[30%]">
          <h4 className="text-base font-semibold text-emerald-800 mb-3">Tasks Status</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={prepareStatusData(allTasks)}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {prepareStatusData(allTasks).map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
 
      {/* Search Box */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search Epics..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border rounded-md w-full md:w-1/3"
        />
      </div>
 
      {/* Nested List */}
      <div>
        {filteredEpics.map((epic) => (
          <div key={epic.id} className="mb-6 p-4 bg-white rounded shadow">
            <h4 className="text-lg font-bold text-indigo-900">
              {epic.name} <span className="text-sm text-gray-500">({epic.stories.length} stories)</span>
            </h4>
            <div className="ml-4 mt-2 border-l-2 border-indigo-200 pl-4">
              {epic.stories.map((story) => (
                <div key={story.id} className="mb-3">
                  <h5 className="text-pink-800 font-semibold">
                    {story.title} <span className="text-sm text-gray-500">({story.tasks.length} tasks)</span>
                  </h5>
                  <ul className="ml-4 mt-1 border-l border-pink-200 pl-4 list-disc text-emerald-700">
                    {story.tasks.map((task) => (
                      <li key={task.id} className="text-sm">
                        {task.title} <span className="text-gray-500">[{task.status}]</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
 
export default Summary;