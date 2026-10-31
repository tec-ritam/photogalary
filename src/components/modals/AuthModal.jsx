import PixVerseLogo from "../common/PixVerseLogo.jsx";

function getPasswordStrength(pwd) {
  if (!pwd) return { score: 0, label: "Enter password", color: "transparent", percent: 0 };
  let score = 0;
  if (pwd.length >= 6) score += 1;
  if (pwd.length >= 8) score += 1;
  if (/[A-Z]/.test(pwd)) score += 1;
  if (/[0-9]/.test(pwd)) score += 1;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

  if (score <= 2) return { score: 1, label: "Weak", color: "#ea4335", percent: 33 };
  if (score <= 3) return { score: 2, label: "Medium", color: "#fbbc04", percent: 66 };
  return { score: 3, label: "Strong", color: "#34a853", percent: 100 };
}

export default function AuthModal({
  isOpen,
  authMode,
  setAuthMode,
  authForm,
  setAuthForm,
  showPassword,
  setShowPassword,
  authLoading,
  authError,
  setAuthError,
  authSuccessMsg,
  onSubmit,
  onClose,
}) {
  if (!isOpen) return null;

  return (
    <div className="gp-modal-backdrop" onClick={onClose}>
      <div className="gp-modal-card gp-auth-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Close Button */}
        <button
          className="gp-modal-close-btn"
          onClick={onClose}
          title="Close"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        {/* Auth Header */}
        <div className="gp-auth-header">
          <PixVerseLogo size={48} />
          <h3>
            {authMode === "login" && "Sign in to PixVerse"}
            {authMode === "register" && "Create your PixVerse Account"}
            {authMode === "forgot" && "Reset your Password"}
          </h3>
          <p>
            {authMode === "login" && "Access your personal photo library & synced memories"}
            {authMode === "register" && "Get started with your private cloud photo universe"}
            {authMode === "forgot" && "Enter your email to set a fresh secure password"}
          </p>
        </div>

        {/* Auth Navigation Tabs */}
        <div className="gp-auth-tabs">
          <button
            type="button"
            className={`gp-auth-tab ${authMode === "login" ? "active" : ""}`}
            onClick={() => {
              setAuthMode("login");
              setAuthError("");
            }}
          >
            <span className="material-symbols-outlined">login</span>
            Sign In
          </button>
          <button
            type="button"
            className={`gp-auth-tab ${authMode === "register" ? "active" : ""}`}
            onClick={() => {
              setAuthMode("register");
              setAuthError("");
            }}
          >
            <span className="material-symbols-outlined">person_add</span>
            Create Account
          </button>
        </div>

        {/* Feedback Alerts */}
        {authError && <div className="gp-auth-error">⚠️ {authError}</div>}
        {authSuccessMsg && <div className="gp-auth-success">✓ {authSuccessMsg}</div>}

        {/* ── MODE: Sign In & Register & Forgot Form ── */}
        <form onSubmit={onSubmit} className="gp-auth-form">
          {/* Full Name (Registration only) */}
          {authMode === "register" && (
            <div className="gp-input-field">
              <label>Full Name</label>
              <div className="gp-field-input-box">
                <span className="material-symbols-outlined gp-field-icon">badge</span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Rivera"
                  value={authForm.name}
                  onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Username or Email */}
          {authMode !== "forgot" && (
            <div className="gp-input-field">
              <label>{authMode === "login" ? "Username or Email" : "Choose Username"}</label>
              <div className="gp-field-input-box">
                <span className="material-symbols-outlined gp-field-icon">person</span>
                <input
                  type="text"
                  required
                  placeholder={authMode === "login" ? "Enter username or email" : "e.g. photography_lover"}
                  value={authForm.username}
                  onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Email (Registration or Forgot) */}
          {(authMode === "register" || authMode === "forgot") && (
            <div className="gp-input-field">
              <label>Email Address</label>
              <div className="gp-field-input-box">
                <span className="material-symbols-outlined gp-field-icon">mail</span>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Password Input with Show/Hide Toggle */}
          <div className="gp-input-field">
            <div className="gp-field-label-row">
              <label>{authMode === "forgot" ? "New Password" : "Password"}</label>
              {authMode === "login" && (
                <button
                  type="button"
                  className="gp-forgot-link"
                  onClick={() => {
                    setAuthMode("forgot");
                    setAuthError("");
                  }}
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="gp-field-input-box">
              <span className="material-symbols-outlined gp-field-icon">lock</span>
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder={authMode === "forgot" ? "At least 6 characters" : "Enter password"}
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
              />
              <button
                type="button"
                className="gp-field-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
              >
                <span className="material-symbols-outlined">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>

            {/* Password Strength Meter (during register or forgot) */}
            {(authMode === "register" || authMode === "forgot") && authForm.password && (
              <div className="gp-strength-container">
                <div className="gp-strength-bar-bg">
                  <div
                    className="gp-strength-bar-fill"
                    style={{
                      width: `${getPasswordStrength(authForm.password).percent}%`,
                      backgroundColor: getPasswordStrength(authForm.password).color,
                    }}
                  />
                </div>
                <div className="gp-strength-meta">
                  <span>
                    Strength: <strong>{getPasswordStrength(authForm.password).label}</strong>
                  </span>
                  <div className="gp-strength-badges">
                    <span className={authForm.password.length >= 6 ? "valid" : ""}>6+ chars</span>
                    <span className={/[0-9]/.test(authForm.password) ? "valid" : ""}>Number</span>
                    <span className={/[A-Z]/.test(authForm.password) ? "valid" : ""}>Uppercase</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password (Registration only) */}
          {authMode === "register" && (
            <div className="gp-input-field">
              <div className="gp-field-label-row">
                <label>Confirm Password</label>
                {authForm.confirmPassword && (
                  <span className={authForm.password === authForm.confirmPassword ? "gp-match-ok" : "gp-match-err"}>
                    {authForm.password === authForm.confirmPassword ? "✓ Passwords match" : "✕ Does not match"}
                  </span>
                )}
              </div>
              <div className="gp-field-input-box">
                <span className="material-symbols-outlined gp-field-icon">check_circle</span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Re-enter password"
                  value={authForm.confirmPassword}
                  onChange={(e) => setAuthForm({ ...authForm, confirmPassword: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Avatar Color Swatches (Registration only) */}
          {authMode === "register" && (
            <div className="gp-input-field">
              <label>Choose Avatar Color</label>
              <div className="gp-color-swatches">
                {["#4285f4", "#ea4335", "#fbbc04", "#34a853", "#7928ca", "#00acc1", "#e91e63", "#ff6d00"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`gp-color-circle ${authForm.avatarColor === c ? "active" : ""}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setAuthForm({ ...authForm, avatarColor: c })}
                    title={`Select color ${c}`}
                  >
                    {authForm.avatarColor === c && <span className="material-symbols-outlined">check</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Remember Me Checkbox */}
          {authMode !== "forgot" && (
            <label className="gp-checkbox-label">
              <input
                type="checkbox"
                checked={authForm.rememberMe}
                onChange={(e) => setAuthForm({ ...authForm, rememberMe: e.target.checked })}
              />
              <span>Remember me on this device</span>
            </label>
          )}

          {/* Submit Row */}
          <div className="gp-auth-actions-row">
            {authMode === "forgot" ? (
              <button
                type="button"
                className="gp-link-btn"
                onClick={() => setAuthMode("login")}
              >
                ← Back to Sign In
              </button>
            ) : (
              <button
                type="button"
                className="gp-link-btn"
                onClick={() => {
                  setAuthMode(authMode === "login" ? "register" : "login");
                  setAuthError("");
                }}
              >
                {authMode === "login" ? "Create an account" : "Already have an account?"}
              </button>
            )}

            <button
              type="submit"
              className="gp-btn-primary gp-auth-submit-btn"
              disabled={authLoading}
            >
              {authLoading ? (
                <>
                  <span className="material-symbols-outlined gp-spin" style={{ fontSize: 18 }}>
                    progress_activity
                  </span>
                  <span>Please wait...</span>
                </>
              ) : (
                <>
                  <span>
                    {authMode === "login"
                      ? "Sign In"
                      : authMode === "register"
                      ? "Create Account"
                      : "Reset Password"}
                  </span>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                    arrow_forward
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
