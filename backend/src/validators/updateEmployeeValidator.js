const { body } = require("express-validator");

exports.updateEmployeeValidator = [
  body("name").optional().isLength({ min: 3 }).withMessage("Name must contain at least 3 characters"),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Enter a valid email")
    .custom((value) => {
      if (!value.endsWith("@worktrac.com")) {
        throw new Error("Email must be from the @worktrac.com domain");
      }
      return true;
    }),
  body("employeeCode").optional().notEmpty().withMessage("Employee code is required")
];