const express = require("express");
const router = express.Router();


const authMiddleware = require("../middleware/authMiddleware");

// ✅ CHANGE THIS
const adminOrSuperiorMiddleware = require("../middleware/adminOrSuperiorMiddleware");


const {
    getAuditLogs,
    getUserAuditLogs
} = require("../controllers/auditController");



// ===============================
// ALL AUDIT LOGS
// ===============================

router.get(
    "/",
    authMiddleware,
    adminOrSuperiorMiddleware,   // ✅ FIXED
    getAuditLogs
);



// ===============================
// USER ACTIVITY LOGS
// ===============================

router.get(
    "/user/:userId",
    authMiddleware,
    adminOrSuperiorMiddleware,   // ✅ FIXED
    getUserAuditLogs
);



module.exports = router;