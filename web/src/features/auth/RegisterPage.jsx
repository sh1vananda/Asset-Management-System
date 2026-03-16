import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../../core/useApp";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useApp();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("All fields are required.");
      setSuccess("");
      return;
    }

    const result = register(name, email, password);
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
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              autoComplete="name"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
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
              autoComplete="new-password"
            />
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

