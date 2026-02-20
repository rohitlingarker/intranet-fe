import React, { useState, useEffect } from "react";
import { createRoleExpectation } from "../services/workforceService";
import SubSkillSelectionModal from "./client_configuration/SubSkillSelectionModal";

/* ===================== CONSTANTS ===================== */
const EMPTY_EXPECTATION = {
  subSkillId: "",
  subSkillName: "",
  proficiencyId: "",
  proficiencyName: "",
  mandatoryFlag: true,
};

const AddDeliverableRoleModal = ({
  open,
  onClose,
  deliverableForm,
  setDeliverableForm,
  categories = [],
  skills = [],
  subSkills = [],
  setSubSkills,
  setSkills,
  proficiencyLevels = [],
}) => {
  /* ===================== LOCAL STATE ===================== */
  const [draftRoles, setDraftRoles] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isSubSkillModalOpen, setIsSubSkillModalOpen] = useState(false);

  /* ===================== ENSURE EXPECTATIONS ALWAYS EXIST ===================== */
  useEffect(() => {
    if (!open) return;

    if (!Array.isArray(deliverableForm?.expectations)) {
      setDeliverableForm({
        ...deliverableForm,
        expectations: [],
      });
    }
  }, [open, deliverableForm, setDeliverableForm]);

  /* ===================== EARLY RETURN AFTER HOOKS ===================== */
  if (!open) return null;

  const expectations = Array.isArray(deliverableForm.expectations)
    ? deliverableForm.expectations
    : [];

  /* ===================== SOFT SAVE ===================== */
  const handleSoftSave = () => {
    if (!deliverableForm.deliveryName || !deliverableForm.skillId) {
      alert("Role name and skill are required");
      return;
    }

    const selectedExpectations = expectations.filter(
      (e) => e.subSkillId && e.proficiencyId,
    );

    if (selectedExpectations.length === 0) {
      alert("Please select at least one sub skill with proficiency");
      return;
    }

    const draft = {
      tempId: crypto.randomUUID(),
      deliveryName: deliverableForm.deliveryName,
      skillId: deliverableForm.skillId,
      skillName: skills.find((s) => s.id === deliverableForm.skillId)?.name,
      expectations: selectedExpectations,
    };

    setDraftRoles((prev) => [...prev, draft]);

    /* Reset form */
    setDeliverableForm({
      deliveryName: "",
      categoryId: "",
      skillId: "",
      expectations: [],
    });

    setSubSkills([]);
  };

  /* ===================== FINALIZE ===================== */
  const handleFinalize = async () => {
    const rolesToSave = draftRoles.filter((r) =>
      selectedIds.includes(r.tempId),
    );

    if (!rolesToSave.length) {
      alert("Please select at least one draft to finalize");
      return;
    }

    try {
      await Promise.all(
        rolesToSave.map((role) =>
          createRoleExpectation({
            roleName: role.deliveryName,
            expectations: role.expectations.map((e) => ({
              skillId: role.skillId,
              subSkillId: e.subSkillId,
              proficiencyId: e.proficiencyId,
              mandatoryFlag: e.mandatoryFlag,
            })),
          }),
        ),
      );

      setDraftRoles([]);
      setSelectedIds([]);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to save deliverable roles");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-3">
      <div className="bg-white rounded-lg shadow-md w-full max-w-md">
        {/* ================= HEADER ================= */}
        <div className="flex justify-between items-center px-5 py-3 border-b">
          <h2 className="text-sm font-semibold text-gray-800">
            Add Deliverable Role
          </h2>
          <button onClick={onClose} className="text-gray-400 text-lg">
            ×
          </button>
        </div>

        {/* ================= BODY ================= */}
        <div className="px-5 py-4 space-y-4">
          <input
            value={deliverableForm.deliveryName || ""}
            onChange={(e) =>
              setDeliverableForm({
                ...deliverableForm,
                deliveryName: e.target.value,
              })
            }
            placeholder="Deliverable Role Name"
            className="w-full h-9 border rounded px-3 text-xs"
          />
          

          
          {/* Category + Skill (same row) */}
          <div className="grid grid-cols-2 gap-3">
            {/* Category */}
            <select
              value={deliverableForm.categoryId || ""}
              onChange={(e) => {
                const selected = categories.find(
                  (c) => c.id === e.target.value,
                );

                setDeliverableForm({
                  deliveryName: deliverableForm.deliveryName,
                  categoryId: e.target.value,
                  skillId: "",
                  expectations: [],
                });

                setSkills(selected?.skills || []);
                setSubSkills([]);
              }}
              className="w-full h-9 border rounded px-3 text-xs"
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Skill */}
            <select
              value={deliverableForm.skillId || ""}
              disabled={!skills.length}
              onChange={(e) => {
                const skill = skills.find((s) => s.id === e.target.value);

                setDeliverableForm({
                  ...deliverableForm,
                  skillId: e.target.value,
                  expectations: [],
                });

                setSubSkills(skill?.subSkills || []);
              }}
              className="w-full h-9 border rounded px-3 text-xs disabled:bg-gray-100"
            >
              <option value="">Select Skill</option>
              {skills.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* SubSkill Selector */}
          <button
            disabled={!deliverableForm.skillId}
            onClick={() => setIsSubSkillModalOpen(true)}
            className="border border-[#263383] text-[#263383] px-4 py-2 rounded text-xs"
          >
            Select Sub Skills
          </button>

          {expectations.length > 0 && (
            <div className="text-xs text-gray-600">
              Selected Sub Skills:{" "}
              {expectations.map((e) => e.subSkillName).join(", ")}
            </div>
          )}
        </div>

        {/* ================= DRAFT CARDS ================= */}
        {draftRoles.length > 0 && (
          <div className="px-5 pb-4 space-y-3 border-t max-h-48 overflow-y-auto">
            <h4 className="text-xs font-semibold text-gray-700">
              Draft Deliverable Roles
            </h4>

            {draftRoles.map((role) => (
              <div
                key={role.tempId}
                className="flex justify-between items-start border p-3 rounded bg-gray-50"
              >
                <div>
                  <p className="text-xs font-semibold">{role.deliveryName}</p>
                  <p className="text-[11px] text-gray-500">
                    Skill: {role.skillName}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    SubSkills:{" "}
                    {role.expectations.map((e) => e.subSkillName).join(", ")}
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={selectedIds.includes(role.tempId)}
                  onChange={() =>
                    setSelectedIds((prev) =>
                      prev.includes(role.tempId)
                        ? prev.filter((id) => id !== role.tempId)
                        : [...prev, role.tempId],
                    )
                  }
                />
              </div>
            ))}
          </div>
        )}

        {/* ================= FOOTER ================= */}
        <div className="flex justify-end gap-3 px-5 py-3 border-t">
          <button onClick={onClose} className="text-xs text-gray-500">
            Cancel
          </button>
          <button
            onClick={handleSoftSave}
            className="border px-4 py-1.5 rounded text-xs"
          >
            Add as Draft
          </button>
          <button
            disabled={!selectedIds.length}
            onClick={handleFinalize}
            className="bg-[#263383] text-white px-4 py-1.5 rounded text-xs disabled:bg-gray-300"
          >
            Finalize Selected
          </button>
        </div>
      </div>

      {/* ================= SUBSKILL MODAL ================= */}
      <SubSkillSelectionModal
        open={isSubSkillModalOpen}
        onClose={() => setIsSubSkillModalOpen(false)}
        subSkills={subSkills}
        proficiencyLevels={proficiencyLevels}
        expectations={expectations}
        setExpectations={(updated) =>
          setDeliverableForm({ ...deliverableForm, expectations: updated })
        }
      />
    </div>
  );
};

export default AddDeliverableRoleModal;
