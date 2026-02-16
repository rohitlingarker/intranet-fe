import { PieChart, Pie, Cell } from "recharts";

export default function DonutChart({ data, total }) {
  const RADIAN = Math.PI / 180;

  // % label on arc
  const renderPercentLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    if (percent === 0) return null;

    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#fff"
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontSize: 12, fontWeight: 600 }}
      >
        {(percent * 100).toFixed(2)}%
      </text>
    );
  };

  return (
    <PieChart width={240} height={240}>
      <Pie
        data={data}
        dataKey="value"
        cx="50%"
        cy="50%"
        innerRadius={55}     // thicker ring
        outerRadius={110}    // thicker ring
        paddingAngle={2}
        labelLine={false}
        label={renderPercentLabel}
      >
        {data.map((entry, index) => (
          <Cell key={index} fill={entry.color} />
        ))}
      </Pie>

      {/* Center Total */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        style={{
          fontSize: 18,
          fontWeight: "bold",
          fill: "#1f2d3d",
        }}
      >
        {total}
      </text>
    </PieChart>
  );
}
