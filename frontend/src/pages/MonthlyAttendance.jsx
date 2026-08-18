import { useEffect, useState } from "react";
import { apiRequest } from "../api/api";
import { getISTMonth } from "../utils/dateUtils";

function MonthlyAttendance() {
  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [month, setMonth] = useState(getISTMonth());
  const [report, setReport] = useState(null);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);
  const [error, setError] = useState("");

  const loadEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const data = await apiRequest("/admin/employees");
      const employeeList = data.employees || data || [];
      setEmployees(employeeList);
      if (employeeList.length > 0) setEmployeeId(String(employeeList[0].id));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const loadReport = async (selectedEmployeeId = employeeId, selectedMonth = month) => {
    if (!selectedEmployeeId) return;
    try {
      setLoadingReport(true);
      setError("");
      const data = await apiRequest(`/admin/attendance/monthly/${selectedEmployeeId}?month=${selectedMonth}`);
      setReport(data);
    } catch (err) {
      setError(err.message);
      setReport(null);
    } finally {
      setLoadingReport(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    if (employeeId) loadReport(employeeId, month);
  }, [employeeId]);

  const handleEmployeeChange = (e) => {
    const selectedId = e.target.value;
    setEmployeeId(selectedId);
    loadReport(selectedId, month);
  };

  const handleMonthChange = (e) => {
    const selectedMonth = e.target.value;
    setMonth(selectedMonth);
    if (employeeId) loadReport(employeeId, selectedMonth);
  };

  if (loadingEmployees) return <div className="page-loading">Loading employees...</div>;
  if (error && !report) return <div className="dashboard-error"><h2>Unable to load monthly attendance</h2><p>{error}</p><button onClick={loadEmployees}>Try Again</button></div>;

  return (
    <div className="attendance-page">
      <div className="attendance-header">
        <div><h1>Monthly Attendance</h1><p>Employee-wise monthly attendance</p></div>
        <div className="monthly-filters">
          <div className="monthly-filter">
            <label>Employee</label>
            <select value={employeeId} onChange={handleEmployeeChange}>
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.employeeCode} - {emp.name}</option>
              ))}
            </select>
          </div>
          <div className="monthly-filter">
            <label>Month</label>
            <input type="month" value={month} onChange={handleMonthChange} />
          </div>
        </div>
      </div>

      {loadingReport ? (
        <div className="page-loading monthly-loading">Loading attendance...</div>
      ) : report ? (
        <>
          <div className="monthly-employee-card">
            <div className="monthly-employee-avatar">{report.employee?.name?.charAt(0)?.toUpperCase() || "E"}</div>
            <div className="monthly-employee-info">
              <h2>{report.employee?.name || "Unknown Employee"}</h2>
              <p>{report.employee?.employeeCode || "—"} • {report.employee?.department || "Not Assigned"}</p>
              <span>{report.employee?.email || "—"}</span>
            </div>
          </div>

          <div className="attendance-summary">
            <div className="attendance-summary-card"><span>Total Days</span><strong>{report.summary?.totalDays ?? "—"}</strong></div>
            <div className="attendance-summary-card"><span>Present Days</span><strong className="present-number">{report.summary?.presentDays ?? "—"}</strong></div>
            <div className="attendance-summary-card"><span>Absent Days</span><strong className="absent-number">{report.summary?.absentDays ?? "—"}</strong></div>
            <div className="attendance-summary-card"><span>Attendance</span><strong>{report.summary?.attendancePercentage || "—"}</strong></div>
          </div>

          <div className="attendance-card">
            <div className="attendance-card-header">
              <div><h2>Attendance Details</h2><span>{report.month || month}</span></div>
              <button className="refresh-button" onClick={() => loadReport()}>Refresh</button>
            </div>
            {report.attendance?.length === 0 ? (
              <div className="empty-state"><h3>No attendance records</h3><p>No attendance data is available for this employee and month.</p></div>
            ) : (
              <div className="table-wrapper">
                <table className="attendance-table">
                  <thead><tr><th>Date</th><th>Status</th><th>Sign In</th><th>Sign Out</th><th>Working Hours</th><th>Device ID</th><th>Sign In Location</th><th>Sign Out Location</th></tr></thead>
                  <tbody>
                    {report.attendance?.map((record) => (
                      <tr key={record.date}>
                        <td><strong>{record.date || "—"}</strong></td>
                        <td><span className={`status-badge ${record.status?.toLowerCase() === "present" ? "status-active" : "status-inactive"}`}>{record.status || "Unknown"}</span></td>
                        <td>{record.signIn || "—"}</td>
                        <td>{record.signOut || "—"}</td>
                        <td>{record.workingHours || "—"}</td>
                        <td>{record.deviceId || "—"}</td>
                        <td>{record.signInLatitude != null && record.signInLongitude != null ? `${record.signInLatitude}, ${record.signInLongitude}` : "—"}</td>
                        <td>{record.signOutLatitude != null && record.signOutLongitude != null ? `${record.signOutLatitude}, ${record.signOutLongitude}` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="empty-state"><h3>Select an employee</h3><p>Select an employee and month to view attendance.</p></div>
      )}
    </div>
  );
}

export default MonthlyAttendance;