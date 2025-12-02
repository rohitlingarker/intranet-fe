import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Settings,
} from "lucide-react";
import axios from "axios";

import CreateRiskModal from "./createRiskModal";
import IssuesPanel from "./IssuesPanel";
import RisksPanel from "./RisksPanel";
import RiskDetailModal from "./RiskDetailModal";

/* =========================
   Mock API
========================= */

const MOCK_TOTAL_BY_TYPE = {
  All: 124,
  Epics: 42,
  Stories: 53,
  Tasks: 20,
  Bugs: 9,
};

function makeMockIssues(type, page = 1, size = 10, search = "") {
  const base = (type === "All" ? "E" : type[0]).toUpperCase();
  const total = MOCK_TOTAL_BY_TYPE[type] ?? 0;

  const all = Array.from({ length: total })
    .map((_, i) => ({
      id: `${base}-${i + 1}`,
      title: `${type} ${i + 1}: Important feature implementation`,
      type,
      updatedAt: Date.now() - i * 60 * 60 * 1000,
      highRiskCount: Math.floor(Math.random() * 5),
      status: ["Open", "In Progress", "Review"][i % 3],
    }))
    .filter((it) =>
      !search ? true : it.title.toLowerCase().includes(search.toLowerCase())
    );

  const start = (page - 1) * size;
  return Promise.resolve({
    total: all.length,
    page,
    size,
    items: all.slice(start, start + size),
  });
}

function makeMockRisks(issueType, issueId, page = 1, size = 10) {
  const total = Math.floor(Math.random() * 20) + 1;

  const all = Array.from({ length: total }).map((_, i) => {
    const prob = Math.ceil(Math.random() * 5);
    const impact = Math.ceil(Math.random() * 5);
    return {
      id: `${issueId}-R-${i + 1}`,
      title: `Risk ${i + 1}`,
      description: "Potential issue requiring mitigation",
      prob,
      impact,
      status: ["Identified", "Analyzed", "Monitoring", "Mitigated"][i % 4],
      owner: ["Teja", "Anita", "Rahul"][i % 3],
      trend: ["↑", "↓", "→"][i % 3],
    };
  });

  const start = (page - 1) * size;
  return Promise.resolve({
    total: all.length,
    page,
    size,
    items: all.slice(start, start + size),
  });
}

/* =========================
   Page
========================= */

export default function RiskRegisterPage({ projectId = "P-123" }) {
  const ISSUES_PAGE_SIZE = 10;
  const RISKS_PAGE_SIZE = 10;

  const [showCreateRisk, setShowCreateRisk] = useState(false);

  const [issueTypeSummary, setIssueTypeSummary] = useState([]);

  const [activeIssueType, setActiveIssueType] = useState("All");
  const [issueSearch, setIssueSearch] = useState("");
  const [issuePage, setIssuePage] = useState(1);
  const [issuesTotal, setIssuesTotal] = useState(0);
  const [issuesPageItems, setIssuesPageItems] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);

  const [riskPage, setRiskPage] = useState(1);
  const [riskTotal, setRiskTotal] = useState(0);
  const [riskItems, setRiskItems] = useState([]);

  const [selectedRisk, setSelectedRisk] = useState(null);
  const [isLoadingIssues, setIsLoadingIssues] = useState(false);
  const [isLoadingRisks, setIsLoadingRisks] = useState(false);
  const [showRiskModal, setShowRiskModal] = useState(false);

  /* ===== Fetch Issue-Type Summary ===== */

  useEffect(() => {
    async function fetchSummary() {
      try {
        const token = localStorage.getItem("token");
        const BASE_URL = import.meta.env.VITE_PMS_BASE_URL;

        const res = await axios.get(
          `${BASE_URL}/api/risk-links/${projectId}/risk-summary/by-issue-type`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setIssueTypeSummary(res.data || []);
      } catch (err) {
        console.error("Failed to fetch issue summary", err);
      }
    }

    fetchSummary();
  }, [projectId]);

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

  /* ===== Load Issues ===== */

  useEffect(() => {
    let cancelled = false;

    async function loadIssues() {
      setIsLoadingIssues(true);
      try {
        const res = await makeMockIssues(
          activeIssueType,
          issuePage,
          ISSUES_PAGE_SIZE,
          issueSearch
        );
        if (!cancelled) {
          setIssuesTotal(res.total);
          setIssuesPageItems(res.items);
        }
      } finally {
        if (!cancelled) setIsLoadingIssues(false);
      }
    }

    loadIssues();
    return () => (cancelled = true);
  }, [activeIssueType, issuePage, issueSearch]);

  /* ===== Load Risks ===== */

  useEffect(() => {
    let cancelled = false;

    async function loadRisks() {
      if (!selectedIssue) {
        setRiskItems([]);
        setRiskTotal(0);
        return;
      }

      setIsLoadingRisks(true);
      try {
        const res = await makeMockRisks(
          selectedIssue.type,
          selectedIssue.id,
          riskPage,
          RISKS_PAGE_SIZE
        );
        if (!cancelled) {
          setRiskTotal(res.total);
          setRiskItems(res.items);
        }
      } finally {
        if (!cancelled) setIsLoadingRisks(false);
      }
    }

    loadRisks();
    return () => (cancelled = true);
  }, [selectedIssue, riskPage]);

  const riskTotalPages = Math.max(1, Math.ceil(riskTotal / RISKS_PAGE_SIZE));

  function issueTypeLabel(raw) {
    if (!raw) return raw;
    if (raw.toLowerCase() === "story") return "Stories";
    if (raw.toLowerCase() === "epic") return "Epics";
    if (raw.toLowerCase() === "task") return "Tasks";
    if (raw.toLowerCase() === "bug") return "Bugs";
    return raw;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between">
          <div>
            <h1 className="text-3xl font-bold">Risk Register</h1>
            <p className="text-sm text-slate-500">
              Project {projectId}
            </p>
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
            onCreate={(data) => console.log("Create risk:", data)}
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
              }}
              className={`p-4 rounded-lg ${
                active
                  ? "bg-indigo-600 text-white"
                  : "bg-white border"
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
          onSelectIssue={(issue) => {
            setSelectedIssue(issue);
            setRiskPage(1);
            setRiskItems([]);
          }}
        />

        <RisksPanel
          selectedIssue={selectedIssue}
          riskItems={riskItems}
          riskTotal={riskTotal}
          riskPage={riskPage}
          riskTotalPages={riskTotalPages}
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
      />
    </div>
  );
}
