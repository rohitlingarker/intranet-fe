import React from "react";

interface Props {
  timesheetId: number;
  employeeId: number;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
}

const ApproveRejectButtons: React.FC<Props> = ({ timesheetId, onApprove, onReject }) => {
  const handleApprove = () => {
    if (onApprove) onApprove(timesheetId);
  };

  const handleReject = () => {
    if (onReject) onReject(timesheetId);
  };

  return (
    <div>
      <button className="btn btn-success" onClick={handleApprove}>
        Approve
      </button>
      <button className="btn btn-danger" onClick={handleReject} style={{ marginLeft: "0.5rem" }}>
        Reject
      </button>
    </div>
  );
};

export default ApproveRejectButtons;
