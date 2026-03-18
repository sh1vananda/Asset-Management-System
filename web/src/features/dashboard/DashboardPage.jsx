import { useEffect, useMemo, useState } from "react";
import { useApp } from "../../core/useApp";
import { normalizeRole, ROLES } from "../../core/constants";
import { useAssets } from "../assets/useAssets";
import { useIssues } from "../issues/useIssues";
import api from "../../core/api";
import Loader from "../../shared/components/Loader";

export default function DashboardPage() {
  const { user } = useApp();
  const role = normalizeRole(user?.role);

  const { assets = [], loading: assetsLoading } = useAssets();
  const { issues = [] } = useIssues();

  const [platformStats, setPlatformStats] = useState(null);
  const [dashboardError, setDashboardError] = useState("");
  const [loadingStats, setLoadingStats] = useState(false);

  const [employeeAssignments, setEmployeeAssignments] = useState([]);
  const [employeeLoading, setEmployeeLoading] = useState(false);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (role !== ROLES.ADMIN && role !== ROLES.IT_MANAGER) {
        setPlatformStats(null);
        return;
      }

      setLoadingStats(true);
      setDashboardError("");

      try {
        const res = await api.get("/dashboard/stats");
        setPlatformStats(res.data || null);
      } catch (err) {
        setDashboardError(err.response?.data?.error || "Unable to load dashboard stats");
      } finally {
        setLoadingStats(false);
      }
    };

    fetchDashboardStats();
  }, [role]);

  useEffect(() => {
    const fetchEmployeeAssignments = async () => {
      if (role !== ROLES.EMPLOYEE || !user?.id) {
        setEmployeeAssignments([]);
        return;
      }

      setEmployeeLoading(true);
      try {
        const res = await api.get(`/assignments/user/${user.id}`);
        setEmployeeAssignments(Array.isArray(res.data) ? res.data : []);
      } catch {
        setEmployeeAssignments([]);
      } finally {
        setEmployeeLoading(false);
      }
    };

    fetchEmployeeAssignments();
  }, [role, user?.id]);

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

  const employeeIssueStats = useMemo(() => {
    const myIssues = issues.filter((issue) => Number(issue.reported_by) === Number(user?.id));

    return {
      total: myIssues.length,
      open: myIssues.filter((issue) => normalizeStatus(issue.status) === "open").length,
      inProgress: myIssues.filter((issue) => normalizeStatus(issue.status) === "in_progress").length,
      resolved: myIssues.filter((issue) => normalizeStatus(issue.status) === "resolved").length,
    };
  }, [issues, user?.id]);

  const employeeAssignmentStats = useMemo(() => {
    return {
      total: employeeAssignments.length,
      active: employeeAssignments.filter((row) => row.status === "assigned").length,
      returned: employeeAssignments.filter((row) => row.status === "returned").length,
    };
  }, [employeeAssignments]);

  const normalizedRoleLabel =
    role === ROLES.ADMIN ? "Admin" :
    role === ROLES.IT_MANAGER ? "IT Manager" :
    "Employee";

  if (assetsLoading || loadingStats || employeeLoading) {
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

      {dashboardError && <div className="alert alert-warning">{dashboardError}</div>}

      {(role === ROLES.ADMIN || role === ROLES.IT_MANAGER) && (
        <>
          <div className="row g-3 mb-4">
            <MetricCard title="Total Assets" value={platformStats?.total_assets ?? assets.length} color="card-blue" />
            <MetricCard title="Assigned Assets" value={platformStats?.assets_by_status?.assigned ?? 0} color="card-green" />
            <MetricCard title="Available Assets" value={platformStats?.assets_by_status?.available ?? 0} color="card-yellow" />
            <MetricCard title="Maintenance" value={platformStats?.assets_by_status?.under_maintenance ?? 0} color="card-red" />
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <div className="card shadow-sm p-3 h-100">
                <h5 className="mb-3">Issue Pipeline</h5>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item d-flex justify-content-between"><span>Open</span><b>{issueStats.open}</b></li>
                  <li className="list-group-item d-flex justify-content-between"><span>In Progress</span><b>{issueStats.in_progress}</b></li>
                  <li className="list-group-item d-flex justify-content-between"><span>Resolved</span><b>{issueStats.resolved}</b></li>
                  <li className="list-group-item d-flex justify-content-between"><span>Closed</span><b>{issueStats.closed}</b></li>
                </ul>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card shadow-sm p-3 h-100">
                <h5 className="mb-3">Asset Availability</h5>
                <div className="mb-2 d-flex justify-content-between">
                  <span>Available</span>
                  <b>{platformStats?.assets_by_status?.available ?? 0}</b>
                </div>
                <div className="progress mb-3">
                  <div
                    className="progress-bar bg-success"
                    style={{
                      width: `${calculatePercent(platformStats?.assets_by_status?.available ?? 0, platformStats?.total_assets ?? 0)}%`,
                    }}
                  />
                </div>

                <div className="mb-2 d-flex justify-content-between">
                  <span>Assigned</span>
                  <b>{platformStats?.assets_by_status?.assigned ?? 0}</b>
                </div>
                <div className="progress mb-3">
                  <div
                    className="progress-bar bg-primary"
                    style={{
                      width: `${calculatePercent(platformStats?.assets_by_status?.assigned ?? 0, platformStats?.total_assets ?? 0)}%`,
                    }}
                  />
                </div>

                <div className="mb-2 d-flex justify-content-between">
                  <span>Maintenance</span>
                  <b>{platformStats?.assets_by_status?.under_maintenance ?? 0}</b>
                </div>
                <div className="progress">
                  <div
                    className="progress-bar bg-warning"
                    style={{
                      width: `${calculatePercent(platformStats?.assets_by_status?.under_maintenance ?? 0, platformStats?.total_assets ?? 0)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {role === ROLES.EMPLOYEE && (
        <>
          <div className="row g-3 mb-4">
            <MetricCard title="Allocated Assets" value={assets.length} color="card-blue" />
            <MetricCard title="Active Assignments" value={employeeAssignmentStats.active} color="card-green" />
            <MetricCard title="My Open Issues" value={employeeIssueStats.open + employeeIssueStats.inProgress} color="card-yellow" />
            <MetricCard title="My Resolved Issues" value={employeeIssueStats.resolved} color="card-red" />
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <div className="card shadow-sm p-3 h-100">
                <h5 className="mb-3">My Assets</h5>
                {assets.length === 0 ? (
                  <div className="text-muted small">No assets currently allocated.</div>
                ) : (
                  <ul className="list-group list-group-flush">
                    {assets.slice(0, 8).map((asset) => (
                      <li key={asset.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <span>{asset.name}</span>
                        <span className="badge text-bg-light">{asset.status}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <div className="card shadow-sm p-3 h-100">
                <h5 className="mb-3">My Assignment History</h5>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item d-flex justify-content-between"><span>Total</span><b>{employeeAssignmentStats.total}</b></li>
                  <li className="list-group-item d-flex justify-content-between"><span>Active</span><b>{employeeAssignmentStats.active}</b></li>
                  <li className="list-group-item d-flex justify-content-between"><span>Returned</span><b>{employeeAssignmentStats.returned}</b></li>
                  <li className="list-group-item d-flex justify-content-between"><span>Reported Issues</span><b>{employeeIssueStats.total}</b></li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
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
  const normalized = (status || "open").toString().trim().toLowerCase().replace(/\s+/g, "_");
  if (["open", "in_progress", "resolved", "closed"].includes(normalized)) {
    return normalized;
  }

  return "open";
}

function calculatePercent(part, whole) {
  if (!whole) return 0;
  return Math.round((part / whole) * 100);
}
