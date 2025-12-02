import {
  AlertCircle,
  Download,
  TrendingUp,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/* ---------- UI utils (same as main page) ---------- */

function getStatusColor(status) {
  const colors = {
    Identified: "bg-blue-100 text-blue-700",
    Analyzed: "bg-purple-100 text-purple-700",
    Monitoring: "bg-yellow-100 text-yellow-700",
    Mitigated: "bg-green-100 text-green-700",
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
  return {
    bg: "bg-green-50",
    text: "text-green-700",
    icon: "text-green-500",
  };
}

/* ---------- Component ---------- */

export default function RisksPanel({
  selectedIssue,
  riskItems,
  riskTotal,
  riskPage,
  riskTotalPages,
  isLoadingRisks,
  onPageChange,
  onSelectRisk,
}) {
  const highRiskCount = riskItems.filter(
    (r) => r.prob * r.impact >= 15
  ).length;

  const avgRiskScore =
    riskItems.length === 0
      ? 0
      : (
          riskItems.reduce((sum, r) => sum + r.prob * r.impact, 0) /
          riskItems.length
        ).toFixed(1);

  return (
    <div className="col-span-2 space-y-6">
      {/* Summary cards */}
      {selectedIssue && (
        <div className="grid grid-cols-3 gap-3">
          <SummaryCard
            label="TOTAL RISKS"
            value={riskTotal}
          />
          <SummaryCard
            label="HIGH RISK"
            value={highRiskCount}
            variant="danger"
          />
          <SummaryCard
            label="AVG SCORE"
            value={avgRiskScore}
            variant="info"
          />
        </div>
      )}

      {/* Risks list */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {!selectedIssue ? (
            <EmptyState />
          ) : isLoadingRisks ? (
            <LoadingState />
          ) : riskItems.length === 0 ? (
            <EmptyRisks />
          ) : (
            <div className="p-4 space-y-3">
              {riskItems.map((risk) => {
                const score = risk.prob * risk.impact;
                const colors = getRiskColor(score);

                return (
                  <button
                    key={risk.id}
                    onClick={() => onSelectRisk({ ...risk, score })}
                    className={`w-full text-left p-4 rounded-lg border-2 transition hover:shadow-md ${colors.bg} border-slate-200`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div
                            className={`text-lg font-bold ${colors.text}`}
                          >
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
                            <TrendingUp className="w-3 h-3" />
                            P:{risk.prob} I:{risk.impact}
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex items-center gap-1 text-xs text-slate-600">
                        <User className="w-3 h-3" />
                        {risk.owner}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {riskTotalPages > 1 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="text-xs text-slate-600">
              Page <span className="font-semibold">{riskPage}</span> of{" "}
              <span className="font-semibold">{riskTotalPages}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onPageChange(riskPage - 1)}
                disabled={riskPage === 1}
                className="p-1 hover:bg-slate-300 disabled:opacity-50 rounded transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => onPageChange(riskPage + 1)}
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
  );
}

/* ---------- Helper components ---------- */

function SummaryCard({ label, value, variant }) {
  const styles = {
    danger: "bg-red-50 border-red-200 text-red-700",
    info: "bg-blue-50 border-blue-200 text-blue-700",
    default: "bg-white border-slate-200 text-slate-900",
  };

  const applied = styles[variant] || styles.default;

  return (
    <div className={`p-4 rounded-lg border ${applied}`}>
      <div className="text-xs font-semibold mb-2 opacity-80">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="p-8 text-center text-slate-500">
      <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-50" />
      <p className="text-sm">Select an issue to view associated risks</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="p-8 text-center">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      <p className="text-sm text-slate-500 mt-2">Loading risks...</p>
    </div>
  );
}

function EmptyRisks() {
  return (
    <div className="p-8 text-center text-slate-500">
      <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-50" />
      <p className="text-sm">No risks for this issue</p>
    </div>
  );
}
