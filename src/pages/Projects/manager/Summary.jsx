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
  const [chartType, setChartType] = useState('pie');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [epicRes, storyRes, taskRes] = await Promise.all([
          axios.get(`http://localhost:8080/api/projects/${projectId}/epics`),
          axios.get(`http://localhost:8080/api/projects/${projectId}/stories`),
          axios.get(`http://localhost:8080/api/projects/${projectId}/tasks`),
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

  // Prepare data for charts with filter
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

  const renderChart = (data, title) => (
    <div className="bg-white rounded-xl shadow p-4 w-full md:w-[30%]">
      <h4 className="text-base font-semibold text-black mb-3">{title}</h4>
      <ResponsiveContainer width="100%" height={250}>
        {chartType === 'bar' ? (
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#db2777" />
          </BarChart>
        ) : (
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={chartType === 'donut' ? 80 : 100}
              innerRadius={chartType === 'donut' ? 40 : 0}
              fill="#4c1d95"
              label
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  );

  // Flatten all stories and tasks for totals and timeline
  const allStories = epics.flatMap((e) => e.stories || []);
  const allTasks = allStories.flatMap((s) => s.tasks || []);

  // Sort function fallback if no dates present:
  const sortByDateOrId = (a, b) => {
    if (a.startDate && b.startDate) {
      return new Date(a.startDate) - new Date(b.startDate);
    }
    return a.id - b.id;
  };

  const sortedEpics = [...epics].sort(sortByDateOrId);
  const sortedStories = [...allStories].sort(sortByDateOrId);
  const sortedTasks = [...allTasks].sort(sortByDateOrId);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h3 className="text-xl font-semibold mb-4 text-black">
        Summary for <span className="font-bold">{projectName}</span>
      </h3>

      {/* Totals */}
      <div className="flex gap-8 mb-6">
        <div className="bg-white text-black px-4 py-2 rounded shadow w-1/3 text-center">
          <div className="text-sm font-medium">Total Epics</div>
          <div className="text-2xl font-bold">{epics.length}</div>
        </div>
        <div className="bg-white text-black px-4 py-2 rounded shadow w-1/3 text-center">
          <div className="text-sm font-medium">Total Stories</div>
          <div className="text-2xl font-bold">{allStories.length}</div>
        </div>
        <div className="bg-white text-black px-4 py-2 rounded shadow w-1/3 text-center">
          <div className="text-sm font-medium">Total Tasks</div>
          <div className="text-2xl font-bold">{allTasks.length}</div>
        </div>
      </div>

      {/* Filters and Chart Type */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <select
          value={chartType}
          onChange={(e) => setChartType(e.target.value)}
          className="px-3 py-2 border rounded-md text-sm text-gray-700"
        >
          <option value="pie">Pie</option>
          <option value="donut">Donut</option>
          <option value="bar">Bar</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border rounded-md text-sm text-gray-700"
        >
          <option value="ALL">All Statuses</option>
          <option value="NEW">New</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {/* Status Charts */}
      <div className="flex flex-wrap gap-6 mb-8">
        {renderChart(prepareStatusData(epics), 'Epics Status')}
        {renderChart(prepareStatusData(allStories), 'Stories Status')}
        {renderChart(prepareStatusData(allTasks), 'Tasks Status')}
      </div>

      {/* Cards View replacing timeline */}
      <div>
        <h4 className="text-base font-semibold mb-4 text-black">Summary Details</h4>

        {/* Epics Cards */}
        <section className="mb-8">
          <h5 className="text-indigo-900 font-semibold mb-3">Epics</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {sortedEpics.map((epic) => (
              <div
                key={epic.id}
                className="bg-indigo-50 rounded-lg p-4 shadow hover:shadow-md transition"
                title={`Status: ${epic.status}`}
              >
                <div className="text-indigo-900 font-semibold mb-1">{epic.name}</div>
                <div className="text-sm text-indigo-700">
                  Status: <span className="font-medium">{epic.status}</span>
                </div>
                {epic.startDate && epic.endDate && (
                  <div className="text-xs text-gray-600 mt-1">
                    {new Date(epic.startDate).toLocaleDateString()} -{' '}
                    {new Date(epic.endDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Stories Cards */}
        <section className="mb-8">
          <h5 className="text-pink-800 font-semibold mb-3">Stories</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {sortedStories.map((story) => (
              <div
                key={story.id}
                className="bg-pink-50 rounded-lg p-4 shadow hover:shadow-md transition"
                title={`Status: ${story.status}`}
              >
                <div className="text-pink-800 font-semibold mb-1">{story.title}</div>
                <div className="text-sm text-pink-700">
                  Status: <span className="font-medium">{story.status}</span>
                </div>
                {story.startDate && story.endDate && (
                  <div className="text-xs text-gray-600 mt-1">
                    {new Date(story.startDate).toLocaleDateString()} -{' '}
                    {new Date(story.endDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Tasks Cards */}
        <section>
          <h5 className="text-indigo-700 font-semibold mb-3">Tasks</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {sortedTasks.map((task) => (
              <div
                key={task.id}
                className="bg-indigo-100 rounded-lg p-4 shadow hover:shadow-md transition"
                title={`Status: ${task.status}`}
              >
                <div className="text-indigo-700 font-semibold mb-1">{task.title}</div>
                <div className="text-sm text-indigo-600">
                  Status: <span className="font-medium">{task.status}</span>
                </div>
                {task.startDate && task.endDate && (
                  <div className="text-xs text-gray-600 mt-1">
                    {new Date(task.startDate).toLocaleDateString()} -{' '}
                    {new Date(task.endDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Summary;
