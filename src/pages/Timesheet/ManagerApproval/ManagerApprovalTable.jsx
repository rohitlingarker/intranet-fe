import React, { useState } from "react";
import { ChevronDown, ChevronRight, Check, X, Eye } from "lucide-react";

const mapStatus = (status) => {
  switch (status) {
    case "APPROVED":
      return "Approved";
    case "REJECTED":
      return "Rejected";
    case "PENDING":
      return "Pending";
    default:
      return status;
  }
};

const ManagerApprovalTable = ({
  loading,
  data,
  onApprove,
  onReject,
  fetchTimesheetDetails, // <-- function to call API for details
  projectIdToName,
  taskIdToName,
  mapWorkType,
}) => {
  const [expandedRow, setExpandedRow] = useState(null);
  const [detailsData, setDetailsData] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const headers = [
    "",
    "Timesheet ID",
    "Employee",
    "Date",
    "Hours Worked",
    "Status",
    "Actions",
  ];

  const toggleRow = async (id) => {
    if (expandedRow === id) {
      setExpandedRow(null);
      return;
    }
    setExpandedRow(id);
    setLoadingDetails(true);

    try {
      const response = await fetchTimesheetDetails(id); // API call
      setDetailsData(response.entries || []); // assuming response has entries
    } catch (error) {
      console.error("Error fetching details:", error);
      setDetailsData([]);
    } finally {
      setLoadingDetails(false);
    }
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
                  {/* Expand Icon */}
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
                    {row.timesheetId}
                  </td>
                  <td className="p-3 text-gray-600">{row.employeeName}</td>
                  <td className="p-3 text-gray-600">{row.workDate}</td>
                  <td className="p-3 text-gray-600">{row.hoursWorked}</td>
                  <td
                    className={`p-3 font-semibold ${
                      row.approvalStatus === "APPROVED"
                        ? "text-green-600"
                        : row.approvalStatus === "REJECTED"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {mapStatus(row.approvalStatus)}
                  </td>
                  <td className="p-3 flex gap-2">
                    {row.approvalStatus === "PENDING" && (
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
                    <button
                      onClick={() => {}}
                      className="flex items-center justify-center p-2 text-blue-500 rounded-lg hover:bg-white hover:scale-110 transition-all duration-200"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>

                {/* Expanded Row with Cards */}
                {expandedRow === row.timesheetId && (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-4 bg-gray-100 border-t border-gray-300"
                    >
                      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                        <h4 className="font-semibold mb-4 text-gray-800 text-md">
                          Timesheet Details
                        </h4>
                        {loadingDetails ? (
                          <div className="text-gray-500">Loading details...</div>
                        ) : detailsData.length === 0 ? (
                          <div className="text-gray-500">No details found.</div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {detailsData.map((entry, idx) => (
                              <div
                                key={idx}
                                className="p-4 border rounded-lg shadow-sm bg-gray-50"
                              >
                                <p className="text-sm mb-2">
                                  <strong>Project:</strong>{" "}
                                  {projectIdToName[entry.projectId] ||
                                    `Project-${entry.projectId}`}
                                </p>
                                <p className="text-sm mb-2">
                                  <strong>Task:</strong>{" "}
                                  {taskIdToName[entry.taskId] ||
                                    `Task-${entry.taskId}`}
                                </p>
                                <p className="text-sm mb-2">
                                  <strong>Start:</strong>{" "}
                                  {new Date(entry.fromTime).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                                <p className="text-sm mb-2">
                                  <strong>End:</strong>{" "}
                                  {new Date(entry.toTime).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                                <p className="text-sm mb-2">
                                  <strong>Work Type:</strong>{" "}
                                  {mapWorkType(entry.workType)}
                                </p>
                                <p className="text-sm">
                                  <strong>Description:</strong> {entry.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
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




