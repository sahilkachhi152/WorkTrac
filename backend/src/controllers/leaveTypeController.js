const LeaveType = require("../models/LeaveType");


// ===============================
// CREATE LEAVE TYPE
// ===============================

exports.createLeaveType = async(req,res)=>{

    try{


        const leaveType = await LeaveType.create({

            name:req.body.name,

            description:req.body.description

        });


        res.json({

            message:"Leave type created",

            leaveType

        });


    }catch(error){

        res.status(500).json({

            message:error.message

        });

    }

};



// ===============================
// GET LEAVE TYPES
// ===============================

exports.getLeaveTypes = async(req,res)=>{

    try{


        const leaveTypes = await LeaveType.findAll({

            order:[

                ["id","ASC"]

            ]

        });


        res.json(leaveTypes);


    }catch(error){

        res.status(500).json({

            message:error.message

        });

    }

};