import { useState } from "react";
import { apiRequest } from "../api/api";

import AdminDashboard from "../pages/AdminDashboard";
import Employees from "../pages/Employees";
import DailyAttendance from "../pages/DailyAttendance";
import MonthlyAttendance from "../pages/MonthlyAttendance";
import Leaves from "../pages/Leaves";
import Reports from "../pages/Reports";
import Analytics from "../pages/Analytics";
import AttendanceRegister from "../pages/AttendanceRegister";
import DepartmentSummary from "../pages/DepartmentSummary";
import DepartmentManagement from "../pages/DepartmentManagement";

function AdminLayout({ onLogout }) {
    const [activePage, setActivePage] = useState("dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const menuItems = [
        { id: "dashboard", label: "Dashboard", icon: "▣" },
        { id: "attendance-register", label: "Attendance Register", icon: "📝" },
        { id: "daily-attendance", label: "Daily Attendance", icon: "✓" },
        { id: "employees", label: "Employees", icon: "👥" },
        { id: "department-summary", label: "Department Summary", icon: "🏢" },
        { id: "monthly-attendance", label: "Monthly Attendance", icon: "📅" },
        { id: "leaves", label: "Leave Management", icon: "📋" },
        { id: "reports", label: "Reports", icon: "📊" },
        { id: "analytics", label: "Analytics", icon: "📈" },
        { id: "department-management", label: "Department Management", icon: "⚙️" },
    ];

    const handleMenuClick = (page) => setActivePage(page);

    const handleLogout = async () => {
        try {
            await apiRequest('/auth/logout', { method: 'POST' });
        } catch (err) {
            // Ignore errors, still logout locally
        }
        onLogout();
    };

    return (
        <div className="admin-layout">
            <aside className={`admin-sidebar ${sidebarOpen ? "open" : "closed"}`}>
                <div className="sidebar-logo">
                    <div className="sidebar-brand-wrapper">
                        <div className="logo-icon">W</div>
                        {sidebarOpen && (
                            <div className="sidebar-brand">
                                <h2>WorkTrac</h2>
                                <span>Admin Panel</span>
                            </div>
                        )}
                    </div>
                    <button
                        className="sidebar-toggle-inside"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        title={sidebarOpen ? "Collapse sidebar" : "Open sidebar"}
                        aria-label={sidebarOpen ? "Collapse sidebar" : "Open sidebar"}
                    >
                        ☰
                    </button>
                </div>

                <nav className="sidebar-menu">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            className={`sidebar-item ${activePage === item.id ? "active" : ""}`}
                            onClick={() => handleMenuClick(item.id)}
                        >
                            <span className="sidebar-icon">{item.icon}</span>
                            {sidebarOpen && <span>{item.label}</span>}
                        </button>
                    ))}
                </nav>

                <div className="sidebar-bottom">
                    <button className="sidebar-logout" onClick={handleLogout}>
                        <span className="sidebar-icon">⇥</span>
                        {sidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            <main className={`admin-main ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
                <header className="admin-topbar">
                    <div className="topbar-title">
                        <h1>
                            {activePage === "dashboard" ? (
                                JSON.parse(localStorage.getItem("user") || "{}")?.role === "superior"
                                    ? "Superior Dashboard"
                                    : "Admin Dashboard"
                            ) : (
                                menuItems.find((item) => item.id === activePage)?.label
                            )}
                        </h1>
                    </div>
                    <div className="admin-user">
                        <div className="admin-avatar">
                            {JSON.parse(localStorage.getItem("user") || "{}")?.name?.charAt(0) || "A"}
                        </div>
                        <div>
                            <strong>
                                {JSON.parse(localStorage.getItem("user") || "{}")?.name || "Admin"}
                            </strong>
                            <small>
                                {JSON.parse(localStorage.getItem("user") || "{}")?.role || "Administrator"}
                            </small>
                        </div>
                    </div>
                </header>

                <div className="admin-content">
                    {activePage === "dashboard" && <AdminDashboard />}
                    {activePage === "employees" && <Employees />}
                    {activePage === "department-summary" && <DepartmentSummary />}
                    {activePage === "daily-attendance" && <DailyAttendance />}
                    {activePage === "monthly-attendance" && <MonthlyAttendance />}
                    {activePage === "attendance-register" && <AttendanceRegister />}
                    {activePage === "leaves" && <Leaves />}
                    {activePage === "reports" && <Reports />}
                    {activePage === "analytics" && <Analytics />}
                    {activePage === "department-management" && <DepartmentManagement />}
                </div>
            </main>
        </div>
    );
}

export default AdminLayout;