import React, { useEffect, useState } from "react";
import axios from "axios";
import { X, AlertTriangle, ShieldCheck, Info } from "lucide-react";

const RISK_LEVELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

const RiskHealthModal = ({ projectId, open, onClose }) => {
  const [summary, setSummary] = useState(null);
  const [currentRisk, setCurrentRisk] = useState(null);
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {
      try {
        const [summaryRes, projectRes] = await Promise.all([
          axios.get(
            `${import.meta.env.VITE_PMS_BASE_URL}/api/projects/project-risk-status/${projectId}`,
            { headers }
          ),
          axios.get(
            `${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}`,
            { headers }
          ),
        ]);

        setSummary(summaryRes.data);
        setCurrentRisk(projectRes.data.riskLevel);
        setSelectedRisk(projectRes.data.riskLevel);
      } catch (err) {
        console.error("Failed to load risk data", err);
      }
    };

    fetchData();
  }, [open, projectId]);

  const updateRiskLevel = async () => {
    try {
      setLoading(true);
      await axios.patch(
        `${import.meta.env.VITE_PMS_BASE_URL}/api/projects/${projectId}/risk-level`,
        { riskLevel: selectedRisk },
        { headers }
      );
      onClose();
    } catch (err) {
      console.error("Failed to update risk level", err);
    } finally {
      setLoading(false);
    }
  };

  if (!open || !summary || !currentRisk) return null;

  const healthStyles = {
    LOW: "bg-green-50 text-green-700 border-green-200",
    MEDIUM: "bg-yellow-50 text-yellow-700 border-yellow-200",
    HIGH: "bg-red-50 text-red-700 border-red-200",
    CRITICAL: "bg-purple-50 text-purple-700 border-purple-200",
  };

  const utilization = Math.round(
    (summary.totalRiskScore / summary.maxRiskScore) * 100
  );

  const isOverride = selectedRisk !== summary.riskHealth;
  const isNoChange = selectedRisk === currentRisk;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex sm:items-center sm:justify-center">
      {/* Modal */}
      <div className="
        bg-white w-full sm:max-w-4xl lg:max-w-6xl
        h-full sm:h-auto
        sm:rounded-2xl
        flex flex-col
      ">
        {/* Header */}
        <div className="flex justify-between items-center px-4 sm:px-6 py-4 border-b">
          <h2 className="text-base sm:text-xl font-semibold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            Project Risk Overview
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT */}
            <div>
              <div
                className={`border rounded-xl p-4 text-center mb-4 ${healthStyles[summary.riskHealth]}`}
              >
                <div className="text-xs uppercase tracking-wide">
                  System Calculated Risk
                </div>
                <div className="text-2xl sm:text-3xl font-bold mt-1">
                  {summary.riskHealth}
                </div>
              </div>

              <div className="bg-slate-50 border rounded-lg p-3 mb-6 text-center">
                <div className="text-xs text-slate-500">
                  Current Project Risk Level
                </div>
                <div className="text-lg font-semibold">{currentRisk}</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Stat label="Total Active Risks" value={summary.totalActiveRisks} />
                <Stat label="Total Risk Score" value={summary.totalRiskScore} />
                <Stat label="Max Risk Score" value={summary.maxRiskScore} />
                <Stat label="Score Utilization" value={`${utilization}%`} />
              </div>
            </div>

            {/* RIGHT */}
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Risk Distribution
              </h4>

              <div className="grid grid-cols-3 gap-3 text-center mb-6">
                <RiskPill label="High" value={summary.highRisks} color="red" />
                <RiskPill label="Medium" value={summary.mediumRisks} color="yellow" />
                <RiskPill label="Low" value={summary.lowRisks} color="green" />
              </div>

              <label className="text-sm font-semibold mb-2 block">
                Final Risk Level
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                {RISK_LEVELS.map((level) => (
                  <button
                    key={level}
                    onClick={() => setSelectedRisk(level)}
                    className={`px-3 py-2 rounded-lg border text-sm font-medium
                      ${
                        selectedRisk === level
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                  >
                    {level}
                  </button>
                ))}
              </div>

              {isOverride && (
                <div className="flex gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
                  <Info className="w-4 h-4 mt-0.5" />
                  You are overriding the system-calculated risk recommendation.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer (sticky on mobile) */}
        <div className="border-t px-4 sm:px-6 py-3 flex justify-end gap-3 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border text-slate-600"
          >
            Cancel
          </button>

          <button
            onClick={updateRiskLevel}
            disabled={loading || isNoChange}
            className="px-5 py-2 rounded-lg bg-indigo-600 text-white disabled:opacity-40"
          >
            {loading ? "Updating..." : "Apply Risk Level"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------- Sub Components ---------- */

const Stat = ({ label, value }) => (
  <div className="bg-slate-50 rounded-lg p-4 text-center">
    <div className="text-xs text-slate-500">{label}</div>
    <div className="text-lg font-semibold mt-1">{value}</div>
  </div>
);

const RiskPill = ({ label, value, color }) => {
  const styles = {
    red: "bg-red-50 text-red-600",
    yellow: "bg-yellow-50 text-yellow-600",
    green: "bg-green-50 text-green-600",
  };

  return (
    <div className={`rounded-lg p-3 ${styles[color]}`}>
      <div className="text-xs uppercase">{label}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
};

export default RiskHealthModal;
