import React, { useState, useEffect } from "react";
import { approvalService } from "../services/approvalService";
import { toast } from "react-toastify";
import ApprovalQueue from "./ApprovalQueue";

const ApprovalDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // State to manage comments and reasons for each request individually.
  // This fixes a bug where typing in one card would update all cards.
  const [actionState, setActionState] = useState({});

  useEffect(() => {
    loadPendingApprovals();
  }, []);

  const loadPendingApprovals = async () => {
    try {
      setIsLoading(true);
      const response = await approvalService.getPendingApprovals();
      const data = Array.isArray(response)
      ? response
      : response.data || response.results || [];
      setRequests(data);
      // Initialize the state for comments and reasons
      const initialState = data.reduce((acc, req) => {
        acc[req.id] = { comment: "", reason: "" };
        return acc;
      }, {});
      setActionState(initialState);
    } catch (error) {
      toast.error("Failed to load approvals");
      console.error("Failed to load approvals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStateChange = (id, field, value) => {
    setActionState((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleApprove = async (request) => {
    const { id } = request;
    const comment = actionState[id]?.comment || "";
    try {
      await approvalService.approveRequest(id, comment);
      toast.success("Request Approved successfully");
      await loadPendingApprovals(); // Reload list after action
    } catch (error) {
      toast.error("Failed to approve request");
      console.error("Failed to approve:", error);
    }
  };

  const handleReject = async (request) => {
    const { id } = request;
    const reason = actionState[id]?.reason || "";
    if (!reason) {
      toast.error("Rejection reason is required");
      return;
    }
    try {
      await approvalService.rejectRequest(id, reason);
      toast.success("Request Rejected successfully");
      await loadPendingApprovals(); // Reload list after action
    } catch (error) {
      toast.error("Failed to reject request");
      console.error("Failed to reject:", error);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Pending Approvals
          </h1>
          <p className="text-gray-500 mt-1">
            Review and take action on the requests below.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center p-10 bg-white rounded-lg shadow">
            <p className="text-gray-600">Loading approvals...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center p-10 bg-white rounded-lg shadow">
            <p className="text-gray-500">No pending approvals. Great job! 👍</p>
          </div>
        ) : (
          <div className="space-y-6">
            {requests.map((request) => (
              <div
                key={request.id}
                className="bg-white p-6 rounded-xl shadow-md border border-gray-200 transition-shadow hover:shadow-lg"
              >
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4">
                  <div>
                    {/* FIX 1: Accessing actionType directly on request */}
                    <h3 className="font-semibold text-lg text-gray-900">
                      {request.actionType.replace(/_/g, " ")}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Requested by{" "}
                      <span className="font-medium text-gray-700">
                        {request.makerName}
                      </span>{" "}
                      on {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="mt-2 sm:mt-0 px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 self-start">
                    {request.status}
                  </span>
                </div>

                {/* FIX 2: Using the refactored component to show payload details */}
                <ApprovalQueue actionType={request.actionType} payload={request.payload} />

                <div className="mt-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor={`comment-${request.id}`}
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Comment (Optional)
                      </label>
                      <input
                        id={`comment-${request.id}`}
                        type="text"
                        placeholder="Add an approval comment..."
                        value={actionState[request.id]?.comment || ""}
                        onChange={(e) =>
                          handleStateChange(
                            request.id,
                            "comment",
                            e.target.value
                          )
                        }
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={`reason-${request.id}`}
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Rejection Reason
                      </label>
                      <input
                        id={`reason-${request.id}`}
                        type="text"
                        placeholder="Required for rejection..."
                        value={actionState[request.id]?.reason || ""}
                        onChange={(e) =>
                          handleStateChange(
                            request.id,
                            "reason",
                            e.target.value
                          )
                        }
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      onClick={() => handleReject(request)}
                      className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(request)}
                      className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovalDashboard;