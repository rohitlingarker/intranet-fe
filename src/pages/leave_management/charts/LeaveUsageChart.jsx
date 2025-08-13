import {
  PieChart,
  Pie,
  Sector,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from "recharts";
import { useState } from "react";

// Color palette: Red for Used, Gray for Remaining
const COLORS = ["#ef4444", "#e5e7eb"];

// Custom Active Shape Slice
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
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={outerRadius + 4}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

export default function LeaveUsageChart({ leave }) {
  const { accruedLeaves, usedLeaves, leaveType } = leave;
  const [activeIndex, setActiveIndex] = useState(null);
  console.log("leave in leave car", leave)

  const isUnpaid = leaveType?.leaveName === "UNPAID_LEAVE";

  const remaining = Math.max(accruedLeaves - usedLeaves, 0);

  const chartData = isUnpaid
  ? [{ name: "Used", value: usedLeaves }]
  : [
      { name: "Used", value: usedLeaves },
      { name: "Remaining", value: remaining },
    ];


  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };
 
  const onPieLeave = () => {
    setActiveIndex(null);
  };

  return (
    <div className="w-full h-[250px] sm:h-[220px]">
      <div className="relative w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              dataKey="value"
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              onMouseOverCapture={onPieEnter}
              onMouseOutCapture={onPieLeave}
              isAnimationActive={true}
            >
              {chartData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [`${value} Days`, name]}
              contentStyle={{
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                backgroundColor: "#fff",
                border: "1px solid #ccc",
                fontSize: "13px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-base font-bold text-gray-800">
            {isUnpaid ? "∞ Days" : `${remaining} Days`}
          </span>
          <span className="text-xs text-gray-500">Available</span>
        </div>
      </div>
    </div>
  );
}

