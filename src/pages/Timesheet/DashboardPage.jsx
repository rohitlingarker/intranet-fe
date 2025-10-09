import React, { use, useMemo } from "react";
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
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchDashboardSummary } from "./api";

// Mock timesheet data
const timesheetData = [
  {
    workDate: "2025-10-01",
    project: "Project A",
    task: "Design",
    hours: 8,
    status: "Approved",
    billable: true,
  },
  {
    workDate: "2025-10-02",
    project: "Project B",
    task: "Develop",
    hours: 10,
    status: "Approved",
    billable: true,
  },
  {
    workDate: "2025-10-03",
    project: "Project C",
    task: "Testing",
    hours: 6,
    status: "Approved",
    billable: false,
  },
  {
    workDate: "2025-10-04",
    project: "Project D",
    task: "Deploy",
    hours: 9,
    status: "Pending",
    billable: true,
  },
  {
    workDate: "2025-10-05",
    project: "Project A",
    task: "Research",
    hours: 7,
    status: "Approved",
    billable: true,
  },
  {
    workDate: "2025-10-06",
    project: "Project C",
    task: "Bugfix",
    hours: 5,
    status: "Pending",
    billable: false,
  },
  {
    workDate: "2025-10-07",
    project: "Project B",
    task: "Planning",
    hours: 5,
    status: "Approved",
    billable: true,
  },
];

// Mock pending actions
const pendingActions = [
  "Submit weekly timesheet",
  "Manager approval for Project A",
  "Update task description",
];

// Card components
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl shadow ${className}`}>{children}</div>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-5 ${className}`}>{children}</div>
);

const COLORS = ["#2563eb", "#f97316"];

// Main component
const DashboardPage = () => {
  const navigate = useNavigate();

  const [dashboardSummary, setDashboardSummary] = useState([]);
  const [hoursPerDay, setHoursPerDay] = useState([]);
  const [productivityTrend, setProductivityTrend] = useState([]);
  const [billableData, setBillableData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // start date : start date of current month
        // end date : end date of current month
        const startDate = new Date();
        startDate.setDate(1);
        const endDate = new Date();
        const response = await fetchDashboardSummary(startDate, endDate);
        console.log(response);

        setDashboardSummary(response);
      } catch (error) {
        console.error("Error fetching dashboard summary:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (dashboardSummary) {
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

      setHoursPerDay(
        dayOrder.map((day) => ({
          day: dayAbbr[day],
          hours: dashboardSummary.weeklySummary?.[day] || 0, // Use 0 as default value if no data for the day is available in
        }))
      );

      setProductivityTrend(
        dayOrder.map((day) => ({
          day: dayAbbr[day],
          productivity:
            dashboardSummary.productivityDetails?.[day]?.productivityScore || 0, // Use 0 as default value if no data for the day is available in
        }))
      );

      setBillableData([
        {
          name: "Billable",
          value: dashboardSummary.billableActivity?.billableLogs || 0,
        },
        {
          name: "Non-Billable",
          value: dashboardSummary.billableActivity?.nonBillableLogs || 0,
        },
      ]);
    }
  }, [dashboardSummary]);

  // KPI Calculations
  const totalHours = timesheetData.reduce((s, e) => s + (e.hours || 0), 0);

  const billableHours = timesheetData
    .filter((t) => t.billable)
    .reduce((s, e) => s + e.hours, 0);

  const billablePercent =
    totalHours > 0 ? ((billableHours / totalHours) * 100).toFixed(0) : 0;

  // Chart Data
  // const billableData = [
  //   { name: "Billable", value: billableHours },
  //   { name: "Non-Billable", value: nonBillableHours },
  // ];

  // const hoursPerDay = useMemo(() => {
  //   const grouped = timesheetData.reduce((acc, entry) => {
  //     const day = new Date(entry.workDate).toLocaleDateString("en-US", {
  //       weekday: "short",
  //     });
  //     if (!acc[day]) acc[day] = 0;
  //     acc[day] += entry.hours;
  //     return acc;
  //   }, {});
  //   const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  //   return days.map((d) => ({
  //     day: d,
  //     hours: grouped[d] || 0,
  //   }));
  // }, []);

  console.log({ hoursPerDay });

  // const productivityTrend = hoursPerDay.map((d) => ({
  //   day: d.day,
  //   productivity: d.hours * 10,
  // }));

  return (
    <div className="p-6 space-y-6 bg-gray-50">
      {/* <div className="flex justify-between mb-2">
        <h1>
          <span className="text-3xl font-bold text-gray-900 mr-4">
            Timesheet Dashboard
          </span>
        </h1>
        <button className="bg-blue-900 hover:bg-blue-900 text-white px-4 py-2 rounded-lg shadow font-semibold">
        View Entries
      </button>
        <Button
          variant="primary"
          size="medium"
          onClick={() => navigate("/timesheets")}
        >
          View Entries
        </Button>
      </div> */}
      <div className="px-6 pt-8 pb-2 bg-gray-50 font-sans text-base">
        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-2">
          <Card>
            <CardContent className="flex flex-col items-center ">
              <div className="text-md text-center font-semibold mb-2">
                Total hours logged
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
                {dashboardSummary?.billablePercentage || 0}%
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center ">
              <div className="text-md text-center font-semibold mb-2">
                Tasks worked
              </div>
              <div className="text-3xl font-black text-emerald-700">
                {dashboardSummary?.totalTasks || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center ">
              <div className="text-md text-center font-semibold mb-2">
                Pending Approval
              </div>
              <div className="text-3xl font-black text-orange-500">
                {dashboardSummary?.timesheetSummary?.pending || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col text-center items-center ">
              <div className="text-md font-semibold mb-2">
                Average Hours per day
              </div>
              <div className="text-3xl font-black text-indigo-600">
                {dashboardSummary?.averageHoursPerDay || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
          <Card>
            <CardContent>
              <h3 className="text-lg font-semibold mb-3">Hours per day</h3>
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
              <h3 className="text-lg font-semibold mb-3">Productivity trend</h3>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={productivityTrend}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} />
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
                Billable vs Non Billable
              </h3>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={billableData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={56}
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
