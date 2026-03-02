import React, { useState, useEffect, Fragment } from "react";
import toast from "react-hot-toast";
import { X, Plus, Trash2, ShieldCheck, Layers, CheckCircle2, Check, ChevronDown, ListPlus, Send } from "lucide-react";
import { createRoleExpectation } from "../services/workforceService";
import Modal from "../../../components/Modal/modal";
import Button from "../../../components/Button/Button";

/* ===================== IMPROVED COMPONENTS ===================== */

const InputLabel = ({ children, required }) => (
  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-0.5">
    {children} {required && <span className="text-red-500">*</span>}
  </label>
);

const SimpleSelect = ({ label, value, onChange, options, placeholder, disabled, required }) => (
  <div className="flex-1 w-full">
    <InputLabel required={required}>{label}</InputLabel>
    <div className="relative group">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full h-10 pl-3 pr-10 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none appearance-none transition-all cursor-pointer disabled:bg-gray-50 disabled:cursor-not-allowed group-hover:border-gray-300"
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>{opt.name}</option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-gray-600 pointer-events-none transition-colors" />
    </div>
  </div>
);

/* ===================== MAIN MODAL ===================== */

const AddDeliverableRoleModal = ({ open, onClose, categories = [], proficiencyLevels = [] }) => {
  const [draftRole, setDraftRole] = useState({ roleId: crypto.randomUUID(), roleName: "", skills: [] });
  const [formState, setFormState] = useState({ categoryId: "", skillId: "", skillName: "", mandatoryFlag: true, proficiencyId: "", subSkills: [] });
  const [availableSkills, setAvailableSkills] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sync available skills when category changes
  useEffect(() => {
    const category = categories.find(c => String(c.id) === String(formState.categoryId));
    setAvailableSkills(category?.skills?.map(s => ({ id: s.id, name: s.name || s.skillName })) || []);
  }, [formState.categoryId, categories]);

  const handleAddSkillToDraft = () => {
    if (!draftRole.roleName.trim()) return toast.error("Role Name is required");
    if (!formState.skillId) return toast.error("Please select a skill");
    if (!formState.proficiencyId) return toast.error("Please select a proficiency level");

    const skillName = availableSkills.find(s => String(s.id) === String(formState.skillId))?.name;
    const isDuplicate = draftRole.skills.some(s => String(s.skillId) === String(formState.skillId));

    if (isDuplicate) return toast.error("Skill already in draft");

    setDraftRole(prev => ({
      ...prev,
      skills: [...prev.skills, { ...formState, skillName, id: Date.now() }]
    }));

    // Reset Skill fields but KEEP Category
    setFormState(prev => ({ ...prev, skillId: "", skillName: "", mandatoryFlag: true, proficiencyId: "", subSkills: [] }));
    toast.success("Skill added to draft");
  };

  const handleFinalize = async () => {
    if (!draftRole.roleName.trim()) return toast.error("Role Name is required");
    if (draftRole.skills.length === 0) return toast.error("At least one skill is required");

    setLoading(true);
    try {
      await createRoleExpectation(draftRole);
      toast.success("Role deployment successful!");
      onClose();
      // Reset state on success
      setDraftRole({ roleId: crypto.randomUUID(), roleName: "", skills: [] });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to finalize role configuration");
    } finally {
      setLoading(false);
    }
  };

  const removeSkillFromDraft = (id) => {
    setDraftRole(prev => ({ ...prev, skills: prev.skills.filter(s => s.id !== id) }));
  };

  if (!open) return null;

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Create Deliverable Role"
      subtitle="Configure competency expectations for this project role"
      className="max-w-[80vw]"
      bodyClassName="p-0"
    >
      <div className="flex flex-col lg:grid lg:grid-cols-12 min-h-0 lg:max-h-[75vh]">

        {/* LEFT: COMPOSER (65%) */}
        <div className="lg:col-span-7 p-6 overflow-y-auto border-r border-gray-100 bg-white">
          <div className="max-w-xl mx-auto space-y-8">

            {/* Essential Info Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                  <ShieldCheck size={16} />
                </div>
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">General Identity</h3>
              </div>

              <div className="space-y-1">
                <InputLabel required>Role Designation</InputLabel>
                <input
                  type="text"
                  value={draftRole.roleName}
                  onChange={(e) => setDraftRole(p => ({ ...p, roleName: e.target.value }))}
                  placeholder="e.g. Associate Solution Architect"
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm font-medium transition-all group-hover:border-gray-300"
                />
              </div>
            </div>

            {/* Competency Builder Section */}
            <div className="space-y-5 pt-1 border-t border-gray-50 mt-6 pt-6">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                  <Plus size={16} />
                </div>
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Skill Builder</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <SimpleSelect
                  label="Category"
                  placeholder="Select Category"
                  value={formState.categoryId}
                  options={categories}
                  required
                  onChange={(e) => setFormState(p => ({ ...p, categoryId: e.target.value, skillId: "" }))}
                />
                <SimpleSelect
                  label="Skill"
                  placeholder="Select Skill"
                  value={formState.skillId}
                  options={availableSkills}
                  disabled={!formState.categoryId}
                  required
                  onChange={(e) => setFormState(p => ({ ...p, skillId: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-end">
                <SimpleSelect
                  label="Min. Proficiency"
                  placeholder="Select Level"
                  value={formState.proficiencyId}
                  options={proficiencyLevels.map(p => ({ id: p.id || p.proficiencyId, name: p.name || p.proficiencyName }))}
                  required
                  onChange={(e) => setFormState(p => ({ ...p, proficiencyId: e.target.value }))}
                />
                <button
                  onClick={() => setFormState(p => ({ ...p, mandatoryFlag: !p.mandatoryFlag }))}
                  className={`h-10 group flex items-center justify-between px-3 rounded-lg border transition-all ${formState.mandatoryFlag ? "bg-rose-50/50 border-rose-200 text-rose-700" : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300"}`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors ${formState.mandatoryFlag ? "bg-rose-600" : "bg-gray-300"}`}>
                      <Check size={8} className="text-white" strokeWidth={5} />
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Mandatory Req.</span>
                  </div>
                  <div className={`w-7 h-3.5 rounded-full relative transition-colors ${formState.mandatoryFlag ? "bg-rose-200" : "bg-gray-200"}`}>
                    <div className={`absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white transition-all shadow-sm ${formState.mandatoryFlag ? "left-[13px]" : "left-0.5"}`} />
                  </div>
                </button>
              </div>

              <button
                onClick={handleAddSkillToDraft}
                className="w-full h-11 bg-gray-900 hover:bg-indigo-600 text-white rounded-lg font-bold text-xs uppercase tracking-[0.1em] transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-200 hover:shadow-indigo-200 active:scale-[0.98]"
              >
                <ListPlus size={16} /> Add Competency to List
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: LIVE DRAFT (35%) */}
        <div className="lg:col-span-5 bg-gray-50 flex flex-col h-full border-t lg:border-t-0">
          <div className="p-4 px-6 border-b border-gray-200 bg-white/50 backdrop-blur-sm flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-gray-400" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Configuration Draft</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400 border border-gray-200 px-2 py-0.5 rounded-full bg-gray-100 font-bold">
                {draftRole.skills.length} Items
              </span>
            </div>
          </div>

          <div className="h-[250px] lg:h-full flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
            {draftRole.skills.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 bg-gray-100 rounded-3xl flex items-center justify-center mb-4 border-2 border-dashed border-gray-200">
                  <Layers size={28} className="text-gray-300 opacity-50" />
                </div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Staging Area Empty</h4>
                <p className="text-[11px] text-gray-400 max-w-[180px] leading-relaxed">Add skills from the left to start building your role profile</p>
              </div>
            ) : (
              <div className="space-y-3">
                {draftRole.skills.map((skill) => (
                  <div key={skill.id} className="bg-white border border-gray-100 p-4 rounded-2xl flex justify-between items-center shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group animate-in slide-in-from-right-2 duration-300">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.5 rounded-md font-black uppercase tracking-wider shadow-sm shadow-indigo-100">
                          {proficiencyLevels.find(p => String(p.id || p.proficiencyId) === String(skill.proficiencyId))?.name || "L1"}
                        </span>
                        {skill.mandatoryFlag && (
                          <span className="text-[9px] bg-rose-50 text-rose-600 border border-rose-100 px-1.5 py-0.5 rounded-md font-black uppercase tracking-wider">
                            Critical
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-gray-800 truncate leading-tight">{skill.skillName}</h4>
                    </div>
                    <button
                      onClick={() => removeSkillFromDraft(skill.id)}
                      className="p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Deployment Footer */}
          <div className="p-5 bg-white border-t border-gray-100 shrink-0">
            <button
              onClick={handleFinalize}
              disabled={loading || draftRole.skills.length === 0 || !draftRole.roleName.trim()}
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-100 text-white rounded-xl font-bold text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-2 shadow-xl shadow-indigo-100 disabled:shadow-none transition-all active:scale-[0.98]"
            >
              {loading ? (
                "Deploying Role Profile..."
              ) : (
                <>Deploy Configuration <Send size={16} className="translate-x-1 -translate-y-0.5" /></>
              )}
            </button>
          </div>
        </div>

      </div>
    </Modal>
  );
};

export default AddDeliverableRoleModal;
