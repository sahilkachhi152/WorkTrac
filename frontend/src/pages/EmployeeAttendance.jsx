import { useEffect, useState } from "react";
import { apiRequest } from "../api/api";
import { getISTDate } from "../utils/dateUtils";

function EmployeeAttendance() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [history, setHistory] = useState([]);
    const [todayStatus, setTodayStatus] = useState(null);

    // Stable device fingerprint
    const getDeviceId = () => {
        let deviceId = localStorage.getItem('worktrac_device_id');
        if (!deviceId) {
            const ua = navigator.userAgent;
            const screen = `${window.screen.width}x${window.screen.height}`;
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const salt = Math.random().toString(36).substring(2, 10);
            const raw = `${ua}|${screen}|${tz}|${salt}`;
            // simple base64 encoding
            deviceId = btoa(raw).replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
            localStorage.setItem('worktrac_device_id', deviceId);
        }
        return deviceId;
    };

    // Get location
    const getLocation = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("Geolocation is not supported by your browser"));
            } else {
                navigator.geolocation.getCurrentPosition(
                    (pos) => resolve({
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude
                    }),
                    () => reject(new Error("Unable to get location. Please enable GPS."))
                );
            }
        });
    };

    const loadHistory = async () => {
        try {
            const data = await apiRequest("/attendance/history");
            setHistory(data.attendance || []);
            const today = getISTDate();
            const todayRecord = data.attendance?.find(r => r.date === today);
            if (todayRecord) {
                setTodayStatus(todayRecord.signOutTime ? "completed" : "signed-in");
            } else {
                setTodayStatus("absent");
            }
        } catch (err) {
            console.error("History error:", err);
        }
    };

    useEffect(() => {
        loadHistory();
    }, []);

    const handleSignIn = async () => {
        try {
            setLoading(true);
            setError("");
            setSuccess("");

            const deviceId = getDeviceId();
            const location = await getLocation();

            const data = await apiRequest("/attendance/signin", {
                method: "POST",
                body: {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    deviceId: deviceId
                }
            });

            setSuccess(`✅ Signed in successfully! Distance: ${data.distance}m`);
            loadHistory();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        try {
            setLoading(true);
            setError("");
            setSuccess("");

            const deviceId = getDeviceId();
            const location = await getLocation();

            const data = await apiRequest("/attendance/signout", {
                method: "POST",
                body: {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    deviceId: deviceId
                }
            });

            setSuccess(`✅ Signed out successfully! Working hours: ${data.workingHours}`);
            loadHistory();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="employee-attendance-page">
            <h1>Mark Attendance</h1>
            <p>Sign in and out with GPS verification</p>

            <div className="employee-attendance-card">
                <h2>Today's Attendance</h2>
                {todayStatus === "signed-in" && (
                    <div className="employee-attendance-status employee-status-present">
                        ✅ Currently signed in
                    </div>
                )}
                {todayStatus === "completed" && (
                    <div className="employee-attendance-status employee-status-present">
                        ✅ Attendance completed for today
                    </div>
                )}
                {todayStatus === "absent" && (
                    <div className="employee-attendance-status employee-status-absent">
                        ❌ Not signed in today
                    </div>
                )}

                {error && <div className="employee-form-error">{error}</div>}
                {success && <div className="employee-success-message">{success}</div>}

                {todayStatus === "absent" && (
                    <button
                        className="employee-btn-primary employee-btn-success"
                        onClick={handleSignIn}
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "📍 Sign In"}
                    </button>
                )}

                {todayStatus === "signed-in" && (
                    <button
                        className="employee-btn-primary employee-btn-danger"
                        onClick={handleSignOut}
                        disabled={loading}
                    >
                        {loading ? "Signing out..." : "🚪 Sign Out"}
                    </button>
                )}

                <div className="employee-gps-info">
                    <strong>📍 GPS Required</strong><br />
                    Your location will be verified within the factory geofence.
                </div>
            </div>

            <div className="employee-attendance-card">
                <h2>Recent History</h2>
                {history.length === 0 ? (
                    <p>No attendance records yet.</p>
                ) : (
                    history.slice(0, 5).map((record) => (
                        <div key={record.id} className="employee-leave-card" style={{ padding: "12px 15px", marginBottom: "8px" }}>
                            <strong>{record.date}</strong>
                            <span style={{ float: "right" }}>
                                {record.signInTime ? "✅" : "❌"}
                            </span>
                            <div style={{ fontSize: "12px", color: "#6b7280" }}>
                                {record.signInTime && `In: ${new Date(record.signInTime).toLocaleTimeString()}`}
                                {record.signOutTime && ` | Out: ${new Date(record.signOutTime).toLocaleTimeString()}`}
                                {record.workingHours && ` | 🕒 ${record.workingHours}`}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default EmployeeAttendance;