"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function ViewEmpDetails() {
  const { user_uuid } = useParams();
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_EMPLOYEE_ONBOARDING_URL;
  const token = localStorage.getItem("token");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/onboarding/profile/${user_uuid}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setData(res.data);
      } catch (err) {
        console.error("Failed to load employee details", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [user_uuid]);

  if (loading) {
    return <div className="p-10 text-center">Loading profile...</div>;
  }

  if (!data) {
    return <div className="p-10 text-center text-red-500">No data found</div>;
  }

  const {
    personal_details,
    address_details,
    identity_documents,
    education_details,
    experience_details,
    onboarding_status,
  } = data;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Employee Profile
          </h1>
          <p className="text-gray-500">
            Status: <span className="font-medium">{onboarding_status}</span>
          </p>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-lg border text-sm"
        >
          Back
        </button>
      </div>

      {/* Personal Details */}
      <Section title="Personal Details">
        <Grid>
          <Item
            label="Name"
            value={`${personal_details?.first_name || ""} ${
              personal_details?.last_name || ""
            }`}
          />
          <Item label="DOB" value={personal_details?.date_of_birth} />
          <Item label="Gender" value={personal_details?.gender} />
          <Item label="Marital Status" value={personal_details?.marital_status} />
          <Item label="Blood Group" value={personal_details?.blood_group} />
          <Item label="Contact" value={personal_details?.contact_number} />
          <Item label="Email" value={personal_details?.mail} />
        </Grid>
      </Section>

      {/* Address */}
      <Section title="Address Details">
        <Grid>
          <Item label="Address Line 1" value={address_details?.line1} />
          <Item label="Address Line 2" value={address_details?.line2} />
          <Item label="City" value={address_details?.city} />
          <Item label="State" value={address_details?.state} />
          <Item label="Country" value={address_details?.country} />
          <Item label="Pincode" value={address_details?.pincode} />
        </Grid>
      </Section>

      {/* Identity Documents */}
      <Section title="Identity Documents">
        <div className="space-y-3">
          {(identity_documents || []).map((doc, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div>
                <p className="font-medium">{doc.type}</p>
                <p className="text-sm text-gray-500">{doc.number}</p>
              </div>
              {doc.file_url && (
                <a
                  href={doc.file_url}
                  target="_blank"
                  className="text-indigo-600 underline text-sm"
                  rel="noreferrer"
                >
                  View
                </a>
              )}
            </div>
          ))}

          {(!identity_documents || identity_documents.length === 0) && (
            <p className="text-sm text-gray-500">No documents uploaded</p>
          )}
        </div>
      </Section>

      {/* Education */}
      <Section title="Education Details">
        <div className="space-y-3">
          {(education_details || []).map((edu, i) => (
            <div key={i} className="p-3 border rounded-lg">
              <p className="font-medium">{edu.degree}</p>
              <p className="text-sm text-gray-500">
                {edu.institution} • {edu.year}
              </p>
            </div>
          ))}

          {(!education_details || education_details.length === 0) && (
            <p className="text-sm text-gray-500">No education records</p>
          )}
        </div>
      </Section>

      {/* Experience */}
      <Section title="Experience Details">
        <div className="space-y-3">
          {(experience_details || []).map((exp, i) => (
            <div key={i} className="p-3 border rounded-lg">
              <p className="font-medium">{exp.company}</p>
              <p className="text-sm text-gray-500">
                {exp.role} • {exp.years} years
              </p>
            </div>
          ))}

          {(!experience_details || experience_details.length === 0) && (
            <p className="text-sm text-gray-500">Fresher / No experience</p>
          )}
        </div>
      </Section>
    </div>
  );
}

/* ---------- Helpers ---------- */

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {children}
    </div>
  );
}

function Grid({ children }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {children}
    </div>
  );
}

function Item({ label, value }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium text-gray-900">{value || "—"}</p>
    </div>
  );
}
