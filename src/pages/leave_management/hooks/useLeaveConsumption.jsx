import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const useLeaveConsumption = (employeeId, refreshKey) => {

  const token = localStorage.getItem('token');
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
        setLeaveData(res.data); // Keep full data for each leave type
        setLoading(false);
      })
      .catch((err) => {
        toast.error("Failed to fetch leave data");
        setLoading(false);
      });
  }, [employeeId, refreshKey]);

  return { leaveData, loading };
};

export default useLeaveConsumption;
