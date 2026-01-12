"use client";

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../../../components/Table/table";
import Pagination from "../../../components/Pagination/pagination";
import Button from "../../../components/Button/Button";
import axios from "axios";
import { showStatusToast } from "../../../components/toastfy/toast";

const PAGE_SIZE = 5;

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

      const isStatusSubmitted =
        String(offer.status || "").trim().toUpperCase() === "SUBMITTED";

       // ✅ Enable checkbox based on active bulk mode
    const isCheckboxEnabled =
      (bulkMode && isStatusCreated) ||
      (bulkJoinMode && isStatusSubmitted);

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
          <button
            className="text-blue-900 underline"
            onClick={() =>
              navigate(`/employee-onboarding/offer/${offer.user_uuid}`)
            }
          >
            View
          </button>
        ),
      };
    });
  }, [offers, currentPage, bulkMode, bulkJoinMode, selectedIds, navigate]);

  /* -------------------- UI -------------------- */
  return (
    <div className="bg-white rounded-xl shadow-sm">
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
              disabled={!offers.some(o => String(o.status || "").trim().toUpperCase() === "SUBMITTED")}
            >
              Send Join
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button
                varient="primary"
                size="small"
                disabled={selectedIds.length === 0 || sending}
                // onClick={handleBulkSend}
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
              Bulk Send
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
