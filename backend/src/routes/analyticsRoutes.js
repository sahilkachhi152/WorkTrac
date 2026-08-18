const express = require("express");
const router = express.Router();

const analyticsController = require("../controllers/analyticsController");

const authMiddleware = require("../middleware/authMiddleware");

// ✅ CHANGE THIS: Use adminOrSuperiorMiddleware instead of adminMiddleware
const adminOrSuperiorMiddleware = require("../middleware/adminOrSuperiorMiddleware");


// ===============================
// ATTENDANCE ANALYTICS DASHBOARD
// ===============================

router.get(
    "/",
    authMiddleware,
    adminOrSuperiorMiddleware,   // ✅ FIXED
    analyticsController.getAttendanceAnalytics
);


// ===============================
// MONTHLY ATTENDANCE SUMMARY
// ===============================

router.get(
    "/monthly",
    authMiddleware,
    adminOrSuperiorMiddleware,   // ✅ FIXED
    analyticsController.getMonthlyAttendanceSummary
);


// ===============================
// DEPARTMENT ATTENDANCE ANALYTICS
// ===============================

router.get(
    "/departments",
    authMiddleware,
    adminOrSuperiorMiddleware,   // ✅ FIXED
    analyticsController.getDepartmentAttendanceAnalytics
);


// ===============================
// TOP ATTENDANCE EMPLOYEES
// ===============================

router.get(
    "/top-employees",
    authMiddleware,
    adminOrSuperiorMiddleware,   // ✅ FIXED
    analyticsController.getTopAttendanceEmployees
);


// ===============================
// LATE ARRIVALS
// ===============================

router.get(
    "/late-arrivals",
    authMiddleware,
    adminOrSuperiorMiddleware,   // ✅ FIXED
    analyticsController.getLateArrivals
);


// ===============================
// EARLY CHECKOUT
// ===============================

router.get(
    "/early-checkouts",
    authMiddleware,
    adminOrSuperiorMiddleware,   // ✅ FIXED
    analyticsController.getEarlyCheckout
);


// ===============================
// ABSENCE RANKING
// ===============================

router.get(
    "/absence-ranking",
    authMiddleware,
    adminOrSuperiorMiddleware,   // ✅ FIXED
    analyticsController.getAbsenceRanking
);

// ===============================
// ATTENDANCE PERFORMANCE SUMMARY
// ===============================

router.get(
    "/performance",
    authMiddleware,
    adminOrSuperiorMiddleware,   // ✅ FIXED
    analyticsController.getAttendancePerformance
);

module.exports = router;