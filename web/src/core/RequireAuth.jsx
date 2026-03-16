import { Navigate, useLocation } from "react-router-dom";
import { useApp } from "./useApp";

export default function RequireAuth({ children }) {
  const { user } = useApp();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}
