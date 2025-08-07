import { useEffect, useState } from "react";
import axios from "axios";

const useLeaveData = (employeeId) => {
  const [leaveData, setLeaveData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaveData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:8080/api/leave-requests/employee/${employeeId}`
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
