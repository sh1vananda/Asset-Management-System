import { useApp } from "../../core/useApp";
import DashboardCards from "./DashboardCards";
import AssetChart from "./AssetChart";

export default function DashboardPage() {
  const { user } = useApp();

  if (user?.role === "employee") {
    return (
      <div className="p-4">
        <h3>Access Restricted</h3>
        <p>You don’t have permission to view dashboard.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="mb-4">Dashboard</h2>

      <DashboardCards />

      <div className="mt-5">
        <h4 className="mb-4">Analytics</h4>
        <AssetChart />
      </div>
    </div>
  );
}