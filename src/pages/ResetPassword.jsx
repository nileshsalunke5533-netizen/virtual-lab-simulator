import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiRequest } from "../services/api";
import "./Login.css";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await apiRequest("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });
      setMessage(response.message);
      setPassword("");
      setConfirmPassword("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <h1>Lab Simulator</h1>
        <p>Student account recovery</p>
        <h2 className="login-heading">Set New Password</h2>
        {!token ? (
          <>
            <p className="auth-error" role="alert">
              This password reset link is missing or invalid.
            </p>
            <Link className="recovery-back-link" to="/forgot-password">
              Request a new reset link
            </Link>
          </>
        ) : (
          <>
            <label htmlFor="new-password">New Password</label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <label htmlFor="confirm-new-password">Confirm New Password</label>
            <input
              id="confirm-new-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
            <p className="recovery-help">Password must contain at least 8 characters.</p>
            <button className="login-btn" type="submit" disabled={submitting}>
              {submitting ? "Updating..." : "Reset Password"}
            </button>
            {message && <p className="recovery-success" role="status">{message}</p>}
            {error && <p className="auth-error" role="alert">{error}</p>}
            {message && (
              <Link className="recovery-back-link" to="/">
                Go to Student Login
              </Link>
            )}
          </>
        )}
      </form>
    </div>
  );
}
