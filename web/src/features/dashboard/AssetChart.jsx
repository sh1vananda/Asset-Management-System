import { useMemo } from "react";
import { useApp } from "../../core/useApp";

export default function AssetChart() {
  const { assets } = useApp();

  const chartData = useMemo(() => {
    const statusCounts = assets.reduce((acc, asset) => {
      const status = asset.status || "Unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const categoryCounts = assets.reduce((acc, asset) => {
      const category = asset.category || "Uncategorized";
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    return { statusCounts, categoryCounts };
  }, [assets]);

  const statusColors = {
    Available: "#28a745",
    Assigned: "#007bff",
    Maintenance: "#ffc107",
    Retired: "#6c757d",
    Unknown: "#dc3545",
  };

  const categoryColors = [
    "#007bff", "#28a745", "#ffc107", "#dc3545", "#6f42c1",
    "#e83e8c", "#fd7e14", "#20c997", "#6c757d", "#17a2b8"
  ];

  const renderBarChart = (data, title, colors) => {
    const maxValue = Math.max(...Object.values(data));
    const barWidth = 40;
    const barGap = 20;
    const chartHeight = 200;
    const chartWidth = Object.keys(data).length * (barWidth + barGap);

    return (
      <div className="chart-container mb-4">
        <h6 className="text-center mb-3">{title}</h6>
        <svg width={chartWidth} height={chartHeight + 40} className="mx-auto d-block">
          {Object.entries(data).map(([key, value], index) => {
            const barHeight = (value / maxValue) * chartHeight;
            const x = index * (barWidth + barGap);
            const y = chartHeight - barHeight;

            return (
              <g key={key}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={colors[key] || colors[index % colors.length]}
                  rx={4}
                />
                <text
                  x={x + barWidth / 2}
                  y={y - 5}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#333"
                >
                  {value}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 15}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#666"
                  transform={`rotate(45, ${x + barWidth / 2}, ${chartHeight + 15})`}
                >
                  {key.length > 10 ? key.substring(0, 10) + "..." : key}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  const renderPieChart = (data, title, colors) => {
    const total = Object.values(data).reduce((sum, value) => sum + value, 0);
    const radius = 80;
    const centerX = 100;
    const centerY = 100;

    let currentAngle = 0;

    return (
      <div className="chart-container mb-4">
        <h6 className="text-center mb-3">{title}</h6>
        <svg width={200} height={200} className="mx-auto d-block">
          {Object.entries(data).map(([key, value], index) => {
            const percentage = value / total;
            const angle = percentage * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;

            const startAngleRad = (startAngle * Math.PI) / 180;
            const endAngleRad = (endAngle * Math.PI) / 180;

            const x1 = centerX + radius * Math.cos(startAngleRad);
            const y1 = centerY + radius * Math.sin(startAngleRad);
            const x2 = centerX + radius * Math.cos(endAngleRad);
            const y2 = centerY + radius * Math.sin(endAngleRad);

            const largeArcFlag = angle > 180 ? 1 : 0;

            const pathData = [
              `M ${centerX} ${centerY}`,
              `L ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              "Z",
            ].join(" ");

            currentAngle = endAngle;

            const color = colors[key] || colors[index % colors.length];

            return (
              <g key={key}>
                <path d={pathData} fill={color} />
                <text
                  x={centerX + (radius + 20) * Math.cos((startAngle + angle / 2) * Math.PI / 180)}
                  y={centerY + (radius + 20) * Math.sin((startAngle + angle / 2) * Math.PI / 180)}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#333"
                >
                  {key}: {value}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <div className="row">
      <div className="col-md-6">
        {renderBarChart(chartData.statusCounts, "Assets by Status", statusColors)}
      </div>
      <div className="col-md-6">
        {renderPieChart(chartData.categoryCounts, "Assets by Category", categoryColors)}
      </div>
    </div>
  );
}