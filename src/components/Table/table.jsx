import React, { useState } from "react";

const Table = ({ headers, rows, renderRow, renderExpandedRow }) => {
  const [expandedRowIndex, setExpandedRowIndex] = useState(null);

  const toggleExpand = (index) => {
    setExpandedRowIndex(expandedRowIndex === index ? null : index);
  };

  return (
    <table className="w-full border-collapse border border-gray-300">
      <thead>
        <tr className="bg-gray-100">
          {headers.map((header, index) => (
            <th key={index} className="border p-2">{header}</th>
          ))}
          {renderExpandedRow && <th className="border p-2">Action</th>}
        </tr>
      </thead>
      <tbody>
        {rows.length > 0 ? (
          rows.map((row, index) => (
            <React.Fragment key={index}>
              <tr>
                {renderRow(row, index)}
                {renderExpandedRow && (
                  <td className="border p-2 text-center">
                    <button
                      onClick={() => toggleExpand(index)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      {expandedRowIndex === index ? "Hide" : "View"}
                    </button>
                  </td>
                )}
              </tr>
              {expandedRowIndex === index && renderExpandedRow && (
                <tr>
                  <td colSpan={headers.length + 1} className="border p-4 bg-gray-50">
                    {renderExpandedRow(row, index)}
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))
        ) : (
          <tr>
            <td colSpan={headers.length + (renderExpandedRow ? 1 : 0)} className="text-center p-4">
              No Data Available
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default Table;