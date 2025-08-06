import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DonutChart from '../../../components/charts/DonutChart';
import CustomBarChart from '../../../components/charts/BarChart';

const COLORS = ['#4c1d95', '#9d174d', '#6366f1', '#ec4899', '#10b981', '#f59e0b'];

const Summary = ({ projectId, projectName }) => {
  const [epics, setEpics] = useState([]);
  const [expandedEpicId, setExpandedEpicId] = useState(null);
  const [expandedStoryId, setExpandedStoryId] = useState(null);
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

  const renderChartComponent = (data, title) => {
    if (!data || data.length === 0) {
      return (
        <div className="bg-white rounded-xl shadow p-4 w-full md:w-[30%] min-h-[300px] flex items-center justify-center">
          <p className="text-sm text-gray-500">{title}: No data available</p>
        </div>
      );
    }

    const Chart = chartType === 'bar' ? CustomBarChart : DonutChart;

    return (
      <div className="bg-white rounded-xl shadow p-4 w-full md:w-[30%] min-h-[300px]">
        <h4 className="text-lg font-semibold text-indigo-900 mb-3">{title}</h4>
        <Chart data={data} />
      </div>
    );
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h3 className="text-3xl font-bold mb-6 text-black-800">
        Summary for <span className="text-black-900">{projectName}</span>
      </h3>

      <div className="sticky top-0 z-10 bg-gray-50 pb-4 mb-4">
        <div className="flex flex-wrap items-center gap-4 mb-2">
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

        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          {["NEW", "IN_PROGRESS", "COMPLETED"].map((status, idx) => (
            <div key={status} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
              {status.replace("_", " ")}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-6 mb-8">
        {renderChartComponent(prepareStatusData(epics), 'Epics Status')}
        {renderChartComponent(
          prepareStatusData(epics.flatMap((e) => e.stories || [])),
          'Stories Status'
        )}
        {renderChartComponent(
          prepareStatusData(epics.flatMap((e) => (e.stories || []).flatMap((s) => s.tasks || []))),
          'Tasks Status'
        )}
      </div>

      <div className="space-y-6">
        {epics.length === 0 && (
          <div className="text-center text-gray-500 italic">No epics found for this project.</div>
        )}

        {epics.map((epic) => {
          const totalTasks = (epic.stories || []).flatMap((s) => s.tasks || []);
          const completedTasks = totalTasks.filter((t) => t.status === 'COMPLETED').length;
          const progressPercent = totalTasks.length > 0
            ? Math.round((completedTasks / totalTasks.length) * 100)
            : 0;

          return (
            <div key={epic.id} className="border border-gray-200 rounded-xl bg-gradient-to-br from-white to-gray-100 shadow-md p-6">
              <div
                className="cursor-pointer flex items-center justify-between hover:bg-gray-100 p-2 rounded-md transition"
                onClick={() => setExpandedEpicId(expandedEpicId === epic.id ? null : epic.id)}
              >
                <span className="text-xl font-semibold text-indigo-900">Epic: {epic.name}</span>
                <span className="text-sm text-white bg-indigo-900 px-3 py-1 rounded-full">{epic.status}</span>
              </div>

              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {completedTasks} of {totalTasks.length} tasks completed ({progressPercent}%)
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {epic.stories?.length ?? 0} stories, {totalTasks.length} tasks
              </p>

              {expandedEpicId === epic.id && (epic.stories || []).map((story) => (
                <div key={story.id} className="ml-6 mt-4 border-l-2 border-indigo-900 pl-4 py-2">
                  <div
                    className="cursor-pointer flex items-center justify-between hover:bg-gray-50 p-2 rounded-md transition"
                    onClick={() => setExpandedStoryId(expandedStoryId === story.id ? null : story.id)}
                  >
                    <span className="text-gray-700">Story: <span className="font-medium">{story.title}</span></span>
                    <span className="text-sm text-white bg-pink-800 px-3 py-1 rounded-full">{story.status}</span>
                  </div>

                  {expandedStoryId === story.id && (story.tasks || []).map((task) => (
                    <div key={task.id} className="ml-6 mt-2 flex items-center justify-between text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-md shadow-sm">
                      <span>Task: {task.title}</span>
                      <span className="text-xs bg-indigo-100 text-indigo-900 px-2 py-1 rounded-full">{task.status}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Summary;
