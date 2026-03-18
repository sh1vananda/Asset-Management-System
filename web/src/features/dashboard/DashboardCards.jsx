import { useEffect, useState } from "react";
import api from "../../core/api";

export default function DashboardCards() {
  const [stats, setStats] = useState({
    total: 0,
    assigned: 0,
    available: 0,
    maintenance: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get("/dashboard/stats");

      const data = res.data || {};

      setStats({
        total: data.total_assets || 0,
        assigned: data.assets_by_status?.assigned || 0,
        available: data.assets_by_status?.available || 0,
        maintenance: data.assets_by_status?.under_maintenance || 0,
      });

    } catch (err) {
      console.error("DASHBOARD ERROR:", err.response?.data);

      if (err.response?.status === 403) {
        console.warn("No permission for dashboard");
      }

      setStats({
        total: 0,
        assigned: 0,
        available: 0,
        maintenance: 0,
      });
    }
  };

  const cards = [
    { title: "Total Assets", value: stats.total, className: "card-blue" },
    { title: "Assigned", value: stats.assigned, className: "card-green" },
    { title: "Available", value: stats.available, className: "card-yellow" },
    { title: "Maintenance", value: stats.maintenance, className: "card-red" },
  ];

  return (
    <div className="row">
      {cards.map((card) => (
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