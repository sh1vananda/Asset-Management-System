import { Navigate, useLocation } from "react-router-dom";
import { useApp } from "./store";

export default function RequireAuth({ children }) {
  const { user } = useApp();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}
