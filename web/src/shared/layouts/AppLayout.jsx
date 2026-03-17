import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <div style={{ width: 250, position: "fixed", top: 0, left: 0, height: "100vh", zIndex: 100, background: "#fff", borderRight: "1px solid #eee" }}>
        <Sidebar />
      </div>
      <div style={{ marginLeft: 250, flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Navbar />
        <div className="container-fluid p-4 flex-grow-1" style={{ overflowY: "auto" }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
