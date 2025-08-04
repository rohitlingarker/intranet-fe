import React from 'react';
export default function DashboardCards() {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Full Width Card */}
      <div className="bg-white rounded-2xl shadow p-6 mb-6 w-full">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Full Width Card</h2>
        <p className="text-gray-600">This card stretches across the full width and is perfect for wide content such as charts, summaries, or banners.</p>
      </div>
    </div>
  );
}
