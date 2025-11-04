import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  BarChart,
  Bar,
  Cell,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import Button from "../../components/Button/Button";
import { useNavigate } from "react-router-dom";
import { fetchDashboardSummary } from "./api";
import TimesheetHeader from "./TimesheetHeader";

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl shadow ${className}`}>{children}</div>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-5 ${className}`}>{children}</div>
);

const COLORS = ["#2563eb", "#f97316"];

const DashboardPage = () => {
  // const navigate = useNavigate();

  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [hoursPerDay, setHoursPerDay] = useState([]);
  const [productivityTrend, setProductivityTrend] = useState([]);
  const [billableData, setBillableData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchDashboardSummary();
        if (response) setDashboardSummary(response);
      } catch (error) {
        console.error("Error fetching dashboard summary:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!dashboardSummary) return;

    const dayOrder = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];

    const dayAbbr = {
      monday: "Mon",
      tuesday: "Tue",
      wednesday: "Wed",
      thursday: "Thu",
      friday: "Fri",
      saturday: "Sat",
      sunday: "Sun",
    };

    // Prepare chart data
    setHoursPerDay(
      dayOrder.map((day) => ({
        day: dayAbbr[day],
        hours: dashboardSummary.weeklySummary?.[day] || 0,
      }))
    );

    setProductivityTrend(
      dayOrder.map((day) => ({
        day: dayAbbr[day],
        productivity:
          dashboardSummary.productivityDetails?.[day]?.productivityScore || 0,
      }))
    );

    setBillableData([
      {
        name: "Billable Tasks",
        value: dashboardSummary.billableActivity?.billableTasks || 0,
      },
      {
        name: "Non-Billable Tasks",
        value: dashboardSummary.billableActivity?.nonBillableTasks || 0,
      },
    ]);
  }, [dashboardSummary]);

  return (
    <div className="p-6 space-y-6 bg-gray-50">
      <TimesheetHeader />
      <div className="px-6 pt-8 pb-2 bg-gray-50 font-sans text-base">
        {/* KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-2">
          <Card>
            <CardContent className="flex flex-col items-center ">
              <div className="text-md text-center font-semibold mb-2">
                Total Hours Logged
              </div>
              <div className="text-3xl font-black text-blue-700">
                {dashboardSummary?.totalHours || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col items-center ">
              <div className="text-md text-center font-semibold mb-2">
                Billable %
              </div>
              <div className="text-3xl font-black text-green-600">
                {dashboardSummary?.billableActivity?.billablePercentage || 0}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col items-center ">
              <div className="text-md text-center font-semibold mb-2">
                Unsubmitted Weeks
              </div>
              <div className="text-3xl font-black text-emerald-700">
                {dashboardSummary?.weeklyTimesheetReview?.notSubmittedWeeks ||
                  0}
              </div>
            </CardContent>
          </Card>

          {/* ✅ Replaced Pending Approval → Pending Weeks */}
          <Card>
            <CardContent className="flex flex-col items-center ">
              <div className="text-md text-center font-semibold mb-2">
                Pending Weeks
              </div>
              <div className="text-3xl font-black text-orange-500">
                {dashboardSummary?.weeklyTimesheetReview?.submittedWeeks || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col text-center items-center ">
              <div className="text-md font-semibold mb-2">
                Average Hours per Day
              </div>
              <div className="text-3xl font-black text-indigo-600">
                {dashboardSummary?.averageHoursPerDay || "00:00"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
          <Card>
            <CardContent>
              <h3 className="text-lg font-semibold mb-3">Hours per Day</h3>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={hoursPerDay}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip formatter={(v) => [`${v} hrs`, "Hours"]} />
                  <Bar
                    dataKey="hours"
                    fill="#6366f1"
                    barSize={28}
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h3 className="text-lg font-semibold mb-3">Productivity Trend</h3>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={productivityTrend}>
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    interval={0} // show every tick (Mon..Sun)
                    padding={{ left: 12, right: 12 }} // avoid clipping first/last tick
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis hide />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="productivity"
                    stroke="#16a34a"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h3 className="text-lg font-semibold mb-3">
                Billable vs Non-Billable Tasks
              </h3>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={billableData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={50}
                    label
                  >
                    {billableData.map((entry, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
