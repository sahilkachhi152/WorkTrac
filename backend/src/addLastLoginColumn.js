const sequelize = require("./config/database");


const addLastLoginColumn = async () => {

    try {

        await sequelize.query(`

            ALTER TABLE Employees

            ADD COLUMN lastLogin DATETIME;

        `);


        console.log("lastLogin column added successfully");


    } catch (error) {

        console.log(
            "Migration error:",
            error.message
        );

    }

};


addLastLoginColumn();