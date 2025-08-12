import React, { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import axios from "axios";

const CompOffBalanceRequests = ({ managerId }) => {
  const [pendingCompOffs, setPendingCompOffs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Toast helper
  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch comp-off requests for the manager
  const fetchCompOffs = async () => {
    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:8080/api/compoff/pending",
        { managerId }
      );
      setPendingCompOffs(
        Array.isArray(res.data) ? res.data : (res.data?.data || [])
      );
    } catch (err) {
      showToast("Failed to fetch Comp-Off requests.", "error");
      setPendingCompOffs([]);
    } finally {
      setLoading(false);
    }
  };

  // Approve comp-off
  const handleApprove = async (compoffId) => {
    try {
      setLoading(true);
      await axios.put("http://localhost:8080/api/compoff/approve", {
        managerId,
        compoffId,
      });
      showToast("Comp-Off approved.", "success");
      fetchCompOffs();
    } catch {
      showToast("Approval failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Reject comp-off
  const handleReject = async (compoffId) => {
    try {
      setLoading(true);
      await axios.put("http://localhost:8080/api/compoff/reject",
        { managerId, compoffId },
      );
      showToast("Comp-Off rejected.", "success");
      fetchCompOffs();
    } catch {
      showToast("Rejection failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (managerId) fetchCompOffs();
  }, [managerId]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500 mb-6">
      <h3 className="text-lg font-semibold text-blue-900 mb-2">Comp-Off Balance Requests</h3>
      <div className="border-b-2 border-blue-500 w-16 mb-4"></div>
      {pendingCompOffs.length === 0 ? (
        <p className="text-gray-600">No pending Comp-Off requests for your team.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse rounded-lg overflow-hidden shadow-sm">
            <thead>
              <tr className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white text-sm">
                <th className="p-3 text-left uppercase">Employee</th>
                <th className="p-3 text-left uppercase">Dates</th>
                <th className="p-3 text-left uppercase">Duration</th>
                <th className="p-3 text-left uppercase">Note</th>
                <th className="p-3 text-left uppercase">Status</th>
                <th className="p-3 text-left uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-blue-100">
              {pendingCompOffs.map((req) => (
                <tr key={req.idleaveCompoff} className="hover:bg-blue-50 transition-colors">
                  <td className="p-3">{req.employeeName}</td>
                  <td className="p-3">
                    {req.startDate}
                    {req.endDate && req.endDate !== req.startDate ? ` to ${req.endDate}` : ""}
                  </td>
                  <td className="p-3">
                    {req.halfDay ? "Half Day" : `${req.duration} ${req.duration === 1 ? "Day" : "Days"}`}
                  </td>
                  <td className="p-3">{req.note}</td>
                  <td className="p-3 capitalize">{req.status}</td>
                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => handleApprove(req.idleaveCompoff)}
                      className="p-1 pr-2 text-green-600 hover:text-green-800 transition-colors"
                      title="Approve"
                      disabled={loading}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleReject(req.idleaveCompoff)}
                      className="p-1 pl-4 text-red-600 hover:text-red-800 transition-colors"
                      title="Reject"
                      disabled={loading}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`
            fixed top-6 right-6 z-[70] min-w-[200px] px-5 py-3 rounded-lg shadow-lg flex items-center gap-4 animate-slide-left
            ${toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}
          `}
          style={{ transition: "all 0.4s" }}
          role="alert"
        >
          <span className="flex-1">{toast.msg}</span>
          <button
            className="ml-2 text-white opacity-80 hover:opacity-100 text-lg leading-none"
            onClick={() => setToast(null)}
            aria-label="Close"
          >
            ×
          </button>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

export default CompOffBalanceRequests;