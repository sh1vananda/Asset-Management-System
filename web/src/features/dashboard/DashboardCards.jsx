import { useMemo } from "react";
import { useApp } from "../../core/store";

export default function DashboardCards() {
  const { assets } = useApp();

  const stats = useMemo(() => {
    const count = assets.length;
    const byStatus = assets.reduce(
      (acc, asset) => {
        const status = asset.status || "Unknown";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {
        Available: 0,
        Assigned: 0,
        Maintenance: 0,
        Retired: 0,
      }
    );

    return [
      { title: "Total Assets", value: count, className: "card-blue" },
      { title: "Assigned", value: byStatus.Assigned, className: "card-green" },
      { title: "Available", value: byStatus.Available, className: "card-yellow" },
      { title: "Maintenance", value: byStatus.Maintenance, className: "card-red" },
    ];
  }, [assets]);

  return (
    <div className="row">
      {stats.map((card) => (
        <div key={card.title} className="col-md-3 mb-3">
          <div className={dashboard-card }>
            <h3>{card.value}</h3>
            <p>{card.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
