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

  const [relatedNames, setRelatedNames] = useState({
    epicName: "",
    storyName: "",
    sprintName: "",
    reporterName: "",
    assigneeName: "",
    projectName: "",
  });

  const token = localStorage.getItem("token");
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const getEndpoint = () => {
    if (type === "task") return `/api/tasks/${id}`;
    if (type === "story") return `/api/stories/${id}`;
    if (type === "epic") return `/api/epics/${id}`;
    if (type === "bug") return `/api/bugs/${id}`; // ✅ Added for bugs
    return null;
  };

  // Fetch issue details
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

  // Fetch related entity names
  useEffect(() => {
    if (!issue) return;
    const base = import.meta.env.VITE_PMS_BASE_URL;

    const fetchName = async (endpoint, field) => {
      try {
        const res = await axios.get(`${base}${endpoint}`, { headers });
        return res.data.name || res.data.title || res.data.sprintName || res.data.fullName;
      } catch (err) {
        console.warn(`Failed to fetch ${field}:`, err);
        return null;
      }
    };

    const fetchRelated = async () => {
      const names = {};

      if (issue.epicId) names.epicName = await fetchName(`/api/epics/${issue.epicId}`, "epic");
      if (issue.storyId) names.storyName = await fetchName(`/api/stories/${issue.storyId}`, "story");
      if (issue.sprint?.id) names.sprintName = await fetchName(`/api/sprints/${issue.sprint.id}`, "sprint");
      if (issue.reporterId) names.reporterName = await fetchName(`/api/users/${issue.reporterId}`, "reporter");
      if (issue.assigneeId) names.assigneeName = await fetchName(`/api/users/${issue.assigneeId}`, "assignee");
      if (issue.projectId) names.projectName = await fetchName(`/api/projects/${issue.projectId}`, "project");

      setRelatedNames(names);
    };

    fetchRelated();
  }, [issue]);

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
        <h1 className="text-3xl font-bold text-indigo-800 capitalize">
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
            <Badge color="blue">{issue.status || issue.statusName || s.status?.name === storyFilter || "Unknown"}</Badge>
          </Detail>
          <Detail label="Priority">
            <Badge color="red">{issue.priority || "Not set"}</Badge>
          </Detail>

          <Detail
            label="Reporter"
            value={relatedNames.reporterName || issue.reporter?.name || issue.reporterName || "-"}
          />
          <Detail
            label="Assignee"
            value={relatedNames.assigneeName || issue.assignee?.name || issue.assignedTo || "-"}
          />

          <Detail
            label="Created On"
            value={
              issue.createdOn
                ? new Date(issue.createdOn).toLocaleDateString()
                : issue.createdAt
                ? new Date(issue.createdAt).toLocaleDateString()
                : "-"
            }
          />

          <Detail
            label="Due Date"
            value={issue.dueDate ? new Date(issue.dueDate).toLocaleDateString() : "-"}
          />

          {/* ✅ EPIC */}
          {type === "epic" && (
            <>
              <Detail label="Progress">
                <Badge color="green">{`${issue.progressPercentage || 0}%`}</Badge>
              </Detail>
              <Detail label="Project" value={relatedNames.projectName || projectId || "-"} />
            </>
          )}

          {/* ✅ STORY */}
          {type === "story" && (
            <>
              <Detail label="Story Points" value={issue.storyPoints || "-"} />
              <Detail label="Acceptance Criteria" value={issue.acceptanceCriteria || "-"} />
              <Detail label="Epic" value={relatedNames.epicName || "-"} />
              <Detail label="Sprint" value={relatedNames.sprintName || "-"} />
              <Detail label="Project" value={relatedNames.projectName || projectId || "-"} />
            </>
          )}

          {/* ✅ TASK */}
         {/* ✅ TASK */}
{type === "task" && (
  <>
    <Detail label="Story" value={relatedNames.storyName || "-"} />
    <Detail label="Sprint" value={relatedNames.sprintName || "-"} />
    <Detail label="Acceptance Criteria" value={issue.acceptanceCriteria || "-"} />
    <Detail
      label="Billable"
      value={
        issue.billable !== undefined && issue.billable !== null
          ? issue.billable
            ? "Yes"
            : "No"
          : "-"
      }
    />
    <Detail label="Project" value={relatedNames.projectName || projectId || "-"} />
  </>
)}

          {/* ✅ BUG */}
          {type === "bug" && (
            <>
              <Detail label="Severity" value={issue.severity || "-"} />
              <Detail label="Type" value={issue.type || "-"} />
              <Detail label="Story" value={relatedNames.storyName || "-"} />
              <Detail label="Sprint" value={relatedNames.sprintName || "-"} />
              <Detail label="Project" value={relatedNames.projectName || projectId || "-"} />
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

// ===== Helper Components =====
const Detail = ({ label, value, children }) => (
  <div>
    <dt className="font-medium text-gray-600">{label}</dt>
    <dd className="mt-1 text-gray-900">{children || value || "-"}</dd>
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
    <span
      className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
        colors[color] || colors.gray
      }`}
    >
      {children}
    </span>
  );
};

export default ViewSheet;
