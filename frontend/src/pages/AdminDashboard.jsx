
import { useEffect, useState } from "react";
import { apiRequest } from "../api/api";

function AdminDashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [departmentSummary, setDepartmentSummary] = useState([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    // ==========================================
    // LOAD DASHBOARD
    // ==========================================

    const loadDashboard = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const [data, departmentData] =
                await Promise.all([
                    apiRequest("/admin/dashboard"),
                    apiRequest("/admin/department-summary")
                ]);

            console.log(
                "DASHBOARD:",
                data
            );

            console.log(
                "DEPARTMENT SUMMARY:",
                departmentData
            );

            setDashboard(data);

            setDepartmentSummary(
                departmentData?.departments || []
            );

        } catch (err) {
            console.error(
                "DASHBOARD ERROR:",
                err
            );

            setError(
                err?.message ||
                "Unable to load dashboard."
            );

        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };


    // ==========================================
    // INITIAL LOAD
    // ==========================================

    useEffect(() => {
        loadDashboard();
    }, []);


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <div className="page-loading">
                Loading dashboard...
            </div>
        );
    }


    // ==========================================
    // ERROR
    // ==========================================

    if (error && !dashboard) {
        return (
            <div className="dashboard-error">

                <h2>
                    Unable to load dashboard
                </h2>

                <p>
                    {error}
                </p>

                <button
                    onClick={() =>
                        loadDashboard()
                    }
                >
                    Try Again
                </button>

            </div>
        );
    }


    // ==========================================
    // SAFE DASHBOARD DATA
    // ==========================================

    const employees =
        dashboard?.employees || {};

    const departments =
        dashboard?.departments || {};

    const attendance =
        dashboard?.attendance || {};

    const leaves =
        dashboard?.leaves || {};


    // ==========================================
    // PAGE
    // ==========================================

    return (
        <div className="dashboard">

            {/* =====================================
                HEADER
            ====================================== */}

            <div className="dashboard-header">

                <div>

                    <h1>
                        Admin Dashboard
                    </h1>

                    <p>
                        WorkTrac Employee Attendance
                        Management
                    </p>

                </div>


                <button
                    className="dashboard-refresh-button"
                    onClick={() =>
                        loadDashboard(true)
                    }
                    disabled={refreshing}
                >
                    {refreshing
                        ? "Refreshing..."
                        : "Refresh"}
                </button>

            </div>


            {/* =====================================
                INLINE ERROR
            ====================================== */}

            {error && dashboard && (
                <div className="dashboard-inline-error">
                    {error}
                </div>
            )}


            {/* =====================================
                EMPLOYEES
            ====================================== */}

            <section className="dashboard-section">

                <div className="dashboard-section-header">

                    <div>

                        <h2>
                            Employees
                        </h2>

                        <p>
                            Employee and department
                            overview
                        </p>

                    </div>

                </div>


                <div className="dashboard-grid">

                    <DashboardCard
                        title="Total Employees"
                        value={
                            employees.total ??
                            0
                        }
                    />

                    <DashboardCard
                        title="Active Employees"
                        value={
                            employees.active ??
                            0
                        }
                    />

                    <DashboardCard
                        title="Inactive Employees"
                        value={
                            employees.inactive ??
                            0
                        }
                    />

                    <DashboardCard
                        title="Departments"
                        value={
                            departments.total ??
                            0
                        }
                    />

                </div>

            </section>


            {/* =====================================
                TODAY'S ATTENDANCE
            ====================================== */}

            <section className="dashboard-section">

                <div className="dashboard-section-header">

                    <div>

                        <h2>
                            Today's Attendance
                        </h2>

                        <p>
                            Current attendance
                            overview
                        </p>

                    </div>

                </div>


                <div className="dashboard-grid">

                    <DashboardCard
                        title="Present"
                        value={
                            attendance.present ??
                            0
                        }
                        type="present"
                    />

                    <DashboardCard
                        title="Absent"
                        value={
                            attendance.absent ??
                            0
                        }
                        type="absent"
                    />

                    <DashboardCard
                        title="Attendance Percentage"
                        value={
                            attendance.percentage != null
                                ? `${attendance.percentage}%`
                                : "0%"
                        }
                        type="percentage"
                    />

                    <DashboardCard
                        title="Total Records"
                        value={
                            dashboard?.totalAttendanceRecords ??
                            0
                        }
                        type="records"
                    />

                </div>

            </section>


            {/* =====================================
                LEAVE SUMMARY
            ====================================== */}

            <section className="dashboard-section">

                <div className="dashboard-section-header">

                    <div>

                        <h2>
                            Leave Summary
                        </h2>

                        <p>
                            Current leave status
                        </p>

                    </div>

                </div>


                <div className="dashboard-grid">

                    <DashboardCard
                        title="Pending Leaves"
                        value={
                            leaves.pending ??
                            0
                        }
                        type="pending"
                    />

                    <DashboardCard
                        title="Approved Leaves"
                        value={
                            leaves.approved ??
                            0
                        }
                        type="approved"
                    />

                    <DashboardCard
                        title="Rejected Leaves"
                        value={
                            leaves.rejected ??
                            0
                        }
                        type="rejected"
                    />

                </div>

            </section>

        </div>
    );
}


// ==========================================
// DASHBOARD CARD
// ==========================================

function DashboardCard({
    title,
    value,
    type = ""
}) {
    return (
        <div
            className={`dashboard-card ${type
                    ? `dashboard-card-${type}`
                    : ""
                }`}
        >

            <div className="dashboard-card-content">

                <p className="card-title">
                    {title}
                </p>

                <h3>
                    {value}
                </h3>

            </div>

        </div>
    );
}


export default AdminDashboard;

