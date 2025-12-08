// // src/components/TestRunAccordion.jsx
// import React, { useState } from "react";
// import AddCasesFromProjectModal from "../TestDesign/modals/AddCasesFromProjectModal";

// export default function TestRunAccordion({ run, projectId, refreshRuns }) {
//   const [isOpen, setIsOpen] = useState(false);
//   const [showAddCasesModal, setShowAddCasesModal] = useState(false);

//   const executed = run.executedCount || 0;
//   const total = run.totalCount || 0;
//   const progress = total > 0 ? Math.round((executed / total) * 100) : 0;

//   return (
//     <>
//       <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
//         <div
//           className="p-4 flex justify-between items-start cursor-pointer bg-gray-50 hover:bg-gray-100"
//           onClick={() => setIsOpen((s) => !s)}
//         >
//           <div>
//             <h4 className="font-semibold">{run.name}</h4>
//             <p className="text-sm text-gray-500">
//               {run.executionDate || "No Date"}
//             </p>
//           </div>

//           <div className="flex flex-col items-end gap-2">
//             <div className="text-sm text-gray-600">{progress}%</div>

//             <div className="w-24 bg-gray-200 h-2 rounded-full overflow-hidden">
//               <div
//                 className="h-2 bg-green-500"
//                 style={{ width: `${progress}%` }}
//               />
//             </div>

//             <div className="text-lg">{isOpen ? "▲" : "▼"}</div>
//           </div>
//         </div>

//         {isOpen && (
//           <div className="p-4 border-t">
//             {run.testCases?.length > 0 ? (
//               <>
//                 <h5 className="font-medium text-sm mb-2">Test Cases</h5>

//                 <ul className="list-disc pl-5 text-sm space-y-1">
//                   {run.testCases.map((tc) => (
//                     <li key={tc.id}>{tc.title}</li>
//                   ))}
//                 </ul>

//                 {/* Add more button */}
//                 <button
//                   className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     setShowAddCasesModal(true);
//                   }}
//                 >
//                   + Add More Cases
//                 </button>
//               </>
//             ) : (
//               <div className="text-center py-6">
//                 <p className="text-gray-500 mb-3">No test cases added yet.</p>
//                 <button
//                   className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     setShowAddCasesModal(true);
//                   }}
//                 >
//                   + Add Test Cases
//                 </button>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* The modal */}
//       {showAddCasesModal && (
//         <AddCasesFromProjectModal
//           projectId={projectId}
//           runId={run.id}
//           onClose={() => setShowAddCasesModal(false)}
//           onSuccess={() => {
//             setShowAddCasesModal(false);
//             refreshRuns(); // 🔥 THIS MAKES YOUR UI UPDATE
//           }}
//         />
//       )}
//     </>
//   );
// }
