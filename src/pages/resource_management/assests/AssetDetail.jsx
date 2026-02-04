import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  RotateCcw,
  X,
  AlertTriangle,
  Box,
  Users,
  Laptop,
  Percent,
} from "lucide-react";
import Button from "../../../components/Button/Button"; // Ensure this path is correct
import {
  getClientAssetAssignments,
  assignClientAsset,
  assignUpdateClientAsset,
  deleteClientAssignment,
} from "../services/clientservice";
import { toast } from "react-toastify";

/* ---------------- CONSTANTS & STYLES ---------------- */

const STATUS_COLORS = {
  ASSIGNED: "bg-blue-100 text-blue-700",
  REQUESTED: "bg-yellow-100 text-yellow-700",
  RETURNED: "bg-slate-100 text-slate-600",
  REJECTED: "bg-red-100 text-red-700",
  LOST: "bg-red-100 text-red-700",
};

const COLOR_STYLES = {
  indigo: { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-100" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100" },
  amber: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100" },
  blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100" },
  rose: { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-100" },
  yellow: { bg: "bg-yellow-50", text: "text-yellow-600", border: "border-yellow-100" },
};

/* ---------------- SUB-COMPONENTS ---------------- */

const Stat = ({ title, value, icon: Icon, color = "indigo" }) => {
  const theme = COLOR_STYLES[color] || COLOR_STYLES.indigo;
  return (
    <div className={`bg-white border rounded-xl p-5 shadow-sm flex justify-between items-center transition-all hover:shadow-md ${theme.border}`}>
      <div>
        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">{title}</p>
        <p className={`text-2xl font-bold mt-1 ${theme.text}`}>{value}</p>
      </div>
      <div className={`${theme.bg} p-3 rounded-lg`}>
        <Icon className={theme.text} size={22} />
      </div>
    </div>
  );
};

const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col scale-100">
      <div className="flex justify-between items-center px-6 py-4 bg-slate-50 border-b rounded-t-2xl">
        <h3 className="text-base font-bold text-gray-800">{title}</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors">
          <X size={20} />
        </button>
      </div>
      <div className="p-6 overflow-y-auto">{children}</div>
    </div>
  </div>
);

const Input = ({ label, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">{label}</label>
    <input
      {...props}
      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
    />
  </div>
);

const Select = ({ label, options, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">{label}</label>
    <select
      {...props}
      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 appearance-none cursor-pointer"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

/* ---------------- MAIN COMPONENT ---------------- */

const AssetDetail = () => {
  const navigate = useNavigate();
  const { clientId, assetId } = useParams();
  
  // State
  const [assignments, setAssignments] = useState([]);
  const [masterAsset, setMasterAsset] = useState(null); // Stores the generic asset info (Name, Category)
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [activeTab, setActiveTab] = useState("ACTIVE"); // ACTIVE | HISTORY
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;
  const today = new Date().toISOString().split("T")[0];

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [returnModal, setReturnModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  
  // Editing / Action Items
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [returnItem, setReturnItem] = useState(null);

  // Forms
  const [formData, setFormData] = useState({
    resourceName: "", projectName: "", assignedDate: "", expectedReturnDate: "",
    assignmentStatus: "ASSIGNED", assignedBy: "", locationType: "", locationDetails: "",
    description: "", serialNumber: "",
  });

  const [returnData, setReturnData] = useState({
    conditionOnReturn: "Good", returnNotes: "",
  });

  /* ---------------- FETCH DATA ---------------- */
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getClientAssetAssignments(assetId);
      if (res.success && Array.isArray(res.data)) {
        setAssignments(res.data);
        // Extract master info from the first record if available, or maintain previous
        if (res.data.length > 0 && res.data[0].asset) {
          setMasterAsset(res.data[0].asset);
        }
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      toast.error("Failed to load asset details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (assetId) fetchData();
  }, [assetId]);

  /* ---------------- KPI CALCULATIONS ---------------- */
  const totalStock = masterAsset?.quantity || 0;
  
  const activeAssignmentsList = assignments.filter(
    (a) => a.active === true && a.assignmentStatus !== "RETURNED" && a.assignmentStatus !== "LOST"
  );
  
  const assignedCount = activeAssignmentsList.length;
  const availableCount = Math.max(0, totalStock - assignedCount);
  const utilization = totalStock > 0 ? Math.round((assignedCount / totalStock) * 100) : 0;

  const getUtilizationColor = (rate) => {
    if (rate >= 80) return "emerald";
    if (rate >= 50) return "yellow";
    return "rose";
  };

  /* ---------------- TABLE FILTERING & PAGINATION ---------------- */
  const filteredAssignments = useMemo(() => {
    return assignments
      .filter((a) => activeTab === "ACTIVE" ? a.assignmentStatus !== "RETURNED" : a.assignmentStatus === "RETURNED")
      .filter((a) => {
        const search = searchTerm.toLowerCase();
        return (
          a.resourceName?.toLowerCase().includes(search) ||
          a.projectName?.toLowerCase().includes(search) ||
          a.serialNumber?.toLowerCase().includes(search)
        );
      });
  }, [assignments, activeTab, searchTerm]);

  const totalPages = Math.ceil(filteredAssignments.length / rowsPerPage);
  
  // Reset page when tab or search changes
  useEffect(() => setCurrentPage(1), [activeTab, searchTerm]);

  const paginatedAssignments = filteredAssignments.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  /* ---------------- HANDLERS ---------------- */
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleReturnChange = (e) => {
    const { name, value } = e.target;
    setReturnData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAssignSave = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      active: true,
      asset: { assetId: assetId },
    };

    try {
      if (editingAssignment) {
        await assignUpdateClientAsset(editingAssignment.assignmentId, payload);
        toast.success("Assignment updated successfully");
      } else {
        await assignClientAsset(payload);
        toast.success("Asset assigned successfully");
      }
      await fetchData();
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save record");
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    try {
      await assignUpdateClientAsset(returnItem.assignmentId, {
        ...returnItem,
        ...returnData,
        assignmentStatus: "RETURNED",
        actualReturnDate: today,
      });
      toast.success("Asset marked as returned");
      await fetchData();
      setReturnModal(false);
      setReturnItem(null);
    } catch (err) {
      toast.error("Failed to return asset");
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteClientAssignment(deleteTarget.assignmentId);
      toast.success("Record deleted");
      await fetchData();
      setDeleteTarget(null);
    } catch (err) {
      toast.error("Failed to delete record");
    }
  };

  const openEditModal = (a) => {
    setEditingAssignment(a);
    setFormData({
      resourceName: a.resourceName || "",
      projectName: a.projectName || "",
      assignedDate: a.assignedDate || "",
      expectedReturnDate: a.expectedReturnDate || "",
      assignmentStatus: a.assignmentStatus || "ASSIGNED",
      assignedBy: a.assignedBy || "",
      locationType: a.locationType || "",
      locationDetails: a.locationDetails || "",
      description: a.description || "",
      serialNumber: a.serialNumber || "",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAssignment(null);
    setFormData({
      resourceName: "", projectName: "", assignedDate: "", expectedReturnDate: "",
      assignmentStatus: "ASSIGNED", assignedBy: "", locationType: "", locationDetails: "",
      description: "", serialNumber: "",
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div className="flex gap-3 items-center">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white rounded-full hover:shadow-sm text-slate-500 hover:text-indigo-600 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {masterAsset?.assetName || "Asset Detail"}
            </h1>
            <p className="text-sm text-slate-500">
              Category: <span className="font-medium">{masterAsset?.assetCategory || "Unknown"}</span>
            </p>
          </div>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          Assign Asset
        </Button>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat title="Total Stock" value={totalStock} icon={Box} color="blue" />
        <Stat title="Active Assignments" value={assignedCount} icon={Users} color="emerald" />
        <Stat title="Available" value={availableCount} icon={Laptop} color="amber" />
        <Stat title="Utilization" value={`${utilization}%`} icon={Percent} color={getUtilizationColor(utilization)} />
      </div>

      {/* TABS & SEARCH */}
      <div className="flex flex-col sm:flex-row justify-between items-center border-b gap-4">
        <div className="flex gap-6 w-full sm:w-auto">
          {["ACTIVE", "HISTORY"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2 py-3 text-sm font-semibold border-b-2 transition-all ${
                activeTab === tab
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-indigo-600"
              }`}
            >
              {tab === "ACTIVE" ? "Active Assignments" : "Assignment History"}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-auto mb-2 sm:mb-0">
          <input
            type="text"
            placeholder="Search assignments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 pl-3 pr-8 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-gray-500 border-b bg-gray-50/50">
              <tr>
                <th className="py-3 px-4 text-center">Resource</th>
                <th className="py-3 px-4 text-center">Project</th>
                <th className="py-3 px-4 text-center">Serial</th>
                <th className="py-3 px-4 text-center">Assigned</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-400">Loading data...</td>
                </tr>
              ) : paginatedAssignments.length > 0 ? (
                paginatedAssignments.map((a) => (
                  <tr key={a.assignmentId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-700">{a.resourceName}</td>
                    <td className="py-3 px-4 text-slate-600">{a.projectName}</td>
                    <td className="py-3 px-4 text-xs font-mono text-slate-500 text-center">{a.serialNumber || "-"}</td>
                    <td className="py-3 px-4 text-slate-600 text-center">{a.assignedDate}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center justify-center min-w-[80px] py-1 px-2 rounded-full text-[10px] font-bold uppercase tracking-wide ${STATUS_COLORS[a.assignmentStatus] || "bg-gray-100 text-gray-600"}`}>
                        {a.assignmentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {activeTab === "ACTIVE" ? (
                        <div className="flex justify-center gap-2">
                          <button onClick={() => openEditModal(a)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit">
                            <Pencil size={16} />
                          </button>
                          <button 
                            onClick={() => { setReturnItem(a); setReturnModal(true); }} 
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" 
                            title="Return"
                          >
                            <RotateCcw size={16} />
                          </button>
                          <button onClick={() => setDeleteTarget(a)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Read Only</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400 gap-3">
                      <div className="bg-slate-50 p-3 rounded-full">
                        <Box size={24} className="opacity-40" />
                      </div>
                      <p className="text-sm">No assignments found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-2 text-sm">
          <span className="text-gray-500">
            Page <span className="font-semibold text-gray-700">{currentPage}</span> of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-3 py-1.5 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-3 py-1.5 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* --- MODALS --- */}

      {/* ASSIGN / EDIT MODAL */}
      {showModal && (
        <Modal title={editingAssignment ? "Edit Assignment" : "Assign Asset"} onClose={closeModal}>
          <form onSubmit={handleAssignSave} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Resource Name" name="resourceName" value={formData.resourceName} onChange={handleFormChange} required />
              <Input label="Project Name" name="projectName" value={formData.projectName} onChange={handleFormChange} required />
              <Input label="Serial Number" name="serialNumber" value={formData.serialNumber} onChange={handleFormChange} required />
              <Input label="Assigned By" name="assignedBy" value={formData.assignedBy} onChange={handleFormChange} required />
              <Input label="Assigned Date" type="date" name="assignedDate" value={formData.assignedDate} onChange={handleFormChange} required />
              <Input label="Exp. Return" type="date" name="expectedReturnDate" value={formData.expectedReturnDate} onChange={handleFormChange} />
              <Select label="Status" name="assignmentStatus" value={formData.assignmentStatus} onChange={handleFormChange} options={["ASSIGNED", "REQUESTED", "RETURNED", "REJECTED"]} />
              <Input label="Location Type" name="locationType" value={formData.locationType} onChange={handleFormChange} />
              <div className="col-span-1 sm:col-span-2">
                <Input label="Location Details" name="locationDetails" value={formData.locationDetails} onChange={handleFormChange} />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 mt-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700">Cancel</button>
              <Button type="submit" variant="primary">Confirm</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* RETURN MODAL */}
      {returnModal && returnItem && (
        <Modal title="Return Asset" onClose={() => setReturnModal(false)}>
          <form onSubmit={handleReturnSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Resource" value={returnItem.resourceName} disabled />
              <Input label="Project" value={returnItem.projectName} disabled />
              <Input label="Serial Number" value={returnItem.serialNumber} disabled />
              <Input label="Return Date" value={today} disabled />
            </div>
            <Select label="Condition on Return" name="conditionOnReturn" value={returnData.conditionOnReturn} onChange={handleReturnChange} options={["Good", "Damaged", "Needs Repair", "Lost"]} />
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Return Notes</label>
              <textarea
                name="returnNotes"
                value={returnData.returnNotes}
                onChange={handleReturnChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 mt-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setReturnModal(false)} className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700">Cancel</button>
              <Button type="submit" variant="primary">Confirm Return</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* DELETE DIALOG */}
      {deleteTarget && (
        <Modal title="Confirm Delete" onClose={() => setDeleteTarget(null)}>
          <div className="space-y-4 text-center">
            <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="text-red-500" size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Delete Assignment?</h3>
            <p className="text-slate-600 text-sm">
              Are you sure you want to remove the assignment for <span className="font-bold">{deleteTarget.resourceName}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3 pt-4">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 font-medium text-sm">
                Cancel
              </button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm shadow-sm">
                Delete Record
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AssetDetail;