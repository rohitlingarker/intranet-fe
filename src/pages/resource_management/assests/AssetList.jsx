import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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

/* ---------------- MOCK DATA ---------------- */

const initialAssets = [
  {
    id: 1,
    asset_name: "MacBook Pro 16-inch",
    asset_category: "DEVICE",
    asset_type: "Laptop",
    quantity: 25,
    assigned: 23,
    status: "Active",
  },
  {
    id: 2,
    asset_name: "Microsoft Office 365",
    asset_category: "SOFTWARE",
    asset_type: "License",
    quantity: 50,
    assigned: 45,
    status: "Active",
  },
];

/* ---------------- MAIN COMPONENT ---------------- */

const AssetList = () => {
  const navigate = useNavigate();

  const [assets, setAssets] = useState(initialAssets);
  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);

  /* ---------------- KPI CALCULATIONS ---------------- */

  const totalAssets = assets.reduce((s, a) => s + a.quantity, 0);
  const assignedAssets = assets.reduce((s, a) => s + a.assigned, 0);
  const availableAssets = totalAssets - assignedAssets;

  const utilization =
    totalAssets > 0 ? Math.round((assignedAssets / totalAssets) * 100) : 0;

  /* ---------------- SEARCH ---------------- */

  const filteredAssets = assets.filter(
    (a) =>
      a.asset_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.asset_category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.asset_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* ---------------- ADD / EDIT HANDLER ---------------- */

  const handleSaveAsset = (e) => {
    e.preventDefault();
    const form = e.target;

    const payload = {
      id: editingAsset ? editingAsset.id : Date.now(),
      asset_name: form.asset_name.value,
      asset_category: form.asset_category.value,
      asset_type: form.asset_type.value,
      quantity: Number(form.quantity.value),
      assigned: editingAsset ? editingAsset.assigned : 0,
      status: "Active",
    };

    setAssets((prev) =>
      editingAsset
        ? prev.map((a) => (a.id === editingAsset.id ? payload : a))
        : [...prev, payload]
    );

    setShowModal(false);
    setEditingAsset(null);
    form.reset();
  };

  /* ---------------- DELETE HANDLER ---------------- */

  const confirmDelete = () => {
    setAssets((prev) => prev.filter((a) => a.id !== deleteTarget.id));
    setDeleteTarget(null);
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
              Client: Acme Corporation • Region: NA
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

  {/* HEADER + SEARCH */}
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-lg font-semibold">Asset Inventory</h2>

    <div className="relative">
      <input
        className="
          w-64 pl-9 pr-3 py-2 text-sm
          border rounded-lg
          focus:outline-none
          focus:ring-2 focus:ring-indigo-500
        "
        placeholder="Search assets..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    </div>
  </div>

  <table className="w-full text-sm border-separate border-spacing-y-1">
    <thead className="text-xs uppercase text-gray-500">
      <tr>
        <th className="text-left py-3 px-3">Asset Name</th>
        <th className="px-3">Category</th>
        <th className="px-3">Type</th>
        <th className="px-3 text-center">Quantity</th>
        <th className="px-3 text-center">Status</th>
        <th className="px-3 text-right">Actions</th>
        <th className="w-6"></th>
      </tr>
    </thead>

   <tbody>
  {filteredAssets.length ? (
    filteredAssets.map((asset) => (
      <tr
        key={asset.id}
        onClick={() => navigate(`/assets/${asset.id}`)}
        className="
          relative group cursor-pointer
          transition
          hover:bg-indigo-50
        "
      >
        {/* ASSET NAME (with accent via pseudo effect) */}
        <td className="py-4 px-3 font-medium text-gray-900 relative">
          <span
            className="
              absolute left-0 top-0 h-full w-1
              bg-indigo-500
              opacity-0
              group-hover:opacity-100
              rounded-r
            "
          />
          <span className="pl-2 block">{asset.asset_name}</span>
        </td>

        <td className="px-3 text-gray-600">{asset.asset_category}</td>
        <td className="px-3 text-gray-600">{asset.asset_type}</td>

        <td className="px-3 text-center">{asset.quantity}</td>

        <td className="px-3 text-center">
          <StatusBadge status={asset.status} />
        </td>

        {/* ACTIONS + CHEVRON (SAME COLUMN) */}
        <td
          className="px-3 text-right"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-end gap-4">
            <Pencil
  size={16}
  className="
    cursor-pointer
    text-indigo-500
    opacity-80
    hover:opacity-100
    hover:scale-110
    transition
  "
  title="Edit Asset"
  onClick={() => {
    setEditingAsset(asset);
    setShowModal(true);
  }}
/>

<Trash2
  size={16}
  className="
    cursor-pointer
    text-red-500
    opacity-80
    hover:opacity-100
    hover:scale-110
    transition
  "
  title="Delete Asset"
  onClick={() => setDeleteTarget(asset)}
/>


            {/* Chevron */}
            <span
              className="
                ml-2
                text-gray-300
                transition-all
                group-hover:text-green-600
                group-hover:translate-x-1
                font-bold
              "
            >
              ›
            </span>
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
              defaultValue={editingAsset?.asset_name}
              required
            />
            <Select
              label="Asset Category"
              name="asset_category"
              options={["DEVICE", "SOFTWARE", "ACCESS", "TOOLS"]}
              defaultValue={editingAsset?.asset_category}
            />
            <Select
              label="Asset Type"
              name="asset_type"
              options={[
                "Laptop",
                "Mobile",
                "License",
                "VPN",
                "VDI",
                "Token",
                "Tool",
              ]}
              defaultValue={editingAsset?.asset_type}
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
              Are you sure you want to delete{" "}
              <strong>{deleteTarget.asset_name}</strong>?
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

/* ---------------- UI COMPONENTS ---------------- */

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
    Active: "bg-green-100 text-green-700",
    Retired: "bg-gray-100 text-gray-700",
    Lost: "bg-red-100 text-red-700",
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
    <label className="block text-sm font-medium mb-1">{label}</label>
    <input {...props} className="w-full border rounded-lg px-3 py-2 text-sm" />
  </div>
);

const Select = ({ label, options, defaultValue, ...props }) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <select
      {...props}
      defaultValue={defaultValue}
      className="w-full border rounded-lg px-3 py-2 text-sm"
      required
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  </div>
);

export default AssetList;
