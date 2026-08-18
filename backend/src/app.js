const express = require("express");
const cors = require("cors");

const attendanceRoutes = require("./routes/attendanceRoutes");
const adminRoutes = require("./routes/adminRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const authRoutes = require("./routes/authRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const leaveTypeRoutes = require("./routes/leaveTypeRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const auditRoutes = require("./routes/auditRoutes");

const notFound = require("./middleware/notFoundMiddleware");
const errorHandler = require("./middleware/errorMiddleware");
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://your-frontend.vercel.app']   // Replace with your actual Vercel URL later
  : ['http://localhost:5000'];





const app = express();


app.use(cors());

app.use(express.json());


app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));


// ===============================
// ROOT API
// ===============================

app.get("/", (req,res)=>{

    res.send("WorkTrack API is running");

});



// ===============================
// ROUTES
// ===============================

app.use("/api/employees", employeeRoutes);

app.use("/api/attendance", attendanceRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/admin", adminRoutes);



app.use("/api/departments", departmentRoutes);
app.use("/api/leaves", leaveRoutes);



app.use(
    "/api/admin/analytics",
    analyticsRoutes
);

app.use(
    "/api/admin/audit",
    auditRoutes
);

app.use(
    "/api/admin/leave-types",
    leaveTypeRoutes
);



// ===============================
// GLOBAL ERROR HANDLER
// MUST BE LAST
// ===============================

app.use(notFound);
app.use(errorHandler);



module.exports = app;