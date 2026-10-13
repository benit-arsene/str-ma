import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Loader2,
  Lock,
  LogIn,
  User,
} from "lucide-react";

import { adminLogin } from "../../api/admin";
import { useAdminAuth } from "../../context/useAdminAuth";
import "./AdminLogin.css";

function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAdminAuth();

  const [formState, setFormState] = useState({ username: "", password: "" });
  const [validationErrors, setValidationErrors] = useState({});
  const [submitState, setSubmitState] = useState("idle");
  const [apiError, setApiError] = useState(null);

  const redirectTo = location.state?.from || "/admin";
  const sessionNotice = location.state?.reason || null;

  const validateForm = () => {
    const errors = {};
    if (!formState.username.trim()) {
      errors.username = "Username is required";
    }
    if (!formState.password) {
      errors.password = "Password is required";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    setSubmitState("submitting");
    setApiError(null);

    try {
      const data = await adminLogin(formState.username.trim(), formState.password);
      signIn(data.admin);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setApiError(err.message || "Login failed. Please try again.");
      setSubmitState("error");
    }
  };

  return (
    <main className="admin-login-page">
      <div className="admin-login-container">
        <div className="admin-login-brand">
          <span className="admin-brand-mark">HP</span>
          <div className="admin-brand-text">
            <span className="admin-brand-name">Holiday Planners</span>
            <span className="admin-brand-sub">Administration</span>
          </div>
        </div>

        <div className="admin-login-card">
          <header className="admin-login-header">
            <h2>Sign in</h2>
            <p>Enter your administrator credentials to continue.</p>
          </header>

          {sessionNotice && (
            <div className="admin-login-notice" role="status">
              <AlertCircle size={18} />
              <p>{sessionNotice}</p>
            </div>
          )}

          {submitState === "error" && apiError && (
            <div className="admin-login-error" role="alert">
              <AlertCircle size={18} />
              <p>{apiError}</p>
            </div>
          )}

          <form className="admin-login-form" onSubmit={handleSubmit} noValidate>
            <div className="admin-login-field">
              <label htmlFor="admin-username">
                Username <span className="required">*</span>
              </label>
              <div className="admin-login-input-wrapper">
                <User className="admin-login-input-icon" aria-hidden="true" />
                <input
                  id="admin-username"
                  type="text"
                  value={formState.username}
                  onChange={(event) =>
                    handleChange("username", event.target.value)
                  }
                  autoComplete="username"
                  placeholder="Administrator username"
                  required
                  disabled={submitState === "submitting"}
                />
              </div>
              {validationErrors.username && (
                <span className="field-error">{validationErrors.username}</span>
              )}
            </div>

            <div className="admin-login-field">
              <label htmlFor="admin-password">
                Password <span className="required">*</span>
              </label>
              <div className="admin-login-input-wrapper">
                <Lock className="admin-login-input-icon" aria-hidden="true" />
                <input
                  id="admin-password"
                  type="password"
                  value={formState.password}
                  onChange={(event) =>
                    handleChange("password", event.target.value)
                  }
                  autoComplete="current-password"
                  placeholder="Password"
                  required
                  disabled={submitState === "submitting"}
                />
              </div>
              {validationErrors.password && (
                <span className="field-error">{validationErrors.password}</span>
              )}
            </div>

            <button
              type="submit"
              className="admin-login-submit"
              disabled={submitState === "submitting"}
            >
              {submitState === "submitting" ? (
                <>
                  <Loader2 size={18} className="spinner" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Sign in
                </>
              )}
            </button>
          </form>
        </div>

        <Link to="/" className="admin-login-back">
          &larr; Back to public site
        </Link>
      </div>
    </main>
  );
}

export default AdminLogin;
