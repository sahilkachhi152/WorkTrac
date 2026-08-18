const Employee = require("./Employee");
const Department = require("./Department");
const Attendance = require("./Attendance");
const Leave = require("./Leave");
const LeaveType = require("./LeaveType");
const AuditLog = require("./AuditLog");
const RefreshToken = require("./RefreshToken"); // ✅ NEW

// Employee - Department
Department.hasMany(Employee, {
    foreignKey: "departmentId"
});
Employee.belongsTo(Department, {
    foreignKey: "departmentId"
});

// Employee - Leave
Employee.hasMany(Leave, {
    foreignKey: "employeeId"
});
Leave.belongsTo(Employee, {
    foreignKey: "employeeId"
});

// Employee - Attendance
Employee.hasMany(Attendance, {
    foreignKey: "employeeId"
});
Attendance.belongsTo(Employee, {
    foreignKey: "employeeId"
});

// Employee - AuditLog
Employee.hasMany(AuditLog, {
    foreignKey: "userId"
});
AuditLog.belongsTo(Employee, {
    foreignKey: "userId"
});

// ✅ NEW: Employee - RefreshToken
Employee.hasMany(RefreshToken, {
    foreignKey: "userId"
});
RefreshToken.belongsTo(Employee, {
    foreignKey: "userId"
});