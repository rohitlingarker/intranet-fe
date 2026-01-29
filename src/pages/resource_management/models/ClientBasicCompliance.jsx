import React, { useEffect, useState } from "react";
import { getClientCompliance } from "../services/clientservice";
import { toast } from "react-toastify";
import LoadingSpinner from "../../../components/LoadingSpinner";
import Pagination from "../../../components/Pagination/pagination";

const ClientBasicCompliance = ({ clientId, complianceRefetchKey }) => {

  const [complianceList, setComplianceList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
  
    const ITEMS_PER_PAGE = 1;
  const fetchCompliance = async () => {
    setLoading(true);
    try {
      const res = await getClientCompliance(clientId);
      const data = res.data || [];

      const normalized = data.map((compliance) => ({
        ...compliance,
        activeFlag: compliance.activeFlag ?? false,
      }));

      setComplianceList(normalized);
      setCurrentPage(1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch SLA");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCompliance();
  }, [clientId, complianceRefetchKey]);

  if (loading) {
    return (
      <div className="p-4 flex justify-center items-center">
        <LoadingSpinner text="Loading Compliance Information..." />
      </div>
    );
  }

  if (complianceList.length === 0) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">
          Basic Compliance Information
        </h2>
        <p className="text-gray-600 italic font-semibold text-sm">
          No Compliance information available for this client. Add from above!
        </p>
      </div>
    );
  }

  const totalPages = Math.ceil(complianceList.length / ITEMS_PER_PAGE);
  const currentCompliance = complianceList[currentPage - 1];

  return (

    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">
        Basic Compliance Information
      </h2>
      <div className="border rounded-xl p-5 bg-white shadow-sm space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Requirement Type</span>
          <span className="font-medium">{currentCompliance.requirementType}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Requirement Name</span>
          <span className="font-medium">{currentCompliance.requirementName}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Mandatory</span>
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              currentCompliance.mandatoryFlag
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-600"
            }`}
          >
            {currentCompliance.mandatoryFlag ? "Yes" : "No"}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Status</span>
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              currentCompliance.activeFlag
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-600"
            }`}
          >
            {currentCompliance.activeFlag ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevious={() =>
            setCurrentPage((p) => Math.max(p - 1, 1))
          }
          onNext={() =>
            setCurrentPage((p) => Math.min(p + 1, totalPages))
          }
        />
      )}
    </div>
  );
};
export default ClientBasicCompliance;
