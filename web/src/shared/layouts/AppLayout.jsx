import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div>
      <Sidebar />

      <div style={{ marginLeft: "250px" }}>
        <Navbar />

        <div className="container-fluid p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
