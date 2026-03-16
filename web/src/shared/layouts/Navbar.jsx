import { useNavigate } from "react-router-dom";
import { useApp } from "../../core/useApp";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useApp();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="d-flex justify-content-between align-items-center p-3 bg-white border-bottom">
      <div>
        <h5 className="mb-0">Enterprise Asset Management</h5>
        {user && (
          <small className="text-muted">
            Signed in as {user.name} ({user.role})
          </small>
        )}
      </div>

      <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}
