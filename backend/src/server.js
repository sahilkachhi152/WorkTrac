const app = require("./app");
const sequelize = require("./config/database");

const path = require("path");

console.log(
    "Database file:",
    sequelize.options.storage
);

console.log("FULL DATABASE PATH:");

console.log(
    path.resolve(
        sequelize.options.storage
    )
);


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

    console.log("Database connected");

    app.listen(PORT, () => {

        console.log(
            `Server running on port ${PORT}`
        );

    });

})

.catch(error => {

    console.log(
        "Database connection failed:",
        error
    );

});