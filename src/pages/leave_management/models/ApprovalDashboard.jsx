import React, { useState, useEffect } from "react";
import { approvalService } from '../services/approvalService';
import ApprovalDiffViewer from '../components/ApprovalDiffViewer';

const ApprovalDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [comment, setComment] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    loadPendingApprovals();
  }, []);

  const loadPendingApprovals = async () => {
    try {
      setIsLoading(true);
      const data = await approvalService.getPendingApprovals();
      setRequests(data);
    } catch (error) {
      console.error('Failed to load approvals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (request) => {
    try {
      await approvalService.approveRequest(request.id, comment);
      await loadPendingApprovals();
      setComment('');
      setSelectedRequest(null);
    } catch (error) {
      console.error('Failed to approve:', error);
    }
  };

  const handleReject = async (request) => {
    try {
      if (!reason) {
        alert('Rejection reason is required');
        return;
      }
      await approvalService.rejectRequest(request.id, reason);
      await loadPendingApprovals();
      setReason('');
      setSelectedRequest(null);
    } catch (error) {
      console.error('Failed to reject:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Pending Approvals</h2>
      {isLoading ? (
        <div className="text-center">Loading approvals...</div>
      ) : requests.length === 0 ? (
        <div className="text-center text-gray-500">No pending approvals</div>
      ) : (
        <div className="space-y-4">
          {requests.map(request => (
            <div key={request.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-medium">{request.rule.actionType}</h3>
                  <p className="text-sm text-gray-500">Created: {new Date(request.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <ApprovalDiffViewer payload={request.payload} />

              <div className="mt-4 space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Add comment (optional)"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Rejection reason (required for reject)"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => handleReject(request)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(request)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
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
  );
};

export default ApprovalDashboard;