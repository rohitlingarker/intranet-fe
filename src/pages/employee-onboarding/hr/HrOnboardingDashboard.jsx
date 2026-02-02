"use client";

import { useEffect, useState, useMemo } from "react";
import { Users, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { showStatusToast } from "../../../components/toastfy/toast";
import Button from "../../../components/Button/Button";

/* ============================
   JOIN MODAL COMPONENT
============================ */
function JoinModal({
  open,
  onClose,
  onSubmit,
  loading,
  form,
  setForm,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

      <div className="bg-white rounded-xl w-full max-w-md p-6 relative">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-4">
          Send Joining Details
        </h2>

        <div className="space-y-4">

          {/* Joining Date */}
          <div>
            <label className="text-sm font-medium">
              Joining Date *
            </label>
            <input
              type="date"
              value={form.joining_date}
              onChange={(e) =>
                setForm({
                  ...form,
                  joining_date: e.target.value,
                })
              }
              className="w-full mt-1 px-3 py-2 border rounded-lg"
            />
          </div>

          {/* Reporting Time */}
          <div>
            <label className="text-sm font-medium">
              Reporting Time *
            </label>
            <input
              type="time"
              value={form.reporting_time}
              onChange={(e) =>
                setForm({
                  ...form,
                  reporting_time: e.target.value,
                })
              }
              className="w-full mt-1 px-3 py-2 border rounded-lg"
            />
          </div>

          {/* Location */}
          <div>
            <label className="text-sm font-medium">
              Location *
            </label>
            <input
              type="text"
              placeholder="text"
              value={form.location}
              onChange={(e) =>
                setForm({
                  ...form,
                  location: e.target.value,
                })
              }
              className="w-full mt-1 px-3 py-2 border rounded-lg"
            />
          </div>

          {/* Custom Message */}
          <div>
            <label className="text-sm font-medium">
              Additional Content
            </label>
            <textarea
              rows="3"
              placeholder="Optional message..."
              value={form.custom_message}
              onChange={(e) =>
                setForm({
                  ...form,
                  custom_message: e.target.value,
                })
              }
              className="w-full mt-1 px-3 py-2 border rounded-lg"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6">

          <Button
            varient="secondary"
            size="small"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            varient="primary"
            size="small"
            onClick={onSubmit}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Email"}
          </Button>

        </div>
      </div>
    </div>
  );
}

/* ============================
   MAIN COMPONENT
============================ */
export default function HrOnboardingDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const BASE_URL = import.meta.env.VITE_EMPLOYEE_ONBOARDING_URL;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  /* Bulk Join */
  const [bulkJoinMode, setBulkJoinMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  /* Modal */
  const [showModal, setShowModal] = useState(false);
  const [sending, setSending] = useState(false);

  /* Form */
  const [joinForm, setJoinForm] = useState({
    joining_date: "",
    reporting_time: "",
    location: "",
    custom_message: "",
  });

  /* Pagination */
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  /* ============================
     FETCH DATA
  ============================ */
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/offerletters/user_id/details`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setData(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  /* ============================
     FILTER
  ============================ */
  const allowedStatuses = ["Submitted", "Verified", "Rejected"];

  const filteredData = useMemo(() => {
    return data.filter((emp) => {
      const name = `${emp.first_name} ${emp.last_name}`.toLowerCase();

      return (
        name.includes(searchTerm.toLowerCase()) &&
        allowedStatuses.includes(emp.status)
      );
    });
  }, [data, searchTerm]);

  /* ============================
     HELPERS
  ============================ */
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const resetBulk = () => {
    setBulkJoinMode(false);
    setSelectedIds([]);
    setShowModal(false);

    setJoinForm({
      joining_date: "",
      reporting_time: "",
      location: "",
      custom_message: "",
    });
  };

  /* ============================
     SUBMIT JOIN EMAIL
  ============================ */
  const handleSendJoinEmail = async () => {
    const {
      joining_date,
      reporting_time,
      location,
    } = joinForm;

    if (!joining_date || !reporting_time || !location) {
      showStatusToast("❌ Please fill all required fields");
      return;
    }

    try {
      setSending(true);

      // Extract emails
      const emails = filteredData
        .filter((e) => selectedIds.includes(e.user_uuid))
        .map((e) => e.mail)
        .filter(Boolean);

      if (emails.length === 0) {
        showStatusToast("❌ No valid emails found");
        return;
      }

      const payload = {
        user_emails_list: emails,
        joining_date,
        reporting_time,
        location,
        custom_message: joinForm.custom_message,
      };

      await axios.post(
        `${BASE_URL}/hr/offerletters/bulk-join`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      showStatusToast("✅ Joining emails sent successfully");

      resetBulk();

    } catch (err) {
      console.error(err);

      showStatusToast("❌ Failed to send emails");
    } finally {
      setSending(false);
    }
  };

  /* ============================
     PAGINATION
  ============================ */
  const totalPages = Math.ceil(
    filteredData.length / itemsPerPage
  );

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;

    return filteredData.slice(
      start,
      start + itemsPerPage
    );
  }, [filteredData, currentPage]);

  if (loading) {
    return (
      <div className="p-10 text-center">
        Loading HR dashboard...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          HR Onboarding Dashboard
        </h1>
        <p className="text-gray-500">
          Verify employee documents & profiles
        </p>
      </div>

      {/* Stats */}
      
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Submitted Profiles"
          value={filteredData.length}
          icon={Users}
        />
      </div>
      

      {/* Search */}
      <input
        placeholder="Search employee..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1);
        }}
        className="w-full md:w-1/3 px-3 py-2 border rounded-lg"
      />

      {/* Bulk Join Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm flex justify-between">

        <h2 className="font-semibold text-gray-700">
          Recent Offer Letters
        </h2>

        {!bulkJoinMode ? (

          <Button
            varient="primary"
            size="small"
            onClick={() => setBulkJoinMode(true)}
            disabled={
              !filteredData.some(
                (e) =>
                  e.status?.toUpperCase() === "VERIFIED"
              )
            }
          >
            Bulk Join
          </Button>

        ) : (

          <div className="flex gap-3">

            <Button
              varient="primary"
              size="small"
              disabled={selectedIds.length === 0}
              onClick={() => setShowModal(true)}
            >
              Send ({selectedIds.length})
            </Button>

            <Button
              varient="secondary"
              size="small"
              onClick={resetBulk}
            >
              Cancel
            </Button>

          </div>

        )}

      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">

        <table className="w-full">

          <thead className="bg-indigo-900 text-white">
            <tr>

              {bulkJoinMode && <th>Select</th>}

              <th>Name</th>
              <th>Email</th>
              <th>Contact</th>
              <th>Role</th>
              <th>Status</th>
              <th>Action</th>

            </tr>
          </thead>

          <tbody>

            {paginatedData.map((emp) => {

              const isVerified =
                emp.status?.toUpperCase() === "VERIFIED";

              return (

                <tr key={emp.user_uuid}>

                  {bulkJoinMode && (

                    <td className="px-4 py-3 text-center">

                      <input
                        type="checkbox"
                        disabled={!isVerified}
                        checked={selectedIds.includes(emp.user_uuid)}
                        onChange={() =>
                          isVerified &&
                          toggleSelect(emp.user_uuid)
                        }
                        className={`h-4 w-4 ${
                          isVerified
                            ? "cursor-pointer"
                            : "opacity-40 cursor-not-allowed"
                        }`}
                      />

                    </td>

                  )}

                  <td>{emp.first_name} {emp.last_name}</td>
                  <td>{emp.mail}</td>
                  <td>{emp.contact_number || "—"}</td>
                  <td>{emp.designation}</td>

                  <td>
                    <StatusBadge status={emp.status} />
                  </td>

                  <td
                    className="text-indigo-600 cursor-pointer"
                    onClick={() =>
                      navigate(
                        `/employee-onboarding/hr/profile/${emp.user_uuid}`
                      )
                    }
                  >
                    View
                  </td>

                </tr>

              );
            })}

          </tbody>

        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-4">

        <button
          disabled={currentPage === 1}
          onClick={() =>
            setCurrentPage((p) => p - 1)
          }
        >
          &lt;
        </button>

        <span>
          Page {currentPage} / {totalPages || 1}
        </span>

        <button
          disabled={currentPage === totalPages}
          onClick={() =>
            setCurrentPage((p) => p + 1)
          }
        >
          &gt;
        </button>

      </div>

      {/* Modal */}
      <JoinModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSendJoinEmail}
        loading={sending}
        form={joinForm}
        setForm={setJoinForm}
      />

    </div>
  );
}

/* ============================
   SMALL COMPONENTS
============================ */

function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm flex gap-4">

      <Icon className="text-indigo-600" />

      <div>
        <p className="text-sm text-gray-500">
          {title}
        </p>

        <p className="text-xl font-semibold text-gray-900">
          {value}
        </p>
      </div>

    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Submitted: "bg-blue-100 text-blue-700",
    Verified: "bg-green-100 text-green-700",
    Rejected: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`inline-flex items-center justify-center px-3 py-1 
      rounded-full text-xs font-semibold ${
        styles[status] ||
       "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}
