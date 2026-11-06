
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import "./Register.css";

function Register() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const formData = new FormData(e.currentTarget);
    setError("");
    setIsSubmitting(true);
    try {
      await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: formData.get("fullName"),
          roll_no: formData.get("rollNo"),
          email: formData.get("email"),
          branch: formData.get("branch"),
          semester: formData.get("semester"),
          password,
        }),
      });
      navigate("/", { replace: true, state: { rollNo: formData.get("rollNo") } });
    } catch (registrationError) {
      setError(registrationError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">

      <div className="auth-card">

        <h1>Student Registration</h1>

        <p className="auth-message">
          Create your LabSim account to access virtual laboratory experiments.
        </p>

        <form onSubmit={handleRegister}>

          <div className="form-group">
            <label htmlFor="fullName">
              Full Name
            </label>

            <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Enter full name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="rollNo">
              Roll Number
            </label>

            <input
              id="rollNo"
              name="rollNo"
              type="text"
              placeholder="Enter roll number"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter email"
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="branch">
              Branch
            </label>

            <select
              id="branch"
              name="branch"
              required
            >
              <option value="">
                Select Branch
              </option>

              <option value="Computer Engineering">
                Computer Engineering
              </option>

              <option value="Information Technology">
                Information Technology
              </option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="semester">
              Year / Semester
            </label>

            <select
              id="semester"
              name="semester"
              required
            >
              <option value="">
                Select Semester
              </option>

              <option value="Semester 1">Semester 1</option>
              <option value="Semester 2">Semester 2</option>
              <option value="Semester 3">Semester 3</option>
              <option value="Semester 4">Semester 4</option>
              <option value="Semester 5">Semester 5</option>
              <option value="Semester 6">Semester 6</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              placeholder="Create password"
              minLength="6"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">
              Confirm Password
            </label>

            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm password"
              minLength="6"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              required
            />
          </div>

          <button
            type="submit"
            className="register-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Registering..." : "Register"}
          </button>

          {error && <p className="auth-error" role="alert">{error}</p>}
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?
            <Link to="/">
              Login
            </Link>
          </p>
        </div>

      </div>

    </div>
  );
}

export default Register;