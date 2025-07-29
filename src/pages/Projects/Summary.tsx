import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface SummaryProps {
  projectId: number;
  projectName: string;
}

interface StatusCounts {
  total: number;
  done: number;
  inProgress: number;
}

const Summary: React.FC<SummaryProps> = ({ projectId, projectName }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [epicCounts, setEpicCounts] = useState<StatusCounts>({ total: 0, done: 0, inProgress: 0 });
  const [storyCounts, setStoryCounts] = useState<StatusCounts>({ total: 0, done: 0, inProgress: 0 });
  const [taskCounts, setTaskCounts] = useState<StatusCounts>({ total: 0, done: 0, inProgress: 0 });

  useEffect(() => {
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        const [epicsRes, storiesRes, tasksRes] = await Promise.all([
          axios.get(`http://localhost:8080/api/projects/${projectId}/epics`),
          axios.get(`http://localhost:8080/api/projects/${projectId}/sprints`),
          axios.get(`http://localhost:8080/api/projects/${projectId}/tasks`),
        ]);

        const countStatuses = (items: any[]): StatusCounts => {
          const total = items.length;
          const done = items.filter((item) => item.status === 'DONE').length;
          const inProgress = items.filter((item) => item.status === 'IN_PROGRESS').length;
          return { total, done, inProgress };
        };

        setEpicCounts(countStatuses(epicsRes.data));
        setStoryCounts(countStatuses(storiesRes.data));
        setTaskCounts(countStatuses(tasksRes.data));
      } catch (err) {
        console.error('Failed to load summary data:', err);
        setError('Failed to load project summary data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  if (loading) return <div className="p-6">Loading summary...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  const StatusCard: React.FC<{ title: string; counts: StatusCounts }> = ({ title, counts }) => {
    const donePercent = counts.total ? (counts.done / counts.total) * 100 : 0;
    const inProgressPercent = counts.total ? (counts.inProgress / counts.total) * 100 : 0;
    return (
      <div className="bg-white p-4 rounded shadow-md w-full max-w-sm">
        <h4 className="text-lg font-semibold mb-2">{title}</h4>
        <p>Total: <strong>{counts.total}</strong></p>
        <p>Done: <strong>{counts.done}</strong></p>
        <p>In Progress: <strong>{counts.inProgress}</strong></p>

        <div className="mt-3 h-4 bg-gray-200 rounded overflow-hidden flex">
          <div
            className="h-4 bg-green-500"
            style={{ width: `${donePercent}%` }}
            title={`Done: ${counts.done}`}
          />
          <div
            className="h-4 bg-yellow-400"
            style={{ width: `${inProgressPercent}%` }}
            title={`In Progress: ${counts.inProgress}`}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <h3 className="text-2xl font-bold mb-6">Summary for {projectName}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatusCard title="Epics" counts={epicCounts} />
        <StatusCard title="Stories" counts={storyCounts} />
        <StatusCard title="Tasks" counts={taskCounts} />
      </div>
    </div>
  );
};

export default Summary;
