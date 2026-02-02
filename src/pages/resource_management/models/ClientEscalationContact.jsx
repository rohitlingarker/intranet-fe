import React, { useEffect, useState, useRef } from "react";
import { getClientEscalation, updateClientContact, deleteClientContact } from "../services/clientservice";
import { toast } from "react-toastify";
import LoadingSpinner from "../../../components/LoadingSpinner";
import Pagination from "../../../components/Pagination/pagination";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Modal from "../../../components/Modal/modal";
import EscalationForm from "./client_configuration/forms/EscalationForm";
import ConfirmationModal from "../../../components/confirmation_modal/ConfirmationModal";

const ClientEscalationContact = ({ clientId, escalationRefetchKey }) => {
  const [contactList, setContactList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef(null);
  const [openUpdateContact, setOpenUpdateContact] = useState(false);
  const [formData, setFormData] = useState({});
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState(null);

  const ITEMS_PER_PAGE = 1;

  const handleSetFormData = (data) => {
    if (!data) return;
    setFormData({
      client: {
        clientId: clientId,
      },
      contactId: data.contactId,
      contactName: data.contactName,
      contactRole: data.contactRole,
      email: data.email,
      phone: data.phone,
      escalationLevel: data.escalationLevel,
      activeFlag: data.activeFlag ?? true,
    });
  };

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

  const handleUpdateContact = async () => {
    setUpdateLoading(true);
    try {
      const res = await updateClientContact(formData);
      toast.success(res.message || "Contact updated successfully.");
      setOpenUpdateContact(false);
      fetchContact();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update Contact.");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeleteContact = async () => {
    setDeleteLoading(true);
    try {
      const res = await deleteClientContact(selectedContactId);
      const updated = res.data;
      setContactList((prev) =>
        prev.map((item) =>
          item.contactId === updated.contactId
            ? { ...item, ...updated }
            : item,
        ),
      );
      toast.success(res.message || "Contact deleted successfully.");
      // fetchContact();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete Contact.");
    } finally {
      setDeleteLoading(false);
      setSelectedContactId(null);
      setOpenConfirmModal(false);
    }
  };

  useEffect(() => {
    fetchContact();
  }, [clientId, escalationRefetchKey]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        <h2 className="text-xl font-semibold mb-4">Basic Escalation Contacts</h2>
        <p className="text-gray-600 italic font-semibold text-sm">
          No Escalation Contacts information available for this client. Add from above!
        </p>
      </div>
    );
  }

  const totalPages = Math.ceil(contactList.length / ITEMS_PER_PAGE);
  const currentContact = contactList[currentPage - 1];

  return (
    <div className="p-4">
      <div className="border rounded-xl p-5 bg-white shadow-sm space-y-3">
        <div className="flex justify-between items-start relative">
          <div>
            <h2 className="text-xl font-semibold mb-3">
              Basic Escalation Contact Information
            </h2>
          </div>

          {/* Action menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setOpenMenu((prev) => !prev)}
              className="text-gray-400 hover:text-gray-600"
            >
              <MoreHorizontal />
            </button>

            {openMenu && (
              <div className="absolute right-0 mt-2 w-36 bg-white border rounded-lg shadow-lg z-50">
                <button
                  onClick={() => {
                    handleSetFormData(currentContact);
                    setOpenMenu(false);
                    setOpenUpdateContact(true);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-blue-700 hover:bg-gray-100"
                >
                  <Pencil size={14} />
                  Update
                </button>

                <button
                  onClick={() => {
                    setSelectedContactId(currentContact.contactId);
                    setOpenMenu(false);
                    setOpenConfirmModal(true);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Contact Name</span>
          <span className="font-medium">{currentContact.contactName}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Contact Role</span>
          <span className="font-medium">{currentContact.contactRole}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Email</span>
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

      {/* Update Contact Modal */}
      <Modal
        title="Update Escalation Contact"
        subtitle="Update Escalation Contact details."
        isOpen={openUpdateContact}
        onClose={() => setOpenUpdateContact(false)}
      >
        <EscalationForm formData={formData} setFormData={setFormData} />
        <div className="flex justify-end mt-4">
          <button onClick={handleUpdateContact} disabled={updateLoading} className={`px-4 py-2 rounded-xl bg-blue-700 text-white hover:bg-blue-800 ${updateLoading && "opacity-50 cursor-not-allowed"}`}>
            {updateLoading ? "Updating..." : "Update"}
          </button>
        </div>
      </Modal>

      {/* Confirm Modal */}
      <ConfirmationModal 
        title="Delete Escalation Contact"
        message="Are you sure you want to delete this Contact? Action cannot be undone."
        confirmText="Delete"
        isOpen={openConfirmModal}
        onCancel={() => setOpenConfirmModal(false)}
        onConfirm={handleDeleteContact}
        isLoading={deleteLoading}
      />
    </div>
  );
};
export default ClientEscalationContact;
