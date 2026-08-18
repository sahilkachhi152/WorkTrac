import { useEffect, useState } from "react";
import { apiRequest } from "../api/api";
import { getISTDate } from "../utils/dateUtils";

function DailyAttendance() {
  const [date, setDate] = useState(getISTDate());
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAttendance = async (selectedDate = date) => {
    try {
      setLoading(true);
      setError("");
      const data = await apiRequest(`/admin/attendance/daily?date=${selectedDate}`);
      setReport(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  const handleDateChange = (event) => {
    const selectedDate = event.target.value;
    setDate(selectedDate);
    loadAttendance(selectedDate);
  };

  if (loading) return <div className="page-loading">Loading daily attendance...</div>;
  if (error) return <div className="dashboard-error"><h2>Unable to load daily attendance</h2><p>{error}</p><button onClick={() => loadAttendance()}>Try Again</button></div>;

  return (
    <div className="attendance-page">
      <div className="attendance-header">
        <div>
          <h1>Daily Attendance</h1>
          <p>Employee attendance for the selected date</p>
        </div>
        <div className="attendance-date">
          <label>Date</label>
          <input type="date" value={date} onChange={handleDateChange} />
        </div>
      </div>

      {report?.summary && (
        <div className="attendance-summary">
          <div className="attendance-summary-card"><span>Total Employees</span><strong>{report.summary.totalEmployees}</strong></div>
          <div className="attendance-summary-card"><span>Present</span><strong className="present-number">{report.summary.present}</strong></div>
          <div className="attendance-summary-card"><span>Absent</span><strong className="absent-number">{report.summary.absent}</strong></div>
          <div className="attendance-summary-card"><span>Attendance</span><strong>{report.summary.attendancePercentage}</strong></div>
        </div>
      )}

      <div className="attendance-card">
        <div className="attendance-card-header">
          <div><h2>Attendance Details</h2><span>{report?.date || date}</span></div>
          <button className="refresh-button" onClick={() => loadAttendance()}>Refresh</button>
        </div>

        {report?.employees?.length === 0 ? (
          <div className="empty-state"><h3>No employees found</h3><p>There are no employees available for this report.</p></div>
        ) : (
          <div className="table-wrapper">
            <table className="attendance-table">
              <thead><tr><th>Code</th><th>Employee</th><th>Department</th><th>Status</th><th>Sign In</th><th>Sign Out</th><th>Working Hours</th></tr></thead>
              <tbody>
                {report?.employees?.map((employee) => {
                  const isPresent = employee.status?.toLowerCase() === "present";
                  return (
                    <tr key={employee.employeeCode}>
                      <td><strong>{employee.employeeCode || "—"}</strong></td>
                      <td>{employee.employeeName || "—"}</td>
                      <td>{employee.department || "Not Assigned"}</td>
                      <td><span className={`status-badge ${isPresent ? "status-active" : "status-inactive"}`}>{employee.status || "Unknown"}</span></td>
                      <td>{employee.signIn || "—"}</td>
                      <td>{employee.signOut || "—"}</td>
                      <td>{employee.workingHours || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default DailyAttendance;