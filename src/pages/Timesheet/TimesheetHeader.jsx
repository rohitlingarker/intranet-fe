import React, { useState } from "react";
import Button from "../../components/Button/Button";
import { Link, useNavigate } from "react-router-dom";

const TimesheetHeader = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          <Link to="/timesheets/dashboard">
            {
              window.location.pathname === "/timesheets/dashboard"
                ? "Dashboard"
                : "Timesheets"
            }
          </Link>
        </h1>
        <p className="text-gray-600">
          Track and manage timesheets, projects, and productivity
        </p>
      </div>

      <div className="flex gap-4">
        {window.location.pathname === "/timesheets/dashboard" && (
            <Button variant="primary" size="medium" onClick={navigate("/timesheets")}>
              My Timesheets
            </Button>)
        }
        {window.location.pathname === "/timesheets" && (
          <Button
          variant="primary"
          size="medium"
          onClick={() => navigate("/timesheet/dashboard")}
        >
          Dashboard
        </Button>)}
        <Button
          variant="secondary"
          size="medium"
          onClick={() => navigate("/managerapproval")}
        >
          My Approvals
        </Button>
      </div>
    </div>
  );
};

export default TimesheetHeader;

