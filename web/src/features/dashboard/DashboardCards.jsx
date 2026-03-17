import { useMemo } from "react";
import { useApp } from "../../core/useApp";

export default function DashboardCards() {
  const { assets = [] } = useApp(); // ✅ GLOBAL STATE

  const stats = useMemo(() => {
    const total = assets.length;

    const assigned = assets.filter(a => a.status === "Assigned").length;
    const available = assets.filter(a => a.status === "Available").length;
    const maintenance = assets.filter(a => a.status === "Maintenance").length;

    return [
      { title: "Total Assets", value: total, className: "card-blue" },
      { title: "Assigned", value: assigned, className: "card-green" },
      { title: "Available", value: available, className: "card-yellow" },
      { title: "Maintenance", value: maintenance, className: "card-red" },
    ];
  }, [assets]);

  return (
    <div className="row">
      {stats.map((card) => (
        <div key={card.title} className="col-md-3 mb-3">
          <div className={`dashboard-card ${card.className}`}>
            <h3>{card.value}</h3>
            <p>{card.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
}