import React, { useState } from "react";
import { ChevronDown, ChevronRight, Check, X, Eye } from "lucide-react";
import StatusBadge from "../../../components/status/StatusBadge";
import ExpandedRow from "./Expandedrow";

const ManagerApprovalTable = ({
  loading,
  data,
  onApprove,
  onReject
}) => {
  const [expandedRow, setExpandedRow] = useState(null);

  const headers = [
    "",
    "User ID",
    "User Name",
    "Timesheet ID",
    "Date",
    "Hours Worked",
    "Status",
    "Actions",
  ];

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <div
      style={{
        background: "#fff",
        padding: "24px",
        margin: "32px 0",
        borderRadius: 10,
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
      }}
    >
      {loading ? (
        <div className="text-center text-gray-500">Loading approvals...</div>
      ) : !data || data.length === 0 ? (
        <div className="text-center text-gray-500">No pending approvals.</div>
      ) : (
        <table className="w-full border-collapse rounded-lg overflow-hidden shadow-sm">
          <thead>
            <tr className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white text-sm">
              {headers.map((h, i) => (
                <th key={i} className="text-left px-4 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <React.Fragment key={row.timesheetId}>
                <tr
                  className={`hover:bg-blue-50 transition ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td
                    className="p-3 text-center cursor-pointer"
                    onClick={() => toggleRow(row.timesheetId)}
                  >
                    {expandedRow === row.timesheetId ? (
                      <ChevronDown className="w-5 h-5 text-blue-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-blue-500" />
                    )}
                  </td>
                  <td className="p-3 font-medium text-gray-700">
                    {row.userId}
                  </td>
                  <td className="p-3 text-gray-600">{row.userName}</td>
                  <td className="p-3 font-medium text-gray-700">
                    {row.timesheetId}
                  </td>
                  <td className="p-3 text-gray-600">{row.workDate}</td>
                  <td className="p-3 text-gray-600">{row.hoursWorked}</td>
                  <td className="p-3">
                    <StatusBadge label={row.approvalStatus} />
                  </td>
                  <td className="p-3 flex gap-2">
                    {row.approvalStatus === "Pending" && (
                      <>
                        <button
                          onClick={() => onApprove(row.timesheetId)}
                          className="flex items-center justify-center p-2 text-green-500 rounded-lg hover:bg-white hover:scale-110 transition-all duration-200"
                          title="Approve"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => onReject(row.timesheetId)}
                          className="flex items-center justify-center p-2 text-red-500 rounded-lg hover:bg-white hover:scale-110 transition-all duration-200"
                          title="Reject"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    
                  </td>
                </tr>
                {expandedRow === row.timesheetId && (
                  
                  <ExpandedRow
                    entries={row.entries}
                    onClose={() => setExpandedRow(null)}
                  />
                )}
              </React.Fragment>
            ))} 
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManagerApprovalTable;
