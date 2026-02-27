import axios from "axios";

const BASE_URL = import.meta.env.VITE_RMS_BASE_URL;

/**
 * Fetch all enums from the backend.
 * Returns the data array containing enum objects.
 */
export const getAllEnums = async () => {
    try {
        const res = await axios.get(`${BASE_URL}/api/enums/all`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        return res.data;
    } catch (err) {
        console.error("Error fetching all enums:", err);
        throw err;
    }
};

/**
 * Fetch enums by category.
 * @param {string} category - The category to fetch enums for.
 */
export const getEnumsByCategory = async (category) => {
    try {
        const res = await axios.get(`${BASE_URL}/api/enums/category/${category}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        return res.data;
    } catch (err) {
        console.error(`Error fetching enums for category ${category}:`, err);
        throw err;
    }
};
