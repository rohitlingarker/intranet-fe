import axios from "axios";

const BASE_URL = import.meta.env.VITE_RMS_BASE_URL;
const LMS_BASE_URL = import.meta.env.VITE_BASE_URL;

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
    const params = {};
    if (filters.role && filters.role !== "All Roles") params.role = filters.role;
    if (filters.location && filters.location !== "All Locations") params.location = filters.location;
    if (filters.employmentType && filters.employmentType !== "All Types")
      params.employmentType = filters.employmentType;
    if (filters.experienceRange?.[0] > 0)
      params.minExperience = filters.experienceRange[0];
    if (filters.experienceRange?.[1] < 15)
      params.maxExperience = filters.experienceRange[1];

    const response = await axios.get(`${BASE_URL}/api/rms/kpis`, {
      params,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    return response.data;
  } catch (err) {
    throw err;
  }
};

export const getAvailabilityTimeline = async (filters, pagination) => {
  try {
    const params = {};

    // Pagination params
    if (pagination.page !== undefined && pagination.page !== null) params.page = pagination.page;
    if (pagination.size !== undefined && pagination.size !== null) params.size = pagination.size;
    if (pagination.startDate) params.startDate = pagination.startDate;
    if (pagination.endDate) params.endDate = pagination.endDate;

    // Filter params
    if (filters.role && filters.role !== "All Roles") params.designation = filters.role;
    if (filters.location && filters.location !== "All Locations") params.location = filters.location;
    if (filters.employmentType && filters.employmentType !== "All Types")
      params.employmentType = filters.employmentType;
    if (filters.experienceRange?.[0] > 0)
      params.minExp = filters.experienceRange[0];
    if (filters.experienceRange?.[1] < 15)
      params.maxExp = filters.experienceRange[1];
    if (filters.status) params.status = filters.status;

    const response = await axios.get(`${BASE_URL}/api/availability/timeline/window`, {
      params,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const getHolidaysByYear = async (year) => {
  try {
    const response = await axios.get(`${LMS_BASE_URL}/api/holidays/year/${year}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (err) {
    throw err;
  }
};

