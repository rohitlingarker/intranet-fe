import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CreateProjectModal from "./CreateProjectModal";
import Button from "../../../components/Button/Button";
import ThreeCard from "../../../components/Cards/ThreeCards";
import {
  Bell,
  ListTodo,
  FileText,
  AlertTriangle,
  Clock,
} from "lucide-react";
const ProjectDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    projectKey: "",
    description: "",
    status: "ACTIVE",
    ownerId: null,
    memberIds: [],
  });
 
  // const [users, setUsers] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [reminders, setReminders] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
 
  const navigate = useNavigate();
 
  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      // console.log(token, "12345678");
 
      const res = await axios.get(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/projects`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = res.data.content || res.data;
      setProjects(data);
    } catch (err) {
      setError("Failed to load projects");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
 
  // const fetchUsers = async () => {
  //   try {
  //     const token = localStorage.getItem("token");
  //     const res = await axios.get(
  //       `${import.meta.env.VITE_PMS_BASE_URL}/api/users?page=0&size=100`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );
 
  //     const content = res.data.content ?? res.data;
  //     if (Array.isArray(content)) {
  //       setUsers(content);
  //     } else {
  //       console.error("Invalid users response format:", res.data);
  //     }
  //   } catch (err) {
  //     console.error("Error fetching users:", err);
  //   }
  // };
 
  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/dashboard/summary`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
        
      );
      setDashboardData(res.data);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setDashboardLoading(false);
    }
  };
 
  const fetchReminders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/dashboard/reminders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setReminders(res.data);
    } catch (err) {
      console.error("Failed to fetch reminders:", err);
    }
  };
 
  useEffect(() => {
    fetchProjects();
    fetchDashboard();
    fetchReminders();
  }, []);
 
  const goToProjectTab = (projectId) => navigate(`/projects/${projectId}`);
 
  return (
<div className="p-6 bg-gray-50 min-h-screen">
<div className="flex items-center justify-between mb-6">
<h1 className="text-3xl font-bold">Project Dashboard</h1>
<div className="flex gap-3">
<Button onClick={() => navigate("/projects/list")} variant="secondary">
             Project List
</Button>
<Button
            onClick={() => navigate("/projects/performance")}
            variant="secondary"
>
            Employee Performance
</Button>
<Button
            onClick={() => setIsCreateModalOpen(true)}
            variant="primary"
>
            + New Project
</Button>
</div>
</div>
 
      {dashboardLoading ? (
<p className="text-gray-600">Loading summary...</p>
      ) : dashboardData ? (
<>
          {/* 🔹 Summary Cards */}
<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-6">
<ThreeCard
              title="Projects"
              value={dashboardData.totalProjects}
              textColor="text-indigo-900"
            />
<ThreeCard
              title="Tasks"
              value={dashboardData.totalTasks}
              textColor="text-green-700"
            />
<ThreeCard
              title="Epics"
              value={dashboardData.totalEpics}
              textColor="text-purple-700"
            />
{/* <ThreeCard
              title="Users"
              value={dashboardData.totalUsers}
              textColor="text-pink-700"
            /> */}
<ThreeCard
              title="Stories"
              value={dashboardData.totalStories}
              textColor="text-orange-600"
            />
</div>
 
          {/* 🔸 Status Count Cards */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {["taskStatusCount", "epicStatusCount", "storyStatusCount"].map(
              (key) => (
<div key={key} className="bg-white rounded-2xl shadow p-6">
<h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
                    {key
                      .replace("StatusCount", " Status")
                      .replace(/([a-z])([A-Z])/g, "$1 $2")}
</h3>
<ul className="space-y-1 text-sm text-gray-700">
                    {Object.entries(dashboardData[key] || {}).map(
                      ([status, count]) => (
<li key={status} className="flex justify-between">
<span>{status.replace("_", " ")}</span>
<span className="font-semibold">{count}</span>
</li>
                      )
                    )}
</ul>
</div>
              )
            )}
</div>
 


{/* 🔔 Reminders / Deadlines */}
<div className="mb-6">
  <div className="bg-white rounded-2xl shadow p-6">
    <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2 flex items-center gap-2">
      <Bell className="w-5 h-5 text-indigo-600" />
      Reminders
    </h3>

    {reminders ? (
      <ul className="space-y-2 text-sm text-gray-700">
        <li className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-yellow-600" />
          {reminders?.taskDueSoonCount ?? 0} tasks are due in the next 2 days
        </li>
        <li className="flex items-center gap-2">
          <ListTodo className="w-4 h-4 text-blue-600" />
          {reminders?.todoTaskCount ?? 0} tasks are in TODO
        </li>
        <li className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-green-600" />
          {reminders?.todoStoryCount ?? 0} stories are in TODO
        </li>
        <li className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          {reminders?.unassignedProjectCount ?? 0} projects have no assigned owner
        </li>
        <li className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-600" />
          {reminders?.sprintsEndingSoonCount ?? 0} sprints are ending soon
        </li>
      </ul>
    ) : (
      <p className="text-sm text-gray-500 flex items-center gap-2">
        <Clock className="w-4 h-4 text-gray-400 animate-spin" />
        Loading reminders...
      </p>
    )}
  </div>
</div>

 
          {/* 📌 Quick Access Projects */}
<div className="mb-6">
<div className="bg-white rounded-2xl shadow p-6">
<h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
                Quick Access
</h3>
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.slice(0, 3).map((project) => (
<div
                    key={project.id}
                    onClick={() => goToProjectTab(project.id)}
                    className="cursor-pointer hover:shadow-md transition-all border p-4 rounded-xl"
>
<h4 className="font-semibold text-indigo-700 text-lg">
                      {project.name}
</h4>
<p className="text-sm text-gray-600">
                      Key: {project.projectKey}
</p>
<p className="text-xs text-gray-400">{project.status}</p>
</div>
                ))}
</div>
</div>
</div>
</>
      ) : (
<p className="text-red-600">Dashboard data not available</p>
      )}
 
      {/* 🔧 Create Modal */}
<CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreated={fetchProjects}
      />
</div>
  );
};
 
export default ProjectDashboard;