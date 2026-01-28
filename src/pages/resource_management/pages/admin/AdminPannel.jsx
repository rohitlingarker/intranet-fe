import React, { useState, useMemo, useEffect } from "react";
import { Users, Briefcase, Activity, DollarSign, Search } from "lucide-react";
import Button from "../../../../components/Button/Button";
import Modal from "../../../../components/Modal/modal";
import CreateClient from "../../models/CreateClient";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { useAuth } from "../../../../contexts/AuthContext";
import { getClients } from "../../services/clientservice";
import { toast } from "react-toastify";
import LoadingSpinner from "../../../../components/LoadingSpinner";

const priorityColor = {
  HIGH: "text-red-600 bg-red-50",
  MEDIUM: "text-yellow-600 bg-yellow-50",
  LOW: "text-green-600 bg-green-50",
};

const AdminPannel = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const permissions = user?.permissions || [];
  const canCreateClient = permissions.includes("CREATE_CLIENT");
  const [clientDetails, setClientDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  /* ===== CREATE CLIENT MODAL ===== */
  const [openCreateClient, setOpenCreateClient] = useState(false);
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
      value: clientDetails.length,
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

  const fetchClients = async () => {
    setLoading(true);
    try {
      const data = await getClients();
      setClientDetails(data.data);
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to fetch clients. Please try again later.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  /* ===== FILTERED CLIENTS ===== */
  const filteredClients = useMemo(() => {
    if (!searchTerm) return clientDetails;

    const term = searchTerm.toLowerCase();

    return clientDetails.filter(
      (client) =>
        client.client_name.toLowerCase().includes(term) ||
        client.priority_level.toLowerCase().includes(term) ||
        client.country_name.toLowerCase().includes(term) ||
        client.client_type.toLowerCase().includes(term),
    );
  }, [searchTerm, clientDetails]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner text="Loading Client Details..." />
      </div>
    );
  }

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

      {/* ===== KPIs ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {KPI_DATA.map((kpi, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-xl shadow-sm border flex items-center justify-between hover:shadow-md transition"
          >
            <div>
              <p className="text-sm text-gray-500">{kpi.label}</p>
              <h3 className="text-2xl font-bold text-gray-900">{kpi.value}</h3>
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

          {canCreateClient && (
            <div className="flex gap-3">
              <Button
                onClick={() => setOpenCreateClient(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" /> Create New Client
              </Button>
            </div>
          )}
        </div>

        {/* ===== SEARCH ===== */}
        <div className="max-w-md relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by name, priority, region or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {/* ===== CLIENT CARDS ===== */}
        {filteredClients.length === 0 ? (
          <div className="bg-white border rounded-lg p-6 text-sm text-gray-500 italic font-semibold">
            No clients match your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredClients.map((client) => (
              <div
                key={client.clientId}
                onClick={() =>
                  navigate(
                    `/resource-management/client-details/${client.clientId}`,
                  )
                }
                className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-gray-900">
                    {client.client_name}
                  </h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${priorityColor[client.priority_level]}`}
                  >
                    {client.priority_level}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <p>
                    <span className="font-medium text-gray-800">Type:</span>{" "}
                    {client.client_type}
                  </p>
                  <p>
                    <span className="font-medium text-gray-800">Region:</span>{" "}
                    {client.country_name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Client */}
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
