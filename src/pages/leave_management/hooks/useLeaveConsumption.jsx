import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import SockJS from "sockjs-client";
import { over } from "stompjs";

let stompClient = null;

const useLeaveConsumption = (employeeId, refreshKey) => {
  const token = localStorage.getItem("token");
  const [leaveData, setLeaveData] = useState([]);
  const [loading, setLoading] = useState(true);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  // ---------------------------
  // FUNCTION TO FETCH LEAVE DATA
  // ---------------------------
  const fetchLeaveData = () => {
    if (!employeeId) return;

    axios
      .get(`${BASE_URL}/api/leave-balance/employee/${employeeId}/${new Date().getFullYear()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setLeaveData(res.data);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to fetch leave data");
        setLoading(false);
      });
  };

  // ---------------------------
  // FETCH DATA ON MOUNT & WHEN REFRESH KEY CHANGES
  // ---------------------------
  useEffect(() => {
    fetchLeaveData();
  }, [employeeId, refreshKey]);

  // ---------------------------
  // WEBSOCKET REAL-TIME LISTENER
  // ---------------------------
  // useEffect(() => {
  //   let isMounted = true;

  //   const socket = new SockJS(`${BASE_URL}/ws`);
  //   stompClient = over(socket);

  //   stompClient.connect(
  //     {},
  //     () => {
  //       console.log("Connected to WebSocket from Leave Consumption Hook");

  //       if (!isMounted) return;

  //       stompClient.subscribe("/topic/data-updated", () => {
  //         console.log("Real-time update received → refreshing leave data");
  //         fetchLeaveData();
  //       });
  //     },
  //     (error) => {
  //       console.error("WebSocket Connection Error:", error);
  //     }
  //   );

  //   return () => {
  //     isMounted = false;

  //     if (stompClient && stompClient.connected) {
  //       stompClient.disconnect(() =>
  //         console.log("WebSocket Disconnected (safe cleanup)")
  //       );
  //     }
  //   };
  // }, []);

  return { leaveData, loading };
};

export default useLeaveConsumption;
