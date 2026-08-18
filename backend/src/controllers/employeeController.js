const Employee = require("../models/Employee");
const Department = require("../models/Department");
const Attendance = require("../models/Attendance");
const Leave = require("../models/Leave");
const bcrypt = require("bcrypt");


// ===============================
// CREATE EMPLOYEE
// ===============================

exports.createEmployee = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            employeeCode,
            department,
            deviceId,
            mobileNumber,
            scheme
        } = req.body;

        let departmentId = null;

        if (department) {
            const dept = await Department.findOne({
                where: { name: department }
            });
            if (!dept) {
                return res.status(400).json({
                    message: "Department not found"
                });
            }
            departmentId = dept.id;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const employee = await Employee.create({
            name,
            email,
            password: hashedPassword,
            employeeCode,
            departmentId,
            deviceId,
            mobileNumber,
            scheme
        });

        const createdEmployee = await Employee.findByPk(employee.id, {
            attributes: [
                "id", "name", "email", "employeeCode", "role", "status",
                "departmentId", "deviceId", "mobileNumber", "scheme", "createdAt"
            ],
            include: [{ model: Department, attributes: ["name"] }]
        });

        res.status(201).json({
            message: "Employee created successfully",
            employee: createdEmployee
        });

    } catch (error) {
        // ✅ Handle duplicate email/employeeCode
        if (error.name === "SequelizeUniqueConstraintError") {
            const field = error.errors?.[0]?.path || "field";
            return res.status(400).json({
                message: `The ${field} is already in use. Please use a different value.`
            });
        }
        res.status(500).json({ message: error.message });
    }
};




// ===============================
// EMPLOYEE PROFILE
// ===============================

exports.getProfile = async (req, res) => {

    try {


        const employeeId = req.user.id;


        const employee = await Employee.findByPk(

            employeeId,

            {

                attributes: [

                    "id",

                    "name",

                    "email",

                    "employeeCode",

                    "role",

                    "status",

                    "deviceId",

                    "lastLogin",
                    "mobileNumber",
                    "scheme"

                ],


                include: [

                    {

                        model: Department,

                        attributes: [

                            "name"

                        ]

                    }

                ]

            }

        );



        if (!employee) {

            return res.status(404).json({

                message:
                    "Employee not found"

            });

        }



        res.json({

            employee: {

                id:
                    employee.id,

                name:
                    employee.name,

                email:
                    employee.email,

                employeeCode:
                    employee.employeeCode,

                department:
                    employee.Department
                        ? employee.Department.name
                        : "Not Assigned",

                role:
                    employee.role,

                status:
                    employee.status,

                deviceId:
                    employee.deviceId,

                lastLogin:
                    employee.lastLogin

            }

        });



    }

    catch (error) {

        res.status(500).json({

            message: error.message

        });

    }

};




// ===============================
// EMPLOYEE DASHBOARD
// ===============================

exports.getDashboard = async (req, res) => {

    try {


        const employeeId = req.user.id;



        const totalAttendance =
            await Attendance.count({

                where: {

                    employeeId

                }

            });



        const present =
            await Attendance.count({

                where: {

                    employeeId,

                    signInTime: {
                        [require("sequelize").Op.ne]: null
                    }

                }

            });



        const absent =
            totalAttendance - present;



        const attendancePercentage =
            totalAttendance === 0

                ?

                "0%"

                :

                ((present / totalAttendance) * 100)
                    .toFixed(2) + "%";



        const totalLeaves =
            await Leave.count({

                where: {
                    employeeId
                }

            });



        const pendingLeaves =
            await Leave.count({

                where: {

                    employeeId,

                    status: "pending"

                }

            });



        const approvedLeaves =
            await Leave.count({

                where: {

                    employeeId,

                    status: "approved"

                }

            });



        res.json({

            attendance: {

                total:
                    totalAttendance,

                present,

                absent,

                percentage:
                    attendancePercentage

            },


            leaves: {

                total:
                    totalLeaves,

                pending:
                    pendingLeaves,

                approved:
                    approvedLeaves

            }

        });



    }

    catch (error) {

        res.status(500).json({

            message: error.message

        });

    }

};

// ===============================
// CHANGE EMPLOYEE PASSWORD
// ==============================

exports.changePassword = async (req, res) => {

    try {

        const employeeId = req.user.id;

        const {
            currentPassword,
            newPassword
        } = req.body;


        // Validate input
        if (!currentPassword || !newPassword) {

            return res.status(400).json({

                message: "Current password and new password are required"

            });

        }


        // Basic password validation
        if (newPassword.length < 6) {

            return res.status(400).json({

                message: "New password must be at least 6 characters long"

            });

        }


        // Get employee INCLUDING password
        const employee = await Employee.unscoped().findByPk(employeeId);


        if (!employee) {

            return res.status(404).json({

                message: "Employee not found"

            });

        }


        // Verify current password
        const passwordMatch = await bcrypt.compare(

            currentPassword,

            employee.password

        );


        if (!passwordMatch) {

            return res.status(401).json({

                message: "Current password is incorrect"

            });

        }


        // Prevent using the same password
        const samePassword = await bcrypt.compare(

            newPassword,

            employee.password

        );


        if (samePassword) {

            return res.status(400).json({

                message: "New password must be different from current password"

            });

        }


        // Hash new password
        const hashedPassword = await bcrypt.hash(

            newPassword,

            10

        );


        // Update password
        await employee.update({

            password: hashedPassword

        });


        res.json({

            message: "Password changed successfully"

        });

    }

    catch (error) {

        console.error("Change password error:", error);

        res.status(500).json({

            message: error.message

        });

    }

};