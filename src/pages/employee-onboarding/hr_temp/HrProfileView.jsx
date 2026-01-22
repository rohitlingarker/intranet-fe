"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  User,
  FileText,
  MapPin,
  GraduationCap,
  Briefcase,
  File,
} from "lucide-react";

// const [fileLoading, setFileLoading] = useState(false);

export default function HrProfileView() {
  const { user_uuid } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const BASE_URL = import.meta.env.VITE_EMPLOYEE_ONBOARDING_URL;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/hr/hr/${user_uuid}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user_uuid]);

  if (loading)
    return <div className="p-10 text-center">Loading profile...</div>;

  if (!profile || !profile.user)
    return (
      <div className="p-10 text-center text-red-600">Profile not found</div>
    );

  const {
    user,
    personal_details,
    addresses,
    identity_documents,
    education_documents,
    experience,
  } = profile;

  // ------------------ DOCUMENT OPEN FUNCTION ------------------
  function removeQuotes(url) {
    return url.replace(/^"+|"+$/g, "");
  }

  async function openFileInNewTab(url) {
    // setFileLoading(true);
    const newTab = window.open("", "_blank");
    try {
      const res = await axios.get(`${BASE_URL}/hr/view_documents`, {
        params: { file_path: encodeURIComponent(url) },
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Signed URL response:", res.data);
      const cleanUrl = removeQuotes(res.data);
      newTab.location.href = cleanUrl;
    } catch (err) {
      console.error("Failed to open document", err);
      newTab.close(); // cleanup if error
    } finally {
      // setFileLoading(false);
    }
  }

  // async function openFileInNewTab(url) {
  //   try {
  //     const res = await axios.get(`${BASE_URL}/hr/view_documents`, {
  //       params: { file_path: encodeURIComponent(url) },
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     console.log("Signed URL response:", res.data);
  //     const cleanUrl = await removeQuotes(res.data);
  //     window.open(cleanUrl, "_blank");
  //   } catch (err) {
  //     console.error("Failed to open document", err);
  //   }
  // }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-blue-900 font-semibold hover:underline"
      >
        <ArrowLeft size={18} /> Back
      </button>

      {/* PERSONAL INFO */}
      <Section title="Personal Information" icon={<User />}>
        <FieldCard
          label="Name"
          value={`${user.first_name} ${user.last_name}`}
        />
        <FieldCard label="Email" value={user.email} />
        <FieldCard label="Phone" value={user.contact_number} />
        <FieldCard label="Designation" value={user.designation} />
        <FieldCard label="Gender" value={personal_details?.gender} />
        <FieldCard
          label="Date of Birth"
          value={personal_details?.date_of_birth}
        />
        <FieldCard
          label="Marital Status"
          value={personal_details?.marital_status}
        />
        <FieldCard label="Blood Group" value={personal_details?.blood_group} />
        <FieldCard label="Nationality" value={personal_details?.nationality} />
        <FieldCard label="Residence" value={personal_details?.residence} />
      </Section>

      {/* ADDRESS */}
      <Section title="Address" icon={<MapPin />}>
        {addresses?.length ? (
          addresses.map((addr) => (
            <AddressCard key={addr.address_uuid} address={addr} />
          ))
        ) : (
          <Info label="Address" value="No address available" />
        )}
      </Section>

      {/* EDUCATION */}
      <Section title="Education" icon={<GraduationCap />}>
        {education_documents?.length ? (
          <div className="space-y-4">
            {education_documents.map((edu) => (
              <DocumentCard
                key={edu.document_uuid}
                title={`${edu.education_level} - ${edu.specialization}`}
                subtitle={`${edu.institution_name} (${edu.year_of_passing})`}
                documentName={edu.document_name}
                filePath={edu.file_path} // signed URL
                onView={openFileInNewTab}
              />
            ))}
          </div>
        ) : (
          <Info label="Education" value="No education documents uploaded" />
        )}
      </Section>

      {/* EXPERIENCE */}
      <Section title="Work Experience" icon={<Briefcase />}>
        {experience?.length ? (
          <div className="space-y-4">
            {experience.map((exp) => (
              <ExperienceCard
                key={exp.experience_uuid}
                exp={exp}
                onView={openFileInNewTab}
              />
            ))}
          </div>
        ) : (
          <Info label="Experience" value="No work experience provided" />
        )}
      </Section>

      {/* IDENTITY DOCUMENTS */}
      <Section title="Identity Documents" icon={<File />}>
        {identity_documents?.length ? (
          <div className="space-y-4">
            {identity_documents.map((doc) => (
              <DocumentCard
                key={doc.document_uuid}
                title={doc.identity_type}
                documentName={doc.document_name}
                filePath={doc.file_path}
                onView={openFileInNewTab}
              />
            ))}
          </div>
        ) : (
          <Info label="Identity" value="No identity documents uploaded" />
        )}
      </Section>
    </div>
  );
}

/* ------------------ UI HELPERS ------------------ */
function Section({ title, icon, children }) {
  return (
    <div className="bg-gray-50 rounded-xl shadow-sm p-6 hover:shadow-md transition">
      <h2 className="flex items-center gap-2 text-lg font-semibold mb-5 text-indigo-700">
        {icon} {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function FieldCard({ label, value }) {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition">
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
    <div className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition space-y-1">
      <p className="text-sm font-semibold text-indigo-700">
        {address.address_type} Address
      </p>
      <p className="text-gray-900">
        {address.address_line1}
        {address.address_line2 && `, ${address.address_line2}`}
      </p>
      <p className="text-gray-700">
        {address.city}, {address.state_or_region}
      </p>
      <p className="text-gray-600">
        {address.postal_code}, {address.country}
      </p>
    </div>
  );
}

/* ------------------ DOCUMENT CARD ------------------ */
function DocumentCard({ title, subtitle, documentName, filePath, onView }) {
  return (
    <div className="border rounded-lg p-4 shadow-sm bg-white hover:shadow-md transition min-h-[100px]">
      {title && <h4 className="font-semibold text-gray-900">{title}</h4>}
      {subtitle && <p className="text-gray-700">{subtitle}</p>}
      {documentName && <p className="text-gray-700 mt-1">{documentName}</p>}
      {filePath && (
        <button
          className="mt-3 text-blue-600 font-medium cursor-pointer hover:underline"
          onClick={() => onView(filePath)}
        >
          View Document
        </button>
      )}
    </div>
  );
}

/* ------------------ EXPERIENCE CARD ------------------ */
function ExperienceCard({ exp, onView }) {
  const statusStyles = {
    verified: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    pending: "bg-orange-100 text-orange-700",
  };

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-gray-900">{exp.company_name}</h3>
          <p className="text-gray-700">{exp.role_title}</p>
        </div>
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            statusStyles[exp.certificate_status] || "bg-gray-100 text-gray-700"
          }`}
        >
          Verification: {exp.certificate_status?.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
        <p>
          <span className="font-medium">Employment Type:</span>{" "}
          {exp.employment_type}
        </p>
        <p>
          <span className="font-medium">Duration:</span>{" "}
          {formatDate(exp.start_date)} →{" "}
          {exp.is_current ? "Present" : formatDate(exp.end_date)}
        </p>
      </div>

      {exp.remarks && (
        <p className="text-sm text-gray-600 italic">
          <span className="font-medium not-italic">Remarks:</span> {exp.remarks}
        </p>
      )}

      {exp.documents && exp.documents.length > 0 && (
        <div className="mt-2 space-y-1">
          {exp.documents.map((doc) => (
            <DocumentCard
              key={doc.document_uuid}
              title={doc.document_name}
              filePath={doc.file_path}
              onView={onView}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------ HELPER ------------------ */
function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}
