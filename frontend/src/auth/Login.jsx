import { useState } from "react";
import { apiRequest } from "../api/api";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Reset Password State
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1 = Request OTP, 2 = Verify OTP & Reset
  const [resetMobile, setResetMobile] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const token = data.token || data.accessToken || data.jwt;
      if (!token) throw new Error("Login successful but token was not returned");
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(data.user || data.employee || {}));
      onLogin(data);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // FORGOT PASSWORD LOGIC
  // ==============================
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setResetError("");
    setResetSuccess("");
    setResetLoading(true);

    try {
      await apiRequest("/auth/request-otp", {
        method: "POST",
        body: JSON.stringify({ mobileNumber: resetMobile }),
      });
      setResetSuccess("OTP sent to your registered mobile number!");
      setResetStep(2);
    } catch (err) {
      setResetError(err.message || "Failed to send OTP.");
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError("");
    setResetSuccess("");
    setResetLoading(true);

    try {
      await apiRequest("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          mobileNumber: resetMobile,
          otp: resetOtp,
          newPassword: resetNewPassword,
        }),
      });
      setResetSuccess("Password reset successfully! You can now login.");
      setTimeout(() => {
        setShowResetModal(false);
        setResetStep(1);
        setResetMobile("");
        setResetOtp("");
        setResetNewPassword("");
        setResetSuccess("");
      }, 3000);
    } catch (err) {
      setResetError(err.message || "Failed to reset password.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <div className="login-brand">
            <div className="login-logo">W</div>
            <h1>WorkTrac</h1>
            <p className="login-subtitle">Employee / Admin</p>
          </div>
        </div>

        <div className="login-right">
          <div className="login-card">
            <h2>Welcome Back</h2>
            <p className="login-card-sub">Sign in to your account</p>
            <form onSubmit={handleSubmit}>
              <div className="login-form-group">
                <label>Email Address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@worktrac.com" required />
              </div>
              <div className="login-form-group">
                <label>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required />
              </div>
              {error && <div className="login-error">{error}</div>}
              <button type="submit" disabled={loading} className="login-btn">
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
            <div className="login-footer" style={{ marginTop: "15px" }}>
              <button 
                onClick={() => setShowResetModal(true)} 
                style={{ background: "none", border: "none", color: "#2563eb", cursor: "pointer", fontWeight: "600", fontSize: "14px" }}
              >
                Forgot Password?
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==============================
          RESET PASSWORD MODAL
      ============================== */}
      {showResetModal && (
        <div className="employee-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowResetModal(false); }}>
          <div className="employee-modal" style={{ maxWidth: "450px" }} onMouseDown={(e) => e.stopPropagation()}>
            <div className="employee-modal-header">
              <div>
                <h2>Reset Password</h2>
                <p>{resetStep === 1 ? "Enter your registered mobile number" : "Enter the OTP and new password"}</p>
              </div>
              <button className="employee-modal-close" onClick={() => setShowResetModal(false)}>×</button>
            </div>

            <div className="employee-modal" style={{ padding: "0 22px 22px", maxWidth: "450px", boxShadow: "none" }}>
              {resetError && <div className="employee-form-error">{resetError}</div>}
              {resetSuccess && <div className="employee-success-message">{resetSuccess}</div>}

              {resetStep === 1 ? (
                <form onSubmit={handleRequestOtp}>
                  <div className="employee-form-group">
                    <label>Mobile Number</label>
                    <input type="tel" value={resetMobile} onChange={(e) => setResetMobile(e.target.value)} placeholder="+91 9876543210" required />
                  </div>
                  <div className="employee-modal-actions">
                    <button type="button" className="employee-cancel-button" onClick={() => setShowResetModal(false)}>Cancel</button>
                    <button type="submit" className="employee-save-button" disabled={resetLoading}>
                      {resetLoading ? "Sending..." : "Send OTP"}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleResetPassword}>
                  <div className="employee-form-group">
                    <label>OTP</label>
                    <input type="text" value={resetOtp} onChange={(e) => setResetOtp(e.target.value)} placeholder="Enter 6-digit OTP" required />
                  </div>
                  <div className="employee-form-group">
                    <label>New Password</label>
                    <input type="password" value={resetNewPassword} onChange={(e) => setResetNewPassword(e.target.value)} placeholder="Min 6 characters" required />
                  </div>
                  <div className="employee-modal-actions">
                    <button type="button" className="employee-cancel-button" onClick={() => { setResetStep(1); setShowResetModal(false); }}>Cancel</button>
                    <button type="submit" className="employee-save-button" disabled={resetLoading}>
                      {resetLoading ? "Resetting..." : "Reset Password"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;