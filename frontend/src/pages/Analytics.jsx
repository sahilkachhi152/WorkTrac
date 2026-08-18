import { useEffect, useState } from "react";
import { apiRequest } from "../api/api";

function Analytics() {
    const [overview, setOverview] = useState(null);
    const [leaves, setLeaves] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [topEmployees, setTopEmployees] = useState([]);
    const [lateArrivals, setLateArrivals] = useState([]);
    const [earlyCheckouts, setEarlyCheckouts] = useState([]);
    const [absenceRanking, setAbsenceRanking] = useState([]);
    const [performance, setPerformance] = useState(null);

    const [monthly, setMonthly] = useState(null);
    const [month, setMonth] = useState(
        new Date().toISOString().slice(0, 7)
    );

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ==========================================
    // LOAD ANALYTICS
    // ==========================================

    const loadAnalytics = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                overviewData,
                monthlyData,
                departmentData,
                topEmployeeData,
                lateArrivalData,
                earlyCheckoutData,
                absenceData,
                performanceData
            ] = await Promise.all([
                apiRequest("/admin/analytics"),
                apiRequest(
                    `/admin/analytics/monthly?month=${month}`
                ),
                apiRequest("/admin/analytics/departments"),
                apiRequest(
                    "/admin/analytics/top-employees"
                ),
                apiRequest(
                    "/admin/analytics/late-arrivals"
                ),
                apiRequest(
                    "/admin/analytics/early-checkouts"
                ),
                apiRequest(
                    "/admin/analytics/absence-ranking"
                ),
                apiRequest(
                    "/admin/analytics/performance"
                )
            ]);

            console.log(
                "ANALYTICS OVERVIEW:",
                overviewData
            );

            console.log(
                "ANALYTICS MONTHLY:",
                monthlyData
            );

            console.log(
                "ANALYTICS DEPARTMENTS:",
                departmentData
            );

            console.log(
                "ANALYTICS TOP EMPLOYEES:",
                topEmployeeData
            );

            console.log(
                "ANALYTICS LATE ARRIVALS:",
                lateArrivalData
            );

            console.log(
                "ANALYTICS EARLY CHECKOUTS:",
                earlyCheckoutData
            );

            console.log(
                "ANALYTICS ABSENCE:",
                absenceData
            );

            console.log(
                "ANALYTICS PERFORMANCE:",
                performanceData
            );

            setOverview(
                overviewData.overview || null
            );

            setLeaves(
                overviewData.leaves || null
            );

            setMonthly(
                monthlyData || null
            );

            setDepartments(
                departmentData.departments || []
            );

            setTopEmployees(
                topEmployeeData.employees || []
            );

            setLateArrivals(
                lateArrivalData.lateEmployees || []
            );

            setEarlyCheckouts(
                earlyCheckoutData.earlyCheckout || []
            );

            setAbsenceRanking(
                absenceData.employees || []
            );

            setPerformance(
                performanceData || null
            );

        } catch (err) {
            console.error(
                "ANALYTICS ERROR:",
                err
            );

            setError(
                err.message ||
                "Unable to load analytics"
            );
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // INITIAL LOAD
    // ==========================================

    useEffect(() => {
        loadAnalytics();
    }, []);

    // ==========================================
    // MONTH CHANGE
    // ==========================================

    const handleMonthChange = async (event) => {
        const selectedMonth =
            event.target.value;

        setMonth(selectedMonth);

        try {
            const data = await apiRequest(
                `/admin/analytics/monthly?month=${selectedMonth}`
            );

            console.log(
                "MONTHLY ANALYTICS:",
                data
            );

            setMonthly(data);

        } catch (err) {
            console.error(
                "MONTHLY ANALYTICS ERROR:",
                err
            );

            setError(err.message);
        }
    };

    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <div className="page-loading">
                Loading analytics...
            </div>
        );
    }

    // ==========================================
    // ERROR
    // ==========================================

    if (error) {
        return (
            <div className="dashboard-error">

                <h2>
                    Unable to load analytics
                </h2>

                <p>
                    {error}
                </p>

                <button
                    onClick={loadAnalytics}
                >
                    Try Again
                </button>

            </div>
        );
    }

    // ==========================================
    // PAGE
    // ==========================================

    return (
        <div className="analytics-page">

            {/* =================================
                HEADER
            ================================= */}

            <div className="analytics-header">

                <div>

                    <h1>
                        Analytics
                    </h1>

                    <p>
                        WorkTrac attendance and employee
                        performance analytics
                    </p>

                </div>

                <button
                    className="refresh-button"
                    onClick={loadAnalytics}
                >
                    Refresh
                </button>

            </div>


            {/* =================================
                TODAY OVERVIEW
            ================================= */}

            <h2 className="analytics-section-title">
                Today's Overview
            </h2>

            <div className="analytics-summary-grid">

                <div className="analytics-summary-card">

                    <span>
                        Total Employees
                    </span>

                    <strong>
                        {overview?.totalEmployees ?? 0}
                    </strong>

                </div>


                <div className="analytics-summary-card">

                    <span>
                        Present Today
                    </span>

                    <strong className="analytics-present">
                        {overview?.presentToday ?? 0}
                    </strong>

                </div>


                <div className="analytics-summary-card">

                    <span>
                        Absent Today
                    </span>

                    <strong className="analytics-absent">
                        {overview?.absentToday ?? 0}
                    </strong>

                </div>


                <div className="analytics-summary-card">

                    <span>
                        Attendance Rate
                    </span>

                    <strong>
                        {overview?.attendanceRate ?? 0}%
                    </strong>

                </div>


                <div className="analytics-summary-card">

                    <span>
                        Attendance Records
                    </span>

                    <strong>
                        {overview?.totalAttendanceRecords ?? 0}
                    </strong>

                </div>

            </div>


            {/* =================================
                LEAVE OVERVIEW
            ================================= */}

            <h2 className="analytics-section-title">
                Leave Overview
            </h2>

            <div className="analytics-summary-grid">

                <div className="analytics-summary-card">

                    <span>
                        Pending Leaves
                    </span>

                    <strong className="analytics-pending">
                        {leaves?.pending ?? 0}
                    </strong>

                </div>


                <div className="analytics-summary-card">

                    <span>
                        Approved Leaves
                    </span>

                    <strong className="analytics-approved">
                        {leaves?.approved ?? 0}
                    </strong>

                </div>


                <div className="analytics-summary-card">

                    <span>
                        Rejected Leaves
                    </span>

                    <strong className="analytics-rejected">
                        {leaves?.rejected ?? 0}
                    </strong>

                </div>

            </div>


            {/* =================================
                MONTHLY ATTENDANCE
            ================================= */}

            <div className="analytics-section-header">

                <div>

                    <h2 className="analytics-section-title">
                        Monthly Attendance
                    </h2>

                    <p>
                        Attendance summary for the selected month
                    </p>

                </div>

                <div className="analytics-month-filter">

                    <label>
                        Month
                    </label>

                    <input
                        type="month"
                        value={month}
                        onChange={handleMonthChange}
                    />

                </div>

            </div>


            <div className="analytics-summary-grid">

                <div className="analytics-summary-card">

                    <span>
                        Employees
                    </span>

                    <strong>
                        {monthly?.totalEmployees ?? 0}
                    </strong>

                </div>


                <div className="analytics-summary-card">

                    <span>
                        Present
                    </span>

                    <strong className="analytics-present">
                        {monthly?.present ?? 0}
                    </strong>

                </div>


                <div className="analytics-summary-card">

                    <span>
                        Absent
                    </span>

                    <strong className="analytics-absent">
                        {monthly?.absent ?? 0}
                    </strong>

                </div>


                <div className="analytics-summary-card">

                    <span>
                        Attendance
                    </span>

                    <strong>
                        {monthly?.attendancePercentage ?? 0}%
                    </strong>

                </div>

            </div>


            {/* =================================
                DEPARTMENT ANALYTICS
            ================================= */}

            <div className="analytics-card">

                <div className="analytics-card-header">

                    <div>

                        <h2>
                            Department Attendance
                        </h2>

                        <span>
                            Today's department performance
                        </span>

                    </div>

                </div>


                {departments.length === 0 ? (

                    <div className="empty-state">

                        <h3>
                            No department data
                        </h3>

                        <p>
                            Department attendance data is not available.
                        </p>

                    </div>

                ) : (

                    <div className="table-wrapper">

                        <table className="analytics-table">

                            <thead>

                                <tr>

                                    <th>
                                        Department
                                    </th>

                                    <th>
                                        Employees
                                    </th>

                                    <th>
                                        Present
                                    </th>

                                    <th>
                                        Absent
                                    </th>

                                    <th>
                                        Attendance
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {departments.map(
                                    (department) => (

                                        <tr
                                            key={department.department}
                                        >

                                            <td>
                                                <strong>
                                                    {department.department}
                                                </strong>
                                            </td>

                                            <td>
                                                {department.totalEmployees}
                                            </td>

                                            <td>
                                                {department.present}
                                            </td>

                                            <td>
                                                {department.absent}
                                            </td>

                                            <td>
                                                {department.attendancePercentage}%
                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* =================================
                TOP EMPLOYEES
            ================================= */}

            <div className="analytics-card">

                <div className="analytics-card-header">

                    <div>

                        <h2>
                            Top Attendance Employees
                        </h2>

                        <span>
                            Employees with highest attendance
                        </span>

                    </div>

                </div>


                <div className="table-wrapper">

                    <table className="analytics-table">

                        <thead>

                            <tr>

                                <th>
                                    Employee
                                </th>

                                <th>
                                    Employee Code
                                </th>

                                <th>
                                    Present Days
                                </th>

                                <th>
                                    Attendance
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {topEmployees.map(
                                (employee) => (

                                    <tr
                                        key={employee.employeeCode}
                                    >

                                        <td>
                                            <strong>
                                                {employee.name}
                                            </strong>
                                        </td>

                                        <td>
                                            {employee.employeeCode}
                                        </td>

                                        <td>
                                            {employee.presentDays}
                                        </td>

                                        <td>
                                            {employee.attendancePercentage}%
                                        </td>

                                    </tr>

                                )
                            )}

                        </tbody>

                    </table>

                </div>

            </div>


            {/* =================================
                PERFORMANCE
            ================================= */}

            <div className="analytics-card">

                <div className="analytics-card-header">

                    <div>

                        <h2>
                            Attendance Performance
                        </h2>

                        <span>
                            Performance over {performance?.period || "selected period"}
                        </span>

                    </div>

                </div>


                <div className="analytics-summary-grid performance-summary">

                    <div className="analytics-summary-card">

                        <span>
                            Total Employees
                        </span>

                        <strong>
                            {performance?.summary?.totalEmployees ?? 0}
                        </strong>

                    </div>


                    <div className="analytics-summary-card">

                        <span>
                            Late Arrivals
                        </span>

                        <strong className="analytics-warning">
                            {performance?.summary?.lateArrivals ?? 0}
                        </strong>

                    </div>


                    <div className="analytics-summary-card">

                        <span>
                            Early Checkout
                        </span>

                        <strong className="analytics-warning">
                            {performance?.summary?.earlyCheckout ?? 0}
                        </strong>

                    </div>

                </div>


                <div className="table-wrapper">

                    <table className="analytics-table">

                        <thead>

                            <tr>

                                <th>
                                    Employee
                                </th>

                                <th>
                                    Code
                                </th>

                                <th>
                                    Present Days
                                </th>

                                <th>
                                    Attendance
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {performance?.attendanceRanking?.map(
                                (employee) => (

                                    <tr
                                        key={employee.employeeCode}
                                    >

                                        <td>
                                            <strong>
                                                {employee.name}
                                            </strong>
                                        </td>

                                        <td>
                                            {employee.employeeCode}
                                        </td>

                                        <td>
                                            {employee.presentDays}
                                        </td>

                                        <td>
                                            {employee.attendancePercentage}%
                                        </td>

                                    </tr>

                                )
                            )}

                        </tbody>

                    </table>

                </div>

            </div>


            {/* =================================
                ABSENCE RANKING
            ================================= */}

            <div className="analytics-card">

                <div className="analytics-card-header">

                    <div>

                        <h2>
                            Absence Ranking
                        </h2>

                        <span>
                            Employees with highest absent days
                        </span>

                    </div>

                </div>


                <div className="table-wrapper">

                    <table className="analytics-table">

                        <thead>

                            <tr>

                                <th>
                                    Employee
                                </th>

                                <th>
                                    Code
                                </th>

                                <th>
                                    Absent Days
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {absenceRanking.map(
                                (employee) => (

                                    <tr
                                        key={employee.employeeCode}
                                    >

                                        <td>
                                            <strong>
                                                {employee.name}
                                            </strong>
                                        </td>

                                        <td>
                                            {employee.employeeCode}
                                        </td>

                                        <td className="analytics-absent-cell">
                                            {employee.absentDays}
                                        </td>

                                    </tr>

                                )
                            )}

                        </tbody>

                    </table>

                </div>

            </div>


            {/* =================================
                LATE ARRIVALS
            ================================= */}

            <div className="analytics-card">

                <div className="analytics-card-header">

                    <div>

                        <h2>
                            Late Arrivals
                        </h2>

                        <span>
                            Employees who arrived after 9:00 AM
                        </span>

                    </div>

                </div>


                {lateArrivals.length === 0 ? (

                    <div className="empty-state">

                        <h3>
                            No late arrivals
                        </h3>

                        <p>
                            No late arrivals were recorded.
                        </p>

                    </div>

                ) : (

                    <div className="table-wrapper">

                        <table className="analytics-table">

                            <thead>

                                <tr>

                                    <th>
                                        Employee
                                    </th>

                                    <th>
                                        Code
                                    </th>

                                    <th>
                                        Date
                                    </th>

                                    <th>
                                        Sign In
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {lateArrivals.map(
                                    (employee, index) => (

                                        <tr
                                            key={`${employee.employeeCode}-${employee.date}-${index}`}
                                        >

                                            <td>
                                                <strong>
                                                    {employee.name}
                                                </strong>
                                            </td>

                                            <td>
                                                {employee.employeeCode}
                                            </td>

                                            <td>
                                                {employee.date}
                                            </td>

                                            <td>
                                                {employee.signInTime
                                                    ? new Date(
                                                        employee.signInTime
                                                    ).toLocaleTimeString()
                                                    : "—"}
                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* =================================
                EARLY CHECKOUT
            ================================= */}

            <div className="analytics-card">

                <div className="analytics-card-header">

                    <div>

                        <h2>
                            Early Checkout
                        </h2>

                        <span>
                            Employees who checked out before 6:00 PM
                        </span>

                    </div>

                </div>


                {earlyCheckouts.length === 0 ? (

                    <div className="empty-state">

                        <h3>
                            No early checkouts
                        </h3>

                        <p>
                            No early checkout records were found.
                        </p>

                    </div>

                ) : (

                    <div className="table-wrapper">

                        <table className="analytics-table">

                            <thead>

                                <tr>

                                    <th>
                                        Employee
                                    </th>

                                    <th>
                                        Code
                                    </th>

                                    <th>
                                        Date
                                    </th>

                                    <th>
                                        Sign Out
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {earlyCheckouts.map(
                                    (employee, index) => (

                                        <tr
                                            key={`${employee.employeeCode}-${employee.date}-${index}`}
                                        >

                                            <td>
                                                <strong>
                                                    {employee.name}
                                                </strong>
                                            </td>

                                            <td>
                                                {employee.employeeCode}
                                            </td>

                                            <td>
                                                {employee.date}
                                            </td>

                                            <td>
                                                {employee.signOutTime
                                                    ? new Date(
                                                        employee.signOutTime
                                                    ).toLocaleTimeString()
                                                    : "—"}
                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>
    );
}

export default Analytics;