import React from "react";

interface ApproveRejectButtonsProps {
  employeeId: number;
  timesheetId: number;
  currentStatus: "PENDING" | "APPROVED" | "REJECTED";
  onApprove: () => void;
  onReject: () => void;
}

const ApproveRejectButtons: React.FC<ApproveRejectButtonsProps> = ({
  currentStatus,
  onApprove,
  onReject,
}) => {
  const isDisabled = currentStatus !== "PENDING";

  return (
    <div className="action-buttons">
      {currentStatus === "PENDING" ? (
        <>
          <button
            className="btn btn-success btn-sm"
            onClick={onApprove}
            disabled={isDisabled}
          >
            Approve
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={onReject}
            disabled={isDisabled}
            style={{ marginLeft: "0.5rem" }}
          >
            Reject
          </button>
        </>
      ) : (
        <span
          className={`badge ${
            currentStatus === "APPROVED" ? "bg-success" : "bg-danger"
          }`}
          style={{ marginLeft: "1rem" }}
        >
          {currentStatus}
        </span>
      )}
    </div>
  );
};

export default ApproveRejectButtons;
