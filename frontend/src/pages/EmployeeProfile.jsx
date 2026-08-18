import { useEffect, useState } from "react";
import { apiRequest } from "../api/api";

function EmployeeProfile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");
    const [updatingPassword, setUpdatingPassword] = useState(false);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const data = await apiRequest("/employees/profile");
            setProfile(data.employee);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordError("");
        setPasswordSuccess("");

        const { currentPassword, newPassword, confirmPassword } = passwordForm;
        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError("All password fields are required.");
            return;
        }
        if (newPassword.length < 6) {
            setPasswordError("New password must be at least 6 characters.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError("Passwords do not match.");
            return;
        }

        try {
            setUpdatingPassword(true);
            await apiRequest("/employees/change-password", {
                method: "PUT",
                body: { currentPassword, newPassword }
            });
            setPasswordSuccess("Password changed successfully.");
            setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err) {
            setPasswordError(err.message);
        } finally {
            setUpdatingPassword(false);
        }
    };

    if (loading) return <div className="page-loading">Loading profile...</div>;
    if (error) return <div className="dashboard-error"><p>{error}</p><button onClick={loadProfile}>Try Again</button></div>;

    return (
        <div className="employee-profile-page">
            <h1>My Profile</h1>
            <div className="employee-profile-card">
                <div className="employee-profile-avatar">{profile?.name?.charAt(0) || "E"}</div>
                <h2>{profile?.name || "Employee"}</h2>
                <p className="profile-email">{profile?.email || "—"}</p>

                <div className="profile-detail"><span>Employee Code</span><span>{profile?.employeeCode || "—"}</span></div>
                <div className="profile-detail"><span>Department</span><span>{profile?.department || "Not Assigned"}</span></div>
                <div className="profile-detail"><span>Role</span><span>{profile?.role || "Employee"}</span></div>
                <div className="profile-detail"><span>Mobile</span><span>{profile?.mobileNumber || "—"}</span></div>
                <div className="profile-detail"><span>Scheme</span><span>{profile?.scheme || "—"}</span></div>
                <div className="profile-detail"><span>Device ID</span><span style={{ fontFamily: "monospace", fontWeight: "700" }}>{profile?.deviceId || "Not Registered"}</span></div>
                <div className="profile-detail"><span>Status</span><span style={{ color: profile?.status === "active" ? "#16a34a" : "#dc2626" }}>{profile?.status || "—"}</span></div>
            </div>

            {/* Password Change Section */}
            <div className="employee-profile-card" style={{ marginTop: "20px" }}>
                <h2>Change Password</h2>
                {passwordError && <div className="employee-form-error">{passwordError}</div>}
                {passwordSuccess && <div className="employee-success-message">{passwordSuccess}</div>}
                <form onSubmit={handlePasswordChange}>
                    <div className="employee-form-group">
                        <label>Current Password</label>
                        <input
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                            required
                            disabled={updatingPassword}
                        />
                    </div>
                    <div className="employee-form-group">
                        <label>New Password</label>
                        <input
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            required
                            disabled={updatingPassword}
                            minLength="6"
                        />
                    </div>
                    <div className="employee-form-group">
                        <label>Confirm New Password</label>
                        <input
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                            required
                            disabled={updatingPassword}
                        />
                    </div>
                    <button type="submit" className="employee-save-button" disabled={updatingPassword}>
                        {updatingPassword ? "Updating..." : "Update Password"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default EmployeeProfile;