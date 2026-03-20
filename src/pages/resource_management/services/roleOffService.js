import axios from "axios";

const BASE_URL = import.meta.env.VITE_RMS_BASE_URL;

export const getResources = async (projectId) => {
    try {
        const response = await axios.get(`${BASE_URL}/api/role-off/get-resources/${projectId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};