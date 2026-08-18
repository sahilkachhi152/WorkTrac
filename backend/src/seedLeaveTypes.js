const sequelize = require("./config/database");
const LeaveType = require("./models/LeaveType");

async function seedLeaveTypes() {
    try {
        await sequelize.sync();

        const leaveTypes = [
            { name: "Sick Leave", description: "Medical or health-related leave" },
            { name: "Casual Leave", description: "Personal urgent matters" },
            { name: "Annual Leave", description: "Yearly paid vacation leave" },
            { name: "Other", description: "Other types of leave" }
        ];

        for (const type of leaveTypes) {
            await LeaveType.findOrCreate({
                where: { name: type.name },
                defaults: type
            });
        }

        console.log("✅ Leave types seeded successfully!");
        console.log("Available types:", leaveTypes.map(t => t.name).join(", "));
        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding leave types:", error.message);
        process.exit(1);
    }
}

seedLeaveTypes();