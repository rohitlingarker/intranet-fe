import React, { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import axios from "axios";
import CompOffRequestsTable from "./CompOffRequestsTable";
import { useNotification } from "../../../contexts/NotificationContext";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const CompOffPage = forwardRef(({ employeeId }, ref) => {
  const [requests, setRequests] = useState([]);
  const token = localStorage.getItem('token');
  const { showNotification } = useNotification();

  const fetchRequests = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/compoff/employee/${employeeId}`,
        { withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      if (res.data.success) {
        setRequests(res.data.data);
      }
    } catch {
      showNotification("Failed to fetch comp-off requests", "error");
    }
  };

  const handleCompOffSubmit = async (modalData) => {
    // The parent component will now control the loading state
    const { dates, note, numberOfDays } = modalData;
    try {
      await axios.post(
        `${BASE_URL}/api/compoff/request`,
        {
          employeeId,
          startDate: dates.start,
          endDate: dates.end,
          isHalf: dates.isHalf,
          note,
          duration: numberOfDays,
        },
        { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
      );
      showNotification("Request submitted!", "success");
      fetchRequests(); // Re-fetch the data to update the table
      return true; // Indicate success
    } catch (e) {
      showNotification("Submission failed!", "error");
      return false; // Indicate failure
    }
  };

  useImperativeHandle(ref, () => ({
    handleCompOffSubmit,
  }));

  useEffect(() => {
    if (employeeId) fetchRequests();
  }, [employeeId]);

  const cancelRequest = async (requestId) => {
    try {
      await axios.put(
        `${BASE_URL}/api/compoff/employee/cancel/${requestId}`,
        {},
        { withCredentials: true, headers: { 
          "Cache-Control": "no-store",
          Authorization: `Bearer ${token}`
         } }
      );
      fetchRequests();
    } catch {
      showNotification("Failed to cancel request", "error");
    }
  };

  return (
    <div>
      <CompOffRequestsTable requests={requests} onCancel={cancelRequest} />
      {/* Pass `loading` to modal when you render it */}
    </div>
  );
});

export default CompOffPage;