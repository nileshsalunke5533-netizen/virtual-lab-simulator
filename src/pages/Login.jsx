import { useState } from "react";
import {
  useNavigate,
  useLocation,
  Link
} from "react-router-dom";

import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/auth.js";
import { apiRequest } from "../services/api";
import "./Login.css";

function generateCaptcha() {
  const firstNumber = Math.floor(Math.random() * 10) + 1;
  const secondNumber = Math.floor(Math.random() * 10) + 1;

  return {
    question: `${firstNumber} + ${secondNumber} = ?`,
    answer: firstNumber + secondNumber,
  };
}

function Login() {

  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

  // =========================
  // STUDENT / FACULTY
  // =========================

  const [loginType, setLoginType] = useState(
    location.state?.loginType || "student"
  );

  const [username, setUsername] = useState(location.state?.rollNo || "");
  const [password, setPassword] = useState("");
  const [userCaptcha, setUserCaptcha] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // GENERATE CAPTCHA
  // =========================

  const [captcha, setCaptcha] = useState(generateCaptcha);

  // =========================
  // LOGIN
  // =========================

  const handleLogin = async (e) => {
    e.preventDefault();
    if (
      !username.trim() ||
      !password.trim()
    ) {
      setError("Enter your login ID and password.");
      return;
    }
    if (Number(userCaptcha) !== captcha.answer) {
      setError("Captcha incorrect.");
      setCaptcha(generateCaptcha());
      setUserCaptcha("");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      const path = loginType === "student" ? "/auth/login" : "/auth/faculty/login";
      const credentials = loginType === "student"
        ? { roll_no: username.trim(), password }
        : { email: username.trim(), password };
      const { token } = await apiRequest(path, {
        method: "POST",
        body: JSON.stringify(credentials),
      });
      const user = await signIn(token);
      navigate(user.role === "faculty" ? "/faculty-dashboard" : "/dashboard", {
        replace: true,
      });
    } catch (loginError) {
      setError(loginError.message);
      setPassword("");
      setCaptcha(generateCaptcha());
      setUserCaptcha("");
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================
  // CHANGE LOGIN TYPE
  // =========================

  const handleLoginTypeChange = (type) => {

    setLoginType(type);

    // Clear form

    setUsername("");
    setPassword("");
    setUserCaptcha("");

    // Hide password

    setShowPassword(false);
    setError("");

    // New captcha

    setCaptcha(generateCaptcha());

  };

  return (

    <div className="login-container">

      <form onSubmit={handleLogin}>

        {/* =========================
            HEADER
        ========================= */}

        <h1>
          Lab Simulator
        </h1>

        <p>
          Virtual Laboratory Platform
        </p>

        {/* =========================
            LOGIN TABS
        ========================= */}

        <div className="login-tabs">

          {/* STUDENT TAB */}

          <button
            type="button"
            className={
              loginType === "student"
                ? "login-tab active"
                : "login-tab"
            }
            onClick={() =>
              handleLoginTypeChange("student")
            }
          >

            <span>
              Student
            </span>

            <span>
              Login
            </span>

          </button>


          {/* FACULTY TAB */}

          <button
            type="button"
            className={
              loginType === "faculty"
                ? "login-tab active"
                : "login-tab"
            }
            onClick={() =>
              handleLoginTypeChange("faculty")
            }
          >

            <span>
              Faculty
            </span>

            <span>
              Login
            </span>

          </button>

        </div>

        {/* =========================
            LOGIN TITLE
        ========================= */}

        <h2 className="login-heading">

          {loginType === "student"
            ? "Student Login"
            : "Faculty Login"}

        </h2>

        <label htmlFor="username">
          {loginType === "student" ? "Roll Number" : "Faculty Email"}
        </label>

        <input
          id="username"
          type={loginType === "faculty" ? "email" : "text"}
          autoComplete={loginType === "faculty" ? "email" : "username"}
          placeholder={
            loginType === "student"
              ? "Enter Student Roll Number"
              : "Enter Faculty Email"
          }
          value={username}
          onChange={(e) =>
            setUsername(e.target.value)
          }
          required
        />

        {/* =========================
            PASSWORD
        ========================= */}

        <label htmlFor="password">
          Password
        </label>

        <div className="password-wrapper">

          <input
            id="password"
            type={
              showPassword
                ? "text"
                : "password"
            }
            placeholder="Enter Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
          />

          <button
            type="button"
            className="password-toggle"
            onClick={() =>
              setShowPassword(!showPassword)
            }
          >

            {showPassword ? (
              <EyeOff size={20} />
            ) : (
              <Eye size={20} />
            )}

          </button>

        </div>

        {/* =========================
            CAPTCHA
        ========================= */}

        <label htmlFor="captcha">
          Captcha
        </label>

        <div className="captcha-section">

          <div className="captcha-box">
            {captcha.question}
          </div>

          <button
            type="button"
            onClick={() => {

              setCaptcha(generateCaptcha());
              setUserCaptcha("");

            }}
          >
            Change
          </button>

        </div>

        <input
          id="captcha"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={2}
          placeholder="Enter Captcha"
          value={userCaptcha}
          onChange={(e) =>
            setUserCaptcha(e.target.value.replace(/\D/g, ""))
          }
          required
        />

        {/* =========================
            LOGIN BUTTON
        ========================= */}

        <button
          type="submit"
          className="login-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in..." : "Login"}
        </button>

        {loginType === "student" && (
          <Link className="forgot-password-link" to="/forgot-password">
            Forgot password?
          </Link>
        )}

        {error && <p className="auth-error" role="alert">{error}</p>}

        {/* =========================
            STUDENT REGISTER ONLY
        ========================= */}

        {loginType === "student" && (

          <p className="register-text">

            Don't have an account?{" "}

            <Link to="/register">
              Register as Student
            </Link>

          </p>

        )}

      </form>

    </div>

  );

}

export default Login;