const bcrypt = require("bcrypt");
const sequelize = require("./config/database");
const Employee = require("./models/Employee");

async function createSuperior() {
    try {
        await sequelize.sync();

        const hashedPassword = await bcrypt.hash("superior.skw@123", 10);

        const superior = await Employee.create({
            name: "Superior Admin",
            email: "superior@worktrac.com",
            password: hashedPassword,
            employeeCode: "SUP001",
            role: "superior",
            mobileNumber: "+919999999999",
            scheme: null
        });

        console.log("✅ Superior Admin created successfully!");
        console.log("Email: superior@worktrac.com");
        console.log("Password: *****");
        process.exit(0);

    } catch (error) {
        console.error("Error creating superior:", error);
        process.exit(1);
    }
}

createSuperior();