import React from "react";


export default function ThreeCards() {
return (
    <div className="p-6 bg-gray-100 min-h-screen">
        {/* Row of 3 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Card One</h3>
                <p className="text-gray-600">This is a sample description inside the first card.</p>
            </div>
            <div className="bg-white rounded-2xl shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Card Two</h3>
                <p className="text-gray-600">Here is some placeholder content for the second card.</p>
            </div>
            <div className="bg-white rounded-2xl shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Card Three</h3>
                <p className="text-gray-600">The third card contains a small block of test data.</p>
            </div>
        </div>
    </div>
);}