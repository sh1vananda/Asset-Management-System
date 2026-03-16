import DashboardCards from "./DashboardCards";
import AssetChart from "./AssetChart";

export default function DashboardPage(){
  return(
    <div>
      <h2 className="mb-4">Dashboard</h2>

      <DashboardCards />

      <div className="mt-5">
        <h4 className="mb-4">Analytics</h4>
        <AssetChart />
      </div>
    </div>
  );
}