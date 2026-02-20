import React, { useEffect, useState } from "react";
import { getSkills, getCertificates } from "../../../services/clientservice";
import { toast } from "react-toastify";

const ComplianceForm = ({ formData, setFormData }) => {
  const [skills, setSkills] = useState([]);
  const [certificates, setCertificates] = useState([]);

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
    try {
      const res = await getSkills();
      setSkills(res.data);
    } catch (error) {
      console.error("Error fetching skills:", error);
      toast.error("Failed to fetch skills");
    }
  };

  const fetchCertificates = async () => {
    try {
      const res = await getCertificates();
      setCertificates(res.data);
    } catch (err) {
      toast.error("Failed to fetch certificates");
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
    <div className="space-y-4 border-t pt-4">
      {/* Requirement Type */}
      <div>
        <label className="text-sm font-medium text-gray-700">
          Requirement Type <span className="text-red-500">*</span>
        </label>
        <select
          name="requirementType"
          value={formData.requirementType || ""}
          onChange={handleChange}
          className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Select type</option>
          <option value="CERTIFICATION">Certification</option>
          <option value="CLEARANCE">Clearance</option>
          <option value="TOOL_ACCESS">Tool Access</option>
          <option value="SKILL">Skill</option>
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
            className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
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
            // Target the nested ID
            value={formData.certificate?.certificateId || ""}
            onChange={handleChange}
            className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
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
      <div>
        <label className="text-sm font-medium text-gray-700">
          Requirement Name <span className="text-red-500">*</span>
        </label>
        <input
          name="requirementName"
          value={formData.requirementName || ""}
          onChange={handleChange}
          className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {/* Flags */}
      <div className="flex items-center gap-2">
        <label htmlFor="mandatoryFlag" className="text-sm font-medium">
          Mandatory
        </label>
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
        />
        <label htmlFor="activeFlag" className="text-sm font-medium ml-4">
          Active
        </label>
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
        />
      </div>
    </div>
  );
};

export default ComplianceForm;