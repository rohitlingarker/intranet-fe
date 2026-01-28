import axios from 'axios';

const RMS_BASE_URL = import.meta.env.VITE_RMS_BASE_URL;

export const createClient = async (clientData) => {
    try {
        const response = await axios.post(`${RMS_BASE_URL}/api/client/create`,
            clientData,
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