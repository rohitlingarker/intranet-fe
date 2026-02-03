import React, { useEffect, useState, useRef } from "react";
import { getClientSLA, updateClientSLA, deleteClientSLA } from "../services/clientservice";
import { toast } from "react-toastify";
import LoadingSpinner from "../../../components/LoadingSpinner";
import Pagination from "../../../components/Pagination/pagination";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import SLAForm from "./client_configuration/forms/SLAForm";
import Modal from "../../../components/Modal/modal";
import ConfirmationModal from "../../../components/confirmation_modal/ConfirmationModal";
import { useAuth } from "../../../contexts/AuthContext";

const ClientBasicSLA = ({ clientId, slaRefetchKey }) => {
  const { user } = useAuth();
  const permissions = user?.permissions || [];
  const canEditConfig = permissions.includes("EDIT_CLIENT_CONFIG");
  const [slaList, setSLAList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef(null);
  const [openUpdateSLA, setOpenUpdateSLA] = useState(false);
  const [formData, setFormData] = useState({});
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [selectedSLAId, setSelectedSLAId] = useState(null);

  const ITEMS_PER_PAGE = 1;

  const handleSetFormData = (data) => {
    if (!data) return;
    setFormData({
      client: {
        clientId: clientId,
      },
      slaId: data.slaId,
      slaType: data.slaType,
      slaDurationDays: data.slaDurationDays,
      warningThresholdDays: data.warningThresholdDays,
      activeFlag: data.activeFlag ?? true,
    });
  };

  const handleUpdateSLA = async () => {
    setUpdateLoading(true);
    try {
      const res = await updateClientSLA(formData);
      const updated = res.data;
      toast.success(res.message || "SLA updated successfully.");
      setOpenUpdateSLA(false);
      setSLAList((prev) =>
        prev.map((item) =>
          item.slaId === updated.slaId
            ? { ...item, ...updated }
            : item,
        ),
      );
      // fetchSLA();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update SLA.");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeleteSLA = async () => {
    setDeleteLoading(true);
    try {
      const res = await deleteClientSLA(selectedSLAId);
      toast.success(res.message || "SLA deleted successfully.");
      fetchSLA();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete SLA.");
    } finally {
      setDeleteLoading(false);
      setOpenConfirmModal(false);
      setSelectedSLAId(null);
    }
  };  

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

  if (slaList.length === 0) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Basic SLA Information</h2>
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
      <div className="border rounded-xl p-5 bg-white shadow-sm space-y-3">
        <div className="flex justify-between items-start relative">
          <div>
            <h2 className="text-xl font-semibold mb-3">
              Basic SLA Information
            </h2>
          </div>

          {canEditConfig && (
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
                      handleSetFormData(currentSLA);
                      setOpenMenu(false);
                      setOpenUpdateSLA(true);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-blue-700 hover:bg-gray-100"
                  >
                    <Pencil size={14} />
                    Update
                  </button>

                  <button
                    onClick={() => {
                      setSelectedSLAId(currentSLA.slaId);
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
          )}
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">SLA Type</span>
          <span className="font-medium">{currentSLA.slaType}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Duration (Days)</span>
          <span className="font-medium">{currentSLA.slaDurationDays}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-sm text-gray-500">
            Warning Threshold (Days)
          </span>
          <span className="font-medium">{currentSLA.warningThresholdDays}</span>
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
          onPrevious={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          onNext={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
        />
      )}

      {/* Update SLA Modal */}
      <Modal
        title="Update SLA"
        subtitle="Update SLA details"
        isOpen={openUpdateSLA}
        onClose={() => setOpenUpdateSLA(false)}
      >
        <SLAForm formData={formData} setFormData={setFormData} />
        <div className="flex justify-end mt-4">
          <button onClick={handleUpdateSLA} disabled={updateLoading} className={`px-4 py-2 rounded-xl bg-blue-700 text-white hover:bg-blue-800 ${updateLoading && "opacity-50 cursor-not-allowed"}`}>
            {updateLoading ? "Updating..." : "Update"}
          </button>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <ConfirmationModal 
        title="Delete SLA"
        message="Are you sure you want to delete this SLA? Action cannot be undone."
        confirmText="Delete"
        isOpen={openConfirmModal}
        onCancel={() => setOpenConfirmModal(false)}
        onConfirm={handleDeleteSLA}
        isLoading={deleteLoading}
      /> 
    </div>
  );
};

export default ClientBasicSLA;