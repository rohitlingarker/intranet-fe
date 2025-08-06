import React from "react";

const ThreeCard = ({ title, value, textColor = "text-gray-800" }) => {
  return (
    <div className="bg-white rounded-2xl shadow p-6 text-center">
      <h3 className="text-lg font-semibold text-gray-800 mb-1">{title}</h3>
      <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
    </div>
  );
};

export default ThreeCard;
