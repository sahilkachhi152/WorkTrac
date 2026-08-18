const Department = require("../models/Department");
const Employee = require("../models/Employee");

// CREATE DEPARTMENT

exports.createDepartment = async (req,res)=>{

    try{

        const department = await Department.create({

            name:req.body.name,

            description:req.body.description

        });


        res.json({

            message:"Department created",

            department

        });


    }catch(error){

        res.status(500).json({

            message:error.message

        });

    }

};



// GET ALL DEPARTMENTS

exports.getDepartments = async(req,res)=>{

    try{

        const departments = await Department.findAll();


        res.json(departments);


    }catch(error){

        res.status(500).json({

            message:error.message

        });

    }

};

// ===============================
// UPDATE DEPARTMENT
// ===============================

exports.updateDepartment = async (req,res)=>{

    try{

        const department = await Department.findByPk(
            req.params.id
        );


        if(!department){

            return res.status(404).json({

                message:"Department not found"

            });

        }


        await department.update({

            name:
                req.body.name ?? department.name,

            description:
                req.body.description ?? department.description

        });


        res.json({

            message:"Department updated",

            department

        });


    }catch(error){

        res.status(500).json({

            message:error.message

        });

    }

};

// ===============================
// DELETE DEPARTMENT
// ===============================

exports.deleteDepartment = async (req,res)=>{

    try{


        const department = await Department.findByPk(
            req.params.id
        );


        if(!department){

            return res.status(404).json({

                message:"Department not found"

            });

        }


        const employeeCount = await Employee.count({

            where:{
                departmentId: department.id
            }

        });


        if(employeeCount > 0){

            return res.status(400).json({

                message:
                "Cannot delete department. Employees are assigned to this department."

            });

        }


        await department.destroy();


        res.json({

            message:
            "Department deleted successfully"

        });


    }catch(error){

        res.status(500).json({

            message:error.message

        });

    }

};


// ===============================
// DEPARTMENT STATISTICS
// ===============================

exports.getDepartmentStats = async (req,res)=>{

    try{

        const departments = await Department.findAll({

            attributes:[
                "id",
                "name"
            ],

            include:[

                {
                    model: Employee,
                    attributes:[
                        "id"
                    ]
                }

            ],

            order:[
                ["name","ASC"]
            ]

        });


        const stats = departments.map(department=>({

            department:
                department.name,

            employees:
                department.Employees.length

        }));


        res.json(stats);


    }catch(error){

        res.status(500).json({

            message:error.message

        });

    }

};