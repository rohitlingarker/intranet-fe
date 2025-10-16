import React, { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Button from "../../../../components/Button/Button";
import CommentBox from "../CommentBox";
import { useAuth } from "../../../../contexts/AuthContext";

const ViewSheet = () => {
  const { projectId, type, id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [issue, setIssue] = useState(location.state?.issue || null);
  const [loading, setLoading] = useState(!location.state?.issue);

  const token = localStorage.getItem("token");
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const getEndpoint = () => {
    if (type === "task") return `/api/tasks/${id}`;
    if (type === "story") return `/api/stories/${id}`;
    if (type === "epic") return `/api/epics/${id}`;
    return null;
  };

  useEffect(() => {
    if (!issue) {
      const endpoint = getEndpoint();
      if (!endpoint) return;

      setLoading(true);
      axios
        .get(`${import.meta.env.VITE_PMS_BASE_URL}${endpoint}`, { headers })
        .then((res) => setIssue(res.data))
        .catch((err) => console.error("Failed to fetch issue:", err))
        .finally(() => setLoading(false));
    }
  }, [id, type]);

  if (loading) {
    return <p className="p-6 text-indigo-600 font-medium">Loading {type} details...</p>;
  }

  if (!issue) {
    return <p className="p-6 text-red-500 font-medium">Failed to load {type} details.</p>;
  }

  return (
    <div className="max-w-5xl mx-auto mt-8 px-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent capitalize">
          {type} Details
        </h1>
        <Button
          size="medium"
          variant="primary"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          Back
        </Button>
      </div>

      {/* Issue Card */}
      <div className="bg-white border rounded-xl shadow-md p-8 space-y-6">
        {/* Title */}
        <h2 className="text-2xl font-semibold text-gray-900">
          {issue.title || issue.name || "Untitled"}
        </h2>

        {/* Description */}
        <p className="text-gray-700 leading-relaxed">
          {issue.description || "No description available."}
        </p>

        {/* Grid of details */}
        <dl className="grid grid-cols-2 gap-x-8 gap-y-5 text-sm">
          <Detail label="Status">
            <Badge color="blue">{issue.status || "Unknown"}</Badge>
          </Detail>
          <Detail label="Priority">
            <Badge color="red">{issue.priority || "Not set"}</Badge>
          </Detail>
          <Detail label="Reporter" value={issue.reporter?.name || issue.reporterName} />
          <Detail label="Assignee" value={issue.assignee?.name || issue.assignedTo} />
          <Detail
            label="Created On"
            value={
              issue.createdOn ? new Date(issue.createdOn).toLocaleDateString() : "-"
            }
          />
          <Detail
            label="Due Date"
            value={
              issue.dueDate ? new Date(issue.dueDate).toLocaleDateString() : "-"
            }
          />

          {type === "epic" && (
            <>
              <Detail label="Progress">
                <Badge color="green">{`${issue.progressPercentage || 0}%`}</Badge>
              </Detail>
              <Detail label="Project ID" value={issue.projectId || projectId} />
            </>
          )}

          {type === "story" && (
            <>
              <Detail label="Story Points" value={issue.storyPoints} />
              <Detail label="Acceptance Criteria" value={issue.acceptanceCriteria} />
              <Detail label="Epic ID" value={issue.epicId} />
              <Detail label="Sprint ID" value={issue.sprint?.id} />
            </>
          )}

          {type === "task" && (
            <>
              <Detail label="Story ID" value={issue.storyId} />
              <Detail label="Sprint ID" value={issue.sprint?.id} />
              <Detail label="Acceptance Criteria" value={issue.acceptanceCriteria} />
            </>
          )}
        </dl>
      </div>

      {/* Comment Section */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4 text-indigo-800">💬 Discussion</h2>
        <CommentBox entityId={id} entityType={type} currentUser={user} />
      </div>
    </div>
  );
};

const Detail = ({ label, value, children }) => (
  <div>
    <dt className="font-medium text-gray-600">{label}</dt>
    <dd className="mt-1 text-gray-900">
      {children || value || "-"}
    </dd>
  </div>
);

const Badge = ({ children, color }) => {
  const colors = {
    blue: "bg-blue-100 text-blue-800",
    red: "bg-red-100 text-red-800",
    green: "bg-green-100 text-green-800",
    gray: "bg-gray-100 text-gray-800",
  };
  return (
    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${colors[color] || colors.gray}`}>
      {children}
    </span>
  );
};

export default ViewSheet;
