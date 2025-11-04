import React, { useEffect, useState } from "react";
import axios from "axios";
import PendingLeaveRequestsTable from "./PendingLeaveRequestsTable";
import SkeletonTable from "./SkeletonTable";
import RequestLeaveModal from "./RequestLeaveModal";
import { Fonts } from "../../../components/Fonts/Fonts";
import { useAuth } from "../../../contexts/AuthContext";
import { toast } from "react-toastify";
import Pagination from "../../../components/Pagination/pagination";

const ITEMS_PER_PAGE = 5;
const BASE_URL = import.meta.env.VITE_BASE_URL;

/**
 * Fetch pending leave requests, leave types, and balances.
 */
const fetchData = async (
  employeeId,
  setPendingLeaves,
  setLeaveTypes,
  setLeaveBalances,
  setError,
  setLoading
) => {
  try {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication token not found.");
      return;
    }

    const [leaveReqRes, leaveTypeRes, balanceRes] = await Promise.all([
      axios.get(`${BASE_URL}/api/leave-requests/employee/pending/${employeeId}`, {
        withCredentials: true,
        headers: {
          "Cache-Control": "no-store",
          Authorization: `Bearer ${token}`,
        },
      }),
      axios.get(`${BASE_URL}/api/leave/get-all-leave-types`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`${BASE_URL}/api/leave-balance/employee/${employeeId}`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    const allLeaves = Array.isArray(leaveReqRes.data?.data)
      ? leaveReqRes.data.data
      : [];
    const onlyPending = allLeaves.filter(
      (leave) => String(leave.status).toUpperCase() === "PENDING"
    );

    setPendingLeaves(onlyPending);
    setLeaveTypes(leaveTypeRes.data || []);
    setLeaveBalances(balanceRes.data || {});
  } catch (err) {
    console.error(err);
    setError("Failed to fetch pending leave requests.");
  } finally {
    setLoading(false);
  }
};

const PendingLeaveRequests = ({ refreshKey }) => {
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // Start from page 1
  const [refreshKeyInternal, setRefreshKeyInternal] = useState(0);

  const employeeId = useAuth()?.user?.user_id;

  useEffect(() => {
    if (employeeId) {
      fetchData(
        employeeId,
        setPendingLeaves,
        setLeaveTypes,
        setLeaveBalances,
        setError,
        setLoading
      );
    }
  }, [employeeId, refreshKey, refreshKeyInternal]);

  const handleLeaveRequestSuccess = () => {
    setRefreshKeyInternal((prevKey) => prevKey + 1);
  };

  // Pagination
  const totalPages = Math.ceil(pendingLeaves.length / ITEMS_PER_PAGE);
  const paginatedLeaves = pendingLeaves.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  return (
    <>
      {loading ? (
        <SkeletonTable rows={3} columns={6} />
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : pendingLeaves.length === 0 ? (
        <div className="flex items-center justify-center h-32">
          <div className="text-3xl leading-none">🎉</div>
          <div className="pl-4 leading-snug">
            <h2 className="text-xl font-semibold">
              Cheers! No pending leave requests.
            </h2>
            <p className="text-sm text-gray-600">Request leave on the above!</p>
          </div>
        </div>
      ) : (
        <>
          <PendingLeaveRequestsTable
            pendingLeaves={paginatedLeaves}
            leaveBalances={leaveBalances}
            leaveTypeNames={leaveTypes}
            employeeId={employeeId}
            refreshData={handleLeaveRequestSuccess}
          />

          {/* ✅ Custom Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPrevious={handlePrevious}
              onNext={handleNext}
            />
          )}
        </>
      )}
    </>
  );
};

export default PendingLeaveRequests;
