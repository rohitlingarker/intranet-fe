import React from "react";

const Card = ({ title, value, textColor = "text-gray-800" }) => {
  return (
    <div className="bg-white rounded-2xl shadow p-6 text-center">
      <h3 className="text-lg font-semibold text-gray-800 mb-1">{title}</h3>
      <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
    </div>
  );
};

// CardHeader
const CardHeader = ({ children }) => {
  return (
    <div className="border-b border-gray-200 pb-2 mb-4">
      {children}
    </div>
  );
};

// CardContent
const CardContent = ({ children }) => {
  return (
    <div className="text-gray-700">{children}</div>
  );
};

const ThreeCard = ({ title, value, textColor = "text-gray-800" }) => {
  return (
    <div className="bg-white rounded-2xl shadow p-6 text-center">
      <h3 className="text-lg font-semibold text-gray-800 mb-1">{title}</h3>
      <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
    </div>
  );
};

export default ThreeCard;
export { Card , CardHeader, CardContent };
