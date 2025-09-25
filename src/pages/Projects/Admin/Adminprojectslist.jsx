import React, { useEffect, useState } from "react";
import axios from "axios";
import { ChevronDown, ChevronRight } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import Pagination from "../../../components/Pagination/pagination";
import "react-toastify/dist/ReactToastify.css";

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [projectsPerPage] = useState(5);

  const token = localStorage.getItem("token");

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/projects`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = Array.isArray(res.data) ? res.data : res.data.content || [];
      setProjects(data);
    } catch (error) {
      console.error("Failed to fetch projects", error);
      toast.error("Failed to fetch projects", { position: "top-right" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = projects.slice(
    indexOfFirstProject,
    indexOfLastProject
  );
  const totalPages = Math.ceil(projects.length / projectsPerPage);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-black mb-6">Projects</h1>

      {loading ? (
        <p className="text-gray-600">Loading projects...</p>
      ) : currentProjects.length === 0 ? (
        <p className="text-gray-600">No projects found.</p>
      ) : (
        <div className="space-y-4">
          {currentProjects.map((project) => (
            <div key={project.id} className="bg-white rounded-xl shadow p-4">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleExpand(project.id)}
              >
                <div className="flex items-center gap-2">
                  {expandedId === project.id ? <ChevronDown /> : <ChevronRight />}
                  <h2 className="text-xl font-semibold">{project.name}</h2>
                  <span className="text-gray-500 text-sm">
                    ({project.projectKey})
                  </span>
                </div>
              </div>

              {expandedId === project.id && (
                <div className="mt-4 border-t pt-4">
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>
                      <strong>Description:</strong>{" "}
                      {project.description || "—"}
                    </p>
                    <p>
                      <strong>Status:</strong> {project.status}
                    </p>
                    <p>
                      <strong>Owner:</strong> {project.owner?.name || "—"}
                    </p>
                    <div>
                      <strong>Members:</strong>
                      <ul className="ml-4 list-disc">
                        {project.members?.map((m) => (
                          <li key={m.id}>
                            {m.name} ({m.role})
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevious={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          onNext={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        />
      )}

      <ToastContainer position="top-right" />
    </div>
  );
};

export default ProjectList;
