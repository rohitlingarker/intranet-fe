import React, { useEffect, useState } from 'react';
import axios from 'axios';
// import CreateProjectModal from './CreateProjectModal'; // Uncomment if needed

const AdminDashboard: React.FC = () => {
  const userRole = "ADMIN"; // Replace this with actual user context or props

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get("http://localhost:8080/api/projects", {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = response.data.content || response.data;
      setProjects(data);
    } catch (err: any) {
      console.error("Failed to fetch projects:", err);
      if (err.response && err.response.status === 401) {
        setError("Unauthorized access. Please log in again.");
      } else {
        setError("Failed to fetch projects. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold text-indigo-700 mb-6">Project Dashboard</h1>

      {/* Create Project Button (for non-admins) */}
      {userRole !== "ADMIN" && (
        <button
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow mb-4 transition"
          onClick={() => setIsCreateModalOpen(true)}
        >
          + Create Project
        </button>
      )}

      {/* Loading */}
      {loading && <p className="text-blue-500 text-lg">Loading projects...</p>}

      {/* Error */}
      {error && <p className="text-red-600 text-lg font-medium">{error}</p>}

      {/* No projects fallback */}
      {!loading && !error && projects.length === 0 && (
        <p className="text-gray-600 text-lg">No projects found.</p>
      )}

      {/* Projects Grid */}
      {!loading && !error && projects.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white border-l-4 border-indigo-500 rounded-lg p-5 shadow-md hover:shadow-lg transition"
            >
              <h2 className="text-xl font-bold text-indigo-800 mb-2">{project.name}</h2>
              <p className="text-gray-700"><strong>Key:</strong> {project.projectKey}</p>
              <p className="text-gray-700"><strong>Description:</strong> {project.description || "—"}</p>
              <p className="text-gray-700"><strong>Status:</strong> {project.status}</p>

              <div className="mt-2">
                <p className="text-gray-800 font-semibold">Owner:</p>
                <p className="text-gray-600 ml-2">
                  {project.owner ? `${project.owner.name} (${project.owner.role})` : "—"}
                </p>
              </div>

              <div className="mt-2">
                <p className="text-gray-800 font-semibold">Members:</p>
                <ul className="list-disc list-inside text-gray-600 ml-2">
                  {project.members && project.members.length > 0 ? (
                    project.members.map((member: any) => (
                      <li key={member.id}>
                        {member.name} ({member.role})
                      </li>
                    ))
                  ) : (
                    <li>—</li>
                  )}
                </ul>
              </div>

              {/* Action buttons (for non-admins) */}
              {userRole !== "ADMIN" && (
                <div className="mt-4 space-x-2">
                  <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded transition">
                    Edit
                  </button>
                  <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition">
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal (Optional) */}
      {/* {userRole !== "ADMIN" && (
        <CreateProjectModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onProjectCreated={fetchProjects}
        />
      )} */}
    </div>
  );
};

export default AdminDashboard;
