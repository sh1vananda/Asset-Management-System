import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";
import { ROLES, normalizeRole } from "../../core/constants";
import { useApp } from "../../core/useApp";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, logout } = useAuth();
  const { user } = useApp();

  const [username, setUsername] = useState(""); // FIXED
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(ROLES.EMPLOYEE);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    const normalizedRole = normalizeRole(user?.role);
    if (!normalizedRole) return;

    navigate("/dashboard", { replace: true });
  }, [user?.role, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nextErrors = {};
    if (!username.trim()) nextErrors.username = "Username is required.";
    if (!password.trim()) nextErrors.password = "Password is required.";
    if (password && password.length < 6) nextErrors.password = "Password must be at least 6 characters.";

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const result = await login(username, password);

    if (!result.success) {
      setError(result.message);
      return;
    }

    if (normalizeRole(result.role) !== normalizeRole(role)) {
      logout();
      setError("Selected role does not match this account.");
      return;
    }

    navigate("/dashboard");
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow" style={{ width: "360px" }}>
        <h4 className="text-center mb-4">Login</h4>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              className={`form-control ${fieldErrors.username ? "is-invalid" : ""}`}
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setFieldErrors((prev) => ({ ...prev, username: "" }));
              }}
            />
            {fieldErrors.username && <div className="invalid-feedback">{fieldErrors.username}</div>}
          </div>

          <div className="mb-3">
            <label>Password</label>
            <input
              type="password"
              className={`form-control ${fieldErrors.password ? "is-invalid" : ""}`}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setFieldErrors((prev) => ({ ...prev, password: "" }));
              }}
            />
            {fieldErrors.password && <div className="invalid-feedback">{fieldErrors.password}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label">Role</label>
            <select
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value={ROLES.ADMIN}>Admin</option>
              <option value={ROLES.IT_MANAGER}>IT Manager</option>
              <option value={ROLES.EMPLOYEE}>Employee</option>
            </select>
          </div>

          <button className="btn btn-primary w-100">Login</button>
        </form>

        <div className="text-center mt-3">
          <small>
            Don't have an account? <Link to="/register">Register</Link>
          </small>
        </div>
      </div>
    </div>
  );
}