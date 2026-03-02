import React, { useState, useEffect, useCallback, Fragment } from "react";
import toast from "react-hot-toast";
import { X, Plus, Trash2, ShieldCheck, Layers, CheckCircle2, Search, Check, ChevronDown } from "lucide-react";
import { Combobox, Transition } from "@headlessui/react";
import { createRoleExpectation } from "../services/workforceService";
import Modal from "../../../components/Modal/modal";
import Button from "../../../components/Button/Button";

/* ===================== SIMPLIFIED COMPONENTS ===================== */

const InputLabel = ({ children }) => (
  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
    {children}
  </label>
);

const SimpleSelect = ({ label, value, onChange, options, placeholder }) => (
  <div className="flex-1">
    <InputLabel>{label}</InputLabel>
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg text-sm focus:border-indigo-500 outline-none appearance-none transition-all cursor-pointer"
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>{opt.name}</option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
    </div>
  </div>
);

/* ===================== MAIN MODAL ===================== */

const AddDeliverableRoleModal = ({ open, onClose, categories = [], proficiencyLevels = [] }) => {
  const [draftRole, setDraftRole] = useState({ roleId: crypto.randomUUID(), roleName: "", skills: [] });
  const [formState, setFormState] = useState({ categoryId: "", skillId: "", skillName: "", mandatoryFlag: true, proficiencyId: "", subSkills: [] });
  const [availableSkills, setAvailableSkills] = useState([]);

  // Sync available skills when category changes
  useEffect(() => {
    const category = categories.find(c => String(c.id) === String(formState.categoryId));
    setAvailableSkills(category?.skills?.map(s => ({ id: s.id, name: s.name || s.skillName })) || []);
  }, [formState.categoryId, categories]);

  const handleAddSkillToDraft = () => {
    if (!draftRole.roleName) return toast.error("Role Name is required");
    if (!formState.skillId || !formState.proficiencyId) return toast.error("Complete the skill details");

    const skillName = availableSkills.find(s => String(s.id) === String(formState.skillId))?.name;

    setDraftRole(prev => ({
      ...prev,
      skills: [...prev.skills, { ...formState, skillName, id: Date.now() }]
    }));

    setFormState({ categoryId: "", skillId: "", skillName: "", mandatoryFlag: true, proficiencyId: "", subSkills: [] });
    toast.success("Skill added to draft");
  };

  const handleFinalize = async () => {
    try {
      await createRoleExpectation(draftRole);
      toast.success("Role Saved!");
      onClose();
    } catch (err) { toast.error("Error saving role"); }
  };

  if (!open) return null;

  return (
    <Modal isOpen={open} onClose={onClose} title="New Role Configuration" className="max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 h-[75vh] bg-white overflow-hidden">

        {/* LEFT: CONFIGURATOR (60%) */}
        <div className="lg:col-span-7 p-8 overflow-y-auto border-r border-gray-100">
          <div className="space-y-10 max-w-2xl mx-auto">

            {/* Header section */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Define Competencies</h2>
                <p className="text-xs text-gray-500">Add mandatory and optional skills to this role.</p>
              </div>
            </div>

            {/* Role Name */}
            <div className="space-y-1">
              <InputLabel>Deliverable Role Name</InputLabel>
              <input
                type="text"
                value={draftRole.roleName}
                onChange={(e) => setDraftRole(p => ({ ...p, roleName: e.target.value }))}
                placeholder="e.g. Senior Backend Engineer"
                className="w-full h-12 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium"
              />
            </div>

            {/* Skill Selector */}
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <SimpleSelect
                  label="Category"
                  placeholder="Select Category"
                  value={formState.categoryId}
                  options={categories}
                  onChange={(e) => setFormState(p => ({ ...p, categoryId: e.target.value }))}
                />
                <SimpleSelect
                  label="Skill"
                  placeholder="Select Skill"
                  value={formState.skillId}
                  options={availableSkills}
                  disabled={!formState.categoryId}
                  onChange={(e) => setFormState(p => ({ ...p, skillId: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <SimpleSelect
                  label="Proficiency Level"
                  placeholder="Select Level"
                  value={formState.proficiencyId}
                  options={proficiencyLevels.map(p => ({ id: p.id || p.proficiencyId, name: p.name || p.proficiencyName }))}
                  onChange={(e) => setFormState(p => ({ ...p, proficiencyId: e.target.value }))}
                />
                <div className="flex flex-col justify-end">
                  <button
                    onClick={() => setFormState(p => ({ ...p, mandatoryFlag: !p.mandatoryFlag }))}
                    className={`h-11 flex items-center justify-center gap-2 rounded-lg border transition-all text-xs font-bold uppercase tracking-wider ${formState.mandatoryFlag ? "bg-rose-50 border-rose-200 text-rose-600" : "bg-gray-50 border-gray-200 text-gray-400"}`}
                  >
                    {formState.mandatoryFlag ? <Check size={14} strokeWidth={3} /> : <Plus size={14} />}
                    Mandatory
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddSkillToDraft}
                className="w-full h-12 bg-gray-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-600 transition-colors shadow-lg"
              >
                Add Skill to Draft
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: DRAFT PREVIEW (40%) */}
        <div className="lg:col-span-5 bg-gray-50 flex flex-col h-full">
          <div className="p-6 border-b border-gray-200 bg-white flex justify-between items-center">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Draft Composition</span>
            <span className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full">{draftRole.skills.length}</span>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {draftRole.skills.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-300">
                <Layers size={32} className="mb-2 opacity-20" />
                <p className="text-[10px] font-bold uppercase italic">No items staged</p>
              </div>
            ) : (
              draftRole.skills.map((skill) => (
                <div key={skill.id} className="bg-white border border-gray-200 p-4 rounded-xl flex justify-between items-start group hover:border-indigo-300 transition-all">
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">{skill.skillName}</h4>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[9px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-black uppercase">
                        {proficiencyLevels.find(p => String(p.id || p.proficiencyId) === String(skill.proficiencyId))?.name || "L1"}
                      </span>
                      {skill.mandatoryFlag && <span className="text-[9px] bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded font-black uppercase">Mandatory</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => setDraftRole(p => ({ ...p, skills: p.skills.filter(s => s.id !== skill.id) }))}
                    className="text-gray-300 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Persistent Footer */}
          <div className="p-6 bg-white border-t border-gray-200">
            <button
              onClick={handleFinalize}
              disabled={draftRole.skills.length === 0 || !draftRole.roleName}
              className="w-full h-14 bg-indigo-600 disabled:bg-gray-200 text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-indigo-100"
            >
              Finalize & Deploy <CheckCircle2 size={18} />
            </button>
          </div>
        </div>

      </div>
    </Modal>
  );
};

export default AddDeliverableRoleModal;