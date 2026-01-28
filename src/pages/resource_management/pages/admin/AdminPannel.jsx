import React, { useState, useMemo } from "react";
import { Users, Briefcase, Activity, DollarSign } from "lucide-react";
import Button from "../../../../components/Button/Button";
import Modal from "../../../../components/Modal/modal";
import CreateClient from "../../models/CreateClient";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import FilterBar from "../../components/filters/FilterBar";

/* ===== KPI DATA ===== */
const KPI_DATA = [
  {
    label: "Total Clients",
    value: "124",
    icon: Users,
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  {
    label: "Active Clients",
    value: "86",
    icon: Activity,
    color: "text-green-600",
    bg: "bg-green-100",
  },
  {
    label: "Active Projects",
    value: "42",
    icon: Briefcase,
    color: "text-purple-600",
    bg: "bg-purple-100",
  },
  {
    label: "Total Revenue",
    value: "$1.2M",
    icon: DollarSign,
    color: "text-emerald-600",
    bg: "bg-emerald-100",
  },
];

/* ===== MOCK CLIENT DATA ===== */
const clientsData = [
  {
    name: "Acme Corporation",
    type: "Enterprise",
    priority: "High",
    region: "North America",
    status: "Active",
  },
  {
    name: "FinEdge Solutions",
    type: "Startup",
    priority: "Medium",
    region: "India",
    status: "Inactive",
  },
  {
    name: "Globex Systems",
    type: "SMB",
    priority: "Low",
    region: "Europe",
    status: "Active",
  },
  {
    name: "NextGen Soft",
    type: "Enterprise",
    priority: "High",
    region: "Asia Pacific",
    status: "Active",
  },
];

const priorityColor = {
  High: "text-red-600 bg-red-50",
  Medium: "text-yellow-600 bg-yellow-50",
  Low: "text-green-600 bg-green-50",
};

const AdminPannel = () => {
  const navigate = useNavigate();

  /* ===== CLIENT STATE ===== */
  const [clients, setClients] = useState(clientsData);

  /* ===== FILTER STATE (maps directly to backend DTO) ===== */
  const [filters, setFilters] = useState({
    search: "",
    region: "",
    type: "",
    priority: "",
    status: "",
    startDate: "",
    endDate: "",
  });

  const handleFilterUpdate = (updates) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  /* ===== CREATE CLIENT MODAL ===== */
  const [openCreateClient, setOpenCreateClient] = useState(false);

  /* ===== FILTERED CLIENTS ===== */
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const matchesSearch =
        !filters.search ||
        client.name.toLowerCase().includes(filters.search.toLowerCase());

      const matchesRegion =
        !filters.region || client.region === filters.region;

      const matchesType =
        !filters.type || client.type === filters.type;

      const matchesPriority =
        !filters.priority || client.priority === filters.priority;

      const matchesStatus =
        !filters.status || client.status === filters.status;

      return (
        matchesSearch &&
        matchesRegion &&
        matchesType &&
        matchesPriority &&
        matchesStatus
      );
    });
  }, [clients, filters]);

  return (
    <div className="p-6 space-y-8">
      {/* ===== HEADER ===== */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Client Overview
        </h1>
        <p className="text-sm text-gray-500">
          Monitor clients, priorities, and engagement status
        </p>
      </div>

      {/* ===== KPI CARDS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {KPI_DATA.map((kpi, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-xl shadow-sm border flex items-center justify-between hover:shadow-md transition"
          >
            <div>
              <p className="text-sm text-gray-500">{kpi.label}</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {kpi.value}
              </h3>
            </div>
            <div className={`p-3 rounded-full ${kpi.bg}`}>
              <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* ===== CLIENT SECTION ===== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Clients Information
          </h2>

          <Button
            onClick={() => setOpenCreateClient(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg flex items-center"
          >
            <Plus className="w-4 h-4 mr-1" />
            Create New Client
          </Button>
        </div>

        {/* ===== FILTER BAR ===== */}
        <FilterBar
          filters={filters}
          onUpdate={handleFilterUpdate}
          totalResults={filteredClients.length}
        />

        {/* ===== CLIENT CARDS ===== */}
        {filteredClients.length === 0 ? (
          <div className="bg-white border rounded-lg p-6 text-sm text-gray-500 italic">
            No clients match your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredClients.map((client, index) => (
              <div
                key={index}
                onClick={() =>
                  navigate(`/resource-management/client-details/${index}`)
                }
                className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-gray-900">
                    {client.name}
                  </h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${priorityColor[client.priority]}`}
                  >
                    {client.priority}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <p>
                    <span className="font-medium text-gray-800">Type:</span>{" "}
                    {client.type}
                  </p>
                  <p>
                    <span className="font-medium text-gray-800">Region:</span>{" "}
                    {client.region}
                  </p>
                  <p>
                    <span className="font-medium text-gray-800">Status:</span>{" "}
                    {client.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== CREATE CLIENT MODAL ===== */}
      <Modal
        isOpen={openCreateClient}
        onClose={() => setOpenCreateClient(false)}
        title="Create New Client"
        subtitle="Fill in the details to add a new client"
      >
        <CreateClient onSuccess={() => setOpenCreateClient(false)} />
      </Modal>
    </div>
  );
};

export default AdminPannel;
