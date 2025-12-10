"use client";

import { useEffect, useState } from "react";
import { FileText, Send, Users, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

// import axios from "axios";

export default function EmployeeOnboardingDashboard() {
  const navigate = useNavigate();

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchOffers = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_ONBOARDING_BASE_URL}/offerletters/`,
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

  const pendingCount = offers.filter(o => o.status === "PENDING").length;
  const sentCount = offers.filter(o => o.status === "SENT").length;

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
          <button
            onClick={() => navigate("/employee-onboarding/create")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
          >
            + Create Offer
          </button>
          <button
            onClick={() => navigate("/employee-onboarding/bulk-upload")}
            className="border border-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-100"
          >
            Bulk Upload
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Offers"
          value={offers.length}
          icon={Users}
        />
        <StatCard
          title="Pending Offers"
          value={pendingCount}
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
          title="Drafts"
          value={offers.filter(o => o.status === "DRAFT").length}
          icon={FileText}
          color="text-blue-600"
        />
      </div>

      {/* Offers Table */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-gray-800">
            Recent Offer Letters
          </h2>
        </div>

        {loading ? (
          <p className="p-4 text-gray-500">Loading offers...</p>
        ) : offers.length === 0 ? (
          <p className="p-4 text-gray-500">No offer letters found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-3 text-left">Candidate</th>
                <th>Status</th>
                <th>Role</th>
                <th>Date</th>
                <th className="text-right p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {offers.slice(0, 5).map((offer) => (
                <tr key={offer.user_uuid} className="border-t">
                  <td className="p-3">
                    {offer.candidate_name || "—"}
                  </td>
                  <td>{offer.status}</td>
                  <td>{offer.designation || "—"}</td>
                  <td>
                    {offer.created_at
                      ? new Date(offer.created_at).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="text-right p-3">
                    <button
                      onClick={() =>
                        navigate(
                          `/employee-onboarding/offer/${offer.user_uuid}`
                        )
                      }
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* Reusable card */
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
