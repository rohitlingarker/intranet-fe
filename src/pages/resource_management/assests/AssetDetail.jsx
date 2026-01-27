import React, { useState } from "react";
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
  Percent
} from "lucide-react";
import Button from "../../../components/Button/Button";

/* ---------------- CONSTANTS ---------------- */

const TOTAL_QUANTITY = 25;

/* ---------------- MOCK DATA ---------------- */

const initialAssignments = [
  {
    id: 1,
    resource_name: "John Doe",
    project_name: "Project Alpha",
    assigned_date: "2024-01-20",
    expected_return_date: "2025-01-20",
    actual_return_date: "",
    usage_status: "In Use",
    asset_location_type: "Client Site",
    asset_location_details: "Singapore",
    assigned_by: "Admin",
    remarks: "",
  },
  {
    id: 2,
    resource_name: "Jane Smith",
    project_name: "Project Beta",
    assigned_date: "2024-02-15",
    expected_return_date: "2025-02-15",
    actual_return_date: "",
    usage_status: "In Use",
    asset_location_type: "Employee Home",
    asset_location_details: "Mumbai",
    assigned_by: "Admin",
    remarks: "",
  },
];

const STATUS_COLORS = {
  Assigned: "bg-blue-100 text-blue-700",
  "In Use": "bg-green-100 text-green-700",
  Returned: "bg-gray-100 text-gray-700",
  Lost: "bg-red-100 text-red-700",
};

/* ---------------- MAIN COMPONENT ---------------- */

const AssetDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [assignments, setAssignments] = useState(initialAssignments);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const today = new Date().toISOString().split("T")[0];

  /* ---------------- KPI CALCULATIONS ---------------- */

  const assignedCount = assignments.length;
  const availableCount = TOTAL_QUANTITY - assignedCount;

  const utilization =
    TOTAL_QUANTITY > 0
      ? Math.round((assignedCount / TOTAL_QUANTITY) * 100)
      : 0;

  /* ---------------- SAVE ASSIGNMENT ---------------- */

  const handleSave = (e) => {
    e.preventDefault();
    const f = e.target;

    const payload = {
      id: editingItem ? editingItem.id : Date.now(),
      resource_name: f.resource_name.value,
      project_name: f.project_name.value,
      assigned_date: f.assigned_date.value,
      expected_return_date: f.expected_return_date.value,
      actual_return_date: f.actual_return_date?.value || "",
      usage_status: f.usage_status.value,
      asset_location_type: f.asset_location_type.value,
      asset_location_details: f.asset_location_details.value,
      assigned_by: f.assigned_by.value,
      remarks: f.remarks.value,
    };

    setAssignments((prev) =>
      editingItem
        ? prev.map((a) => (a.id === editingItem.id ? payload : a))
        : [...prev, payload]
    );

    setShowModal(false);
    setEditingItem(null);
  };

  /* ---------------- RETURN ---------------- */

  const handleReturn = (item) => {
    setEditingItem({
      ...item,
      usage_status: "Returned",
      actual_return_date: today,
    });
    setShowModal(true);
  };

  /* ---------------- DELETE ---------------- */

  const confirmDelete = () => {
    setAssignments((prev) => prev.filter((a) => a.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div className="flex gap-3 items-center">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft />
          </button>
          <div>
            <h1 className="text-xl font-bold">MacBook Pro 16-inch</h1>
            <p className="text-sm text-gray-500">Category: DEVICE</p>
          </div>
        </div>

        <Button
          variant="primary"
          onClick={() => {
            setEditingItem(null);
            setShowModal(true);
          }}
        >
          Assign Asset
        </Button>
      </div>

      {/* KPI SECTION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat title="Total Quantity" value={TOTAL_QUANTITY} icon={Box} />
        <Stat title="Currently Assigned" value={assignedCount} icon={Users} />
        <Stat title="Available" value={availableCount} icon={Laptop} highlight />
        <Stat
          title="Utilization"
          value={`${utilization}%`}
          icon={Percent}
          utilization={utilization}
        />
      </div>

      {/* ASSIGNMENTS TABLE */}
      <div className="bg-white border rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Active Assignments</h2>

        <table className="w-full text-sm">
          <thead className="text-xs uppercase text-gray-500 border-b">
            <tr>
              <th className="text-left py-3">Resource</th>
              <th>Project</th>
              <th>Assigned</th>
              <th>Expected Return</th>
              <th>Location</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {assignments.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="py-4 font-medium">{a.resource_name}</td>
                <td>{a.project_name}</td>
                <td>{a.assigned_date}</td>
                <td>{a.expected_return_date}</td>
                <td>{a.asset_location_details}</td>
                <td>
                  <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[a.usage_status]}`}>
                    {a.usage_status}
                  </span>
                </td>
                <td className="text-right">
                  <div className="flex justify-end gap-4">
                    <Pencil
                      size={16}
                      className="cursor-pointer text-indigo-600"
                      title="Edit"
                      onClick={() => {
                        setEditingItem(a);
                        setShowModal(true);
                      }}
                    />
                    <RotateCcw
                      size={16}
                      className="cursor-pointer text-green-600"
                      title="Return Asset"
                      onClick={() => handleReturn(a)}
                    />
                    <Trash2
                      size={16}
                      className="cursor-pointer text-red-600"
                      title="Delete"
                      onClick={() => setDeleteTarget(a)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODALS */}
      {showModal && (
        <Modal
          title={editingItem ? "Update Assignment" : "Assign Asset"}
          onClose={() => {
            setShowModal(false);
            setEditingItem(null);
          }}
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input name="resource_name" label="Resource Name" defaultValue={editingItem?.resource_name} required />
              <Input name="project_name" label="Project Name" defaultValue={editingItem?.project_name} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input type="date" name="assigned_date" label="Assigned Date" defaultValue={editingItem?.assigned_date} required />
              <Input type="date" name="expected_return_date" label="Expected Return Date" defaultValue={editingItem?.expected_return_date} required />
            </div>

            {editingItem?.usage_status === "Returned" && (
              <Input type="date" name="actual_return_date" label="Actual Return Date" defaultValue={today} required />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select name="usage_status" label="Usage Status" options={["Assigned", "In Use", "Returned", "Lost"]} defaultValue={editingItem?.usage_status} />
              <Input name="assigned_by" label="Assigned By" defaultValue={editingItem?.assigned_by} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select name="asset_location_type" label="Location Type" options={["Client Site", "Employee Home", "Office", "Data Center"]} defaultValue={editingItem?.asset_location_type} />
              <Input name="asset_location_details" label="Location Details" defaultValue={editingItem?.asset_location_details} />
            </div>

            <Textarea name="remarks" label="Remarks" defaultValue={editingItem?.remarks} />

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button variant="primary" type="submit">Save</Button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Confirm Delete" onClose={() => setDeleteTarget(null)}>
          <div className="space-y-4 text-center">
            <AlertTriangle className="mx-auto text-red-500" size={36} />
            <p>Delete assignment for <strong>{deleteTarget.resource_name}</strong>?</p>
            <div className="flex justify-center gap-4 pt-4">
              <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button variant="danger" onClick={confirmDelete}>Delete</Button>
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
    <div className="bg-white p-4 rounded-xl border shadow-sm flex justify-between items-center">
      <div>
        <p className="text-xs text-gray-500 uppercase">{title}</p>
        <p className={`text-xl font-bold ${utilization !== undefined ? utilColor : highlight ? "text-green-600" : ""}`}>
          {value}
        </p>
      </div>
      <div className="bg-indigo-50 p-2 rounded-lg">
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

const Textarea = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <textarea {...props} className="w-full border rounded-lg px-3 py-2 text-sm" />
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

export default AssetDetail;
