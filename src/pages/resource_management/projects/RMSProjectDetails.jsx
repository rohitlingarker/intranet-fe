// src/pages/resource_management/projects/ProjectDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Calendar, MapPin, Users, Globe, ShieldAlert, Lock, Download 
} from "lucide-react";
import { mockProjects } from "./mockData";
import FinancialModal from "./components/FinancialModal";
import ResourceList from "./components/ResourceList"; // Sub-component below

const RMSProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'resources' | 'demands'

  useEffect(() => {
    const found = mockProjects.find((p) => p.id === id);
    setProject(found);
  }, [id]);

  if (!project) return <div>Loading...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Navigation */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 mb-4 hover:text-[#263383] text-sm">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </button>

      {/* Header Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#081534] flex items-center gap-3">
              {project.name}
              <span className={`text-xs px-2 py-1 rounded-full border ${
                project.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600'
              }`}>{project.status}</span>
            </h1>
            <p className="text-gray-500 mt-1">Client: <span className="font-semibold">{project.client}</span> • ID: {project.id}</p>
          </div>
          
          <div className="flex items-center gap-3">
            {project.readiness === 'Not Ready' && (
                <button className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded text-sm font-medium hover:bg-red-100">
                    Admin Override (Force Ready)
                </button>
            )}
            <button className="px-4 py-2 bg-[#263383] text-white rounded text-sm font-medium hover:bg-[#1a245e]">
                Create Demand
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-6 mt-8 border-b border-gray-200">
          {['overview', 'resources', 'financials'].map((tab) => (
             <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-medium capitalize transition-colors relative ${
                    activeTab === tab ? "text-[#263383]" : "text-gray-500 hover:text-gray-700"
                }`}
             >
                {tab}
                {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#263383]"></div>}
             </button>
          ))}
        </div>
      </div>

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1: Core Details (Read Only) */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
                        <Lock className="h-3 w-3" /> PMS Context (Read-Only)
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Project Manager</label>
                            <div className="flex items-center gap-2 text-gray-800 font-medium">
                                <Users className="h-4 w-4 text-gray-400" /> {project.pm}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Risk Profile</label>
                            <div className="flex items-center gap-2 text-gray-800 font-medium">
                                <ShieldAlert className={`h-4 w-4 ${project.risk === 'High' ? 'text-red-500' : 'text-green-500'}`} /> 
                                {project.risk} Risk
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Start Date</label>
                            <div className="flex items-center gap-2 text-gray-800">
                                <Calendar className="h-4 w-4 text-gray-400" /> {project.startDate}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">End Date</label>
                            <div className="flex items-center gap-2 text-gray-800">
                                <Calendar className="h-4 w-4 text-gray-400" /> {project.endDate}
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <label className="text-xs text-gray-500 block mb-2">Description</label>
                        <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded">{project.description}</p>
                    </div>
                </div>
            </div>

            {/* Column 2: Delivery Details */}
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                     <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">Delivery Model</h3>
                     <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded border border-blue-100">
                            <span className="text-sm text-gray-600">Type</span>
                            <span className="font-bold text-[#263383]">{project.deliveryModel}</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded border border-gray-100">
                            <Globe className="h-5 w-5 text-gray-400" />
                            <div>
                                <span className="text-xs text-gray-500 block">Location</span>
                                <span className="text-sm font-medium text-gray-800">{project.location}</span>
                            </div>
                        </div>
                     </div>
                </div>
            </div>
        </div>
      )}

      {/* TAB CONTENT: RESOURCES (Employees) */}
      {activeTab === 'resources' && (
          <ResourceList allocations={project.allocations} />
      )}

      {activeTab === 'financials' && (
          <FinancialModal />
      )}

    </div>
  );
};

export default RMSProjectDetails;