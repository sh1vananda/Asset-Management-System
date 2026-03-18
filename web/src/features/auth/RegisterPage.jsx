import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";
import { ROLES } from "../../core/constants";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth(); // ✅ FIXED

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(ROLES.EMPLOYEE);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = {};
    if (!username.trim()) nextErrors.username = "Username is required.";
    if (username.trim() && username.trim().length < 3) nextErrors.username = "Username must be at least 3 characters.";

    if (!email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!password.trim()) {
      nextErrors.password = "Password is required.";
    } else if (password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }

    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setError("Please fix the highlighted fields.");
      setSuccess("");
      return;
    }

    const result = await register(username, email, password, role);

    if (!result.success) {
      setError(result.message);
      setSuccess("");
      return;
    }

    setError("");
    setSuccess("Account created successfully. Redirecting...");

    setTimeout(() => {
      navigate("/");
    }, 1000);
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow" style={{ width: "360px" }}>
        <h4 className="text-center mb-4">Register</h4>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          {/* USERNAME */}
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              className={`form-control ${fieldErrors.username ? "is-invalid" : ""}`}
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setFieldErrors((prev) => ({ ...prev, username: "" }));
              }}
              placeholder="Enter username"
            />
            {fieldErrors.username && <div className="invalid-feedback">{fieldErrors.username}</div>}
          </div>

          {/* EMAIL */}
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              className={`form-control ${fieldErrors.email ? "is-invalid" : ""}`}
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setFieldErrors((prev) => ({ ...prev, email: "" }));
              }}
              placeholder="you@example.com"
            />
            {fieldErrors.email && <div className="invalid-feedback">{fieldErrors.email}</div>}
          </div>

          {/* PASSWORD */}
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              className={`form-control ${fieldErrors.password ? "is-invalid" : ""}`}
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setFieldErrors((prev) => ({ ...prev, password: "" }));
              }}
              placeholder="Password"
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

          <button className="btn btn-primary w-100" type="submit">
            Create Account
          </button>
        </form>

        <div className="text-center mt-3">
          <small>
            Already have an account? <Link to="/">Login</Link>
          </small>
        </div>
      </div>
    </div>
  );
}