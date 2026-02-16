"use client";

import React, { useState } from "react";

export default function AddTaskModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: "",
    employee: "",
    priority: "medium",
    dueDate: "",
    description: "",
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!formData.title) return;

    onSave({
      ...formData,
      id: Date.now(),
      progress: 0,
      status: "todo",
    });

    setFormData({
      title: "",
      employee: "",
      priority: "medium",
      dueDate: "",
      description: "",
    });

    onClose();
  };

  const inputStyle = {
    width: "100%",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: "8px 10px",
    fontSize: 13,
    outline: "none",
  };

  const labelStyle = {
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 4,
    display: "block",
    color: "#334155",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        backdropFilter: "blur(2px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
    >
      {/* Modal Card */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: 14,
          width: "92%",
          maxWidth: 520,
          padding: 24,
          boxShadow: "0 18px 40px rgba(0,0,0,0.18)",
          animation: "fadeIn 0.18s ease",
        }}
      >
        {/* Header */}
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
          Create New Task
        </h2>
        <p style={{ color: "#64748b", fontSize: 13, marginBottom: 16 }}>
          Fill the details to create onboarding task.
        </p>

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Title */}
          <div>
            <label style={labelStyle}>Task Title</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          {/* Employee */}
          <div>
            <label style={labelStyle}>Assign Employee</label>
            <input
              name="employee"
              value={formData.employee}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          {/* Priority + Date */}
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Task Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              style={{ ...inputStyle, resize: "none" }}
            />
          </div>
        </div>

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            marginTop: 16,
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: "#e2e8f0",
              border: "none",
              padding: "8px 14px",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            style={{
              background: "#4f6df5",
              color: "white",
              border: "none",
              padding: "8px 14px",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Save Task
          </button>
        </div>
      </div>
    </div>
  );
}


// "use client";

// import React, { useState } from "react";

// export default function AddTaskModal({ isOpen, onClose, onSave }) {
//   const [formData, setFormData] = useState({
//     title: "",
//     employee: "",
//     priority: "medium",
//     dueDate: "",
//     description: "",
//   });

//   if (!isOpen) return null;

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = () => {
//     if (!formData.title) return;

//     onSave({
//       ...formData,
//       id: Date.now(),
//       progress: 0,
//       status: "todo",
//     });

//     setFormData({
//       title: "",
//       employee: "",
//       priority: "medium",
//       dueDate: "",
//       description: "",
//     });

//     onClose();
//   };

//   return (
//     <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      
//       {/* Modal Card */}
//       <div className="bg-white rounded-xl shadow-lg w-[92%] max-w-lg p-8 relative animate-fadeIn">
        
//         {/* Header */}
//         <h2 className="text-xl font-semibold text-gray-900">
//           Create New Task
//         </h2>
//         <p className="text-gray-500 mb-6">
//           Fill the details to create onboarding task.
//         </p>

//         {/* Form */}
//         <div className="space-y-5">

//           {/* Task Title */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Task Title
//             </label>
//             <input
//               type="text"
//               name="title"
//               value={formData.title}
//               onChange={handleChange}
//               className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
//             />
//           </div>

//           {/* Assign Employee */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Assign Employee
//             </label>
//             <input
//               type="text"
//               name="employee"
//               value={formData.employee}
//               onChange={handleChange}
//               className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
//             />
//           </div>

//           {/* Priority + Date */}
//           <div className="grid grid-cols-2 gap-4">

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Priority
//               </label>
//               <select
//                 name="priority"
//                 value={formData.priority}
//                 onChange={handleChange}
//                 className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
//               >
//                 <option value="high">High</option>
//                 <option value="medium">Medium</option>
//                 <option value="low">Low</option>
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Due Date
//               </label>
//               <input
//                 type="date"
//                 name="dueDate"
//                 value={formData.dueDate}
//                 onChange={handleChange}
//                 className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
//               />
//             </div>

//           </div>

//           {/* Description */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Task Description
//             </label>
//             <textarea
//               name="description"
//               value={formData.description}
//               onChange={handleChange}
//               rows={3}
//               className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
//             />
//           </div>

//         </div>

//         {/* Buttons */}
//         <div className="flex justify-end gap-4 mt-6">

//           <button
//             onClick={onClose}
//             className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 transition"
//           >
//             Cancel
//           </button>

//           <button
//             onClick={handleSubmit}
//             className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition shadow"
//           >
//             Save Task
//           </button>

//         </div>
//       </div>
//     </div>
//   );
// }
