import { useEffect, useMemo, useState } from "react";
import { useApp } from "../../core/useApp";
import { normalizeRole, ROLES } from "../../core/constants";
import { useAssets } from "../assets/useAssets";
import { useIssues } from "../issues/useIssues";
import api from "../../core/api";
import { extractApiErrorMessage } from "../../core/errors";
import Loader from "../../shared/components/Loader";

export default function DashboardPage() {
  const { user, hasPermission, PERMISSIONS } = useApp();
  const role = normalizeRole(user?.role);

  const { assets = [], loading: assetsLoading } = useAssets();
  const { issues = [] } = useIssues();

  const [platformStats, setPlatformStats] = useState(null);
  const [dashboardError, setDashboardError] = useState("");
  const [loadingStats, setLoadingStats] = useState(false);

  // ✅ BLOCK ACCESS (IMPORTANT)
  if (!hasPermission(PERMISSIONS.VIEW_DASHBOARD)) {
    return (
      <div className="p-4">
        <h4 className="text-danger">Access Denied</h4>
        <p>You are not allowed to view this page.</p>
      </div>
    );
  }

  useEffect(() => {
    const fetchDashboardStats = async () => {
      setLoadingStats(true);
      setDashboardError("");

      try {
        const res = await api.get("/dashboard/stats");
        setPlatformStats(res.data || null);
      } catch (err) {
        setDashboardError(
          extractApiErrorMessage(err, "Unable to load dashboard stats")
        );
      } finally {
        setLoadingStats(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const issueStats = useMemo(() => {
    const counts = {
      total: 0,
      open: 0,
      in_progress: 0,
      resolved: 0,
      closed: 0,
    };

    issues.forEach((issue) => {
      counts.total += 1;
      const normalized = normalizeStatus(issue.status);
      counts[normalized] += 1;
    });

    return counts;
  }, [issues]);

  const normalizedRoleLabel =
    role === ROLES.ADMIN
      ? "Admin"
      : role === ROLES.IT_MANAGER
      ? "IT Manager"
      : "User";

  if (assetsLoading || loadingStats) {
    return <Loader text="Loading dashboard..." />;
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Dashboard</h2>
          <p className="text-muted mb-0">Role: {normalizedRoleLabel}</p>
        </div>
      </div>

      {dashboardError && (
        <div className="alert alert-warning">{dashboardError}</div>
      )}

      {/* ✅ METRICS */}
      <div className="row g-3 mb-4">
        <MetricCard
          title="Total Assets"
          value={platformStats?.total_assets ?? assets.length}
          color="card-blue"
        />
        <MetricCard
          title="Assigned Assets"
          value={platformStats?.assets_by_status?.assigned ?? 0}
          color="card-green"
        />
        <MetricCard
          title="Available Assets"
          value={platformStats?.assets_by_status?.available ?? 0}
          color="card-yellow"
        />
        <MetricCard
          title="Maintenance"
          value={platformStats?.assets_by_status?.under_maintenance ?? 0}
          color="card-red"
        />
      </div>

      {/* ✅ CHART / STATS */}
      <div className="row g-3">
        <div className="col-md-6">
          <div className="card shadow-sm p-3 h-100">
            <h5 className="mb-3">Issue Pipeline</h5>
            <ul className="list-group list-group-flush">
              <li className="list-group-item d-flex justify-content-between">
                <span>Open</span>
                <b>{issueStats.open}</b>
              </li>
              <li className="list-group-item d-flex justify-content-between">
                <span>In Progress</span>
                <b>{issueStats.in_progress}</b>
              </li>
              <li className="list-group-item d-flex justify-content-between">
                <span>Resolved</span>
                <b>{issueStats.resolved}</b>
              </li>
              <li className="list-group-item d-flex justify-content-between">
                <span>Closed</span>
                <b>{issueStats.closed}</b>
              </li>
            </ul>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm p-3 h-100">
            <h5 className="mb-3">Asset Availability</h5>

            {["available", "assigned", "under_maintenance"].map((key) => (
              <div key={key} className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>{key.replace("_", " ")}</span>
                  <b>{platformStats?.assets_by_status?.[key] ?? 0}</b>
                </div>
                <div className="progress">
                  <div
                    className="progress-bar"
                    style={{
                      width: `${calculatePercent(
                        platformStats?.assets_by_status?.[key] ?? 0,
                        platformStats?.total_assets ?? 0
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, color }) {
  return (
    <div className="col-md-3">
      <div className={`dashboard-card ${color} h-100`}>
        <div className="small opacity-75">{title}</div>
        <h3 className="mb-0">{value}</h3>
      </div>
    </div>
  );
}

function normalizeStatus(status) {
  const normalized = (status || "open")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

  if (["open", "in_progress", "resolved", "closed"].includes(normalized)) {
    return normalized;
  }

  return "open";
}

function calculatePercent(part, whole) {
  if (!whole) return 0;
  return Math.round((part / whole) * 100);
}
