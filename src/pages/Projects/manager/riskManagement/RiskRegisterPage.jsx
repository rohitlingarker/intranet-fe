import React, { useEffect, useMemo, useState } from "react";
import { Plus, Settings } from "lucide-react";
import axios from "axios";

import CreateRiskModal from "./createRiskModal";
import IssuesPanel from "./IssuesPanel";
import RisksPanel from "./RisksPanel";
import RiskDetailModal from "./RiskDetailModal";

/* =========================
   Page
========================= */

export default function RiskRegisterPage({ projectId = "P-123" }) {
  const ISSUES_PAGE_SIZE = 10;
  const RISKS_PAGE_SIZE = 10;

  /* ---------- UI State ---------- */

  const [showCreateRisk, setShowCreateRisk] = useState(false);
  const [showRiskModal, setShowRiskModal] = useState(false);

  /* ---------- Issue Summary ---------- */

  const [issueTypeSummary, setIssueTypeSummary] = useState([]);
  const [activeIssueType, setActiveIssueType] = useState("All");
  const [issueSearch, setIssueSearch] = useState("");
  const [issuePage, setIssuePage] = useState(1);

  const [selectedIssue, setSelectedIssue] = useState(null);
  const [selectedRisk, setSelectedRisk] = useState(null);

  const [isLoadingIssues, setIsLoadingIssues] = useState(false);
  const [isLoadingRisks, setIsLoadingRisks] = useState(false);

  /* ---------- Risks ---------- */

  const [riskData, setRiskData] = useState(null);
  const [riskPage, setRiskPage] = useState(1);

  /* =========================
     Fetch Issue-Type Summary
  ========================= */

  useEffect(() => {
    async function fetchSummary() {
      try {
        const token = localStorage.getItem("token");
        const BASE_URL = import.meta.env.VITE_PMS_BASE_URL;

        const res = await axios.get(
          `${BASE_URL}/api/risk-links/${projectId}/risk-summary/by-issue-type`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setIssueTypeSummary(res.data || []);
      } catch (err) {
        console.error("Failed to fetch issue summary", err);
      }
    }

    fetchSummary();
  }, [projectId]);

  /* =========================
     Issue Type Cards
  ========================= */

  const issueTypeCards = useMemo(() => {
    const total = issueTypeSummary.reduce(
      (sum, it) => sum + (it.riskCount || 0),
      0
    );

    return [
      { issueType: "All", riskCount: total },
      ...issueTypeSummary.map((it) => ({
        issueType: it.issueType,
        riskCount: it.riskCount ?? 0,
      })),
    ];
  }, [issueTypeSummary]);

  function issueTypeLabel(raw) {
    if (!raw) return raw;
    if (raw.toLowerCase() === "story") return "Stories";
    if (raw.toLowerCase() === "epic") return "Epics";
    if (raw.toLowerCase() === "task") return "Tasks";
    if (raw.toLowerCase() === "bug") return "Bugs";
    return raw;
  }

  /* =========================
     Load Risks (Backend)
  ========================= */

  useEffect(() => {
    let cancelled = false;

    async function loadRisks() {
      if (!selectedIssue) {
        setRiskData(null);
        return;
      }

      setIsLoadingRisks(true);

      try {
        const token = localStorage.getItem("token");
        const BASE_URL = import.meta.env.VITE_PMS_BASE_URL;
        console.log("selectedIssue", selectedIssue);

        const res = await axios.get(`${BASE_URL}/api/risks/linked`, {
          params: {
            projectId,
            linkedType: selectedIssue.linkedType,
            linkedId: selectedIssue.linkedId,
            page: riskPage,
            size: RISKS_PAGE_SIZE,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!cancelled) {
          setRiskData(res.data);
        }
      } catch (err) {
        console.error("Failed to load risks", err);
        if (!cancelled) setRiskData(null);
      } finally {
        if (!cancelled) setIsLoadingRisks(false);
      }
    }

    loadRisks();
    return () => (cancelled = true);
  }, [selectedIssue, riskPage, projectId]);

  /* =========================
     Render
  ========================= */

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between">
          <div>
            <h1 className="text-3xl font-bold">Risk Register</h1>
            <p className="text-sm text-slate-500">Project {projectId}</p>
          </div>

          <div className="flex gap-3">
            <button className="p-2 hover:bg-slate-100 rounded-lg">
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowCreateRisk(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Risk
            </button>
          </div>

          <CreateRiskModal
            projectId={projectId}
            isOpen={showCreateRisk}
            onClose={() => setShowCreateRisk(false)}
            onCreate={() => {
              setShowCreateRisk(false);
              setRiskPage(1);
            }}
          />
        </div>
      </div>

      {/* Issue Type Cards */}
      <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-5 gap-4">
        {issueTypeCards.map((t) => {
          const label = issueTypeLabel(t.issueType);
          const active = activeIssueType === label;

          return (
            <button
              key={label}
              onClick={() => {
                setActiveIssueType(label);
                setIssuePage(1);
                setSelectedIssue(null);
                setRiskPage(1);
                setRiskData(null);
              }}
              className={`p-4 rounded-lg ${
                active ? "bg-indigo-600 text-white" : "bg-white border"
              }`}
            >
              <div className="font-semibold">{label}</div>
              <div className="text-xs opacity-80">{t.riskCount} items</div>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-3 gap-6">
        <IssuesPanel
          projectId={projectId}
          activeIssueType={activeIssueType}
          issueSearch={issueSearch}
          issuePage={issuePage}
          setIssuePage={setIssuePage}
          selectedIssue={selectedIssue}
          isLoadingIssues={isLoadingIssues}
          onSelectIssue={(issue) => {
            setSelectedIssue(issue);
            setRiskPage(1);
            setRiskData(null);
          }}
        />

        <RisksPanel
          selectedIssue={selectedIssue}
          data={riskData}
          isLoadingRisks={isLoadingRisks}
          onPageChange={setRiskPage}
          onSelectRisk={(risk) => {
            setSelectedRisk(risk);
            setShowRiskModal(true);
          }}
        />
      </div>

      <RiskDetailModal
        risk={showRiskModal ? selectedRisk : null}
        onClose={() => setShowRiskModal(false)}
        projectId={projectId}
      />
    </div>
  );
}
