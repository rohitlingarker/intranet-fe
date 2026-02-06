import axios from "axios";

const BASE_URL = import.meta.env.VITE_RMS_BASE_URL;

export const getProjects = async ({
  page,
  size,
  search,
  filters,
}) => {
  const params = {
    page,
    size,
  };

  if (search) params.search = search;
  if (filters.readinessStatus) params.readinessStatus = filters.readinessStatus;
  if (filters.projectStatus) params.projectStatus = filters.projectStatus;
  if (filters.priorityLevel) params.priorityLevel = filters.priorityLevel;
  if (filters.riskLevel) params.riskLevel = filters.riskLevel;

  const res = await axios.get(
    `${BASE_URL}/api/projects/get-projects`,
    {
      params,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  return res.data;
};