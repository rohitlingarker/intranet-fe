"use client";

import { useEffect, useState, useMemo } from "react";
import { Users, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { showStatusToast } from "../../../components/toastfy/toast";
import Button from "../../../components/Button/Button";
import Table from "../../../components/Table/table";
import Pagination from "../../../components/Pagination/pagination";
/* ============================
   CONSTANTS
============================ */
const PAGE_SIZE = 5;

/* ============================
   JOIN MODAL
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

          <InputField
            label="Joining Date *"
            type="date"
            value={form.joining_date}
            onChange={(v) =>
              setForm({ ...form, joining_date: v })
            }
          />

          <InputField
            label="Reporting Time *"
            type="time"
            value={form.reporting_time}
            onChange={(v) =>
              setForm({ ...form, reporting_time: v })
            }
          />

          <InputField
            label="Location *"
            type="text"
            value={form.location}
            onChange={(v) =>
              setForm({ ...form, location: v })
            }
          />

          <TextAreaField
            label="Additional Content"
            value={form.custom_message}
            onChange={(v) =>
              setForm({ ...form, custom_message: v })
            }
          />

        </div>

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
/* -------------------- State -------------------- */

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  
  const [bulkJoinMode, setBulkJoinMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [sending, setSending] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const [joinForm, setJoinForm] = useState({
    joining_date: "",
    reporting_time: "",
    location: "",
    custom_message: "",
  });

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
     FILTER (SEARCH + STATUS)
  ============================ */

 const filteredData = useMemo(() => {
  const allowedStatuses = ["SUBMITTED", "VERIFIED", "REJECTED"];

  return data.filter((emp) => {
    const searchText = `${emp.first_name} ${emp.last_name} ${emp.designation}`
      .toLowerCase();

    const matchesSearch = searchText.includes(
      searchTerm.toLowerCase()
    );

    // Normalize status
    const status = (emp.status || "").trim().toUpperCase();
    const filter = statusFilter.trim().toUpperCase();

    let matchesStatus = false;

    if (filter === "ALL") {
      matchesStatus = allowedStatuses.includes(status);
    } else {
      matchesStatus = status === filter;
    }

    return matchesSearch && matchesStatus;
  });
}, [data, searchTerm, statusFilter]);


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
     SEND JOIN MAIL
  ============================ */

  const handleSendJoinEmail = async () => {
    const { joining_date, reporting_time, location } =
      joinForm;

    if (!joining_date || !reporting_time || !location) {
      showStatusToast("❌ Please fill all required fields");
      return;
    }

    try {
      setSending(true);

      const emails = filteredData
        .filter((e) => selectedIds.includes(e.user_uuid))
        .map((e) => e.mail)
        .filter(Boolean);

      if (emails.length === 0) {
        showStatusToast("❌ No valid emails found");
        return;
      }

      await axios.post(
        `${BASE_URL}/hr/offerletters/bulk-join`,
        {
          user_emails_list: emails,
          ...joinForm,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      showStatusToast("✅ Joining emails sent");

      resetBulk();

    } catch (err) {
      console.error(err);
      showStatusToast("❌ Failed to send emails");
    } finally {
      setSending(false);
    }
  };

  /* ============================
     TABLE CONFIG
  ============================ */

  const headers = [
    bulkJoinMode ? "Select" : null,
    "Name",
    "Email",
    "Contact",
    "Role",
    "Status",
    "Action",
  ].filter(Boolean);

  const columns = [
    bulkJoinMode ? "select" : null,
    "name",
    "mail",
    "contact",
    "designation",
    "status",
    "action",
  ].filter(Boolean);

  /* ============================
     ROWS + PAGINATION
  ============================ */

  const totalPages = Math.ceil(
    filteredData.length / PAGE_SIZE
  );

  const rows = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;

    return filteredData
      .slice(startIndex, startIndex + PAGE_SIZE)
      .map((emp) => {
        const isVerified =
          emp.status?.toUpperCase() === "VERIFIED";

        return {
          ...(bulkJoinMode && {
            select: (
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
            ),
          }),

          name: `${emp.first_name} ${emp.last_name}`,

          mail: emp.mail || "—",

          contact: emp.contact_number || "—",

          designation: emp.designation || "—",

          status: emp.status || "—",

          action: (
            <span
              className="text-indigo-600 cursor-pointer"
              onClick={() =>
                navigate(
                  `/employee-onboarding/hr/profile/${emp.user_uuid}`
                )
              }
            >
              View
            </span>
          ),
        };
      });
  }, [
    filteredData,
    currentPage,
    bulkJoinMode,
    selectedIds,
    navigate,
  ]);

  /* ============================
     LOADING
  ============================ */

  if (loading) {
    return (
      <div className="p-10 text-center">
        Loading HR dashboard...
      </div>
    );
  }

  /* ============================
     UI
  ============================ */

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
          title="Total Profiles"
          value={filteredData.length}
          icon={Users}
        />

        <StatCard
          title="Verified"
          value={
            filteredData.filter(
              (e) => e.status?.toUpperCase() === "VERIFIED"
            ).length
          }
          icon={Users}
        />

        <StatCard
          title="Rejected"
          value={
            filteredData.filter(
              (e) => e.status?.toUpperCase() === "REJECTED"
            ).length
          }
          icon={Users}
        />

      </div>

      {/* Search + Filter */}
      <div className="flex flex-col md:flex-row gap-4">

        <input
          placeholder="Search by candidate name... or Role"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full md:w-1/3 px-3 py-2 border rounded-lg"
        />

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
            }}
          className="w-full md:w-48 px-3 py-2 border rounded-lg bg-white"
        >
          <option value="ALL">All Status</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="VERIFIED">Verified</option>
          <option value="REJECTED">Rejected</option>
        </select>

      </div>

      {/* Bulk Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm flex justify-between">

        <h2 className="font-semibold text-gray-700">
          Recent Offer Letters
        </h2>

        {!bulkJoinMode ? (
          <Button
          varient="primary"
          size="small"
          onClick={() => {
            const hasVerified = filteredData.some(
              (e) => e.status?.toUpperCase() === "VERIFIED"
            );

            if (!hasVerified) {
              showStatusToast( "No verified candidates available for bulk join");
              return;
            }

            setBulkJoinMode(true);
          }}
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

      {/* Table + Pagination */}
      <div className="bg-white rounded-xl shadow-sm relative overflow-visible">

        <Table
          headers={headers}
          columns={columns}
          rows={rows}
          loading={loading}
        />

        {filteredData.length > PAGE_SIZE && (

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPrevious={() =>
              setCurrentPage((p) =>
                Math.max(p - 1, 1)
              )
            }
            onNext={() =>
              setCurrentPage((p) =>
                Math.min(p + 1, totalPages)
              )
            }
          />

        )}

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

function InputField({ label, type, value, onChange }) {
  return (
    <div>
      <label className="text-sm font-medium">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 px-3 py-2 border rounded-lg"
      />
    </div>
  );
}

function TextAreaField({ label, value, onChange }) {
  return (
    <div>
      <label className="text-sm font-medium">
        {label}
      </label>

      <textarea
        rows="3"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 px-3 py-2 border rounded-lg"
      />
    </div>
  );
}

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