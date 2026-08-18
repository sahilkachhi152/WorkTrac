const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminOrSuperiorMiddleware = require("../middleware/adminOrSuperiorMiddleware");

// Import from controllers
const { createEmployee, getProfile, getDashboard, changePassword } = require("../controllers/employeeController");
const { updateEmployee } = require("../controllers/adminController"); // ✅ Added this import

// Validators
const { createEmployeeValidator } = require("../validators/employeeValidator");
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

// ===============================
// CREATE EMPLOYEE
// ===============================
router.post(
    "/",
    authMiddleware,
    adminOrSuperiorMiddleware,
    createEmployeeValidator,
    validate,
    createEmployee
);

// ===============================
// UPDATE EMPLOYEE
// ===============================
router.put(
    "/:id",
    authMiddleware,
    adminOrSuperiorMiddleware,
    updateEmployeeValidator,
    validate,
    updateEmployee   // ✅ Now works
);

// ===============================
// EMPLOYEE PROFILE & DASHBOARD
// ===============================
router.get("/profile", authMiddleware, getProfile);
router.get("/dashboard", authMiddleware, getDashboard);
router.put("/change-password", authMiddleware, changePassword);

module.exports = router;