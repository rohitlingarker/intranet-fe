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
  const [detailsData, setDetailsData] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [rejectingRow, setRejectingRow] = useState(null); // timesheetId being rejected
  const [commentInputs, setCommentInputs] = useState({});

  const handleCommentChange = (id, value) => {
    setCommentInputs((prev) => ({ ...prev, [id]: value }));
  };

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
                          onClick={() => setRejectingRow(row.timesheetId)}
                          className="flex items-center justify-center p-2 text-red-500 rounded-lg hover:bg-white hover:scale-110 transition-all duration-200"
                          title="Reject"
                        >
                          <X className="w-5 h-5" />
                        </button>
                        {rejectingRow === row.timesheetId && (
                          <tr>
                            <td colSpan={7} className="bg-red-50 px-4 py-3">
                              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
                                <input
                                  type="text"
                                  placeholder="Enter rejection comment"
                                  value={commentInputs[row.timesheetId] || ""}
                                  onChange={(e) =>
                                    handleCommentChange(
                                      row.timesheetId,
                                      e.target.value
                                    )
                                  }
                                  className="w-full md:w-2/3 px-3 py-2 border border-gray-300 rounded text-sm"
                                />
                                <div className="flex gap-2 mt-2 md:mt-0">
                                  <button
                                    onClick={() => {
                                      onReject(
                                        row.timesheetId,
                                        commentInputs[row.timesheetId] || ""
                                      );
                                      setRejectingRow(null);
                                      setCommentInputs((prev) => {
                                        const updated = { ...prev };
                                        delete updated[row.timesheetId];
                                        return updated;
                                      });
                                    }}
                                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
                                  >
                                    Confirm Reject
                                  </button>
                                  <button
                                    onClick={() => {
                                      setRejectingRow(null);
                                      setCommentInputs((prev) => {
                                        const updated = { ...prev };
                                        delete updated[row.timesheetId];
                                        return updated;
                                      });
                                    }}
                                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 text-sm"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
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
