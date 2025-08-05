import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ProjectDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("http://localhost:8080/api/projects", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = res.data.content || res.data;
      setProjects(data);
    } catch (err) {
      setError("Failed to load projects");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const goToProjectTab = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Project Dashboard</h1>
      </div>

      {loading && <p>Loading projects...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && projects.length === 0 && <p>No projects found.</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-white rounded-lg shadow p-6 flex flex-col cursor-pointer hover:shadow-lg transition"
            onClick={() => goToProjectTab(project.id)}
          >
            <h2 className="text-xl font-semibold mb-2">{project.name}</h2>
            <p>
              <strong>Key:</strong> {project.projectKey}
            </p>
            <p className="mb-2">
              <strong>Description:</strong> {project.description || "—"}
            </p>
            <p>
              <strong>Status:</strong> {project.status}
            </p>

            <div className="mt-3">
              <strong>Owner:</strong>
              {project.owner ? (
                <div className="flex flex-col mt-1 text-sm text-gray-700">
                  <span className="font-medium">{project.owner.name}</span>
                  <span>{project.owner.role}</span>
                  <span className="text-xs text-gray-500">{project.owner.email}</span>
                </div>
              ) : (
                <p className="text-gray-500">—</p>
              )}
            </div>

            <div className="mt-3">
              <strong>Members:</strong>
              <div className="flex flex-wrap gap-2 mt-1 text-sm">
                {project.members && project.members.length > 0 ? (
                  project.members.map((member) => (
                    <div
                      key={member.id}
                      className="border rounded px-2 py-1 bg-gray-100 text-gray-800"
                    >
                      <div className="font-medium">{member.name}</div>
                      <div className="text-xs">{member.role}</div>
                      <div className="text-xs text-gray-500">{member.email}</div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">—</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectDashboard;
