const { body } = require("express-validator");

exports.createEmployeeValidator = [
  body("name").notEmpty().withMessage("Employee name is required").isLength({ min: 3 }).withMessage("Name must contain at least 3 characters"),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Enter a valid email")
    .custom((value) => {
      if (!value.endsWith("@worktrac.com")) {
        throw new Error("Email must be from the @worktrac.com domain");
      }
      return true;
    }),
  body("password").notEmpty().withMessage("Password is required").isLength({ min: 6 }).withMessage("Password must contain at least 6 characters"),
  body("employeeCode").notEmpty().withMessage("Employee code is required")
];