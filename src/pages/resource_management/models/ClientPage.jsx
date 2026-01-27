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
  Package
} from "lucide-react";

/* ---------------- MOCK DATA ---------------- */

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
  projects: [
    {
      id: 101,
      name: "Global SAP Migration",
      status: "In Progress",
      type: "Fixed Cost",
      manager: "Sarah Jenkins",
      description: "Migration of legacy ERP systems to SAP S/4HANA.",
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
      description: "Providing 5 senior React developers.",
      hasSLA: false,
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
      description: "Annual external security assessment.",
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
  <div>
    <SectionHeader title="Service Level Agreement" />
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-xs uppercase font-bold text-blue-600">Uptime</p>
        <p className="text-xl font-bold">{data?.uptime}</p>
      </div>
      <div className="bg-purple-50 p-4 rounded-lg">
        <p className="text-xs uppercase font-bold text-purple-600">Response</p>
        <p className="text-xl font-bold">{data?.responseTime}</p>
      </div>
      <div className="bg-emerald-50 p-4 rounded-lg">
        <p className="text-xs uppercase font-bold text-emerald-600">Coverage</p>
        <p className="text-xl font-bold">{data?.coverage}</p>
      </div>
    </div>
  </div>
);

const ProjectCompliance = () => (
  <div>
    <SectionHeader title="Compliance & Security" />
    <div className="grid grid-cols-2 gap-4">
      {["GDPR", "SOC2", "ISO 27001"].map((item) => (
        <div key={item} className="flex justify-between items-center p-4 border rounded-lg">
          <span className="font-medium">{item}</span>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
            COMPLIANT
          </span>
        </div>
      ))}
    </div>
  </div>
);

const ProjectAssets = ({ assets }) => (
  <div>
    <SectionHeader title="Assigned Assets" />
    {assets.length ? (
      <table className="w-full text-sm border rounded-lg overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-3 text-left">Asset</th>
            <th className="p-3 text-left">Serial</th>
            <th className="p-3 text-left">Assigned To</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((a, i) => (
            <tr key={i} className="border-t">
              <td className="p-3">{a.name}</td>
              <td className="p-3 font-mono">{a.serial}</td>
              <td className="p-3">{a.assignedTo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <div className="text-center p-6 border-2 border-dashed rounded-lg text-gray-400">
        No assets assigned
      </div>
    )}
  </div>
);

const ProjectEscalation = () => (
  <div>
    <SectionHeader title="Escalation Matrix" />
    <p className="text-sm text-gray-500">Defined escalation contacts.</p>
  </div>
);

/* ---------------- MAIN PAGE ---------------- */

const ClientPage = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeTab, setActiveTab] = useState("");

  useEffect(() => {
    setSelectedProject(MOCK_CLIENT_DATA.projects[0]);
    setActiveTab(
      MOCK_CLIENT_DATA.projects[0].hasSLA ? "sla" : "compliance"
    );
  }, []);

  const tabs = selectedProject
    ? [
        selectedProject.hasSLA && { id: "sla", label: "SLA", icon: CheckCircle2 },
        selectedProject.hasCompliance && { id: "compliance", label: "Compliance", icon: ShieldCheck },
        selectedProject.hasAssets && { id: "assets", label: "Assets", icon: Box },
        selectedProject.hasEscalation && { id: "escalation", label: "Escalation", icon: Users },
      ].filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white border rounded-lg"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{MOCK_CLIENT_DATA.name}</h1>
            <div className="flex gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Globe size={14} /> {MOCK_CLIENT_DATA.region}
              </span>
              <span className="flex items-center gap-1">
                <Briefcase size={14} /> {MOCK_CLIENT_DATA.industry}
              </span>
            </div>
          </div>
        </div>

        {/* STATS + MANAGE ASSETS */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs uppercase text-gray-500">Projects</p>
            <p className="text-xl font-bold">{MOCK_CLIENT_DATA.stats.totalProjects}</p>
          </div>

          <button
            onClick={() => navigate("/assets")}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
          >
            <Package size={16} />
            Manage Assets
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* PROJECT LIST */}
        <div className="col-span-4 space-y-4">
          {MOCK_CLIENT_DATA.projects.map((p) => (
            <div
              key={p.id}
              onClick={() => {
                setSelectedProject(p);
                setActiveTab(p.hasSLA ? "sla" : "compliance");
              }}
              className={`p-4 border rounded-xl cursor-pointer ${
                selectedProject?.id === p.id
                  ? "border-indigo-600 shadow"
                  : "hover:shadow-sm"
              }`}
            >
              <h3 className="font-semibold">{p.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{p.description}</p>
            </div>
          ))}
        </div>

        {/* PROJECT DETAILS */}
        <div className="col-span-8 bg-white border rounded-xl shadow-sm">
          {selectedProject ? (
            <>
              <div className="p-6 border-b flex justify-between">
                <div>
                  <h2 className="text-xl font-bold">{selectedProject.name}</h2>
                  <p className="text-sm text-gray-500">
                    Manager: {selectedProject.manager}
                  </p>
                </div>
                <MoreHorizontal />
              </div>

              <div className="flex border-b px-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm border-b-2 ${
                      activeTab === tab.id
                        ? "border-indigo-600 text-indigo-600"
                        : "border-transparent text-gray-500"
                    }`}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === "sla" && <ProjectSLA data={selectedProject.slaData} />}
                {activeTab === "compliance" && <ProjectCompliance />}
                {activeTab === "assets" && (
                  <ProjectAssets assets={selectedProject.assetsData || []} />
                )}
                {activeTab === "escalation" && <ProjectEscalation />}
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              <Building2 size={48} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientPage;
