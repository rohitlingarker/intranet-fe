import axios from 'axios';

const BASE_URL = import.meta.env.VITE_RMS_BASE_URL || 'http://localhost:8080';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
        }
    };
};

/**
 * Enterprise Demand Service
 */
export const demandService = {
    /**
     * Fetches all demands with high-level data for the workspace
     */
    getAllDemands: async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/demand/demands`, getAuthHeader());
            if (response.data && response.data.success) {
                return response.data.data;
            }
            throw new Error(response.data?.message || 'Failed to fetch demands');
        } catch (error) {
            console.error('Error in getAllDemands:', error);
            throw error;
        }
    },

    /**
     * Fetches detailed 360° view of a single demand
     * @param {string|number} id 
     */
    getDemandById: async (id) => {
        try {
            const response = await axios.get(`${BASE_URL}/api/demand/${id}`, getAuthHeader());
            if (response.data && response.data.success) {
                return response.data.data;
            }
            throw new Error(response.data?.message || 'Failed to fetch demand details');
        } catch (error) {
            console.error(`Error in getDemandById for ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Fetches KPI summary data
     */
    getKPISummary: async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/demand/kpi`, getAuthHeader());
            if (response.data && response.data.success) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            console.error('Error in getKPISummary:', error);
            return null; // Return null to allow fallback to 0s
        }
    },

    /**
     * Fetches Dashboard KPI summary data
     */
    getDashboardKPIs: async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/demand/dashboard-kpi`, getAuthHeader());
            if (response.data && response.data.success) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            console.error('Error in getDashboardKPIs:', error);
            return null;
        }
    },

    /**
     * Fetches demands created by the current user
     */
    getDemandsCreatedByMe: async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/demand/created-by-me`, getAuthHeader());
            if (response.data && response.data.success) {
                return response.data.data;
            }
            throw new Error(response.data?.message || 'Failed to fetch demands created by me');
        } catch (error) {
            console.error('Error in getDemandsCreatedByMe:', error);
            throw error;
        }
    },

    /**
     * Fetches project-specific KPI summary
     * @param {string|number} projectId 
     */
    getProjectKPIs: async (projectId) => {
        try {
            const response = await axios.get(`${BASE_URL}/api/demand/kpi`, {
                ...getAuthHeader(),
                params: { projectId }
            });
            if (response.data && response.data.success) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            console.error(`Error in getProjectKPIs for ID ${projectId}:`, error);
            return null;
        }
    },

    /**
     * Fetches demands for a specific project
     * @param {string|number} projectId 
     */
    getProjectDemands: async (projectId) => {
        try {
            const response = await axios.get(`${BASE_URL}/api/demand/project/${projectId}`, getAuthHeader());
            if (response.data && response.data.success) {
                return response.data.data;
            }
            throw new Error(response.data?.message || 'Failed to fetch project demands');
        } catch (error) {
            console.error(`Error in getProjectDemands for ID ${projectId}:`, error);
            throw error;
        }
    }
};

export default demandService;
