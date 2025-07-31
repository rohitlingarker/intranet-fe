import React, { useEffect, useState } from "react";
import axios from "axios";

type ProjectStatus = "ACTIVE" | "ARCHIVED" | "PLANNING";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface Project {
  id: number;
  name: string;
  projectKey: string;
  description: string;
  status: ProjectStatus;
  owner: User | null;
  members: User[];
}

const ReadOnlyDashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("http://localhost:8080/api/projects", {
        headers: {
          "Content-Type": "application/json",
          // "Authorization": `Bearer ${localStorage.getItem("token")}` (future integration)
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Project Dashboard</h1>

      {loading && <p>Loading projects...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && projects.length === 0 && <p>No projects found.</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-white rounded-lg shadow p-6 flex flex-col">
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

            <div className="mt-2">
              <strong>Owner:</strong>{" "}
              {project.owner ? (
                <span>
                  {project.owner.name} ({project.owner.role})
                </span>
              ) : (
                <span>—</span>
              )}
            </div>

            <div className="mt-2">
              <strong>Members:</strong>
              <ul className="list-disc list-inside">
                {project.members.length > 0 ? (
                  project.members.map((member) => (
                    <li key={member.id}>
                      {member.name} ({member.role})
                    </li>
                  ))
                ) : (
                  <li>—</li>
                )}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReadOnlyDashboard;
