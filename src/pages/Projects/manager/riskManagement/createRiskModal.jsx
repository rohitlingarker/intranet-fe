// src/components/modals/CreateRiskModal.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import { X } from "lucide-react";
import { showStatusToast } from "../../../../components/toastfy/toast";

const ISSUE_TYPES = ["Epic", "Story", "Task"];

const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    borderRadius: "0.5rem",
    borderColor: state.isFocused ? "#000" : "#d1d5db",
    boxShadow: state.isFocused ? "0 0 0 1px #000" : "none",
    minHeight: "40px",
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};

/**
 * @props
 * isOpen
 * onClose
 * projectId
 * onSuccess
 * risk (optional) -> if present = EDIT MODE
 */
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

  /* ---------- FORM STATE ---------- */
  const [form, setForm] = useState({
    title: "",
    description: "",
    probability: "",
    impact: "",
    triggers: "",
    statusId: "",
    ownerId: null,
    reporterId: null,
    linkedType: "",
    linkedId: null,
    categoryId: null,
  });

  /* ---------- PREFILL (EDIT MODE) ---------- */
  useEffect(() => {
    if (!isOpen || !risk) return;

    setForm({
      title: risk.title || "",
      description: risk.description || "",
      probability: risk.probability ?? "",
      impact: risk.impact ?? "",
      triggers: risk.triggers || "",
      statusId: risk.statusId || "",
      ownerId: risk.owner
        ? { value: risk.owner.id, label: risk.owner.name }
        : null,
      reporterId: risk.reporter
        ? { value: risk.reporter.id, label: risk.reporter.name }
        : null,
      linkedType: risk.linkedType || "",
      linkedId: risk.linkedIssue
        ? {
            value: risk.linkedIssue.id,
            label: risk.linkedIssue.title,
          }
        : null,
      categoryId: risk.category
        ? { value: risk.category.id, label: risk.category.name }
        : null,
    });
  }, [risk, isOpen]);

  /* ---------- PROJECT MEMBERS ---------- */
  useEffect(() => {
    if (!projectId) return;

    axios
      .get(`${BASE_URL}/api/projects/${projectId}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) =>
        setMembers(Array.isArray(res.data) ? res.data : res.data?.content || [])
      )
      .catch(console.error);
  }, [projectId]);

  /* ---------- STATUSES ---------- */
  useEffect(() => {
    if (!isOpen || !projectId) return;

    axios
      .get(`${BASE_URL}/api/projects/${projectId}/risk-statuses`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setStatuses(res.data || []))
      .catch(console.error);
  }, [isOpen, projectId]);

  /* ---------- CATEGORIES ---------- */
  useEffect(() => {
    if (!isOpen) return;

    axios
      .get(`${BASE_URL}/api/risk/category`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCategories(res.data || []))
      .catch(console.error);
  }, [isOpen]);

  /* ---------- LINKED ISSUES ---------- */
  useEffect(() => {
    if (!form.linkedType || !projectId) return;

    const apiType =
      form.linkedType === "Story"
        ? "stories"
        : `${form.linkedType.toLowerCase()}s`;

    axios
      .get(`${BASE_URL}/api/projects/${projectId}/${apiType}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setIssues(res.data || []))
      .catch(console.error);
  }, [form.linkedType, projectId]);

  if (!isOpen) return null;

  const handleChange = (field, value) =>
    setForm((p) => ({ ...p, [field]: value }));

  /* ---------- SUBMIT ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        projectId,
        title: form.title,
        description: form.description,
        probability: Number(form.probability),
        impact: Number(form.impact),
        triggers: form.triggers,
        statusId: form.statusId,
        ownerId: form.ownerId.value,
        reporterId: form.reporterId.value,
        categoryId: form.categoryId.value,
      };

      let riskId = risk?.id;

      /* ---------- CREATE / UPDATE ---------- */
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

      /* ---------- LINK ISSUE ---------- */
      await axios.post(
        `${BASE_URL}/api/risk-links`,
        {
          riskId,
          linkedType: form.linkedType,
          linkedId: form.linkedId.value,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

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

  /* ---------- OPTIONS ---------- */
  const memberOptions = members.map((m) => ({
    value: m.id,
    label: m.name,
  }));
  const issueOptions = issues.map((i) => ({
    value: i.id,
    label: i.title || i.name,
  }));
  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl p-6">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {isEditMode ? "Edit Risk" : "Create Risk"}
          </h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Risk title *"
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
          />

          <textarea
            rows={3}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Description"
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              min={1}
              max={5}
              placeholder="Probability"
              className="border rounded-lg px-3 py-2"
              value={form.probability}
              onChange={(e) => handleChange("probability", e.target.value)}
            />
            <input
              type="number"
              min={1}
              max={5}
              placeholder="Impact"
              className="border rounded-lg px-3 py-2"
              value={form.impact}
              onChange={(e) => handleChange("impact", e.target.value)}
            />
          </div>

          <select
            className="w-full border rounded-lg px-3 py-2"
            value={form.statusId}
            onChange={(e) => handleChange("statusId", e.target.value)}
          >
            <option value="">Select Status *</option>
            {statuses.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <Select
            styles={customSelectStyles}
            options={categoryOptions}
            value={form.categoryId}
            onChange={(v) => handleChange("categoryId", v)}
            placeholder="Risk Category *"
            menuPortalTarget={document.body}
          />

          <Select
            styles={customSelectStyles}
            options={memberOptions}
            value={form.ownerId}
            onChange={(v) => handleChange("ownerId", v)}
            placeholder="Owner *"
            menuPortalTarget={document.body}
          />

          <Select
            styles={customSelectStyles}
            options={memberOptions}
            value={form.reporterId}
            onChange={(v) => handleChange("reporterId", v)}
            placeholder="Reporter *"
            menuPortalTarget={document.body}
          />

          <Select
            styles={customSelectStyles}
            options={ISSUE_TYPES.map((t) => ({ value: t, label: t }))}
            value={
              form.linkedType
                ? { value: form.linkedType, label: form.linkedType }
                : null
            }
            onChange={(v) => handleChange("linkedType", v.value)}
            placeholder="Link Type *"
            menuPortalTarget={document.body}
          />

          <Select
            styles={customSelectStyles}
            options={issueOptions}
            value={form.linkedId}
            onChange={(v) => handleChange("linkedId", v)}
            placeholder="Link Issue *"
            menuPortalTarget={document.body}
          />

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white rounded-lg"
            >
              {isEditMode ? "Update Risk" : "Create Risk"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRiskModal;
