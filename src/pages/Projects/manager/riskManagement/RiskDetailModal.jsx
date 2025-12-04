import React, { useEffect, useState } from "react";
import { AlertCircle, Plus, X, User, Tag, Pencil, Check } from "lucide-react";
import axios from "axios";
import AddMitigationForm from "./AddMitigationForm";
import MitigationList from "./MitigationList";
import CreateRiskModal from "./createRiskModal";

export default function RiskDetailModal({ risk, onClose, projectId }) {
  const [riskDetail, setRiskDetail] = useState(null);
  const [mitigations, setMitigations] = useState([]);
  const [members, setMembers] = useState([]);

  const [category, setCategory] = useState(null);
  const [owner, setOwner] = useState(null);
  const [reporter, setReporter] = useState(null);

  /* ===== STATUS ===== */
  const [status, setStatus] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [editingStatus, setEditingStatus] = useState(false);
  const [selectedStatusId, setSelectedStatusId] = useState(null);

  /* ===== EDIT RISK ===== */
  const [showEdit, setShowEdit] = useState(false);

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
        const riskReq = axios.get(`${BASE_URL}/api/risks/${risk.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

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
          ? axios.get(`${BASE_URL}/api/risk/category/${riskRes.categoryId}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          : null;

        const ownerReq = riskRes.ownerId
          ? axios.get(`${BASE_URL}/api/users/${riskRes.ownerId}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          : null;

        const reporterReq = riskRes.reporterId
          ? axios.get(`${BASE_URL}/api/users/${riskRes.reporterId}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          : null;

        const statusReq = riskRes.statusId
          ? axios.get(`${BASE_URL}/api/risk-statuses/${riskRes.statusId}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          : null;

        const [
          mitigationRes,
          membersRes,
          categoryRes,
          ownerRes,
          reporterRes,
          statusRes,
        ] = await Promise.all([
          mitigationReq,
          membersReq,
          categoryReq,
          ownerReq,
          reporterReq,
          statusReq,
        ]);

        if (!mounted) return;

        setRiskDetail(riskRes);
        setMitigations(mitigationRes?.data || []);
        setMembers(membersRes?.data || []);
        setCategory(categoryRes?.data || null);
        setOwner(ownerRes?.data || null);
        setReporter(reporterRes?.data || null);
        setStatus(statusRes?.data || null);
        setSelectedStatusId(statusRes?.data?.id || null);
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

  /* ===== STATUS EDIT ===== */
  async function startEditStatus() {
    const res = await axios.get(
      `${BASE_URL}/api/projects/${projectId}/risk-statuses`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setStatuses(res.data || []);
    setEditingStatus(true);
  }

  async function saveStatus() {
    await axios.patch(
      `${BASE_URL}/api/risks/${risk.id}/status`,
      { statusId: selectedStatusId },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const updated = statuses.find((s) => s.id === selectedStatusId);
    setStatus(updated || null);
    setEditingStatus(false);
  }

  function handleCreated(plan) {
    setMitigations((p) => [...p, plan]);
    setShowAdd(false);
  }

  function handleUpdated(updated) {
    setMitigations((p) => p.map((m) => (m.id === updated.id ? updated : m)));
  }

  function handleDeleted(id) {
    setMitigations((p) => p.filter((m) => m.id !== id));
  }

  if (!risk) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-600 text-white p-5 flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-lg">Risk #{risk.id}</h2>
            <p className="text-xs opacity-80">{riskDetail?.title || "-"}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowEdit(true)}
              className="flex items-center gap-1 text-sm text-white/90 hover:text-white"
            >
              <Pencil size={16} /> Edit Risk
            </button>

            <button onClick={onClose}>
              <X />
            </button>
          </div>
        </div>

        <CreateRiskModal
          isOpen={showEdit}
          onClose={() => setShowEdit(false)}
          projectId={projectId}
          risk={riskDetail} // ✅ THIS IS KEY
          onSuccess={() => window.location.reload()}
        />

        <div className="p-6 space-y-6">
          {loading && <p className="text-center text-sm">Loading...</p>}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {riskDetail && (
            <>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <Info
                  label="Category"
                  value={category?.name}
                  icon={<Tag size={14} />}
                />
                <Info
                  label="Owner"
                  value={owner?.name}
                  icon={<User size={14} />}
                />
                <Info
                  label="Reporter"
                  value={reporter?.name}
                  icon={<User size={14} />}
                />
                <Info label="Triggers" value={riskDetail.triggers || "-"} />
              </div>

              {/* Status */}
              <div className="flex items-center justify-between border rounded-lg p-3">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Status</div>

                  {!editingStatus ? (
                    <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium">
                      {status?.name || "-"}
                    </span>
                  ) : (
                    <select
                      value={selectedStatusId}
                      onChange={(e) =>
                        setSelectedStatusId(Number(e.target.value))
                      }
                      className="border rounded-md px-3 py-2 text-sm"
                    >
                      {statuses.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {!editingStatus ? (
                  <button
                    onClick={startEditStatus}
                    className="text-indigo-600 text-sm flex items-center gap-1"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingStatus(false)}
                      className="text-sm text-slate-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveStatus}
                      className="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1"
                    >
                      <Check size={14} /> Save
                    </button>
                  </div>
                )}
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
                onClick={() => setShowAdd(true)}
                className="flex items-center gap-1 text-indigo-600 text-sm"
              >
                <Plus size={16} /> Add
              </button>
            </div>

            {showAdd && (
              <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
                <div className="bg-white w-full max-w-md rounded-xl shadow-lg">
                  <AddMitigationForm
                    riskId={risk.id}
                    members={members}
                    onAdd={handleCreated}
                    onClose={() => setShowAdd(false)}
                  />
                </div>
              </div>
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
