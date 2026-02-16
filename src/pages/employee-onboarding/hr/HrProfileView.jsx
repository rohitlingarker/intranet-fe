"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { showStatusToast } from "../../../components/toastfy/toast.jsx";
import { ArrowLeft, User, MapPin, Check, X } from "lucide-react";

export default function HrProfileView() {
  const { user_uuid } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const BASE_URL = import.meta.env.VITE_EMPLOYEE_ONBOARDING_URL;

  const tabs = ["overview", "education", "experience", "documents"];

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const [sectionStatus, setSectionStatus] = useState({
    overview: false,
    education: false,
    experience: false,
    documents: false,
  });

  const [docStatus, setDocStatus] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [finalLoading, setFinalLoading] = useState(false);

  /* ================= HELPER ================= */

  const getDocKey = (d, i) =>
    d.document_uuid || d.file_path || `${i}`;

  /* ================= FETCH ================= */

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${BASE_URL}/hr/hr/${user_uuid}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProfile(res.data);

        const status =
          res.data.offer?.offer_status !== "Submitted"
            ? res.data.offer?.offer_status
            : null;

        setVerificationStatus(status);

        if (status === "Verified") {
          setSectionStatus({
            overview: true,
            education: true,
            experience: true,
            documents: true,
          });

          const allDocs = {};
          [
            ...(res.data.education_documents || []),
            ...(res.data.identity_documents || []),
            ...(res.data.experience?.flatMap(e => e.documents || []) || []),
          ].forEach((d, i) => {
            allDocs[getDocKey(d, i)] = true;
          });

          setDocStatus(allDocs);
        }
      } catch {
        showStatusToast("Failed to load profile", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [user_uuid]);

  /* ================= VIEW DOCUMENT ================= */

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
      showStatusToast("Failed to open document", "error");
    }
  }

  /* ================= VERIFY SECTION ================= */

  const verifySection = () => {
    const currentDocs =
      activeTab === "education"
        ? profile.education_documents || []
        : activeTab === "experience"
        ? profile.experience?.flatMap(e => e.documents || []) || []
        : activeTab === "documents"
        ? profile.identity_documents || []
        : [];

    const allDocsDone =
      currentDocs.length === 0 ||
      currentDocs.every((d, i) => docStatus[getDocKey(d, i)] === true);

    if (!allDocsDone) {
      showStatusToast("Please verify all documents first", "error");
      return;
    }

    setSectionStatus(s => ({ ...s, [activeTab]: true }));
    showStatusToast("Section verified", "success");
  };

  /* ================= FINAL VERIFY ================= */

  const allSectionsVerified = Object.values(sectionStatus).every(Boolean);
  const allDocsVerified =
    Object.values(docStatus).length > 0 &&
    Object.values(docStatus).every(Boolean);

  const finalVerifyProfile = async () => {
    if (!allSectionsVerified || !allDocsVerified) {
      showStatusToast("Verify all sections & documents first", "error");
      return;
    }

    try {
      setFinalLoading(true);

      await axios.post(
        `${BASE_URL}/hr/verify-profile`,
        { user_uuid, status: "Verified" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setVerificationStatus("Verified");
      setShowConfirm(false);
      setShowSuccess(true);

      showStatusToast("Profile verified successfully", "success");
    } catch {
      showStatusToast("Final verification failed", "error");
    } finally {
      setFinalLoading(false);
    }
  };

  /* ================= LOADING ================= */

  if (loading) return <CenteredMsg text="Loading profile..." />;
  if (!profile || !profile.offer)
    return <CenteredMsg text="Profile not found" error />;

  const {
    offer,
    personal_details,
    addresses,
    education_documents,
    experience,
    identity_documents,
  } = profile;

  const groupedEducation = groupEducation(education_documents);
  const groupedExperience = groupExperience(experience);
  const groupedIdentity = groupIdentity(identity_documents);

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-[#f4f6fb]">

      <Header offer={offer} verificationStatus={verificationStatus} navigate={navigate} />

      {/* TABS */}
      <div className="max-w-6xl mx-auto px-6 mt-6 border-b flex gap-6 text-sm">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`pb-3 flex items-center gap-2 capitalize ${
              activeTab === t
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500"
            }`}
          >
            <input
              type="checkbox"
              checked={sectionStatus[t]}
              onChange={() => setSectionStatus((s) => ({ ...s, [t]: !s[t] }))}
            />
            {t}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto p-6 space-y-6">

        {activeTab === "overview" && (
          <Section title="Personal & Address" verified={sectionStatus.overview}>
            <div className="grid md:grid-cols-2 gap-6">
              <ColorCard title="Personal Information" icon={<User size={18} />}>
                <Info label="Email" value={offer.email} />
                <Info label="Phone" value={offer.contact_number} />
                <Info label="DOB" value={personal_details?.date_of_birth} />
                <Info label="Gender" value={personal_details?.gender} />
              </ColorCard>

              <ColorCard title="Address" icon={<MapPin size={18} />}>
                {addresses?.map((a) => (
                  <p key={a.address_uuid}>{a.address_line1}, {a.city}</p>
                ))}
              </ColorCard>
            </div>
          </Section>
        )}

        {activeTab === "education" &&
          Object.values(groupedEducation).map((edu, i) => (
            <Section key={i} title={edu.title} verified={sectionStatus.education}>
              <DocCard {...edu} docStatus={docStatus} setDocStatus={setDocStatus} onView={openFileInNewTab} />
            </Section>
          ))}

        {activeTab === "experience" &&
          Object.values(groupedExperience).map((exp, i) => (
            <Section key={i} title={exp.title} verified={sectionStatus.experience}>
              <DocCard {...exp} docStatus={docStatus} setDocStatus={setDocStatus} onView={openFileInNewTab} />
            </Section>
          ))}

        {activeTab === "documents" &&
          Object.values(groupedIdentity).map((doc, i) => (
            <Section key={i} title={doc.title} verified={sectionStatus.documents}>
              <DocCard {...doc} docStatus={docStatus} setDocStatus={setDocStatus} onView={openFileInNewTab} />
            </Section>
          ))}

        {/* NAVIGATION */}
        <div className="flex justify-between pt-6">
          <button
            disabled={activeTab === "overview"}
            onClick={() => setActiveTab(tabs[tabs.indexOf(activeTab) - 1])}
            className="px-4 py-2 border rounded disabled:opacity-40"
          >
            Previous
          </button>

          <div className="flex gap-3">
            {!sectionStatus[activeTab] && verificationStatus !== "Verified" && (
              <button
                onClick={verifySection}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Verify Section
              </button>
            )}

            {activeTab !== "documents" ? (
              <button
                onClick={() => setActiveTab(tabs[tabs.indexOf(activeTab) + 1])}
                className="px-4 py-2 bg-indigo-600 text-white rounded"
              >
                Next
              </button>
            ) : (
              <button
                onClick={() => setShowConfirm(true)}
                disabled={verificationStatus === "Verified"}
                className="px-6 py-2 bg-green-700 text-white rounded disabled:opacity-40"
              >
                Final Verify Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CONFIRM */}
      {showConfirm && (
        <Modal>
          <h2 className="text-lg font-semibold">Are you sure you want to verify this profile?</h2>

          {(!allSectionsVerified || !allDocsVerified) && (
            <p className="text-red-600 text-sm mt-2">
              All sections and documents must be verified first.
            </p>
          )}

          <div className="flex gap-3 justify-center mt-4">
            <button onClick={() => setShowConfirm(false)} className="px-4 py-2 border rounded">
              Cancel
            </button>

            <button
              onClick={finalVerifyProfile}
              disabled={!allSectionsVerified || !allDocsVerified || finalLoading}
              className="px-6 py-2 bg-green-600 text-white rounded"
            >
              {finalLoading ? "Verifying..." : "Yes, Verify"}
            </button>
          </div>
        </Modal>
      )}

      {/* SUCCESS */}
      {showSuccess && (
        <Modal>
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-green-600 flex items-center justify-center text-white text-4xl">
              ✓
            </div>
            <h2 className="text-2xl font-semibold">Profile Verified!</h2>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2 bg-indigo-600 text-white rounded"
            >
              Go Back
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* DOC CARD */

const DocCard = ({ title, documents = [], onView, docStatus, setDocStatus }) => (
  <div className="border rounded p-4 space-y-2">
    <p className="font-semibold">{title}</p>

    {documents.map((d, i) => {
      const key = d.document_uuid || d.file_path || `${i}`;
      const verified = docStatus[key];

      return (
        <div key={key} className="flex justify-between items-center border rounded px-3 py-2">
          <span>{d.document_name || d.file_name || d.doc_type || "Document"}</span>

          <div className="flex items-center gap-3">
            {d.file_path && (
              <button onClick={() => onView(d.file_path)} className="text-indigo-600 text-sm">
                View
              </button>
            )}

            <span className={`text-xs font-semibold ${verified ? "text-green-600" : "text-gray-400"}`}>
              {verified ? "Verified" : "Pending"}
            </span>

            <Check size={18} className="text-green-600 cursor-pointer"
              onClick={() => setDocStatus(s => ({ ...s, [key]: true }))} />

            <X size={18} className="text-red-500 cursor-pointer"
              onClick={() => setDocStatus(s => ({ ...s, [key]: false }))} />
          </div>
        </div>
      );
    })}
  </div>
);

/* SMALL UI COMPONENTS */

const Header = ({ offer, verificationStatus, navigate }) => (
  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-6">
    <button onClick={() => navigate(-1)} className="mb-4 flex gap-2 items-center">
      <ArrowLeft size={18} /> Back
    </button>

    <div className="flex items-center gap-4">
      <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
        {offer.first_name?.[0]}
      </div>

      <div>
        <h1 className="text-2xl font-semibold">
          {offer.first_name} {offer.last_name}
        </h1>
        <p>{offer.designation}</p>
      </div>

      {verificationStatus && (
        <span className="ml-auto bg-white/20 px-4 py-1 rounded-full text-sm">
          {verificationStatus}
        </span>
      )}
    </div>
  </div>
);

const Section = ({ title, children, verified }) => (
  <div className="bg-white rounded-xl border p-6 shadow-sm space-y-4">
    <div className="flex justify-between items-center">
      <h3 className="font-semibold text-lg">{title}</h3>
      {verified && <span className="text-green-600 text-sm font-semibold">✔ Verified</span>}
    </div>
    {children}
  </div>
);

const ColorCard = ({ title, icon, children }) => (
  <div className="bg-gray-50 rounded-lg p-4 border space-y-2">
    <div className="flex items-center gap-2 font-semibold text-indigo-600">
      {icon} {title}
    </div>
    {children}
  </div>
);

const Info = ({ label, value }) => (
  <p className="text-sm"><span className="text-gray-500">{label}: </span>{value || "—"}</p>
);

const Modal = ({ children }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-6 text-center">{children}</div>
  </div>
);

const CenteredMsg = ({ text, error }) => (
  <div className={`p-20 text-center ${error ? "text-red-600" : ""}`}>{text}</div>
);

/* GROUP HELPERS */

const groupEducation = (l = []) =>
  l.reduce((a, e) => {
    const k = `${e.education_level} – ${e.specialization}`;
    a[k] ||= { title: k, documents: [] };
    a[k].documents.push(e);
    return a;
  }, {});

const groupExperience = (l = []) =>
  l.reduce((a, e) => {
    const k = `${e.company_name} – ${e.role_title}`;
    a[k] ||= { title: k, documents: [] };
    a[k].documents.push(...(e.documents || []));
    return a;
  }, {});

const groupIdentity = (l = []) =>
  l.reduce((a, d) => {
    a[d.identity_type] ||= { title: d.identity_type, documents: [] };
    a[d.identity_type].documents.push(d);
    return a;
  }, {});
