const Employee = require("../models/Employee");
const Department = require("../models/Department");
const Attendance = require("../models/Attendance");
const Leave = require("../models/Leave");
const AuditLog = require("../models/AuditLog");
const { Parser } = require("json2csv");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const { Op } = require("sequelize");
const { getFactoryDate } = require("../utils/shiftUtils");

// ===============================
// TIME FORMAT HELPER
// ===============================

const formatTime = (dateTime) => {

    if (!dateTime) return "";

    return new Date(dateTime)
        .toLocaleTimeString("en-IN", {

            hour: "2-digit",

            minute: "2-digit",

            hour12: true

        })
        .toUpperCase();

};


const formatDateTime = (dateTime) => {

    if (!dateTime) return "";

    return new Date(dateTime)
        .toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "medium"
        });

};



// ===============================
// ATTENDANCE DATE FILTER HELPER
// ===============================

const getAttendanceFilter = (req) => {

    const { type, month, startDate, endDate } = req.query;


    let where = {};


    // Daily
    if (type === "daily") {

        const today = getFactoryDate();

        where.date = today;

    }


    // Monthly
    else if (type === "monthly" && month) {

        const [year, monthNumber] = month.split("-");


        where.date = {
            [Op.between]: [
                `${year}-${monthNumber}-01`,
                `${year}-${monthNumber}-31`
            ]
        };

    }


    // Date range
    else if (startDate && endDate) {

        where.date = {

            [Op.between]: [
                startDate,
                endDate
            ]

        };

    }


    return where;

};




// ===============================
// GET EMPLOYEES + SEARCH
// ===============================

exports.getEmployees = async (req, res) => {

    try {

        const {
            search,
            department,
            page = 1,
            limit = 10
        } = req.query;

        const currentPage = Number(page);
        const pageSize = Number(limit);

        const allowedSortFields = [
            "id",
            "name",
            "email",
            "employeeCode",
            "createdAt"
        ];


        const sortField =
            allowedSortFields.includes(req.query.sort)
                ? req.query.sort
                : "id";


        const sortOrder =
            req.query.order === "ASC"
                ? "ASC"
                : "DESC";


        let whereCondition = {};

        if (search) {

            whereCondition = {

                [Op.or]: [

                    {
                        name: {
                            [Op.like]: `%${search}%`
                        }
                    },

                    {
                        email: {
                            [Op.like]: `%${search}%`
                        }
                    },

                    {
                        employeeCode: {
                            [Op.like]: `%${search}%`
                        }
                    }

                ]

            };

        }

        if (department) {

            if (!isNaN(Number(department))) {

                // Department ID filter
                whereCondition.departmentId = Number(department);

            } else {

                // Department name filter
                const departmentData = await Department.findOne({

                    where: {
                        name: department
                    }

                });


                if (departmentData) {

                    whereCondition.departmentId =
                        departmentData.id;

                } else {

                    return res.json({

                        page: Number(page),
                        limit: Number(limit),
                        totalEmployees: 0,
                        totalPages: 0,
                        count: 0,
                        employees: []

                    });

                }

            }

        }

        const { count, rows } =
            await Employee.findAndCountAll({

                where: whereCondition,

                attributes: [
                    "id",
                    "name",
                    "email",
                    "employeeCode",
                    "role",
                    "departmentId",
                    "deviceId",
                    "status",
                    "createdAt",
                    "mobileNumber",
                    "scheme"
                ],

                include: [
                    {
                        model: Department,
                        attributes: ["name"]
                    }
                ],

                order: [
                    [sortField, sortOrder]
                ],

                limit: pageSize,

                offset: (currentPage - 1) * pageSize

            });


        res.json({

            page: currentPage,

            limit: pageSize,

            totalEmployees: count,

            totalPages: Math.ceil(count / pageSize),

            count: rows.length,

            employees: rows

        });

    } catch (error) {

        res.status(500).json({

            message: error.message

        });

    }

};



// ===============================
// ADMIN DASHBOARD
// ===============================

exports.getDashboard = async (req, res) => {

    try {

        const totalEmployees = await Employee.count();

        const activeEmployees = await Employee.count({
            where: {
                status: "active"
            }
        });

        const inactiveEmployees = await Employee.count({
            where: {
                status: "inactive"
            }
        });


        const totalDepartments = await Department.count();


        const today = getFactoryDate();


        const presentToday = await Attendance.count({

            where: {
                date: today
            }

        });


        const absentToday =
            totalEmployees - presentToday;


        const attendancePercentage =
            totalEmployees === 0
                ? "0%"
                :
                ((presentToday / totalEmployees) * 100)
                    .toFixed(2) + "%";


        const totalAttendanceRecords =
            await Attendance.count();


        const pendingLeaves =
            await Leave.count({
                where: {
                    status: "pending"
                }
            });


        const approvedLeaves =
            await Leave.count({
                where: {
                    status: "approved"
                }
            });


        const rejectedLeaves =
            await Leave.count({
                where: {
                    status: "rejected"
                }
            });



        res.json({

            employees: {
                total: totalEmployees,
                active: activeEmployees,
                inactive: inactiveEmployees
            },


            departments: {
                total: totalDepartments
            },


            attendance: {

                date: today,

                present:
                    presentToday,

                absent:
                    absentToday,

                percentage:
                    attendancePercentage

            },


            leaves: {

                pending:
                    pendingLeaves,

                approved:
                    approvedLeaves,

                rejected:
                    rejectedLeaves

            },


            totalAttendanceRecords


        });



    } catch (error) {

        res.status(500).json({

            message: error.message

        });

    }

};



// ===============================
// EMPLOYEE ATTENDANCE DETAILS
// ===============================

exports.getEmployeeAttendance = async (req, res) => {

    try {

        const employeeId = req.params.employeeId;


        const employee = await Employee.findByPk(employeeId, {

            attributes: [

                "id",
                "name",
                "email",
                "employeeCode",
                "role",
                "departmentId"

            ],

            include: [

                {
                    model: Department,
                    attributes: ["name"]
                }

            ]

        });

        if (!employee) {

            return res.status(404).json({

                message: "Employee not found"

            });

        }


        const attendance = await Attendance.findAll({

            where: {

                employeeId

            },

            order: [

                ["date", "DESC"]

            ]

        });


        res.json({

            employee,

            attendance

        });


    } catch (error) {

        res.status(500).json({

            message: error.message

        });

    }

};




// ===============================
// UPDATE EMPLOYEE
// ===============================

exports.updateEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByPk(req.params.id);

        if (!employee) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        // 🛡️ SECURITY: Admin cannot edit another Admin or Superior
        if (employee.role === "superior" && req.user.role !== "superior") {
            return res.status(403).json({
                message: "Only Superior Admin can modify Superior account details."
            });
        }

        if (employee.role === "admin" && req.user.role === "admin") {
            return res.status(403).json({
                message: "Admin cannot modify another Admin's account details."
            });
        }

        // Department handling
        let departmentId = employee.departmentId;
        if (req.body.department !== undefined && req.body.department !== null && req.body.department !== "") {
            const department = await Department.findOne({
                where: { name: req.body.department }
            });
            if (!department) {
                return res.status(400).json({
                    message: "Department not found"
                });
            }
            departmentId = department.id;
        }

        // ✅ Update fields
        await employee.update({
            name: req.body.name ?? employee.name,
            email: req.body.email ?? employee.email,
            employeeCode: req.body.employeeCode ?? employee.employeeCode,
            departmentId,
            deviceId: req.body.deviceId !== undefined ? req.body.deviceId : employee.deviceId,
            mobileNumber: req.body.mobileNumber !== undefined ? req.body.mobileNumber : employee.mobileNumber,
            scheme: req.body.scheme !== undefined ? req.body.scheme : employee.scheme
        });

        await createAuditLog({
            userId: req.user.id,
            action: "UPDATE",
            module: "Employee",
            recordId: employee.id,
            description: `Employee ${employee.name} updated`
        });

        const updatedEmployee = await Employee.findByPk(employee.id, {
            attributes: [
                "id", "name", "email", "employeeCode", "role", "departmentId",
                "deviceId", "status", "mobileNumber", "scheme", "createdAt", "updatedAt"
            ],
            include: [{ model: Department, attributes: ["name"] }]
        });

        res.json({
            message: "Employee updated successfully",
            employee: updatedEmployee
        });

    } catch (error) {
        console.error("UPDATE EMPLOYEE ERROR:", error);
        // ✅ Handle duplicate email/employeeCode on update
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
// UPDATE EMPLOYEE DEVICE
// ===============================

exports.updateEmployeeDevice = async (req, res) => {

    try {

        const employee = await Employee.findByPk(
            req.params.id
        );


        if (!employee) {

            return res.status(404).json({

                message: "Employee not found"

            });

        }


        const { deviceId } = req.body;


        // ===============================
        // VALIDATE DEVICE ID
        // ===============================

        if (!deviceId) {

            return res.status(400).json({

                message: "Device ID is required"

            });

        }


        // ===============================
        // UPDATE DEVICE
        // ===============================

        await employee.update({

            deviceId

        });


        // ===============================
        // AUDIT LOG
        // ===============================

        await createAuditLog({

            userId: req.user.id,

            action: "UPDATE_DEVICE",

            module: "Employee",

            recordId: employee.id,

            description:
                `Device ID updated for employee ${employee.name}`

        });


        res.json({

            message:
                "Employee device updated successfully",

            employee: {

                id:
                    employee.id,

                name:
                    employee.name,

                employeeCode:
                    employee.employeeCode,

                deviceId:
                    employee.deviceId

            }

        });


    } catch (error) {

        res.status(500).json({

            message: error.message

        });

    }

};

// ===============================
// DELETE EMPLOYEE
// ===============================

exports.deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByPk(req.params.id);

        if (!employee) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        // ==========================================
        // 🛡️ SECURITY: Prevent deleting the main Superior Admin
        // ==========================================
        if (employee.role === "superior") {
            return res.status(403).json({
                message: "Superior Admin account cannot be deleted."
            });
        }

        // ==========================================
        // 🛡️ SECURITY: Admin cannot delete another Admin (Only Superior can)
        // ==========================================
        if (employee.role === "admin" && req.user.role === "admin") {
            return res.status(403).json({
                message: "Admin cannot delete another Admin account. Only Superior can perform this action."
            });
        }

        await createAuditLog({
            userId: req.user.id,
            action: "DELETE",
            module: "Employee",
            recordId: employee.id,
            description: `Employee ${employee.name} deleted`
        });

        await employee.destroy();

        res.json({
            message: "Employee deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};



// ===============================
// GET ALL LEAVES
// ===============================

exports.getLeaves = async (req, res) => {

    try {

        const leaves = await Leave.findAll({

            include: [
                {
                    model: Employee,

                    attributes: [
                        "name",
                        "employeeCode"
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
            ],

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
// APPROVE LEAVE
// ===============================

exports.approveLeave = async (req, res) => {

    try {


        const leave = await Leave.findByPk(

            req.params.id

        );


        if (!leave) {

            return res.status(404).json({

                message: "Leave not found"

            });

        }


        leave.status = "approved";


        if (req.body.adminComment) {

            leave.adminComment = req.body.adminComment;

        }


        await leave.save();
        await createAuditLog({

            userId: req.user.id,

            action: "APPROVE",

            module: "Leave",

            recordId: leave.id,

            description:
                "Leave approved by admin"

        });

        res.json({

            message: "Leave approved",

            leave

        });


    } catch (error) {

        res.status(500).json({

            message: error.message

        });

    }

};




// ===============================
// REJECT LEAVE
// ===============================

exports.rejectLeave = async (req, res) => {

    try {


        const leave = await Leave.findByPk(

            req.params.id

        );


        if (!leave) {

            return res.status(404).json({

                message: "Leave not found"

            });

        }


        leave.status = "rejected";


        if (req.body.adminComment) {

            leave.adminComment = req.body.adminComment;

        }


        await leave.save();
        await createAuditLog({

            userId: req.user.id,

            action: "REJECT",

            module: "Leave",

            recordId: leave.id,

            description:
                "Leave rejected by admin"

        });

        res.json({

            message: "Leave rejected",

            leave

        });


    } catch (error) {

        res.status(500).json({

            message: error.message

        });

    }

};

// ===============================
// PRESENT / ABSENT STATUS
// ===============================

exports.getAttendanceStatus = async (req, res) => {

    try {

        const today = getFactoryDate();


        const employees = await Employee.findAll({

            attributes: [

                "id",
                "name",
                "employeeCode"

            ],

            include: [

                {
                    model: Department,
                    attributes: ["name"]
                }

            ]

        });


        const attendance = await Attendance.findAll({

            where: {
                date: today
            },

            attributes: [
                "employeeId"
            ]

        });


        const presentIds = attendance.map(
            item => item.employeeId
        );


        const result = employees.map(employee => {


            return {

                id: employee.id,

                name: employee.name,

                department: employee.Department
                    ? employee.Department.name
                    : "Not Assigned",

                status:
                    presentIds.includes(employee.id)
                        ? "Present"
                        : "Absent"

            };


        });


        const presentCount = result.filter(
            emp => emp.status === "Present"
        ).length;


        const absentCount = result.filter(
            emp => emp.status === "Absent"
        ).length;



        res.json({
            filter: req.query,
            date: today,

            present: presentCount,

            absent: absentCount,

            employees: result

        });



    } catch (error) {


        res.status(500).json({

            message: error.message

        });


    }

};

// ===============================
// DEPARTMENT SUMMARY
// ===============================

exports.getDepartmentSummary = async (req, res) => {

    try {

        // ==========================================
        // TODAY'S DATE
        // ==========================================

        const today =
            new Date()
                .toISOString()
                .split("T")[0];


        // ==========================================
        // GET DEPARTMENTS + EMPLOYEES
        // ==========================================

        const departments =
            await Department.findAll({

                attributes: [
                    "id",
                    "name"
                ],

                include: [

                    {
                        model: Employee,

                        attributes: [
                            "id",
                            "name",
                            "email",
                            "employeeCode",
                            "role",
                            "status",
                            "deviceId"
                        ]

                    }

                ],

                order: [
                    ["name", "ASC"]
                ]

            });


        // ==========================================
        // BUILD DEPARTMENT ATTENDANCE
        // ==========================================

        const departmentData =
            await Promise.all(

                departments.map(
                    async (department) => {

                        const employees =
                            department.Employees || [];


                        // ==================================
                        // GET TODAY'S ATTENDANCE
                        // ==================================

                        const employeeIds =
                            employees.map(
                                employee =>
                                    employee.id
                            );


                        const attendanceRecords =
                            employeeIds.length > 0

                                ? await Attendance.findAll({

                                    where: {

                                        employeeId:
                                            employeeIds,

                                        date:
                                            today

                                    }

                                })

                                : [];


                        // ==================================
                        // ATTENDANCE MAP
                        // ==================================

                        const attendanceMap =
                            new Map(

                                attendanceRecords.map(
                                    attendance => [

                                        attendance.employeeId,

                                        attendance

                                    ]
                                )

                            );


                        // ==================================
                        // EMPLOYEE DATA
                        // ==================================

                        const employeeData =
                            employees.map(
                                employee => {

                                    const attendance =
                                        attendanceMap.get(
                                            employee.id
                                        );


                                    return {

                                        id:
                                            employee.id,

                                        name:
                                            employee.name,

                                        email:
                                            employee.email,

                                        employeeCode:
                                            employee.employeeCode,

                                        role:
                                            employee.role,

                                        status:
                                            employee.status,

                                        deviceId:
                                            employee.deviceId,

                                        attendanceStatus:
                                            attendance
                                                ? "present"
                                                : "absent",

                                        signInTime:
                                            attendance
                                                ?.signInTime ||
                                            null,

                                        signOutTime:
                                            attendance
                                                ?.signOutTime ||
                                            null

                                    };

                                }
                            );


                        // ==================================
                        // SUMMARY
                        // ==================================

                        const present =
                            employeeData.filter(
                                employee =>
                                    employee.attendanceStatus ===
                                    "present"
                            ).length;


                        const absent =
                            employeeData.filter(
                                employee =>
                                    employee.attendanceStatus ===
                                    "absent"
                            ).length;


                        const total =
                            employeeData.length;


                        const percentage =
                            total > 0

                                ? Number(
                                    (
                                        present /
                                        total *
                                        100
                                    ).toFixed(2)
                                )

                                : 0;


                        return {

                            department:
                                department.name,

                            totalEmployees:
                                total,

                            present,

                            absent,

                            attendancePercentage:
                                percentage,

                            employees:
                                employeeData

                        };

                    }

                )

            );


        // ==========================================
        // RESPONSE
        // ==========================================

        res.json({

            date:
                today,

            departments:
                departmentData

        });


    } catch (error) {

        console.error(
            "DEPARTMENT ATTENDANCE ERROR:",
            error
        );


        res.status(500).json({

            message:
                error.message

        });

    }

};
// ===============================
// MONTHLY / DAILY ATTENDANCE REPORT
// ===============================

exports.getAttendanceReport = async (req, res) => {

    try {

        const {
            type,
            month,
            startDate,
            endDate
        } = req.query;


        // ==========================================
        // TODAY
        // ==========================================

        const today =
            getFactoryDate();


        // ==========================================
        // GET EMPLOYEES
        // Admin account is excluded from attendance
        // reporting.
        // ==========================================

        const employees =
            await Employee.findAll({

                where: {

                    role: {
                        [Op.ne]: "admin"
                    }

                },

                attributes: [
                    "id",
                    "name",
                    "employeeCode"
                ],

                include: [

                    {
                        model: Department,

                        attributes: [
                            "name"
                        ]

                    }

                ],

                order: [
                    ["name", "ASC"]
                ]

            });


        // ==========================================
        // DATE RANGE
        // ==========================================

        let reportStartDate = null;
        let reportEndDate = null;
        let daysCounted = 0;


        // ==========================================
        // DAILY
        // ==========================================

        if (type === "daily") {

            reportStartDate = today;

            reportEndDate = today;

            daysCounted = 1;

        }


        // ==========================================
        // MONTHLY
        // ==========================================

        else if (
            type === "monthly" &&
            month
        ) {

            // Validate month

            if (!/^\d{4}-\d{2}$/.test(month)) {

                return res.status(400).json({

                    message:
                        "Month must be in YYYY-MM format"

                });

            }


            const [
                year,
                monthNumber
            ] =
                month
                    .split("-")
                    .map(Number);


            if (
                monthNumber < 1 ||
                monthNumber > 12
            ) {

                return res.status(400).json({

                    message:
                        "Invalid month"

                });

            }


            // Last day of selected month

            const lastDay =
                new Date(
                    year,
                    monthNumber,
                    0
                ).getDate();


            reportStartDate =
                `${year}-${String(monthNumber).padStart(2, "0")}-01`;


            const fullMonthEndDate =
                `${year}-${String(monthNumber).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;


            // Current month:
            // only count days that have happened

            if (
                month ===
                today.slice(0, 7)
            ) {

                reportEndDate = today;

                daysCounted =
                    Number(
                        today.slice(8, 10)
                    );

            }


            // Future month

            else if (
                month >
                today.slice(0, 7)
            ) {

                reportEndDate =
                    reportStartDate;

                daysCounted = 0;

            }


            // Previous month

            else {

                reportEndDate =
                    fullMonthEndDate;

                daysCounted =
                    lastDay;

            }

        }


        // ==========================================
        // DATE RANGE
        // ==========================================

        else if (
            startDate &&
            endDate
        ) {

            reportStartDate =
                startDate;

            reportEndDate =
                endDate;


            const start =
                new Date(
                    `${startDate}T00:00:00`
                );

            const end =
                new Date(
                    `${endDate}T00:00:00`
                );


            if (
                Number.isNaN(
                    start.getTime()
                ) ||
                Number.isNaN(
                    end.getTime()
                )
            ) {

                return res.status(400).json({

                    message:
                        "Invalid startDate or endDate"

                });

            }


            if (end < start) {

                return res.status(400).json({

                    message:
                        "endDate cannot be before startDate"

                });

            }


            daysCounted =
                Math.floor(
                    (
                        end.getTime() -
                        start.getTime()
                    ) /
                    (
                        1000 *
                        60 *
                        60 *
                        24
                    )
                ) + 1;

        }


        // ==========================================
        // NO FILTER
        // ==========================================

        else {

            // Default to today

            reportStartDate = today;

            reportEndDate = today;

            daysCounted = 1;

        }


        // ==========================================
        // FUTURE MONTH
        // ==========================================

        if (
            type === "monthly" &&
            month >
            today.slice(0, 7)
        ) {

            return res.json({

                filter: req.query,

                month,

                daysCounted: 0,

                totalEmployees:
                    employees.length,

                present:
                    0,

                absent:
                    0,

                attendancePercentage:
                    "0.00%",

                employees:
                    employees.map(
                        employee => ({

                            employeeCode:
                                employee.employeeCode,

                            name:
                                employee.name,

                            department:
                                employee.Department
                                    ? employee.Department.name
                                    : "Not Assigned",

                            daysCounted:
                                0,

                            presentDays:
                                0,

                            absentDays:
                                0,

                            attendancePercentage:
                                "0.00%",

                            status:
                                "No Data",

                            signInTime:
                                null,

                            signOutTime:
                                null,

                            workingHours:
                                null

                        })
                    )

            });

        }


        // ==========================================
        // GET ATTENDANCE RECORDS
        // ==========================================

        const attendanceRecords =
            await Attendance.findAll({

                where: {

                    date: {

                        [Op.between]: [

                            reportStartDate,

                            reportEndDate

                        ]

                    }

                },

                order: [

                    ["date", "ASC"]

                ]

            });


        // ==========================================
        // BUILD REPORT
        // ==========================================

        const report =
            employees.map(
                employee => {

                    const employeeRecords =
                        attendanceRecords.filter(
                            record =>
                                Number(
                                    record.employeeId
                                ) ===
                                Number(
                                    employee.id
                                )
                        );


                    // ---------------------------------
                    // UNIQUE PRESENT DAYS
                    // ---------------------------------

                    const uniqueDates =
                        new Set(

                            employeeRecords.map(
                                record =>
                                    String(
                                        record.date
                                    ).slice(0, 10)
                            )

                        );


                    const presentDays =
                        uniqueDates.size;


                    // ---------------------------------
                    // ABSENT DAYS
                    // ---------------------------------

                    const absentDays =
                        Math.max(
                            daysCounted -
                            presentDays,
                            0
                        );


                    // ---------------------------------
                    // PERCENTAGE
                    // ---------------------------------

                    const attendancePercentage =
                        daysCounted === 0

                            ? "0.00%"

                            :

                            (
                                (
                                    presentDays /
                                    daysCounted
                                ) *
                                100
                            ).toFixed(2) + "%";


                    // ---------------------------------
                    // LATEST RECORD
                    // ---------------------------------

                    const latestRecord =
                        employeeRecords.length > 0

                            ? employeeRecords[
                            employeeRecords.length - 1
                            ]

                            : null;


                    return {

                        employeeCode:
                            employee.employeeCode,

                        name:
                            employee.name,

                        department:
                            employee.Department
                                ? employee.Department.name
                                : "Not Assigned",

                        daysCounted,

                        presentDays,

                        absentDays,

                        attendancePercentage,

                        // Present if at least one
                        // attendance record exists.
                        status:
                            presentDays > 0
                                ? "Present"
                                : "Absent",

                        // Latest attendance record
                        // for display only.
                        signInTime:
                            latestRecord
                                ? latestRecord.signInTime
                                : null,

                        signOutTime:
                            latestRecord
                                ? latestRecord.signOutTime
                                : null,

                        workingHours:
                            latestRecord
                                ? latestRecord.workingHours
                                : null

                    };

                }
            );


        // ==========================================
        // OVERALL TOTALS
        // ==========================================

        const presentTotal =
            report.reduce(
                (
                    total,
                    employee
                ) =>
                    total +
                    employee.presentDays,
                0
            );


        const possibleAttendance =
            report.reduce(
                (
                    total,
                    employee
                ) =>
                    total +
                    employee.daysCounted,
                0
            );


        const absentTotal =
            report.reduce(
                (
                    total,
                    employee
                ) =>
                    total +
                    employee.absentDays,
                0
            );


        const overallPercentage =
            possibleAttendance === 0

                ? "0.00%"

                :

                (
                    (
                        presentTotal /
                        possibleAttendance
                    ) *
                    100
                ).toFixed(2) + "%";


        // ==========================================
        // RESPONSE
        // ==========================================

        return res.json({

            filter:
                req.query,

            date:
                today,

            reportStartDate,

            reportEndDate,

            month:
                month || null,

            daysCounted,

            totalEmployees:
                employees.length,

            present:
                presentTotal,

            absent:
                absentTotal,

            attendancePercentage:
                overallPercentage,

            employees:
                report

        });

    }

    catch (error) {

        console.error(
            "Attendance report error:",
            error
        );


        return res.status(500).json({

            message:
                error.message

        });

    }

};

// ===============================
// LEAVE REPORT
// ===============================

exports.getLeaveReport = async (req, res) => {

    try {


        const leaves = await Leave.findAll({

            include: [

                {
                    model: Employee,

                    attributes: [
                        "name",
                        "employeeCode"
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

            ],

            order: [

                ["createdAt", "DESC"]

            ]

        });



        const pending =
            leaves.filter(
                leave =>
                    leave.status === "pending"
            ).length;


        const approved =
            leaves.filter(
                leave =>
                    leave.status === "approved"
            ).length;


        const rejected =
            leaves.filter(
                leave =>
                    leave.status === "rejected"
            ).length;



        const report = leaves.map(leave => {


            return {

                employee:
                    leave.Employee
                        ? leave.Employee.name
                        : "Unknown",


                employeeCode:
                    leave.Employee
                        ? leave.Employee.employeeCode
                        : null,


                department:
                    leave.Employee &&
                        leave.Employee.Department
                        ? leave.Employee.Department.name
                        : "Not Assigned",


                leaveType:
                    leave.leaveType,


                startDate:
                    leave.startDate,


                endDate:
                    leave.endDate,


                status:
                    leave.status,


                adminComment:
                    leave.adminComment

            };


        });



        res.json({


            summary: {

                pending,

                approved,

                rejected

            },


            leaves: report


        });



    } catch (error) {


        res.status(500).json({

            message:
                error.message

        });


    }

};







// =====================================================
// COMPLETE ATTENDANCE REPORT DATA
// Used by CSV / Excel / PDF
// =====================================================

const getCompleteAttendanceReport = async (req) => {

    const employees = await Employee.findAll({

        attributes: [

            "id",
            "employeeCode",
            "name",
            "departmentId"

        ],

        include: [

            {

                model: Department,

                attributes: [
                    "name"
                ]

            }

        ],

        order: [

            ["name", "ASC"]

        ]

    });


    const attendanceRecords =
        await Attendance.findAll({

            where:
                getAttendanceFilter(req),

            order: [

                ["date", "DESC"]

            ]

        });


    const report =
        employees.map(employee => {

            const record =
                attendanceRecords.find(

                    attendance =>

                        Number(
                            attendance.employeeId
                        ) ===
                        Number(
                            employee.id
                        )

                );


            return {

                employeeCode:
                    employee.employeeCode || "",

                employeeName:
                    employee.name || "",

                department:
                    employee.Department
                        ? employee.Department.name
                        : "Not Assigned",

                status:
                    record
                        ? "Present"
                        : "Absent",

                signIn:
                    record
                        ? formatTime(
                            record.signInTime
                        )
                        : "",

                signOut:
                    record
                        ? formatTime(
                            record.signOutTime
                        )
                        : "",

                workingHours:
                    record
                        ? record.workingHours || ""
                        : ""

            };

        });


    return report;

};


// ===============================
// EXPORT ATTENDANCE CSV
// ===============================

exports.exportAttendanceCSV = async (req, res) => {

    try {

        const report =
            await getCompleteAttendanceReport(req);


        const fields = [

            "employeeCode",
            "employeeName",
            "department",
            "status",
            "signIn",
            "signOut",
            "workingHours"

        ];


        const parser =
            new Parser({

                fields,

                header: true

            });


        const csv =
            parser.parse(report);


        res.setHeader(
            "Content-Type",
            "text/csv"
        );


        res.setHeader(
            "Content-Disposition",
            "attachment; filename=attendance-report.csv"
        );


        return res.send(csv);


    } catch (error) {

        console.error(
            "CSV export error:",
            error
        );


        return res.status(500).json({

            message:
                error.message

        });

    }

};



// ===============================
// EXPORT ATTENDANCE EXCEL
// ===============================

exports.exportAttendanceExcel = async (req, res) => {

    try {

        const report =
            await getCompleteAttendanceReport(req);


        const workbook =
            new ExcelJS.Workbook();


        const worksheet =
            workbook.addWorksheet(
                "Attendance Report"
            );


        worksheet.columns = [

            {
                header: "Employee Code",
                key: "employeeCode",
                width: 18
            },

            {
                header: "Employee Name",
                key: "employeeName",
                width: 25
            },

            {
                header: "Department",
                key: "department",
                width: 22
            },

            {
                header: "Status",
                key: "status",
                width: 15
            },

            {
                header: "Sign In",
                key: "signIn",
                width: 18
            },

            {
                header: "Sign Out",
                key: "signOut",
                width: 18
            },

            {
                header: "Working Hours",
                key: "workingHours",
                width: 20
            }

        ];


        report.forEach(employee => {

            worksheet.addRow(employee);

        });


        worksheet.getRow(1).font = {

            bold: true

        };


        worksheet.autoFilter = {

            from: "A1",

            to: "G1"

        };


        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );


        res.setHeader(
            "Content-Disposition",
            "attachment; filename=attendance-report.xlsx"
        );


        await workbook.xlsx.write(res);

        return res.end();


    } catch (error) {

        console.error(
            "Excel export error:",
            error
        );


        if (!res.headersSent) {

            return res.status(500).json({

                message:
                    error.message

            });

        }

    }

};



// ===============================
// EXPORT ATTENDANCE PDF
// ===============================

exports.exportAttendancePDF = async (req, res) => {

    try {

        const report =
            await getCompleteAttendanceReport(req);


        const doc =
            new PDFDocument({

                margin: 30,

                size: "A4",

                layout: "landscape"

            });


        res.setHeader(
            "Content-Type",
            "application/pdf"
        );


        res.setHeader(
            "Content-Disposition",
            "attachment; filename=attendance-report.pdf"
        );


        doc.pipe(res);


        // =============================================
        // TITLE
        // =============================================

        doc
            .fontSize(18)
            .text(
                "WorkTrac Attendance Report",
                {
                    align: "center"
                }
            );


        doc.moveDown();


        // =============================================
        // FILTER
        // =============================================

        const filter =
            req.query;


        let filterText =
            "Attendance Report";


        if (filter.type === "daily") {

            filterText =
                `Daily Attendance: ${filter.date || "Today"
                }`;

        }

        else if (
            filter.type === "monthly" &&
            filter.month
        ) {

            filterText =
                `Monthly Attendance: ${filter.month
                }`;

        }

        else if (
            filter.startDate &&
            filter.endDate
        ) {

            filterText =
                `Attendance: ${filter.startDate
                } to ${filter.endDate
                }`;

        }


        doc
            .fontSize(10)
            .text(
                filterText,
                {
                    align: "center"
                }
            );


        doc.moveDown();


        // =============================================
        // SUMMARY
        // =============================================

        const presentCount =
            report.filter(
                employee =>
                    employee.status === "Present"
            ).length;


        const absentCount =
            report.filter(
                employee =>
                    employee.status === "Absent"
            ).length;


        doc
            .fontSize(10)
            .text(
                `Total Employees: ${report.length}    ` +
                `Present: ${presentCount}    ` +
                `Absent: ${absentCount}`
            );


        doc.moveDown();


        // =============================================
        // TABLE
        // =============================================

        const columns = [

            {
                title: "Employee Code",
                width: 90
            },

            {
                title: "Employee Name",
                width: 120
            },

            {
                title: "Department",
                width: 110
            },

            {
                title: "Status",
                width: 70
            },

            {
                title: "Sign In",
                width: 85
            },

            {
                title: "Sign Out",
                width: 85
            },

            {
                title: "Working Hours",
                width: 100
            }

        ];


        let y =
            doc.y;


        const drawHeader = () => {

            let x = 30;


            doc
                .fontSize(8)
                .font("Helvetica-Bold");


            columns.forEach(column => {

                doc.text(
                    column.title,
                    x,
                    y,
                    {
                        width:
                            column.width
                    }
                );


                x +=
                    column.width;

            });


            y += 20;


            doc.font("Helvetica");

        };


        drawHeader();


        // =============================================
        // ROWS
        // =============================================

        report.forEach(employee => {

            if (y > 550) {

                doc.addPage();

                y = 30;

                drawHeader();

            }


            const values = [

                employee.employeeCode ||
                "—",

                employee.employeeName ||
                "—",

                employee.department ||
                "Not Assigned",

                employee.status ||
                "—",

                employee.signIn ||
                "—",

                employee.signOut ||
                "—",

                employee.workingHours ||
                "—"

            ];


            let rowX = 30;


            values.forEach(
                (value, index) => {

                    doc.text(
                        String(value),
                        rowX,
                        y,
                        {
                            width:
                                columns[index]
                                    .width
                        }
                    );


                    rowX +=
                        columns[index]
                            .width;

                }

            );


            y += 20;

        });


        doc.end();


    } catch (error) {

        console.error(
            "PDF export error:",
            error
        );


        if (!res.headersSent) {

            return res.status(500).json({

                message:
                    error.message

            });

        }

    }

};

// ===============================
// EMPLOYEE ATTENDANCE PERCENTAGE
// ===============================

exports.getEmployeeAttendancePercentage = async (req, res) => {

    try {

        const today = getFactoryDate();

        const month =
            req.query.month ||
            today.slice(0, 7);


        if (!/^\d{4}-\d{2}$/.test(month)) {

            return res.status(400).json({

                message:
                    "Month must be in YYYY-MM format"

            });

        }


        const [year, monthNumber] =
            month.split("-").map(Number);


        const lastDay =
            new Date(
                year,
                monthNumber,
                0
            ).getDate();


        let daysCounted = lastDay;


        if (month === today.slice(0, 7)) {

            daysCounted =
                Number(today.slice(8, 10));

        }


        if (month > today.slice(0, 7)) {

            daysCounted = 0;

        }


        const employees =
            await Employee.findAll({

                where: {

                    role: {
                        [Op.ne]: "admin"
                    }

                },

                attributes: [

                    "id",
                    "name",
                    "employeeCode"

                ],

                order: [

                    ["name", "ASC"]

                ]

            });


        const startDate =
            `${month}-01`;


        const endDate =
            `${month}-${String(lastDay).padStart(2, "0")}`;


        const attendance =
            await Attendance.findAll({

                where: {

                    date: {

                        [Op.between]: [

                            startDate,
                            endDate

                        ]

                    }

                },

                attributes: [

                    "employeeId",
                    "date"

                ]

            });


        const result =
            employees.map(employee => {

                const employeeRecords =
                    attendance.filter(record =>

                        Number(record.employeeId) ===
                        Number(employee.id)

                    );


                const uniqueDates =
                    new Set(

                        employeeRecords.map(record =>
                            String(record.date)
                                .slice(0, 10)
                        )

                    );


                const present =
                    uniqueDates.size;


                const absent =
                    Math.max(
                        daysCounted - present,
                        0
                    );


                const percentage =
                    daysCounted === 0
                        ? "0%"
                        :
                        (
                            (present / daysCounted) *
                            100
                        ).toFixed(2) + "%";


                return {

                    name:
                        employee.name,

                    employeeCode:
                        employee.employeeCode,

                    present,

                    absent,

                    percentage

                };

            });


        return res.json({

            month,

            daysCounted,

            employees:
                result

        });


    } catch (error) {

        console.error(
            "Employee attendance percentage error:",
            error
        );


        return res.status(500).json({

            message:
                error.message

        });

    }

};


// ===============================
// AUDIT LOGGER HELPER
// ===============================

const createAuditLog = async ({
    userId,
    action,
    module,
    recordId,
    description
}) => {

    try {

        await AuditLog.create({

            userId,

            action,

            module,

            recordId,

            description

        });

    } catch (error) {

        console.log(
            "Audit log error:",
            error.message
        );

    }

};

// ===============================
// ACTIVATE EMPLOYEE
// ===============================

exports.activateEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByPk(req.params.id);

        if (!employee) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        // 🛡️ SECURITY: Superior cannot be deactivated/activated by anyone (keeps it always active)
        if (employee.role === "superior") {
            return res.status(403).json({
                message: "Superior Admin status cannot be modified."
            });
        }

        // 🛡️ SECURITY: Admin cannot modify another Admin
        if (employee.role === "admin" && req.user.role === "admin") {
            return res.status(403).json({
                message: "Admin cannot modify another Admin's status."
            });
        }

        await employee.update({ status: "active" });

        await createAuditLog({
            userId: req.user.id,
            action: "ACTIVATE",
            module: "Employee",
            recordId: employee.id,
            description: `Employee ${employee.name} activated`
        });

        res.json({
            message: "Employee activated successfully",
            status: employee.status
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};




// ===============================
// DEACTIVATE EMPLOYEE
// ===============================

exports.deactivateEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByPk(req.params.id);

        if (!employee) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        // 🛡️ SECURITY: Superior cannot be deactivated/activated by anyone
        if (employee.role === "superior") {
            return res.status(403).json({
                message: "Superior Admin status cannot be modified."
            });
        }

        // 🛡️ SECURITY: Admin cannot modify another Admin
        if (employee.role === "admin" && req.user.role === "admin") {
            return res.status(403).json({
                message: "Admin cannot modify another Admin's status."
            });
        }

        await employee.update({ status: "inactive" });

        await createAuditLog({
            userId: req.user.id,
            action: "DEACTIVATE",
            module: "Employee",
            recordId: employee.id,
            description: `Employee ${employee.name} deactivated`
        });

        res.json({
            message: "Employee deactivated successfully",
            status: employee.status
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// ===============================
// EMPLOYEE PROFILE
// ===============================

exports.getEmployeeProfile = async (req, res) => {

    try {

        const employeeId = req.params.id;


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
                    "createdAt",
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

                message: "Employee not found"

            });

        }



        const attendance = await Attendance.findAll({

            where: {
                employeeId
            },

            order: [
                ["date", "DESC"]
            ],

            limit: 10

        });



        const totalAttendance =
            await Attendance.count({

                where: {
                    employeeId
                }

            });



        const leaves = await Leave.findAll({

            where: {
                employeeId
            },

            order: [
                ["createdAt", "DESC"]
            ],

            limit: 10

        });



        const leaveSummary = {

            total:
                await Leave.count({
                    where: {
                        employeeId
                    }
                }),

            pending:
                await Leave.count({
                    where: {
                        employeeId,
                        status: "pending"
                    }
                }),

            approved:
                await Leave.count({
                    where: {
                        employeeId,
                        status: "approved"
                    }
                }),

            rejected:
                await Leave.count({
                    where: {
                        employeeId,
                        status: "rejected"
                    }
                })

        };



        res.json({

            employee,

            attendanceSummary: {

                totalRecords:
                    totalAttendance

            },

            recentAttendance:
                attendance,

            leaveSummary,

            recentLeaves:
                leaves

        });



    } catch (error) {

        res.status(500).json({

            message: error.message

        });

    }

};

// ===============================
// DEPARTMENT ATTENDANCE SUMMARY
// ===============================

exports.getDepartmentAttendanceSummary = async (req, res) => {

    try {

        const today = getFactoryDate();


        const departments = await Department.findAll({

            include: [

                {
                    model: Employee,

                    attributes: [
                        "id"
                    ]

                }

            ]

        });



        const attendance = await Attendance.findAll({

            where: {

                date: today

            },

            attributes: [

                "employeeId"

            ]

        });



        const presentIds = attendance.map(
            item => item.employeeId
        );



        const summary = departments.map(department => {


            const employees =
                department.Employees || [];



            const totalEmployees =
                employees.length;



            const present =
                employees.filter(employee =>
                    presentIds.includes(employee.id)
                ).length;



            const absent =
                totalEmployees - present;



            const percentage =
                totalEmployees === 0
                    ? 0
                    :
                    ((present / totalEmployees) * 100)
                        .toFixed(2);



            return {

                department:
                    department.name,


                totalEmployees,


                present,


                absent,


                attendancePercentage:
                    percentage + "%"

            };


        });



        res.json({

            date: today,

            departments: summary

        });



    } catch (error) {


        res.status(500).json({

            message: error.message

        });


    }

};

// ===============================
// LATE ARRIVAL REPORT
// ===============================

exports.getLateAttendance = async (req, res) => {

    try {

        const today = getFactoryDate();


        const lateTime = "09:30:00";


        const attendance = await Attendance.findAll({

            where: {

                date: today

            },

            include: [

                {

                    model: Employee,

                    attributes: [

                        "name",
                        "employeeCode"

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

            ],

            order: [

                ["signInTime", "ASC"]

            ]

        });



        const lateEmployees = attendance.filter(record => {


            const signIn =
                new Date(record.signInTime)
                    .toLocaleTimeString(
                        "en-IN",
                        {
                            hour12: false
                        }
                    );


            return signIn > lateTime;


        });



        const result = lateEmployees.map(record => {


            return {

                employee:
                    record.Employee?.name || "",


                employeeCode:
                    record.Employee?.employeeCode || "",


                department:
                    record.Employee?.Department?.name
                    || "Not Assigned",


                signInTime:
                    formatTime(record.signInTime),


                status:
                    "Late"

            };


        });



        res.json({

            date: today,

            lateAfter:
                "09:30 AM",

            count:
                result.length,

            employees:
                result

        });



    } catch (error) {


        res.status(500).json({

            message: error.message

        });


    }

};

// ===============================
// DEPARTMENT PERFORMANCE
// ===============================

exports.getDepartmentPerformance = async (req, res) => {

    try {

        const today = getFactoryDate();

        const departments = await Department.findAll({

            attributes: [
                "id",
                "name"
            ],

            include: [
                {
                    model: Employee,
                    attributes: [
                        "id"
                    ]
                }
            ]

        });



        const attendance = await Attendance.findAll({

            where: {
                date: today
            },

            attributes: [
                "employeeId"
            ]

        });



        const presentIds = attendance.map(
            item => item.employeeId
        );



        const result = departments.map(department => {


            const employeeIds =
                department.Employees.map(
                    emp => emp.id
                );


            const present =
                employeeIds.filter(
                    id => presentIds.includes(id)
                ).length;


            const total =
                employeeIds.length;


            const absent =
                total - present;



            return {

                department:
                    department.name,

                employees:
                    total,

                present,

                absent,

                attendancePercentage:
                    total === 0
                        ? "0%"
                        :
                        ((present / total) * 100)
                            .toFixed(2) + "%"

            };


        });



        res.json({

            date: today,

            departments: result

        });



    } catch (error) {

        res.status(500).json({

            message: error.message

        });

    }

};




// =====================================================
// DAILY ATTENDANCE - ALL EMPLOYEES
// =====================================================

// =====================================================
// DAILY ATTENDANCE - ALL EMPLOYEES
// =====================================================

exports.getDailyAttendanceReport = async (req, res) => {
    try {

        // Use ?date=2026-08-11 if supplied,
        // otherwise use today's date
        const date =
            req.query.date ||
            getFactoryDate();

        // Get ALL employees
        const employees = await Employee.findAll({
            where: {
                role: {
                    [Op.ne]: "admin"
                }
            },
            attributes: [
                "id",
                "employeeCode",
                "name",
                "departmentId"
            ],
            include: [
                {
                    model: Department,
                    attributes: [
                        "name"
                    ]
                }
            ],
            order: [
                ["employeeCode", "ASC"]
            ]
        });

        // Get attendance for selected date
        const attendanceRecords =
            await Attendance.findAll({
                where: {
                    date: date
                },
                order: [
                    ["signInTime", "ASC"]
                ]
            });

        // Create employee attendance report
        const report = employees.map(employee => {

            const attendance =
                attendanceRecords.find(
                    record =>
                        Number(record.employeeId) ===
                        Number(employee.id)
                );

            return {

                employeeCode:
                    employee.employeeCode,

                employeeName:
                    employee.name,

                department:
                    employee.Department
                        ? employee.Department.name
                        : "Not Assigned",

                status:
                    attendance
                        ? "Present"
                        : "Absent",

                signIn:
                    attendance
                        ? formatTime(attendance.signInTime)
                        : null,

                signOut:
                    attendance
                        ? formatTime(attendance.signOutTime)
                        : null,

                workingHours:
                    attendance
                        ? attendance.workingHours
                        : null,

                deviceId:
                    attendance
                        ? attendance.deviceId
                        : null,

                signInLatitude:
                    attendance
                        ? attendance.signInLatitude
                        : null,

                signInLongitude:
                    attendance
                        ? attendance.signInLongitude
                        : null,

                signOutLatitude:
                    attendance
                        ? attendance.signOutLatitude
                        : null,

                signOutLongitude:
                    attendance
                        ? attendance.signOutLongitude
                        : null

            };

        });

        const present =
            report.filter(
                employee =>
                    employee.status === "Present"
            ).length;

        const absent =
            report.filter(
                employee =>
                    employee.status === "Absent"
            ).length;

        res.json({

            date,

            summary: {

                totalEmployees:
                    employees.length,

                present,

                absent,

                attendancePercentage:
                    employees.length === 0
                        ? "0%"
                        : (
                            (present / employees.length) *
                            100
                        ).toFixed(2) + "%"

            },

            employees: report

        });

    } catch (error) {

        console.error(
            "Daily attendance report error:",
            error
        );

        res.status(500).json({
            message: error.message
        });

    }
};



// =====================================================
// EMPLOYEE-WISE MONTHLY ATTENDANCE
// =====================================================

exports.getEmployeeMonthlyAttendance = async (req, res) => {

    try {

        const employeeId = req.params.employeeId;

        const today = getFactoryDate();

        const month =
            req.query.month ||
            today.slice(0, 7);


        // =============================================
        // VALIDATE EMPLOYEE ID
        // =============================================

        if (!employeeId) {

            return res.status(400).json({

                message: "Employee ID is required"

            });

        }


        // =============================================
        // VALIDATE MONTH
        // =============================================

        if (!/^\d{4}-\d{2}$/.test(month)) {

            return res.status(400).json({

                message:
                    "Month must be in YYYY-MM format"

            });

        }


        const [year, monthNumber] =
            month.split("-").map(Number);


        if (
            monthNumber < 1 ||
            monthNumber > 12
        ) {

            return res.status(400).json({

                message: "Invalid month"

            });

        }


        // =============================================
        // GET EMPLOYEE
        // =============================================

        const employee =
            await Employee.findByPk(

                employeeId,

                {

                    attributes: [

                        "id",
                        "employeeCode",
                        "name",
                        "email",
                        "role",
                        "status",
                        "departmentId"

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

                message: "Employee not found"

            });

        }


        // =============================================
        // MONTH DATE RANGE
        // =============================================

        const lastDay =
            new Date(
                year,
                monthNumber,
                0
            ).getDate();


        const startDate =
            `${year}-${String(monthNumber).padStart(2, "0")}-01`;


        const endDate =
            `${year}-${String(monthNumber).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;


        // =============================================
        // DAYS THAT SHOULD BE COUNTED
        // =============================================

        let daysCounted = lastDay;


        // Current month:
        // only count dates that have occurred

        if (month === today.slice(0, 7)) {

            daysCounted =
                Number(today.slice(8, 10));

        }


        // =============================================
        // FUTURE MONTH
        // =============================================

        if (month > today.slice(0, 7)) {

            daysCounted = 0;

        }


        // =============================================
        // GET ATTENDANCE
        // =============================================

        const attendance =
            await Attendance.findAll({

                where: {

                    employeeId,

                    date: {

                        [Op.between]: [

                            startDate,
                            endDate

                        ]

                    }

                },

                order: [

                    ["date", "ASC"]

                ],

                attributes: [

                    "id",
                    "employeeId",
                    "date",
                    "signInTime",
                    "signOutTime",
                    "workingHours",
                    "deviceId",
                    "signInLatitude",
                    "signInLongitude",
                    "signOutLatitude",
                    "signOutLongitude"

                ]

            });


        // =============================================
        // PRESENT DAYS
        // =============================================

        const presentDays =
            attendance.length;


        // =============================================
        // ABSENT DAYS
        // =============================================

        const absentDays =
            Math.max(
                daysCounted - presentDays,
                0
            );


        // =============================================
        // ATTENDANCE PERCENTAGE
        // =============================================

        const attendancePercentage =
            daysCounted === 0
                ? "0%"
                :
                (
                    (presentDays / daysCounted) *
                    100
                ).toFixed(2) + "%";


        // =============================================
        // DAILY RECORDS
        // =============================================

        const dailyAttendance =
            attendance.map(record => ({

                date:
                    record.date,

                status:
                    "Present",

                signIn:
                    formatTime(
                        record.signInTime
                    ),

                signOut:
                    formatTime(
                        record.signOutTime
                    ),

                workingHours:
                    record.workingHours || null,

                deviceId:
                    record.deviceId || null,

                signInLatitude:
                    record.signInLatitude,

                signInLongitude:
                    record.signInLongitude,

                signOutLatitude:
                    record.signOutLatitude,

                signOutLongitude:
                    record.signOutLongitude

            }));


        // =============================================
        // RESPONSE
        // =============================================

        return res.json({

            employee: {

                id:
                    employee.id,

                employeeCode:
                    employee.employeeCode,

                name:
                    employee.name,

                email:
                    employee.email,

                role:
                    employee.role,

                status:
                    employee.status,

                department:
                    employee.Department
                        ? employee.Department.name
                        : "Not Assigned"

            },


            month,


            summary: {

                totalDays:
                    lastDay,

                daysCounted,

                presentDays,

                absentDays,

                attendancePercentage

            },


            attendance:
                dailyAttendance

        });


    } catch (error) {

        console.error(
            "Employee monthly attendance error:",
            error
        );


        return res.status(500).json({

            message:
                error.message

        });

    }

};
// ===============================
// ATTENDANCE REGISTER (SINGLE API CALL)
// ===============================

exports.getAttendanceRegister = async (req, res) => {
  try {
    const today = getFactoryDate();
    const month = req.query.month || today.slice(0, 7);

    // Validate month format
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({
        message: "Month must be in YYYY-MM format"
      });
    }

    const [year, monthNumber] = month.split("-").map(Number);
    if (monthNumber < 1 || monthNumber > 12) {
      return res.status(400).json({ message: "Invalid month" });
    }

    // Last day of month
    const lastDay = new Date(year, monthNumber, 0).getDate();
    const startDate = `${month}-01`;
    const endDate = `${month}-${String(lastDay).padStart(2, "0")}`;

    // Get all employees (including admin for register view)
    const employees = await Employee.findAll({
      attributes: [
        "id", "employeeCode", "name", "departmentId",
        "mobileNumber", "scheme"
      ],
      include: [{ model: Department, attributes: ["name"] }],
      order: [["employeeCode", "ASC"]]
    });

    if (!employees || employees.length === 0) {
      return res.json({
        month,
        totalEmployees: 0,
        employees: []
      });
    }

    // Get ALL attendance records for this month
    const attendanceRecords = await Attendance.findAll({
      where: {
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      attributes: ["employeeId", "date"]
    });

    // Build lookup map: employeeId -> { date: "P" }
    const attendanceMap = {};
    attendanceRecords.forEach(record => {
      const empId = record.employeeId;
      if (!attendanceMap[empId]) attendanceMap[empId] = {};
      attendanceMap[empId][record.date] = "P";
    });

    // Generate the full register with Absent ("A") for past days without attendance
    const register = employees.map(emp => {
      const empAttendance = attendanceMap[emp.id] || {};
      const fullAttendance = {};

      // Loop through each day of the month
      for (let d = 1; d <= lastDay; d++) {
        const dayStr = String(d).padStart(2, "0");
        const dateKey = `${month}-${dayStr}`;

        if (empAttendance[dateKey]) {
          // Present
          fullAttendance[dateKey] = "P";
        } else {
          // Check if this day is in the past (including today)
          const dateObj = new Date(`${dateKey}T00:00:00`);
          const todayObj = new Date(`${today}T00:00:00`);
          // Compare dates (ignore time)
          if (dateObj < todayObj) {
            // Past day – mark as Absent
            fullAttendance[dateKey] = "A";
          } else {
            // Today or future – keep as no record
            fullAttendance[dateKey] = "";
          }
        }
      }

      return {
        id: emp.id,
        employeeCode: emp.employeeCode,
        name: emp.name,
        department: emp.Department ? emp.Department.name : "Not Assigned",
        mobileNumber: emp.mobileNumber || "—",
        scheme: emp.scheme || "—",
        attendance: fullAttendance
      };
    });

    res.json({
      month,
      totalEmployees: employees.length,
      employees: register
    });

  } catch (error) {
    console.error("ATTENDANCE REGISTER ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};