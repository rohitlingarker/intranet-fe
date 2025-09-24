import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../contexts/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UserProfile = () => {
  const { user } = useAuth();
  const userId = user?.id || user?.user_id; // fallback if backend uses `id` or `user_id`
  const userName = user?.name || "User";

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Create Axios instance with base URL
  const axiosInstance = axios.create({
    baseURL: "http://192.168.2.69:4000",
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Interceptor to always add token
  axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  useEffect(() => {
    if (!userId) {
      console.error("Missing userId or token", { userId });
      setError("User not logged in or token missing");
      return;
    }

    const fetchUserProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get(`/api/projects/member/${userId}`);
        console.log("Projects fetched:", response.data);
        setProjects(response.data);
      } catch (err) {
        console.error("Error fetching projects:", err.response || err);
        setError("Failed to load projects. Check token or server CORS.");
        toast.error("Failed to load projects");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProjects();
  }, [userId]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-4">Welcome, {userName}</h1>

      {loading && <p className="text-gray-600">Loading projects...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && projects.length === 0 && (
        <p className="text-gray-500">No projects assigned to you.</p>
      )}

      <ul className="space-y-3">
        {projects.map((project) => (
          <li
            key={project.id}
            className="p-4 border rounded shadow hover:bg-gray-50 transition cursor-pointer"
          >
            <h2 className="font-semibold text-indigo-700">{project.name}</h2>
            {project.description && <p className="text-gray-700">{project.description}</p>}
            <p className="text-sm text-gray-500">
              <strong>Status:</strong> {project.status}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserProfile;
