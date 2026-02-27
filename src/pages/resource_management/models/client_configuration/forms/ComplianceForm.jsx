import React, { useEffect, useState } from "react";
import { getSkills, getCertificates } from "../../../services/clientservice";
import { toast } from "react-toastify";
import { useEnums } from "@/pages/resource_management/hooks/useEnums";

const ComplianceForm = ({ formData, setFormData }) => {
  const { getEnumValues } = useEnums();
  const REQUIREMENT_TYPES = getEnumValues("RequirementType");

  const [skills, setSkills] = useState([]);

  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fixed spread order: ...prev comes first so we don't overwrite it
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      skill: {
        id: prev.skill?.id || null,
      },
      certificate: {
        certificateId: prev.certificate?.certificateId || null,
      },
    }));
  }, []);

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const res = await getSkills();
      setSkills(res.data);
    } catch (error) {
      toast.error("Failed to fetch skills");
    } finally {
      setLoading(false);
    }
  };

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const res = await getCertificates();
      setCertificates(res.data);
    } catch (err) {
      toast.error("Failed to fetch certificates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formData.requirementType === "SKILL") {
      fetchSkills();
    }
    if (formData.requirementType === "CERTIFICATION") {
      fetchCertificates();
    }
  }, [formData.requirementType]);

  // Updated handler to shape the data based on the input name
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "skill") {
      setFormData((prev) => ({
        ...prev,
        skill: { id: value },
      }));
    } else if (name === "certificate") { // FIXED: changed from "certification" to "certificate"
      setFormData((prev) => ({
        ...prev,
        certificate: { certificateId: value },
      }));
    } else if (name === "requirementType") {
      // Clean up state when switching types
      setFormData((prev) => {
        // Destructure to remove skill and certificate from state
        const { skill, certificate, ...rest } = prev;

        // Return the clean state with the new requirementType
        return {
          ...rest,
          [name]: value,
        };
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="border-t pt-4 space-y-4">
      {/* ===== REQUIREMENT DETAILS ===== */}
      <div className="grid grid-cols-3 gap-3 items-end">
        {/* Requirement Type */}
        <div>
          <label className="text-xs font-medium text-gray-600">
            Requirement Type *
          </label>
          <select
            name="requirementType"
            value={formData.requirementType || ""}
            onChange={handleChange}
            className="w-full mt-1 border rounded-md px-2 py-1.5 text-sm bg-white"
          >
            <option value="">Select</option>
            {REQUIREMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
              </option>
            ))}
          </select>

        </div>

        {formData.requirementType === "SKILL" ? (
          <div>
            <label className="text-sm font-medium text-gray-700">
              Skills <span className="text-red-500">*</span>
            </label>
            <select
              name="skill"
              // Target the nested ID
              value={formData.skill?.id || ""}
              onChange={handleChange}
              className={`w-full mt-1 border rounded-lg px-3 py-2 text-sm ${loading ? 'opacity-50 cursor-wait bg-gray-500' : ''}`}
              disabled={loading}
            >
              <option value="">Select a skill</option>
              {skills.map((skill) => (
                <option key={skill.id} value={skill.id}>
                  {skill.name}
                </option>
              ))}
            </select>
          </div>
        ) : formData.requirementType === "CERTIFICATION" ? (
          <div>
            <label className="text-sm font-medium text-gray-700">
              Certificate <span className="text-red-500">*</span>
            </label>
            <select
              name="certificate"
              value={formData.certificate?.certificateId || ""}
              onChange={handleChange}
              className={`w-full mt-1 border rounded-lg px-3 py-2 text-sm ${loading ? 'opacity-50 cursor-wait bg-gray-500' : ''}`}
              disabled={loading}
            >
              <option value="">Select a certificate</option>
              {certificates.map((cert) => (
                <option key={cert.certificateId} value={cert.certificateId}>
                  {cert.providerName}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {/* Requirement Name */}
        <div className="col-span-2">
          <label className="text-xs font-medium text-gray-600">
            Requirement Name *
          </label>
          <input
            name="requirementName"
            value={formData.requirementName || ""}
            onChange={handleChange}
            className="w-full mt-1 border rounded-md px-2 py-1.5 text-sm"
          />
        </div>
      </div>

      {/* ===== FLAGS ===== */}
      <div className="flex items-center gap-6">
        {/* Mandatory */}
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            id="mandatoryFlag"
            checked={formData.mandatoryFlag || false}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                mandatoryFlag: e.target.checked,
              }))
            }
            className="h-4 w-4 text-indigo-600"
          />
          Mandatory
        </label>

        {/* Active */}
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            id="activeFlag"
            checked={formData.activeFlag || false}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                activeFlag: e.target.checked,
              }))
            }
            className="h-4 w-4 text-indigo-600"
          />
          Active
        </label>
      </div>
    </div>
  );
};

export default ComplianceForm;