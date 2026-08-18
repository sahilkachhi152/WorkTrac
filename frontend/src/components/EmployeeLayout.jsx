import { useState } from "react";
import { apiRequest } from "../api/api";
import EmployeeDashboard from "../pages/EmployeeDashboard";
import EmployeeAttendance from "../pages/EmployeeAttendance";
import EmployeeLeaves from "../pages/EmployeeLeaves";
import EmployeeProfile from "../pages/EmployeeProfile";

function EmployeeLayout({ onLogout }) {
    const [activePage, setActivePage] = useState("dashboard");

    const menuItems = [
        { id: "dashboard", label: "Dashboard", icon: "🏠" },
        { id: "attendance", label: "Mark Attendance", icon: "✅" },
        { id: "leaves", label: "My Leaves", icon: "📋" },
        { id: "profile", label: "Profile", icon: "👤" },
    ];

    const handleLogout = async () => {
        try {
            await apiRequest('/auth/logout', { method: 'POST' });
        } catch (err) {
            // Ignore
        }
        onLogout();
    };

    return (
        <div className="employee-layout">
            <header className="employee-header">
                <div className="employee-header-left">
                    <span className="employee-logo">WorkTrac</span>
                </div>
                <div className="employee-header-right">
                    <span className="employee-name">
                        {JSON.parse(localStorage.getItem("user") || "{}")?.name || "Employee"}
                    </span>
                    <button className="employee-logout-btn" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </header>

            <main className="employee-content">
                {activePage === "dashboard" && <EmployeeDashboard />}
                {activePage === "attendance" && <EmployeeAttendance />}
                {activePage === "leaves" && <EmployeeLeaves />}
                {activePage === "profile" && <EmployeeProfile />}
            </main>

            <nav className="employee-bottom-nav">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        className={`employee-nav-item ${activePage === item.id ? "active" : ""}`}
                        onClick={() => setActivePage(item.id)}
                    >
                        <span className="employee-nav-icon">{item.icon}</span>
                        <span className="employee-nav-label">{item.label}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
}

export default EmployeeLayout;