import React, { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import axios from "axios";
import CompOffRequestsTable from "./CompOffRequestsTable";
import toast from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const CompOffPage = forwardRef(({ employeeId }, ref) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  const fetchRequests = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/compoff/employee/${employeeId}`,
        { withCredentials: true,
          headers:
          { "Cache-Control": "no-store" },
          Authorization: `Bearer ${token}`
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
    setLoading(true);
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
        { withCredentials: true ,
        headers:{
          Authorization: `Bearer ${token}`
        }}
      );
      toast.success("Request submitted!");
      fetchRequests();
      return true; // indicate success
    } catch (e) {
      toast.error("Submission failed!");
      return false; // indicate failure
    } finally {
      setLoading(false);
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
        `${BASE_URL}/api/compoff/cancel/${requestId}`,
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