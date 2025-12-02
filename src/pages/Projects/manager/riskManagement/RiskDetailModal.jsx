import { AlertCircle } from "lucide-react";

export default function RiskDetailModal({ risk, onClose }) {
  if (!risk) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full">
        {/* Header */}
        <div className="bg-indigo-600 text-white p-6 flex justify-between">
          <h3 className="font-bold">{risk.id}</h3>
          <button onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <h4 className="font-semibold">{risk.title}</h4>
            <p className="text-sm text-slate-600">{risk.description}</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Metric label="Probability" value={risk.prob} />
            <Metric label="Impact" value={risk.impact} />
            <Metric label="Score" value={risk.prob * risk.impact} />
          </div>

          <div className="bg-indigo-50 p-4 rounded">
            <h5 className="font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Mitigation
            </h5>
            <p className="text-sm text-slate-600">
              Add mitigation plans here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="border p-3 rounded text-center">
      <div className="text-xs font-semibold text-slate-500">{label}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}
