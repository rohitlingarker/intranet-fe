import axios from "axios";

const BASE_URL = import.meta.env.VITE_RMS_BASE_URL;

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/**
 * Fetches resources currently on bench
 */
export const getBenchResources = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/bench/bench-resources`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch bench resources", error);
    throw error;
  }
};

/**
 * Fetches resources in the internal pool
 */
export const getPoolResources = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/bench/pool-resources`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch pool resources", error);
    throw error;
  }
};

/**
 * Common fetcher to get all resource supply (Bench + Pool)
 */
export const getAllResources = async () => {
  try {
    const [benchResponse, poolResponse] = await Promise.all([
      getBenchResources(),
      getPoolResources()
    ]);

    // Handle standard response wrapper if present (success/data)
    const benchData = benchResponse?.data || (Array.isArray(benchResponse) ? benchResponse : []);
    const poolData = poolResponse?.data || (Array.isArray(poolResponse) ? poolResponse : []);

    return {
      success: true,
      data: [...benchData, ...poolData]
    };
  } catch (error) {
    console.error("Failed to fetch consolidated resources", error);
    throw error;
  }
};

/**
 * Fetches KPI metrics for the bench dashboard
 */
export const getBenchKPIs = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/bench/kpi`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch bench KPI data", error);
    throw error;
  }
};

export const updateStatusResource = async (payload) => {
  try {
    const response = await axios.put(`${BASE_URL}/api/bench/update-resource-state`, payload, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Failed to update resource status", error);
    throw error;
  }
};
