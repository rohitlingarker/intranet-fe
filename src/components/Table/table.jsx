// import React, { useState } from "react";

// const Table = ({ headers, rows, renderRow, renderExpandedRow }) => {
//   const [expandedRowIndex, setExpandedRowIndex] = useState(null);

//   const toggleExpand = (index) => {
//     setExpandedRowIndex(expandedRowIndex === index ? null : index);
//   };

//   return (
//     <table className="w-full border-collapse border border-gray-300">
//       <thead>
//         <tr className="bg-gray-100">
//           {headers.map((header, index) => (
//             <th key={index} className="border p-2">{header}</th>
//           ))}
//           {renderExpandedRow && <th className="border p-2">Action</th>}
//         </tr>
//       </thead>
//       <tbody>
//         {rows.length > 0 ? (
//           rows.map((row, index) => (
//             <React.Fragment key={index}>
//               <tr>
//                 {renderRow(row, index)}
//                 {renderExpandedRow && (
//                   <td className="border p-2 text-center">
//                     <button
//                       onClick={() => toggleExpand(index)}
//                       className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
//                     >
//                       {expandedRowIndex === index ? "Hide" : "View"}
//                     </button>
//                   </td>
//                 )}
//               </tr>
//               {expandedRowIndex === index && renderExpandedRow && (
//                 <tr>
//                   <td colSpan={headers.length + 1} className="border p-4 bg-gray-50">
//                     {renderExpandedRow(row, index)}
//                   </td>
//                 </tr>
//               )}
//             </React.Fragment>
//           ))
//         ) : (
//           <tr>
//             <td colSpan={headers.length + (renderExpandedRow ? 1 : 0)} className="text-center p-4">
//               No Data Available
//             </td>
//           </tr>
//         )}
//       </tbody>
//     </table>
//   );
// };

// export default Table;

import React from "react";

const GenericTable = ({
  headers = [],
  rows = [],
  columns = [],
  loading = false,
}) => {
  return (
    <div
     className="relative overflow-visible"
      style={{
        background: "#fff",
        padding: "16px",
        margin: "16px 0",
        borderRadius: "10px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
      }}
    >
      {loading ? (
        <div className="text-center text-gray-500">Loading data...</div>
      ) : rows.length === 0 ? (
        <div className="text-center text-gray-500">No records found.</div>
      ) : (
        <table className="w-full border-collapse rounded-lg shadow-sm">
          <thead>
            <tr className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white text-sm">
              {headers.map((header, idx) => (
                <th key={idx} className="text-center px-3 py-3">
                  {header}
                </th> 
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`hover:bg-blue-50 transition ${
                  rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                {columns.map((col, colIndex) => (
                  // 
                  <td
                  key={colIndex}
                  className="p-3 text-gray-700 font-medium relative overflow-visible"
                >
                  {typeof row[col] === "string"
                    ? row[col].toUpperCase()
                    : row[col]}
                </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default GenericTable;
