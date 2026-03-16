import { NavLink } from "react-router-dom";
import { useApp } from "../../core/useApp";

export default function Sidebar() {
  const { hasPermission, PERMISSIONS } = useApp();

  const linkClass = ({ isActive }) =>
    `d-block px-4 py-3 mb-1 rounded ${
      isActive ? "bg-primary text-white" : "text-dark"
    }`;

  return (
    <div className="sidebar col-md-2 p-0 shadow-sm">
      <div className="p-4 border-bottom">
        <h4 className="mb-0">Asset Manager</h4>
        <small className="text-muted">Enterprise Edition</small>
      </div>

      <nav className="p-2">
        {hasPermission(PERMISSIONS.VIEW_DASHBOARD) && (
          <NavLink to="/dashboard" className={linkClass}>
            Dashboard
          </NavLink>
        )}
        {(hasPermission(PERMISSIONS.VIEW_ALL_ASSETS) || hasPermission(PERMISSIONS.VIEW_OWN_ASSETS)) && (
          <NavLink to="/assets" className={linkClass}>
            Assets
          </NavLink>
        )}
        {hasPermission(PERMISSIONS.ASSIGN_ASSET) && (
          <NavLink to="/assignments" className={linkClass}>
            Assignments
          </NavLink>
        )}
        {(hasPermission(PERMISSIONS.REPORT_ISSUE) || hasPermission(PERMISSIONS.UPDATE_ISSUE_STATUS)) && (
          <NavLink to="/issues" className={linkClass}>
            Issues
          </NavLink>
        )}
      </nav>
    </div>
  );
}
