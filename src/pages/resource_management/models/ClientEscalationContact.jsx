import React, { useEffect, useState } from "react";
import { getClientEscalation } from "../services/clientservice";
import { toast } from "react-toastify";
import LoadingSpinner from "../../../components/LoadingSpinner";
import Pagination from "../../../components/Pagination/pagination";

const ClientEscalationContact = ({ clientId, escalationRefetchKey }) => {
  const [contactList, setContactList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const ITEMS_PER_PAGE = 1;

  const fetchContact = async () => {
    setLoading(true);
    try {
      const res = await getClientEscalation(clientId);
      const data = res.data || [];

      const normalized = data.map((sla) => ({
        ...sla,
        activeFlag: sla.activeFlag ?? false,
      }));

      setContactList(normalized);
      setCurrentPage(1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch SLA");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContact();
  }, [clientId, escalationRefetchKey]);

  if (loading) {
    return (
      <div className="p-4 flex justify-center items-center">
        <LoadingSpinner text="Loading SLA Information..." />
      </div>
    );
  }

  if (contactList.length === 0) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Basic SLA Information</h2>
        <p className="text-gray-600 italic font-semibold text-sm">
          No SLA information available for this client. Add from above!
        </p>
      </div>
    );
  }

  const totalPages = Math.ceil(contactList.length / ITEMS_PER_PAGE);
  const currentContact = contactList[currentPage - 1];

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">
        Basic Escalation Contact Information
      </h2>
      <div className="border rounded-xl p-5 bg-white shadow-sm space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Contact Name</span>
          <span className="font-medium">{currentContact.contactName}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Contact Role</span>
          <span className="font-medium">{currentContact.contactRole}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-sm text-gray-500">
            Email
          </span>
          <span className="font-medium">{currentContact.email}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Phone</span>
          <span className="font-medium">{currentContact.phone}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Escalation Level</span>
          <span className="font-medium">{currentContact.escalationLevel}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Status</span>
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              currentContact.activeFlag
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-600"
            }`}
          >
            {currentContact.activeFlag ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevious={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          onNext={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
        />
      )}
    </div>
  );
};
export default ClientEscalationContact;
