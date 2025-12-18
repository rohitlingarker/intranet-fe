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
  Pencil,
} from "lucide-react";

export default function ViewEmpDetails() {
  const { user_uuid } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [editData, setEditData] = useState({
    first_name: "",
    last_name: "",
    mail: "",
    country_code: "",
    contact_number: "",
    designation: "",
    package: "",
    currency: "",
  });

  /* -------------------- FETCH EMPLOYEE -------------------- */
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

      setEditData({
        first_name: res.data.first_name,
        last_name: res.data.last_name,
        mail: res.data.mail,
        country_code: res.data.country_code,
        contact_number: res.data.contact_number,
        designation: res.data.designation,
        package: res.data.package,
        currency: res.data.currency,
      });
    } catch (error) {
      console.error("Failed to fetch employee details", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployee();
  }, [user_uuid]);

  /* -------------------- SEND OFFER -------------------- */
  const handleSendOffer = async () => {
    const token = localStorage.getItem("token");

    try {
      setSending(true);

      const res = await axios.post(
        `${import.meta.env.VITE_EMPLOYEE_ONBOARDING_URL}/offerletters/bulk-send`,
        { user_uuid_list: [user_uuid] },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      showStatusToast(
        res.data.results?.[0]?.message || "Offer sent successfully"
      );
      fetchEmployee();
    } catch (error) {
      console.error("Failed to send offer", error);
      showStatusToast("Failed to send offer");
    } finally {
      setSending(false);
    }
  };

  /* -------------------- UPDATE OFFER -------------------- */
  const handleUpdateOffer = async () => {
    const token = localStorage.getItem("token");

    try {
      setUpdating(true);

      await axios.put(
        `${import.meta.env.VITE_EMPLOYEE_ONBOARDING_URL}/offerletters/${user_uuid}`,
        {
          ...editData,
          contact_number: String(editData.contact_number),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Optimistic UI
      setEmployee((prev) => ({ ...prev, ...editData }));

      showStatusToast("Offer updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Update failed", error?.response?.data);
      showStatusToast("Failed to update offer");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center">Loading employee details...</div>;
  }

  if (!employee) {
    return (
      <div className="p-10 text-center text-red-600">
        Employee not found
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-blue-900 hover:underline mb-6 font-semibold"
      >
        <ArrowLeft size={20} />
        Back to Offers
      </button>

      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 text-blue-900 rounded-full p-3">
              <User />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-blue-900">
                {employee.first_name} {employee.last_name}
              </h1>
              <p className="flex items-center gap-2 text-gray-900">
                <BadgeCheck size={16} />
                Status:
                <span className="ml-1 font-medium text-blue-900">
                  {employee.status}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(true)}
            disabled={employee.status === "SENT"}
            className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg disabled:bg-gray-400"
          >
            <Pencil size={16} />
            Edit Offer
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DetailCard icon={<Mail />} label="Email" value={employee.mail} />
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

        {isEditing && (
          <div className="mt-10 border rounded-lg p-6 bg-gray-50">
            <h3 className="text-lg font-semibold mb-4 text-blue-900">
              Edit Offer Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.keys(editData).map((key) => (
                <input
                  key={key}
                  disabled={updating}
                  value={editData[key]}
                  onChange={(e) =>
                    setEditData({ ...editData, [key]: e.target.value })
                  }
                  placeholder={key.replace("_", " ").toUpperCase()}
                  className={`border p-2 rounded ${
                    updating ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                />
              ))}
            </div>

            {updating && (
              <p className="text-sm text-blue-900 mt-3">
                Saving changes, please wait...
              </p>
            )}

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleUpdateOffer}
                disabled={updating}
                className={`px-6 py-2 rounded-lg text-white flex items-center gap-2 ${
                  updating
                    ? "bg-green-400 cursor-not-allowed"
                    : "bg-green-700 hover:bg-green-800"
                }`}
              >
                {updating ? "Saving..." : "Save Changes"}
              </button>

              <button
                disabled={updating}
                onClick={() => setIsEditing(false)}
                className={`px-6 py-2 rounded-lg ${
                  updating
                    ? "bg-gray-200 cursor-not-allowed"
                    : "bg-gray-300"
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-4 mt-10">
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

          <button className="px-6 py-2 bg-red-700 text-white rounded-lg">
            Delete Offer
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------- CARD -------------------- */
function DetailCard({ icon, label, value }) {
  return (
    <div className="border rounded-lg p-4 flex items-start gap-4">
      <div className="text-blue-900">{icon}</div>
      <div>
        <p className="text-sm text-gray-900">{label}</p>
        <p className="font-semibold text-blue-900">{value || "—"}</p>
      </div>
    </div>
  );
}
