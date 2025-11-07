import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/Button/Button";
import ThreeCard from "../../../components/Cards/ThreeCards";
import { jwtDecode } from "jwt-decode";

const ProjectDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [stories, setStories] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [reminders, setReminders] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Decode token to get userId
  const decodedToken = jwtDecode(token);
  const userId = decodedToken.user_id;

  const axiosConfig = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  // ✅ Fetch projects where user is a member
  const fetchUserProjects = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/projects/member/${userId}`,
        axiosConfig
      );
      const data = res.data.content || res.data;
      setProjects(data);
    } catch (err) {
      console.error("Failed to load user projects:", err);
      setError("Failed to load your projects.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch tasks assigned to the user
  const fetchUserTasks = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/tasks/assignee/${userId}`,
        axiosConfig
      );
      const data = res.data.content || res.data;
      setTasks(data);
    } catch (err) {
      console.error("Failed to load user tasks:", err);
      setError("Failed to load your tasks.");
    }
  };

  // ✅ Fetch stories assigned to the user
  const fetchUserStories = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/stories/assignee/${userId}`,
        axiosConfig
      );
      const data = res.data.content || res.data;
      setStories(data);
    } catch (err) {
      console.error("Failed to load user stories:", err);
      setError("Failed to load your stories.");
    }
  };

  // ✅ Fetch dashboard summary data
  const fetchDashboard = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/dashboard/${userId}`,
        axiosConfig
      );
      setDashboardData(res.data);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setDashboardLoading(false);
    }
  };

  // ✅ Fetch reminders (Fixed URL)
  const fetchReminders = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/dashboard/reminders/`,
        axiosConfig
      );
      setReminders(res.data);
    } catch (err) {
      console.error("Failed to fetch reminders:", err);
    }
  };

  // Load all data on mount
  useEffect(() => {
    if (userId) {
      fetchUserProjects();
      fetchDashboard();
      fetchReminders();
      fetchUserTasks();
      fetchUserStories();
    }
  }, [userId]);

  const goToProjectTab = (projectId) => navigate(`/projects/user/${projectId}`);
  const goToMyProfile = () => navigate("/projects/user/myprofile");

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">My Dashboard</h1>
        <div className="flex gap-3">
          <Button onClick={goToMyProfile} variant="primary">
            My Profile
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
              title="Projects Involved"
              value={projects.length}
              textColor="text-indigo-900"
            />
            <ThreeCard
              title="Tasks"
              value={tasks.length}
              textColor="text-green-700"
            />
            <ThreeCard
              title="Stories"
              value={stories.length}
              textColor="text-orange-600"
            />
          </div>

          {/* 🔸 Status Count Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {["taskStatus", "storyStatus"].map((key) => (
              <div key={key} className="bg-white rounded-2xl shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
                  {key
                    .replace("Status", " Status")
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
            ))}
          </div>

          {/* 🔔 Reminders */}
          <div className="mb-6">
            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
                Reminders
              </h3>
              {reminders ? (
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>
                    🔔 {reminders?.taskDueSoonCount ?? 0} tasks are due in the
                    next 2 days
                  </li>
                  <li>📌 {reminders?.todoTaskCount ?? 0} tasks are in TODO</li>
                  <li>📝 {reminders?.todoStoryCount ?? 0} stories are in TODO</li>
                  <li>
                    🚩 {reminders?.unassignedProjectCount ?? 0} projects have no
                    owner
                  </li>
                  <li>
                    🕒 {reminders?.sprintsEndingSoonCount ?? 0} sprints are ending soon
                  </li>
                </ul>
              ) : (
                <p className="text-sm text-gray-500">Loading reminders...</p>
              )}
            </div>
          </div>

          {/* 📌 User's Projects */}
          <div className="mb-6">
            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
                My Projects
              </h3>

              {loading ? (
                <p>Loading your projects...</p>
              ) : projects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => goToProjectTab(project.id)}
                      className="cursor-pointer hover:shadow-md transition-all border p-4 rounded-xl bg-gray-50"
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
              ) : (
                <p className="text-gray-600">
                  You’re not assigned to any project yet.
                </p>
              )}
            </div>
          </div>
        </>
      ) : (
        <p className="text-red-600">Dashboard data not available</p>
      )}
    </div>
  );
};

export default ProjectDashboard;
