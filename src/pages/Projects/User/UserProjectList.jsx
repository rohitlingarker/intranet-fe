import React, { useEffect, useState } from "react";
import axios from "axios";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/Button/Button";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_PMS_BASE_URL}/api/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data) ? res.data : res.data.content || [];
      setProjects(data);
    } catch (error) {
      console.error("Failed to fetch projects", error);
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

  const filteredProjects = projects.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.projectKey?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Heading */}
      <h1 className="text-2xl font-bold text-black mb-6">Projects</h1>

      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Search by name or key"
            className="border px-3 py-2 rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <p className="text-gray-600">Loading projects...</p>
      ) : filteredProjects.length === 0 ? (
        <p className="text-gray-600">No projects found.</p>
      ) : (
        <div className="space-y-4">
          {filteredProjects.map((project) => (
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
                    <div className="pt-4">
                      <Button
                        variant="primary"
                        size="small"
                        onClick={() => navigate(`/projects/user/${project.id}`)}
                      >
                        Go to Project Tabs
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ToastContainer position="top-right" />
    </div>
  );
};

export default ProjectList;
