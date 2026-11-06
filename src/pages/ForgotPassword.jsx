import { useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../services/api";
import "./Login.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");
    try {
      const response = await apiRequest("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setMessage(response.message);
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
        <h2 className="login-heading">Forgot Password</h2>
        <label htmlFor="student-email">Student Email</label>
        <input
          id="student-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Enter your registered student email"
          required
        />
        <p className="recovery-help">
          We’ll send a one-time password reset link if this email belongs to a student account.
        </p>
        <button className="login-btn" type="submit" disabled={submitting}>
          {submitting ? "Sending..." : "Send Reset Link"}
        </button>
        {message && <p className="recovery-success" role="status">{message}</p>}
        {error && <p className="auth-error" role="alert">{error}</p>}
        <p className="recovery-local-note">
          For local development without email setup, check the backend terminal for the reset link.
        </p>
        <Link className="recovery-back-link" to="/">
          Back to Login
        </Link>
      </form>
    </div>
  );
}
