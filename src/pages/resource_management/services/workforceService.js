import axios from "axios";

const BASE_URL = import.meta.env.VITE_RMS_BASE_URL;

export const getWorkforceFilters = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/resource/get-all-resource-filters`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const getWorkforceKPI = async (filters) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/rms/kpis`, {
      params: {
        role: filters.role !== "All Roles" ? filters.role : null,
        location:
          filters.location !== "All Locations" ? filters.location : null,
        employmentType:
          filters.employmentType !== "All Types"
            ? filters.employmentType
            : null,
        minExperience: filters.experienceRange?.[0] ?? null,
        maxExperience: filters.experienceRange?.[1] ?? null,
        // Optional date filters (if you add them later)
        // from: filters.fromDate || null,
        // to: filters.toDate || null,
      },
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    return response.data;
  } catch (err) {
    throw err;
  }
};
