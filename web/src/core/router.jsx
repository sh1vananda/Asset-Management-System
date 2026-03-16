import { createBrowserRouter } from "react-router-dom";

import LoginPage from "../features/auth/LoginPage";
import RegisterPage from "../features/auth/RegisterPage";
import DashboardPage from "../features/dashboard/DashboardPage";
import AssetsPage from "../features/assets/AssetsPage";
import AssignmentsPage from "../features/assignments/AssignmentsPage";
import IssuesPage from "../features/issues/IssuesPage";

import AppLayout from "../shared/layouts/AppLayout";
import RequireAuth from "./RequireAuth";

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
        element: <DashboardPage />,
      },
      {
        path: "/assets",
        element: <AssetsPage />,
      },
      {
        path: "/assignments",
        element: <AssignmentsPage />,
      },
      {
        path: "/issues",
        element: <IssuesPage />,
      },
    ],
  },
]);

export default router;