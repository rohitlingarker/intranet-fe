import React from "react";

const ApprovalQueue = ({ requests, onReview }) => {
  if (requests.length === 0) {
    return <p className="text-gray-500">No pending approvals. Great job! 👍</p>;
  }

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted By</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Type</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {requests.map((req) => (
          <tr key={req.id}>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{req.submittedBy}</td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {req.type}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.details}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button onClick={() => onReview(req)} className="text-indigo-600 hover:text-indigo-900">
                Review
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ApprovalQueue;