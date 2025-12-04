import { useEffect, useState } from "react";
import axios from "axios";

export default function useDashboardData(projectId) {
  const [data, setData] = useState({
    epics: null,
    stories: null,
    tasks: null,
    bugs: null,
    statuses: null,
    users: null,
    stage: null,
  });

  const [loading, setLoading] = useState({
    epics: true,
    stories: true,
    tasks: true,
    bugs: true,
    statuses: true,
    users: true,
    stage: true,
  });

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const base = import.meta.env.VITE_PMS_BASE_URL;

  useEffect(() => {
    if (!projectId || !token) return;

    const fetchData = async (key, url, transformStage = false) => {
      try {
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setData((prev) => ({
          ...prev,
          [key]: transformStage
            ? res.data?.currentStage || "INITIATION"
            : res.data || [],
        }));
      } catch {
        setData((prev) => ({ ...prev, [key]: [] }));
      } finally {
        setLoading((prev) => ({ ...prev, [key]: false }));
      }
    };

    fetchData("stage", `${base}/api/projects/${projectId}`, true);
    fetchData("epics", `${base}/api/projects/${projectId}/epics`);
    fetchData("stories", `${base}/api/projects/${projectId}/stories`);
    fetchData("tasks", `${base}/api/projects/${projectId}/tasks`);
    fetchData("bugs", `${base}/api/testing/bugs/projects/${projectId}/summaries`);
    fetchData("statuses", `${base}/api/projects/${projectId}/statuses`);
    fetchData("users", `${base}/api/projects/${projectId}/members-with-owner`);
  }, [projectId, token]);

  return { data, loading };
}
