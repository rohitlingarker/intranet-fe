import React from "react";

const ClientBasicCompliance = ({ clientId }) => {
  return (
    <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Basic Compliance Information</h2>
        <p className="text-gray-600 italic font-semibold text-sm">
            No Compliance information available for this client. Add from above!
        </p>
    </div>
  );
};
export default ClientBasicCompliance;