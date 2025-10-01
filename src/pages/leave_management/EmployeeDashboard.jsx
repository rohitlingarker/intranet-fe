// File: src/pages/leave_management/EmployeeDashboard.jsx

import React, { useState, useRef } from 'react';
import WeeklyPattern from './charts/WeeklyPattern';
import MonthlyStats from './charts/MonthlyStats';
import RequestLeaveModal from './models/RequestLeaveModal';
import LeaveDashboard from './charts/LeaveDashboard';
import LeaveHistory from './models/LeaveHistory';
import CustomActiveShapePieChart from './charts/CustomActiveShapePieChart';
import PendingLeaveRequests from './models/PendingLeaveRequests';
import CompOffPage from './models/CompOffPage';
import ActionButtons from './models/ActionButtons';
import CompOffRequestModal from './models/CompOffRequestModal';

// This component now holds everything from the "Employee View"
const EmployeeDashboard = ({ employeeId }) => {
  const [isRequestLeaveModalOpen, setIsRequestLeaveModalOpen] = useState(false);
  const [isCompOffModalOpen, setIsCompOffModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const compOffPageRef = useRef();

  const handleCompOffSubmit = async (modalData) => {
    setIsLoading(true);
    let success = false;
    if (compOffPageRef.current) {
      success = await compOffPageRef.current.handleCompOffSubmit(modalData);
    }
    setIsLoading(false);
    return success;
  };

  return (
    <>
      <div className="m-6 flex flex-col sm:flex-row sm:justify-end gap-2">
        <ActionButtons
          onRequestLeave={() => setIsRequestLeaveModalOpen(true)}
          onRequestCompOff={() => setIsCompOffModalOpen(true)}
        />
      </div>
      <h2 className="text-xl font-semibold m-4">Pending Leave Requests</h2>
      <div className="bg-white rounded-lg shadow p-6 mb-6 w-full">
        <PendingLeaveRequests employeeId={employeeId} />
      </div>

      <h2 className="text-xl font-semibold m-4">Pending Comp-Off Requests</h2>
      <div className="bg-white rounded-lg shadow p-6 mb-6 w-full">
        <CompOffPage ref={compOffPageRef} employeeId={employeeId} />
        {isCompOffModalOpen && (
          <CompOffRequestModal
            loading={isLoading}
            onSubmit={handleCompOffSubmit}
            onClose={() => setIsCompOffModalOpen(false)}
          />
        )}
      </div>

      <h2 className="text-xl font-semibold m-4">My Leave Stats</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <WeeklyPattern employeeId={employeeId} />
        <CustomActiveShapePieChart employeeId={employeeId} />
        <MonthlyStats employeeId={employeeId} />
      </div>

      <h2 className="text-xl font-semibold m-4">Leave Balances</h2>
      <LeaveDashboard employeeId={employeeId} />

      <h2 className="text-xl font-semibold m-4">Leave History</h2>
      <LeaveHistory employeeId={employeeId} />

      <RequestLeaveModal
        isOpen={isRequestLeaveModalOpen}
        onClose={() => setIsRequestLeaveModalOpen(false)}
        employeeId={employeeId}
      />
    </>
  );
};

export default EmployeeDashboard;