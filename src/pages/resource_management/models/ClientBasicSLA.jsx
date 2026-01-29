import React, { useEffect, useState } from "react";
import { getClientSLA } from "../services/clientservice";
import { toast } from "react-toastify";
import LoadingSpinner from "../../../components/LoadingSpinner";
import Pagination from "../../../components/Pagination/pagination";

const ClientBasicSLA = ({ clientId, slaRefetchKey }) => {
  const [slaList, setSLAList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const ITEMS_PER_PAGE = 1;

  const fetchSLA = async () => {
    setLoading(true);
    try {
      const res = await getClientSLA(clientId);
      const data = res.data || [];

      const normalized = data.map((sla) => ({
        ...sla,
        activeFlag: sla.activeFlag ?? false,
      }));

      setSLAList(normalized);
      setCurrentPage(1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch SLA");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSLA();
  }, [clientId, slaRefetchKey]);

  if (loading) {
    return (
      <div className="p-4 flex justify-center items-center">
        <LoadingSpinner text="Loading SLA Information..." />
      </div>
    );
  }

  if (slaList.length === 0) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">
          Basic SLA Information
        </h2>
        <p className="text-gray-600 italic font-semibold text-sm">
          No SLA information available for this client. Add from above!
        </p>
      </div>
    );
  }

  const totalPages = Math.ceil(slaList.length / ITEMS_PER_PAGE);
  const currentSLA = slaList[currentPage - 1];

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">
        Basic SLA Information
      </h2>

      <div className="border rounded-xl p-5 bg-white shadow-sm space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">SLA Type</span>
          <span className="font-medium">{currentSLA.slaType}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Duration (Days)</span>
          <span className="font-medium">
            {currentSLA.slaDurationDays}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-sm text-gray-500">
            Warning Threshold (Days)
          </span>
          <span className="font-medium">
            {currentSLA.warningThresholdDays}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Status</span>
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              currentSLA.activeFlag
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-600"
            }`}
          >
            {currentSLA.activeFlag ? "Active" : "Inactive"}
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

export default ClientBasicSLA;