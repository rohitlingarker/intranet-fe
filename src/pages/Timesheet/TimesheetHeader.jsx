
//  import DayTrackModal from "./DayTrackModal";

// const TimesheetHeader = () => {
//   return (
//     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//       <div>
//         <h1 className="text-2xl font-bold text-gray-900">Previous History Track</h1>
//         <p className="text-gray-600">Track and manage timesheets, projects, and productivity</p>
//       </div>
//        <DayTrackModal /> 
//     </div>
//   );
// };

// export default TimesheetHeader;
import React, { useState } from "react";
import DayTrackModal from "./DayTrackModal"; 

const TimesheetHeader = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Previous History Track</h1>
        <p className="text-gray-600">Track and manage timesheets, projects, and productivity</p>
      </div>

      {/* Add Entry Button */}
      <button
        onClick={openModal}
        className="bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-800"
      >
        + Add Entry
      </button>

      {/* Modal Component */}
      <DayTrackModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
};

export default TimesheetHeader;

