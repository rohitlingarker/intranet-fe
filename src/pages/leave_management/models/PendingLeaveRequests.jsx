import React, { useEffect, useState } from "react";
import axios from "axios";
import PendingLeaveRequestsTable from "./PendingLeaveRequestsTable";
import SkeletonTable from "./SkeletonTable";
import ReactPaginate from "react-paginate";
import RequestLeaveModal from "./RequestLeaveModal";

const ITEMS_PER_PAGE = 5;

/**
 * Reusable function to fetch pending leave requests, leave types, and balances.
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

    const [leaveReqRes, leaveTypeRes, balanceRes] = await Promise.all([
      axios.get(
        `http://localhost:8002/api/leave-requests/employee/${employeeId}`,
        {
          withCredentials: true,
          headers: { "Cache-Control": "no-store" },
        }
      ),
      axios.get("http://localhost:8002/api/leave/get-all-leave-types"),
      axios.get(
        `http://localhost:8002/api/leave-balance/employee/${employeeId}`
      ),
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

const PendingLeaveRequests = ({ setIsRequestLeaveModalOpen }) => {
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);

  const [refreshKey, setRefreshKey] = useState(0);

  const employeeId = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")).id
    : null;

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
  }, [employeeId, refreshKey]);

  const handleLeaveRequestSuccess = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };

  const handlePageChange = ({ selected }) => setCurrentPage(selected);

  const paginatedLeaves = pendingLeaves.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  return (
    <>
      {loading ? (
        <SkeletonTable rows={5} columns={6} />
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : pendingLeaves.length === 0 ? (
        <div className="py-12">
          <h1 className="text-black-600 text-3xl font-bold">
            🎉 Cheers! No pending leave requests.
          </h1>
        </div>
      ) : (
        <>
          <PendingLeaveRequestsTable
            pendingLeaves={paginatedLeaves}
            leaveTypes={leaveTypes}
            leaveBalances={leaveBalances}
            setPendingLeaves={setPendingLeaves}
            employeeId={employeeId}
          />

          {pendingLeaves.length > ITEMS_PER_PAGE && (
            <ReactPaginate
              previousLabel={"←"}
              nextLabel={"→"}
              pageCount={Math.ceil(pendingLeaves.length / ITEMS_PER_PAGE)}
              onPageChange={handlePageChange}
              containerClassName={"flex space-x-2 mt-4 justify-center"}
              activeClassName={"font-bold underline"}
              pageLinkClassName={"px-3 py-1 bg-gray-200 rounded"}
              previousLinkClassName={"px-3 py-1 bg-gray-300 rounded"}
              nextLinkClassName={"px-3 py-1 bg-gray-300 rounded"}
              breakLabel={"..."}
            />
          )}
        </>
      )}
    </>
  );
};

export { PendingLeaveRequests, fetchData };
