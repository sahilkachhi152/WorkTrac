const Employee = require("../models/Employee");
const Department = require("../models/Department");
const Attendance = require("../models/Attendance");
const Leave = require("../models/Leave");
const {
    getFactoryDate
} = require("../utils/shiftUtils");


// ===============================
// DASHBOARD ANALYTICS
// ===============================

exports.getAttendanceAnalytics = async (req, res) => {

    try {

        const today = getFactoryDate();


        const totalEmployees = await Employee.count();


        const presentToday = await Attendance.count({

            where: {

                date: today

            }

        });


        const absentToday =
            totalEmployees - presentToday;


        const attendanceRate =
            totalEmployees === 0
                ? 0
                :
                Number(
                    (
                        (presentToday / totalEmployees) * 100
                    ).toFixed(2)
                );


        const totalAttendanceRecords =
            await Attendance.count();



        const pendingLeaves = await Leave.count({

            where: {

                status: "pending"

            }

        });


        const approvedLeaves = await Leave.count({

            where: {

                status: "approved"

            }

        });


        const rejectedLeaves = await Leave.count({

            where: {

                status: "rejected"

            }

        });



        res.json({

            date: today,


            overview: {

                totalEmployees,

                presentToday,

                absentToday,

                attendanceRate,

                totalAttendanceRecords

            },


            leaves: {

                pending: pendingLeaves,

                approved: approvedLeaves,

                rejected: rejectedLeaves

            }

        });


    }

    catch(error){

        res.status(500).json({

            message:error.message

        });

    }

};




// ===============================
// MONTHLY ATTENDANCE SUMMARY
// ===============================

exports.getMonthlyAttendanceSummary = async (req,res)=>{

    try {


        const month =
            req.query.month ||
            new Date()
            .toISOString()
            .slice(0,7);



        const employees =
            await Employee.count();



        const attendance =
            await Attendance.findAll();



        const monthlyAttendance =
            attendance.filter(record =>
                record.date.startsWith(month)
            );



        const present =
            monthlyAttendance.length;



        const [year, monthNumber] =
            month.split("-");



        const daysInMonth =
            new Date(
                Number(year),
                Number(monthNumber),
                0
            ).getDate();



        const totalPossibleAttendance =
            employees * daysInMonth;



        const attendancePercentage =
            totalPossibleAttendance === 0
                ?
                0
                :
                Number(
                    (
                        (present /
                        totalPossibleAttendance)
                        *
                        100
                    ).toFixed(2)
                );



        res.json({

            month,

            totalEmployees: employees,

            present,

            absent:
                totalPossibleAttendance - present,

            attendancePercentage


        });



    }

    catch(error){

        res.status(500).json({

            message:error.message

        });

    }

};





// ===============================
// DEPARTMENT ATTENDANCE ANALYTICS
// ===============================

exports.getDepartmentAttendanceAnalytics = async (req,res)=>{


    try {


        const today = getFactoryDate();



        const departments =
            await Department.findAll({

                include:[

                    {

                        model:Employee,

                        attributes:[
                            "id"
                        ]

                    }

                ]

            });



        const attendance =
            await Attendance.findAll({

                where:{

                    date:today

                }

            });



        const result =
            departments.map(department=>{


                const employeeIds =
                    department.Employees.map(
                        emp=>emp.id
                    );



                const present =
                    attendance.filter(record =>
                        employeeIds.includes(
                            record.employeeId
                        )
                    ).length;



                const totalEmployees =
                    employeeIds.length;



                const percentage =
                    totalEmployees === 0
                    ?
                    0
                    :
                    Number(
                        (
                            (present /
                            totalEmployees)
                            *
                            100
                        ).toFixed(2)
                    );



                return {

                    department:
                        department.name,

                    totalEmployees,

                    present,

                    absent:
                        totalEmployees - present,

                    attendancePercentage:
                        percentage

                };


            });



        res.json({

            date:today,

            departments:result

        });



    }

    catch(error){

        res.status(500).json({

            message:error.message

        });

    }

};


// ===============================
// TOP ATTENDANCE EMPLOYEES
// ===============================

exports.getTopAttendanceEmployees = async (req,res)=>{

    try {

        const totalWorkingDays =
            Number(req.query.days) || 30;


        const employees =
            await Employee.findAll();


        const attendance =
            await Attendance.findAll();



        const result =
            employees.map(employee=>{


                const presentDays =
                    attendance.filter(record =>
                        record.employeeId === employee.id
                    ).length;



                const percentage =
                    totalWorkingDays === 0
                    ?
                    0
                    :
                    Number(
                        (
                            (presentDays /
                            totalWorkingDays)
                            *
                            100
                        ).toFixed(2)
                    );


                return {

                    name: employee.name,

                    employeeCode:
                        employee.employeeCode,

                    presentDays,

                    attendancePercentage:
                        percentage

                };


            });



        result.sort(
            (a,b)=>
                b.attendancePercentage -
                a.attendancePercentage
        );


        res.json({

            employees:
                result.slice(0,10)

        });


    }
    catch(error){

        res.status(500).json({

            message:error.message

        });

    }

};





// ===============================
// LATE ARRIVALS
// ===============================

exports.getLateArrivals = async (req,res)=>{

    try {


        const attendance =
            await Attendance.findAll({

                include:[

                    {
                        model:Employee,

                        attributes:[
                            "name",
                            "employeeCode"
                        ]

                    }

                ]

            });



        const lateEmployees =
            attendance.filter(record=>{


                const signIn =
                    new Date(record.signInTime);



                const officeTime =
                    new Date(record.signInTime);



                officeTime.setHours(
                    9,
                    0,
                    0,
                    0
                );


                return signIn > officeTime;


            }).map(record=>{


                return {

                    name:
                        record.Employee.name,


                    employeeCode:
                        record.Employee.employeeCode,


                    date:
                        record.date,


                    signInTime:
                        record.signInTime

                };


            });



        res.json({

            lateEmployees

        });


    }
    catch(error){

        res.status(500).json({

            message:error.message

        });

    }

};





// ===============================
// EARLY CHECKOUT
// ===============================

exports.getEarlyCheckout = async(req,res)=>{


    try {


        const attendance =
            await Attendance.findAll({

                where:{

                    signOutTime:{
                        [require("sequelize").Op.ne]:null
                    }

                },

                include:[

                    {

                        model:Employee,

                        attributes:[
                            "name",
                            "employeeCode"
                        ]

                    }

                ]

            });



        const earlyCheckout =
            attendance.filter(record=>{


                const signOut =
                    new Date(record.signOutTime);



                const closingTime =
                    new Date(record.signOutTime);



                closingTime.setHours(
                    18,
                    0,
                    0,
                    0
                );



                return signOut < closingTime;


            }).map(record=>{


                return {

                    name:
                        record.Employee.name,


                    employeeCode:
                        record.Employee.employeeCode,


                    date:
                        record.date,


                    signOutTime:
                        record.signOutTime


                };


            });



        res.json({

            earlyCheckout

        });


    }

    catch(error){

        res.status(500).json({

            message:error.message

        });

    }

};





// ===============================
// ABSENCE RANKING
// ===============================

exports.getAbsenceRanking = async(req,res)=>{


    try {


        const employees =
            await Employee.findAll();


        const attendance =
            await Attendance.findAll();



        const days =
            Number(req.query.days) || 30;



        const result =
            employees.map(employee=>{


                const present =
                    attendance.filter(record=>

                        record.employeeId === employee.id

                    ).length;



                return {

                    name:
                        employee.name,


                    employeeCode:
                        employee.employeeCode,


                    absentDays:
                        days - present


                };


            });



        result.sort(
            (a,b)=>
                b.absentDays -
                a.absentDays
        );



        res.json({

            employees:result

        });


    }

    catch(error){

        res.status(500).json({

            message:error.message

        });

    }

};


// ===============================
// ATTENDANCE PERFORMANCE SUMMARY
// ===============================

exports.getAttendancePerformance = async (req,res)=>{

    try {


        const days =
            Number(req.query.days) || 30;


        const startDate = new Date();

        startDate.setDate(
            startDate.getDate() - days
        );


        const employees =
            await Employee.findAll();



        const attendance =
            await Attendance.findAll();



        const filteredAttendance =
            attendance.filter(record =>
                new Date(record.date) >= startDate
            );



        const employeePerformance =
            employees.map(employee=>{


                const records =
                    filteredAttendance.filter(record =>
                        record.employeeId === employee.id
                    );


                return {

                    name:
                        employee.name,

                    employeeCode:
                        employee.employeeCode,

                    presentDays:
                        records.length,

                    attendancePercentage:
                        Number(
                            (
                                (records.length / days)
                                *
                                100
                            ).toFixed(2)
                        )

                };


            });



        const lateCount =
            filteredAttendance.filter(record=>{


                const signIn =
                    new Date(record.signInTime);


                const office =
                    new Date(record.date);


                office.setHours(
                    9,
                    0,
                    0,
                    0
                );


                return signIn > office;


            }).length;



        const earlyCheckoutCount =
            filteredAttendance.filter(record=>{


                if(!record.signOutTime)
                    return false;


                const signOut =
                    new Date(record.signOutTime);


                const office =
                    new Date(record.date);


                office.setHours(
                    18,
                    0,
                    0,
                    0
                );


                return signOut < office;


            }).length;



        employeePerformance.sort(
            (a,b)=>
            b.attendancePercentage -
            a.attendancePercentage
        );



        res.json({

            period:
                `${days} days`,


            summary:{

                totalEmployees:
                    employees.length,


                lateArrivals:
                    lateCount,


                earlyCheckout:
                    earlyCheckoutCount

            },


            topEmployees:
                employeePerformance.slice(0,5),


            attendanceRanking:
                employeePerformance


        });



    }
    catch(error){

        res.status(500).json({

            message:error.message

        });

    }

};