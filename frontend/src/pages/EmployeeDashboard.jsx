import { useEffect, useState } from "react";
import { apiRequest } from "../api/api";

function EmployeeDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadDashboard = async () => {
        try {
            setLoading(true);
            const data = await apiRequest("/employees/dashboard");
            console.log("EMPLOYEE DASHBOARD:", data);
            setStats(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    if (loading) return <div className="page-loading">Loading dashboard...</div>;
    if (error) return <div className="dashboard-error"><p>{error}</p><button onClick={loadDashboard}>Try Again</button></div>;

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    return (
        <div className="employee-dashboard">
            <div className="employee-welcome">
                <h1>Welcome, {user.name || "Employee"}!</h1>
                <p>Here's your attendance summary</p>
            </div>

            <div className="employee-stats-grid">
                <div className="employee-stat-card">
                    <span>Total Attendance</span>
                    <strong>{stats?.attendance?.total || 0}</strong>
                </div>
                <div className="employee-stat-card">
                    <span>Present</span>
                    <strong className="present-number">{stats?.attendance?.present || 0}</strong>
                </div>
                <div className="employee-stat-card">
                    <span>Absent</span>
                    <strong className="absent-number">{stats?.attendance?.absent || 0}</strong>
                </div>
                <div className="employee-stat-card">
                    <span>Attendance %</span>
                    <strong>{stats?.attendance?.percentage || "0%"}</strong>
                </div>
            </div>

            <div className="employee-stats-grid">
                <div className="employee-stat-card">
                    <span>Total Leaves</span>
                    <strong>{stats?.leaves?.total || 0}</strong>
                </div>
                <div className="employee-stat-card">
                    <span>Pending</span>
                    <strong className="pending-number">{stats?.leaves?.pending || 0}</strong>
                </div>
                <div className="employee-stat-card">
                    <span>Approved</span>
                    <strong className="present-number">{stats?.leaves?.approved || 0}</strong>
                </div>
            </div>
        </div>
    );
}

export default EmployeeDashboard;