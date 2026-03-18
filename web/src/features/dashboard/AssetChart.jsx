import { useMemo } from "react";
import { useApp } from "../../core/useApp";

export default function AssetChart() {
  const { assets = [] } = useApp(); // ✅ GLOBAL STATE

  const stats = useMemo(() => {
    const total = assets.length;
    const assigned = assets.filter(a => a.status === "Assigned").length;
    const available = assets.filter(a => a.status === "Available").length;
    const maintenance = assets.filter(a => a.status === "Under Maintenance").length;

    return { total, assigned, available, maintenance };
  }, [assets]);

  const percent = (value) =>
    stats.total ? ((value / stats.total) * 100).toFixed(0) : 0;

  return (
    <div className="row">
      <div className="col-md-4">
        <Card title="Utilization" value={`${stats.assigned}/${stats.total}`} percent={percent(stats.assigned)} />
      </div>

      <div className="col-md-4">
        <Card title="Available" value={stats.available} percent={percent(stats.available)} color="green" />
      </div>

      <div className="col-md-4">
        <Card title="Maintenance" value={stats.maintenance} percent={percent(stats.maintenance)} color="red" />
      </div>
    </div>
  );
}

function Card({ title, value, percent, color = "blue" }) {
  return (
    <div className="card shadow-sm p-3">
      <h6>{title}</h6>
      <h3>{value}</h3>

      <div className="progress">
        <div
          className={`progress-bar bg-${color}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}