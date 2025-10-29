import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import LoadingSpinner from '../../../components/LoadingSpinner';

const COLORS = ['#4c1d95', '#9d174d', '#6366f1', '#ec4899', '#10b981', '#f59e0b'];

const Summary = ({ projectId, projectName }) => {
  const [epics, setEpics] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState({});
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true); // Start loading
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [epicRes, storyRes, taskRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/epics`, { headers }),
          axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/stories`, { headers }),
          axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/tasks`, { headers }),
        ]);

        const epicsData = epicRes.data;
        const storiesData = storyRes.data;
        const tasksData = taskRes.data;

        const enrichedStories = storiesData.map(story => ({
          ...story,
          tasks: tasksData.filter(task => task.storyId === story.id),
        }));

        const enrichedEpics = epicsData.map(epic => ({
          ...epic,
          stories: enrichedStories.filter(story => story.epicId === epic.id),
        }));

        setEpics(enrichedEpics);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false); // Always stop loading
      }
    };

    fetchAll();
  }, [projectId, token]);

  const prepareStatusData = (items) => {
    const statusCount = items.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(statusCount).map(([status, value]) => ({ name: status, value }));
  };

  const allStories = epics.flatMap(e => e.stories || []);
  const allTasks = allStories.flatMap(s => s.tasks || []);

  const filteredEpics = epics.filter(epic =>
  (epic.name ?? "").toLowerCase().includes((searchTerm ?? "").toLowerCase())
);

  const toggleExpand = (type, id) => {
    setExpandedItems(prev => ({ ...prev, [`${type}-${id}`]: !prev[`${type}-${id}`] }));
  };

  const renderDetails = (item) => {
    const excludeKeys = [
      'id', 'epicId', 'storyId', 'projectId', 'sprintId', 
      'tasks', 'stories', 'assigneeId', 'reporterId'
    ];
    return (
      <div className="overflow-x-auto mb-3">
        <table className="w-full text-sm border border-gray-300 rounded shadow-lg">
          <tbody>
            {Object.entries(item).map(([key, value], idx) => {
              if (excludeKeys.includes(key)) return null;
              let displayValue =
                typeof value === 'object' && value !== null
                  ? value.name || value.username || value.title || 'N/A'
                  : value;
              return (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50 hover:bg-gray-100' : 'bg-white hover:bg-gray-100'}>
                  <td className="px-4 py-3 font-semibold border-b border-gray-300 w-1/3 capitalize">{key.replace(/([A-Z])/g, ' $1')}</td>
                  <td className="px-4 py-3 border-b border-gray-300 font-medium">{displayValue ?? 'N/A'}</td>
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
        <LoadingSpinner text="Fetching data..." />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-indigo-900">Project Summary: {projectName}</h2>

      {/* Totals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Epics', value: epics.length },
          { label: 'Stories', value: allStories.length },
          { label: 'Tasks', value: allTasks.length },
        ].map((item, idx) => (
          <div key={idx} className="bg-white shadow-md rounded p-4 text-center hover:shadow-xl transition">
            <div className="text-gray-700 font-semibold">{item.label}</div>
            <div className="text-3xl font-bold text-indigo-900">{item.value}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { title: 'Epics Status', data: epics },
          { title: 'Stories Status', data: allStories },
          { title: 'Tasks Status', data: allTasks },
        ].map((chart, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-md p-4 hover:shadow-xl transition">
            <h4 className="font-semibold text-indigo-900 mb-3">{chart.title}</h4>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={prepareStatusData(chart.data)}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  label
                >
                  {prepareStatusData(chart.data).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search Epics..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-indigo-200 focus:outline-none"
        />
      </div>

      {/* Nested List */}
      <div className="space-y-4">
        {filteredEpics.map(epic => (
          <div key={epic.id} className="bg-white rounded shadow p-4 hover:shadow-lg transition">
            <div
              className="text-lg font-bold text-indigo-900 cursor-pointer flex justify-between items-center"
              onClick={() => toggleExpand('epic', epic.id)}
            >
              <span>Epic: {epic.name}</span>
              <span className="text-gray-500 text-sm">{epic.stories.length} stories</span>
            </div>
            {expandedItems[`epic-${epic.id}`] && (
              <div className="ml-4 mt-3 border-l-2 border-indigo-300 pl-4 space-y-3">
                {renderDetails(epic)}
                {epic.stories.map(story => (
                  <div key={story.id} className="bg-gray-50 rounded p-2 hover:bg-gray-100">
                    <div
                      className="font-semibold text-pink-800 cursor-pointer flex justify-between items-center"
                      onClick={() => toggleExpand('story', story.id)}
                    >
                      <span>Story: {story.title}</span>
                      <span className="text-gray-500 text-sm">{story.tasks.length} tasks</span>
                    </div>
                    {expandedItems[`story-${story.id}`] && (
                      <div className="ml-4 mt-2 border-l border-pink-200 pl-4 space-y-2">
                        {renderDetails(story)}
                        {story.tasks.map(task => (
                          <div key={task.id} className="bg-white rounded p-2 shadow-sm hover:shadow-md">
                            <div
                              className="text-sm font-medium cursor-pointer flex justify-between"
                              onClick={() => toggleExpand('task', task.id)}
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
