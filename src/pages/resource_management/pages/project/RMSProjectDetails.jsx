// src/pages/resource_management/projects/ProjectDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ResourceList from "./RMSProjectList";
import axios from "axios";
import SLAForm from "../../models/client_configuration/forms/SLAForm";
import ComplianceForm from "../../models/client_configuration/forms/ComplianceForm";
import EscalationForm from "../../models/client_configuration/forms/EscalationForm";import LoadingSpinner from "../../../../components/LoadingSpinner";
import DemandModal from "../../models/DemandModal";
import { CheckSquare, Square } from "lucide-react";

const RMS_BASE_URL = import.meta.env.VITE_RMS_BASE_URL;
import {
  ArrowLeft,
  Calendar,
  Users,
  Globe,
  ShieldAlert,
  Lock,
  AlertTriangle,
  Edit,
  Trash2,
} from "lucide-react";
import { getProjectById, checkDemandCreation } from "../../services/projectService";
import { toast } from "react-toastify";

const RMSProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [deleteComplianceId, setDeleteComplianceId] = useState(null);
  const [projectEscalations, setProjectEscalations] = useState([]);
  const [clientEscalations, setClientEscalations] = useState([]);
  const [selectedClientEscalations, setSelectedClientEscalations] = useState(
    [],
  );

  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [overlaps, setOverlaps] = useState([]);
  const [loadingOverlaps, setLoadingOverlaps] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingDemand, setLoadingDemand] = useState(false);
  const [demandResponse, setDemandResponse] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [openConfigModal, setOpenConfigModal] = useState(false);
  const [configType, setConfigType] = useState(null); // "sla" | "compliance" | "escalation"

  const [projectSlas, setProjectSlas] = useState([]);
  const [inheritMode, setInheritMode] = useState(false);
  const [clientSlas, setClientSlas] = useState([]);
  const [selectedClientSlas, setSelectedClientSlas] = useState([]);

  // New states for Compliance inheritance
  const [projectCompliance, setProjectCompliance] = useState([]);
  const [clientCompliance, setClientCompliance] = useState([]);
  const [selectedClientCompliance, setSelectedClientCompliance] = useState([]);

  const DEFAULT_FORM_STATE = {
    activeFlag: true,
  };
  const [formData, setFormData] = useState(DEFAULT_FORM_STATE);

  // 1. Fetch Client SLAs when entering Inherit Mode
  const handleInheritClick = async () => {
    try {
      const res = await axios.get(
        `${RMS_BASE_URL}/api/client-sla/clientSLA/${project.clientId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );

      const existingTypes = projectSlas.map((ps) => ps.slaType);

      const validatedSlas = (res.data.data || []).map((sla) => ({
        ...sla,
        isAlreadyMapped: existingTypes.includes(sla.slaType),
      }));

      // CHANGE: Ensure this matches the variable name declared above
      setClientSlas(validatedSlas);
      setInheritMode(true);
    } catch (err) {
      console.error("Failed to fetch client SLAs", err);
    }
  };
  const fetchProjectSLAs = async () => {
    try {
      const res = await axios.get(
        `${RMS_BASE_URL}/api/project-sla/project/${projectId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      setProjectSlas(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch project SLAs", err);
    }
  };
  //2 save inherited SLAs to project
  const saveInheritedSlas = async () => {
    try {
      // Prevent saving if the total would exceed 3
      if (projectSlas.length + selectedClientSlas.length > 3) {
        alert(
          "Adding these would exceed the limit of 3 SLAs for this project.",
        );
        return;
      }
      // We loop through selected types and call your backend inherit endpoint
      const promises = selectedClientSlas.map((type) =>
        axios.post(
          `${RMS_BASE_URL}/api/project-sla/inherit/${project.pmsProjectId}/type/${type}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        ),
      );
      await Promise.all(promises);
      setOpenConfigModal(false);
      setInheritMode(false);
      setSelectedClientSlas([]);
      fetchProjectSLAs();
      // fetchDetail(); // Refresh project data
    } catch (err) {
      console.error("Error inheriting SLAs", err);
    }
  };

  // 3. Handle Manual Save
  const handleManualSave = async () => {
    try {
      const isEditing = !!formData.projectSlaId; // Check if we are updating an existing SLA

      if (!isEditing) {
        // ONLY check max limit if creating a NEW SLA
        if (projectSlas.length >= 3) {
          alert("Maximum of 3 SLA configurations allowed per project.");
          return;
        }

        // ONLY check for duplicate type if creating a NEW SLA
        const isDuplicate = projectSlas.some(
          (sla) => sla.slaType === formData.slaType,
        );
        if (isDuplicate) {
          alert(`The SLA type "${formData.slaType}" is already configured.`);
          return;
        }
      }

      const payload = {
        ...formData,
        project: { pmsProjectId: projectId },
      };

      await axios.post(`${RMS_BASE_URL}/api/project-sla/save`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setOpenConfigModal(false);
      setFormData(DEFAULT_FORM_STATE); // Reset form after save
      fetchProjectSLAs(); // Refresh table
    } catch (err) {
      console.error("Error saving project SLA", err);
      alert(err.response?.data?.message || "Failed to save SLA configuration");
    }
  };

  // 1. Handle Delete Logic
  const handleDeleteSla = async (sla) => {
    const message = sla.isInherited
      ? "This SLA was inherited from client. Do you want to uninherit it from this project?"
      : "Are you sure you want to delete this custom SLA configuration?";

    if (!window.confirm(message)) return;

    try {
      await axios.delete(
        `${RMS_BASE_URL}/api/project-sla/${sla.projectSlaId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      fetchProjectSLAs();
    } catch (err) {
      console.error("Error deleting project SLA", err);
      alert(err.response?.data?.message || "Failed to delete SLA");
    }
  };

  // 2. Handle Edit Logic
  const handleEditSla = (sla) => {
    // Populate the form with existing data
    setFormData({
      projectSlaId: sla.projectSlaId,
      slaType: sla.slaType,
      slaDurationDays: sla.slaDurationDays,
      warningThresholdDays: sla.warningThresholdDays,
      activeFlag: sla.activeFlag,
      project: { pmsProjectId: projectId },
    });
    setConfigType("sla");
    setOpenConfigModal(true);
    setInheritMode(false);
  };

  // . Fetch Existing Project Compliance (for the tab table and validation)
  const fetchProjectCompliance = async () => {
    try {
      const res = await axios.get(
        `${RMS_BASE_URL}/api/project-compliance/project/${projectId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      setProjectCompliance(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch project compliance", err);
    }
  };

  //  Fetch Client Compliance when entering Inherit Mode
  const handleComplianceInheritClick = async () => {
    try {
      // 🔥 1️⃣ Fetch latest project compliance from DB
      const projectRes = await axios.get(
        `${RMS_BASE_URL}/api/project-compliance/project/${projectId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );

      const latestProjectCompliance = projectRes.data.data || [];

      // 🔥 2️⃣ Fetch client compliance
      const clientRes = await axios.get(
        `${RMS_BASE_URL}/api/client-compliance/clientCompliance/${project.clientId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );

      // 🔥 Only block if ALREADY inherited
      const inheritedTypes = latestProjectCompliance
        .filter((pc) => pc.isInherited === true)
        .map((pc) => pc.requirementType);

      const validatedCompliance = (clientRes.data.data || []).map((comp) => ({
        ...comp,
        isAlreadyMapped: inheritedTypes.includes(comp.requirementType),
      }));

      // 🔥 4️⃣ Update states
      setProjectCompliance(latestProjectCompliance);
      setClientCompliance(validatedCompliance);
      setSelectedClientCompliance([]); // reset selection
      setInheritMode(true);
    } catch (err) {
      console.error("Failed to fetch compliance", err);
    }
  };

  //  Save Inherited Compliance to Project
  const saveInheritedCompliance = async () => {
    try {
      if (selectedClientCompliance.length === 0) return;

      // Call the specific inherit endpoint: /inherit/{projectId}/type/{complianceType}
      const promises = selectedClientCompliance.map((complianceType) =>
        axios.post(
          `${RMS_BASE_URL}/api/project-compliance/inherit/${projectId}/type/${complianceType}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        ),
      );

      await Promise.all(promises);

      // UI Cleanup
      setOpenConfigModal(false);
      setInheritMode(false);
      setSelectedClientCompliance([]);
      fetchProjectCompliance(); // Refresh the main UI table
    } catch (err) {
      console.error("Error inheriting compliance", err);
      alert("Internal Server Error: Ensure Enum types match backend exactly.");
    }
  };

  //  Update the Manual Save for Compliance
  const handleComplianceManualSave = async () => {
    try {
      // 1. LOCAL CHECK: Prevent duplicates before hitting the backend
      const isDuplicate = projectCompliance.some(
        (c) =>
          c.requirementType === formData.requirementType &&
          c.isInherited === false,
      );

      if (isDuplicate && !formData.projectComplianceId) {
        alert(
          `The compliance requirement "${formData.requirementType}" is already configured for this project.`,
        );
        return; // Stop the execution here
      }

      const payload = {
        ...formData,
        // activeFlag: formData.activeFlag ?? true,
        project: { pmsProjectId: projectId },
      };

      await axios.post(`${RMS_BASE_URL}/api/project-compliance/save`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setOpenConfigModal(false);
      setFormData(DEFAULT_FORM_STATE);
      fetchProjectCompliance();
    } catch (err) {
      console.error("Error saving project compliance", err);
      // This will display "Serial number already exists" if the local check missed something
      alert(err.response?.data?.message || "An error occurred during save.");
    }
  };

  const handleEditCompliance = (comp) => {
    setFormData({
      projectComplianceId: comp.projectComplianceId,
      requirementType: comp.requirementType,
      requirementName: comp.requirementName,
      mandatoryFlag: comp.mandatoryFlag,
      activeFlag: comp.activeFlag,
      project: { pmsProjectId: projectId },
    });

    setConfigType("compliance");
    setOpenConfigModal(true);
    setInheritMode(false);
  };

  const handleDeleteCompliance = async (comp) => {
    const message = comp.isInherited
      ? "This compliance was inherited from client. Do you want to uninherit it from this project?"
      : "Are you sure you want to delete this compliance configuration?";

    if (!window.confirm(message)) return;

    try {
      await axios.delete(
        `${RMS_BASE_URL}/api/project-compliance/${comp.projectComplianceId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      fetchProjectCompliance();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete compliance");
    }
  };

  const handleEscalationManualSave = async () => {
    try {
      const payload = {
        ...formData,
        projectId: projectId,
        type: "manual",
      };

      await axios.post(
        `${RMS_BASE_URL}/api/projects/escalations/save`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      setOpenConfigModal(false);
      setFormData(DEFAULT_FORM_STATE);
      fetchProjectEscalations(); // when you create this
    } catch (err) {
      console.error("Error saving escalation", err);
      alert(err.response?.data?.message || "Failed to save escalation");
    }
  };

  const fetchProjectEscalations = async () => {
    try {
      const res = await axios.get(
        `${RMS_BASE_URL}/api/projects/${projectId}/escalations`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      setProjectEscalations(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch escalations", err);
    }
  };

  const handleEscalationInheritClick = async () => {
    try {
      // 1️⃣ Get existing project escalations
      const projectRes = await axios.get(
        `${RMS_BASE_URL}/api/projects/${projectId}/escalations`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      const existingLevels = (projectRes.data.data || []).map(
        (e) => e.escalationLevel,
      );

      // 2️⃣ Call YOUR ClientContactController endpoint
      const clientRes = await axios.get(
        `${RMS_BASE_URL}/api/client-contact/clientContact/${project.clientId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      const validated = (clientRes.data.data || []).map((contact) => ({
        ...contact,
        isAlreadyMapped: existingLevels.includes(
          `LEVEL_${contact.escalationLevel}`,
        ),
      }));

      setClientEscalations(validated);
      setSelectedClientEscalations([]);
      setInheritMode(true);
    } catch (err) {
      console.error("Failed to fetch client escalation contacts", err);
    }
  };

  const saveInheritedEscalations = async () => {
    try {
      if (selectedClientEscalations.length === 0) return;

      const payload = {
        projectId: projectId,
        type: "inherit",
        contactId: selectedClientEscalations,
      };

      await axios.post(
        `${RMS_BASE_URL}/api/projects/escalations/save`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      setOpenConfigModal(false);
      setInheritMode(false);
      setSelectedClientEscalations([]);
      fetchProjectEscalations();
    } catch (err) {
      console.error("Error inheriting escalation", err);
      alert(err.response?.data?.message || "Failed to inherit escalation");
    }
  };

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await getProjectById(projectId);
      setProject(res.data);
    } catch (err) {
      console.error("Failed to fetch project details", err);
      toast.error(err.response?.data?.message || "Failed to fetch project details.");
    } finally {
      setLoading(false);
    }
  };

  const checkDemand = async () => {
    setLoadingDemand(true);
    try {
      const res = await checkDemandCreation(projectId);
      setDemandResponse(res);
    } catch (err) {
      console.error("Failed to check demand creation", err);
      toast.error(err.response?.data?.message || "Failed to check demand creation.");
    } finally {
      setLoadingDemand(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    checkDemand();
  }, [projectId]);

  useEffect(() => {
    if (activeTab === "overlaps") {
      fetchOverlaps();
    }
  }, [activeTab, projectId]);
  useEffect(() => {
    if (activeTab === "sla") {
      fetchProjectSLAs();
    }
  }, [activeTab, projectId]);

  useEffect(() => {
    if (activeTab === "compliance") {
      fetchProjectCompliance();
    }
  }, [activeTab, projectId]);

  useEffect(() => {
    if (activeTab === "escalation") {
      fetchProjectEscalations();
    }
  }, [activeTab, projectId]);

  const fetchOverlaps = async () => {
    try {
      setLoadingOverlaps(true);
      const res = await axios.get(
        `${RMS_BASE_URL}/api/projects/${projectId}/overlaps`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      setOverlaps(res.data.data || []);
    } catch (err) {
      console.error("Failed to load overlaps", err);
      setOverlaps([]);
    } finally {
      setLoadingOverlaps(false);
    }
  };

  if (loading)
    return <div className="p-10 text-center"><LoadingSpinner text="Loading..."/></div>;

  if (!project)
    return <div className="p-10 text-center">Project not found</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Back */}
      <button

        onClick={() => navigate(-1)}

        className="flex items-center gap-2 text-gray-500 mb-4 hover:text-[#263383] text-sm"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </button>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-[#081534] flex items-center gap-3">
              {project.name}
              {/* <span
                className={`text-xs px-2 py-1 rounded-full border ${
                  project.projectStatus === "ACTIVE"
                    ? "bg-green-50 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              > */}
              <span
                className={`text-xs px-2 py-1 rounded-full border ${project.projectStatus === "ACTIVE"
                    ? "bg-green-50 text-green-700"
                    : "bg-gray-100 text-gray-600"
                  }`}
              >
                {project.projectStatus}
              </span>
            </h1>
            <p className="text-gray-500 mt-1">

              {project.client?.client_name} • Project ID:{" "}
              {project.pmsProjectId}

              {project.client?.client_name} • Project ID: {project.pmsProjectId}
            </p>
          </div>
          <div>
            <button 
              title={!demandResponse?.create ? demandResponse?.reason : ""} 
              className={`bg-blue-800 p-3 rounded-lg text-white text-xs hover:bg-blue-900 font-semibold ${(loadingDemand || !demandResponse?.create) ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-900"}`} 
              disabled={loadingDemand || !demandResponse?.create} 
              onClick={() => setModalOpen(true)}
            >
              Create Demand
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 mt-8 border-b border-gray-200">
          {[
            "overview",
            "resources",
            "financials",
            "overlaps",
            "sla",
            "compliance",
            "escalation",
          ].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium capitalize relative ${activeTab === tab ? "text-[#263383]" : "text-gray-500"
                }`}
            >
              {tab}
              {tab === "overlaps" && overlaps.length > 0 && (
                <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                  {overlaps.length}
                </span>
              )}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#263383]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
                <Lock className="h-3 w-3" /> PMS Context (Read-Only)
              </h3>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">

                    Project Manager ID

                  </label>
                  <div className="flex items-center gap-2 text-gray-800 font-medium">
                    <Users className="h-4 w-4 text-gray-400" />

                    {project.projectManagerId}

                    Project Manager ID
                  </div>
                  <div className="flex items-center gap-2 text-gray-800 font-medium">
                    <Users className="h-4 w-4 text-gray-400" />

                    {project.projectManagerId}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500 block mb-1">
                    Risk Profile
                  </label>
                  <div className="flex items-center gap-2 text-gray-800 font-medium">
                    <ShieldAlert
                      className={`h-4 w-4 ${project.riskLevel === "HIGH"
                          ? "text-red-500"
                          : "text-green-500"
                        }`}
                    />
                    {project.riskLevel}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500 block mb-1">
                    Lifecycle Stage
                  </label>
                  <div className="text-sm font-medium text-gray-800 uppercase">
                    {project.lifecycleStage}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500 block mb-1">
                    Start Date
                  </label>
                  <div className="flex items-center gap-2 text-gray-800 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {new Date(project.startDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">
              Delivery Model
            </h3>
            <div className="p-3 bg-blue-50 rounded border border-blue-100 flex justify-between items-center mb-4">
              <span className="text-sm text-gray-600">Model</span>
              <span className="font-bold text-[#263383]">
                {project.deliveryModel}
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
              <Globe className="h-5 w-5 text-gray-400" />
              <div>
                <span className="text-xs text-gray-500 block">
                  Primary Location
                </span>
                <span className="text-sm font-medium text-gray-800">
                  {project.primaryLocation}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAPS TAB */}
      {activeTab === "overlaps" && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="text-red-500 h-5 w-5" />
            Overlapping Projects
          </h3>

          {loadingOverlaps ? (
            <div className="text-sm text-gray-500">Checking overlaps...</div>
          ) : overlaps.length === 0 ? (
            <div className="text-sm text-gray-500">
              No overlapping projects for this timeline.
            </div>
          ) : (
            <div className="space-y-4">
              {overlaps.map((p) => (
                <div
                  key={p.projectId}
                  className="p-4 border rounded-lg bg-red-50 border-red-100"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-red-700">
                        {p.projectName}
                      </h4>
                      <p className="text-sm text-gray-600">{p.clientName}</p>
                    </div>
                    <div className="text-sm text-gray-700">
                      <div>
                        {new Date(p.startDate).toLocaleDateString()} —{" "}
                        {new Date(p.endDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "resources" && (
        <ResourceList allocations={project.allocations} />
      )}

      {activeTab === "sla" && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Project SLA Configuration</h3>
            <button
              disabled={projectSlas.length >= 3} // Disable when 3 items exist
              onClick={() => {
                setFormData(DEFAULT_FORM_STATE);
                setConfigType("sla");
                setOpenConfigModal(true);
              }}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                projectSlas.length >= 3
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-[#263383] text-white hover:opacity-90"
              }`}
            >
              {projectSlas.length >= 3 ? "Limit Reached (3/3)" : "+ Create SLA"}
            </button>
          </div>

          {projectSlas.length > 0 ? (
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 font-medium">
                  <tr>
                    <th className="p-4">Type</th>
                    <th className="p-4 text-center">Duration (Days)</th>
                    <th className="p-4 text-center">Warning (Days)</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {projectSlas.map((sla) => (
                    <tr key={sla.projectSlaId} className="hover:bg-gray-50">
                      <td className="p-4 font-semibold text-gray-700">
                        {sla.slaType}
                      </td>
                      <td className="p-4 text-center">{sla.slaDurationDays}</td>
                      <td className="p-4 text-center">
                        {sla.warningThresholdDays}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`px-2 py-1 rounded text-[10px] font-bold ${sla.isInherited ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"}`}
                        >
                          {sla.isInherited ? "INHERITED" : "CUSTOM"}
                        </span>
                      </td>
                      {/* Action Buttons with Conditional Disabling */}
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-3">
                          {/* EDIT BUTTON */}
                          <button
                            onClick={() => {
                              if (sla.isInherited) return; // 🔒 Prevent inherited edit
                              handleEditSla(sla);
                            }}
                            className={`transition-colors ${
                              sla.isInherited
                                ? "text-gray-300 cursor-not-allowed pointer-events-none"
                                : "text-blue-600 hover:text-blue-800"
                            }`}
                            title={
                              sla.isInherited
                                ? "Cannot edit inherited SLAs"
                                : "Edit SLA"
                            }
                          >
                            <Edit className="h-4 w-4" />
                          </button>

                          {/* DELETE BUTTON (Always allowed) */}
                          <button
                            onClick={() => handleDeleteSla(sla)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete / Uninherit"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No SLA configuration added yet.
            </p>
          )}
        </div>
      )}

      {activeTab === "compliance" && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">
              Project Compliance Configuration
            </h3>
            <button
              onClick={() => {
                setFormData(DEFAULT_FORM_STATE);
                setConfigType("compliance");
                setOpenConfigModal(true);
              }}
              className="bg-[#263383] text-white px-4 py-2 rounded-lg text-sm hover:opacity-90"
            >
              + Create Compliance
            </button>
          </div>

          {projectCompliance.length > 0 ? (
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 font-medium">
                  <tr>
                    <th className="p-4">Requirement Type</th>
                    <th className="p-4">Requirement Name</th>
                    <th className="p-4 text-center">Mandatory</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {projectCompliance
                    .filter((comp) => comp.requirementType)
                    .map((comp) => (
                      <tr
                        key={comp.projectComplianceId}
                        className="hover:bg-gray-50"
                      >
                        <td className="p-4 font-semibold text-gray-700">
                          {comp.requirementType}
                        </td>

                        <td className="p-4 text-gray-600">
                          {comp.requirementName}
                        </td>

                        <td className="p-4 text-center">
                          {comp.mandatoryFlag ? "Yes" : "No"}
                        </td>

                        {/* STATUS WITH INHERITED BADGE */}
                        <td className="p-4 text-center">
                          <div className="flex justify-center items-center gap-2">
                            <span
                              className={`px-2 py-1 rounded text-[10px] font-bold ${
                                comp.activeFlag
                                  ? "bg-green-50 text-green-700"
                                  : "bg-red-50 text-red-700"
                              }`}
                            >
                              {comp.activeFlag ? "ACTIVE" : "INACTIVE"}
                            </span>

                            {comp.isInherited && (
                              <span className="px-2 py-1 rounded text-[10px] font-bold bg-blue-50 text-blue-600">
                                INHERITED
                              </span>
                            )}
                          </div>
                        </td>

                        {/* ACTIONS */}
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-3">
                            {/* EDIT BUTTON */}
                            <button
                              onClick={() => {
                                if (comp.isInherited) return; // 🔒 Prevent inherited edit
                                handleEditCompliance(comp);
                              }}
                              className={`${
                                comp.isInherited
                                  ? "text-gray-300 cursor-not-allowed pointer-events-none"
                                  : "text-blue-600 hover:text-blue-800"
                              }`}
                              title={
                                comp.isInherited
                                  ? "Cannot edit inherited compliance"
                                  : "Edit Compliance"
                              }
                            >
                              <Edit className="h-4 w-4" />
                            </button>

                            {/* DELETE BUTTON (Always allowed) */}
                            <button
                              onClick={() => handleDeleteCompliance(comp)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete / Uninherit"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No compliance configuration added yet.
            </p>
          )}
        </div>
      )}

      {activeTab === "escalation" && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Project Escalation Matrix</h3>

            <button
              onClick={() => {
                setConfigType("escalation");
                setOpenConfigModal(true);
              }}
              className="bg-[#263383] text-white px-4 py-2 rounded-lg text-sm hover:opacity-90"
            >
              + Create Escalation
            </button>
          </div>

          {projectEscalations.length > 0 ? (
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 font-medium">
                  <tr>
                    <th className="p-4">Level</th>
                    <th className="p-4">Name</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {projectEscalations.map((esc) => (
                    <tr
                      key={esc.projectEscalationId}
                      className="hover:bg-gray-50"
                    >
                      <td className="p-4 font-semibold text-gray-700">
                        L{esc.escalationLevel}
                      </td>

                      <td className="p-4 text-gray-700">{esc.contactName}</td>

                      <td className="p-4 text-gray-600">{esc.contactRole}</td>

                      <td className="p-4 text-gray-600">{esc.email}</td>

                      <td className="p-4 text-gray-600">{esc.phone}</td>

                      <td className="p-4 text-center">
                        <span
                          className={`px-2 py-1 rounded text-[10px] font-bold ${
                            esc.activeFlag
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {esc.activeFlag ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <span
                          className={`px-2 py-1 rounded text-[10px] font-bold ${
                            esc.source === "MANUAL"
                              ? "bg-purple-50 text-purple-700"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {esc.source}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No escalation configuration added yet.
            </p>
          )}
        </div>
      )}

      {/* CONFIGURATION MODAL */}
      {openConfigModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative">
            <button
              onClick={() => {
                setOpenConfigModal(false);
                setInheritMode(false);
                setFormData(DEFAULT_FORM_STATE);
              }}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>

            <h2 className="text-lg font-semibold mb-6 capitalize border-b pb-2">
              {inheritMode
                ? `Inherit ${
                    configType === "sla"
                      ? "SLAs"
                      : configType === "compliance"
                        ? "Compliance"
                        : "Escalation Contacts"
                  } from ${project?.client?.client_name || "Client"}`
                : `Create ${configType} Configuration`}
            </h2>
            {configType === "compliance" && (
              <>
                {!inheritMode ? (
                  /* MANUAL FORM VIEW */
                  <div className="space-y-6">
                    <ComplianceForm
                      formData={formData}
                      setFormData={setFormData}
                    />

                    {/* Action buttons placed OUTSIDE the ComplianceForm component */}
                    <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={handleComplianceInheritClick}
                        className="text-[#263383] font-semibold hover:underline text-sm flex items-center gap-1"
                      >
                        ← Inherit from Client Defaults
                      </button>
                      <button
                        type="button"
                        onClick={handleComplianceManualSave}
                        className="bg-[#263383] text-white px-6 py-2 rounded-lg text-sm hover:opacity-90 shadow-sm"
                      >
                        Save Compliance Configuration
                      </button>
                    </div>
                  </div>
                ) : (
                  /* INHERITANCE TABLE VIEW */
                  <div className="space-y-4">
                    {clientCompliance.length > 0 &&
                    clientCompliance.every((c) => c.isAlreadyMapped) ? (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
                        <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                        <p className="text-sm text-blue-800 font-medium">
                          All available client compliance requirements are
                          already inherited.
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600 mb-2">
                        Select compliance requirements to map:
                      </p>
                    )}

                    <div className="max-h-60 overflow-y-auto border rounded-md">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600">
                          <tr>
                            <th className="p-3 w-10">Select</th>
                            <th className="p-3">Requirement Name</th>
                            <th className="p-3">Type</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {clientCompliance.map((comp) => (
                            <tr
                              key={comp.clientcomplianceId}
                              className={`hover:bg-gray-50 ${comp.isAlreadyMapped ? "bg-gray-50/50" : ""}`}
                            >
                              <td className="p-3">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 accent-[#263383] disabled:opacity-50"
                                  disabled={comp.isAlreadyMapped}
                                  // CRITICAL: Bind to requirementType (Enum String)
                                  checked={selectedClientCompliance.includes(
                                    comp.requirementType,
                                  )}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedClientCompliance([
                                        ...selectedClientCompliance,
                                        comp.requirementType,
                                      ]);
                                    } else {
                                      setSelectedClientCompliance(
                                        selectedClientCompliance.filter(
                                          (t) => t !== comp.requirementType,
                                        ),
                                      );
                                    }
                                  }}
                                />
                              </td>
                              <td className="p-3 font-medium text-gray-700">
                                {comp.requirementName}
                                {comp.isAlreadyMapped && (
                                  <span className="ml-2 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded uppercase font-bold">
                                    Mapped
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-gray-500">
                                {comp.requirementType}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        onClick={() => setInheritMode(false)}
                        className="px-4 py-2 text-gray-500 text-sm"
                      >
                        Back to Manual
                      </button>
                      <button
                        onClick={saveInheritedCompliance}
                        disabled={selectedClientCompliance.length === 0}
                        className="bg-[#263383] text-white px-6 py-2 rounded-lg text-sm disabled:bg-gray-300"
                      >
                        Map to Project
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* SLA Configuration Views */}
            {configType === "sla" && (
              <>
                {!inheritMode ? (
                  /* MANUAL CREATE VIEW */
                  <div className="space-y-6">
                    <SLAForm formData={formData} setFormData={setFormData} />
                    <div className="flex justify-between items-center mt-6">
                      <button
                        onClick={handleInheritClick}
                        className="text-[#263383] font-medium hover:underline text-sm"
                      >
                        ← Inherit from Client Defaults
                      </button>
                      <button
                        onClick={() => {
                          handleManualSave();
                        }}
                        className="bg-[#263383] text-white px-6 py-2 rounded-lg text-sm hover:opacity-90"
                      >
                        Save SLA Configuration
                      </button>
                    </div>
                  </div>
                ) : (
                  /* INHERIT FROM CLIENT VIEW */
                  <div className="space-y-4">
                    {/* --- PLACE THE EMPTY STATE / VALIDATION MESSAGE HERE --- */}
                    {clientSlas.length > 0 &&
                    clientSlas.every((sla) => sla.isAlreadyMapped) ? (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
                        <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                        <p className="text-sm text-blue-800">
                          All available client SLAs have already been inherited
                          for this project.
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600 mb-2">
                        Select default client SLAs to map to this project:
                      </p>
                    )}
                    <div className="max-h-60 overflow-y-auto border rounded-md">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600">
                          <tr>
                            <th className="p-3 w-10">Select</th>
                            <th className="p-3">Type</th>
                            <th className="p-3 text-center">Duration</th>
                            <th className="p-3 text-center">Warning</th>
                          </tr>
                        </thead>
                        {/* Replace the tbody inside your Inherit View with this: */}
                        <tbody className="divide-y">
                          {clientSlas.map((sla) => (
                            <tr
                              key={sla.slaId}
                              className={`hover:bg-gray-50 ${sla.isAlreadyMapped ? "bg-gray-50/50" : ""}`}
                            >
                              <td className="p-3">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 accent-[#263383] disabled:opacity-50"
                                  checked={selectedClientSlas.includes(
                                    sla.slaType,
                                  )}
                                  disabled={sla.isAlreadyMapped} // Disable if already present
                                  onChange={(e) => {
                                    if (e.target.checked)
                                      setSelectedClientSlas([
                                        ...selectedClientSlas,
                                        sla.slaType,
                                      ]);
                                    else
                                      setSelectedClientSlas(
                                        selectedClientSlas.filter(
                                          (t) => t !== sla.slaType,
                                        ),
                                      );
                                  }}
                                />
                              </td>
                              <td className="p-3 font-medium text-gray-700">
                                {sla.slaType}
                                {sla.isAlreadyMapped && (
                                  <span className="ml-2 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                                    Already Inherited
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-center text-gray-500">
                                {sla.slaDurationDays} Days
                              </td>
                              <td className="p-3 text-center text-gray-500">
                                {sla.warningThresholdDays} Days
                              </td>
                            </tr>
                          ))}
                          {clientSlas.length === 0 && (
                            <tr>
                              <td
                                colSpan="4"
                                className="p-6 text-center text-gray-400"
                              >
                                No client SLAs found to inherit.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        onClick={() => setInheritMode(false)}
                        className="px-4 py-2 text-gray-500 text-sm hover:text-gray-700"
                      >
                        Back to Manual
                      </button>
                      <button
                        onClick={saveInheritedSlas}
                        disabled={selectedClientSlas.length === 0}
                        className="bg-[#263383] text-white px-6 py-2 rounded-lg text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        Map to Project
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Compliance Form */}
            {/* {configType === "compliance" && (
              <ComplianceForm formData={formData} setFormData={setFormData} />
            )} */}

            {/* Escalation Form */}
            {configType === "escalation" && (
              <EscalationForm formData={formData} setFormData={setFormData} />
            )}
          </div>
        </div>
      )}

      {modalOpen && (
        <DemandModal open={modalOpen} onClose={() => setModalOpen(false)} projectDetails={project} onSuccess={() => setModalOpen(false)}/>
      )}
    </div>
  );
};

export default RMSProjectDetails;
