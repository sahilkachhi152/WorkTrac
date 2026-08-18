import { useEffect, useMemo, useState } from "react";
import API_BASE_URL, { apiRequest } from "../api/api";
import { getISTMonth } from "../utils/dateUtils";

function Reports() {
    const [employees, setEmployees] = useState([]);
    const [employeeId, setEmployeeId] = useState("all");
    const [month, setMonth] = useState(getISTMonth());
    const [report, setReport] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingReport, setLoadingReport] = useState(false);
    const [error, setError] = useState("");

    const loadEmployees = async () => {
        try {
            setLoading(true);
            setError("");
            const data = await apiRequest("/admin/employees?limit=1000");
            const employeeList = data.employees || data.data || data || [];
            setEmployees(Array.isArray(employeeList) ? employeeList : []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEmployees();
    }, []);

    const loadReport = async () => {
        try {
            setLoadingReport(true);
            setError("");
            if (employeeId === "all") {
                const data = await apiRequest(`/admin/reports/attendance?type=monthly&month=${month}`);
                setReport(Array.isArray(data?.employees) ? data.employees : []);
                return;
            }
            const data = await apiRequest(`/admin/attendance/monthly/${employeeId}?month=${month}`);
            // The response has an 'attendance' array for single employee
            if (data && data.attendance) {
                setReport(data.attendance);
            } else {
                setReport([]);
            }
        } catch (err) {
            setError(err?.message || "Unable to load report.");
            setReport([]);
        } finally {
            setLoadingReport(false);
        }
    };

    useEffect(() => {
        loadReport();
    }, [employeeId, month]);

    const summary = useMemo(() => {
        const totalEmployees = report.length;
        const totalDays = report.reduce((sum, r) => sum + Number(r.daysCounted || 0), 0);
        const presentDays = report.reduce((sum, r) => sum + Number(r.presentDays || 0), 0);
        const absentDays = report.reduce((sum, r) => sum + Number(r.absentDays || 0), 0);
        const percentage = totalDays === 0 ? "0.00" : ((presentDays / totalDays) * 100).toFixed(2);
        return { totalEmployees, totalDays, presentDays, absentDays, percentage };
    }, [report]);

    const selectedEmployee = employees.find(emp => String(emp.id) === String(employeeId));

    const exportBackendFile = async (type) => {
        try {
            if (report.length === 0) {
                alert("There is no report data to export.");
                return;
            }
            const token = localStorage.getItem("token");
            if (!token) {
                alert("Authentication required. Please login again.");
                return;
            }
            const endpoint = type === "excel"
                ? `/admin/reports/attendance/export/excel?type=monthly&month=${month}`
                : `/admin/reports/attendance/export/pdf?type=monthly&month=${month}`;
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) {
                let message = "Export failed.";
                try {
                    const data = await response.json();
                    message = data?.message || message;
                } catch {}
                throw new Error(message);
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = type === "excel" ? `worktrac-report-${month}.xlsx` : `worktrac-report-${month}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert(err.message || `Unable to export ${type.toUpperCase()} report.`);
        }
    };

    const exportCSV = () => {
        if (report.length === 0) {
            alert("There is no report data to export.");
            return;
        }
        const headers = ["Date", "Status", "Sign In", "Sign Out", "Working Hours", "Device ID", "Sign In Location", "Sign Out Location"];
        const rows = report.map((record) => {
            const signInLocation = record.signInLatitude != null && record.signInLongitude != null ? `${record.signInLatitude}, ${record.signInLongitude}` : "";
            const signOutLocation = record.signOutLatitude != null && record.signOutLongitude != null ? `${record.signOutLatitude}, ${record.signOutLongitude}` : "";
            return [
                record.date || "",
                record.status || "",
                record.signIn || "",
                record.signOut || "",
                record.workingHours || "",
                record.deviceId || "",
                signInLocation,
                signOutLocation
            ];
        });
        const csv = [headers, ...rows].map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `worktrac-report-${month}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    if (loading) return <div className="page-loading">Loading reports...</div>;
    if (error && employees.length === 0) return <div className="dashboard-error"><h2>Unable to load reports</h2><p>{error}</p><button onClick={loadEmployees}>Try Again</button></div>;

    return (
        <div className="reports-page">
            <div className="reports-header">
                <div><h1>Reports</h1><p>View and export employee attendance reports</p></div>
                <button className="refresh-button" onClick={loadReport}>Refresh</button>
            </div>

            <div className="reports-filter-card">
                <div className="reports-filter-group">
                    <label>Employee</label>
                    <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
                        <option value="all">All Employees</option>
                        {employees.map((emp) => (
                            <option key={emp.id} value={emp.id}>{emp.employeeCode} - {emp.name}</option>
                        ))}
                    </select>
                </div>
                <div className="reports-filter-group">
                    <label>Month</label>
                    <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
                </div>
                <div className="report-export-buttons">
                    <button className="report-export-button" onClick={exportCSV} disabled={report.length === 0}>Export CSV</button>
                    <button className="report-export-button" onClick={() => exportBackendFile("excel")} disabled={report.length === 0}>Export Excel</button>
                    <button className="report-export-button" onClick={() => exportBackendFile("pdf")} disabled={report.length === 0}>Export PDF</button>
                </div>
            </div>

            {error && <div className="report-inline-error">{error}</div>}

            {selectedEmployee && (
                <div className="report-employee-card">
                    <div className="report-employee-avatar">{selectedEmployee.name?.charAt(0)?.toUpperCase() || "E"}</div>
                    <div>
                        <h2>{selectedEmployee.name}</h2>
                        <p>{selectedEmployee.employeeCode || "—"} • {selectedEmployee.department?.name || selectedEmployee.Department?.name || "Not Assigned"}</p>
                        <span>{selectedEmployee.email || "—"}</span>
                    </div>
                </div>
            )}

            {employeeId !== "all" && (
                <div className="report-summary">
                    <div className="report-summary-card"><span>Employees</span><strong>{summary.totalEmployees}</strong></div>
                    <div className="report-summary-card"><span>Present Days</span><strong className="present-number">{summary.presentDays}</strong></div>
                    <div className="report-summary-card"><span>Absent Days</span><strong className="absent-number">{summary.absentDays}</strong></div>
                    <div className="report-summary-card"><span>Attendance</span><strong>{summary.percentage}%</strong></div>
                </div>
            )}

            <div className="reports-card">
                <div className="reports-card-header">
                    <div><h2>Attendance Report</h2><span>{month}</span></div>
                </div>

                {loadingReport ? (
                    <div className="page-loading report-loading">Loading report...</div>
                ) : report.length === 0 ? (
                    <div className="empty-state"><h3>No attendance records</h3><p>No attendance data is available for the selected month.</p></div>
                ) : (
                    <div className="table-wrapper">
                        <table className="reports-table">
                            <thead><tr><th>Employee</th><th>Employee Code</th><th>Department</th><th>Days Counted</th><th>Present</th><th>Absent</th><th>Attendance</th></tr></thead>
                            <tbody>
                                {report.map((record, index) => (
                                    <tr key={record.employeeCode || index}>
                                        <td><strong>{record.name || "—"}</strong></td>
                                        <td>{record.employeeCode || "—"}</td>
                                        <td>{record.department || "Not Assigned"}</td>
                                        <td>{record.daysCounted ?? 0}</td>
                                        <td><span className="report-present-count">{record.presentDays ?? 0}</span></td>
                                        <td><span className="report-absent-count">{record.absentDays ?? 0}</span></td>
                                        <td><span className={record.presentDays > 0 ? "report-attendance-percentage report-attendance-positive" : "report-attendance-percentage"}>{record.attendancePercentage || "0.00%"}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Reports;