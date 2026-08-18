const { body } = require("express-validator");


// ===============================
// APPLY LEAVE VALIDATION
// ===============================

exports.applyLeaveValidator = [

    body("leaveType")
        .notEmpty()
        .withMessage("Leave type is required"),


    body("startDate")
        .notEmpty()
        .withMessage("Start date is required")
        .isDate()
        .withMessage("Invalid start date"),


    body("endDate")
        .notEmpty()
        .withMessage("End date is required")
        .isDate()
        .withMessage("Invalid end date"),


    body("reason")
        .notEmpty()
        .withMessage("Leave reason is required")
        .isLength({ min: 5 })
        .withMessage("Reason must contain at least 5 characters")

];