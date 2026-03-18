import { NavLink } from "react-router-dom";
import { useApp } from "../../core/useApp";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  AlertCircle
} from "lucide-react";

export default function Sidebar() {
  const { user } = useApp();

  const role = user?.role?.toLowerCase();

  const isAdmin = role === "admin";
  const isITManager = role === "it_manager";
  const isEmployee = role === "employee";

  const linkClass = ({ isActive }) =>
    `d-flex align-items-center gap-2 px-4 py-3 mb-1 rounded text-decoration-none ${
      isActive ? "bg-primary text-white" : "text-dark"
    }`;

  return (
    <div className="sidebar p-0 shadow-sm d-flex flex-column h-100">
      <div className="p-4 border-bottom">
        <h4>Asset Manager</h4>
        <small className="text-muted">Role: {role}</small>
      </div>

      <nav className="p-2 flex-grow-1">

        {/* ADMIN + IT MANAGER */}
        {(isAdmin || isITManager) && (
          <>
            <NavLink to="/dashboard" className={linkClass}>
              <LayoutDashboard size={18} />
              Dashboard
            </NavLink>

            <NavLink to="/assets" className={linkClass}>
              <Package size={18} />
              Assets
            </NavLink>

            <NavLink to="/assignments" className={linkClass}>
              <ClipboardList size={18} />
              Assignments
            </NavLink>

            <NavLink to="/issues" className={linkClass}>
              <AlertCircle size={18} />
              Issues
            </NavLink>
          </>
        )}

        {/* EMPLOYEE */}
        {isEmployee && (
          <>
            <NavLink to="/issues" className={linkClass}>
              <AlertCircle size={18} />
              My Issues
            </NavLink>
          </>
        )}

      </nav>
    </div>
  );
}