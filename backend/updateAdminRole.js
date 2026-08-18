const { Employee } = require("./src/models");

async function updateAdminRole() {
    try {

        const employee = await Employee.findOne({
            where: {
                id: 1
            }
        });

        if (!employee) {
            console.log("Admin user not found");
            process.exit();
        }

        employee.role = "admin";

        await employee.save();

        console.log("Role updated successfully");
        console.log({
            id: employee.id,
            name: employee.name,
            role: employee.role
        });

        process.exit();

    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

updateAdminRole();