import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Sector,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from "recharts";

// Color palette
const COLORS = [
  // "#8884d8",
  // "#82ca9d",
  // "#A28BD4",
  // "#F08080",
  "#8dd1e1",
];

// Custom slice highlight on hover
const renderActiveShape = (props) => {
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    value,
  } = props;

  const RADIAN = Math.PI / 180;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 5) * cos;
  const sy = cy + (outerRadius + 5) * sin;
  const mx = cx + (outerRadius + 20) * cos;
  const my = cy + (outerRadius + 20) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 20;
  const ey = my;

  return (
    <g>
      <Sector
        {...{ cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill }}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 4}
        outerRadius={outerRadius + 6}
        fill={fill}
      />
      {/* <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" /> */}
      {/* <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" /> */}
      {/* <text
        x={cx + Math.cos(-RADIAN * midAngle) * (innerRadius + outerRadius - 50)}
        y={cy + Math.sin(-RADIAN * midAngle) * ((innerRadius + outerRadius + 4) / 1.3)}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#333"
        className="text-xs font-semibold"
      >
        {`${payload.name}: ${value}`}
      </text> */}
    </g>
  );
};

const CustomActiveShapePieChart = ({ employeeId }) => {
  const [data, setData] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/api/leave-requests/employee/${employeeId}`
        );
        const leaveRequests = res.data.data;

        const grouped = {};
        leaveRequests.forEach((leave) => {
          if (leave.status !== "APPROVED" && leave.status !== "PENDING") return;
          const name = leave.leaveType?.leaveName || "Unknown";
          grouped[name] =
            (grouped[name] || 0) + parseFloat(leave.daysRequested || 0);
        });

        const chartData = Object.entries(grouped).map(([name, value]) => ({
          name,
          value,
        }));
        setData(chartData);
      } catch (error) {
        console.error("Error fetching leave data:", error);
      }
    };

    fetchLeaves();
  }, [employeeId]);

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow h-42 w-full">
      <h3 className="font-semibold text-gray-800 mb-4">Leave Usage by Type</h3>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height="90%">
          <PieChart>
            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              dataKey="value"
              onMouseEnter={onPieEnter}
            >
              {data.map((entry, index) => {
                let fillColor;
                console.log("Entry:", entry);
                switch (entry.name?.toLowerCase()) {
                  case "earned leave":
                    fillColor = "#8dd1e1";
                    break;
                  case "sick leave":
                    fillColor = "#F08080";
                    break;
                  default:
                    fillColor = COLORS[index % COLORS.length];
                }

                return <Cell key={`cell-${index}`} fill={fillColor} />;
              })}
            </Pie>

            {/* ✅ Tooltip shows leave type and days */}
            <Tooltip
              formatter={(value, name, props) => [`${value} days`, name]}
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #ccc",
                fontSize: "13px",
              }}
            />

            Center label inside pie
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-sm fill-gray-700 font-semibold"
            >
              Leave Usage
            </text>
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-sm text-gray-400">
          No approved leave data to show.
        </p>
      )}
    </div>
  );
};

export default CustomActiveShapePieChart;
