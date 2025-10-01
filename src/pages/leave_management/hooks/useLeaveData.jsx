import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const useLeaveData = (employeeId) => {
  const [leaveData, setLeaveData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  useEffect(() => {
    const fetchLeaveData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error("Authentication token not found.");
          return;
        }
        const response = await axios.get(
          `${BASE_URL}/api/leave-requests/employee/${employeeId}`,{
            headers:{
              Authorization: `Bearer ${token}`
          }
        }
        );
        const allLeaves = response.data?.data || [];
        const approvedLeaves = allLeaves.filter(
          (leave) => leave.status === "APPROVED"|| leave.status === "PENDING"
        );
        setLeaveData(approvedLeaves);
        setError(null);
      } catch (err) {
        setError("Failed to fetch leave data");
        toast.error("Failed to fetch leave data");
      } finally {
        setLoading(false);
      }
    };
    if (employeeId) {
      fetchLeaveData();
    }
  }, [employeeId]);
  return { leaveData, loading, error };
};
export default useLeaveData;