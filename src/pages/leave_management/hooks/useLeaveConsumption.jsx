import { useEffect, useState } from "react";
import axios from "axios";

const useLeaveConsumption = (employeeId) => {
    console.log("Fetching leave consumption for employee:", employeeId);
  const [leaveData, setLeaveData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!employeeId) return;

    axios
      .get(`http://localhost:8080/api/leave-balance/employee/${employeeId}`)
      .then((res) => {
        console.log("Leave consumption data fetched:", res.data);
        setLeaveData(res.data); // Keep full data for each leave type
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch leave data:", err);
        setLoading(false);
      });
  }, [employeeId]);

  return { leaveData, loading };
};

export default useLeaveConsumption;
