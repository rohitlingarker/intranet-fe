import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const lockRecord = async ({ tableName, recordId, lockedBy }) => {
  const token = localStorage.getItem("token");
  try {
    const res = await axios.post(`${BASE_URL}/api/lock/lock`,
        { tableName, recordId, lockedBy },
        { headers : { Authorization: `Bearer ${token}` }});
    return res.data; // { success: true/false, message: "" }
  } catch (err) {
    console.error("Error locking record:", err);
    return (err.response?.data?.message || "Error locking record");
  }
};

export const releaseLock = async ({ tableName, recordId, lockedBy }) => {
  const token = localStorage.getItem("token");
  try {
    const res = await axios.post(`${BASE_URL}/api/lock/release`,
        { tableName, recordId, lockedBy },
        { headers : { Authorization: `Bearer ${token}` }});
    return res.data; // "Lock released"
  } catch (err) {
    console.error("Error releasing lock:", err);
    return (err.response?.data?.message || "Error releasing lock");
  }
};

export const checkLock = async ({ tableName, recordId }) => {
  const token = localStorage.getItem("token");
  try {
    const res = await axios.get(`${BASE_URL}/api/lock/check`,{
        params: { tableName, recordId },
        headers : { Authorization: `Bearer ${token}` },
      });
    return res.data; // { locked: true/false, lockedBy: "user" }
  } catch (err) {
    console.error("Error checking lock:", err);
    return (err.response?.data?.message || "Error checking lock");
  }
};