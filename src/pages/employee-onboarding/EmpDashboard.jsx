"use client";

import { useEffect, useState, useMemo } from "react";
import { FileEdit, Send, Users, ShieldCheck, XCircle, FileText, Handshake } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
// import Button from "../../components/Button/Button";
import EmpTable from "./components/EmpTable";
import axios from "axios";
import AdminApprovalDashboard from "./admin/AdminApprovalDashboard";


export default function EmployeeOnboardingDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const roles = user?.roles || [];
  const isAdmin = roles.includes("Admin");
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [viewRole, setViewRole] = useState("HR"); // HR | ADMIN

  const handleKpiClick = (status) => {
    setStatusFilter(status);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchOffers = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_EMPLOYEE_ONBOARDING_URL}/offerletters/user_id/details`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setOffers(res.data || []);
      } catch (error) {
        console.error("Failed to fetch offers", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const acceptCount = offers.filter((o) => o.status === "Accepted").length;
  const sentCount = offers.filter((o) => o.status === "Offered").length;
  const draftCount = offers.filter((o) => o.status === "Created").length;
  const submittedCount = offers.filter((o) => o.status === "Submitted").length;

  // ✅ Filter offers based on search term (case-insensitive)
  const filteredOffers = useMemo(() => {
    return offers.filter((offer) => {
      const fullName =
        `${offer.first_name || ""} ${offer.last_name || ""}`.toLowerCase();
      const Role = `${offer.designation || ""}`.toLowerCase();

      const matchesName =
        fullName.includes(searchTerm.toLowerCase()) ||
        Role.includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "ALL" || offer.status === statusFilter;

      return matchesName && matchesStatus;
    });
  }, [offers, searchTerm, statusFilter]);

  return (
    <div className="p-1 space-y-6">
      {/* Top Tabs - Always Visible */}
      {isAdmin ? (
        <AdminApprovalDashboard />
      ) : (
        <>
          {/* Header */}
          {/* <OnboardingNavBar /> */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Employee Onboarding
              </h1>
              <p className="text-gray-500">
                Manage offer letters and onboarding workflow
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard title="Total Offers" value={offers.length} icon={Users} onClick={() => handleKpiClick("ALL")} />
            <StatCard
              title="Accepted Offers"
              value={acceptCount}
              icon={Handshake}
              color="text-orange-600"
              onClick={() => handleKpiClick("Accepted")}
            />
            <StatCard
              title="Sent Offers"
              value={sentCount}
              icon={Send}
              color="text-green-600"
              onClick={() => handleKpiClick("Offered")}
            />
            <StatCard
              title="Draft Offers"
              value={draftCount}
              icon={FileEdit}
              color="text-blue-600"
              onClick={() => handleKpiClick("Created")}
            />
            <StatCard
              title="Submitted Offers"
              value={submittedCount}
              icon={FileText}
              color="text-purple-600"
              onClick={() => handleKpiClick("Submitted")}
            />
            <StatCard
              title="Verified Offers"
              value={offers.filter((o) => o.status === "Verified").length}
              icon={ShieldCheck}
              color="text-teal-600"
              onClick={() => handleKpiClick("Verified")}
            />
            <StatCard
              title="Rejected Offers"
              value={offers.filter((o) => o.status === "Rejected").length}
              icon={XCircle}
              color="text-red-600"
              onClick={() => handleKpiClick("Rejected")}
            />
          </div>

          {/* Search + Filter */}
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <input
              type="text"
              placeholder="Search by candidate name... or Role"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-1/3 px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-1/4 px-3 py-2 border rounded-lg shadow-sm 
             focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option
                value="ALL"
                className="hover:bg-blue-500 hover:text-white"
              >
                All Status
              </option>
              <option
                value="Accepted"
                className="hover:bg-blue-500 hover:text-white"
              >
                Accepted
              </option>
              <option
                value="Offered"
                className="hover:bg-blue-500 hover:text-white"
              >
                Offered
              </option>
              <option
                value="Created"
                className="hover:bg-blue-500 hover:text-white"
              >
                Created
              </option>
              <option
                value="Rejected"
                className="hover:bg-blue-500 hover:text-white"
              >
                Rejected
              </option>
              <option
                value="Verified"
                className="hover:bg-blue-500 hover:text-white"
              >
                Verified
              </option>
              <option
                value="Submitted"
                className="hover:bg-blue-500 hover:text-white"
              >
                Submitted
              </option>
            </select>
          </div>

          {/* Table */}
          {viewRole === "HR" ? (
            <EmpTable
              key={`${searchTerm}-${statusFilter}`}
              offers={filteredOffers}
              loading={loading}
              stage="HR_VIEW"
            />
          ) : (
            <AdminApprovalView />
          )}
        </>
      )}
    </div>
  );
}

/* Reusable Stat Card */
function StatCard({ title, value, icon: Icon, color = "text-gray-700", onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl p-4 border border-black/20 shadow-sm 
                 flex items-center gap-4 transition-all duration-300 
                 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
    >
      <Icon className={`h-6 w-6 ${color}`} />
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
