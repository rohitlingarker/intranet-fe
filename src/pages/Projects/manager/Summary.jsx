import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#4c1d95', '#9d174d', '#6366f1', '#ec4899', '#10b981', '#f59e0b'];

const Summary = ({ projectId, projectName }) => {
  const [epics, setEpics] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState({});

  const token = localStorage.getItem('token');
  

  useEffect(() => {
    const fetchAll = async () => {
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

        // Attach tasks to stories
        const enrichedStories = storiesData.map((story) => ({
          ...story,
          tasks: tasksData.filter((task) => task.storyId === story.id),
        }));

        // Attach stories to epics
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
  }, [projectId, token]);

  const prepareStatusData = (items) => {
    const filteredItems =
      filterStatus === 'ALL'
        ? items
        : items.filter((item) => item.status === filterStatus);

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

  const toggleExpand = (type, id) => {
    setExpandedItems((prev) => ({
      ...prev,
      [`${type}-${id}`]: !prev[`${type}-${id}`],
    }));
  };

  // ✅ Render details without JSON dumps
  const renderDetails = (item) => (
    <div className="mb-1 text-sm text-gray-700">
      {Object.entries(item).map(([key, value]) => {
        if (key === 'id') return null;

        if (key === 'epicId') {
          return (
            <div key={key}>
              <strong>Epic:</strong>{' '}
              {epics.find((e) => e.id === value)?.name || 'N/A'}
            </div>
          );
        }

        if (key === 'storyId') {
          return (
            <div key={key}>
              <strong>Story:</strong>{' '}
              {allStories.find((s) => s.id === value)?.title || 'N/A'}
            </div>
          );
        }

        if (key === 'projectId') {
          return (
            <div key={key}>
              <strong>Project:</strong> {projectName || 'N/A'}
            </div>
          );
        }

        if (key === 'sprintId') {
          return (
            <div key={key}>
              <strong>Sprint:</strong> Sprint {value}
            </div>
          );
        }

        // ✅ Show only useful fields from nested objects
        if (typeof value === 'object' && value !== null) {
          const displayValue = value.name || value.username || value.title;
          if (!displayValue) return null; // skip unknown objects
          return (
            <div key={key}>
              <strong>{key.replace(/([A-Z])/g, ' $1')}:</strong>{' '}
              {displayValue}
            </div>
          );
        }

        return (
          <div key={key}>
            <strong>{key.replace(/([A-Z])/g, ' $1')}:</strong>{' '}
            {value ?? 'N/A'}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h3 className="text-xl font-semibold mb-4 text-indigo-900">
        Summary for {projectName}
      </h3>

      {/* Totals */}
      <div className="flex gap-5 mb-6">
        <div className="bg-white text-black px-3 py-3 rounded shadow flex-1 text-center">
          <div className="text-sm font-medium">Total Epics</div>
          <div className="text-2xl font-bold">{epics.length}</div>
        </div>
        <div className="bg-white text-black px-3 py-3 rounded shadow flex-1 text-center">
          <div className="text-sm font-medium">Total Stories</div>
          <div className="text-2xl font-bold">{allStories.length}</div>
        </div>
        <div className="bg-white text-black px-3 py-3 rounded shadow flex-1 text-center">
          <div className="text-sm font-medium">Total Tasks</div>
          <div className="text-2xl font-bold">{allTasks.length}</div>
        </div>
      </div>

      {/* Donut Charts */}
      <div className="flex flex-wrap gap-6 mb-8">
        {[
          { title: 'Epics Status', data: epics },
          { title: 'Stories Status', data: allStories },
          { title: 'Tasks Status', data: allTasks },
        ].map((chart, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow p-4 w-full md:w-[30%]"
          >
            <h4 className="text-base font-semibold text-indigo-900 mb-3">
              {chart.title}
            </h4>
            <ResponsiveContainer width="100%" height={250}>
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
                  {prepareStatusData(chart.data).map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ))}
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
            <h4
              className="text-lg font-bold text-indigo-900 cursor-pointer"
              onClick={() => toggleExpand('epic', epic.id)}
            >
              Epic: {epic.name}{' '}
              <span className="text-sm text-gray-500">
                ({epic.stories.length} stories)
              </span>
            </h4>
            {expandedItems[`epic-${epic.id}`] && (
              <div className="ml-4 mt-2 border-l-2 border-indigo-200 pl-4">
                {renderDetails(epic)}
                {epic.stories.map((story) => (
                  <div key={story.id} className="mb-3">
                    <h5
                      className="text-pink-800 font-semibold cursor-pointer"
                      onClick={() => toggleExpand('story', story.id)}
                    >
                      Story: {story.title}{' '}
                      <span className="text-sm text-gray-500">
                        ({story.tasks.length} tasks)
                      </span>
                    </h5>
                    {expandedItems[`story-${story.id}`] && (
                      <div className="ml-4 mt-1 border-l border-pink-200 pl-4 list-disc text-emerald-700">
                        {renderDetails(story)}
                        <ul className="list-disc ml-4">
                          {story.tasks.map((task) => (
                            <li
                              key={task.id}
                              className="text-sm cursor-pointer mb-2"
                            >
                              <div
                                onClick={() => toggleExpand('task', task.id)}
                              >
                                Task: {task.title}{' '}
                                <span className="text-gray-500">
                                  [{task.status}]
                                </span>
                              </div>
                              {expandedItems[`task-${task.id}`] && (
                                <div className="ml-4 text-xs text-gray-700">
                                  {renderDetails(task)}
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
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
