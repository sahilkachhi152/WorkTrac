import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api/api";
import { getISTMonth } from "../utils/dateUtils";

function AttendanceRegister() {
    const [employees, setEmployees] = useState([]);
    const [attendanceMap, setAttendanceMap] = useState({});
    const [month, setMonth] = useState(getISTMonth());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadRegister = async () => {
        try {
            setLoading(true);
            setError("");
            const data = await apiRequest(`/admin/attendance/register?month=${month}`);
            const employeeList = Array.isArray(data?.employees) ? data.employees : [];
            setEmployees(employeeList);
            const map = {};
            employeeList.forEach(emp => {
                map[emp.id] = emp.attendance || {};
            });
            setAttendanceMap(map);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRegister();
    }, [month]);

    const daysInMonth = useMemo(() => {
        const [year, monthNumber] = month.split("-").map(Number);
        const totalDays = new Date(year, monthNumber, 0).getDate();
        return Array.from({ length: totalDays }, (_, i) => String(i + 1).padStart(2, "0"));
    }, [month]);

    const getEmployeeId = (employee) => employee.id || employee.employeeId;
    const getStatus = (employee, day) => {
        const dateKey = `${month}-${day}`;
        return attendanceMap[getEmployeeId(employee)]?.[dateKey] || "";
    };

    const getPresentCount = (employee) => daysInMonth.filter(day => getStatus(employee, day) === "P").length;
    const getAbsentCount = (employee) => daysInMonth.filter(day => getStatus(employee, day) === "A").length;
    const getLeaveCount = (employee) => daysInMonth.filter(day => getStatus(employee, day) === "L").length;

    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    const todayDay = today.startsWith(month) ? today.slice(-2) : null;

    const formattedMonth = useMemo(() => {
        const date = new Date(`${month}-01T00:00:00`);
        return date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    }, [month]);

    const registerTotals = useMemo(() => {
        let present = 0, absent = 0, leave = 0;
        employees.forEach((employee) => {
            present += getPresentCount(employee);
            absent += getAbsentCount(employee);
            leave += getLeaveCount(employee);
        });
        return { present, absent, leave };
    }, [employees, attendanceMap, daysInMonth]);

    const dailyTotals = useMemo(() => {
        return daysInMonth.map((day) => {
            let present = 0, absent = 0, leave = 0;
            employees.forEach((employee) => {
                const status = getStatus(employee, day);
                if (status === "P") present++;
                if (status === "A") absent++;
                if (status === "L") leave++;
            });
            return { day, present, absent, leave };
        });
    }, [employees, attendanceMap, daysInMonth]);

    if (loading) return <div className="page-loading">Loading attendance register...</div>;
    if (error && employees.length === 0) return <div className="dashboard-error"><h2>Unable to load attendance register</h2><p>{error}</p><button onClick={loadRegister}>Try Again</button></div>;

    return (
        <div className="attendance-register-page">
            <div className="reports-header">
                <div><h1>Attendance Register</h1><p>Monthly employee attendance register</p></div>
                <button className="refresh-button" onClick={loadRegister}>Refresh</button>
            </div>

            <div className="reports-filter-card">
                <div className="reports-filter-group">
                    <label>Month</label>
                    <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
                </div>
                <div className="register-month-title"><strong>{formattedMonth}</strong></div>
            </div>

            {error && <div className="report-inline-error">{error}</div>}

            <div className="attendance-register-legend">
                <div className="legend-item"><span className="register-status present">P</span><span>Present</span></div>
                <div className="legend-item"><span className="register-status absent">A</span><span>Absent</span></div>
                <div className="legend-item"><span className="register-status leave">L</span><span>Leave</span></div>
                <div className="legend-item"><span className="register-status empty">—</span><span>No record</span></div>
            </div>

            <div className="reports-card">
                <div className="reports-card-header">
                    <div><h2>Monthly Attendance Register</h2><span>{formattedMonth}</span></div>
                </div>
                {employees.length === 0 ? (
                    <div className="empty-state"><h3>No employees found</h3><p>There are no employees available for the register.</p></div>
                ) : (
                    <div className="table-wrapper">
                        <table className="attendance-register-table">
                            <thead>
                                <tr>
                                    <th className="register-sticky-number">#</th>
                                    <th className="register-sticky-employee">Employee</th>
                                    <th className="register-sticky-department">Department</th>
                                    {daysInMonth.map((day) => (
                                        <th key={day} className={`register-day-column ${todayDay === day ? "register-today-column" : ""}`}>{day}</th>
                                    ))}
                                    <th className="register-total-header present-header">P</th>
                                    <th className="register-total-header absent-header">A</th>
                                    <th className="register-total-header leave-header">L</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map((employee, index) => {
                                    const presentCount = getPresentCount(employee);
                                    const absentCount = getAbsentCount(employee);
                                    const leaveCount = getLeaveCount(employee);
                                    return (
                                        <tr key={getEmployeeId(employee)}>
                                            <td className="register-sticky-number">{index + 1}</td>
                                            <td className="register-sticky-employee">
                                                <div className="register-employee">
                                                    <strong>{employee.employeeCode || "—"}</strong>
                                                    <span>{employee.name || "Unknown"}</span>
                                                </div>
                                            </td>
                                            <td className="register-sticky-department">{employee.department || employee.department?.name || employee.Department?.name || "Not Assigned"}</td>
                                            {daysInMonth.map((day) => {
                                                const status = getStatus(employee, day);
                                                return (
                                                    <td key={`${getEmployeeId(employee)}-${day}`} className={`register-day-cell ${todayDay === day ? "register-today-cell" : ""}`}>
                                                        {status === "P" ? <span className="register-status present">P</span> :
                                                         status === "A" ? <span className="register-status absent">A</span> :
                                                         status === "L" ? <span className="register-status leave">L</span> :
                                                         <span className="register-status empty">—</span>}
                                                    </td>
                                                );
                                            })}
                                            <td className="register-total present-total">{presentCount}</td>
                                            <td className="register-total absent-total">{absentCount}</td>
                                            <td className="register-total leave-total">{leaveCount}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                <tr className="register-footer-row">
                                    <td className="register-sticky-number">—</td>
                                    <td className="register-sticky-employee register-footer-label">Total</td>
                                    <td className="register-sticky-department">—</td>
                                    {dailyTotals.map(({ day, present, absent, leave }) => (
                                        <td key={`daily-total-${day}`} className="register-footer-day">
                                            {present > 0 && <span className="daily-total-present">{present}</span>}
                                            {absent > 0 && <span className="daily-total-absent">{absent}</span>}
                                            {leave > 0 && <span className="daily-total-leave">{leave}</span>}
                                            {present === 0 && absent === 0 && leave === 0 && <span className="register-status empty">—</span>}
                                        </td>
                                    ))}
                                    <td className="register-footer-total present-total">{registerTotals.present}</td>
                                    <td className="register-footer-total absent-total">{registerTotals.absent}</td>
                                    <td className="register-footer-total leave-total">{registerTotals.leave}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AttendanceRegister;