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
  const [verifying, setVerifying] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/hr/hr/${user_uuid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProfile(res.data);
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
      newTab.location.href = removeQuotes(res.data);
    } catch (err) {
      console.error("Failed to open document", err);
      newTab.close();
    }
  }

  const updateVerificationStatus = async (status) => {
    const isVerify = status === "Verified";
    const setBtnLoading = isVerify ? setVerifying : setRejecting;

    try {
      setBtnLoading(true);

      await axios.post(
        `${BASE_URL}/hr/verify-profile`,
        { user_uuid, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showStatusToast(`Profile ${status}`, "success");
      setVerificationStatus(status);
    } catch (err) {
      console.error("Verification failed", err);
      showStatusToast("Verification failed", "error");
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 relative">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-blue-700 font-semibold hover:underline"
      >
        <ArrowLeft size={18} /> Back
      </button>

      {/* Status Badge */}
      {verificationStatus && (
        <div className="absolute top-6 right-6">
          <span
            className={`inline-flex items-center px-6 py-2 rounded-full font-bold text-white shadow-md ${
              verificationStatus === "Verified" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {verificationStatus}
          </span>
        </div>
      )}

      {/* PERSONAL INFORMATION */}
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

      {/* IDENTITY DOCUMENTS */}
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
      {!verificationStatus && offer.offer_status === "Submitted" && (
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={() => updateVerificationStatus("Verified")}
            disabled={verifying || rejecting}
            className="px-6 py-2 rounded-full bg-green-600 text-white font-semibold shadow-md hover:bg-green-700 disabled:opacity-60 transition-colors"
          >
            {verifying ? "Verifying..." : "Verify"}
          </button>

          <button
            onClick={() => updateVerificationStatus("Rejected")}
            disabled={verifying || rejecting}
            className="px-6 py-2 rounded-full bg-red-600 text-white font-semibold shadow-md hover:bg-red-700 disabled:opacity-60 transition-colors"
          >
            {rejecting ? "Rejecting..." : "Reject"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ----------------- UI Components ----------------- */

function Section({ title, icon, children }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center gap-3 border-b pb-2 mb-4">
        <span className="text-indigo-600">{icon}</span>
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{children}</div>
    </div>
  );
}

function FieldCard({ label, value }) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-gray-900 font-semibold">{value || "—"}</p>
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
    <div className="p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
      <p className="text-sm font-semibold text-indigo-700">{address.address_type} Address</p>
      <p>{address.address_line1}</p>
      <p>{address.city}, {address.state_or_region}</p>
      <p>{address.postal_code}, {address.country}</p>
    </div>
  );
}

function DocumentCard({ title, subtitle, documentName, filePath, onView }) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between min-h-[100px]">
      <div>
        {title && <h4 className="font-semibold text-gray-800">{title}</h4>}
        {subtitle && <p className="text-gray-600">{subtitle}</p>}
        {documentName && <p className="text-gray-700 mt-1">{documentName}</p>}
      </div>
      {filePath && (
        <button
          className="mt-3 text-indigo-600 font-medium self-start hover:underline"
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
    <div className="p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <h3 className="font-semibold text-gray-800">{exp.company_name}</h3>
      <p className="text-gray-700">{exp.role_title}</p>
    </div>
  );
}
