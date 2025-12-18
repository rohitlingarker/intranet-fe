"use client";

import { useEffect, useState, useMemo } from "react";
import { FileText, Send, Users, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button/Button";
import EmpTable from "./components/EmpTable";
import axios from "axios";

export default function EmployeeOnboardingDashboard() {
  const navigate = useNavigate();

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchOffers = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_EMPLOYEE_ONBOARDING_URL}/offerletters/user_id/details`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
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

  const acceptCount = offers.filter(o => o.status === "Accepted").length;
  const sentCount = offers.filter(o => o.status === "Offered").length;
  const draftCount = offers.filter(o => o.status === "Created").length;

  
  // ✅ Filter offers based on search term (case-insensitive)
  const filteredOffers = useMemo(() => {
    return offers.filter(offer => {
      const fullName = `${offer.first_name || ""} ${offer.last_name || ""}`.toLowerCase();
      const Role = `${offer.designation || ""}`.toLowerCase();

      const matchesName = fullName.includes(searchTerm.toLowerCase()) || Role.includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || offer.status === statusFilter;
       
      return matchesName && matchesStatus;


    });
  }, [offers, searchTerm , statusFilter]);


  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Employee Onboarding
          </h1>
          <p className="text-gray-500">
            Manage offer letters and onboarding workflow
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            varient="primary"
            size="medium"
            onClick={() => navigate("/employee-onboarding/create")}
          >
            + Create Offer
          </Button>
          <Button
            onClick={() => navigate("/employee-onboarding/bulk-upload")}
            varient="secondary"
            size="medium"
          >
            Bulk Upload
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Offers" value={offers.length} icon={Users} />
        <StatCard
          title=" Accepted Offers"
          value={acceptCount}
          icon={Clock}
          color="text-orange-600"
        />
        <StatCard
          title="Sent Offers"
          value={sentCount}
          icon={Send}
          color="text-green-600"
        />
         <StatCard
          title="Draft Offers"
          value={draftCount}
          icon={FileText}
          color="text-blue-600"
        />
      </div> 

      {/* search bar  */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Search */}
        <input
          type="text"
          placeholder="Search by candidate name... or Role"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full md:w-1/4 px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="ALL">All Status</option>
          <option value="Accepted">Accepted</option>
          <option value="Offered">Offered</option>
          <option value="Created">Created</option>
        </select>
      </div>
      

      {/* ✅ Reusable Offers Table */}
      <EmpTable 
      key={`${searchTerm}-${statusFilter}`}
      offers={filteredOffers} loading={loading} />
    </div>
  );
}

/* Reusable Stat Card */
function StatCard({ title, value, icon: Icon, color = "text-gray-700" }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
      <Icon className={`h-6 w-6 ${color}`} />
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
