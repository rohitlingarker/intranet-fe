import React from 'react';

// Utility to get all keys from before and after objects
function getAllKeys(before, after) {
  return Array.from(new Set([...Object.keys(before || {}), ...Object.keys(after || {})]));
}

const ApprovalDiffViewer = ({ payload }) => {
  let before = {};
  let after = {};

  try {
    const parsed = JSON.parse(payload);
    before = parsed.before || {};
    after = parsed.after || parsed.newData || {};
  } catch (e) {
    // fallback: show raw payload
    return (
      <div className="bg-red-50 text-red-700 p-2 rounded">
        Invalid payload format
        <pre className="text-xs">{payload}</pre>
      </div>
    );
  }

  const keys = getAllKeys(before, after);

  return (
    <div className="border rounded-lg overflow-hidden my-4">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 text-left font-semibold">Field</th>
            <th className="px-4 py-2 text-left font-semibold">Before</th>
            <th className="px-4 py-2 text-left font-semibold">After</th>
          </tr>
        </thead>
        <tbody>
          {keys.map((key) => (
            <tr key={key}>
              <td className="px-4 py-2 font-medium text-gray-700">{key}</td>
              <td className="px-4 py-2 text-gray-500 bg-gray-50">{before[key] !== undefined ? String(before[key]) : <span className="italic text-gray-400">-</span>}</td>
              <td className="px-4 py-2 text-gray-900">{after[key] !== undefined ? String(after[key]) : <span className="italic text-gray-400">-</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ApprovalDiffViewer;
