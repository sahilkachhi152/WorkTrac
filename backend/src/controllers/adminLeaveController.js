
const Leave = require("../models/Leave");

console.log(
    ">>> LOADED adminLeaveController.js FROM:",
    __filename
);


// ===============================
// GET ALL LEAVES
// ===============================

exports.getAllLeaves = async (req, res) => {

    try {

        const leaves = await Leave.findAll();

        return res.json(leaves);

    } catch (error) {

        console.error(
            "Get leaves error:",
            error
        );

        return res.status(500).json({
            message: error.message
        });

    }

};


// ===============================
// APPROVE LEAVE
// ===============================


exports.approveLeave = async (req, res) => {

    try {

        const { id } = req.params;

        const { adminComment } = req.body || {};

        const leave = await Leave.findByPk(id);

        if (!leave) {

            return res.status(404).json({
                message: "Leave not found"
            });

        }

        if (leave.status !== "pending") {

            return res.status(400).json({
                message:
                    "Only pending leaves can be approved"
            });

        }

        if (!adminComment || !adminComment.trim()) {

            return res.status(400).json({
                message:
                    "Admin comment is required"
            });

        }

        leave.status = "approved";

        leave.adminComment =
            adminComment.trim();

        await leave.save();

        return res.json({

            message: "Leave approved",

            leave

        });

    } catch (error) {

        console.error(
            "Approve leave error:",
            error
        );

        return res.status(500).json({

            message: error.message

        });

    }

};



// ===============================
// REJECT LEAVE
// ===============================


exports.rejectLeave = async (req, res) => {

    try {

        const { id } = req.params;

        const { adminComment } = req.body || {};

        const leave = await Leave.findByPk(id);

        if (!leave) {

            return res.status(404).json({
                message: "Leave not found"
            });

        }

        if (leave.status !== "pending") {

            return res.status(400).json({
                message:
                    "Only pending leaves can be rejected"
            });

        }

        if (!adminComment || !adminComment.trim()) {

            return res.status(400).json({
                message:
                    "Admin comment is required"
            });

        }

        leave.status = "rejected";

        leave.adminComment =
            adminComment.trim();

        await leave.save();

        return res.json({

            message: "Leave rejected",

            leave

        });

    } catch (error) {

        console.error(
            "Reject leave error:",
            error
        );

        return res.status(500).json({

            message: error.message

        });

    }

};



