import React, { useEffect, useState, useRef } from "react";
import {
  getClientCompliance,
  updateClientCompliance,
  deleteClientCompliance,
} from "../services/clientservice";
import { toast } from "react-toastify";
import LoadingSpinner from "../../../components/LoadingSpinner";
import Pagination from "../../../components/Pagination/pagination";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Modal from "../../../components/Modal/modal";
import ComplianceForm from "./client_configuration/forms/ComplianceForm";
import ConfirmationModal from "../../../components/confirmation_modal/ConfirmationModal";

const ClientBasicCompliance = ({ clientId, complianceRefetchKey }) => {
  const [complianceList, setComplianceList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef(null);
  const [formData, setFormData] = useState({});
  const [openUpdateCompliance, setOpenUpdateCompliance] = useState(false);
  const [openComfirmModal, setOpenConfirmModal] = useState(false);
  const [selectedComplianceId, setSelectedComplianceId] = useState(null);

  const ITEMS_PER_PAGE = 1;

  const handleSetFormData = (data) => {
    if (!data) return;
    setFormData({
      client: {
        clientId: clientId,
      },
      complianceId: data.complianceId,
      requirementType: data.requirementType,
      requirementName: data.requirementName,
      mandatoryFlag: data.mandatoryFlag ?? true,
      activeFlag: data.activeFlag ?? true,
    });
  };

  const handleUpdateCompliance = async () => {
    setUpdateLoading(true);
    try {
      const res = await updateClientCompliance(formData);
      const updated = res.data;
      setOpenUpdateCompliance(false);
      // fetchCompliance();
      setComplianceList((prev) =>
        prev.map((item) =>
          item.complianceId === updated.complianceId
            ? { ...item, ...updated }
            : item,
        ),
      );
      toast.success("Compliance updated successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update Compliance.",
      );
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeleteCompliance = async () => {
    setDeleteLoading(true);
    try {
      const res = await deleteClientCompliance(selectedComplianceId);
      toast.success(res.message || "Compliance deleted successfully.");
      setOpenConfirmModal(false);
      setSelectedComplianceId(null);
      fetchCompliance();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete Compliance.",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

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

  console.log("Current - Compliance", currentCompliance);

  return (
    <div className="p-4">
      <div className="border rounded-xl p-5 bg-white shadow-sm space-y-3">
        <div className="flex justify-between items-start relative">
          <div>
            <h2 className="text-xl font-semibold mb-3">
              Basic Compliance Information
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
                    handleSetFormData(currentCompliance);
                    setOpenMenu(false);
                    setOpenUpdateCompliance(true);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-blue-700 hover:bg-gray-100"
                >
                  <Pencil size={14} />
                  Update
                </button>

                <button
                  onClick={() => {
                    setSelectedComplianceId(currentCompliance.complianceId);
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
          <span className="text-sm text-gray-500">Requirement Type</span>
          <span className="font-medium">
            {currentCompliance.requirementType}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Requirement Name</span>
          <span className="font-medium">
            {currentCompliance.requirementName}
          </span>
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
          onPrevious={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          onNext={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
        />
      )}

      {/* Update Compliance Modal */}
      <Modal
        title="Update Compliance"
        subtitle="Update Compliance details."
        isOpen={openUpdateCompliance}
        onClose={() => setOpenUpdateCompliance(false)}
      >
        <ComplianceForm formData={formData} setFormData={setFormData} />
        <div className="flex justify-end mt-4">
          <button
            type="button"
            onClick={handleUpdateCompliance}
            disabled={updateLoading}
            className={`px-4 py-2 rounded-xl bg-blue-700 text-white hover:bg-blue-800 ${updateLoading && "opacity-50 cursor-not-allowed"}`}
          >
            {updateLoading ? "Updating..." : "Update"}
          </button>
        </div>
      </Modal>

      {/* Delete Compliance Modal */}
      <ConfirmationModal
        isOpen={openComfirmModal}
        title="Delete Compliance"
        message="Are you sure you want to delete this Compliance? This Action cannot be undone."
        onConfirm={handleDeleteCompliance}
        onCancel={() => {
          setOpenConfirmModal(false);
          setSelectedComplianceId(null);
        }}
        isLoading={deleteLoading}
      />
    </div>
  );
};
export default ClientBasicCompliance;
