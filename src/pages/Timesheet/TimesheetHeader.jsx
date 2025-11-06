import React from "react";
import Button from "../../components/Button/Button";
import { Link, useNavigate, useLocation } from "react-router-dom";

const TimesheetHeader = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

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

        {pathname !== "/managerapproval" && (
          <Button
            variant="secondary"
            size="medium"
            onClick={() => navigate("/managerapproval")}
          >
            My Approvals
          </Button>
        )}
      </div>
    </div>
  );
};

export default TimesheetHeader;
