"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminApprovalActions() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingRequestId, setUpdatingRequestId] = useState(null);

  const token = localStorage.getItem("token");
  const BASE_URL = import.meta.env.VITE_EMPLOYEE_ONBOARDING_URL;

  /* ---------------- FETCH ADMIN APPROVAL REQUESTS ---------------- */
  const fetchMyActions = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/offer-approval/admin/my-actions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRequests(res.data || []);
    } catch (error) {
      console.error("Failed to fetch admin approvals", error);
      alert("Failed to load approval requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyActions();
  }, []);

  /* ---------------- SUBMIT APPROVAL ACTION ---------------- */
  const submitAction = async (user_uuid, request_id, action) => {
    try {
      setUpdatingRequestId(request_id);

      await axios.post(
        `${BASE_URL}/offer-approval/action`,
        [
          {
            user_uuid,
            action,
            comments:
              action === "APPROVED"
                ? "Approved by admin"
                : action === "REJECTED"
                ? "Rejected by admin"
                : "Kept on hold",
          },
        ],
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // ✅ Update UI
      setRequests((prev) =>
        prev.map((r) =>
          r.request_id === request_id
            ? { ...r, action }
            : r
        )
      );
    } catch (error) {
      console.error("Approval update failed", error);
      alert("Failed to update approval status");
    } finally {
      setUpdatingRequestId(null);
    }
  };

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return <div className="p-10 text-center">Loading approvals...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        My Approval Requests
      </h1>

      {requests.length === 0 ? (
        <p className="text-gray-500">
          No approval requests assigned to you
        </p>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.request_id}
              className="bg-white shadow rounded-lg p-5 flex justify-between items-center"
            >
              {/* LEFT */}
              <div>
                <p className="font-semibold text-lg">
                  {req.user_first_name} {req.user_last_name}
                </p>

                <p className="text-sm text-gray-600">
                  Requested by: {req.requested_name}
                </p>

                <p className="text-sm">
                  Status:{" "}
                  <span className="font-medium">
                    {req.action}
                  </span>
                </p>

                {req.message && (
                  <p className="text-xs text-gray-500 mt-1">
                    {req.message}
                  </p>
                )}
              </div>

              {/* ACTIONS */}
              {req.action === "PENDING" && (
                <div className="flex gap-2">
                  <button
                    disabled={updatingRequestId === req.request_id}
                    onClick={() =>
                      submitAction(
                        req.user_uuid,
                        req.request_id,
                        "APPROVED"
                      )
                    }
                    className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-60"
                  >
                    Approve
                  </button>

                  <button
                    disabled={updatingRequestId === req.request_id}
                    onClick={() =>
                      submitAction(
                        req.user_uuid,
                        req.request_id,
                        "REJECTED"
                      )
                    }
                    className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-60"
                  >
                    Reject
                  </button>

                  <button
                    disabled={updatingRequestId === req.request_id}
                    onClick={() =>
                      submitAction(
                        req.user_uuid,
                        req.request_id,
                        "ON_HOLD"
                      )
                    }
                    className="px-4 py-2 bg-gray-600 text-white rounded disabled:opacity-60"
                  >
                    On Hold
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
