const sequelize = require("./config/database");


async function addStatusColumn(){

    try {

        await sequelize.query(`
            ALTER TABLE Employees
            ADD COLUMN status VARCHAR(255)
            DEFAULT 'active';
        `);


        console.log("Status column added successfully");


    } catch(error){

        console.log(error.message);

    }


    process.exit();

}


addStatusColumn();