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
} from "lucide-react";
import Button from "../../../components/Button/Button";
import toast from "react-hot-toast";

import {
  getAssetsByClient,
  createClientAsset,
  updateClientAsset,
  deleteClientAsset,
} from "../services/ClientAssetService";

/* ---------------- MAIN COMPONENT ---------------- */

const AssetList = () => { // ✅ clientId from route
  const navigate = useNavigate();
  const { clientId } = useParams(); // ✅ clientId from route

  const [assets, setAssets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

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

  useEffect(() => {
    fetchAssets();
  }, [clientId]);

  /* ---------------- KPI CALCULATIONS ---------------- */

  const totalAssets = assets.reduce((s, a) => s + a.quantity, 0);
  const assignedAssets = assets.reduce((s, a) => s + (a.assigned || 0), 0);
  const availableAssets = totalAssets - assignedAssets;

  const utilization =
    totalAssets > 0 ? Math.round((assignedAssets / totalAssets) * 100) : 0;

  /* ---------------- SEARCH ---------------- */

  const filteredAssets = assets.filter(
    (a) =>
      a.assetName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.assetCategory?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.assetType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* ---------------- ADD / EDIT ---------------- */

  const handleSaveAsset = async (e) => {
    e.preventDefault();
    const form = e.target;

    const payload = {
      client: { clientId },
      assetName: form.asset_name.value,
      assetCategory: form.asset_category.value,
      assetType: form.asset_type.value,
      quantity: Number(form.quantity.value),
    };

    try {
      if (editingAsset) {
        await updateClientAsset(editingAsset.assetId, payload);
        toast.success("Asset updated successfully");
      } else {
        await createClientAsset(payload);
        toast.success("Asset added successfully");
      }

      setShowModal(false);
      setEditingAsset(null);
      await fetchAssets();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save asset");
    }
  };

  /* ---------------- DELETE ---------------- */

  const confirmDelete = async () => {
    try {
      await deleteClientAsset(deleteTarget.assetId);
      toast.success("Asset deleted successfully");
      setDeleteTarget(null);
      await fetchAssets();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete asset");
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white border rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Asset Management
            </h1>
            <p className="text-sm text-gray-500">
              Client Assets
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          className="flex items-center gap-2"
          onClick={() => setShowModal(true)}
        >
          <Plus size={16} />
          Add Asset
        </Button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi title="Total Assets" value={totalAssets} icon={Box} />
        <Kpi title="Assigned Assets" value={assignedAssets} icon={Users} />
        <Kpi title="Available Assets" value={availableAssets} icon={Laptop} />
        <Kpi
          title="Asset Utilization"
          value={`${utilization}%`}
          icon={Users}
          highlight={utilization}
        />
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Asset Inventory</h2>

          <div className="relative">
            <input
              className="w-64 pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <table className="w-full text-sm">
          <thead className="text-xs uppercase text-gray-500">
            <tr>
              <th className="text-left py-3">Asset Name</th>
              <th>Category</th>
              <th>Type</th>
              <th className="text-center">Quantity</th>
              <th className="text-center">Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredAssets.length ? (
              filteredAssets.map((asset) => (
                <tr
                  key={asset.assetId}
                  className="hover:bg-indigo-50 cursor-pointer"
                >
                  <td className="py-4 font-medium">{asset.assetName}</td>
                  <td>{asset.assetCategory}</td>
                  <td>{asset.assetType}</td>
                  <td className="text-center">{asset.quantity}</td>
                  <td className="text-center">
                    <StatusBadge status={asset.status} />
                  </td>
                  <td className="text-right">
                    <div className="flex justify-end gap-4">
                      <Pencil
                        size={16}
                        className="cursor-pointer text-indigo-500"
                        onClick={() => {
                          setEditingAsset(asset);
                          setShowModal(true);
                        }}
                      />
                      <Trash2
                        size={16}
                        className="cursor-pointer text-red-500"
                        onClick={() => setDeleteTarget(asset)}
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-10 text-center text-gray-400">
                  No assets found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <Modal
          title={editingAsset ? "Edit Asset" : "Add Asset"}
          onClose={() => {
            setShowModal(false);
            setEditingAsset(null);
          }}
        >
          <form onSubmit={handleSaveAsset} className="space-y-4">
            <Input
              label="Asset Name"
              name="asset_name"
              defaultValue={editingAsset?.assetName}
              required
            />
            <Select
              label="Asset Category"
              name="asset_category"
              options={["DEVICE", "SOFTWARE", "ACCESS", "TOOLS"]}
              defaultValue={editingAsset?.assetCategory}
            />
            <Select
              label="Asset Type"
              name="asset_type"
              options={["Laptop", "Mobile", "License", "VPN", "Tool"]}
              defaultValue={editingAsset?.assetType}
            />
            <Input
              label="Quantity"
              name="quantity"
              type="number"
              min="1"
              defaultValue={editingAsset?.quantity}
              required
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* DELETE CONFIRMATION */}
      {deleteTarget && (
        <Modal title="Confirm Deletion" onClose={() => setDeleteTarget(null)}>
          <div className="space-y-4 text-center">
            <AlertTriangle className="mx-auto text-red-500" size={36} />
            <p>
              Delete <strong>{deleteTarget.assetName}</strong>?
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

/* ---------------- UI HELPERS ---------------- */

const Kpi = ({ title, value, icon: Icon, highlight }) => {
  const color =
    highlight >= 80
      ? "text-green-600"
      : highlight >= 50
      ? "text-yellow-600"
      : "text-red-600";

  return (
    <div className="bg-white p-4 rounded-xl border shadow-sm flex justify-between">
      <div>
        <p className="text-xs text-gray-500 uppercase">{title}</p>
        <p className={`text-xl font-bold ${highlight ? color : ""}`}>
          {value}
        </p>
      </div>
      <div className="bg-indigo-50 p-2 rounded-lg">
        <Icon className="text-indigo-600" />
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const map = {
    ACTIVE: "bg-green-100 text-green-700",
    INACTIVE: "bg-gray-100 text-gray-700",
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[status]}`}>
      {status}
    </span>
  );
};

const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl w-full max-w-lg shadow-lg">
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="text-lg font-semibold">{title}</h3>
        <button onClick={onClose}><X /></button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

const Input = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <input {...props} className="w-full border rounded-lg px-3 py-2 text-sm" />
  </div>
);

const Select = ({ label, options, defaultValue, ...props }) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <select {...props} defaultValue={defaultValue} className="w-full border rounded-lg px-3 py-2 text-sm">
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  </div>
);

export default AssetList;
