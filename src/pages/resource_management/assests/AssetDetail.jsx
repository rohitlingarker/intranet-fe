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
import { getAssetById } from "../services/ClientAssetService";

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
  const [editingItem, setEditingItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const today = new Date().toISOString().split("T")[0];

  /* ---------------- FETCH ASSETS ---------------- */

  const fetchAssets = async () => {
    try {
      const res = await getAssetsByClient(id);
      if (res.success) {
        setAssignments(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch assets", err);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [id]);

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
      <div className="flex justify-between items-center">
        <div className="flex gap-3 items-center">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft />
          </button>
          <div>
            <h1 className="text-xl font-bold">Client Assets</h1>
            <p className="text-sm text-gray-500">Client ID: {clientId}</p>
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

      {/* TABLE */}
      <div className="bg-white border rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Active Assignments</h2>

        <table className="w-full text-sm">
          <thead className="text-xs uppercase text-gray-500 border-b">
            <tr>
              <th className="text-left py-3">Asset</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {assignments.map((a) => (
              <tr key={a.id}>
                <td className="py-4 font-medium">{a.assetName}</td>
                <td>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[a.usage_status]}`}
                  >
                    {a.usage_status}
                  </span>
                </td>
                <td className="text-right flex justify-end gap-4">
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
            ))}
          </tbody>
        </table>
      </div>

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
    <div className="bg-white p-4 rounded-xl border shadow-sm flex justify-between">
      <div>
        <p className="text-xs text-gray-500 uppercase">{title}</p>
        <p
          className={`text-xl font-bold ${highlight || utilization ? utilColor : ""}`}
        >
          {value}
        </p>
      </div>
      <Icon className="text-indigo-600" />
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

export default AssetDetail;
