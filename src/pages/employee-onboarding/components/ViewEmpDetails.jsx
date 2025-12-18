"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { showStatusToast } from "../../../components/toastfy/toast"; 
import {
  ArrowLeft,
  Mail,
  Phone,
  Briefcase,
  IndianRupee,
  User,
  BadgeCheck,
} from "lucide-react";

export default function ViewEmpDetails() {
  const { user_uuid } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchEmployee = async () => {
      const token = localStorage.getItem("token");

      try {
        const res = await axios.get(
          `${import.meta.env.VITE_EMPLOYEE_ONBOARDING_URL}/offerletters/offer/${user_uuid}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setEmployee(res.data);
      } catch (error) {
        console.error("Failed to fetch employee details", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [user_uuid]);



  /* -------------------- SINGLE SEND (Bulk Endpoint) -------------------- */
  const handleSendOffer = async () => {
    const token = localStorage.getItem("token");

    try {
      setSending(true);

      const res = await axios.post(
        `${import.meta.env.VITE_EMPLOYEE_ONBOARDING_URL}/offerletters/bulk-send`,
        {
          user_uuid_list: [user_uuid], // ✅ single user via bulk endpoint
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      showStatusToast(res.data.results?.[0]?.message || "Offer sent successfully");

      // ✅ Refresh employee status after send
      fetchEmployee();
    } catch (error) {
      console.error("Failed to send offer", error);
      showStatusToast("Failed to send offer");
    } finally {
      setSending(false);
    }
  };

  /* -------------------- Loading -------------------- */
  if (loading) {
    return (
      <div className="p-10 text-center text-gray-700">
        Loading employee details...
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-10 text-center text-red-600">
        Employee not found
      </div>
    );
  }

  /* -------------------- UI -------------------- */
  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-blue-900 hover:underline mb-6 text-lg font-semibold"
      >
        <ArrowLeft size={20} />
        Back to Offers
      </button>

      {/* Card */}
      <div className="bg-white rounded-xl shadow-md p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 text-blue-900 rounded-full p-3">
              <User />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-blue-900">
                {employee.first_name} {employee.last_name}
              </h1>
              <p className="text-gray-900 flex items-center gap-2">
                <BadgeCheck size={16} />
                Status: <span className="font-medium text-blue-900">{employee.status}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DetailCard
            icon={<Mail />}
            label="Email"
            value={employee.mail}
          />

          <DetailCard
            icon={<Phone />}
            label="Contact"
            value={`+${employee.country_code} ${employee.contact_number}`}
          />

          <DetailCard
            icon={<Briefcase />}
            label="Designation"
            value={employee.designation}
          />

          <DetailCard
            icon={<IndianRupee />}
            label="CTC"
            value={`${employee.package} ${employee.currency}`}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-4 mt-10">
          {/* <button className="px-6 py-2 bg-green-700 hover:bg-green-700 text-white rounded-lg">
            Send Offer
          </button> */}
          <button
            onClick={handleSendOffer}
            disabled={sending || employee.status === "SENT"}
            className={`px-6 py-2 rounded-lg text-white ${
              employee.status === "SENT"
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-700 hover:bg-green-800"
            }`}
          >
            {sending ? "Sending..." : "Send Offer"}
          </button>

          <button className="px-6 py-2 bg-red-700 hover:bg-red-700 text-white rounded-lg">
            Delete Offer
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------- Reusable Card -------------------- */
function DetailCard({ icon, label, value }) {
  return (
    <div className="border rounded-lg p-4 flex items-start gap-4">
      <div className="text-blue-900">{icon}</div>
      <div>
        <p className="text-sm text-gray-900">{label}</p>
        <p className="font-semibold text-blue-900">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}
