import { useEffect, useState } from "react";
import axios from "axios";


// import 

const useLeaveConsumption = (employeeId) => {

  const token = localStorage.getItem('token')
  // console.log("Fetching leave consumption for employee:", employeeId);
  const [leaveData, setLeaveData] = useState([]);
  const [loading, setLoading] = useState(true);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    if (!employeeId) return;

    axios
      .get(`${BASE_URL}/api/leave-balance/employee/${employeeId}`,{
        headers:{
          Authorization: `Bearer ${token}`
        }
      })
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
