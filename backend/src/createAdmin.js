const bcrypt = require("bcrypt");

const sequelize = require("./config/database");
const Employee = require("./models/Employee");


const createAdmin = async () => {

    try {

        await sequelize.sync();


        const hashedPassword = await bcrypt.hash(
            "superior123",
            10
        );


        const admin = await Employee.create({

            name: "Admin",

            email: "admin@worktrac.com",

            password: hashedPassword,

            employeeCode: "ADMIN001",

            role: "admin"

        });


        console.log("Admin created successfully");

        console.log(admin);


        process.exit();


    } catch(error){

        console.log(error);

        process.exit();

    }

};


createAdmin();