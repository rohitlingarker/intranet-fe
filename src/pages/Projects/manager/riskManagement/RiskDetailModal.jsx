import React, { useEffect, useState } from "react";
import { AlertCircle, Plus, X, User, Tag } from "lucide-react";
import axios from "axios";
import AddMitigationForm from "./AddMitigationForm";
import MitigationList from "./MitigationList";

export default function RiskDetailModal({ risk, onClose, projectId }) {
  const [riskDetail, setRiskDetail] = useState(null);
  const [mitigations, setMitigations] = useState([]);
  const [members, setMembers] = useState([]);

  const [category, setCategory] = useState(null);
  const [owner, setOwner] = useState(null);
  const [reporter, setReporter] = useState(null);

  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const BASE_URL = import.meta.env.VITE_PMS_BASE_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!risk?.id) return;
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const riskReq = axios.get(
          `${BASE_URL}/api/risks/${risk.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const mitigationReq = axios
          .get(`${BASE_URL}/api/mitigation-plans/risk/${risk.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .catch(() => ({ data: [] }));

        const membersReq = axios.get(
          `${BASE_URL}/api/projects/${projectId}/members`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const riskRes = (await riskReq).data;

        const categoryReq = riskRes.categoryId
          ? axios.get(
              `${BASE_URL}/api/risk/category/${riskRes.categoryId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            )
          : null;

        const ownerReq = riskRes.ownerId
          ? axios.get(
              `${BASE_URL}/api/users/${riskRes.ownerId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            )
          : null;

        const reporterReq = riskRes.reporterId
          ? axios.get(
              `${BASE_URL}/api/users/${riskRes.reporterId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            )
          : null;

        const [
          mitigationRes,
          membersRes,
          categoryRes,
          ownerRes,
          reporterRes,
        ] = await Promise.all([
          mitigationReq,
          membersReq,
          categoryReq,
          ownerReq,
          reporterReq,
        ]);

        if (!mounted) return;

        setRiskDetail(riskRes);
        setMitigations(mitigationRes?.data || []);
        setMembers(membersRes?.data || []);
        setCategory(categoryRes?.data || null);
        setOwner(ownerRes?.data || null);
        setReporter(reporterRes?.data || null);
      } catch (err) {
        console.error(err);
        if (mounted) setError("Failed to load risk details");
      } finally {
        mounted && setLoading(false);
      }
    }

    load();
    return () => (mounted = false);
  }, [risk?.id, projectId, BASE_URL, token]);

  function handleCreated(plan) {
    setMitigations((p) => [...p, plan]);
    setShowAdd(false);
  }

  function handleUpdated(updated) {
    setMitigations((p) =>
      p.map((m) => (m.id === updated.id ? updated : m))
    );
  }

  function handleDeleted(id) {
    setMitigations((p) => p.filter((m) => m.id !== id));
  }

  if (!risk) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-600 text-white p-5 flex justify-between">
          <div>
            <h2 className="font-semibold text-lg">
              Risk #{risk.id}
            </h2>
            <p className="text-xs opacity-80">
              {riskDetail?.title || "-"}
            </p>
          </div>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {loading && <p className="text-center text-sm">Loading...</p>}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Core Details */}
          {riskDetail && (
            <>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <Info label="Category" value={category?.name} icon={<Tag size={14} />} />
                <Info label="Owner" value={owner?.name} icon={<User size={14} />} />
                <Info label="Reporter" value={reporter?.name} icon={<User size={14} />} />
                <Info label="Triggers" value={riskDetail.triggers || "-"} />
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <Metric label="Probability" value={riskDetail.probability} />
                <Metric label="Impact" value={riskDetail.impact} />
                <Metric label="Risk Score" value={riskDetail.riskScore} />
              </div>

              <div>
                <h4 className="font-medium mb-1">Description</h4>
                <p className="text-sm text-slate-700">
                  {riskDetail.description || "-"}
                </p>
              </div>
            </>
          )}

          {/* Mitigations */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold flex gap-2">
                <AlertCircle size={18} />
                Mitigation Plans
              </h4>
              <button
                onClick={() => setShowAdd((v) => !v)}
                className="flex items-center gap-1 text-indigo-600 text-sm"
              >
                <Plus size={16} /> Add
              </button>
            </div>

            {showAdd && (
              <AddMitigationForm
                riskId={risk.id}
                members={members}
                onAdd={handleCreated}
                onClose={() => setShowAdd(false)}
              />
            )}

            {mitigations.length === 0 ? (
              <p className="text-sm text-slate-500">
                No mitigation plans added yet.
              </p>
            ) : (
              <MitigationList
                mitigations={mitigations}
                members={members}
                onUpdated={handleUpdated}
                onDelete={handleDeleted}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="border rounded-lg p-4 text-center">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-xl font-bold">{value ?? "-"}</div>
    </div>
  );
}

function Info({ label, value, icon }) {
  return (
    <div className="flex items-center gap-2 border rounded-lg p-3">
      {icon}
      <div>
        <div className="text-xs text-slate-500">{label}</div>
        <div className="text-sm font-medium">{value || "-"}</div>
      </div>
    </div>
  );
}
