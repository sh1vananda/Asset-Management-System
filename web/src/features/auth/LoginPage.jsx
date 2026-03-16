import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../../core/useApp";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useApp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const from = (location.state && location.state.from?.pathname) || "/dashboard";

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Please provide both email and password.");
      return;
    }

    const result = login(email, password);
    if (!result.success) {
      setError(result.message);
      return;
    }

    navigate(from, { replace: true });
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow" style={{ width: "360px" }}>
        <h4 className="text-center mb-4">Login</h4>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="username"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              className="form-control"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="current-password"
            />
          </div>

          <button className="btn btn-primary w-100" type="submit">
            Login
          </button>
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

