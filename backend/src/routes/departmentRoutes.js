const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

// ✅ CHANGE THIS
const adminOrSuperiorMiddleware = require("../middleware/adminOrSuperiorMiddleware");

const {
    createDepartment,
    getDepartments,
    updateDepartment,
    deleteDepartment,
    getDepartmentStats
} = require("../controllers/departmentController");


router.post(
    "/",
    authMiddleware,
    adminOrSuperiorMiddleware,   // ✅ FIXED
    createDepartment
);


router.get(
    "/",
    authMiddleware,
    adminOrSuperiorMiddleware,   // ✅ FIXED
    getDepartments
);


router.put(
    "/:id",
    authMiddleware,
    adminOrSuperiorMiddleware,   // ✅ FIXED
    updateDepartment
);


router.delete(
    "/:id",
    authMiddleware,
    adminOrSuperiorMiddleware,   // ✅ FIXED
    deleteDepartment
);


router.get(
    "/stats",
    authMiddleware,
    adminOrSuperiorMiddleware,   // ✅ FIXED
    getDepartmentStats
);


module.exports = router;