import React, { useEffect, useState } from "react";
import axios from "axios";
import ActionButtons from "./ActionButtons";
import PendingLeaveRequestsTable from "./PendingLeaveRequestsTable";
import SkeletonTable from "./SkeletonTable";
import ReactPaginate from "react-paginate";
import Pagination  from '../../../components/Pagination/pagination'
import { PartyPopper } from "lucide-react";
import { Fonts } from "../../../components/Fonts/Fonts";

const ITEMS_PER_PAGE = 5;
const PendingLeaveRequests = ({ setIsRequestLeaveModalOpen }) => {
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const employeeId = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")).id
    : null;

  const fetchData = async () => {
    try {
      setLoading(true);
      const [leaveReqRes, leaveTypeRes, balanceRes] = await Promise.all([
        axios.get(
          `http://localhost:8080/api/leave-requests/employee/${employeeId}`,
          {
            withCredentials: true,
            headers: { "Cache-Control": "no-store" },
          }
        ),
        axios.get("http://localhost:8080/api/leave/get-all-leave-types"),
        axios.get(
          `http://localhost:8080/api/leave-balance/employee/${employeeId}`
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

  useEffect(() => {
    fetchData();
  }, []);

  const totalPages = Math.ceil(pendingLeaves.length / ITEMS_PER_PAGE);
  const paginatedRequests = pendingLeaves.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // const handlePageChange = ({ selected }) => setCurrentPage(selected);

  // const paginatedLeaves = pendingLeaves.slice(
  //   currentPage * ITEMS_PER_PAGE,
  //   (currentPage + 1) * ITEMS_PER_PAGE
  // );

  return (
    <>
      {loading ? (
        <SkeletonTable rows={4} columns={6} />
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : pendingLeaves.length === 0 ? (
        <div className="flex items-center">
          <div className="text-black-600 text-3xl">
            🎉
          </div>
          <div className="text-black-600 pl-4">
            <h2 className={Fonts.heading4}>
              Cheers! No pending leave requests.
            </h2>
            <p className={Fonts.caption}>Request leave on the above!</p>
          </div>
        </div>
      ) : (
        <>
          <PendingLeaveRequestsTable
            pendingLeaves={paginatedRequests}
            leaveTypes={leaveTypes}
            leaveBalances={leaveBalances}
            setPendingLeaves={setPendingLeaves}
            employeeId={employeeId}
          />

          {pendingLeaves.length > ITEMS_PER_PAGE && (
            // <ReactPaginate
            //   previousLabel={"←"}
            //   nextLabel={"→"}
            //   pageCount={Math.ceil(pendingLeaves.length / ITEMS_PER_PAGE)}
            //   onPageChange={handlePageChange}
            //   containerClassName={"flex space-x-2 mt-4 justify-center"}
            //   activeClassName={"font-bold underline"}
            //   pageLinkClassName={"px-3 py-1 bg-gray-200 rounded"}
            //   previousLinkClassName={"px-3 py-1 bg-gray-300 rounded"}
            //   nextLinkClassName={"px-3 py-1 bg-gray-300 rounded"}
            //   breakLabel={"..."}
            // />
            <div className="mb-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPrevious={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                onNext={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
              />
            </div>
          )}
        </>
      )}

      
    </>
  );
};

export default PendingLeaveRequests;
