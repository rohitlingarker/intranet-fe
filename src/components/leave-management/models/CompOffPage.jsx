import React, { useEffect, useState } from "react";
import axios from "axios";
import CompOffRequestModal from "./CompOffRequestModal";
import CompOffRequestsTable from "./CompOffRequestsTable";

const CompOffPage = ({ employeeId }) => {
  const [requests, setRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const fetchRequests = async () => {
    const res = await axios.get(`http://localhost:8080/api/compoff/employee/PAVEMP1D23B`, {
      withCredentials: true,
      headers: { "Cache-Control": "no-store" },
    }).then((res)=>{
      if(res.data.success){
        setRequests(res.data.data);
      }
    }).catch((err) => {
      console.error("Failed to fetch comp-off requests:", err);
    });
  };

  useEffect(() => {
    if (employeeId) {
      fetchRequests();
    }
  }, [employeeId]);

  const submitRequest = async ({ dates, note }) => {
    try {
      const start = dates.start;
      const end = dates.end || start;

      let numberOfDays = dates.isHalf
        ? 0.5
        : Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

      await axios.post("http://localhost:8080/api/compoff/request", {
        payload: {
          employeeId,
          startDate: start,
          endDate: end,
          isHalfDay: dates.isHalf,
          days: numberOfDays,
          note,
        },
      });

      await fetchRequests(); // Refresh after request
    } catch (err) {
      console.error("Failed to submit compoff request:", err);
    }
  };

  const cancelRequest = async (requestId) => {
    try {
      await axios.put(`http://localhost:8080/api/compoff/employee/cancel/${requestId}`,{
        withCredentials: true,
        headers: { "Cache-Control": "no-store" },
      });
      await fetchRequests();
    } catch (err) {
      console.error("Failed to cancel request", err);
    }
  };

  return (
    <div className="p-6">

      {showModal && (
        <CompOffRequestModal
          onSubmit={submitRequest}
          onClose={() => setShowModal(false)}
        />
      )}

      <CompOffRequestsTable requests={requests} onCancel={cancelRequest} />
    </div>
  );
};

export default CompOffPage;
