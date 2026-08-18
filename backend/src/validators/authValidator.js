const { body } = require("express-validator");


// ===============================
// LOGIN VALIDATION
// ===============================

exports.loginValidator = [

    body("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Enter a valid email"),


    body("password")
        .notEmpty()
        .withMessage("Password is required")

];