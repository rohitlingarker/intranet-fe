import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Button from "../../../../components/Button/Button";

const IssueTracker = () => {
  const { projectId: paramProjectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // projectId can come from URL or from Backlog navigate state
  const projectId = location.state?.projectId || paramProjectId;

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // Fetch Epics, Stories, Tasks
  const fetchIssues = async () => {
    try {
      setLoading(true);

      const [epicsRes, storiesRes, tasksRes] = await Promise.all([
        axios.get(
          `${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/epics`,
          { headers }
        ),
        axios.get(
          `${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/stories`,
          { headers }
        ),
        axios.get(
          `${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/tasks`,
          { headers }
        ),
      ]);

      const epics = epicsRes.data.map((e) => ({ ...e, type: "Epic" }));
      const stories = storiesRes.data.map((s) => ({ ...s, type: "Story" }));
      const tasks = tasksRes.data.map((t) => ({ ...t, type: "Task" }));

      setIssues([...epics, ...stories, ...tasks]);
    } catch (err) {
      console.error("Failed to fetch issues", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) fetchIssues();
  }, [projectId]);

  // Stats
  const totalIssues = issues.length;
  const openIssues = issues.filter((i) => i.status === "OPEN").length;
  const inProgress = issues.filter((i) => i.status === "IN_PROGRESS").length;
  const resolved = issues.filter(
    (i) => i.status === "RESOLVED" || i.status === "CLOSED"
  ).length;
  const highPriority = issues.filter((i) => i.priority === "HIGH").length;

  return (
    <div className="max-w-6xl mx-auto mt-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium text-indigo-900">
          Issue Tracker (Project {projectId})
        </h1>
        <Button
          size="medium"
          variant="primary"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          Back to Backlog
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <SummaryCard title="Total Issues" count={totalIssues} />
        <SummaryCard title="Open Issues" count={openIssues} />
        <SummaryCard title="In Progress" count={inProgress} />
        <SummaryCard title="Resolved/Closed" count={resolved} />
        <SummaryCard title="High Priority Issue" count={highPriority} />
      </div>

      {/* Issues Table */}
      <div className="bg-white border rounded-lg shadow-sm overflow-x-auto">
        {loading ? (
          <p className="p-4">Loading issues...</p>
        ) : (
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2 text-left">Issue ID</th>
                <th className="border px-3 py-2 text-left">Title</th>
                <th className="border px-3 py-2 text-left">Project</th>
                <th className="border px-3 py-2 text-left">Type</th>
                <th className="border px-3 py-2 text-left">Priority</th>
                <th className="border px-3 py-2 text-left">Status</th>
                <th className="border px-3 py-2 text-left">Assigned To</th>
                <th className="border px-3 py-2 text-left">Created On</th>
                <th className="border px-3 py-2 text-left">Due Date</th>
                <th className="border px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {issues.length === 0 ? (
                <tr>
                  <td colSpan="10" className="p-4 text-center text-gray-500">
                    No issues found
                  </td>
                </tr>
              ) : (
                issues.map((issue) => (
                  <tr key={`${issue.type}-${issue.id}`}>
                    <td className="border px-3 py-2">{issue.id}</td>
                    <td className="border px-3 py-2">{issue.title}</td>
                    <td className="border px-3 py-2">{projectId}</td>
                    <td className="border px-3 py-2">{issue.type}</td>
                    <td className="border px-3 py-2">{issue.priority}</td>
                    <td className="border px-3 py-2">{issue.status}</td>
                    <td className="border px-3 py-2">
                      {issue.assignedTo || "-"}
                    </td>
                    <td className="border px-3 py-2">
                      {issue.createdOn || "-"}
                    </td>
                    <td className="border px-3 py-2">{issue.dueDate || "-"}</td>
                    <td className="border px-3 py-2 space-x-2">
                      <button className="text-blue-600">view</button>
                      <button className="text-green-600">edit</button>
                      <button className="text-yellow-600">close</button>
                      <button className="text-red-600">delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const SummaryCard = ({ title, count }) => (
  <div className="border-2 border-gray-300 rounded-lg p-4 text-center bg-white shadow-sm">
    <h4 className="text-sm font-medium text-gray-700">{title}</h4>
    <p className="text-xl font-bold">{count}</p>
  </div>
);

export default IssueTracker;
