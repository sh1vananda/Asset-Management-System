import { NavLink } from "react-router-dom";

export default function Sidebar() {
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
        <NavLink to="/dashboard" className={linkClass}>
          Dashboard
        </NavLink>
        <NavLink to="/assets" className={linkClass}>
          Assets
        </NavLink>
      </nav>
    </div>
  );
}
