// src/pages/resource_management/projects/ProjectDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Users,
  Globe,
  ShieldAlert,
  Lock,
} from "lucide-react";
import { getProjectById } from "../../services/projectService";
import ResourceList from "../../components/ResourceList";

const RMSProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await getProjectById(projectId);
      setProject(res.data); 
    } catch (err) {
      console.error("Failed to fetch project details", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [projectId]);

  if (loading)
    return <div className="p-10 text-center">Loading Details...</div>;

  if (!project)
    return <div className="p-10 text-center">Project not found</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 mb-4 hover:text-[#263383] text-sm"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </button>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-[#081534] flex items-center gap-3">
              {project.name}
              <span
                className={`text-xs px-2 py-1 rounded-full border ${
                  project.projectStatus === "ACTIVE"
                    ? "bg-green-50 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {project.projectStatus}
              </span>
            </h1>
            <p className="text-gray-500 mt-1">
              {project.client?.client_name} • Project ID:{" "}
              {project.pmsProjectId}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 mt-8 border-b border-gray-200">
          {["overview", "resources", "financials"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium capitalize relative ${
                activeTab === tab ? "text-[#263383]" : "text-gray-500"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#263383]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
                <Lock className="h-3 w-3" /> PMS Context (Read-Only)
              </h3>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">
                    Project Manager ID
                  </label>
                  <div className="flex items-center gap-2 text-gray-800 font-medium">
                    <Users className="h-4 w-4 text-gray-400" />
                    {project.projectManagerId}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500 block mb-1">
                    Risk Profile
                  </label>
                  <div className="flex items-center gap-2 text-gray-800 font-medium">
                    <ShieldAlert
                      className={`h-4 w-4 ${
                        project.riskLevel === "HIGH"
                          ? "text-red-500"
                          : "text-green-500"
                      }`}
                    />
                    {project.riskLevel}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500 block mb-1">
                    Lifecycle Stage
                  </label>
                  <div className="text-sm font-medium text-gray-800 uppercase">
                    {project.lifecycleStage}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500 block mb-1">
                    Start Date
                  </label>
                  <div className="flex items-center gap-2 text-gray-800 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {new Date(project.startDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">
              Delivery Model
            </h3>

            <div className="p-3 bg-blue-50 rounded border border-blue-100 flex justify-between items-center mb-4">
              <span className="text-sm text-gray-600">Model</span>
              <span className="font-bold text-[#263383]">
                {project.deliveryModel}
              </span>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
              <Globe className="h-5 w-5 text-gray-400" />
              <div>
                <span className="text-xs text-gray-500 block">
                  Primary Location
                </span>
                <span className="text-sm font-medium text-gray-800">
                  {project.primaryLocation}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resources */}
      {activeTab === "resources" && (
        <ResourceList allocations={project.allocations || []} />
      )}

      {/* Financials (future) */}
      {activeTab === "financials" && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">
            Financial details coming soon…
          </p>
        </div>
      )}
    </div>
  );
};

export default RMSProjectDetails;