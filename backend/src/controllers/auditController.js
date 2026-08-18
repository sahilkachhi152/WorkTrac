const AuditLog = require("../models/AuditLog");
const Employee = require("../models/Employee");


// ===============================
// GET ALL AUDIT LOGS
// ===============================

exports.getAuditLogs = async (req, res) => {

    try {


        const logs = await AuditLog.findAll({

            include: [

                {
                    model: Employee,

                    attributes: [
                        "id",
                        "name",
                        "email",
                        "role"
                    ]

                }

            ],

            order: [

                ["createdAt", "DESC"]

            ]

        });



        res.json({

            count: logs.length,

            logs

        });



    } catch(error) {


        res.status(500).json({

            message: error.message

        });


    }

};



// ===============================
// GET USER ACTIVITY
// ===============================

exports.getUserAuditLogs = async (req,res)=>{

    try {


        const logs = await AuditLog.findAll({

            where: {

                userId: req.params.userId

            },

            include: [

                {

                    model: Employee,

                    attributes:[

                        "name",

                        "email",

                        "role"

                    ]

                }

            ],

            order:[

                ["createdAt","DESC"]

            ]

        });



        res.json({

            count: logs.length,

            logs

        });



    }
    catch(error){

        res.status(500).json({

            message:error.message

        });

    }

};