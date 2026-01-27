import React, { useState, useMemo } from "react";
import { Users, Briefcase, Activity, DollarSign, Search } from "lucide-react";
import Button from "../../../../components/Button/Button";
import Modal from "../../../../components/Modal/modal";
import CreateClient from "../../models/CreateClient";
import { Plus } from "lucide-react";

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
  }, // Added as a bonus KPI
];

const clients = [
  {
    name: "Acme Corporation",
    type: "Enterprise",
    priority: "High",
    region: "North America",
  },
  {
    name: "FinEdge Solutions",
    type: "Startup",
    priority: "Medium",
    region: "India",
  },
  {
    name: "Globex Systems",
    type: "SMB",
    priority: "Low",
    region: "Europe",
  },
  {
    name: "NextGen Soft",
    type: "Enterprise",
    priority: "High",
    region: "Asia Pacific",
  },
];

const priorityColor = {
  High: "text-red-600 bg-red-50",
  Medium: "text-yellow-600 bg-yellow-50",
  Low: "text-green-600 bg-green-50",
};

const AdminPannel = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredClients = useMemo(() => {
    if (!searchTerm) return clients;

    const term = searchTerm.toLowerCase();

    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(term) ||
        client.priority.toLowerCase().includes(term) ||
        client.region.toLowerCase().includes(term) ||
        client.type.toLowerCase().includes(term),
    );
  }, [searchTerm]);

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Client Overview
        </h1>
        <p className="text-sm text-gray-500">
          Monitor clients, priorities, and engagement status
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {KPI_DATA.map((kpi, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between transition-hover hover:shadow-md"
          >
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                {kpi.label}
              </p>
              <h3 className="text-2xl font-bold text-gray-900">{kpi.value}</h3>
            </div>
            <div className={`p-3 rounded-full ${kpi.bg}`}>
              <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Client Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Clients Information
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Search */}
          <div className="flex items-center gap-3 max-w-md w-full">
            <div className="relative w-full">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by name, priority, region or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Create Client Button */}
          <Button
            size="medium"
            variant="primary"
            className="flex items-center gap-2 font-medium"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Create Client
          </Button>
        </div>

        {filteredClients.length === 0 ? (
          <div className="text-sm text-gray-500 italic font-semibold bg-white border rounded-lg p-6">
            No clients match your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredClients.map((client, index) => (
              <div
                key={index}
                className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition"
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-gray-900">{client.name}</h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      priorityColor[client.priority]
                    }`}
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {
        isModalOpen && (
          <Modal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Create Client"
            subtitle="Fill out the form below to create a new client"
            children={<CreateClient />}
          />
        )
      }
    </div>
  );
};

export default AdminPannel;
