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

interface SummaryProps {
  projectId: number;
  projectName: string;
}

interface Task {
  id: number;
  title: string;
  status: string;
  storyId: number;
}

interface Story {
  id: number;
  title: string;
  status: string;
  epicId: number;
  tasks?: Task[];
}

interface Epic {
  id: number;
  name: string;
  status: string;
  stories?: Story[];
}

const COLORS = ['#4c1d95', '#9d174d', '#6366f1', '#ec4899', '#10b981', '#f59e0b'];

const Summary: React.FC<SummaryProps> = ({ projectId, projectName }) => {
  const [epics, setEpics] = useState<Epic[]>([]);
  const [expandedEpicId, setExpandedEpicId] = useState<number | null>(null);
  const [expandedStoryId, setExpandedStoryId] = useState<number | null>(null);
  const [chartType, setChartType] = useState<'pie' | 'donut' | 'bar'>('pie');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [epicRes, storyRes, taskRes] = await Promise.all([
          axios.get(`http://localhost:8080/api/projects/${projectId}/epics`),
          axios.get(`http://localhost:8080/api/projects/${projectId}/stories`),
          axios.get(`http://localhost:8080/api/projects/${projectId}/tasks`),
        ]);

        const epicsData: Epic[] = epicRes.data;
        const storiesData: Story[] = storyRes.data;
        const tasksData: Task[] = taskRes.data;

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

  const prepareStatusData = <T extends { status: string }>(
    items: T[] | undefined
  ) => {
    const flatItems = items ?? [];

    const filteredItems =
      filterStatus === 'ALL'
        ? flatItems
        : flatItems.filter((item) => item.status === filterStatus);

    const statusCount = filteredItems.reduce<Record<string, number>>((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statusCount).map(([status, count]) => ({
      name: status,
      value: count,
    }));
  };

  const renderChart = (data: any[], title: string) => (
    <div className="bg-white rounded-xl shadow p-4 w-full md:w-[30%]">
      <h4 className="text-lg font-semibold text-indigo-900 mb-3">{title}</h4>
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

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h3 className="text-3xl font-bold mb-6 text-black-800">
        Summary for <span className="text-black-900">{projectName}</span>
      </h3>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <select
          value={chartType}
          onChange={(e) => setChartType(e.target.value as any)}
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

      <div className="flex flex-wrap gap-6 mb-8">
        {renderChart(prepareStatusData(epics), 'Epics Status')}
        {renderChart(
          prepareStatusData(epics.flatMap((e) => e.stories || [])),
          'Stories Status'
        )}
        {renderChart(
          prepareStatusData(
            epics.flatMap((e) => e.stories?.flatMap((s) => s.tasks || []) || [])
          ),
          'Tasks Status'
        )}
      </div>

      <div className="space-y-6">
        {epics.map((epic) => (
          <div
            key={epic.id}
            className="border border-gray-200 rounded-xl bg-gradient-to-br from-white to-gray-100 shadow-md p-6"
          >
            <div
              className="cursor-pointer flex items-center justify-between hover:bg-gray-100 p-2 rounded-md transition"
              onClick={() =>
                setExpandedEpicId(expandedEpicId === epic.id ? null : epic.id)
              }
            >
              <span className="text-xl font-semibold text-indigo-900">
                Epic: {epic.name}
              </span>
              <span className="text-sm text-white bg-indigo-900 px-3 py-1 rounded-full">
                {epic.status}
              </span>
            </div>

            {expandedEpicId === epic.id &&
              epic.stories?.map((story) => (
                <div
                  key={story.id}
                  className="ml-6 mt-4 border-l-2 border-indigo-900 pl-4 py-2"
                >
                  <div
                    className="cursor-pointer flex items-center justify-between hover:bg-gray-50 p-2 rounded-md transition"
                    onClick={() =>
                      setExpandedStoryId(
                        expandedStoryId === story.id ? null : story.id
                      )
                    }
                  >
                    <span className="text-gray-700">
                      Story: <span className="font-medium">{story.title}</span>
                    </span>
                    <span className="text-sm text-white bg-pink-800 px-3 py-1 rounded-full">
                      {story.status}
                    </span>
                  </div>

                  {expandedStoryId === story.id &&
                    story.tasks?.map((task) => (
                      <div
                        key={task.id}
                        className="ml-6 mt-2 flex items-center justify-between text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-md shadow-sm"
                      >
                        <span>Task: {task.title}</span>
                        <span className="text-xs bg-indigo-100 text-indigo-900 px-2 py-1 rounded-full">
                          {task.status}
                        </span>
                      </div>
                    ))}
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Summary;
