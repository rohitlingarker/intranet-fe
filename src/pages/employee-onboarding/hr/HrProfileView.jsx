"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { showStatusToast } from "../../../components/toastfy/toast.jsx";

import {
  ArrowLeft,
  User,
  MapPin,
  GraduationCap,
  Briefcase,
  File,
} from "lucide-react";

export default function HrProfileView() {
  const { user_uuid } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const BASE_URL = import.meta.env.VITE_EMPLOYEE_ONBOARDING_URL;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [verificationStatus, setVerificationStatus] = useState(null);
  const [confirmationMessage, setConfirmationMessage] = useState(null);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/hr/hr/${user_uuid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProfile(res.data);

      // Only show status if not "Submitted"
      setVerificationStatus(
        res.data.offer?.offer_status !== "Submitted"
          ? res.data.offer?.offer_status
          : null
      );
    } catch (err) {
      console.error("Failed to load profile", err);
      showStatusToast("Failed to load profile", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user_uuid]);

  if (loading)
    return <div className="p-10 text-center">Loading profile...</div>;

  if (!profile || !profile.offer)
    return (
      <div className="p-10 text-center text-red-600">Profile not found</div>
    );

  const {
    offer,
    personal_details,
    addresses,
    identity_documents,
    education_documents,
    experience,
  } = profile;

  function removeQuotes(url) {
    return url?.replace(/^"+|"+$/g, "");
  }

  async function openFileInNewTab(url) {
    if (!url) return;
    const newTab = window.open("", "_blank");

    try {
      const res = await axios.get(`${BASE_URL}/hr/view_documents`, {
        params: { file_path: encodeURIComponent(url) },
        headers: { Authorization: `Bearer ${token}` },
      });
      const cleanUrl = removeQuotes(res.data);
      newTab.location.href = cleanUrl;
    } catch (err) {
      console.error("Failed to open document", err);
      newTab.close();
    }
  }

  const updateVerificationStatus = async (status) => {
    try {
      await axios.post(
        `${BASE_URL}/hr/verify-profile`,
        { user_uuid, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showStatusToast(`Profile ${status}`, "success");

      setVerificationStatus(status);
      setConfirmationMessage(`Profile has been ${status.toLowerCase()}.`);

      setTimeout(() => setConfirmationMessage(null), 3000);
    } catch (err) {
      console.error("Verification failed", err);
      showStatusToast("Verification failed", "error");
    }
  };

  const handleVerify = () => updateVerificationStatus("Verified");
  const handleReject = () => updateVerificationStatus("Rejected");

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 relative">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-blue-900 font-semibold hover:underline"
      >
        <ArrowLeft size={18} /> Back
      </button>

      {/* Status Badge */}
      {(verificationStatus === "Verified" || verificationStatus === "Rejected") && (
        <div className="absolute top-6 right-6">
          <span
            className={`px-6 py-2 text-lg font-bold rounded-full shadow-lg ${
              verificationStatus === "Verified"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {verificationStatus}
          </span>
        </div>
      )}

      {/* Confirmation */}
      {confirmationMessage && (
        <div className="absolute top-20 right-6 bg-blue-500 text-white px-4 py-2 rounded shadow-lg">
          {confirmationMessage}
        </div>
      )}

      {/* PERSONAL */}
      <Section title="Personal Information" icon={<User />}>
        <FieldCard label="Name" value={`${offer.first_name} ${offer.last_name}`} />
        <FieldCard label="Email" value={offer.email} />
        <FieldCard label="Phone" value={offer.contact_number} />
        <FieldCard label="Designation" value={offer.designation} />
        <FieldCard label="Gender" value={personal_details?.gender} />
        <FieldCard label="Date of Birth" value={personal_details?.date_of_birth} />
        <FieldCard label="Marital Status" value={personal_details?.marital_status} />
        <FieldCard label="Blood Group" value={personal_details?.blood_group} />
        <FieldCard label="Nationality" value={personal_details?.nationality} />
        <FieldCard label="Residence" value={personal_details?.residence} />
      </Section>

      {/* ADDRESS */}
      <Section title="Address" icon={<MapPin />}>
        {addresses?.length
          ? addresses.map((addr) => (
              <AddressCard key={addr.address_uuid} address={addr} />
            ))
          : <Info label="Address" value="No address available" />}
      </Section>

      {/* EDUCATION */}
      <Section title="Education" icon={<GraduationCap />}>
        {education_documents?.length
          ? education_documents.map((edu) => (
              <DocumentCard
                key={edu.document_uuid}
                title={`${edu.education_level} - ${edu.specialization}`}
                subtitle={`${edu.institution_name} (${edu.year_of_passing})`}
                documentName={edu.document_name}
                filePath={edu.file_path}
                onView={openFileInNewTab}
              />
            ))
          : <Info label="Education" value="No education documents uploaded" />}
      </Section>

      {/* EXPERIENCE */}
      <Section title="Work Experience" icon={<Briefcase />}>
        {experience?.length
          ? experience.map((exp) => (
              <ExperienceCard key={exp.experience_uuid} exp={exp} />
            ))
          : <Info label="Experience" value="No work experience provided" />}
      </Section>

      {/* IDENTITY */}
      <Section title="Identity Documents" icon={<File />}>
        {identity_documents?.length
          ? identity_documents.map((doc) => (
              <DocumentCard
                key={doc.document_uuid}
                title={doc.identity_type}
                filePath={doc.file_path}
                onView={openFileInNewTab}
              />
            ))
          : <Info label="Identity" value="No identity documents uploaded" />}
      </Section>

      {/* ACTION BUTTONS */}
      {(!verificationStatus && offer.offer_status === "Submitted") && (
        <div className="pt-8 border-t flex justify-center gap-4">
          <button
            onClick={handleVerify}
            className="px-6 py-2 rounded-lg bg-green-600 text-white font-medium shadow-md hover:bg-green-700"
          >
            Verify
          </button>
          <button
            onClick={handleReject}
            className="px-6 py-2 rounded-lg bg-red-600 text-white font-medium shadow-md hover:bg-red-700"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- UI helpers (unchanged) ---------- */

function Section({ title, icon, children }) {
  return (
    <div className="bg-gray-50 rounded-xl shadow-sm p-6">
      <h2 className="flex items-center gap-2 text-lg font-semibold mb-5 text-indigo-700">
        {icon} {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function FieldCard({ label, value }) {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium text-gray-900">{value || "—"}</p>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium text-gray-900">{value || "—"}</p>
    </div>
  );
}

function AddressCard({ address }) {
  return (
    <div className="border rounded-lg p-4 bg-white space-y-1">
      <p className="text-sm font-semibold text-indigo-700">
        {address.address_type} Address
      </p>
      <p>{address.address_line1}</p>
      <p>
        {address.city}, {address.state_or_region}
      </p>
      <p>
        {address.postal_code}, {address.country}
      </p>
    </div>
  );
}

function DocumentCard({ title, subtitle, documentName, filePath, onView }) {
  return (
    <div className="border rounded-lg p-4 bg-white min-h-[100px]">
      {title && <h4 className="font-semibold">{title}</h4>}
      {subtitle && <p>{subtitle}</p>}
      {documentName && <p>{documentName}</p>}
      {filePath && (
        <button
          className="mt-3 text-blue-600 font-medium"
          onClick={() => onView(filePath)}
        >
          View Document
        </button>
      )}
    </div>
  );
}

function ExperienceCard({ exp }) {
  return (
    <div className="border rounded-lg p-4 bg-white">
      <h3 className="font-semibold">{exp.company_name}</h3>
      <p>{exp.role_title}</p>
    </div>
  );
}
