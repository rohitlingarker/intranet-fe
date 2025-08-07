import React, { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import axios from "axios";
import CompOffRequestsTable from "./CompOffRequestsTable";
import toast from "react-hot-toast";

const CompOffPage = forwardRef(({ employeeId }, ref) => {
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/compoff/employee/${employeeId}`, {
        withCredentials: true,
        headers: { "Cache-Control": "no-store" },
      });
      if (res.data.success) {
        setRequests(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch comp-off requests:", err);
      toast.error("Failed to fetch comp-off requests");
    }
  };

  const handleCompOffSubmit = async (modalData) => {
    const { dates, note } = modalData;
    try {
      await axios.post("http://localhost:8080/api/compoff/request", {
        employeeId,
        startDate: dates.start,
        endDate: dates.end,
        isHalf: dates.isHalf,
        note,
      });
      toast.success("Request submitted!");
      fetchRequests();
    } catch (e) {
      toast.error("Submission failed!");
    }
  };

  useImperativeHandle(ref, () => ({
    handleCompOffSubmit,
  }));

  useEffect(() => {
    if (employeeId) {
      fetchRequests();
    }
  }, [employeeId]);

  const cancelRequest = async (requestId) => {
    try {
      await axios.put(
        `http://localhost:8080/api/compoff/employee/cancel/${requestId}`,
        {},
        {
          withCredentials: true,
          headers: { "Cache-Control": "no-store" },
        }
      );
      fetchRequests();
    } catch (err) {
      console.error("Failed to cancel request", err);
      toast.error("Failed to cancel request");
    }
  };

  return (
    <div className="p-6">
      {/* Remove modal rendering here */}
      <CompOffRequestsTable requests={requests} onCancel={cancelRequest} />
    </div>
  );
});

export default CompOffPage;