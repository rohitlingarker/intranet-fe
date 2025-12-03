// src/components/modals/CreateRiskModal.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import { X } from "lucide-react";
import { showStatusToast } from "../../../../components/toastfy/toast"; // import toast helper

const ISSUE_TYPES = ["Epic", "Story", "Task"];

const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    borderRadius: "0.5rem",
    borderColor: state.isFocused ? "#000" : "#d1d5db",
    boxShadow: state.isFocused ? "0 0 0 1px #000" : "none",
    "&:hover": { borderColor: "#000" },
    minHeight: "40px",
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  menu: (base) => ({ ...base, zIndex: 9999 }),
};

const CreateRiskModal = ({ isOpen, onClose, projectId, onSuccess }) => {
  const [statuses, setStatuses] = useState([]);
  const [issues, setIssues] = useState([]);
  const [members, setMembers] = useState([]);
  const [categories, setCategories] = useState([]);
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

  const token = localStorage.getItem("token");
  const BASE_URL = import.meta.env.VITE_PMS_BASE_URL;

  // Fetch members
  useEffect(() => {
    if (!projectId) return;
    axios
      .get(`${BASE_URL}/api/projects/${projectId}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : res.data?.content;
        setMembers(list || []);
      })
      .catch(console.error);
  }, [projectId, token, BASE_URL]);

  // Fetch risk statuses
  useEffect(() => {
    if (!isOpen || !projectId) return;
    axios
      .get(`${BASE_URL}/api/projects/${projectId}/risk-statuses`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setStatuses(res.data || []))
      .catch(console.error);
  }, [isOpen, projectId, token, BASE_URL]);

  // Fetch issues for linked type
  useEffect(() => {
    if (!form.linkedType || !projectId) return;
    const type = form.linkedType.toLowerCase() == "story" ? "stories" : `${form.linkedType.toLowerCase()}s`;
    axios
      .get(`${BASE_URL}/api/projects/${projectId}/${type}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setIssues(res.data || []))
      .catch(console.error);
  }, [form.linkedType, projectId, token, BASE_URL]);

  // Fetch risk categories
  useEffect(() => {
    if (!isOpen) return;
    axios
      .get(`${BASE_URL}/api/risk/category`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCategories(res.data || []))
      .catch(console.error);
  }, [isOpen, token, BASE_URL]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Required fields validation
    if (
      !form.title ||
      !form.statusId ||
      !form.linkedType ||
      !form.linkedId ||
      !form.ownerId ||
      !form.reporterId ||
      !form.categoryId
    ) {
      showStatusToast("Please fill all required fields", "error");
      return;
    }

    // Probability and Impact validation
    const probability = Number(form.probability);
    const impact = Number(form.impact);
    if (
      !probability ||
      !impact ||
      probability < 1 ||
      probability > 5 ||
      impact < 1 ||
      impact > 5
    ) {
      showStatusToast("Probability and Impact must be numbers between 1 and 5", "error");
      return;
    }

    try {
      const riskRes = await axios.post(
        `${BASE_URL}/api/risks`,
        {
          projectId,
          ownerId: form.ownerId.value,
          reporterId: form.reporterId.value,
          statusId: form.statusId,
          categoryId: form.categoryId.value,
          title: form.title,
          description: form.description,
          probability,
          impact,
          triggers: form.triggers,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const riskId = riskRes.data.id;

      await axios.post(
        `${BASE_URL}/api/risk-links`,
        {
          riskId,
          linkedType: form.linkedType,
          linkedId: form.linkedId.value,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showStatusToast("Risk created successfully!", "success");
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      showStatusToast("Failed to create risk", "error");
    }
  };

  const memberOptions = members.map((m) => ({ value: m.id, label: m.name }));
  const issueOptions = issues.map((i) => ({ value: i.id, label: i.name || i.title }));
  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-3xl p-6 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create Risk</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500 hover:text-black" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="title"
            placeholder="Risk title"
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            required
          />

          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            rows={3}
            className="w-full border rounded-lg px-3 py-2"
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              name="probability"
              placeholder="Probability (1-5)"
              value={form.probability}
              onChange={(e) => handleChange("probability", e.target.value)}
              className="border rounded-lg px-3 py-2"
              min={1}
              max={5}
              required
            />
            <input
              type="number"
              name="impact"
              placeholder="Impact (1-5)"
              value={form.impact}
              onChange={(e) => handleChange("impact", e.target.value)}
              className="border rounded-lg px-3 py-2"
              min={1}
              max={5}
              required
            />
          </div>

          <textarea
            name="triggers"
            placeholder="Triggers"
            value={form.triggers}
            onChange={(e) => handleChange("triggers", e.target.value)}
            rows={2}
            className="w-full border rounded-lg px-3 py-2"
          />

          <select
            value={form.statusId}
            onChange={(e) => handleChange("statusId", e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            required
          >
            <option value="">Select Status</option>
            {statuses.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <div>
            <label className="font-medium text-sm">Risk Category *</label>
            <Select
              options={categoryOptions}
              value={form.categoryId}
              onChange={(option) => handleChange("categoryId", option)}
              placeholder="Select Risk Category"
              menuPortalTarget={document.body}
              menuPosition="fixed"
              styles={customSelectStyles}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-medium text-sm">Owner *</label>
              <Select
                options={memberOptions}
                value={form.ownerId}
                onChange={(option) => handleChange("ownerId", option)}
                placeholder="Select Owner"
                menuPortalTarget={document.body}
                menuPosition="fixed"
                styles={customSelectStyles}
              />
            </div>

            <div>
              <label className="font-medium text-sm">Reporter *</label>
              <Select
                options={memberOptions.filter((m) => m.value !== form.ownerId?.value)}
                value={form.reporterId}
                onChange={(option) => handleChange("reporterId", option)}
                placeholder="Select Reporter"
                menuPortalTarget={document.body}
                menuPosition="fixed"
                styles={customSelectStyles}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-medium text-sm">Link Type *</label>
              <Select
                options={ISSUE_TYPES.map((t) => ({ value: t, label: t }))}
                value={form.linkedType ? { value: form.linkedType, label: form.linkedType } : null}
                onChange={(option) => handleChange("linkedType", option.value)}
                placeholder="Select Type"
                menuPortalTarget={document.body}
                menuPosition="fixed"
                styles={customSelectStyles}
              />
            </div>

            <div>
              <label className="font-medium text-sm">Link Issue *</label>
              <Select
                options={issueOptions}
                value={form.linkedId}
                onChange={(option) => handleChange("linkedId", option)}
                placeholder={`Select ${form.linkedType}`}
                isDisabled={!form.linkedType}
                menuPortalTarget={document.body}
                menuPosition="fixed"
                styles={customSelectStyles}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-black text-white rounded-lg">
              Create Risk
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRiskModal;
