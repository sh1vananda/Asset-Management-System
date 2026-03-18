import { Navigate, useLocation } from "react-router-dom";
import { useApp } from "./useApp";
import { normalizeRole, ROLES } from "./constants";
import Loader from "../shared/components/Loader";

const fallbackByRole = {
  [ROLES.ADMIN]: "/dashboard",
  [ROLES.IT_MANAGER]: "/assets",
  [ROLES.EMPLOYEE]: "/assets",
};

export default function RequireAuth({ children, allowedRoles = [] }) {
  const { user, authReady } = useApp();
  const location = useLocation();

  if (!authReady) {
    return <Loader text="Restoring session..." className="min-vh-100" />;
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  const role = normalizeRole(user.role);
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to={fallbackByRole[role] || "/assets"} replace />;
  }

  return children;
}
