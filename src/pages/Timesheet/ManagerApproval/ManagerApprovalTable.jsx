
  // // import React, { useState } from "react";
  // // import { ChevronDown, ChevronRight, Check, X, Info } from "lucide-react";
  // // import StatusBadge from "../../../components/status/StatusBadge";
  // // import Pagination from "../../../components/Pagination/pagination";
  // // import ExpandedRowInline from "./ExpandedRowInline";

  // // const ManagerApprovalTable = ({ loading, data, onApprove, onReject }) => {
  // //   const [expandedRow, setExpandedRow] = useState(null);
  // //   const [rejectingRow, setRejectingRow] = useState(null);
  // //   const [commentInputs, setCommentInputs] = useState({});
  // //   const [currentPage, setCurrentPage] = useState(1);
  // //   const [actionMessages, setActionMessages] = useState({}); // { timesheetId: "Already approved" }

  // //   const rowsPerPage = 5;

  // //   const handleCommentChange = (id, value) => {
  // //     setCommentInputs((prev) => ({ ...prev, [id]: value }));
  // //   };

  // //   const toggleRow = (id) => {
  // //     setExpandedRow(expandedRow === id ? null : id);
  // //   };

  // //   const totalPages = Math.ceil(data.length / rowsPerPage);
  // //   const paginatedData = data.slice(
  // //     (currentPage - 1) * rowsPerPage,
  // //     currentPage * rowsPerPage
  // //   );

  // //   const handleApprove = (id, status) => {
  // //     if (status !== "Pending") {
  // //       setActionMessages((prev) => ({ ...prev, [id]: "Already approved" }));
  // //       return;
  // //     }
  // //     onApprove(id);
  // //     setActionMessages((prev) => ({ ...prev, [id]: "Approved successfully" }));
  // //   };

  // //   const handleReject = (id, comment, status) => {
  // //     if (status !== "Pending") {
  // //       setActionMessages((prev) => ({ ...prev, [id]: "Already rejected" }));
  // //       return;
  // //     }
  // //     onReject(id, comment);
  // //     setRejectingRow(null);
  // //     setCommentInputs((prev) => {
  // //       const updated = { ...prev };
  // //       delete updated[id];
  // //       return updated;
  // //     });
  // //     setActionMessages((prev) => ({ ...prev, [id]: "Rejected successfully" }));
  // //   };

  // //   return (
  // //     <div
  // //       style={{
  // //         background: "#fff",
  // //         padding: "24px",
  // //         margin: "32px 0",
  // //         borderRadius: 10,
  // //         boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  // //       }}
  // //     >
  // //       {loading ? (
  // //         <div className="text-center text-gray-500">Loading approvals...</div>
  // //       ) : !data || data.length === 0 ? (
  // //         <div className="text-center text-gray-500">No pending approvals.</div>
  // //       ) : (
  // //         <>
  // //           <table className="w-full border-collapse rounded-lg overflow-hidden shadow-sm">
  // //             <thead>
  // //               <tr className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white text-sm">
  // //                 {[
  // //                   "",
  // //                   "User ID",
  // //                   "User Name",
  // //                   "Timesheet ID",
  // //                   "Date",
  // //                   "Hours Worked",
  // //                   "Status",
  // //                   "Actions",
  // //                 ].map((h, i) => (
  // //                   <th key={i} className="text-left px-4 py-3">
  // //                     {h}
  // //                   </th>
  // //                 ))}
  // //               </tr>
  // //             </thead>
  // //             <tbody>
  // //               {paginatedData.map((row, index) => (
  // //                 <React.Fragment key={row.timesheetId}>
  // //                   <tr
  // //                     className={`hover:bg-blue-50 transition ${
  // //                       index % 2 === 0 ? "bg-white" : "bg-gray-50"
  // //                     }`}
  // //                   >
  // //                     <td
  // //                       className="p-3 text-center cursor-pointer"
  // //                       onClick={() => toggleRow(row.timesheetId)}
  // //                     >
  // //                       {expandedRow === row.timesheetId ? (
  // //                         <ChevronDown className="w-5 h-5 text-blue-500" />
  // //                       ) : (
  // //                         <ChevronRight className="w-5 h-5 text-blue-500" />
  // //                       )}
  // //                     </td>
  // //                     <td className="p-3 font-medium text-gray-700">
  // //                       {row.userId}
  // //                     </td>
  // //                     <td className="p-3 text-gray-600">{row.userName}</td>
  // //                     <td className="p-3 font-medium text-gray-700">
  // //                       {row.timesheetId}
  // //                     </td>
  // //                     <td className="p-3 text-gray-600">{row.workDate}</td>
  // //                     <td className="p-3 text-gray-600">{row.hoursWorked}</td>
  // //                     <td className="p-3">
  // //                       <StatusBadge label={row.approvalStatus} />
  // //                     </td>
  // //                     <td className="p-3 flex flex-col items-start gap-2">
  // //                       <div className="flex gap-2">
  // //                         <button
  // //                           onClick={() =>
  // //                             handleApprove(row.timesheetId, row.approvalStatus)
  // //                           }
  // //                           className="flex items-center justify-center p-2 text-green-500 rounded-lg hover:bg-white hover:scale-110 transition-all duration-200"
  // //                           title={
  // //                             row.approvalStatus === "Pending"
  // //                               ? "Approve"
  // //                               : "Already approved"
  // //                           }
  // //                         >
  // //                           <Check className="w-5 h-5" />
  // //                         </button>
  // //                         <button
  // //                           onClick={() => {
  // //                             if (row.approvalStatus !== "Pending") {
  // //                               setActionMessages((prev) => ({
  // //                                 ...prev,
  // //                                 [row.timesheetId]: "Already rejected",
  // //                               }));
  // //                             } else {
  // //                               setRejectingRow(row.timesheetId);
  // //                             }
  // //                           }}
  // //                           className="flex items-center justify-center p-2 text-red-500 rounded-lg hover:bg-white hover:scale-110 transition-all duration-200"
  // //                           title={
  // //                             row.approvalStatus === "Pending"
  // //                               ? "Reject"
  // //                               : "Already rejected"
  // //                           }
  // //                         >
  // //                           <X className="w-5 h-5" />
  // //                         </button>
  // //                       </div>
  // //                       {actionMessages[row.timesheetId] && (
  // //                         <div className="text-xs text-gray-500 flex items-center gap-1">
  // //                           <Info className="w-3 h-3" />
  // //                           {actionMessages[row.timesheetId]}
  // //                         </div>
  // //                       )}
  // //                     </td>
  // //                   </tr>

  // //                   {rejectingRow === row.timesheetId && (
  // //                     <tr>
  // //                       <td colSpan={8} className="bg-red-50 px-4 py-3">
  // //                         <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
  // //                           <input
  // //                             type="text"
  // //                             placeholder="Enter rejection comment"
  // //                             value={commentInputs[row.timesheetId] || ""}
  // //                             onChange={(e) =>
  // //                               handleCommentChange(
  // //                                 row.timesheetId,
  // //                                 e.target.value
  // //                               )
  // //                             }
  // //                             className="w-full md:w-2/3 px-3 py-2 border border-gray-300 rounded text-sm"
  // //                           />
  // //                           <div className="flex gap-2 mt-2 md:mt-0">
  // //                             <button
  // //                               onClick={() =>
  // //                                 handleReject(
  // //                                   row.timesheetId,
  // //                                   commentInputs[row.timesheetId] || "",
  // //                                   row.approvalStatus
  // //                                 )
  // //                               }
  // //                               className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
  // //                             >
  // //                               Confirm Reject
  // //                             </button>
  // //                             <button
  // //                               onClick={() => {
  // //                                 setRejectingRow(null);
  // //                                 setCommentInputs((prev) => {
  // //                                   const updated = { ...prev };
  // //                                   delete updated[row.timesheetId];
  // //                                   return updated;
  // //                                 });
  // //                               }}
  // //                               className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 text-sm"
  // //                             >
  // //                               Cancel
  // //                             </button>
  // //                           </div>
  // //                         </div>
  // //                       </td>
  // //                     </tr>
  // //                   )}

  // //                   {expandedRow === row.timesheetId && (
  // //                     <ExpandedRowInline entries={row.entries} />
  // //                   )}
  // //                 </React.Fragment>
  // //               ))}
  // //             </tbody>
  // //           </table>

  // //           <Pagination
  // //             currentPage={currentPage}
  // //             totalPages={totalPages}
  // //             onPrevious={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
  // //             onNext={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
  // //           />
  // //         </>
  // //       )}
  // //     </div>
  // //    );
  // //  };

  // //  export default ManagerApprovalTable;



  // import React, { useState, useMemo } from "react";
  // import { ChevronDown, ChevronRight, Check, X, Info, Download } from "lucide-react";
  // import StatusBadge from "../../../components/status/StatusBadge";
  // import Pagination from "../../../components/Pagination/pagination";
  // import ExpandedRowInline from "./ExpandedRowInline";
  // import { saveAs } from "file-saver";
  // import Papa from "papaparse";
  // import jsPDF from "jspdf";
  // import "jspdf-autotable";
  // import { showStatusToast } from "../../../components/toastfy/toast";

  // const ManagerApprovalTable = ({ loading, data, onApprove, onReject }) => {
  //   const [expandedRow, setExpandedRow] = useState(null);
  //   const [rejectingRow, setRejectingRow] = useState(null);
  //   const [commentInputs, setCommentInputs] = useState({});
  //   const [currentPage, setCurrentPage] = useState(1);
  //   const [userFilter, setUserFilter] = useState("");

  //   const rowsPerPage = 5;

  //   const handleCommentChange = (id, value) => {
  //     setCommentInputs((prev) => ({ ...prev, [id]: value }));
  //   };

  //   const toggleRow = (id) => {
  //     setExpandedRow(expandedRow === id ? null : id);
  //   };

  //   const handleApprove = (id, status) => {
  //     if (status !== "Pending") {
  //       showStatusToast(`Already ${status}`, "error");
  //       return;
  //     }
  //     onApprove(id);
  //     showStatusToast("Approved successfully", "success");
  //   };

  //   const handleReject = (id, comment, status) => {
  //     if (status !== "Pending") {
  //       showStatusToast(`Already ${status}`, "error");
  //       return;
  //     }
  //     onReject(id, comment);
  //     setRejectingRow(null);
  //     setCommentInputs((prev) => {
  //       const updated = { ...prev };
  //       delete updated[id];
  //       return updated;
  //     });
  //     showStatusToast("Rejected successfully", "success");
  //   };

  //   const filteredData = useMemo(() => {
  //     return userFilter
  //       ? data.filter((row) => row.userName === userFilter)
  //       : data;
  //   }, [data, userFilter]);

  //   const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  //   const paginatedData = filteredData.slice(
  //     (currentPage - 1) * rowsPerPage,
  //     currentPage * rowsPerPage
  //   );

  //   const uniqueUserNames = [...new Set(data.map((row) => row.userName))];

  //   const downloadCSV = () => {
  //     const csvData = Papa.unparse(filteredData);
  //     const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
  //     saveAs(blob, "timesheet_approvals.csv");
  //   };

  //   const downloadPDF = () => {
  //     const doc = new jsPDF();
  //     doc.text("Timesheet Approvals", 14, 14);
  //     const tableColumn = [
  //       "User ID",
  //       "User Name",
  //       "Timesheet ID",
  //       "Date",
  //       "Hours Worked",
  //       "Status",
  //     ];
  //     const tableRows = filteredData.map((row) => [
  //       row.userId,
  //       row.userName,
  //       row.timesheetId,
  //       row.workDate,
  //       row.hoursWorked,
  //       row.approvalStatus,
  //     ]);
  //     doc.autoTable({
  //       head: [tableColumn],
  //       body: tableRows,
  //       startY: 20,
  //     });
  //     doc.save("timesheet_approvals.pdf");
  //   };

  //   return (
  //     <div
  //       style={{
  //         background: "#fff",
  //         padding: "24px",
  //         margin: "32px 0",
  //         borderRadius: 10,
  //         boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  //       }}
  //     >
  //       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
  //         <div className="flex gap-2 items-center">
  //           <label className="text-sm font-medium">Filter by User:</label>
  //           <select
  //             value={userFilter}
  //             onChange={(e) => {
  //               setUserFilter(e.target.value);
  //               setCurrentPage(1); // reset pagination
  //             }}
  //             className="border border-gray-300 rounded px-2 py-1 text-sm"
  //           >
  //             <option value="">All</option>
  //             {uniqueUserNames.map((name, i) => (
  //               <option key={i} value={name}>
  //                 {name}
  //               </option>
  //             ))}
  //           </select>
  //         </div>

  //         <div className="flex gap-3">
  //           <button
  //             onClick={downloadCSV}
  //             className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
  //           >
  //             <Download className="w-4 h-4" />
  //             CSV
  //           </button>
  //           <button
  //             onClick={downloadPDF}
  //             className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
  //           >
  //             <Download className="w-4 h-4" />
  //             PDF
  //           </button>
  //         </div>
  //       </div>

  //       {loading ? (
  //         <div className="text-center text-gray-500">Loading approvals...</div>
  //       ) : !filteredData || filteredData.length === 0 ? (
  //         <div className="text-center text-gray-500">No pending approvals.</div>
  //       ) : (
  //         <>
  //           <table className="w-full border-collapse rounded-lg overflow-hidden shadow-sm">
  //             <thead>
  //               <tr className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white text-sm">
  //                 {[
  //                   "",
  //                   "User ID",
  //                   "User Name",
  //                   "Timesheet ID",
  //                   "Date",
  //                   "Hours Worked",
  //                   "Status",
  //                   "Actions",
  //                 ].map((h, i) => (
  //                   <th key={i} className="text-left px-4 py-3">
  //                     {h}
  //                   </th>
  //                 ))}
  //               </tr>
  //             </thead>
  //             <tbody>
  //               {paginatedData.map((row, index) => (
  //                 <React.Fragment key={row.timesheetId}>
  //                   <tr
  //                     className={`hover:bg-blue-50 transition ${
  //                       index % 2 === 0 ? "bg-white" : "bg-gray-50"
  //                     }`}
  //                   >
  //                     <td
  //                       className="p-3 text-center cursor-pointer"
  //                       onClick={() => toggleRow(row.timesheetId)}
  //                     >
  //                       {expandedRow === row.timesheetId ? (
  //                         <ChevronDown className="w-5 h-5 text-blue-500" />
  //                       ) : (
  //                         <ChevronRight className="w-5 h-5 text-blue-500" />
  //                       )}
  //                     </td>
  //                     <td className="p-3 font-medium text-gray-700">
  //                       {row.userId}
  //                     </td>
  //                     <td className="p-3 text-gray-600">{row.userName}</td>
  //                     <td className="p-3 font-medium text-gray-700">
  //                       {row.timesheetId}
  //                     </td>
  //                     <td className="p-3 text-gray-600">{row.workDate}</td>
  //                     <td className="p-3 text-gray-600">{row.hoursWorked}</td>
  //                     <td className="p-3">
  //                       <StatusBadge label={row.approvalStatus} />
  //                     </td>
  //                     <td className="p-3 flex flex-col items-start gap-2">
  //                       <div className="flex gap-2">
  //                         <button
  //                           onClick={() =>
  //                             handleApprove(row.timesheetId, row.approvalStatus)
  //                           }
  //                           className="flex items-center justify-center p-2 text-green-500 rounded-lg hover:bg-white hover:scale-110 transition-all duration-200"
  //                           title={
  //                             row.approvalStatus === "Pending"
  //                               ? "Approve"
  //                               : "Already approved"
  //                           }
  //                         >
  //                           <Check className="w-5 h-5" />
  //                         </button>
  //                         <button
  //                           onClick={() => {
  //                               if (row.approvalStatus !== "Pending") {
  //                                 showStatusToast(`Already ${row.approvalStatus}`, "error");
  //                                 return;
  //                               }
  //                               setRejectingRow(row.timesheetId);

                              
  //                           }}
  //                           className="flex items-center justify-center p-2 text-red-500 rounded-lg hover:bg-white hover:scale-110 transition-all duration-200"
  //                           title={
  //                             row.approvalStatus === "Pending"
  //                               ? "Reject"
  //                               : "Already rejected"
  //                           }
  //                         >
  //                           <X className="w-5 h-5" />
  //                         </button>
  //                       </div>
  //                       {/* {actionMessages[row.timesheetId] && (
  //                         <div className="text-xs text-gray-500 flex items-center gap-1">
  //                           <Info className="w-3 h-3" />
  //                           {actionMessages[row.timesheetId]}
  //                         </div>
  //                       )} */}
  //                     </td>
  //                   </tr>

  //                   {rejectingRow === row.timesheetId && (
  //                     <tr>
  //                       <td colSpan={8} className="bg-red-50 px-4 py-3">
  //                         <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
  //                           <input
  //                             type="text"
  //                             placeholder="Enter rejection comment"
  //                             value={commentInputs[row.timesheetId] || ""}
  //                             onChange={(e) =>
  //                               handleCommentChange(
  //                                 row.timesheetId,
  //                                 e.target.value
  //                               )
  //                             }
  //                             className="w-full md:w-2/3 px-3 py-2 border border-gray-300 rounded text-sm"
  //                           />
  //                           <div className="flex gap-2 mt-2 md:mt-0">
  //                             <button
  //                               onClick={() =>
  //                                 handleReject(
  //                                   row.timesheetId,
  //                                   commentInputs[row.timesheetId] || "",
  //                                   row.approvalStatus
  //                                 )
  //                               }
  //                               className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
  //                             >
  //                               Confirm Reject
  //                             </button>
  //                             <button
  //                               onClick={() => {
  //                                 setRejectingRow(null);
  //                                 setCommentInputs((prev) => {
  //                                   const updated = { ...prev };
  //                                   delete updated[row.timesheetId];
  //                                   return updated;
  //                                 });
  //                               }}
  //                               className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 text-sm"
  //                             >
  //                               Cancel
  //                             </button>
  //                           </div>
  //                         </div>
  //                       </td>
  //                     </tr>
  //                   )}

  //                   {expandedRow === row.timesheetId && (
  //                     <ExpandedRowInline entries={row.entries} />
  //                   )}
  //                 </React.Fragment>
  //               ))}
  //             </tbody>
  //           </table>

  //           <Pagination
  //             currentPage={currentPage}
  //             totalPages={totalPages}
  //             onPrevious={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
  //             onNext={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
  //           />
  //         </>
  //       )}
  //     </div>
  //   );
  // };

  // export default ManagerApprovalTable;


// import React, { useEffect, useState } from "react";
// import { fetchProjectTaskInfo } from "../api"; // adjust path if needed
// // import { showStatusToast } from "../../components/toastfy/toast";

// const ManagerApprovalTable = ({ managerId }) => {
//   const [timesheets, setTimesheets] = useState([]);
//   const [projectTaskMap, setProjectTaskMap] = useState({});

//   useEffect(() => {
//     fetchTimesheets();
//   }, []);

//   const fetchTimesheets = async () => {
//     try {
//       const res = await fetch(
//         `http://localhost:8080/api/timesheets/manager/3`,
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );
//       if (!res.ok) throw new Error("Failed to fetch timesheets");
//       const data = await res.json();
//       setTimesheets(data);

//       if (data.length > 0) {
//         const userId = data[0].userId; // assuming all timesheets are for the same user
//         const projectInfo = await fetchProjectTaskInfo();

//         // Build lookup maps
//         const projectMap = {};
//         const taskMap = {};

//         projectInfo.forEach((project) => {
//           projectMap[project.projectId] = project.projectName;
//           project.tasks?.forEach((task) => {
//             taskMap[task.taskId] = task.taskName;
//           });
//         });

//         setProjectTaskMap({ projectMap, taskMap });
//       }
//     } catch (err) {
//       console.error(err);
//       showStatusToast("Failed to load timesheets", "error");
//     }
//   };

//   return (
//     <div className="space-y-6">
//       {timesheets.map((sheet) => {
//         const totalHours = sheet.entries.reduce(
//           (sum, e) => sum + (e.hoursWorked || 0),
//           0
//         );
//         const date = new Date(sheet.workDate).toDateString();

//         return (
//           <div
//             key={sheet.timesheetId}
//             className="rounded-lg border bg-white shadow-md overflow-hidden"
//           >
//             <div className="flex items-center justify-between px-4 py-2 bg-gray-100">
//               <div className="font-semibold text-gray-800">
//                 {new Date(date).toLocaleDateString("en-US", {
//                   weekday: "short",
//                   month: "short",
//                   day: "numeric",
//                 })}
//               </div>
//               <div className="flex items-center gap-3">
//                 <span className="text-gray-600">
//                   {totalHours.toFixed(2)} hrs
//                 </span>
//                 <span
//                   className={`px-3 py-1 text-sm font-medium rounded-full ${
//                     sheet.status === "Approved"
//                       ? "bg-green-100 text-green-800"
//                       : sheet.status === "Rejected"
//                       ? "bg-red-100 text-red-800"
//                       : "bg-yellow-100 text-yellow-800"
//                   }`}
//                 >
//                   {sheet.status}
//                 </span>
//               </div>
//             </div>

//             <table className="min-w-full text-sm">
//               <thead className="bg-blue-600 text-white">
//                 <tr>
//                   <th className="px-4 py-2 text-left">Project</th>
//                   <th className="px-4 py-2 text-left">Task</th>
//                   <th className="px-4 py-2 text-left">Start</th>
//                   <th className="px-4 py-2 text-left">End</th>
//                   <th className="px-4 py-2 text-left">Work Type</th>
//                   <th className="px-4 py-2 text-left">Description</th>
//                   <th className="px-4 py-2 text-left">Hours</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {sheet.entries.map((entry) => (
//                   <tr key={entry.timesheetEntryId} className="border-t">
//                     <td className="px-4 py-2">
//                       {projectTaskMap.projectMap?.[entry.projectId] ||
//                         entry.projectId}
//                     </td>
//                     <td className="px-4 py-2">
//                       {projectTaskMap.taskMap?.[entry.taskId] || entry.taskId}
//                     </td>
//                     <td className="px-4 py-2">
//                       {new Date(entry.fromTime).toLocaleTimeString()}
//                     </td>
//                     <td className="px-4 py-2">
//                       {new Date(entry.toTime).toLocaleTimeString()}
//                     </td>
//                     <td className="px-4 py-2">{entry.workType}</td>
//                     <td className="px-4 py-2">{entry.description}</td>
//                     <td className="px-4 py-2">
//                       {(entry.hoursWorked ?? 0).toFixed(2)}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// export default ManagerApprovalTable;

import React, { useEffect, useState } from "react";
import { fetchProjectTaskInfo } from "../api";
import Pagination from "../../../components/Pagination/pagination";

const ManagerApprovalTable = ({ managerId }) => {
  const [timesheets, setTimesheets] = useState([]);
  const [projectMap, setProjectMap] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    fetchTimesheets();
    loadProjectNames();
  }, []);

  const fetchTimesheets = async () => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/timesheets/manager/3`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch timesheets");
      const data = await res.json();
      setTimesheets(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadProjectNames = async () => {
    try {
      const data = await fetchProjectTaskInfo();
      const map = {};
      data.forEach((project) => {
        map[project.projectId] = project.projectName;
      });
      setProjectMap(map);
    } catch (err) {
      console.error("Failed to load project names");
    }
  };

  const sortedTimesheets = [...timesheets].sort(
    (a, b) => new Date(b.workDate) - new Date(a.workDate)
  );

  const totalPages = Math.ceil(sortedTimesheets.length / pageSize);
  const paginatedTimesheets = sortedTimesheets.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handleStatusChange = async (timesheetId, status) => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/timesheets/review/3`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            timesheetId,
            comment: status, // using status as comment
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to update timesheet status");
      fetchTimesheets(); // Refresh
    } catch (err) {
      console.error(`Error updating timesheet status: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {paginatedTimesheets.map((sheet) => {
        const totalHours = sheet.entries.reduce(
          (sum, e) => sum + (e.hoursWorked || 0),
          0
        );
        const formattedDate = new Date(sheet.workDate).toLocaleDateString(
          "en-US",
          {
            weekday: "short",
            month: "short",
            day: "numeric",
          }
        );

        return (
          <div
            key={sheet.timesheetId}
            className="rounded-lg border bg-white shadow-md overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-2 bg-gray-100">
              <div className="font-semibold text-gray-800">{formattedDate}</div>

              <div className="flex items-center gap-4">
                <span className="text-gray-600 font-medium text-sm">
                  {totalHours.toFixed(2)} hrs
                </span>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${
                    sheet.status === "Approved"
                      ? "bg-green-100 text-green-800"
                      : sheet.status === "Rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {sheet.status}
                </span>

                {sheet.status === "Pending" && (
                  <div className="flex items-center gap-2 ml-2">
                    <button
                      onClick={() =>
                        handleStatusChange(sheet.timesheetId, "Approved")
                      }
                      className="text-green-600 hover:text-green-800 text-lg font-bold"
                      title="Approve"
                    >
                      ✔
                    </button>
                    <button
                      onClick={() =>
                        handleStatusChange(sheet.timesheetId, "Rejected")
                      }
                      className="text-red-600 hover:text-red-800 text-lg font-bold"
                      title="Reject"
                    >
                      ✖
                    </button>
                  </div>
                )}
              </div>
            </div>

            <table className="min-w-full text-sm">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-4 py-2 text-left">Project</th>
                  <th className="px-4 py-2 text-left">Task</th>
                  <th className="px-4 py-2 text-left">Start</th>
                  <th className="px-4 py-2 text-left">End</th>
                  <th className="px-4 py-2 text-left">Work Type</th>
                  <th className="px-4 py-2 text-left">Description</th>
                  <th className="px-4 py-2 text-left">Hours</th>
                </tr>
              </thead>
              <tbody>
                {sheet.entries.map((entry) => (
                  <tr key={entry.timesheetEntryId} className="border-t">
                    <td className="px-4 py-2">
                      {projectMap[entry.projectId] ||
                        `Project-${entry.projectId}`}
                    </td>
                    <td className="px-4 py-2">{entry.taskId || "N/A"}</td>
                    <td className="px-4 py-2">
                      {new Date(entry.fromTime).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-2">
                      {new Date(entry.toTime).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-2">{entry.workType}</td>
                    <td className="px-4 py-2">{entry.description}</td>
                    <td className="px-4 py-2">
                      {(entry.hoursWorked ?? 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevious={handlePrevious}
          onNext={handleNext}
        />
      )}
    </div>
  );
};

export default ManagerApprovalTable;
