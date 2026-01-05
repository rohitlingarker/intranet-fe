"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Mail,
  Phone,
  Briefcase,
  IndianRupee,
  User,
  BadgeCheck,
} from "lucide-react";

export default function AdminOfferView() {
  const { user_uuid } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const BASE = import.meta.env.VITE_EMPLOYEE_ONBOARDING_URL;

  const [offer, setOffer] = useState(null);
  const [approval, setApproval] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState("");

  /* ---------------- FETCH OFFER ---------------- */
  const fetchOffer = async () => {
    const res = await axios.get(
      `${BASE}/offerletters/offer/${user_uuid}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setOffer(res.data);
  };

  /* ---------------- FETCH APPROVAL FOR THIS USER ---------------- */
  const fetchApproval = async () => {
    const res = await axios.get(
      `${BASE}/offer-approval/my-actions`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const found = res.data.find(item => item.user_uuid === user_uuid);
    setApproval(found || null);
  };

  useEffect(() => {
    Promise.all([fetchOffer(), fetchApproval()])
      .catch(() => setError("Failed to load data"))
      .finally(() => setLoading(false));
  }, [user_uuid]);

  /* ---------------- SUBMIT ADMIN ACTION ---------------- */
  const submitAction = async (action) => {
    try {
      setActing(true);
      setError("");

      await axios.put(
      `${BASE}/offer-approval/update_action`,
      {
        user_uuid,
        action,
        comments:
          action === "APPROVED"
            ? "Approved by admin"
            : action === "REJECTED"
            ? "Rejected by admin"
            : "Kept on hold by admin",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );


      // 🔄 refresh approval status after action
      await fetchApproval();

    } catch (e) {
      setError(
        e?.response?.data?.detail ||
        "Unable to update approval status"
      );
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  if (!offer) {
    return <div className="p-10 text-center text-red-600">Offer not found</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-blue-900 hover:underline mb-6 font-semibold"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      <div className="bg-white rounded-xl shadow-md p-8">

        {/* HEADER */}
        <div className="flex gap-4 mb-8">
          <div className="bg-blue-100 text-blue-900 rounded-full p-3">
            <User />
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-blue-900">
              {offer.first_name} {offer.last_name}
            </h1>

            <p className="flex items-center gap-2 text-gray-700">
              <BadgeCheck size={16} />
              Offer Status:
              <span className="font-medium">{offer.status}</span>
            </p>

            {approval && (
              <ApprovalBadge
                status={approval.action}
                approver={approval.requested_by_name}
              />
            )}
          </div>
        </div>

        {/* DETAILS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DetailCard icon={<Mail />} label="Email" value={offer.mail} />
          <DetailCard
            icon={<Phone />}
            label="Contact"
            value={`+${offer.country_code} ${offer.contact_number}`}
          />
          <DetailCard
            icon={<Briefcase />}
            label="Designation"
            value={offer.designation}
          />
          <DetailCard
            icon={<IndianRupee />}
            label="CTC"
            value={`${offer.package} ${offer.currency}`}
          />
        </div>

        {/* ADMIN ACTION BUTTONS */}
        {approval?.action === "Pending" && (
          <div className="flex gap-4 mt-10">
            <button
              disabled={acting}
              onClick={() => submitAction("APPROVED")}
              className="px-6 py-2 bg-green-700 text-white rounded-lg"
            >
              Approve
            </button>

            <button
              disabled={acting}
              onClick={() => submitAction("REJECTED")}
              className="px-6 py-2 bg-red-700 text-white rounded-lg"
            >
              Reject
            </button>

            <button
              disabled={acting}
              onClick={() => submitAction("ON_HOLD")}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg"
            >
              On Hold
            </button>
          </div>
        )}

        {error && (
          <p className="text-red-600 mt-4 font-medium">{error}</p>
        )}
      </div>
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function DetailCard({ icon, label, value }) {
  return (
    <div className="border rounded-lg p-4 flex items-start gap-4">
      <div className="text-blue-900">{icon}</div>
      <div>
        <p className="text-sm text-gray-700">{label}</p>
        <p className="font-semibold text-blue-900">{value || "—"}</p>
      </div>
    </div>
  );
}

function ApprovalBadge({ status, approver }) {
  const styles = {
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-300",
    APPROVED: "bg-green-100 text-green-800 border-green-300",
    REJECTED: "bg-red-100 text-red-800 border-red-300",
    ON_HOLD: "bg-gray-100 text-gray-800 border-gray-300",
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 mt-2 text-sm border rounded-full ${styles[status]}`}
    >
      <span className="font-medium">{status}</span>
      {approver && <span className="text-xs">• {approver}</span>}
    </div>
  );
}
