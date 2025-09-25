import React, { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import axios from "axios";
import CompOffRequestsTable from "./CompOffRequestsTable";
import { useNotification } from "../../../contexts/NotificationContext";
import { toast } from "react-toastify";

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
      toast.error("Failed to fetch comp-off requests");
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
      toast.success("Request submitted!");
      fetchRequests(); // Re-fetch the data to update the table
      return true; // Indicate success
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to submit request");
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
      toast.error("Failed to cancel request");
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