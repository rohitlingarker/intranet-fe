import axios from 'axios';

const RMS_BASE_URL = import.meta.env.VITE_RMS_BASE_URL;

const getAuthHeader = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
});

/**
 * Fetches High-Level KPI data for the Admin Dashboard
 * URL: /api/client/get-admin-kpi
 */
export const getAdminKPI = async () => {
    try {
        const response = await axios.get(
            `${RMS_BASE_URL}/api/client/get-admin-kpi`, 
            getAuthHeader()
        );
        return response.data;
    } catch (error) {
        console.error("KPI Fetch Error:", error);
        throw error;
    }
};

export const searchClients = async (filters, page = 0, size = 10) => {
    try {
        const response = await axios.get(`${RMS_BASE_URL}/api/client/search`, {
            ...getAuthHeader(),
            params: {
                // Mapping Frontend Filter state -> Backend ClientFilterDTO
                clientName: filters.search,
                countryName: filters.region,
                clientType: filters.type,
                priorityLevel: filters.priority,
                status: filters.status,
                createdFrom: filters.startDate,
                createdTo: filters.endDate,
                // Pagination
                page: page,
                size: size
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};
 

export const createClient = async (clientData) => {
    try {
        const response = await axios.post(`${RMS_BASE_URL}/api/client/create`, clientData, getAuthHeader());
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getClients = async () => {
  try {
    const response = await axios.get(`${RMS_BASE_URL}/api/client/get-all-clients`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getClientById = async (clientId) => {
    try {
        const response = await axios.get(`${RMS_BASE_URL}/api/client/${clientId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createClientSLA = async (slaData) => {
    try {
        const response = await axios.post(`${RMS_BASE_URL}/api/client-sla/create`,
            slaData,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getClientSLA = async (clientId) => {
    try {
        const response = await axios.get(`${RMS_BASE_URL}/api/client-sla/clientSLA/${clientId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createClientCompliance = async (complianceData) => {
    try {
        const response = await axios.post(`${RMS_BASE_URL}/api/client-compliance/create`,
            complianceData,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getClientCompliance = async (clientId) => {
    try {
        const responce = await axios.get(`${RMS_BASE_URL}/api/client-compliance/clientCompliance/${clientId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });
        return responce.data;
    } catch (error) {
        throw error;
    }
};

export const createClientEscalation = async (escalationData) => {
    try {
        const response = await axios.post(`${RMS_BASE_URL}/api/client-contact/create`,
            escalationData,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            }
        );
        return response.data;   
    } catch (error) {
        throw error;
    }
};

export const getClientEscalation = async (clientId) => {
    try {
        const responce = await axios.get(`${RMS_BASE_URL}/api/client-contact/clientContact/${clientId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });
        return responce.data;
    } catch (error) {
        throw error;
    }
};

export const createClientAsset = async (assetData) => {
  try {
    const response = await axios.post(
      `${RMS_BASE_URL}/api/clinet-assets`,
      assetData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/* ===============================
   UPDATE CLIENT ASSET
   =============================== */
export const updateClientAsset = async (assetId, assetData) => {
  try {
    const response = await axios.put(
      `${RMS_BASE_URL}/api/clinet-assets/${assetId}`,
      assetData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/* ===============================
   DELETE (SOFT DELETE) CLIENT ASSET
   =============================== */
export const deleteClientAsset = async (assetId) => {
  try {
    const response = await axios.delete(
      `${RMS_BASE_URL}/api/clinet-assets/${assetId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/* ===============================
   GET ASSETS BY CLIENT ID
   =============================== */
export const getAssetsByClient = async (clientId) => {
  try {
    const response = await axios.get(
      `${RMS_BASE_URL}/api/clinet-assets/client/${clientId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const getAssetById = async (assetId) => {
  try {
    const response = await axios.get(
      `${RMS_BASE_URL}/api/clinet-assets/${assetId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
