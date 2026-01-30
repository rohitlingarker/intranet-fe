import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Globe,
  FileText,
  CheckCircle2,
  ShieldCheck,
  Users,
  Box,
  MoreHorizontal,
  Briefcase,
  AlertTriangle,
  Package,
} from "lucide-react";
import ClientSection from "./ClientSection";
import AddConfigurationModal from "../models/client_configuration/AddConfigurationModal";
import Button from "../../../components/Button/Button";
import { useAuth } from "../../../contexts/AuthContext";
import { toast } from "react-toastify";
import { getClientById } from "../services/clientservice";
import { createClientSLA, createClientCompliance, createClientEscalation } from "../services/clientservice";

// --- Mock Data: Client with Multiple Projects ---
const MOCK_CLIENT_DATA = {
  id: "1",
  name: "Acme Corporation",
  industry: "Manufacturing",
  region: "North America",
  tier: "Strategic Partner",
  stats: {
    totalProjects: 3,
    activeSLA: "99.9%",
    riskScore: "Low",
  },
  kpis: [
    {
      label: "Active Projects",
      value: "12",
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      label: "Total Spend",
      value: "$450k",
      icon: Box,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      label: "Satisfaction",
      value: "98%",
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      label: "Pending Issues",
      value: "2",
      icon: AlertTriangle,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
  ],
  projects: [
    {
      id: 101,
      name: "Global SAP Migration",
      status: "In Progress",
      type: "Fixed Cost",
      manager: "Sarah Jenkins",
      health: "On Track",
      description:
        "Migration of legacy ERP systems to SAP S/4HANA across 4 regions.",
      // Specific details for THIS project
      hasSLA: true,
      hasCompliance: true,
      hasAssets: false,
      hasEscalation: true,
      slaData: { uptime: "99.9%", responseTime: "1hr", coverage: "24/7" },
      assetsData: [],
    },
    {
      id: 102,
      name: "Q3 Staff Augmentation",
      status: "Active",
      type: "T&M",
      manager: "Mike Ross",
      health: "At Risk", // Interesting data point
      description:
        "Providing 5 senior React developers for internal dashboard tools.",
      // Different configuration
      hasSLA: false, // Staff aug might not have an SLA
      hasCompliance: true,
      hasAssets: true,
      hasEscalation: true,
      assetsData: [
        { name: "MacBook Pro M2", serial: "FVX992", assignedTo: "Dev 1" },
        { name: "MacBook Pro M2", serial: "FVX993", assignedTo: "Dev 2" },
      ],
    },
    {
      id: 103,
      name: "Security Audit 2025",
      status: "Planning",
      type: "Consulting",
      manager: "David Kim",
      health: "On Track",
      description:
        "Annual external security assessment and penetration testing.",
      // Minimal config
      hasSLA: false,
      hasCompliance: true,
      hasAssets: false,
      hasEscalation: false,
    },
  ],
};

/* ---------------- SUB COMPONENTS ---------------- */

const SectionHeader = ({ title, subtitle }) => (
  <div className="mb-6">
    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
  </div>
);

const ProjectSLA = ({ data }) => (
  <div className="animate-fadeIn">
    <SectionHeader
      title="Service Level Agreement"
      subtitle="Contractual obligations and metrics."
    />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
        <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">
          Uptime Guarantee
        </p>
        <p className="text-2xl font-bold text-gray-900 mt-1">
          {data?.uptime || "N/A"}
        </p>
      </div>
      <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
        <p className="text-xs font-bold text-purple-600 uppercase tracking-wide">
          Response Time
        </p>
        <p className="text-2xl font-bold text-gray-900 mt-1">
          {data?.responseTime || "N/A"}
        </p>
      </div>
      <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
        <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide">
          Support Coverage
        </p>
        <p className="text-2xl font-bold text-gray-900 mt-1">
          {data?.coverage || "N/A"}
        </p>
      </div>
    </div>
    <div className="bg-white border rounded-lg overflow-hidden">
      <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
        <h4 className="font-medium text-gray-900">Recent Breach Incidents</h4>
        <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
          Download Report
        </button>
      </div>
      <div className="p-8 text-center text-gray-500 text-sm italic">
        No SLA breaches recorded in the last 90 days.
      </div>
    </div>
  </div>
);

const ProjectCompliance = () => (
  <div className="animate-fadeIn">
    <SectionHeader
      title="Compliance & Security"
      subtitle="Required certifications and audit status."
    />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {["GDPR Data Privacy", "SOC2 Type II", "ISO 27001", "HIPAA"].map(
        (item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-4 border rounded-lg bg-white hover:shadow-sm transition"
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-green-600" />
              <span className="font-medium text-gray-900">{item}</span>
            </div>
            <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full">
              COMPLIANT
            </span>
          </div>
        ),
      )}
    </div>
  </div>
);

const ProjectAssets = ({ assets }) => (
  <div className="animate-fadeIn">
    <SectionHeader
      title="Assigned Assets"
      subtitle="Hardware and licenses allocated to this project."
    />
    {assets && assets.length > 0 ? (
      <div className="overflow-hidden border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Asset Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Serial / ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assigned User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {assets.map((asset, idx) => (
              <tr key={idx}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {asset.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                  {asset.serial}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {asset.assignedTo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    Deployed
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <div className="text-center p-6 border-2 border-dashed rounded-lg text-gray-400">
        No assets assigned
      </div>
    )}
  </div>
);

const ProjectEscalation = () => (
  <div className="animate-fadeIn">
    <SectionHeader
      title="Escalation Matrix"
      subtitle="Emergency contacts for critical issues."
    />
    <div className="space-y-4">
      {/* Level 1 */}
      <div className="flex items-start gap-4 p-4 border-l-4 border-blue-500 bg-white rounded-r-lg shadow-sm">
        <div className="p-2 bg-blue-50 rounded-full text-blue-600 font-bold text-lg w-10 h-10 flex items-center justify-center">
          1
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-gray-900 uppercase">
            Level 1 - Project Manager
          </h4>
          <p className="text-lg font-medium text-gray-800 mt-1">
            Michael Scott
          </p>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            <span>michael.s@acme.com</span>
            <span>•</span>
            <span>+1 (555) 019-2834</span>
          </div>
        </div>
      </div>
      {/* Level 2 */}
      <div className="flex items-start gap-4 p-4 border-l-4 border-orange-500 bg-white rounded-r-lg shadow-sm">
        <div className="p-2 bg-orange-50 rounded-full text-orange-600 font-bold text-lg w-10 h-10 flex items-center justify-center">
          2
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-gray-900 uppercase">
            Level 2 - Delivery Head
          </h4>
          <p className="text-lg font-medium text-gray-800 mt-1">Jan Levinson</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            <span>jan.l@acme.com</span>
            <span>•</span>
            <span>+1 (555) 998-2122</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* ---------------- MAIN PAGE ---------------- */

const ClientPage = () => {
  const { clientId } = useParams();
  const { user } = useAuth();
  const permissions = user?.permissions || [];
  const canConfigAgreements = permissions.includes("ADD_CONFIGURATION");
  const canManageAssets = permissions.includes("ASSETS_MANAGEMENT");
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [openConfigModal, setOpenConfigModal] = useState(false);
  const [clientDetails, setClientDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [slaRefetchKey, setSLARefetchKey] = useState(0);
  const [complianceRefetchKey, setComplianceRefetchKey] = useState(0);
  const [escalationRefetchKey, setEscalationRefetchKey] = useState(0);

  const fetchClientDetails = async () => {
    setLoading(true);
    try {
      const data = await getClientById(clientId);
      setClientDetails(data.data);
      console.log("Fetched Client Details:", data.data);
    } catch (error) {
      toast.error("Failed to fetch client details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clientId) fetchClientDetails();
  }, [clientId]);

  const handleSLACreate = async (data) => {
    setLoading(true);
    try {
      const res = await createClientSLA(data);
      toast.success(res.message || "SLA created successfully");
      setSLARefetchKey((prev) => prev + 1);
    } catch (res) {
      toast.error(res.response?.data?.message || "Failed to create SLA");
    } finally {
      setLoading(false);
    }
  };

  const handleComplianceCreate = async (data) => {
    setLoading(true);
    try {
      const res = await createClientCompliance(data);
      toast.success(res.message || "Compliance created successfully");
      setComplianceRefetchKey((prev) => prev + 1);
    } catch (res) {
      toast.error(res.response?.data?.message || "Failed to create Compliance");
    } finally {
      setLoading(false);
    }
  };

  const handleEscalationCreate = async (data) => {
    setLoading(true);
    try {
      const res = await createClientEscalation(data);
      toast.success(res.message || "Escalation created successfully");
      setEscalationRefetchKey((prev) => prev + 1);
    } catch (res) {
      toast.error(res.response?.data?.message || "Failed to create Escalation");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfiguration = async ({ type, data }) => {
    if (type === "slas") {
      await handleSLACreate(data);
    } else if (type === "compliances") {
      await handleComplianceCreate(data);
    } else if (type === "escalations"){
      await handleEscalationCreate(data);
    } else {
      toast.error("Unknown configuration type");
    }
    setOpenConfigModal(false);
  };

  useEffect(() => {
    setSelectedProject(MOCK_CLIENT_DATA.projects[0]);
    setActiveTab(MOCK_CLIENT_DATA.projects[0].hasSLA ? "sla" : "compliance");
  }, []);

  // Determine available tabs for the selected project
  const getTabs = () => {
    if (!selectedProject) return [];
    const tabs = [];
    if (selectedProject.hasSLA)
      tabs.push({ id: "sla", label: "SLA & Metrics", icon: ActivityIcon });
    if (selectedProject.hasCompliance)
      tabs.push({ id: "compliance", label: "Compliance", icon: ShieldCheck });
    if (selectedProject.hasAssets)
      tabs.push({ id: "assets", label: "Assets", icon: Box });
    if (selectedProject.hasEscalation)
      tabs.push({ id: "escalation", label: "Escalation", icon: Users });
    return tabs;
  };

  const ActivityIcon = CheckCircle2; // Just a helper for the array above

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-100 transition shadow-sm"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              {clientDetails.client_name}
            </h1>
            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
              <span className="flex items-center gap-1">
                <Globe size={14} /> {clientDetails.country_name}
              </span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span className="flex items-center gap-1">
                <Briefcase size={14} /> {clientDetails.client_type}
              </span>
            </div>
          </div>
        </div>

        {/* Client Level Stats */}
        <div className="flex gap-4">
          {/* <div className="text-right px-4 border-r border-gray-200">
            <p className="text-xs text-gray-500 font-semibold uppercase">
              Total Projects
            </p>
            <p className="text-xl font-bold text-gray-900">
              {MOCK_CLIENT_DATA.stats.totalProjects}
            </p>
          </div> */}
          <div className="text-right pl-2">
            <p className="text-xs text-gray-500 font-semibold uppercase">
              Overall Health
            </p>
            <p className="text-xl font-bold text-green-600">Healthy</p>
          </div>
        </div>
      </div>

      {/* 2. Client KPI's */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10 mb-15">
        {MOCK_CLIENT_DATA.kpis.map((kpi, idx) => (
          <div
            key={idx}
            className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                {kpi.label}
              </p>
              <h3 className="text-xl font-bold text-gray-900 mt-1">
                {kpi.value}
              </h3>
            </div>
            <div className={`p-2 rounded-lg ${kpi.bg}`}>
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
            </div>
          </div>
        ))}
      </div>

      {(canConfigAgreements || canManageAssets) && (
        <div className="flex justify-end gap-3 mt-5">
          {(canConfigAgreements &&
            (clientDetails.compliance ||
              clientDetails.SLA ||
              clientDetails.escalationContact)) && (
              <Button
                variant="primary"
                onClick={() => setOpenConfigModal(true)}
                className="px-4 py-2 text-sm border rounded-lg"
              >
                + Add Configuration
              </Button>
            )}

          {canManageAssets && (
            <Button
              variant="secondary"
              onClick={() => navigate(`/manage-assets/${clientId}`)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
            >
              <Package size={16} />
              Manage Assets
            </Button>
          )}
        </div>
      )}

      {(clientDetails.compliance ||
        clientDetails.SLA ||
        clientDetails.escalationContact) && (
        <div className="mt-8 mb-10">
          <ClientSection clientDetails={clientDetails} slaRefetchKey={slaRefetchKey} complianceRefetchKey={complianceRefetchKey} escalationRefetchKey={escalationRefetchKey} />
        </div>
      )}

      {/* <div className="border-t border-gray-300"></div> */}

      <div className="grid grid-cols-12 gap-8 mt-10">
        {/* 2. LEFT SIDE: Project List (The Menu) */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Projects</h2>
            <button className="text-sm text-indigo-600 font-medium hover:underline">
              + New Project
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {MOCK_CLIENT_DATA.projects.map((project) => (
              <div
                key={project.id}
                onClick={() => {
                  setSelectedProject(project);
                  setActiveTab(project.hasSLA ? "sla" : "compliance"); // Reset tab logic
                }}
                className={`group cursor-pointer relative p-5 rounded-xl border transition-all duration-200 ${
                  selectedProject?.id === project.id
                    ? "bg-white border-indigo-600 ring-1 ring-indigo-600 shadow-md"
                    : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3
                    className={`font-semibold ${selectedProject?.id === project.id ? "text-indigo-900" : "text-gray-900"}`}
                  >
                    {project.name}
                  </h3>
                  {selectedProject?.id === project.id && (
                    <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Status</span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        project.status === "Active" ||
                        project.status === "In Progress"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Type</span>
                    <span className="text-gray-900 font-medium">
                      {project.type}
                    </span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-400 line-clamp-2">
                      {project.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PROJECT DETAILS */}
        <div className="col-span-8 bg-white border rounded-xl shadow-sm">
          {selectedProject ? (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm min-h-[600px] flex flex-col">
              {/* Project Header */}
              <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50 rounded-t-xl">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedProject.name}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Managed by{" "}
                    <span className="font-medium text-gray-900">
                      {selectedProject.manager}
                    </span>
                  </p>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreHorizontal />
                </button>
              </div>

              {/* Dynamic Tabs */}
              <div className="flex border-b border-gray-200 px-6">
                {getTabs().map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? "border-indigo-600 text-indigo-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                  </button>
                ))}
                {/* Fallback if no tabs */}
                {getTabs().length === 0 && (
                  <div className="py-4 text-sm text-gray-400 italic">
                    No detailed configurations available
                  </div>
                )}
              </div>

              {/* Tab Content Area */}
              <div className="p-8 flex-1 bg-white rounded-b-xl">
                {activeTab === "sla" && (
                  <ProjectSLA data={selectedProject.slaData} />
                )}
                {activeTab === "compliance" && <ProjectCompliance />}
                {activeTab === "assets" && (
                  <ProjectAssets assets={selectedProject.assetsData} />
                )}
                {activeTab === "escalation" && <ProjectEscalation />}

                {/* Fallback/Empty State for Tabs */}
                {!activeTab && getTabs().length > 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <FileText size={48} className="mb-4 text-gray-200" />
                    <p>Select a category above to view details.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
              <Building2 size={64} className="mb-4 text-gray-300" />
              <p className="text-lg font-medium text-gray-500">
                Select a project to view details
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Configuration (SINGLE DYNAMIC MODAL) */}
      <AddConfigurationModal
        open={openConfigModal}
        onClose={() => setOpenConfigModal(false)}
        onSave={handleSaveConfiguration}
        clientDetails={clientDetails}
        loading={loading}
      />
    </div>
  );
};

export default ClientPage;
