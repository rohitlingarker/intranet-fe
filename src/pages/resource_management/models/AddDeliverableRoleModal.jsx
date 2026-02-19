import React from "react";

const AddDeliverableRoleModal = ({
  open,
  onClose,
  deliverableForm,
  setDeliverableForm,
  categories,
  skills,
  subSkills,
  setSkills,
  setSubSkills,
  proficiencyLevels,
  onSave,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-3">
      <div className="bg-white rounded-lg shadow-md w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-3 border-b">
          <h2 className="text-sm font-semibold text-gray-800">
            Add Deliverable Role
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {/* Deliverable Role */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">
              Deliverable Role
            </label>
            <input
              type="text"
              placeholder="Role name"
              value={deliverableForm.roleName}
              onChange={(e) =>
                setDeliverableForm({
                  ...deliverableForm,
                  roleName: e.target.value,
                })
              }
              className="w-full h-9 border border-gray-300 rounded px-3 text-xs focus:ring-1 focus:ring-[#263383]"
            />
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">
              Category
            </label>
            <select
              value={deliverableForm.categoryId || ""}
              onChange={(e) => {
                const selected = categories.find(
                  (c) => c.id === e.target.value,
                );

                setDeliverableForm({
                  ...deliverableForm,
                  categoryId: e.target.value,
                  skillId: "",
                  subSkillId: "",
                  proficiencyLevel: "",
                });

                setSkills(selected?.skills || []);
                setSubSkills([]);
              }}
              className="w-full h-9 border border-gray-300 rounded px-3 text-xs bg-white"
            >
              <option value="">Select</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Skill */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">Skill</label>
            <select
              value={deliverableForm.skillId}
              onChange={(e) => {
                const selectedSkill = skills.find(
                  (s) => s.id === e.target.value,
                );

                setDeliverableForm({
                  ...deliverableForm,
                  skillId: e.target.value,
                  subSkillId: "",
                });

                setSubSkills(selectedSkill?.subSkills || []);
              }}
              disabled={!skills.length}
              className="w-full h-9 border border-gray-300 rounded px-3 text-xs bg-white disabled:bg-gray-100"
            >
              <option value="">Select</option>
              {skills.map((skill) => (
                <option key={skill.id} value={skill.id}>
                  {skill.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sub Skill */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">
              Sub Skill
            </label>
            <select
              value={deliverableForm.subSkillId}
              onChange={(e) =>
                setDeliverableForm({
                  ...deliverableForm,
                  subSkillId: e.target.value,
                })
              }
              disabled={!subSkills.length}
              className="w-full h-9 border border-gray-300 rounded px-3 text-xs bg-white disabled:bg-gray-100"
            >
              <option value="">Select</option>
              {subSkills.map((ss) => (
                <option key={ss.id} value={ss.id}>
                  {ss.name}
                </option>
              ))}
            </select>
          </div>

          {/* Proficiency */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">
              Proficiency
            </label>
            <select
              value={deliverableForm.proficiencyLevel || ""}
              onChange={(e) =>
                setDeliverableForm({
                  ...deliverableForm,
                  proficiencyLevel: e.target.value,
                })
              }
              className="w-full h-9 border border-gray-300 rounded px-3 text-xs bg-white"
            >
              <option value="">Select proficiency</option>

              {Array.isArray(proficiencyLevels) &&
                proficiencyLevels
                  .filter((p) => p.activeFlag) // ✅ optional but recommended
                  .sort((a, b) => a.displayOrder - b.displayOrder) // ✅ optional
                  .map((level) => (
                    <option
                      key={level.proficiencyId}
                      value={level.proficiencyId}
                    >
                      {level.proficiencyName}
                    </option>
                  ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-5 py-3 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="bg-[#263383] text-white px-4 py-1.5 rounded text-xs hover:opacity-90"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddDeliverableRoleModal;
