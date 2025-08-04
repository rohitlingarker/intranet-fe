import React, { useState } from "react";
import WeeklyPattern from "../../components/leave-management/charts/WeeklyPattern";
import MonthlyStats from "../../components/leave-management/charts/MonthlyStats";
import RequestLeaveModal from "../../components/leave-management/models/RequestLeaveModal";
import LeaveDashboard from "../../components/leave-management/charts/LeaveDashboard";
import LeaveHistory from "../../components/leave-management/models/LeaveHistory";
import CustomActiveShapePieChart from "../../components/leave-management/charts/CustomActiveShapePieChart";
import PendingLeaveRequests from "../../components/leave-management/models/PendingLeaveRequests";
import CompOffPage from "../../components/leave-management/models/CompOffPage";
import AdminPanel from "./AdminPanel"; // Adjust path if needed

const EmployeePanel = ({ employeeId, role }) => {
  const [isRequestLeaveModalOpen, setIsRequestLeaveModalOpen] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false); // toggle admin/employee view

  const toggleView = () => setIsAdminView((prev) => !prev);

  return (
    <>
      {role === "manager" && (
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
        {/* Employee View content */}
        <div className="bg-white rounded-lg shadow-sm border-l-4 border-indigo-500 p-6">
          <PendingLeaveRequests
            setIsRequestLeaveModalOpen={setIsRequestLeaveModalOpen}
          />
          <CompOffPage employeeId={employeeId} />
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
          <h2 className="text-xl font-semibold mb-4">Leave History</h2>
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
