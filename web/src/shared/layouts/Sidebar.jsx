import { NavLink } from "react-router-dom";
import { useApp } from "../../core/useApp";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  AlertCircle
} from "lucide-react";

export default function Sidebar() {
  const { hasPermission, PERMISSIONS } = useApp();

  const linkClass = ({ isActive }) =>
    `d-flex align-items-center gap-2 px-4 py-3 mb-1 rounded text-decoration-none ${
      isActive ? "bg-primary text-white" : "text-dark"
    }`;

  return (
    <div
      className="sidebar p-0 shadow-sm d-flex flex-column h-100"
      style={{ minHeight: "100vh", background: "#fff" }}
    >
      {/* Header */}
      <div className="p-4 border-bottom">
        <h4 className="mb-0">Asset Manager</h4>
        <small className="text-muted">Enterprise Edition</small>
      </div>

      {/* Navigation */}
      <nav className="p-2 flex-grow-1">

        {hasPermission(PERMISSIONS.VIEW_DASHBOARD) && (
          <NavLink to="/dashboard" className={linkClass}>
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>
        )}

        {(hasPermission(PERMISSIONS.VIEW_ALL_ASSETS) ||
          hasPermission(PERMISSIONS.VIEW_OWN_ASSETS)) && (
          <NavLink to="/assets" className={linkClass}>
            <Package size={18} />
            Assets
          </NavLink>
        )}

        {hasPermission(PERMISSIONS.ASSIGN_ASSET) && (
          <NavLink to="/assignments" className={linkClass}>
            <ClipboardList size={18} />
            Assignments
          </NavLink>
        )}

        {(hasPermission(PERMISSIONS.REPORT_ISSUE) ||
          hasPermission(PERMISSIONS.UPDATE_ISSUE_STATUS)) && (
          <NavLink to="/issues" className={linkClass}>
            <AlertCircle size={18} />
            Issues
          </NavLink>
        )}

      </nav>
    </div>
  );
}