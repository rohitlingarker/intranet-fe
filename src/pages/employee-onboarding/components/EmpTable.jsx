"use client";

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../../../components/Table/table";
import Pagination from "../../../components/Pagination/pagination";
import Button from "../../../components/Button/Button";
import axios from "axios";
import { showStatusToast } from "../../../components/toastfy/toast";
import { useEffect, useRef } from "react";
import { Mail } from "lucide-react";

const PAGE_SIZE = 5;
function ActionMenu({ onView, onVerify,showVerify  }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={ref}>
      {/* 3 Dots Button */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="px-2 py-1 text-xl font-bold text-gray-600 hover:text-gray-900"
      >
        &#8942;
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-full mr-2 top-0 w-32 bg-white border rounded-md shadow-lg z-50">
          <button
            onClick={() => {
              onView();
              setOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
          >
            View
          </button>
          {showVerify && (
            <button
              onClick={() => {
                onVerify();
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
            >
              Verify
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function OffersTable({ offers = [], loading = false }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [currentPage, setCurrentPage] = useState(1);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkJoinMode, setBulkJoinMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [sending, setSending] = useState(false);

  const totalPages = Math.ceil(offers.length / PAGE_SIZE);

  /* -------------------- Bulk Helpers -------------------- */
  const toggleSelect = (userUuid) => {
    setSelectedIds((prev) =>
      prev.includes(userUuid)
        ? prev.filter((id) => id !== userUuid)
        : [...prev, userUuid]
    );
  };

  const cancelBulk = () => {
    setBulkMode(false);
    setSelectedIds([]);
  };

const cancelBulkJoin = () => {
  setBulkJoinMode(false);
  setSelectedIds([]);
};

  /* -------------------- Bulk Send API -------------------- */
  const handleBulkSend = async () => {
    if (selectedIds.length === 0) return;

    try {
      setSending(true);

      const res = await axios.post(
        `${import.meta.env.VITE_EMPLOYEE_ONBOARDING_URL}/offerletters/bulk-send`,
        {
          user_uuid_list: selectedIds,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      showStatusToast(
        `✅ Bulk Send Complete\n\nSuccessful: ${res.data.successful}\nFailed: ${res.data.failed}`
      );

      cancelBulk();
    } catch (error) {
      console.error("Bulk send failed", error);
      showStatusToast("❌ Bulk send failed");
    } finally {
      setSending(false);
    }
  };


  /* -------------------- Bulk Send API -------------------- */
  const handleBulkJoin = () => {
  if (selectedIds.length === 0) return;

  // 1️⃣ Get selected users
  const selectedUsers = offers.filter((offer) =>
    selectedIds.includes(offer.user_uuid)
  );

  // 2️⃣ Extract emails
  const emailList = selectedUsers
    .map((user) => user.mail)
    .filter(Boolean)
    .join(";");

  if (!emailList) {
    showStatusToast("❌ No valid email addresses found");
    return;
  }

  // 3️⃣ Email content
  const subject = encodeURIComponent("Joining Letter – Welcome Aboard");
  const body = encodeURIComponent(
    `Hello Team,

    Please find your joining details below.

    Joining Date: [DD/MM/YYYY]
    Reporting Time: 9:30 AM
    Location: Office / Remote

    Regards,
    HR Team`
      );
  
  // 4️⃣ Build mailto link
  const mailtoLink = `mailto:${emailList}?subject=${subject}&body=${body}`;
  
  showStatusToast(`Redirecting to email app`, "info");

  // 5️⃣ Open email client
  window.location.href = mailtoLink;

  // Optional cleanup
  cancelBulkJoin();
  };


  /* -------------------- Table Config -------------------- */
  const headers = [
    bulkMode ? "Select" : null,
    bulkJoinMode ? "Select" : null,
    "Candidate Name",
    "Email",
    "Contact",
    "Role",
    "Status",
    "Action",
  ].filter(Boolean);

  const columns = [
    bulkMode ? "select" : null,
    bulkJoinMode ? "select" : null,
    "candidate_name",
    "mail",
    "contact",
    "designation",
    "status",
    "action",
  ].filter(Boolean);


  const rows = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;

    return offers.slice(startIndex, startIndex + PAGE_SIZE).map((offer) => {
      // ✅ Normalize status for comparison
      const isStatusCreated =
        String(offer.status || "").trim().toUpperCase() === "CREATED";

      const isStatusVerified =
        String(offer.status || "").trim().toUpperCase() === "VERIFIED";

      const isSubmitted =
        String(offer.status || "").trim().toUpperCase() === "SUBMITTED";

       // ✅ Enable checkbox based on active bulk mode
    const isCheckboxEnabled =
      (bulkMode && isStatusCreated) ||
      (bulkJoinMode && isStatusVerified);

      // console.log("isCheckboxEnabled:", isCheckboxEnabled);

      return {
        ...((bulkMode || bulkJoinMode) && {
          select: (
            <input
              type="checkbox"
              disabled={!isCheckboxEnabled}
              checked={selectedIds.includes(offer.user_uuid)}
              onChange={() => isCheckboxEnabled && toggleSelect(offer.user_uuid)}
              className={`h-4 w-4 ${
                isCheckboxEnabled
                  ? "cursor-pointer"
                  : "cursor-not-allowed opacity-40"
              }`}
            />
          ),
        }),

        candidate_name:
          `${offer.first_name || ""} ${offer.last_name || ""}`.trim() || "—",
        mail: offer.mail || "—",
        contact: offer.contact_number || "—",
        designation: offer.designation || "—",
        status: offer.status || "—",

      action: (
            <ActionMenu
              onView={() =>
                navigate(`/employee-onboarding/offer/${offer.user_uuid}`)
              }
              onVerify={() =>
                navigate(`/employee-onboarding/hr/profile/${offer.user_uuid}`)
              }
              showVerify={
                isSubmitted}
            />
          ),
      };
    });
  }, [offers, currentPage, bulkMode, bulkJoinMode, selectedIds, navigate]);

  /* -------------------- UI -------------------- */
  return (
    <div className="bg-white rounded-xl shadow-sm relative overflow-visible">
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="font-semibold text-gray-800">Recent Offer Letters</h2>

        {/* 👉 RIGHT SIDE BUTTON GROUP */}
        <div className="flex items-center gap-3">

          {!bulkJoinMode ? (
            <Button
              varient="primary"
              size="small"
              onClick={() => setBulkJoinMode(true)}
              disabled={!offers.some(o => String(o.status || "").trim().toUpperCase() === "VERIFIED")}
            >
              Bulk Join
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button
                varient="primary"
                size="small"
                disabled={selectedIds.length === 0 || sending}
                onClick={handleBulkJoin}
              >
                {sending ? "Sending..." : `Send (${selectedIds.length})`}
              </Button>

              <Button varient="secondary" size="small" onClick={cancelBulkJoin}>
                Cancel
              </Button>
            </div>
          )}

          {!bulkMode ? (
            <Button
              varient="primary"
              size="small"
              onClick={() => setBulkMode(true)}
              disabled={!offers.some(o => String(o.status || "").trim().toUpperCase() === "CREATED")}
            >
              Bulk Offer
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button
                varient="primary"
                size="small"
                disabled={selectedIds.length === 0 || sending}
                onClick={handleBulkSend}
              >
                {sending ? "Sending..." : `Send (${selectedIds.length})`}
              </Button>

              <Button varient="secondary" size="small" onClick={cancelBulk}>
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <Table headers={headers} columns={columns} rows={rows} loading={loading} />

      {/* Pagination */}
      {offers.length > PAGE_SIZE && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevious={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          onNext={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
        />
      )}
    </div>
  );
}
