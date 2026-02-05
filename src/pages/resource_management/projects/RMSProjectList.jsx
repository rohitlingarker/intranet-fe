// src/pages/resource_management/projects/ProjectDashboard.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, AlertTriangle, CheckCircle2, Clock, MoreVertical } from "lucide-react";
import { mockProjects, kpiStats } from "./mockData";
import ProjectKPIs from "./components/ProjectKPIs";

const RMSProjectList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProjects = mockProjects.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      
      {/* 1. Header & KPIs */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#081534]">Resource Project Management</h1>
          <p className="text-sm text-gray-500">PMS Integration Dashboard</p>
        </div>
        <button className="bg-[#263383] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#1e2a6b]">
          Sync PMS Data
        </button>
      </div>

      <ProjectKPIs stats={kpiStats} />

      {/* 2. Search & Filter Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6 flex justify-between items-center">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search Project, Client, or ID..."
            className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#263383]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
           <button className="flex items-center gap-2 px-3 py-2 border rounded text-sm hover:bg-gray-50 text-gray-600">
             <Filter className="h-4 w-4" /> Filter Status
           </button>
        </div>
      </div>

      {/* 3. Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            onClick={() => navigate(`/resource-management/projects/${project.id}`)}
            className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer group"
          >
            {/* Project Card Header */}
            <div className="p-5 pb-3">
              <div className="flex justify-between items-start mb-2">
                <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded border ${
                    project.risk === 'High' ? 'bg-red-50 text-red-600 border-red-100' : 
                    project.risk === 'Medium' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                    'bg-green-50 text-green-600 border-green-100'
                }`}>
                  {project.risk} Risk
                </span>
                <MoreVertical className="h-4 w-4 text-gray-400" />
              </div>
              <h3 className="font-bold text-[#081534] text-lg group-hover:text-[#263383]">{project.name}</h3>
              <p className="text-sm text-gray-500">{project.client}</p>
            </div>

            {/* Project Metrics */}
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

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 mt-2 flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                    {project.readiness === 'Ready' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                    )}
                    <span className="text-gray-600 font-medium">{project.readiness}</span>
                </div>
                <div className="flex -space-x-2">
                    {/* Avatars of first 3 resources */}
                    {[...Array(3)].map((_, i) => (
                         <div key={i} className="w-7 h-7 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[10px] text-gray-500">
                           U{i+1}
                         </div>
                    ))}
                    {project.allocations.length > 0 && <span className="text-xs text-gray-400 pl-3 pt-1">+{project.allocations.length} Staffed</span>}
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RMSProjectList;