const express = require("express");
const router = express.Router();


const authMiddleware = require("../middleware/authMiddleware");

// ✅ CHANGE THIS
const adminOrSuperiorMiddleware = require("../middleware/adminOrSuperiorMiddleware");


const {
    createLeaveType,
    getLeaveTypes
}=require("../controllers/leaveTypeController");



router.post(
    "/",
    authMiddleware,
    adminOrSuperiorMiddleware,   // ✅ FIXED
    createLeaveType
);



router.get(
    "/",
    authMiddleware,
    adminOrSuperiorMiddleware,   // ✅ FIXED
    getLeaveTypes
);



module.exports = router;