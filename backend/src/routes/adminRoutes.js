const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const superiorMiddleware = require("../middleware/superiorMiddleware");
const adminOrSuperiorMiddleware = require("../middleware/adminOrSuperiorMiddleware");
const { createEmployee } = require("../controllers/employeeController");
const { updateEmployeeValidator } = require("../validators/updateEmployeeValidator");
const { validationResult } = require("express-validator");
// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
const {
    getEmployees,
    getDashboard,
    getEmployeeAttendance,
    getLateAttendance,
    getDepartmentPerformance,
    getEmployeeAttendancePercentage,
    getDepartmentAttendanceSummary,
    updateEmployee,
    deleteEmployee,
    getLeaves,
    approveLeave,
    rejectLeave,
    getAttendanceStatus,
    getDepartmentSummary,
    getAttendanceReport,
    getLeaveReport,
    exportAttendanceCSV,
    exportAttendanceExcel,
    exportAttendancePDF,
    activateEmployee,
    deactivateEmployee,
    getEmployeeProfile,
    updateEmployeeDevice,
    getDailyAttendanceReport,
    getEmployeeMonthlyAttendance,
    getAttendanceRegister
} = require("../controllers/adminController");

// =====================================================
// SUPERIOR-ONLY ROUTES (Create/Delete Admins)
// =====================================================

// Create a new Admin (Superior only)
router.post(
    "/admins",
    authMiddleware,
    superiorMiddleware,
    createEmployee // Reuse the same create function, but role will be set in body
);

// Delete an Admin (Superior only)
router.delete(
    "/admins/:id",
    authMiddleware,
    superiorMiddleware,
    deleteEmployee
);


// EMPLOYEE MANAGEMENT (Admin or Superior)


// Create Employee
router.post(
    "/employees",
    authMiddleware,
    adminOrSuperiorMiddleware,
    createEmployee
);

// Get All Employees
router.get(
    "/employees",
    authMiddleware,
    adminOrSuperiorMiddleware,
    getEmployees
);

// Update Employee
router.put(
  "/employees/:id",
  authMiddleware,
  adminOrSuperiorMiddleware,
  updateEmployeeValidator,
  validate,
  updateEmployee
);

// Delete Employee
router.delete(
    "/employees/:id",
    authMiddleware,
    adminOrSuperiorMiddleware,
    deleteEmployee
);

// Update Device
router.put(
    "/employees/:id/device",
    authMiddleware,
    adminOrSuperiorMiddleware,
    updateEmployeeDevice
);

// Activate Employee
router.put(
    "/employees/:id/activate",
    authMiddleware,
    adminOrSuperiorMiddleware,
    activateEmployee
);

// Deactivate Employee
router.put(
    "/employees/:id/deactivate",
    authMiddleware,
    adminOrSuperiorMiddleware,
    deactivateEmployee
);

// Employee Profile
router.get(
    "/employees/:id/profile",
    authMiddleware,
    adminOrSuperiorMiddleware,
    getEmployeeProfile
);

// =====================================================
// DASHBOARD & REPORTS (Admin or Superior)
// =====================================================

router.get(
    "/dashboard",
    authMiddleware,
    adminOrSuperiorMiddleware,
    getDashboard
);

router.get(
    "/leaves",
    authMiddleware,
    adminOrSuperiorMiddleware,
    getLeaves
);

router.put(
    "/leaves/:id/approve",
    authMiddleware,
    adminOrSuperiorMiddleware,
    approveLeave
);

router.put(
    "/leaves/:id/reject",
    authMiddleware,
    adminOrSuperiorMiddleware,
    rejectLeave
);

router.get(
    "/analytics/departments",
    authMiddleware,
    adminOrSuperiorMiddleware,
    getDepartmentPerformance
);

router.get(
    "/analytics/employees",
    authMiddleware,
    adminOrSuperiorMiddleware,
    getEmployeeAttendancePercentage
);

router.get(
    "/department-summary",
    authMiddleware,
    adminOrSuperiorMiddleware,
    getDepartmentSummary
);

router.get(
    "/reports/attendance",
    authMiddleware,
    adminOrSuperiorMiddleware,
    getAttendanceReport
);

router.get(
    "/reports/leaves",
    authMiddleware,
    adminOrSuperiorMiddleware,
    getLeaveReport
);

router.get(
    "/reports/attendance/export/csv",
    authMiddleware,
    adminOrSuperiorMiddleware,
    exportAttendanceCSV
);

router.get(
    "/reports/attendance/export/excel",
    authMiddleware,
    adminOrSuperiorMiddleware,
    exportAttendanceExcel
);

router.get(
    "/reports/attendance/export/pdf",
    authMiddleware,
    adminOrSuperiorMiddleware,
    exportAttendancePDF
);

// =====================================================
// ATTENDANCE ROUTES (Admin or Superior)
// =====================================================

// ✅ EXACT MATCH FIRST: MUST BE AT THE TOP OF THIS BLOCK
router.get(
    "/attendance/register",
    authMiddleware,
    adminOrSuperiorMiddleware,
    getAttendanceRegister
);

router.get(
    "/attendance/status",
    authMiddleware,
    adminOrSuperiorMiddleware,
    getAttendanceStatus
);

router.get(
    "/attendance/daily",
    authMiddleware,
    adminOrSuperiorMiddleware,
    getDailyAttendanceReport
);

router.get(
    "/attendance/monthly/:employeeId",
    authMiddleware,
    adminOrSuperiorMiddleware,
    getEmployeeMonthlyAttendance
);

router.get(
    "/attendance/department-summary",
    authMiddleware,
    adminOrSuperiorMiddleware,
    getDepartmentAttendanceSummary
);

router.get(
    "/attendance/late",
    authMiddleware,
    adminOrSuperiorMiddleware,
    getLateAttendance
);

// ✅ DYNAMIC PARAM LAST: MUST BE AT THE BOTTOM
router.get(
    "/attendance/:employeeId",
    authMiddleware,
    adminOrSuperiorMiddleware,
    getEmployeeAttendance
);

module.exports = router;