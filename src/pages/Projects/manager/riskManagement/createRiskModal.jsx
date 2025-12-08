import React, { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import { X } from "lucide-react";
import { showStatusToast } from "../../../../components/toastfy/toast";

const ISSUE_TYPES = ["Epic", "Story", "Task"];

const SCORE_OPTIONS = [1, 2, 3, 4, 5].map((v) => ({
  value: v,
  label: `${v}`,
}));

const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    width: "100%",
    borderRadius: "0.6rem",
    borderColor: state.isFocused ? "#000" : "#d1d5db",
    boxShadow: state.isFocused ? "0 0 0 1px #000" : "none",
    minHeight: "42px",
    fontSize: "0.95rem",
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};

const CreateRiskModal = ({
  isOpen,
  onClose,
  projectId,
  onSuccess,
  risk = null,
}) => {
  const isEditMode = Boolean(risk?.id);
  const BASE_URL = import.meta.env.VITE_PMS_BASE_URL;
  const token = localStorage.getItem("token");

  const [statuses, setStatuses] = useState([]);
  const [issues, setIssues] = useState([]);
  const [members, setMembers] = useState([]);
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    triggers: "",
    probability: null,
    impact: null,
    statusId: "",
    owner: null,
    reporter: null,
    category: null,
    linkedType: null,
    linkedIssue: null,
  });

  const handleChange = (field, value) =>
    setForm((p) => ({ ...p, [field]: value }));

  /* ------------------------------------
     LOAD MASTER DATA
  ------------------------------------ */
  useEffect(() => {
    if (!isOpen || !projectId) return;

    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      axios.get(`${BASE_URL}/api/projects/${projectId}/members`, { headers }),
      axios.get(`${BASE_URL}/api/projects/${projectId}/risk-statuses`, {
        headers,
      }),
      axios.get(`${BASE_URL}/api/risk/category`, { headers }),
    ])
      .then(([m, s, c]) => {
        setMembers(m.data || []);
        setStatuses(s.data || []);
        setCategories(c.data || []);
      })
      .catch(console.error);
  }, [isOpen, projectId]);

  /* ------------------------------------
     PREFILL EDIT MODE
  ------------------------------------ */
  useEffect(() => {
    if (!risk || !members.length || !categories.length) return;

    setForm({
      title: risk.title ?? "",
      description: risk.description ?? "",
      triggers: risk.triggers ?? "",
      statusId: risk.statusId ?? "",

      probability:
        SCORE_OPTIONS.find((p) => p.value === risk.probability) || null,

      impact: SCORE_OPTIONS.find((i) => i.value === risk.impact) || null,

      owner: members.find((m) => m.id === risk.ownerId)
        ? {
            value: risk.ownerId,
            label: members.find((m) => m.id === risk.ownerId).name,
          }
        : null,

      reporter: members.find((m) => m.id === risk.reporterId)
        ? {
            value: risk.reporterId,
            label: members.find((m) => m.id === risk.reporterId).name,
          }
        : null,

      category: categories.find((c) => c.id === risk.categoryId)
        ? {
            value: risk.categoryId,
            label: categories.find((c) => c.id === risk.categoryId).name,
          }
        : null,

      linkedType: null,
      linkedIssue: null,
    });
  }, [risk, members, categories]);

  /* ------------------------------------
     LOAD LINKED ISSUES
  ------------------------------------ */
  useEffect(() => {
    if (!form.linkedType || !projectId) return;

    const apiType =
      form.linkedType.value === "Story"
        ? "stories"
        : `${form.linkedType.value.toLowerCase()}s`;

    axios
      .get(`${BASE_URL}/api/projects/${projectId}/${apiType}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setIssues(res.data || []))
      .catch(console.error);
  }, [form.linkedType, projectId]);

  if (!isOpen) return null;

  /* ------------------------------------
     SUBMIT
  ------------------------------------ */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.title ||
      !form.statusId ||
      !form.owner ||
      !form.reporter ||
      !form.category
    ) {
      showStatusToast("Please fill all required fields", "error");
      return;
    }

    try {
      const payload = {
        projectId,
        title: form.title,
        description: form.description,
        probability: form.probability?.value,
        impact: form.impact?.value,
        triggers: form.triggers,
        statusId: form.statusId,
        ownerId: form.owner.value,
        reporterId: form.reporter.value,
        categoryId: form.category.value,
      };

      let riskId = risk?.id;

      if (isEditMode) {
        await axios.put(`${BASE_URL}/api/risks/${riskId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        const res = await axios.post(`${BASE_URL}/api/risks`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        riskId = res.data.id;
      }

      if (form.linkedType && form.linkedIssue) {
        await axios.post(
          `${BASE_URL}/api/risk-links`,
          {
            riskId,
            linkedType: form.linkedType.value,
            linkedId: form.linkedIssue.value,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      showStatusToast(
        isEditMode ? "Risk updated successfully" : "Risk created successfully",
        "success"
      );

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      showStatusToast("Operation failed", "error");
    }
  };

  /* ------------------------------------
     OPTIONS
  ------------------------------------ */
  const memberOptions = members.map((m) => ({
    value: m.id,
    label: m.name,
  }));

  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const issueOptions = issues.map((i) => ({
    value: i.id,
    label: i.title || i.name,
  }));

  /* ------------------------------------
     UI
  ------------------------------------ */
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl rounded-2xl p-5 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">
            {isEditMode ? "Edit Risk" : "Create Risk"}
          </h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* SCROLLABLE BODY ✅ */}
        <div className="overflow-y-auto pr-1">
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Risk Title *</label>
              <input
                className="w-full border rounded-lg px-3 py-1.5 mt-1"
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                rows={2}
                className="w-full border rounded-lg px-3 py-1.5 mt-1"
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </div>

            {/* Triggers */}
            <div className="md:col-span-2">
              <label className="text-sm font-medium">
                Triggers{" "}
                <span className="text-slate-500 text-xs">(Early warning)</span>
              </label>
              <textarea
                rows={1}
                className="w-full border rounded-lg px-3 py-1.5 mt-1"
                value={form.triggers}
                onChange={(e) => handleChange("triggers", e.target.value)}
              />
            </div>

            {/* Status */}
            <div>
              <label className="text-sm font-medium">Status *</label>
              <select
                className="w-full border rounded-lg px-3 py-1.5 mt-1"
                value={form.statusId}
                onChange={(e) => handleChange("statusId", e.target.value)}
              >
                <option value="">Select</option>
                {statuses.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="text-sm font-medium">Category *</label>
              <Select
                styles={customSelectStyles}
                options={categoryOptions}
                value={form.category}
                onChange={(v) => handleChange("category", v)}
                menuPortalTarget={document.body}
              />
            </div>

            {/* Owner */}
            <div>
              <label className="text-sm font-medium">Owner *</label>
              <Select
                styles={customSelectStyles}
                options={memberOptions}
                value={form.owner}
                onChange={(v) => handleChange("owner", v)}
                menuPortalTarget={document.body}
              />
            </div>

            {/* Reporter */}
            <div>
              <label className="text-sm font-medium">Reporter *</label>
              <Select
                styles={customSelectStyles}
                options={memberOptions}
                value={form.reporter}
                onChange={(v) => handleChange("reporter", v)}
                menuPortalTarget={document.body}
              />
            </div>

            {/* Probability */}
            <div>
              <label className="text-sm font-medium">Probability</label>
              <Select
                styles={customSelectStyles}
                options={SCORE_OPTIONS}
                value={form.probability}
                onChange={(v) => handleChange("probability", v)}
              />
            </div>

            {/* Impact */}
            <div>
              <label className="text-sm font-medium">Impact</label>
              <Select
                styles={customSelectStyles}
                options={SCORE_OPTIONS}
                value={form.impact}
                onChange={(v) => handleChange("impact", v)}
              />
            </div>

            {/* Linked Type */}
            <Select
              styles={customSelectStyles}
              options={ISSUE_TYPES.map((t) => ({ value: t, label: t }))}
              value={form.linkedType}
              onChange={(v) => {
                handleChange("linkedType", v);
                handleChange("linkedIssue", null);
              }}
              placeholder="Link Type"
            />

            {/* Linked Issue */}
            <Select
              styles={customSelectStyles}
              options={issueOptions}
              value={form.linkedIssue}
              onChange={(v) => handleChange("linkedIssue", v)}
              isDisabled={!form.linkedType}
              placeholder="Linked Item"
            />

            {/* Actions */}
            <div className="md:col-span-2 flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 border rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 bg-black text-white rounded-lg"
              >
                {isEditMode ? "Update Risk" : "Create Risk"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRiskModal;
