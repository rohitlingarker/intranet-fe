import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MoreVertical,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Pencil,
  Filter,
} from "lucide-react";
import { toast } from "react-toastify";
import { getProjects } from "../../services/projectService";
import ProjectKPIs from "../../components/ProjectKPIs";
import Pagination from "../../../../components/Pagination/pagination";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import UpdateProjectStatusModal from "../../models/UpdateProjectStatusModal";
import { formatCurrency } from "../../services/clientservice";

const RMSProjectList = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const size = 6;
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState({
    readinessStatus: "",
    projectStatus: "",
    riskLevel: "",
  });
  const [openMenuId, setOpenMenuId] = useState(null);
  const [statusUpdateModal, setStatusUpdateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const menuRef = useRef(null);

  // debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchProjects();
  }, [page, debouncedSearch, filters]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest("[data-menu-root]")) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await getProjects({
        page,
        size,
        search: debouncedSearch,
        filters,
      });

      setProjects(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch (err) {
      console.error("Failed to load projects", err);
      const message = err.response?.data?.message || "Failed to load projects";
      setErrorMsg(message);
      setProjects([]);
      setTotalPages(0);

      // Only show toast if it's a real error, not just "no projects found"
      if (err.response?.status !== 400 || !message.includes("No Projects Found")) {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  // const appliedFiltersCount = Object.values(filters).filter(Boolean).length;

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPage(0);
  };

  const kpiStats = {
    totalProjects: projects.length,
    activeProjects: projects.filter((p) => p.projectStatus === "ACTIVE").length,
    highRisk: projects.filter((p) => p.riskLevel === "HIGH").length,
    overlapping: projects.filter((p) => p.hasOverlap).length,
    avgUtilization: "82%",
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner text="Loading projects..." />
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#081534]">
            Resource Project Management
          </h1>
          <p className="text-sm text-gray-500">Live PMS Integration</p>
        </div>

        {/* <div className="flex items-center gap-3">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            Filters Applied:
          </span>
          <span className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
            {appliedFiltersCount}
          </span>
        </div> */}
      </div>

      <ProjectKPIs stats={kpiStats} />

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-center">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search project / client..."
            className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="border rounded-md px-6 py-2 text-sm"
          value={filters.readinessStatus}
          onChange={(e) =>
            handleFilterChange("readinessStatus", e.target.value)
          }
        >
          <option value="">All Readiness</option>
          <option value="READY">Ready</option>
          <option value="UPCOMING">Upcoming</option>
          <option value="NOT_READY">Not Ready</option>
        </select>

        <select
          className="border rounded-md px-6 py-2 text-sm"
          value={filters.projectStatus}
          onChange={(e) => handleFilterChange("projectStatus", e.target.value)}
        >
          <option value="">All Status</option>
          <option value="APPROVED">Approved</option>
          <option value="PLANNING">Planning</option>
        </select>

        <select
          className="border rounded-md px-6 py-2 text-sm"
          value={filters.riskLevel}
          onChange={(e) => handleFilterChange("riskLevel", e.target.value)}
        >
          <option value="">All Risk</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      {/* PROJECTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length > 0 ? (
          projects.map((project) => (
            <div
              key={project.projectId}
              onClick={() =>
                navigate(`/resource-management/projects/${project.projectId}`)
              }
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="p-5 pb-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 text-[10px] font-bold uppercase rounded border ${project.riskLevel === "HIGH"
                        ? "bg-red-50 text-red-600 border-red-100"
                        : "bg-green-50 text-green-600 border-green-100"
                        }`}
                    >
                      {project.riskLevel} Risk
                    </span>

                    {/* 🔴 OVERLAP WARNING ICON */}
                    {project.hasOverlap && (
                      <div className="flex items-center gap-1 bg-amber-100 text-amber-600 px-2 py-1 rounded text-[10px] font-bold">
                        <AlertTriangle className="h-3 w-3" />
                        Overlap
                      </div>
                    )}
                  </div>

                  <div className="relative" data-menu-root>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(
                          openMenuId === project.projectId
                            ? null
                            : project.projectId,
                        );
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>

                    {openMenuId === project.projectId && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 mt-2 w-36 bg-white border rounded-lg shadow-lg z-50"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(null);
                            setSelectedProject(project.projectId);
                            setStatusUpdateModal(true);
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2 text-xs text-blue-700 hover:bg-gray-100"
                        >
                          <Pencil size={12} />
                          Update Status
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="font-bold text-[#081534] text-lg group-hover:text-[#263383]">
                  {project.projectName}
                </h3>
                <p className="text-sm text-gray-500">{project.clientName}</p>
              </div>

              <div className="p-4 border-t border-gray-100 mt-2 flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  {project.readinessStatus === "READY" && (
                    <>
                      <span className="text-green-700 font-medium">Staffing</span>
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-1" />
                    </>
                  )}

                  {project.readinessStatus === "NOT_READY" && (
                    <>
                      <span className="text-red-700 font-medium">Staffing</span>
                      <XCircle className="h-4 w-4 text-red-600 mt-1" />
                    </>
                  )}

                  {project.readinessStatus === "UPCOMING" && (
                    <>
                      <span className="text-amber-600 font-medium">
                        Staffing UPCOMING
                      </span>
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    </>
                  )}
                </div>
                <div className="font-bold text-gray-700">
                  USD {formatCurrency(project.projectBudget)}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-dashed border-gray-300">
            {errorMsg ? (
              <>
                {/* <div className="p-4 bg-amber-50 rounded-full mb-4">
                  <AlertTriangle className="h-8 w-8 text-amber-500" />
                </div> */}
                <p className="text-gray-600 font-medium text-lg">{errorMsg}</p>
                <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or search criteria.</p>
              </>
            ) : (
              <p className="text-gray-500">No projects available.</p>
            )}
          </div>
        )}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <Pagination
          currentPage={page + 1}
          totalPages={totalPages}
          onPrevious={() => setPage((p) => Math.max(p - 1, 0))}
          onNext={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
        />
      )}

      <UpdateProjectStatusModal
        open={statusUpdateModal}
        onClose={() => setStatusUpdateModal(false)}
        pmsProjectId={selectedProject}
        onSuccess={() => fetchProjects()}
      />
    </div>
  );
};

export default RMSProjectList;