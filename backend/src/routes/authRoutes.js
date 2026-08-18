const express = require("express");
const router = express.Router();
const { login, refreshToken, logout, requestOTP, resetPassword } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const { loginValidator } = require("../validators/authValidator");
const { validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.post("/login", loginValidator, validate, login);
router.post("/refresh", refreshToken);
router.post("/logout", authMiddleware, logout);
router.post("/request-otp", requestOTP);
router.post("/reset-password", resetPassword);

module.exports = router;