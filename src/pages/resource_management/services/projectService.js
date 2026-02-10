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

export const getProjectById = async (projectId) => {
  try {
    const res = await axios.get(
    `${BASE_URL}/api/projects/get-project-by-id/${projectId}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );
  return res.data;
  } catch (err) {
    throw err;
  }
};

export const checkDemandCreation = async (projectId) => {
  try {
    const res = await axios.get(
    `${BASE_URL}/api/projects/check-demand-creation/${projectId}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );
  return res.data;
  } catch (err) {
    throw err;
  }
};

export const createDemand = async (demandData) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/demand/create` ,
      demandData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const statusUpdate = async (readinessData) => {
  try {
    const response = await axios.put(`${BASE_URL}/api/projects/readiness-status-update`, 
      { readinessData },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (err) {
    throw err;
  }
};