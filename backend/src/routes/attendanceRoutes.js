const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    signIn,
    signOut,
    getMyAttendance,
    getMonthlyAttendance
} = require("../controllers/attendanceController");

router.post("/signin", authMiddleware, signIn);

router.post("/signout", authMiddleware, signOut);

router.get("/history", authMiddleware, getMyAttendance);

router.get("/monthly", authMiddleware, getMonthlyAttendance);

module.exports = router;