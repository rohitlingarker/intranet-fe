import React from "react";
import { X } from "lucide-react";

const ExpandedRow = ({ entries, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-5xl w-full relative overflow-auto max-h-[80vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-all"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-extrabold mb-5 text-gray-800 flex items-center border-b pb-3">
          Timesheet Details
        </h2>

        {/* Table */}
        <table className="w-full border-collapse rounded-lg overflow-hidden shadow-md">
          <thead>
            <tr className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white text-sm uppercase">
              <th className="px-4 py-3 text-left">Project ID</th>
              <th className="px-4 py-3 text-left">Task ID</th>
              <th className="px-4 py-3 text-left">Description</th>
              <th className="px-4 py-3 text-left">Work Type</th>
              <th className="px-4 py-3 text-left">Start Time</th>
              <th className="px-4 py-3 text-left">End Time</th>
              <th className="px-4 py-3 text-left">Hours Worked</th>
              <th className="px-4 py-3 text-left">Other Description</th>
            </tr>
          </thead>
          <tbody>
            {entries && entries.length > 0 ? (
              entries.map((entry, idx) => (
                <tr
                  key={idx}
                  className={`${
                    idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-blue-50 transition`}
                >
                  <td className="px-4 py-2">{entry.projectId}</td>
                  <td className="px-4 py-2">{entry.taskId}</td>
                  <td className="px-4 py-2">{entry.description}</td>
                  <td className="px-4 py-2">{entry.workType}</td>
                  <td className="px-4 py-2">
                    {new Date(entry.fromTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-2">
                    {new Date(entry.toTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td
                    className={`px-4 py-2 font-semibold ${
                      entry.hoursWorked < 0 ? "text-red-500" : "text-green-600"
                    }`}
                  >
                    {entry.hoursWorked}
                  </td>
                  <td className="px-4 py-2">{entry.otherDescription}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center text-gray-500 py-4">
                  No details found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpandedRow;

