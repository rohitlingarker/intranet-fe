import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Laptop,
  Users,
  Box,
  Pencil,
  Trash2,
  Plus,
  X,
  AlertTriangle,
  Search,
  Activity,
} from "lucide-react";
import Button from "../../../components/Button/Button";
import Pagination from "../../../components/Pagination/pagination";

import {
  getAssetsByClient,
  createClientAsset,
  updateClientAsset,
  deleteClientAsset,
  getAssetDashboardByClient,
} from "../services/clientservice";
import { toast } from "react-toastify";

/* ---------------- MAIN COMPONENT ---------------- */

const AssetList = () => {
  const navigate = useNavigate();
  const { clientId } = useParams();

  const [assets, setAssets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7; // Adjust this number as needed

  const [showModal, setShowModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [validationErrors, setValidationErrors] = useState({});

  /* ---------------- FETCH ASSETS ---------------- */

  const fetchAssets = async () => {
    try {
      const res = await getAssetsByClient(clientId);
      if (res.success) {
        setAssets(res.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load assets");
    }
  };

  const [kpi, setKpi] = useState({
    totalAssets: 0,
    assignedAssets: 0,
    availableAssets: 0,
    utilizationPercentage: 0,
  });

  const fetchKpi = async () => {
    const res = await getAssetDashboardByClient(clientId);
    if (res.success) {
      setKpi(res.data);
    }
  };

  useEffect(() => {
    fetchAssets();
    fetchKpi();
  }, [clientId]);

  /* ---------------- SEARCH & PAGINATION LOGIC ---------------- */

  // 1. Filter based on search
  const filteredAssets = assets.filter(
    (a) =>
      a.assetName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.assetCategory?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.assetType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 2. Reset to Page 1 if search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // 3. Calculate Pagination Slices
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAssets = filteredAssets.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);

  // 4. Handlers
  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  /* ---------------- HELPER: RESET STATE ---------------- */

  const closeModal = () => {
    setShowModal(false);
    setEditingAsset(null);
    setValidationErrors({});
  };

  const openModal = (asset = null) => {
    setEditingAsset(asset);
    setValidationErrors({});
    setShowModal(true);
  };

  /* ---------------- ADD / EDIT ---------------- */

  const handleSaveAsset = async (e) => {
    e.preventDefault();
    const form = e.target;
    const assetName = form.asset_name.value.trim();
    const quantity = Number(form.quantity.value);

    // VALIDATION
    const errors = {};
    if (!assetName) {
      errors.asset_name = "Asset name is required";
    }
    if (!form.quantity.value || quantity < 1) {
      errors.quantity = "Quantity must be at least 1";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});

    const payload = {
      client: { clientId },
      assetName: assetName,
      assetCategory: form.asset_category.value,
      assetType: form.asset_type.value,
      description: form.description.value,
      quantity: quantity,
    };

    const savePromise = editingAsset
      ? updateClientAsset(editingAsset.assetId, payload)
      : createClientAsset(payload);

    try {
      const res = await savePromise;

      if (res.success) {
        closeModal();
        await fetchAssets();
        await fetchKpi();
        toast.success(res.message || "Operation successful!");
      } else {
        toast.error(res.message || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Server connection failed");
    }
  };

  /* ---------------- DELETE ---------------- */

  const confirmDelete = async () => {
    try {
      await deleteClientAsset(deleteTarget.assetId);
      toast.success("Asset deleted successfully");
      setDeleteTarget(null);

      await fetchAssets();
      await fetchKpi();

    } catch (err) {
      console.error(err);
      toast.error("Failed to delete asset");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="group p-2.5 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:text-indigo-600 shadow-sm transition-all duration-200"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Asset Management
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs font-medium">Client</span>
                <span>•</span>
                <span>Inventory & Dashboard</span>
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            className="flex items-center gap-2 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all"
            onClick={() => openModal()}
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>New Asset</span>
          </Button>
        </div>

        {/* KPI SECTION */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Kpi title="Total Assets" value={kpi.totalAssets || 0} icon={Box} color="blue" />
          <Kpi title="Assigned Assets" value={kpi.assignedAssets || 0} icon={Users} color="violet" />
          <Kpi title="Available Assets" value={kpi.availableAssets || 0} icon={Laptop} color="emerald" />
          <Kpi
            title="Utilization"
            value={`${kpi.utilizationPercentage || 0}%`}
            icon={Activity}
            color="amber"
            isPercentage
            highlight={kpi.utilizationPercentage}
          />
        </div>

        {/* TABLE SECTION */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">

          {/* Table Header / Search */}
          <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/30">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Asset Inventory</h2>
              <p className="text-xs text-gray-500 mt-1">Manage physical and digital assets</p>
            </div>

            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
              <input
                className="w-full sm:w-72 pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 focus:outline-none transition-all shadow-sm"
                placeholder="Search by name, category, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold text-xs text-gray-500 uppercase tracking-wider">Asset Name</th>
                  <th className="px-6 py-4 font-semibold text-xs text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 font-semibold text-xs text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 font-semibold text-xs text-gray-500 uppercase tracking-wider text-center">Qty</th>
                  <th className="px-6 py-4 font-semibold text-xs text-gray-500 uppercase tracking-wider text-center">Status</th>
                  <th className="px-6 py-4 font-semibold text-xs text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {currentAssets.length > 0 ? (
                  currentAssets.map((asset) => (
                    <tr
                      key={asset.assetId}
                      className="group hover:bg-gray-50/80 transition-colors cursor-pointer"
                      onClick={() => navigate(`/assets/${clientId}/${asset.assetId}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                          {asset.assetName}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{asset.assetCategory}</td>
                      <td className="px-6 py-4 text-gray-600">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                          {asset.assetType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-medium text-gray-700">{asset.quantity}</td>
                      <td className="px-6 py-4 text-center">
                        <StatusBadge status={asset.status} />
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            className="p-2 text-indigo-600 hover:text-indigo-800 rounded-lg transition-colors "
                            title="Edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              openModal(asset);
                            }}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className="p-2 text-red-600  hover:text-red-800 rounded-lg transition-colors"
                            title="Delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTarget(asset);
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-gray-400 bg-white">
                      <div className="flex flex-col items-center gap-2">
                        <Box size={40} className="text-gray-200" />
                        <p>No assets found matching your search</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ✅ PAGINATION COMPONENT */}
          {filteredAssets.length > 0 && (
            <div className="border-t border-gray-100 p-4 bg-gray-50/30">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPrevious={handlePrevious}
                onNext={handleNext}
              />
            </div>
          )}
        </div>

        {/* ADD / EDIT MODAL */}
        {showModal && (
          <Modal
            title={editingAsset ? "Edit Asset Details" : "Add New Asset"}
            onClose={closeModal}
          >
            <form onSubmit={handleSaveAsset} className="space-y-5" noValidate>
              <Input
                label="Asset Name"
                name="asset_name"
                defaultValue={editingAsset?.assetName}
                placeholder="e.g. MacBook Pro M1"
                error={validationErrors.asset_name}
              />

              <Input
                label="Description"
                name="description"
                defaultValue={editingAsset?.description}
                placeholder="Brief details regarding the asset..."
              />

              <div className="grid grid-cols-2 gap-5">
                <Select
                  label="Category"
                  name="asset_category"
                  options={["DEVICE", "SOFTWARE", "ACCESS", "TOOLS"]}
                  defaultValue={editingAsset?.assetCategory}
                />

                <Select
                  label="Type"
                  name="asset_type"
                  options={["Laptop", "Mobile", "License", "VPN", "Tool"]}
                  defaultValue={editingAsset?.assetType}
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <Input
                  label="Quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  defaultValue={editingAsset?.quantity}
                  placeholder="0"
                  error={validationErrors.quantity}
                />
                <div className="hidden sm:block"></div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button
                  variant="secondary"
                  className="px-5 py-2.5 text-sm"
                  type="button"
                  onClick={closeModal}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="px-6 py-2.5 text-sm font-semibold shadow-md shadow-indigo-100"
                  type="submit"
                // onClick={(e) => e.currentTarget.form.reportValidity()}
                >
                  {editingAsset ? "Update Asset" : "Create Asset"}
                </Button>
              </div>
            </form>
          </Modal>
        )}

        {/* DELETE CONFIRMATION */}
        {deleteTarget && (
          <Modal title="Confirm Deletion" onClose={() => setDeleteTarget(null)}>
            <div className="space-y-4 text-center py-4">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="text-red-500" size={32} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900">Are you sure?</h4>
                <p className="text-sm text-gray-500 mt-1">
                  You are about to delete <strong>{deleteTarget.assetName}</strong>. This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-center gap-3 pt-4">
                <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={confirmDelete}>
                  Yes, Delete It
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

/* ---------------- UI HELPERS ---------------- */

const Kpi = ({ title, value, icon: Icon, color = "indigo", isPercentage, highlight }) => {
  const colorMap = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    violet: "bg-violet-50 text-violet-600 border-violet-100",
  };

  const getHighlightColor = (val) => {
    if (!isPercentage) return "text-gray-900";
    if (val >= 80) return "text-emerald-600";
    if (val >= 50) return "text-amber-600";
    return "text-red-600";
  }

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
          <p className={`text-2xl font-bold mt-2 ${isPercentage ? getHighlightColor(highlight) : 'text-gray-900'}`}>
            {value}
          </p>
        </div>
        <div className={`p-3 rounded-xl border ${colorMap[color] || colorMap.indigo}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/10",
    INACTIVE: "bg-gray-50 text-gray-600 border-gray-200 ring-gray-500/10",
  };

  const currentStyle = styles[status] || styles.INACTIVE;

  return (
    <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ring-1 ring-inset ${currentStyle}`}>
      {status}
    </span>
  );
};

const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>
      </div>
      <div className="p-6 max-h-[90vh] overflow-y-auto custom-scrollbar">{children}</div>
    </div>
  </div>
);




const Input = ({ label, error, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <div className="flex justify-between">
      <label className={`text-xs font-bold uppercase tracking-wide ${error ? "text-red-500" : "text-gray-500"}`}>
        {label}
      </label>
    </div>

    <input
      {...props}
      className={`
        w-full bg-gray-50 border rounded-lg px-4 py-2.5 text-sm transition-all placeholder:text-gray-400
        focus:bg-white focus:outline-none focus:ring-2 
        ${error
          ? "border-red-500 focus:ring-red-200 focus:border-red-500 bg-red-50/10"
          : "border-gray-200 focus:ring-indigo-500/20 focus:border-indigo-500"
        }
      `}
    />
    {error && (
      <span className="text-xs text-red-500 font-medium animate-in fade-in slide-in-from-top-1">
        {error}
      </span>
    )}
  </div>
);

const Select = ({ label, options, defaultValue, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
      {label}
    </label>
    <div className="relative">
      <select
        {...props}
        defaultValue={defaultValue}
        className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
      </div>
    </div>
  </div>
);

export default AssetList;