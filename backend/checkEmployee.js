const Employee = require("./src/models/Employee");

(async()=>{

    const employees = await Employee.findAll();

    console.log(employees);

})();