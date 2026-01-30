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
  createClientAsset,
  updateClientAsset,
  deleteClientAsset,
} from "../services/ClientAssetService";
import { getAssetById } from "../services/clientservice";

/* ---------------- STATUS COLORS ---------------- */

const STATUS_COLORS = {
  Assigned: "bg-blue-100 text-blue-700",
  "In Use": "bg-green-100 text-green-700",
  Returned: "bg-gray-100 text-gray-700",
  Lost: "bg-red-100 text-red-700",
};

/* ---------------- MAIN COMPONENT ---------------- */

const AssetDetail = () => {
  const navigate = useNavigate();
  // const { id } = useParams(); // clientId
  const { clientId, assetId } = useParams();
  const [asset, setAsset] = useState(null);

  const [assignments, setAssignments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    resourceName: "",
    projectName: "",
    assignedDate: "",
    expectedReturnDate: "",
    usageStatus: "Assigned",
    assignedBy: "",
    locationType: "Client Site",
    locationDetails: "",
    remarks: "",
  });

  /* ---------------- FETCH ASSETS ---------------- */

  const fetchAssets = async () => {
    try {
      const res = await getAssetsByClient(clientId);
      if (res.success) {
        const validAssignments = res.data.filter(
          (a) => a && (a.resourceName || a.projectName),
        );
        setAssignments(validAssignments);
      }
    } catch (err) {
      console.error("Failed to fetch assets", err);
    }
  };

  useEffect(() => {
    if (clientId) fetchAssets();
  }, [clientId]);

  const fetchAsset = async () => {
    try {
      const res = await getAssetById(assetId);
      if (res.success) {
        setAsset(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch asset", err);
    }
  };

  useEffect(() => {
    fetchAsset();
  }, [assetId]);

  /* ---------------- KPI CALCULATIONS ---------------- */

  const TOTAL_QUANTITY = assignments.reduce(
    (sum, a) => sum + (a.quantity || 0),
    0,
  );

  const assignedCount = assignments.length;
  const availableCount = TOTAL_QUANTITY - assignedCount;

  const utilization =
    TOTAL_QUANTITY > 0 ? Math.round((assignedCount / TOTAL_QUANTITY) * 100) : 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------------- SAVE (CREATE / UPDATE) ---------------- */

  const handleSave = async (e) => {
    e.preventDefault();
    const f = e.target;

    const payload = {
      client: { clientId },
      assetName: f.resource_name.value,
      description: f.remarks.value,
      assetCategory: "DEVICE",
      assetType: "Laptop",
      quantity: 1,
    };

    try {
      if (editingItem) {
        await updateClientAsset(editingItem.id, payload);
      } else {
        await createClientAsset(payload);
      }

      await fetchAssets();
      setShowModal(false);
      setEditingItem(null);
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  /* ---------------- RETURN ASSET ---------------- */

  const handleReturn = async (item) => {
    try {
      await updateClientAsset(item.id, {
        ...item,
        usage_status: "Returned",
        actual_return_date: today,
      });
      await fetchAssets();
    } catch (err) {
      console.error("Return failed", err);
    }
  };

  // const handleAssignSave = async (e) =>

  // {showModal && (
  //   <Modal title="Assign Asset" onClose={() => setShowModal(false)}>
  //     <form onSubmit={handleAssignSave} className="space-y-4">

  //       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

  <Input
    label="Resource Name"
    name="resourceName"
    value={editingAssignment ? formData.resourceName : asset?.assetName || ""}
    onChange={handleChange}
    disabled={!editingAssignment}
  />;

  //         <Input
  //           label="Project Name"
  //           name="projectName"
  //           value={formData.projectName}
  //           onChange={handleChange}
  //           required
  //         />

  //         <Input
  //           label="Assigned Date"
  //           type="date"
  //           name="assignedDate"
  //           value={formData.assignedDate}
  //           onChange={handleChange}
  //           required
  //         />

  //         <Input
  //           label="Expected Return Date"
  //           type="date"
  //           name="expectedReturnDate"
  //           value={formData.expectedReturnDate}
  //           onChange={handleChange}
  //         />

  //         <Select
  //           label="Usage Status"
  //           name="usageStatus"
  //           value={formData.usageStatus}
  //           onChange={handleChange}
  //           options={["Assigned", "In Use", "Returned", "Lost"]}
  //         />

  //         <Input
  //           label="Assigned By"
  //           name="assignedBy"
  //           value={formData.assignedBy}
  //           onChange={handleChange}
  //         />

  //         <Select
  //           label="Location Type"
  //           name="locationType"
  //           value={formData.locationType}
  //           onChange={handleChange}
  //           options={["Client Site", "Office", "Remote"]}
  //         />

  //         <Input
  //           label="Location Details"
  //           name="locationDetails"
  //           value={formData.locationDetails}
  //           onChange={handleChange}
  //         />
  //       </div>

  //       <div>
  //         <label className="text-sm font-medium">Remarks</label>
  //         <textarea
  //           name="remarks"
  //           value={formData.remarks}
  //           onChange={handleChange}
  //           className="w-full border rounded-lg p-2 mt-1"
  //           rows={3}
  //         />
  //       </div>

  //       <div className="flex justify-end gap-3 pt-4">
  //         <Button variant="secondary" onClick={() => setShowModal(false)}>
  //           Cancel
  //         </Button>
  //         <Button type="submit" variant="primary">
  //           Save
  //         </Button>
  //       </div>
  //     </form>
  //   </Modal>
  // )}

  const handleAssignSave = async (e) => {
    e.preventDefault();

    const payload = {
      projectName: formData.projectName,
      assignedDate: formData.assignedDate,
      expectedReturnDate: formData.expectedReturnDate,
      usageStatus: formData.usageStatus,
      assignedBy: formData.assignedBy,
      locationType: formData.locationType,
      locationDetails: formData.locationDetails,
      remarks: formData.remarks,
    };

    try {
      if (editingAssignment) {
        // UPDATE
        await updateClientAsset(editingAssignment.id, payload);
      } else {
        // CREATE
        await createClientAsset({
          client: { clientId },
          asset: { assetId },
          resourceName: formData.resourceName,
          ...payload,
        });
      }

      await fetchAssets();
      setShowModal(false);
      setEditingAssignment(null);

      setFormData({
        resourceName: "",
        projectName: "",
        assignedDate: "",
        expectedReturnDate: "",
        usageStatus: "Assigned",
        assignedBy: "",
        locationType: "Client Site",
        locationDetails: "",
        remarks: "",
      });
    } catch (err) {
      console.error("Assignment save failed", err);
    }
  };

  /* ---------------- DELETE ASSET ---------------- */

  const confirmDelete = async () => {
    try {
      await deleteClientAsset(deleteTarget.id);
      await fetchAssets();
      setDeleteTarget(null);
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const Detail = ({ label, value }) => (
    <div>
      <p className="text-xs text-gray-500 uppercase">{label}</p>
      <p className="font-medium text-gray-900">{value}</p>
    </div>
  );

  /* ---------------- UI ---------------- */

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div className="flex gap-3 items-start">
          <button onClick={() => navigate(-1)} className="mt-1">
            <ArrowLeft />
          </button>

          <div>
            <h1 className="text-2xl font-bold">
              {asset?.assetName || "Asset"}
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

      {/* ASSET DETAILS SECTION */}
      {asset && (
        <div className="bg-white border rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Asset Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <Detail label="Asset Name" value={asset.assetName} />
            <Detail label="Serial Number" value={asset.serialNumber || "-"} />
            <Detail label="Category" value={asset.assetCategory} />
            <Detail label="Type" value={asset.assetType} />
            <Detail label="Quantity" value={asset.quantity} />
            <Detail label="Status" value={asset.status} />
            <Detail label="Description" value={asset.description || "-"} />
          </div>
        </div>
      )}

      {/* KPI SECTION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat title="Total Quantity" value={TOTAL_QUANTITY} icon={Box} />
        <Stat title="Currently Assigned" value={assignedCount} icon={Users} />
        <Stat
          title="Available"
          value={availableCount}
          icon={Laptop}
          highlight
        />
        <Stat
          title="Utilization"
          value={`${utilization}%`}
          icon={Percent}
          utilization={utilization}
        />
      </div>

      <div className="bg-white border rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Active Assignments</h2>

        <table className="w-full text-sm">
          <thead className="text-xs uppercase text-gray-500 border-b bg-gray-50">
            <tr>
              <th className="text-left py-3 px-2">Resource</th>
              <th className="text-left py-3 px-2">Project</th>
              <th className="text-left py-3 px-2">Assigned</th>
              <th className="text-left py-3 px-2">Expected Return</th>
              <th className="text-left py-3 px-2">Location</th>
              <th className="text-left py-3 px-2">Status</th>
              <th className="text-right py-3 px-2">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {assignments && assignments.length > 0 ? (
              assignments.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="py-3 px-2 font-medium">
                    {a.resourceName || "—"}
                  </td>
                  <td className="py-3 px-2">{a.projectName || "—"}</td>
                  <td className="py-3 px-2">{a.assignedDate || "—"}</td>
                  <td className="py-3 px-2">{a.expectedReturnDate || "—"}</td>
                  <td className="py-3 px-2">{a.locationDetails || "—"}</td>
                  <td className="py-3 px-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        STATUS_COLORS[a.usageStatus || a.usage_status]
                      }`}
                    >
                      {a.usageStatus || a.usage_status}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right flex justify-end gap-3">
                    <Pencil
                      size={16}
                      className="cursor-pointer text-indigo-600"
                      onClick={() => {
                        setEditingAssignment(a);
                        setFormData({
                          resourceName: a.resourceName || "",
                          projectName: a.projectName || "",
                          assignedDate: a.assignedDate || "",
                          expectedReturnDate: a.expectedReturnDate || "",
                          usageStatus:
                            a.usageStatus || a.usage_status || "Assigned",
                          assignedBy: a.assignedBy || "",
                          locationType: a.locationType || "Client Site",
                          locationDetails: a.locationDetails || "",
                          remarks: a.remarks || "",
                        });
                        setShowModal(true);
                      }}
                    />
                    <RotateCcw
                      size={16}
                      className="cursor-pointer text-green-600"
                      onClick={() => handleReturn(a)}
                    />
                    <Trash2
                      size={16}
                      className="cursor-pointer text-red-600"
                      onClick={() => setDeleteTarget(a)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-10 text-gray-400">
                  No assignments yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ASSIGN ASSET MODAL */}
      {showModal && (
        <Modal
          title={editingAssignment ? "Edit Assignment" : "Assign Asset"}
          onClose={() => {
            setShowModal(false);
            setEditingAssignment(null);
          }}
        >
          <form onSubmit={handleAssignSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Resource Name"
                value={asset?.assetName || ""}
                disabled
              />

              <Input
                label="Project Name"
                name="projectName"
                value={formData.projectName}
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
                label="Expected Return Date"
                type="date"
                name="expectedReturnDate"
                value={formData.expectedReturnDate}
                onChange={handleChange}
              />

              <Select
                label="Usage Status"
                name="usageStatus"
                value={formData.usageStatus}
                onChange={handleChange}
                options={["Assigned", "In Use", "Returned", "Lost"]}
              />

              <Input
                label="Assigned By"
                name="assignedBy"
                value={formData.assignedBy}
                onChange={handleChange}
              />

              <Select
                label="Location Type"
                name="locationType"
                value={formData.locationType}
                onChange={handleChange}
                options={["Client Site", "Office", "Remote"]}
              />

              <Input
                label="Location Details"
                name="locationDetails"
                value={formData.locationDetails}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Remarks</label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                className="w-full border rounded-lg p-2 mt-1"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowModal(false);
                  setEditingAssignment(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* DELETE MODAL */}
      {deleteTarget && (
        <Modal title="Confirm Delete" onClose={() => setDeleteTarget(null)}>
          <div className="space-y-4 text-center">
            <AlertTriangle className="mx-auto text-red-500" size={36} />
            <p>Delete this asset?</p>
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

/* ---------------- UI HELPERS ---------------- */

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
          className={`text-2xl font-bold ${highlight || utilization ? utilColor : ""}`}
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
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl w-full max-w-xl shadow-lg">
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="text-lg font-semibold">{title}</h3>
        <button onClick={onClose}>
          <X />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

const Input = ({ label, ...props }) => (
  <div>
    <label className="text-sm font-medium">{label}</label>
    <input {...props} className="w-full border rounded-lg p-2 mt-1" />
  </div>
);

const Select = ({ label, options, ...props }) => (
  <div>
    <label className="text-sm font-medium">{label}</label>
    <select {...props} className="w-full border rounded-lg p-2 mt-1">
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

export default AssetDetail;
