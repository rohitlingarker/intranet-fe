// src/pages/TestDesign/TestDesign.jsx

import { useEffect, useState } from "react";
import ScenarioList from "./components/ScenarioList";
import ScenarioDetails from "./components/ScenarioDetails";
import ScenarioModal from "./components/ScenarioModal";

export default function TestDesign() {
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  return (
    <div className="flex h-full w-full">
      
      {/* Left Panel */}
      <div className="w-[35%] border-r p-4 overflow-y-auto">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl">Test Scenarios</h2>
          <button 
            onClick={() => setOpenModal(true)}
            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            + New
          </button>
        </div>

        <ScenarioList onSelectScenario={setSelectedScenario} />
      </div>

      {/* Right Panel */}
      <div className="flex-1 p-6">
        {selectedScenario ? (
          <ScenarioDetails scenarioId={selectedScenario} />
        ) : (
          <p className="text-gray-500">Select a scenario to view details.</p>
        )}
      </div>

      {/* Add Scenario Modal */}
      <ScenarioModal open={openModal} close={() => setOpenModal(false)} />
    </div>
  );
}
// import React, { useState } from "react";

// export default function TestDesign() {
//   // -----------------------
//   // MOCK DATA (same file)
//   // -----------------------
//   const mockStories = [
//     {
//       id: 1,
//       name: "Authentication Tests",
//       scenarios: [
//         { id: 101, name: "Valid Login", status: "Ready" },
//         { id: 102, name: "MFA Flow", status: "Draft" },
//       ],
//     },
//     {
//       id: 2,
//       name: "Security Checks",
//       scenarios: [],
//     },
//   ];

//   const mockScenarioDetails = {
//     101: {
//       id: 101,
//       title: "Valid Login",
//       status: "Ready",
//       cases: [
//         {
//           id: 201,
//           title: "Login with valid creds",
//           steps: 3,
//           priority: "High",
//           active: true,
//         },
//         {
//           id: 202,
//           title: "Redirect logic",
//           steps: 0,
//           priority: "Medium",
//           active: true,
//         },
//       ],
//     },
//     102: {
//       id: 102,
//       title: "MFA Flow",
//       status: "Draft",
//       cases: [],
//     },
//   };

//   // -----------------------
//   // UI State
//   // -----------------------
//   const [selectedScenarioId, setSelectedScenarioId] = useState(101);

//   const selectedScenario = mockScenarioDetails[selectedScenarioId];

//   // -----------------------
//   // COMPONENT JSX
//   // -----------------------
//   return (
//     <div className="flex h-screen bg-gray-50">
//       {/* LEFT SIDE TREE */}
//       <div className="w-72 border-r bg-white p-4">
//         <div className="flex justify-between items-center mb-3">
//           <h2 className="text-lg font-semibold">Test Scenarios</h2>
//           <button className="text-blue-600 hover:text-blue-800 text-xl">+</button>
//         </div>

//         {/* Stories + Scenarios */}
//         <div className="space-y-4">
//           {mockStories.map((story) => (
//             <div key={story.id}>
//               <div className="flex items-center space-x-2 text-gray-700 font-medium">
//                 <span>📂</span>
//                 <span>{story.name}</span>
//               </div>

//               <div className="ml-6 mt-2 space-y-1">
//                 {story.scenarios.map((scenario) => (
//                   <div
//                     key={scenario.id}
//                     className={`cursor-pointer px-2 py-1 rounded-md ${
//                       selectedScenarioId === scenario.id
//                         ? "bg-blue-100 text-blue-700 font-medium"
//                         : "text-gray-700 hover:bg-gray-100"
//                     }`}
//                     onClick={() => setSelectedScenarioId(scenario.id)}
//                   >
//                     {scenario.name}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* RIGHT SIDE DETAILS */}
//       <div className="flex-1 p-8">
//         {/* Header */}
//         <div className="flex justify-between items-center mb-6">
//           <div>
//             <span
//               className={`px-2 py-1 text-xs rounded-md ${
//                 selectedScenario.status === "Ready"
//                   ? "bg-green-100 text-green-700"
//                   : "bg-gray-200 text-gray-600"
//               }`}
//             >
//               {selectedScenario.status}
//             </span>

//             <h1 className="text-2xl font-bold mt-2">
//               {selectedScenario.title}
//             </h1>
//           </div>

//           <div className="flex items-center space-x-3">
//             <button className="px-4 py-2 text-sm border rounded hover:bg-gray-100">
//               Edit
//             </button>

//             <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
//               + Add Case
//             </button>
//           </div>
//         </div>

//         {/* Test Cases */}
//         <div className="space-y-4">
//           {selectedScenario.cases.map((testCase) => (
//             <div
//               key={testCase.id}
//               className="p-4 bg-white border rounded-lg shadow-sm flex justify-between items-center"
//             >
//               <div>
//                 <h3 className="font-semibold">{testCase.title}</h3>
//                 <p className="text-sm text-gray-500">
//                   {testCase.steps} Steps • {testCase.priority} Priority
//                 </p>
//               </div>

//               <div className="flex items-center space-x-3">
//                 <span className="text-sm text-green-600 font-medium">
//                   Active
//                 </span>
//                 <span className="text-gray-400 text-lg">›</span>
//               </div>
//             </div>
//           ))}

//           {selectedScenario.cases.length === 0 && (
//             <p className="text-gray-400 text-center text-sm">
//               No cases added yet.
//             </p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
