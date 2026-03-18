import { createBrowserRouter, Navigate } from "react-router-dom";

import LoginPage from "../features/auth/LoginPage";
import RegisterPage from "../features/auth/RegisterPage";
import DashboardPage from "../features/dashboard/DashboardPage";
import AssetsPage from "../features/assets/AssetsPage";
import AssignmentsPage from "../features/assignments/AssignmentsPage";
import IssuesPage from "../features/issues/IssuesPage";

import AppLayout from "../shared/layouts/AppLayout";
import RequireAuth from "./RequireAuth";
import { ROLES } from "./constants";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      {
        path: "/dashboard",
        element: (
          <RequireAuth allowedRoles={[ROLES.ADMIN, ROLES.IT_MANAGER, ROLES.EMPLOYEE]}>
            <DashboardPage />
          </RequireAuth>
        ),
      },
      {
        path: "/assets",
        element: (
          <RequireAuth allowedRoles={[ROLES.ADMIN, ROLES.IT_MANAGER, ROLES.EMPLOYEE]}>
            <AssetsPage />
          </RequireAuth>
        ),
      },
      {
        path: "/assignments",
        element: (
          <RequireAuth allowedRoles={[ROLES.ADMIN, ROLES.IT_MANAGER]}>
            <AssignmentsPage />
          </RequireAuth>
        ),
      },
      {
        path: "/issues",
        element: (
          <RequireAuth allowedRoles={[ROLES.ADMIN, ROLES.IT_MANAGER, ROLES.EMPLOYEE]}>
            <IssuesPage />
          </RequireAuth>
        ),
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/assets" replace />,
  },
]);

export default router;