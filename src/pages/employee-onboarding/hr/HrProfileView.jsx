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
    } catch {
      showStatusToast("Failed to load profile", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user_uuid]);

  if (loading) return <div className="p-10 text-center">Loading profile...</div>;
  if (!profile || !profile.offer)
    return <div className="p-10 text-center text-red-600">Profile not found</div>;

  const {
    offer,
    personal_details,
    addresses,
    education_documents,
    experience,
    identity_documents,
  } = profile;

  /* ========= GROUPINGS ========= */

  const groupedEducation = education_documents?.reduce((acc, edu) => {
    const key = `${edu.education_level}|${edu.specialization}|${edu.institution_name}|${edu.year_of_passing}`;
    acc[key] ||= {
      title: `${edu.education_level} – ${edu.specialization}`,
      subtitle: `${edu.institution_name} (${edu.year_of_passing})`,
      documents: [],
    };
    acc[key].documents.push(edu);
    return acc;
  }, {});

  const groupedExperience = experience?.reduce((acc, exp) => {
    const key = `${exp.company_name}|${exp.role_title}|${exp.start_date}|${exp.end_date}`;

    acc[key] ||= {
      title: `${exp.company_name} – ${exp.role_title}`,
      subtitle: `${exp.start_date} to ${exp.end_date || "Present"}`,
      documents: [],
    };

    // Extract documents properly
    exp.documents?.forEach((doc, index) => {
      acc[key].documents.push({
        document_uuid: `${exp.experience_uuid}-${index}`, // generate unique id
        document_name: doc.doc_type
          ? doc.doc_type.replace(/_/g, " ")
          : "Experience Document",
        file_path: doc.file_path,
      });
    });

    return acc;
  }, {});

  const groupedIdentity = identity_documents?.reduce((acc, doc) => {
    acc[doc.identity_type] ||= { title: doc.identity_type, documents: [] };
    acc[doc.identity_type].documents.push(doc);
    return acc;
  }, {});

  async function openFileInNewTab(url) {
    if (!url) return;
    const tab = window.open("", "_blank");
    try {
      const res = await axios.get(`${BASE_URL}/hr/view_documents`, {
        params: { file_path: encodeURIComponent(url) },
        headers: { Authorization: `Bearer ${token}` },
      });
      tab.location.href = res.data.replace(/^"+|"+$/g, "");
    } catch {
      tab.close();
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
    } catch {
      showStatusToast("Verification failed", "error");
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 relative">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-blue-700 font-semibold"
      >
        <ArrowLeft size={18} /> Back
      </button>

      {verificationStatus && (
        <span
          className={`absolute top-6 right-6 px-6 py-2 rounded-full font-bold text-white ${
            verificationStatus === "Verified"
              ? "bg-green-600"
              : "bg-red-600"
          }`}
        >
          {verificationStatus}
        </span>
      )}

      {/* PERSONAL */}
      <Section title="Personal Information" icon={<User />}>
        <FieldCard label="Name" value={`${offer.first_name} ${offer.last_name}`} />
        <FieldCard label="Email" value={offer.email} />
        <FieldCard label="Phone" value={offer.contact_number} />
        <FieldCard label="Designation" value={offer.designation} />

        <FieldCard
          label="Date of Birth"
          value={personal_details?.date_of_birth}
        />
        <FieldCard
          label="Gender"
          value={personal_details?.gender}
        />
        <FieldCard
          label="Marital Status"
          value={personal_details?.marital_status}
        />
        <FieldCard
          label="Blood Group"
          value={personal_details?.blood_group}
        />
        <FieldCard
          label="Nationality"
          value={personal_details?.nationality}
        />
        <FieldCard
          label="Residence"
          value={personal_details?.residence}
        />
      </Section>


      {/* ADDRESS */}
      <Section title="Address" icon={<MapPin />}>
        {addresses?.map((a) => (
          <AddressCard key={a.address_uuid} address={a} />
        ))}
      </Section>

      {/* EDUCATION */}
      <Section title="Education" icon={<GraduationCap />}>
        {Object.values(groupedEducation || {}).map((edu, i) => (
          <GroupedCard
            key={i}
            title={edu.title}
            subtitle={edu.subtitle}
            documents={edu.documents}
            onView={openFileInNewTab}
          />
        ))}
      </Section>

      {/* EXPERIENCE */}
      <Section title="Work Experience" icon={<Briefcase />}>
        {Object.values(groupedExperience || {}).map((exp, i) => (
          <GroupedCard
            key={i}
            title={exp.title}
            subtitle={exp.subtitle}
            documents={exp.documents}
            onView={openFileInNewTab}
          />
        ))}
      </Section>

      {/* IDENTITY */}
      <Section title="Identity Documents" icon={<File />}>
        {Object.values(groupedIdentity || {}).map((grp, i) => (
          <GroupedCard
            key={i}
            title={grp.title}
            documents={grp.documents}
            onView={openFileInNewTab}
          />
        ))}
      </Section>

      {/* BUTTONS — UNCHANGED */}
      {!verificationStatus && offer.offer_status === "Submitted" && (
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={() => updateVerificationStatus("Verified")}
            disabled={verifying || rejecting}
            className="px-6 py-2 rounded-full bg-green-600 text-white"
          >
            {verifying ? "Verifying..." : "Verify"}
          </button>

          <button
            onClick={() => updateVerificationStatus("Rejected")}
            disabled={verifying || rejecting}
            className="px-6 py-2 rounded-full bg-red-600 text-white"
          >
            {rejecting ? "Rejecting..." : "Reject"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- UI HELPERS ---------- */

function Section({ title, icon, children }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 border border-gray-200 transition-all duration-200 hover:shadow-md">
      <div className="flex gap-2 items-center border-b pb-2 mb-4">
        <span className="text-indigo-600">{icon}</span>
        <h2 className="font-bold text-lg">{title}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{children}</div>
    </div>
  );
}

function FieldCard({ label, value }) {
  return (
    <div className="p-4 bg-gray-50 rounded border border-gray-200 transition-all duration-200 hover:shasow-sm hover:-translate-y-[2px]">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-semibold">{value || "—"}</p>
    </div>
  );
}

function AddressCard({ address }) {
  return (
    <div className="p-4 bg-gray-50 rounded border">
      <p className="font-semibold text-indigo-700 capitalize">
        {address.address_type} Address
      </p>
      <p>{address.address_line1}</p>
      <p>{address.city}, {address.state_or_region}</p>
      <p>{address.postal_code}, {address.country}</p>
    </div>
  );
}

function GroupedCard({ title, subtitle, documents, onView }) {
  return (
    <div className="col-span-full bg-gray-50 border rounded-lg p-4">
      <h3 className="font-semibold">{title}</h3>
      {subtitle && <p className="text-sm text-gray-600 mb-3">{subtitle}</p>}
      <div className="space-y-2">
        {documents.map((doc) => (
          <div
            key={doc.document_uuid}
            className="flex justify-between items-center bg-white p-3 rounded border border-gray-200 transition-all duration-200 hover:shadow-md hover:-translate-y-[2px]"
          >
            <span>{doc.document_name || "Document"}</span>
            <button
              onClick={() => onView(doc.file_path)}
              className="text-indigo-600 font-semibold hover:underline"
            >
              View
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
