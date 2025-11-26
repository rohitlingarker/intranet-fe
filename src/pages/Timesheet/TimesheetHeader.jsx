import React from "react";
import Button from "../../components/Button/Button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import ManagerMonthlyReport from "./ManagerMonthlyReport";

const TimesheetHeader = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useAuth();
  const canApprove = user?.permissions?.includes("APPROVE_TIMESHEET");
  const canViewFinance = user?.permissions?.includes("VIEW_FINANCE_REPORT");

  return (
    <div className="flex justify-between items-center">
      {/* --- Left Section --- */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          <Link to="/timesheet/dashboard">
            {pathname === "/timesheet/dashboard"
              ? "Dashboard"
              : pathname === "/managerapproval"
              ? "Manager Approvals"
              : "Timesheets"}
          </Link>
        </h1>
        <p className="text-gray-600">
          Track and manage timesheets, projects, and productivity
        </p>
      </div>

      {/* --- Right Section: Buttons --- */}
      <div className="flex gap-4">
        {pathname === "/timesheets" && (
          <Button
            variant="secondary"
            size="medium"
            onClick={() => navigate("/timesheets/monthlytsreport")}
          >
            Reports
          </Button>
        )}

        {pathname === "/timesheet/dashboard" && (
          <Button
            variant="primary"
            size="medium"
            onClick={() => navigate("/timesheets")}
          >
            My Timesheets
          </Button>
        )}

        {pathname === "/timesheets" && (
          <Button
            variant="primary"
            size="medium"
            onClick={() => navigate("/timesheet/dashboard")}
          >
            Dashboard
          </Button>
        )}

        {pathname === "/managerapproval" && (
          <>
            {canViewFinance ? (
              <Button
                variant="secondary"
                size="medium"
                onClick={() => navigate("/timesheets/managerreport")}
              >
                Manager Reports
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="medium"
                onClick={() => navigate("/timesheets/managermonthlyreport")}
              >
                Manager Reports
              </Button>
            )}
            <Button
              variant="primary"
              size="medium"
              onClick={() => navigate("/timesheets")}
            >
              My Timesheets
            </Button>
            <Button
              variant="secondary"
              size="medium"
              onClick={() => navigate("/timesheet/dashboard")}
            >
              Dashboard
            </Button>
          </>
        )}

        {canApprove && pathname === "/timesheets" && (
          <Button
            variant="secondary"
            size="medium"
            onClick={() => navigate("/managerapproval")}
          >
            My Approvals
          </Button>
        )}
        {/* {pathname !== "/managerapproval" && (
          <Button
            variant="secondary"
            size="medium"
            onClick={() => navigate("/managerapproval")}
          >
            My Approvals
          </Button>
        )} */}
      </div>
    </div>
  );
};

export default TimesheetHeader;
