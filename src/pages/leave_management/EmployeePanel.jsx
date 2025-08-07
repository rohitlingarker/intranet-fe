import React, { useState } from "react";
import WeeklyPattern from "../leave_management/charts/WeeklyPattern";
import MonthlyStats from "../leave_management/charts/MonthlyStats";
import RequestLeaveModal from "../leave_management/models/RequestLeaveModal";
import LeaveDashboard from "../leave_management/charts/LeaveDashboard";
import LeaveHistory from "../leave_management/models/LeaveHistory";
import CustomActiveShapePieChart from "../leave_management/charts/CustomActiveShapePieChart";
import PendingLeaveRequests from "../leave_management/models/PendingLeaveRequests";
import CompOffPage from "../leave_management/models/CompOffPage";
import AdminPanel from "./AdminPanel"; // Adjust path if needed
import ActionButtons from "../leave_management/models/ActionButtons";
import CompOffRequestModal from "../leave_management/models/CompOffRequestModal";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext"; // Adjust path if needed

const EmployeePanel = ({ employeeId }) => {
  const [isRequestLeaveModalOpen, setIsRequestLeaveModalOpen] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false); // toggle admin/employee view
  const [isCompOffModalOpen, setIsCompOffModalOpen] = useState(false);
  const compOffPageRef = React.useRef();
  const toggleView = () => setIsAdminView((prev) => !prev);

  const useNavigate = Navigate;
  console.log("useAuth", useAuth());
  // const a = useAuth();
  const employee = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;


  // const role = "manager"; // This should be dynamically set based on user role

  const handleCompOffSubmit = (modalData) => {
    // Call submit method on CompOffPage
    if (compOffPageRef.current) {
      compOffPageRef.current.handleCompOffSubmit(modalData);
    }
    setIsCompOffModalOpen(false);
  };

  return (
    <>
      {employee.role.includes("Manager") && (
        <div className="mb-6 flex justify-end">
          <div className="inline-flex bg-gray-200 rounded-lg p-1 shadow-inner">
            <button
              onClick={() => setIsAdminView(false)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                !isAdminView
                  ? "bg-indigo-600 text-white shadow"
                  : "text-gray-700 hover:bg-white"
              }`}
            >
              Employee View
            </button>
            <button
              onClick={() => setIsAdminView(true)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                isAdminView
                  ? "bg-indigo-600 text-white shadow"
                  : "text-gray-700 hover:bg-white"
              }`}
            >
              Admin View
            </button>
          </div>
        </div>
      )}

      {/* Both panels mounted; only visibility is toggled */}
      <div className={`${isAdminView ? "hidden" : ""}`}>
        <div className="m-6 flex flex-col sm:flex-row sm:justify-end gap-2">
          <ActionButtons
            onRequestLeave={() => setIsRequestLeaveModalOpen(true)}
            onRequestCompOff={() => setIsCompOffModalOpen(true)}
          />
        </div>
        {/* Employee View content */}
        <div className="bg-white rounded-lg shadow-sm border-l-4 border-indigo-500 p-6">
          <PendingLeaveRequests employeeId={employeeId} />
          
          <CompOffPage
            ref={compOffPageRef}
            employeeId={employeeId}
          />
          {isCompOffModalOpen && (
            <CompOffRequestModal
              onSubmit={handleCompOffSubmit}
              onClose={() => setIsCompOffModalOpen(false)}
            />
          )}
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">My Leave Stats</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <WeeklyPattern employeeId={employeeId} />
            <CustomActiveShapePieChart employeeId={employeeId} />
            <MonthlyStats employeeId={employeeId} />
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Leave Balances</h2>
          <LeaveDashboard employeeId={employeeId} />
        </div>

        <div className="mt-6">
          <LeaveHistory employeeId={employeeId} />
        </div>

        <RequestLeaveModal
          isOpen={isRequestLeaveModalOpen}
          onClose={() => setIsRequestLeaveModalOpen(false)}
          employeeId={employeeId}
        />
      </div>

      <div className={`${isAdminView ? "" : "hidden"}`}>
        <AdminPanel employeeId={employeeId} />
      </div>
    </>
  );
};

export default EmployeePanel;
