import React, { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  Download,
  Settings,
  AlertCircle,
  TrendingUp,
  Clock,
  User,
} from "lucide-react";
import CreateRiskModal from "./createRiskModal";

import axios from "axios";

/* Mock API functions */
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
      updatedAt: Date.now() - i * 1000 * 60 * 60,
      highRiskCount: Math.floor(Math.random() * 5),
      status: ["Open", "In Progress", "Review"][i % 3],
    }))
    .filter((it) =>
      !search ? true : it.title.toLowerCase().includes(search.toLowerCase())
    );

  const start = (page - 1) * size;
  const pageItems = all.slice(start, start + size);

  return new Promise((resolve) =>
    setTimeout(
      () => resolve({ total: all.length, page, size, items: pageItems }),
      220
    )
  );
}

function makeMockRisks(issueType, issueId, page = 1, size = 10) {
  const total = Math.floor(Math.random() * 24) + 1;
  const all = Array.from({ length: total }).map((_, i) => {
    const prob = Math.ceil(Math.random() * 5);
    const impact = Math.ceil(Math.random() * 5);
    return {
      id: `${issueId}-R-${i + 1}`,
      title: `Risk ${i + 1}: ${
        [
          "Performance degradation",
          "Data loss",
          "Security breach",
          "Timeline delay",
          "Budget overrun",
        ][i % 5]
      }`,
      description: "This is a critical risk that needs monitoring",
      prob,
      impact,
      status: ["Identified", "Analyzed", "Monitoring", "Mitigated"][i % 4],
      owner: ["Teja", "Anita", "Rahul"][i % 3],
      trend: ["↑", "↓", "→"][i % 3],
    };
  });

  const start = (page - 1) * size;
  const pageItems = all.slice(start, start + size);

  return new Promise((resolve) =>
    setTimeout(
      () => resolve({ total: all.length, page, size, items: pageItems }),
      240
    )
  );
}

/* Status color utilities */
function getStatusColor(status) {
  const colors = {
    Identified: "bg-blue-100 text-blue-700",
    Analyzed: "bg-purple-100 text-purple-700",
    Monitoring: "bg-yellow-100 text-yellow-700",
    Mitigated: "bg-green-100 text-green-700",
    Open: "bg-red-100 text-red-700",
    "In Progress": "bg-blue-100 text-blue-700",
    Review: "bg-purple-100 text-purple-700",
  };
  return colors[status] || "bg-gray-100 text-gray-700";
}

function getRiskColor(score) {
  if (score >= 20)
    return { bg: "bg-red-50", text: "text-red-700", icon: "text-red-500" };
  if (score >= 12)
    return {
      bg: "bg-orange-50",
      text: "text-orange-700",
      icon: "text-orange-500",
    };
  if (score >= 6)
    return {
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      icon: "text-yellow-500",
    };
  return { bg: "bg-green-50", text: "text-green-700", icon: "text-green-500" };
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function RiskRegisterPage({ projectId = "P-123" }) {
  const [showCreateRisk, setShowCreateRisk] = useState(false);

  // ISSUE TYPE SUMMARY from backend (separate from issues list)
  const [issueTypeSummary, setIssueTypeSummary] = useState([]);

  // Keep your existing issues list & UI mocks unchanged
  const [issues, setIssues] = useState([]);
  const ISSUE_TYPES = ["All", "Epics", "Stories", "Tasks", "Bugs"];
  const ISSUES_PAGE_SIZE = 10;
  const RISKS_PAGE_SIZE = 10;

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

        // store backend summary into dedicated state
        setIssueTypeSummary(res.data || []);

        // helpful debug log (optional)
        // console.log("Fetched issue type summary:", res.data);
      } catch (error) {
        console.error("Failed to fetch issue type summary", error);
      }
    }

    fetchSummary();
  }, [projectId]);

  // derive UI cards (All + backend summary) from issueTypeSummary
  const issueTypeCards = useMemo(() => {
    const total = (issueTypeSummary || []).reduce(
      (sum, i) => sum + (i.riskCount || 0),
      0
    );

    return [
      { issueType: "All", riskCount: total },
      ...(issueTypeSummary || []).map((it) => ({
        issueType: it.issueType,
        riskCount: it.riskCount ?? 0,
      })),
    ];
  }, [issueTypeSummary]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoadingIssues(true);
      try {
        const resp = await makeMockIssues(
          activeIssueType,
          issuePage,
          ISSUES_PAGE_SIZE,
          issueSearch
        );
        if (cancelled) return;
        setIssuesTotal(resp.total);
        setIssuesPageItems(resp.items);
        if (selectedIssue && selectedIssue.type !== activeIssueType) {
          setSelectedIssue(null);
          setRiskItems([]);
          setRiskTotal(0);
        }
      } catch (err) {
        console.error("Failed to load issues", err);
      } finally {
        if (!cancelled) setIsLoadingIssues(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [activeIssueType, issuePage, issueSearch]);

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
        const resp = await makeMockRisks(
          selectedIssue.type,
          selectedIssue.id,
          riskPage,
          RISKS_PAGE_SIZE
        );
        if (cancelled) return;
        setRiskTotal(resp.total);
        setRiskItems(resp.items);
      } catch (err) {
        console.error("Failed to load risks", err);
      } finally {
        if (!cancelled) setIsLoadingRisks(false);
      }
    }
    loadRisks();
    return () => {
      cancelled = true;
    };
  }, [selectedIssue, riskPage]);

  const issueTotalPages = Math.max(
    1,
    Math.ceil(issuesTotal / ISSUES_PAGE_SIZE)
  );
  const riskTotalPages = Math.max(1, Math.ceil(riskTotal / RISKS_PAGE_SIZE));

  const highRiskCount = useMemo(() => {
    return riskItems.filter((r) => r.prob * r.impact >= 15).length;
  }, [riskItems]);

  const avgRiskScore = useMemo(() => {
    if (riskItems.length === 0) return 0;
    const sum = riskItems.reduce((acc, r) => acc + r.prob * r.impact, 0);
    return (sum / riskItems.length).toFixed(1);
  }, [riskItems]);

  // helper to convert backend issueType into UI label (adds plural safely)
  function issueTypeLabel(raw) {
    if (!raw) return raw;
    // If already ends with 's' (Epics/Bugs), keep as-is
    if (raw.endsWith("s") || raw.endsWith("S")) return raw;
    // otherwise add 's' (Epic -> Epics, Story -> Storys? handle Story -> Stories)
    if (raw.toLowerCase() === "story") return "Stories";
    if (raw.toLowerCase() === "epic") return "Epics";
    if (raw.toLowerCase() === "task") return "Tasks";
    if (raw.toLowerCase() === "bug") return "Bugs";
    // fallback: append 's'
    return `${raw}`;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Risk Register
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Project {projectId} • Context-driven risk management
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-slate-100 rounded-lg transition">
                <Settings className="w-5 h-5 text-slate-600" />
              </button>
              <button
                onClick={() => setShowCreateRisk(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> New Risk
              </button>
              <CreateRiskModal
                projectId={projectId}
                isOpen={showCreateRisk}
                onClose={() => setShowCreateRisk(false)}
                onCreate={(data) => {
                  console.log("Create risk payload:", data);
                  // call API here
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Issue type filter with visual cards (BACKEND DRIVEN) */}
        <div className="grid grid-cols-5 gap-3">
          {issueTypeCards.map((t) => {
            const label = issueTypeLabel(t.issueType);
            const isActive = activeIssueType === label;
            return (
              <button
                key={t.issueType}
                onClick={() => {
                  setActiveIssueType(label);
                  setIssuePage(1);
                  setSelectedIssue(null);
                  setRiskPage(1);
                }}
                className={`p-4 rounded-lg transition-all transform hover:scale-105 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg ring-2 ring-indigo-400"
                    : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
                }`}
              >
                <div className="font-semibold text-sm">{label}</div>
                <div
                  className={`text-xs mt-1 ${
                    isActive ? "text-indigo-100" : "text-slate-500"
                  }`}
                >
                  {t.riskCount ?? 0} items
                </div>
              </button>
            );
          })}
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left: Issues panel */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-blue-50">
              <h2 className="font-semibold text-slate-900 mb-3">
                {activeIssueType} Issues
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={`Search ${activeIssueType}...`}
                  value={issueSearch}
                  onChange={(e) => {
                    setIssueSearch(e.target.value);
                    setIssuePage(1);
                  }}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Sticky selected issue */}
            {selectedIssue && (
              <div className="p-4 bg-indigo-50 border-b-2 border-indigo-200 sticky top-0">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-semibold text-indigo-600 mb-1">
                      SELECTED
                    </div>
                    <div className="font-semibold text-slate-900 text-sm">
                      {selectedIssue.id}
                    </div>
                    <div className="text-xs text-slate-600 mt-1 line-clamp-1">
                      {selectedIssue.title}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedIssue(null);
                      setRiskItems([]);
                    }}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Issues list */}
            <div className="flex-1 overflow-y-auto">
              {isLoadingIssues ? (
                <div className="p-6 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  <p className="text-sm text-slate-500 mt-2">Loading issues...</p>
                </div>
              ) : issuesPageItems.length === 0 ? (
                <div className="p-6 text-center text-slate-500">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No issues found</p>
                </div>
              ) : (
                <div className="p-3 space-y-2">
                  {issuesPageItems.map((issue) => (
                    <button
                      key={issue.id}
                      onClick={() => {
                        setSelectedIssue(issue);
                        setRiskPage(1);
                      }}
                      className={`w-full text-left p-3 rounded-lg transition ${
                        selectedIssue?.id === issue.id
                          ? "bg-indigo-100 border-2 border-indigo-400"
                          : "hover:bg-slate-50 border border-slate-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-sm text-slate-900">
                            {issue.id}
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                            {issue.title}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span
                              className={`text-xs px-2 py-1 rounded ${getStatusColor(
                                issue.status
                              )}`}
                            >
                              {issue.status}
                            </span>
                            {issue.highRiskCount > 0 && (
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-semibold">
                                {issue.highRiskCount} high
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Issues pagination */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="text-xs text-slate-600">
                Page <span className="font-semibold">{issuePage}</span> of{" "}
                <span className="font-semibold">{issueTotalPages}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIssuePage((p) => Math.max(1, p - 1))}
                  disabled={issuePage === 1}
                  className="p-1 hover:bg-slate-200 disabled:opacity-50 rounded transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    setIssuePage((p) => Math.min(issueTotalPages, p + 1))
                  }
                  disabled={issuePage === issueTotalPages}
                  className="p-1 hover:bg-slate-200 disabled:opacity-50 rounded transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right: Risks panel */}
          <div className="col-span-2 space-y-6">
            {/* Risk summary cards */}
            {selectedIssue && (
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                  <div className="text-xs text-slate-500 font-semibold mb-2">
                    TOTAL RISKS
                  </div>
                  <div className="text-2xl font-bold text-slate-900">
                    {riskTotal}
                  </div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <div className="text-xs text-red-600 font-semibold mb-2">
                    HIGH RISK
                  </div>
                  <div className="text-2xl font-bold text-red-700">
                    {highRiskCount}
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="text-xs text-blue-600 font-semibold mb-2">
                    AVG SCORE
                  </div>
                  <div className="text-2xl font-bold text-blue-700">
                    {avgRiskScore}
                  </div>
                </div>
              </div>
            )}

            {/* Risks list */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-blue-50 flex justify-between items-center">
                <div>
                  <h2 className="font-semibold text-slate-900">
                    Risks {selectedIssue ? `for ${selectedIssue.id}` : ""}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {isLoadingRisks
                      ? "Loading..."
                      : selectedIssue
                      ? `${riskTotal} risks identified`
                      : "Select an issue to view risks"}
                  </p>
                </div>
                {selectedIssue && (
                  <button className="p-2 hover:bg-slate-200 rounded-lg transition">
                    <Download className="w-4 h-4 text-slate-600" />
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto">
                {!selectedIssue ? (
                  <div className="p-8 text-center text-slate-500">
                    <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">
                      Select an issue to view associated risks
                    </p>
                  </div>
                ) : isLoadingRisks ? (
                  <div className="p-8 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <p className="text-sm text-slate-500 mt-2">Loading risks...</p>
                  </div>
                ) : riskItems.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No risks for this issue</p>
                  </div>
                ) : (
                  <div className="p-4 space-y-3">
                    {riskItems.map((risk) => {
                      const score = risk.prob * risk.impact;
                      const colors = getRiskColor(score);
                      return (
                        <button
                          key={risk.id}
                          onClick={() => {
                            setSelectedRisk({ ...risk, score });
                            setShowRiskModal(true);
                          }}
                          className={`w-full text-left p-4 rounded-lg border-2 transition hover:shadow-md ${colors.bg} border-slate-200`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <div className={`text-lg font-bold ${colors.text}`}>
                                  {score}
                                </div>
                                <div className={`text-xl ${colors.icon}`}>
                                  {risk.trend}
                                </div>
                              </div>
                              <div className="font-semibold text-slate-900 mt-1 text-sm">
                                {risk.title}
                              </div>
                              <div className="flex items-center gap-3 mt-2">
                                <span
                                  className={`text-xs px-2 py-1 rounded ${getStatusColor(
                                    risk.status
                                  )}`}
                                >
                                  {risk.status}
                                </span>
                                <div className="flex items-center gap-1 text-xs text-slate-600">
                                  <TrendingUp className="w-3 h-3" /> P:
                                  {risk.prob} I:{risk.impact}
                                </div>
                              </div>
                            </div>
                            <div className="text-right flex items-center gap-1 text-xs text-slate-600">
                              <User className="w-3 h-3" /> {risk.owner}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Risk pagination */}
              {riskTotalPages > 1 && (
                <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="text-xs text-slate-600">
                    Page <span className="font-semibold">{riskPage}</span> of{" "}
                    <span className="font-semibold">{riskTotalPages}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setRiskPage((p) => Math.max(1, p - 1))}
                      disabled={riskPage === 1}
                      className="p-1 hover:bg-slate-300 disabled:opacity-50 rounded transition"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        setRiskPage((p) => Math.min(riskTotalPages, p + 1))
                      }
                      disabled={riskPage === riskTotalPages}
                      className="p-1 hover:bg-slate-300 disabled:opacity-50 rounded transition"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Risk Detail Modal */}
      {showRiskModal && selectedRisk && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-blue-600 p-6 text-white flex justify-between items-start">
              <div>
                <div className="text-xs font-semibold opacity-90 mb-1">RISK DETAILS</div>
                <h3 className="text-xl font-bold">{selectedRisk.id}</h3>
              </div>
              <button
                onClick={() => setShowRiskModal(false)}
                className="text-white hover:bg-white/20 p-1 rounded transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">{selectedRisk.title}</h4>
                <p className="text-sm text-slate-600">{selectedRisk.description}</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <div className="text-xs text-purple-600 font-semibold mb-1">PROBABILITY</div>
                  <div className="text-2xl font-bold text-purple-700">{selectedRisk.prob}/5</div>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                  <div className="text-xs text-orange-600 font-semibold mb-1">IMPACT</div>
                  <div className="text-2xl font-bold text-orange-700">{selectedRisk.impact}/5</div>
                </div>
                <div className={`p-3 rounded-lg border-2 ${getRiskColor(selectedRisk.score).bg}`}>
                  <div className="text-xs font-semibold mb-1" style={{ color: getRiskColor(selectedRisk.score).text.split("-")[1] }}>
                    SCORE
                  </div>
                  <div className="text-2xl font-bold" style={{ color: getRiskColor(selectedRisk.score).text.split("-")[1] }}>
                    {selectedRisk.score}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600">STATUS</label>
                  <div className={`mt-2 text-xs px-3 py-2 rounded inline-block ${getStatusColor(selectedRisk.status)}`}>
                    {selectedRisk.status}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">OWNER</label>
                  <div className="mt-2 text-sm font-semibold text-slate-900">{selectedRisk.owner}</div>
                </div>
              </div>

              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                <h5 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-indigo-600" /> Mitigation Actions
                </h5>
                <p className="text-sm text-slate-600">Add mitigation strategies, action plans, or link playbooks here.</p>
                <button className="mt-3 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition">+ Add Mitigation</button>
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-200">
                <button className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-sm font-medium transition">Edit</button>
                <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
