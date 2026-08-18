const Leave = require("../models/Leave");
const LeaveType = require("../models/LeaveType");
const { getFactoryDate } = require("../utils/shiftUtils");

// Employee apply leave

exports.applyLeave = async (req, res) => {

    try {


        const {
            leaveType,
            startDate,
            endDate,
            reason
        } = req.body;









        if (!leaveType || !startDate || !endDate) {

            return res.status(400).json({

                message: "Leave type and dates are required"

            });

        }



        const leaveTypeRecord =
            await LeaveType.findOne({

                where: {
                    name: leaveType
                }

            });



        if (!leaveTypeRecord) {

            return res.status(400).json({

                message: "Invalid leave type"

            });

        }



        const today = getFactoryDate();



        if (startDate < today) {

            return res.status(400).json({

                message: "Start date cannot be in the past"

            });

        }



        if (endDate < startDate) {

            return res.status(400).json({

                message: "End date cannot be before start date"

            });

        }



        const leave = await Leave.create({

            employeeId: req.user.id,

            leaveType: leaveTypeRecord.name,

            startDate,

            endDate,

            reason

        });


        res.json({

            message: "Leave request submitted",

            leave

        });



    } catch (error) {


        res.status(500).json({

            message: error.message

        });


    }

};




// ===============================
// EMPLOYEE LEAVE HISTORY
// ===============================

exports.getMyLeaves = async (req, res) => {

    try {


        const leaves = await Leave.findAll({

            where: {

                employeeId: req.user.id

            },

            order: [

                ["createdAt", "DESC"]

            ]

        });



        res.json(leaves);



    } catch (error) {

        res.status(500).json({

            message: error.message

        });

    }

};




// ===============================
// CANCEL PENDING LEAVE
// ===============================

exports.cancelLeave = async (req, res) => {

    try {


        const leave = await Leave.findOne({

            where: {

                id: req.params.id,

                employeeId: req.user.id

            }

        });



        if (!leave) {

            return res.status(404).json({

                message: "Leave not found"

            });

        }



        if (leave.status !== "pending") {

            return res.status(400).json({

                message:
                    "Only pending leaves can be cancelled"

            });

        }



        await leave.destroy();



        res.json({

            message:
                "Leave cancelled successfully"

        });



    } catch (error) {


        res.status(500).json({

            message: error.message

        });


    }

};