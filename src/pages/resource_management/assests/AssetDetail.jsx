import React, { useState, useEffect } from "react";
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
import Button from "../../../components/Button/Button";
import {
  getAssetsByClient,
  // updateClientAsset,
  // deleteClientAsset,
  getAssetById,
  assignClientAsset, // Make sure this is exported in your service file
  assignUpdateClientAsset,
  deleteClientAssignment,
} from "../services/clientservice";

/* ---------------- STATUS COLORS ---------------- */
// Matches your Java EnablementAssignmentStatus Enum values
const STATUS_COLORS = {
  ASSIGNED: "bg-blue-100 text-blue-700",
  IN_USE: "bg-green-100 text-green-700",
  RETURNED: "bg-gray-100 text-gray-700",
  LOST: "bg-red-100 text-red-700",
};

const AssetDetail = () => {
  const navigate = useNavigate();
  const { clientId, assetId } = useParams();
  const [asset, setAsset] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const today = new Date().toISOString().split("T")[0];
  const [activeTab, setActiveTab] = useState("ACTIVE");
  // ACTIVE | HISTORY

  const [formData, setFormData] = useState({
    resourceName: "",
    projectName: "",
    assignedDate: "",
    expectedReturnDate: "",
    assignmentStatus: "ASSIGNED",
    assignedBy: "",
    locationType: "Client Site",
    locationDetails: "",
    description: "",
    serialNumber: "",
  });
  const [returnModal, setReturnModal] = useState(false);
  const [returnItem, setReturnItem] = useState(null);

  const [returnData, setReturnData] = useState({
    resourceName: "",
    projectName: "",
    serialNumber: "",
    assignedBy: "",
    locationType: "Client Site",
    locationDetails: "",
    conditionOnReturn: "",
    returnNotes: "",
  });
  // const [returnData, setReturnData] = useState({
  // conditionOnReturn: "",
  // returnNotes: "",
  // });

  const handleReturnChange = (e) => {
    const { name, value } = e.target;
    setReturnData((prev) => ({ ...prev, [name]: value }));
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

      await fetchData();
      setReturnModal(false);
      setReturnItem(null);
      setReturnData({
        resourceName: "",
        projectName: "",
        serialNumber: "",
        assignedBy: "",
        locationType: "Client Site",
        locationDetails: "",
        conditionOnReturn: "",
        returnNotes: "",
      });
    } catch (err) {
      console.error("Return Submit Error:", err);
    }
  };

  /* ---------------- FETCH DATA ---------------- */
  const fetchData = async () => {
    try {
      console.log("Fetching for Asset ID:", assetId);

      const [assetRes, assignmentsRes] = await Promise.all([
        getAssetById(assetId),
        getAssetsByClient(clientId),
      ]);

      console.log("Asset Response:", assetRes);
      console.log("Assignments Response:", assignmentsRes);

      //
      // 1. Set the Master Asset
      if (assetRes.success) {
        setAsset(assetRes.data);
      }

      if (assignmentsRes.success && Array.isArray(assignmentsRes.data)) {
        const filtered = assignmentsRes.data.filter(
          (a) =>
            String(a.asset?.assetId) === String(assetId) && a.active !== false,
        );
        setAssignments(filtered);
      }

      // 2. Filter Assignments specifically for THIS asset
      // if (assignmentsRes.success && Array.isArray(assignmentsRes.data)) {
      //   console.log("Total records from server:", assignmentsRes.data.length);
      //   const validAssignments = assignmentsRes.data
      //   // const validAssignments = assignmentsRes.data.filter((a) => {
      //   //   // This handles both a.asset.assetId and a.assetId (common backend variations)
      //   //   const validAssignments = assignmentsRes.data.filter(
      //   //     (a) => String(a.asset?.assetId) === String(assetId),
      //   //   );

      //   //   // Log one to see what the data looks like
      //   //   // console.log(
      //   //   //   `Comparing Remote ID ${remoteId} with Local ID ${assetId}`,
      //   //   // );

      //   //   return String(a.asset?.assetId) === String(assetId);
      //   // });

      //   console.log("Filtered records for table:", {validAssignments});
      //   setAssignments(validAssignments);
      // }
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  useEffect(() => {
    if (clientId && assetId) fetchData();
  }, [clientId, assetId]);

  /* ---------------- KPI CALCULATIONS ---------------- */
  const TOTAL_STOCK = asset?.quantity || 0;

  const assignedCount = assignments.filter(
    (a) =>
      a.active === true &&
      a.assignmentStatus !== "RETURNED" &&
      a.assignmentStatus !== "LOST",
  ).length;

  const availableCount = Math.max(0, TOTAL_STOCK - assignedCount);
  const utilization =
    TOTAL_STOCK > 0 ? Math.round((assignedCount / TOTAL_STOCK) * 100) : 0;

  const activeAssignments = assignments.filter(
    (a) => a.assignmentStatus !== "RETURNED",
  );

  const returnedAssignments = assignments.filter(
    (a) => a.assignmentStatus === "RETURNED",
  );

  /* ---------------- HANDLERS ---------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAssignSave = async (e) => {
    e.preventDefault();

    const payload = {
      resourceName: formData.resourceName,
      projectName: formData.projectName,
      assignedDate: formData.assignedDate,
      expectedReturnDate: formData.expectedReturnDate,
      assignmentStatus: formData.assignmentStatus,
      assignedBy: formData.assignedBy,
      locationType: formData.locationType,
      locationDetails: formData.locationDetails,
      description: formData.description,
      serialNumber: formData.serialNumber,
      active: true,
      asset: { assetId: Number(assetId) },
    };

    try {
      if (editingAssignment) {
        // ✅ CORRECT API FOR EDIT
        await assignUpdateClientAsset(editingAssignment.assignmentId, payload);
      } else {
        // CREATE
        await assignClientAsset(payload);
      }

      await fetchData();
      closeModal();
    } catch (err) {
      console.error("Save Error:", err);
    }
  };

  const confirmDelete = async () => {
    console.log("Deleting assignment ID:", deleteTarget.assignmentId);
    try {
      await deleteClientAssignment(deleteTarget.assignmentId);

      // Remove from UI immediately
      setAssignments((prev) =>
        prev.filter((a) => a.assignmentId !== deleteTarget.assignmentId),
      );

      setDeleteTarget(null);
    } catch (err) {
      console.error("Delete Error:", err);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAssignment(null);
    setFormData({
      resourceName: "",
      projectName: "",
      assignedDate: "",
      expectedReturnDate: "",
      assignmentStatus: "ASSIGNED",
      assignedBy: "",
      locationType: "Client Site",
      locationDetails: "",
      description: "",
      serialNumber: "",
    });
  };

  const Detail = ({ label, value }) => (
    <div>
      <p className="text-xs text-gray-500 uppercase">{label}</p>
      <p className="font-medium text-gray-900">{value}</p>
    </div>
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div className="flex gap-3 items-start">
          <button
            onClick={() => navigate(-1)}
            className="mt-1 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft />
          </button>
          <div>
            <h1 className="text-2xl font-bold">
              {asset?.asset?.assetName || "Asset Detail"}
            </h1>

            <p className="text-sm text-gray-500">
              Category: {asset?.assetCategory || "-"}
            </p>
          </div>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          Assign Asset
        </Button>
      </div>

      {/* ASSET MASTER INFO */}
      {/* {asset && (
        <div className="bg-white border rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Asset Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <Detail label="Asset Name" value={asset.assetName} />
            <Detail label="Serial Number" value={asset.serialNumber || "-"} />
            <Detail label="Category" value={asset.assetCategory} />
            <Detail label="Total Stock" value={asset.quantity} />
            <Detail label="Type" value={asset.assetType} />
            <Detail label="Status" value={asset.status} />
          </div>
        </div>
      )} */}

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat title="Total Stock" value={TOTAL_STOCK} icon={Box} />
        <Stat title="Active Assignments" value={assignedCount} icon={Users} />
        <Stat
          title="Available"
          value={availableCount}
          icon={Laptop}
          highlight={availableCount > 0}
        />
        <Stat
          title="Utilization"
          value={`${utilization}%`}
          icon={Percent}
          utilization={utilization}
        />
      </div>

      <div className="flex border-b mb-4">
        <button
          onClick={() => setActiveTab("ACTIVE")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${
            activeTab === "ACTIVE"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-indigo-600"
          }`}
        >
          Active Assignments
        </button>

        <button
          onClick={() => setActiveTab("HISTORY")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${
            activeTab === "HISTORY"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-indigo-600"
          }`}
        >
          Assignment History
        </button>
      </div>

      {/* ASSIGNMENT HISTORY TABLE */}
      <div className="bg-white border rounded-xl shadow-sm p-6 overflow-hidden">
        <h2 className="text-lg font-semibold mb-4">Assignment History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-gray-500 border-b bg-gray-50">
              <tr>
                <th className="py-3 px-4 w-[20%]">Resource</th>
                <th className="py-3 px-4 w-[20%]">Project</th>
                <th className="py-3 px-4 w-[15%] text-center">Serial</th>
                <th className="py-3 px-4 w-[15%] text-center">Assigned</th>
                <th className="py-3 px-4 w-[15%] text-center">Status</th>
                <th className="py-3 px-4 w-[15%] text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {asset && asset.length > 0 ? (
                asset
                  .filter((a) =>
                    activeTab === "ACTIVE"
                      ? a.assignmentStatus !== "RETURNED"
                      : a.assignmentStatus === "RETURNED",
                  )
                  .map((a) => (
                    <tr
                      key={a.assignmentId}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-slate-700">
                        {a.resourceName}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {a.projectName}
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-slate-500 text-center">
                        {a.serialNumber || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-center">
                        {a.assignedDate}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center min-w-[70px] h-6 text-[10px] px-2 rounded-full font-bold uppercase ${STATUS_COLORS[a.assignmentStatus] || "bg-gray-100"}`}
                        >
                          {a.assignmentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {activeTab === "ACTIVE" ? (
                          <div className="flex justify-end gap-3">
                            <button
                              title="Edit Assignment"
                              onClick={() => {
                                setEditingAssignment(a);
                                setFormData({
                                  resourceName: a.resourceName || "",
                                  projectName: a.projectName || "",
                                  assignedDate: a.assignedDate || "",
                                  expectedReturnDate:
                                    a.expectedReturnDate || "",
                                  assignmentStatus:
                                    a.assignmentStatus || "ASSIGNED",
                                  assignedBy: a.assignedBy || "",
                                  locationType: a.locationType || "Client Site",
                                  locationDetails: a.locationDetails || "",
                                  description: a.description || "",
                                  serialNumber: a.serialNumber || "",
                                });
                                setShowModal(true);
                              }}
                              className="text-indigo-600 hover:text-indigo-900 transition-colors"
                            >
                              <Pencil size={16} />
                            </button>

                            {a.assignmentStatus !== "RETURNED" && (
                              <button
                                title="Mark as Returned"
                                onClick={() => {
                                  setReturnItem(a);
                                  setReturnData({
                                    resourceName: a.resourceName || "",
                                    projectName: a.projectName || "",
                                    serialNumber: a.serialNumber || "",
                                    assignedBy: a.assignedBy || "",
                                    locationType:
                                      a.locationType || "Client Site",
                                    locationDetails: a.locationDetails || "",
                                    conditionOnReturn: "",
                                    returnNotes: "",
                                  });
                                  setReturnModal(true);
                                }}
                                className="text-green-600 hover:text-green-900 transition-colors"
                              >
                                <RotateCcw size={16} />
                              </button>
                            )}

                            <button
                              title="Delete Record"
                              onClick={() => setDeleteTarget(a)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">
                            Returned Record
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400 gap-2">
                      <Box size={40} className="opacity-20" />
                      <p className="text-sm italic">
                        No assignments found for this asset.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <Modal
          title={editingAssignment ? "Edit Assignment" : "Assign Asset"}
          onClose={closeModal}
        >
          <form onSubmit={handleAssignSave} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Resource Name"
                name="resourceName"
                value={formData.resourceName}
                onChange={handleChange}
                required
              />
              <Input
                label="Project Name"
                name="projectName"
                value={formData.projectName}
                onChange={handleChange}
                required
              />
              <Input
                label="Serial Number"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleChange}
                required
              />
              <Input
                label="Assigned By"
                name="assignedBy"
                value={formData.assignedBy}
                onChange={handleChange}
                required
              />
              <Input
                label="Assigned Date"
                type="date"
                name="assignedDate"
                value={formData.assignedDate}
                onChange={handleChange}
                required
              />
              <Input
                label="Exp. Return"
                type="date"
                name="expectedReturnDate"
                value={formData.expectedReturnDate}
                onChange={handleChange}
              />
              <Select
                label="Status"
                name="assignmentStatus"
                value={formData.assignmentStatus}
                onChange={handleChange}
                options={["ASSIGNED", "IN_USE", "RETURNED", "LOST"]}
              />
              <Input
                label="Location Type"
                name="locationType"
                value={formData.locationType}
                onChange={handleChange}
              />
            </div>
            <div className="col-span-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-slate-50 border rounded-xl p-3 mt-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeModal}
                className="text-sm font-medium text-slate-500"
              >
                Cancel
              </button>
              <Button type="submit" variant="primary">
                Confirm
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {returnModal && returnItem && (
        <Modal title="Return Asset" onClose={() => setReturnModal(false)}>
          <form onSubmit={handleReturnSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Resource Name"
                name="resourceName"
                value={returnData.resourceName}
                onChange={handleReturnChange}
              />

              <Input
                label="Project"
                name="projectName"
                value={returnData.projectName}
                onChange={handleReturnChange}
              />

              <Input
                label="Serial Number"
                name="serialNumber"
                value={returnData.serialNumber}
                onChange={handleReturnChange}
              />

              <Input
                label="Assigned By"
                name="assignedBy"
                value={returnData.assignedBy}
                onChange={handleReturnChange}
              />

              <Input
                label="Location Type"
                name="locationType"
                value={returnData.locationType}
                onChange={handleReturnChange}
              />

              <Input
                label="Location Details"
                name="locationDetails"
                value={returnData.locationDetails}
                onChange={handleReturnChange}
              />

              {/* Auto-filled, not editable */}
              <Input label="Return Date" value={today} disabled />
            </div>

            <Select
              label="Condition on Return"
              name="conditionOnReturn"
              value={returnData.conditionOnReturn}
              onChange={handleReturnChange}
              options={["Good", "Damaged", "Needs Repair", "Lost"]}
            />

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">
                Return Notes
              </label>
              <textarea
                name="returnNotes"
                value={returnData.returnNotes}
                onChange={handleReturnChange}
                className="w-full bg-slate-50 border rounded-xl p-3 mt-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setReturnModal(false)}
                className="text-sm font-medium text-slate-500"
              >
                Cancel
              </button>
              <Button type="submit" variant="primary">
                Confirm Return
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* DELETE DIALOG */}
      {deleteTarget && (
        <Modal title="Confirm Delete" onClose={() => setDeleteTarget(null)}>
          <div className="space-y-4 text-center">
            <AlertTriangle className="mx-auto text-red-500" size={36} />
            <p className="text-slate-600">
              Are you sure you want to remove this record?
            </p>
            <div className="flex justify-center gap-4 pt-4">
              <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={confirmDelete}>
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

/* ---------------- HELPERS ---------------- */
const Stat = ({ title, value, icon: Icon, highlight, utilization }) => {
  const utilColor =
    utilization >= 80
      ? "text-green-600"
      : utilization >= 50
        ? "text-yellow-600"
        : "text-red-600";
  return (
    <div className="bg-white border rounded-xl p-5 shadow-sm flex justify-between items-center">
      <div>
        <p className="text-xs text-gray-400 uppercase">{title}</p>
        <p
          className={`text-2xl font-bold ${highlight ? "text-indigo-600" : utilization ? utilColor : ""}`}
        >
          {value}
        </p>
      </div>
      <div className="bg-indigo-50 p-3 rounded-lg">
        <Icon className="text-indigo-600" size={22} />
      </div>
    </div>
  );
};

const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
      <div className="flex justify-between items-center px-6 py-4 bg-slate-50 border-b">
        <h3 className="text-base font-semibold">{title}</h3>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600"
        >
          <X size={18} />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

const Input = ({ label, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">
      {label}
    </label>
    <input
      {...props}
      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-500 transition-all"
    />
  </div>
);

const Select = ({ label, options, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">
      {label}
    </label>
    <select
      {...props}
      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-500 appearance-none"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

export default AssetDetail;
