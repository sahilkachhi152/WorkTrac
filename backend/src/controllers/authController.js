const Employee = require("../models/Employee");
const Department = require("../models/Department");
const RefreshToken = require("../models/RefreshToken");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

// ===============================
// GENERATE TOKENS HELPER
// ===============================
const generateTokens = async (user) => {
  const accessToken = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET || "WORKTRACK_SECRET",
    { expiresIn: "20min" } // Access token expires in 1 day
  );

  const refreshToken = uuidv4();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Refresh token expires in 7 days

  await RefreshToken.create({
    token: refreshToken,
    userId: user.id,
    expiresAt,
  });

  return { accessToken, refreshToken };
};

// ===============================
// LOGIN
// ===============================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const employee = await Employee.findOne({
      where: { email },
      attributes: { include: ["password"] },
      include: [{ model: Department, attributes: ["name"] }],
    });

    if (!employee) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (employee.status === "inactive") {
      return res.status(403).json({ message: "Account is inactive. Contact administrator." });
    }

    const passwordMatch = await bcrypt.compare(password, employee.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const { accessToken, refreshToken } = await generateTokens(employee);

    // Set refresh token as HttpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Login successful",
      user: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        employeeCode: employee.employeeCode,
        role: employee.role,
        status: employee.status,
        department: employee.Department ? employee.Department.name : null,
        deviceId: employee.deviceId,
      },
      token: accessToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// REFRESH TOKEN
// ===============================
exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token missing" });
  }

  try {
    const tokenRecord = await RefreshToken.findOne({
      where: { token: refreshToken },
      include: [{ model: Employee, attributes: ["id", "role"] }],
    });

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      return res.status(403).json({ message: "Invalid or expired refresh token" });
    }

    // Delete the old token (one-time use)
    await tokenRecord.destroy();

    const employee = tokenRecord.Employee;
    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(employee);

    // Set new refresh token cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ token: accessToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// LOGOUT
// ===============================
exports.logout = async (req, res) => {
  const { refreshToken } = req.cookies;
  if (refreshToken) {
    await RefreshToken.destroy({ where: { token: refreshToken } });
  }
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out successfully" });
};

// ===============================
// REQUEST OTP (Simulated)
// ===============================
exports.requestOTP = async (req, res) => {
  try {
    let { mobileNumber } = req.body;
    if (!mobileNumber) {
      return res.status(400).json({ message: "Mobile number is required" });
    }

    mobileNumber = mobileNumber.trim();
    if (!mobileNumber.startsWith("+91")) {
      if (/^[0-9]{10}$/.test(mobileNumber)) {
        mobileNumber = `+91${mobileNumber}`;
      } else {
        return res.status(400).json({ message: "Invalid mobile number format. Use +91XXXXXXXXXX or 10-digit number." });
      }
    }

    const employee = await Employee.findOne({ where: { mobileNumber } });
    if (!employee) {
      return res.status(404).json({ message: "No account found with this mobile number." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("\n=====================================");
    console.log(`📱 OTP for ${mobileNumber}: ${otp}`);
    console.log("=====================================\n");

    global.otpStore = global.otpStore || {};
    global.otpStore[mobileNumber] = {
      otp: otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    };

    return res.json({ message: "OTP sent successfully to your mobile number." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ===============================
// RESET PASSWORD
// ===============================
exports.resetPassword = async (req, res) => {
  try {
    const { mobileNumber, otp, newPassword } = req.body;
    if (!mobileNumber || !otp || !newPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const stored = global.otpStore?.[mobileNumber];
    if (!stored) {
      return res.status(400).json({ message: "No OTP request found. Please request again." });
    }
    if (Date.now() > stored.expiresAt) {
      return res.status(400).json({ message: "OTP has expired. Please request again." });
    }
    if (stored.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    const employee = await Employee.findOne({ where: { mobileNumber } });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }

    const bcrypt = require("bcrypt");
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await employee.update({ password: hashedPassword });
    delete global.otpStore[mobileNumber];

    return res.json({ message: "Password reset successfully." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};