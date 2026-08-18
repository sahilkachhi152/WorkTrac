const app = require("./app");
const sequelize = require("./config/database");
const path = require("path");

// ===============================
// DISPLAY DATABASE INFO (Safe)
// ===============================
console.log("📊 Database Configuration:");

// Check if using SQLite (has storage) or PostgreSQL (uses DATABASE_URL)
if (sequelize.options.storage) {
    console.log("📁 Type: SQLite");
    console.log("📁 File:", sequelize.options.storage);
    console.log("📁 Full Path:", path.resolve(sequelize.options.storage));
} else if (process.env.DATABASE_URL) {
    console.log("🐘 Type: PostgreSQL");
    console.log("🔗 Connected to:", process.env.DATABASE_URL.split('@')[1]?.split('/')[0] || 'PostgreSQL');
} else {
    console.log("⚠️ No database configuration found!");
}

// ===============================
// LOAD MODELS
// ===============================
require("./models/Employee");
require("./models/Department");
require("./models/Attendance");
require("./models/Leave");
require("./models/LeaveType");
require("./models/AuditLog");

// ===============================
// LOAD ASSOCIATIONS
// ===============================
require("./models/associations");

const PORT = process.env.PORT || 5000;

// ===============================
// DATABASE + SERVER
// ===============================
sequelize.sync()
    .then(() => {
        console.log("✅ Database connected successfully");
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    })
    .catch(error => {
        console.log("❌ Database connection failed:", error);
    });
