import { NavLink } from "react-router-dom";
import { useApp } from "../../core/useApp";

export default function Sidebar() {
  const { hasPermission, PERMISSIONS } = useApp();

  const linkClass = ({ isActive }) =>
    `d-block px-4 py-3 mb-1 rounded ${
      isActive ? "bg-primary text-white" : "text-dark"
    }`;

  return (
    <div className="sidebar col-md-2 p-0 shadow-sm d-flex flex-column" style={{ height: '100vh', position: 'sticky', top: 0 }}>
      <div className="p-4 border-bottom">
        <h4 className="mb-0">Asset Manager</h4>
        <small className="text-muted">Enterprise Edition</small>
      </div>

      <nav className="p-2 flex-grow-1">
        {hasPermission(PERMISSIONS.VIEW_DASHBOARD) && (
          <NavLink to="/dashboard" className={linkClass}>
            <i className="bi bi-speedometer2 me-2"></i> Dashboard
          </NavLink>
        )}
        {(hasPermission(PERMISSIONS.VIEW_ALL_ASSETS) || hasPermission(PERMISSIONS.VIEW_OWN_ASSETS)) && (
          <NavLink to="/assets" className={linkClass}>
            <i className="bi bi-box-seam me-2"></i> Assets
          </NavLink>
        )}
        {hasPermission(PERMISSIONS.ASSIGN_ASSET) && (
          <NavLink to="/assignments" className={linkClass}>
            <i className="bi bi-people-fill me-2"></i> Assignments
          </NavLink>
        )}
        {(hasPermission(PERMISSIONS.REPORT_ISSUE) || hasPermission(PERMISSIONS.UPDATE_ISSUE_STATUS)) && (
          <NavLink to="/issues" className={linkClass}>
            <i className="bi bi-exclamation-circle me-2"></i> Issues
          </NavLink>
        )}
      </nav>

      <div className="p-3 border-top mt-auto">
        <div className="text-center">
          <small className="text-muted">© 2024 Asset Manager</small>
          <br />
          <small className="text-muted">Version 1.0.0</small>
        </div>
      </div>
    </div>
  );
}
