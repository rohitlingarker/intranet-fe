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
  User,
  BadgeCheck,
  Pencil,
  Wallet,
} from "lucide-react";
import { set } from "date-fns";

export default function ViewEmpDetails() {
  const { user_uuid } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);

  // 🔹 Approval states
  const [openApprovalModal, setOpenApprovalModal] = useState(false);
  const [adminUsers, setAdminUsers] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState("");
  const [sendingApproval, setSendingApproval] = useState(false);
  const [approvalHistory, setApprovalHistory] = useState([]);
  const [openMenu, setOpenMenu] = useState(false);
  const [loadingSendOffer, setLoadingSendOffer] = useState(false);

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

  function toTitleCase(str) {
    str = str.toLowerCase();
    const words = str.split(' ');
    const capitalizedWords = words.map(word => {
      if (word.length === 0) return ''; 
      return word.charAt(0).toUpperCase() + word.slice(1);
    });
    return capitalizedWords.join(' ');
  }

  /* ---------------- FETCH EMPLOYEE ---------------- */
  const fetchEmployee = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_EMPLOYEE_ONBOARDING_URL}/offerletters/offer/${user_uuid}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEmployee(res.data);
      setEditData(res.data);
    } catch {
      showStatusToast("Failed to fetch employee details");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- FETCH ADMIN USERS ---------------- */
  const fetchAdminUsers = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get(
      `${import.meta.env.VITE_EMPLOYEE_ONBOARDING_URL}/offer-approval/admin-users`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setAdminUsers(res.data || []);
  };

  /* ---------------- FETCH APPROVAL HISTORY ---------------- */
  const fetchApprovalHistory = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get(
      `${import.meta.env.VITE_EMPLOYEE_ONBOARDING_URL}/offer-approval/status/${user_uuid}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setApprovalHistory(Array.isArray(res.data) ? res.data : [res.data]);
  };

  useEffect(() => {
    fetchEmployee();
    fetchApprovalHistory();
  }, [user_uuid]);

  useEffect(() => {
    if (openApprovalModal) fetchAdminUsers();
  }, [openApprovalModal]);

  /* ---------------- DERIVED STATE ---------------- */
const rawStatus = approvalHistory?.[0]?.status || "";

const approvalStatus = rawStatus.toUpperCase();

const isNoRequest = !rawStatus || approvalStatus === "NO REQUEST";
const isPending = approvalStatus.includes("PENDING");
const canModifyOfferApprovalRequest = isPending;



  const effectiveApprover =
    employee?.approver_name ||
    approvalHistory?.[0]?.action_taker_name ||
    null;

  /* ---------------- SEND OFFER ---------------- */
  const handleSendOffer = async () => {
    setLoadingSendOffer(true);
    const token = localStorage.getItem("token");
    try {
      setSending(true);
      await axios.post(
        `${import.meta.env.VITE_EMPLOYEE_ONBOARDING_URL}/offerletters/bulk-send`,
        { user_uuid_list: [user_uuid] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showStatusToast("Offer sent successfully");
      fetchEmployee();
    } catch {
      showStatusToast("Failed to send offer");
    } finally {
      setSending(false);
      setLoadingSendOffer(false);
    }
  };

  /* ---------------- CREATE / REASSIGN APPROVAL ---------------- */
  useEffect(() => {
  if (openApprovalModal && isPending) {
    const current =
      approvalHistory?.[0]?.action_taker_id ||
      approvalHistory?.[0]?.approver_id;

    if (current) {
      setSelectedAdmin(String(current));
    }
  }

  if (openApprovalModal && isNoRequest) {
    setSelectedAdmin("");
  }
}, [openApprovalModal, isPending, isNoRequest, approvalHistory]);

  const handleApprovalSubmit = async () => {
    if (!selectedAdmin) {
      showStatusToast("Please select approver");
      return;
    }

    const token = localStorage.getItem("token");
    setSendingApproval(true);

    try {
      if (isNoRequest) {
        await axios.post(
          `${import.meta.env.VITE_EMPLOYEE_ONBOARDING_URL}/offer-approval-requests/request`,
          [{ user_uuid, action_taker_id: Number(selectedAdmin) }],
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showStatusToast("Approval request sent");
      } else if (isPending) {
        await axios.put(
          `${import.meta.env.VITE_EMPLOYEE_ONBOARDING_URL}/offer-approval/reassign`,
          {
            user_uuid,
            new_approver_id: Number(selectedAdmin),
            comments: "Reassigned from UI",
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showStatusToast("Approval reassigned");
      }

      setOpenApprovalModal(false);
      setSelectedAdmin("");
      fetchApprovalHistory();
    } catch {
      showStatusToast("Failed to process approval");
    } finally {
      setSendingApproval(false);
    }
  };

  /* ---------------- UPDATE OFFER ---------------- */
  const handleUpdateOffer = async () => {
    const token = localStorage.getItem("token");

    const payload = {
    first_name: editData.first_name,
    last_name: editData.last_name,
    mail: editData.mail,
    country_code: editData.country_code,
    contact_number: editData.contact_number,
    designation: editData.designation,
    package: editData.package,
    currency: editData.currency,
  };
    try {
      setUpdating(true);
      await axios.put(
        `${import.meta.env.VITE_EMPLOYEE_ONBOARDING_URL}/offerletters/${user_uuid}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showStatusToast("Offer updated successfully");
      setIsEditing(false);
      fetchEmployee(); // Refresh data
    } catch {
      showStatusToast("Failed to update offer");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!employee) return <div className="p-10 text-center">Not found</div>;

  /* ========================= UI (UNCHANGED) ========================= */

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

              <ApprovalStatusBadge
                status={approvalStatus}
                approver={effectiveApprover}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
          {isNoRequest && (
          <button
            onClick={() => {
              setEditData(employee);
              setIsEditing(true)}}
            disabled={employee.status === "SENT"}
            className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg transition-all duration-100 ease-in-out
        active:translate-y-[1px]
        disabled:opacity-60 disabled:cursor-not-allowed
        flex items-center justify-center gap-2"
          >
            <Pencil size={16} />
            Edit Offer
          </button>
        )}
          

        {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-2xl">
            <h3 className="text-2xl font-semibold mb-4 text-blue-900">
              Edit Offer Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(editData).filter(key => ['first_name','last_name','mail','country_code','contact_number','designation','package','currency'].includes(key)).map((key) => (
              <label key={key} className="flex flex-col gap-1">
                {toTitleCase(key.replace("_", " "))}
              <input
                key={key}
                value={editData[key] || ""}
                onChange={(e) =>
                  setEditData({ ...editData, [key]: e.target.value })
                }
                className="border p-2 rounded"
                placeholder={key.replace("_", " ").toUpperCase()}
              />
              </label>
            ))}
          </div>

            <div className="flex justify-end gap-3 mt-6">
              {/* ❌ Cancel */}
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded bg-gray-200 transition-all duration-100 ease-in-out
        active:translate-y-[1px]
        disabled:opacity-60 disabled:cursor-not-allowed
        flex items-center justify-center gap-2"
              >
                Cancel
              </button>

                    {/* ✅ Save */}
                    <button
                      onClick={handleUpdateOffer}
                      disabled={updating}
                      className="px-4 py-2 rounded bg-green-700 text-white transition-all duration-100 ease-in-out
        active:translate-y-[1px]
        disabled:opacity-60 disabled:cursor-not-allowed
        flex items-center justify-center gap-2"
                    >
                      {updating ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              </div>
            )}
  

          {canModifyOfferApprovalRequest && (
            <div className="relative ">
              <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setOpenMenu(false);
                      setOpenApprovalModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg transition-all duration-100 ease-in-out
        active:translate-y-[1px]
        disabled:opacity-60 disabled:cursor-not-allowed
        flex items-center justify-center gap-2"
                  >
                    Edit Approval Request
                  </button>
                </div>
            </div>
          )}
        </div>
      </div>  

        {/* --- DETAILS --- */}
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
            icon={<Wallet />}
            label="CTC"
            value={`${employee.package} ${employee.currency}`}
          />
        </div>

        <div className="flex gap-4 mt-10">
          <button
            onClick={handleSendOffer}
            disabled={(approvalStatus !== "APPROVED") || loadingSendOffer || employee}
            className={`px-6 py-2 rounded-lg text-white transition-all duration-100 ease-in-out
        active:translate-y-[1px]
        disabled:opacity-60 disabled:cursor-not-allowed
        flex items-center justify-center gap-2 ${
              approvalStatus !== "APPROVED"
                ? "bg-gray-400"
                : "bg-green-700 hover:bg-green-800"
            }`}
          >
            {employee.status === "SENT"
    ? "Offer Sent"
    :loadingSendOffer ? "Sending..." : "Send Offer"}
          </button>

          <button
            onClick={() => setOpenApprovalModal(true)}
            disabled={!isNoRequest}
            className={`px-6 py-2 rounded-lg text-white transition-all duration-100 ease-in-out
        active:translate-y-[1px]
        disabled:opacity-60 disabled:cursor-not-allowed
        flex items-center justify-center gap-2 ${
              !isNoRequest
                ? "bg-gray-400"
                : "bg-green-700 hover:bg-green-800"
            }`}
          >
            Request Approval
          </button>
        </div>
      </div>
      

      {/* ---------- APPROVAL MODAL ---------- */}
      {openApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-full max-w-md">
            <h3 className="font-semibold mb-4">Send for Approval</h3>

            <select
              className="w-full border p-2 mb-4"
              value={selectedAdmin}
              onChange={(e) => setSelectedAdmin(e.target.value)}
            >
              <option value="">Select Approver</option>
              {adminUsers.map((a) => (
                <option key={a.user_id} value={a.user_id}>
                  {a.name}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-3">
              <button className="px-2 py-2 rounded bg-gray-200 transition-all duration-100 ease-in-out
        active:translate-y-[1px]
        disabled:opacity-60 disabled:cursor-not-allowed
        flex items-center justify-center gap-2" onClick={() => setOpenApprovalModal(false)}>Cancel</button>
              <button
                onClick={handleApprovalSubmit}
                disabled={sendingApproval}
                className="bg-indigo-700 text-white px-4 py-2 rounded transition-all duration-100 ease-in-out
        active:translate-y-[1px]
        disabled:opacity-60 disabled:cursor-not-allowed
        flex items-center justify-center gap-2"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- UI HELPERS ---------------- */
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

function ApprovalStatusBadge({ status, approver }) {
  const styles = {
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-300",
    APPROVED: "bg-green-100 text-green-800 border-green-300",
    REJECTED: "bg-red-100 text-red-800 border-red-300",
    ON_HOLD: "bg-gray-100 text-gray-800 border-gray-300",
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 mt-2 text-sm border rounded-full ${
        styles[status] || "bg-gray-100"
      }`}
    >
      <span className="font-medium">
        {status === "PENDING" ? "Approval Pending" : status}
      </span>
      {approver && <span className="text-xs opacity-80">• {approver}</span>}
    </div>
  );
}
