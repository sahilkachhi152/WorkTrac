const sequelize = require("./src/config/database");
const Employee = require("./src/models/Employee");

async function promoteAdmin() {
    try {
        await sequelize.authenticate();

        const admin = await Employee.findOne({
            where: {
                email: "admin@worktrac.com"
            }
        });

        if (!admin) {
            console.log("Admin account not found.");
            process.exit();
        }

        admin.role = "admin";

        await admin.save();

        console.log("Admin promoted successfully.");
        console.log({
            id: admin.id,
            email: admin.email,
            role: admin.role
        });

        process.exit();

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

promoteAdmin();