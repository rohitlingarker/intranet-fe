import React, { useState } from "react";

interface Props {
  timesheetId: number;
  employeeId: number;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
}

const ApproveRejectButtons: React.FC<Props> = ({
  timesheetId,
  employeeId,
  onApprove,
  onReject,
}) => {
  const [actionTaken, setActionTaken] = useState<"approved" | "rejected" | null>(null);

  const handleApprove = () => {
    if (onApprove) {
      onApprove(timesheetId);
      setActionTaken("approved");
    }
  };

  const handleReject = () => {
    if (onReject) {
      onReject(timesheetId);
      setActionTaken("rejected");
    }
  };

  const handleReview = () => {
    alert(`Reviewing Timesheet ID: ${timesheetId}`);
  };

  return (
    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
      {!actionTaken ? (
        <>
          <button
            className="btn btn-success"
            style={{
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              padding: "6px 12px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            onClick={handleApprove}
          >
            Approve
          </button>
          <button
            className="btn btn-danger"
            style={{
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              padding: "6px 12px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            onClick={handleReject}
          >
            Reject
          </button>
        </>
      ) : (
        <button
          className="btn btn-secondary"
          style={{
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            padding: "6px 12px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
          onClick={handleReview}
        >
          Review
        </button>
      )}
    </div>
  );
};

export default ApproveRejectButtons;
