// src/pages/resource_management/projects/ProjectDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProjects } from "../../services/projectService";
import ResourceList from "./RMSProjectList";
// import { projectService } from "../projects/projectService";
import axios from "axios";
import SLAForm from "../../models/client_configuration/forms/SLAForm";
import ComplianceForm from "../../models/client_configuration/forms/ComplianceForm";
import EscalationForm from "../../models/client_configuration/forms/EscalationForm";
const RMS_BASE_URL = import.meta.env.VITE_RMS_BASE_URL;
import {
  ArrowLeft,
  Calendar,
  Users,
  Globe,
  ShieldAlert,
  Lock,
  AlertTriangle,
} from "lucide-react";
import { getProjectById } from "../../services/projectService";
import {
  getProjectEscalations,
  createProjectEscalation,
  deleteProjectEscalation,
} from "../../services/projectService";

const RMSProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [overlaps, setOverlaps] = useState([]);
  const [loadingOverlaps, setLoadingOverlaps] = useState(false);
  const [loading, setLoading] = useState(true);
  const [openConfigModal, setOpenConfigModal] = useState(false);
  const [configType, setConfigType] = useState(null); // "sla" | "compliance" | "escalation"
  const [escalations, setEscalations] = useState([]);
  const [loadingEscalations, setLoadingEscalations] = useState(false);

  const DEFAULT_FORM_STATE = {
    activeFlag: true,
  };
  const [formData, setFormData] = useState(DEFAULT_FORM_STATE);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await getProjectById(projectId);
      setProject(res.data);
    } catch (err) {
      console.error("Failed to fetch project details", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [projectId]);

  useEffect(() => {
    if (activeTab === "overlaps") fetchOverlaps();
    if (activeTab === "escalation") fetchEscalations();
  }, [activeTab]);

  const fetchEscalations = async () => {
    try {
      setLoadingEscalations(true);
      const res = await getProjectEscalations(projectId);
      setEscalations(res.data || []);
    } catch (err) {
      console.error("Failed to fetch escalations", err);
      setEscalations([]);
    } finally {
      setLoadingEscalations(false);
    }
  };

  const handleDeleteEscalation = async (id) => {
    try {
      await deleteProjectEscalation(id);
      fetchEscalations();
    } catch (err) {
      console.error("Failed to delete escalation", err);
    }
  };
  const handleSaveEscalation = async () => {
    try {
      const levelMap = {
        1: "LEVEL_1",
        2: "LEVEL_2",
        3: "LEVEL_3",
      };

      if (!formData.triggers || formData.triggers.length === 0) {
        alert("Please select at least one escalation trigger.");
        return;
      }

      if (!project?.pmsProjectId) {
        alert("Project ID missing");
        return;
      }

      const payload = {
        projectId: project.pmsProjectId,
        clientId: project.clientId,
        contactId: formData.contactId || null,
        contactName: formData.contactName,
        contactEmail: formData.contactEmail,
        contactRole: formData.contactRole,
        escalationLevel: levelMap[formData.escalationLevel],
        triggers: formData.triggers,
      };

      console.log("SENDING PAYLOAD 👉", payload);

      await createProjectEscalation(payload);
      setOpenConfigModal(false);
      fetchEscalations();
    } catch (err) {
      console.error("Failed to save escalation", err);
    }
  };

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
    return <div className="p-10 text-center">Loading Details...</div>;

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
                className={`text-xs px-2 py-1 rounded-full border ${
                  project.projectStatus === "ACTIVE"
                    ? "bg-green-50 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {project.projectStatus}
              </span>
            </h1>
            <p className="text-gray-500 mt-1">
              {project.client?.client_name} • Project ID: {project.pmsProjectId}
            </p>
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
              className={`pb-3 text-sm font-medium capitalize relative ${
                activeTab === tab ? "text-[#263383]" : "text-gray-500"
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
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500 block mb-1">
                    Risk Profile
                  </label>
                  <div className="flex items-center gap-2 text-gray-800 font-medium">
                    <ShieldAlert
                      className={`h-4 w-4 ${
                        project.riskLevel === "HIGH"
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
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Project SLA Configuration</h3>

            <button
              onClick={() => {
                setConfigType("sla");
                setOpenConfigModal(true);
              }}
              className="bg-[#263383] text-white px-4 py-2 rounded-lg text-sm hover:opacity-90"
            >
              + Create SLA
            </button>
          </div>

          <p className="text-sm text-gray-500">
            No SLA configuration added yet.
          </p>
        </div>
      )}

      {activeTab === "compliance" && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Project Compliance Configuration
            </h3>

            <button
              onClick={() => {
                setConfigType("compliance");
                setOpenConfigModal(true);
              }}
              className="bg-[#263383] text-white px-4 py-2 rounded-lg text-sm hover:opacity-90"
            >
              + Create Compliance
            </button>
          </div>

          <p className="text-sm text-gray-500">
            No compliance configuration added yet.
          </p>
        </div>
      )}

      {activeTab === "escalation" && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
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

          {/* <p className="text-sm text-gray-500">
            No escalation configuration added yet.
          </p> */}
          {loadingEscalations ? (
            <p className="text-sm text-gray-500">
              Loading escalation contacts...
            </p>
          ) : escalations.length === 0 ? (
            <p className="text-sm text-gray-500">
              No escalation contacts have been assigned to this project yet.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-gray-500 border-b">
                <tr>
                  <th className="py-2">Name</th>
                  <th>Role</th>
                  <th>Level</th>
                  <th>Triggers</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {escalations.map((e) => (
                  <tr key={e.id} className="border-b">
                    <td className="py-2">{e.contactName}</td>
                    <td>{e.contactRole}</td>
                    <td>{e.escalationLevel}</td>
                    <td>{e.triggers.join(", ")}</td>
                    <td>
                      <button
                        onClick={() => handleDeleteEscalation(e.id)}
                        className="text-red-500 text-xs"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      {openConfigModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative">
            <button
              onClick={() => setOpenConfigModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>

            <h2 className="text-lg font-semibold mb-4 capitalize">
              Create {configType} Configuration
            </h2>

            {configType === "sla" && (
              <div className="space-y-4">
                <SLAForm formData={formData} setFormData={setFormData} />
                <button
                  onClick={() => {
                    setConfigType("sla");
                    setOpenConfigModal(true);
                  }}
                  className="bg-[#263383] text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 justify-end"
                >
                  Save SLA Configuration
                </button>
              </div>
            )}

            {configType === "compliance" && (
              <ComplianceForm formData={formData} setFormData={setFormData} />
            )}

            {configType === "escalation" && (
              <div className="space-y-4">
                <EscalationForm formData={formData} setFormData={setFormData} />

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveEscalation}
                    className="bg-[#263383] text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Save Escalation
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RMSProjectDetails;
