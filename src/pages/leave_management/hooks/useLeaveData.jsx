import { useEffect, useState } from "react";
import axios from "axios";

const useLeaveData = (employeeId) => {
  const [leaveData, setLeaveData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const token = localStorage.getItem('token')
  useEffect(() => {
    const fetchLeaveData = async () => {
      try {
        setLoading(true);
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
        console.log("Leave data fetched:", approvedLeaves);
        console.log("leaveData:", leaveData);
        setError(null);
      } catch (err) {
        setError("Failed to fetch leave data");
      } finally {
        setLoading(false);
      }
    };

    if (employeeId) {
      fetchLeaveData();
    }
  }, [employeeId]);
  console.log("Leave data fetched:", leaveData);

  return { leaveData, loading, error };
};

export default useLeaveData;
