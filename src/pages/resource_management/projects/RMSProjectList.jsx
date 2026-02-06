// src/pages/resource_management/projects/ProjectDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MoreVertical,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { projectService } from "../projects/projectService";
import ProjectKPIs from "./components/ProjectKPIs";
import Pagination from "../../../components/Pagination/pagination"; // Import your component

const RMSProjectList = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Set how many projects per page

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await projectService.getProjects();
      setProjects(data);
    } catch (err) {
      console.error("Sync error", err);
    } finally {
      setLoading(false);
    }
  };

  // --- DYNAMIC LOGIC ---
  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Calculate Pagination Slices
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProjects.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  const kpiStats = {
    totalProjects: projects.length,
    activeProjects: projects.filter((p) => p.projectStatus === "ACTIVE").length,
    highRisk: projects.filter((p) => p.riskLevel === "HIGH").length,
    overlapping: projects.filter((p) => p.hasOverlap).length,
    avgUtilization: "82%",
  };

  // Reset to page 1 when searching
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  if (loading)
    return <div className="p-10 text-center">Syncing with PMS...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#081534]">
            Resource Project Management
          </h1>
          <p className="text-sm text-gray-500">Live PMS Integration</p>
        </div>
        <button
          onClick={loadData}
          className="bg-[#263383] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#1e2a6b]"
        >
          Sync PMS Data
        </button>
      </div>

      <ProjectKPIs stats={kpiStats} />

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search Project Name..."
            className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Grid displays currentItems instead of filteredProjects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentItems.map((project) => (
          <div
            key={project.id}
            onClick={() =>
              navigate(`/resource-management/projects/${project.id}`)
            }
            className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer group"
          >
            {/* ... (Existing Card UI) */}
            <div className="p-5 pb-3">
              <div className="flex justify-between items-start mb-2">
                {/* LEFT SIDE — Risk Badge */}
                <span
                  className={`px-2 py-1 text-[10px] font-bold uppercase rounded border ${
                    project.riskLevel === "HIGH"
                      ? "bg-red-50 text-red-600 border-red-100"
                      : "bg-green-50 text-green-600 border-green-100"
                  }`}
                >
                  {project.riskLevel} Risk
                </span>

                {/* RIGHT SIDE — Overlap + Menu */}
                <div className="flex items-center gap-2">
                  {project.hasOverlap && (
                    <div className="flex items-center gap-1 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      <AlertTriangle className="h-3 w-3" />
                      Overlap
                    </div>
                  )}

                  {/* <MoreVertical className="h-4 w-4 text-gray-400" /> */}
                </div>
              </div>

              <h3 className="font-bold text-[#081534] text-lg group-hover:text-[#263383]">
                {project.name}
              </h3>
              <p className="text-sm text-gray-500">{project.clientName}</p>
            </div>

            <div className="px-5 py-2">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Timeline Progress</span>
                <span>{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className="bg-[#263383] h-1.5 rounded-full"
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 mt-2 flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                {project.readiness === "Ready" ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                )}
                <span className="text-gray-600 font-medium">
                  {project.readiness}
                </span>
              </div>
              <div className="font-bold text-gray-700">
                {project.projectBudgetCurrency}{" "}
                {project.projectBudget.toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- PAGINATION COMPONENT --- */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevious={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          onNext={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
        />
      )}
    </div>
  );
};

export default RMSProjectList;
