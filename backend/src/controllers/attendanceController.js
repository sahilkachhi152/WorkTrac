const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");
const {
    getFactoryDate
} = require("../utils/shiftUtils");


// ===============================
// EMPLOYEE SIGN IN
// ===============================

// ===============================
// EMPLOYEE SIGN IN
// DEVICE + GPS VERIFICATION
// ===============================

exports.signIn = async (req, res) => {

    try {

        const {
            latitude,
            longitude,
            deviceId
        } = req.body;


        // ===============================
        // FACTORY GEOFENCE SETTINGS
        // ===============================

        const factoryLatitude = 23.3043276;
        const factoryLongitude = 80.0103398;
        const allowedRadius = 250;


        // ===============================
        // VALIDATE GPS
        // ===============================

        if (
            latitude === undefined ||
            longitude === undefined
        ) {

            return res.status(400).json({

                message:
                    "GPS latitude and longitude are required"

            });

        }


        const employeeLatitude = Number(latitude);
        const employeeLongitude = Number(longitude);


        if (
            Number.isNaN(employeeLatitude) ||
            Number.isNaN(employeeLongitude)
        ) {

            return res.status(400).json({

                message:
                    "Invalid GPS coordinates"

            });

        }


        // ===============================
        // VALIDATE DEVICE ID
        // ===============================

        if (!deviceId) {

            return res.status(400).json({

                message:
                    "Device ID is required"

            });

        }


        // ===============================
        // GET EMPLOYEE
        // ===============================

        const employee =
            await Employee.findByPk(
                req.user.id
            );


        if (!employee) {

            return res.status(404).json({

                message:
                    "Employee not found"

            });

        }


        // ===============================
        // CHECK EMPLOYEE STATUS
        // ===============================

        if (employee.status !== "active") {

            return res.status(403).json({

                message:
                    "Employee account is inactive"

            });

        }


        // ===============================
        // CHECK REGISTERED DEVICE
        // ===============================

        if (!employee.deviceId) {

            return res.status(403).json({

                message:
                    "No device registered for this employee. Contact admin."

            });

        }
        // ✅ ADD THESE TWO LINES TO SEE THE MISMATCH
        console.log("🔴 DB Device ID:", JSON.stringify(employee.deviceId));
        console.log("🔴 Sent Device ID:", JSON.stringify(deviceId));


        if (employee.deviceId !== deviceId) {

            return res.status(403).json({

                message:
                    "Attendance can only be recorded from the registered device"

            });

        }


        // ===============================
        // CALCULATE GPS DISTANCE
        // ===============================

        const toRadians = (degrees) => {

            return degrees * (Math.PI / 180);

        };


        const earthRadius = 6371000;


        const latitudeDifference =
            toRadians(
                employeeLatitude -
                factoryLatitude
            );


        const longitudeDifference =
            toRadians(
                employeeLongitude -
                factoryLongitude
            );


        const a =
            Math.sin(latitudeDifference / 2) *
            Math.sin(latitudeDifference / 2) +

            Math.cos(
                toRadians(factoryLatitude)
            ) *

            Math.cos(
                toRadians(employeeLatitude)
            ) *

            Math.sin(longitudeDifference / 2) *
            Math.sin(longitudeDifference / 2);


        const c =
            2 *
            Math.atan2(
                Math.sqrt(a),
                Math.sqrt(1 - a)
            );


        const distance =
            earthRadius * c;


        // ===============================
        // FACTORY GEOFENCE CHECK
        // ===============================
        if (distance > allowedRadius) {

            return res.status(403).json({

                message:
                    "You are outside the factory attendance area",

                distance:
                    Math.round(distance),

                allowedRadius

            });

        }


        // ===============================
        // FACTORY DATE
        // ===============================

        const today =
            getFactoryDate();





        // ===============================
        // CHECK TODAY'S ATTENDANCE
        // ===============================

        const todayAttendance =
            await Attendance.findOne({

                where: {

                    employeeId:
                        req.user.id,

                    date:
                        today

                }

            });


        if (todayAttendance) {

            if (!todayAttendance.signOutTime) {

                return res.status(400).json({

                    message:
                        "Already signed in today"

                });

            }

            return res.status(400).json({

                message:
                    "Attendance already completed for today"

            });

        }





        // ===============================
        // CREATE ATTENDANCE
        // ===============================

        const attendance =
            await Attendance.create({

                employeeId:
                    req.user.id,

                date:
                    today,

                signInTime:
                    new Date(),

                signInLatitude:
                    employeeLatitude,

                signInLongitude:
                    employeeLongitude,

                deviceId

            });


        // ===============================
        // SUCCESS
        // ===============================

        res.status(201).json({

            message:
                "Attendance started",

            distance:
                Math.round(distance),

            attendance

        });


    } catch (error) {

        console.error(
            "Attendance sign-in error:",
            error
        );


        // ===============================
        // DUPLICATE ATTENDANCE
        // ===============================

        if (
            error.name ===
            "SequelizeUniqueConstraintError"
        ) {

            return res.status(400).json({

                message:
                    "Attendance already recorded for today"

            });

        }


        // ===============================
        // OTHER ERRORS
        // ===============================

        res.status(500).json({

            message:
                error.message

        });

    }

};







// ===============================
// EMPLOYEE SIGN OUT
// DEVICE + GPS VERIFICATION
// ===============================

exports.signOut = async (req, res) => {

    try {

        const {
            latitude,
            longitude,
            deviceId
        } = req.body;


        // ===============================
        // FACTORY GEOFENCE SETTINGS
        // ===============================

        const factoryLatitude = 23.3043276;
        const factoryLongitude = 80.0103398;
        const allowedRadius = 250;


        // ===============================
        // VALIDATE GPS
        // ===============================

        if (
            latitude === undefined ||
            longitude === undefined
        ) {

            return res.status(400).json({

                message:
                    "GPS latitude and longitude are required"

            });

        }


        const employeeLatitude =
            Number(latitude);

        const employeeLongitude =
            Number(longitude);


        if (
            Number.isNaN(employeeLatitude) ||
            Number.isNaN(employeeLongitude)
        ) {

            return res.status(400).json({

                message:
                    "Invalid GPS coordinates"

            });

        }


        // ===============================
        // VALIDATE DEVICE ID
        // ===============================

        if (!deviceId) {

            return res.status(400).json({

                message:
                    "Device ID is required"

            });

        }


        // ===============================
        // GET EMPLOYEE
        // ===============================

        const employee =
            await Employee.findByPk(
                req.user.id
            );


        if (!employee) {

            return res.status(404).json({

                message:
                    "Employee not found"

            });

        }


        // ===============================
        // CHECK EMPLOYEE STATUS
        // ===============================

        if (employee.status !== "active") {

            return res.status(403).json({

                message:
                    "Employee account is inactive"

            });

        }


        // ===============================
        // CHECK REGISTERED DEVICE
        // ===============================

        if (!employee.deviceId) {

            return res.status(403).json({

                message:
                    "No device registered for this employee. Contact admin."

            });

        }


        if (employee.deviceId !== deviceId) {

            return res.status(403).json({

                message:
                    "Attendance can only be recorded from the registered device"

            });

        }


        // ===============================
        // CALCULATE GPS DISTANCE
        // ===============================

        const toRadians = (degrees) => {

            return degrees * (Math.PI / 180);

        };


        const earthRadius = 6371000;


        const latitudeDifference =
            toRadians(
                employeeLatitude -
                factoryLatitude
            );


        const longitudeDifference =
            toRadians(
                employeeLongitude -
                factoryLongitude
            );


        const a =
            Math.sin(latitudeDifference / 2) *
            Math.sin(latitudeDifference / 2) +

            Math.cos(
                toRadians(factoryLatitude)
            ) *

            Math.cos(
                toRadians(employeeLatitude)
            ) *

            Math.sin(longitudeDifference / 2) *
            Math.sin(longitudeDifference / 2);


        const c =
            2 *
            Math.atan2(
                Math.sqrt(a),
                Math.sqrt(1 - a)
            );


        const distance =
            earthRadius * c;


        // ===============================
        // FACTORY GEOFENCE CHECK
        // ===============================
        if (distance > allowedRadius) {

            return res.status(403).json({

                message:
                    "You are outside the factory attendance area",

                distance:
                    Math.round(distance),

                allowedRadius

            });

        }


        // ===============================
        // FIND ACTIVE ATTENDANCE
        // ===============================

        const today =
            getFactoryDate();





        // ===============================
        // FIRST CHECK TODAY
        // ===============================

        // Replace current attendance lookup with:

        // First check today
        let attendance = await Attendance.findOne({
            where: {
                employeeId: req.user.id,
                date: today,
                signOutTime: null
            }
        });

        // If not found, check yesterday (for overnight shifts)
        if (!attendance) {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            attendance = await Attendance.findOne({
                where: {
                    employeeId: req.user.id,
                    date: yesterdayStr,
                    signOutTime: null
                }
            });
        }




        // ===============================
        // NO ATTENDANCE FOUND
        // ===============================

        if (!attendance) {

            return res.status(404).json({

                message:
                    "No active attendance found for sign out"

            });

        }


        // ===============================
        // CHECK ALREADY SIGNED OUT
        // ===============================

        if (attendance.signOutTime) {

            return res.status(400).json({

                message:
                    "Already signed out"

            });

        }


        // ===============================
        // SIGN OUT
        // ===============================

        attendance.signOutTime =
            new Date();


        attendance.signOutLatitude =
            employeeLatitude;


        attendance.signOutLongitude =
            employeeLongitude;


        // ===============================
        // CALCULATE WORKING HOURS
        // ===============================

        const difference =
            attendance.signOutTime -
            attendance.signInTime;


        const hours =
            Math.floor(
                difference /
                (1000 * 60 * 60)
            );


        const minutes =
            Math.floor(
                (difference %
                    (1000 * 60 * 60)) /
                (1000 * 60)
            );


        attendance.workingHours =
            `${hours} hours ${minutes} minutes`;


        await attendance.save();


        // ===============================
        // SUCCESS
        // ===============================

        res.json({

            message:
                "Sign out successful",

            distance:
                Math.round(distance),

            attendanceDate:
                attendance.date,

            workingHours:
                attendance.workingHours,

            attendance

        });


    } catch (error) {

        console.error(
            "Attendance sign-out error:",
            error
        );


        res.status(500).json({

            message:
                error.message

        });

    }

};








// ===============================
// EMPLOYEE ATTENDANCE HISTORY
// ===============================

exports.getMyAttendance = async (req, res) => {

    try {


        const records = await Attendance.findAll({

            where: {

                employeeId: req.user.id

            },

            order: [

                ["date", "DESC"]

            ]

        });



        res.json({

            count: records.length,

            attendance: records

        });



    } catch (error) {


        res.status(500).json({

            message: error.message

        });


    }

};





// ===============================
// MONTHLY ATTENDANCE REPORT
// SIMPLE PRESENT / ABSENT LOGIC
// ===============================

exports.getMonthlyAttendance = async (req, res) => {

    try {

        const today = getFactoryDate();

        const month =
            req.query.month ||
            today.slice(0, 7);


        // ===============================
        // VALIDATE MONTH
        // ===============================

        if (!/^\d{4}-\d{2}$/.test(month)) {

            return res.status(400).json({

                message:
                    "Invalid month format. Use YYYY-MM"

            });

        }


        const [year, monthNumber] =
            month.split("-").map(Number);


        if (
            monthNumber < 1 ||
            monthNumber > 12
        ) {

            return res.status(400).json({

                message:
                    "Invalid month"

            });

        }


        // ===============================
        // TOTAL DAYS IN MONTH
        // ===============================

        const totalDays =
            new Date(
                year,
                monthNumber,
                0
            ).getDate();


        // ===============================
        // DAYS TO COUNT
        // ===============================

        let daysToCount = totalDays;


        // Current month:
        // count only days that have occurred

        if (month === today.slice(0, 7)) {

            daysToCount =
                Number(today.slice(8, 10));

        }


        // ===============================
        // GET EMPLOYEE ATTENDANCE
        // ===============================

        const records =
            await Attendance.findAll({

                where: {

                    employeeId:
                        req.user.id

                },

                order: [

                    ["date", "DESC"]

                ]

            });


        // ===============================
        // FILTER MONTH
        // ===============================

        const monthlyRecords =
            records.filter(record => {

                const recordDate =
                    String(record.date)
                        .slice(0, 10);

                return recordDate.startsWith(month);

            });


        // ===============================
        // UNIQUE ATTENDANCE DATES
        // ===============================

        const attendanceDates =
            new Set(

                monthlyRecords.map(record => {

                    return String(record.date)
                        .slice(0, 10);

                })

            );


        // ===============================
        // PRESENT
        // ===============================

        const present =
            attendanceDates.size;


        // ===============================
        // ABSENT
        // ===============================

        const absent =
            Math.max(
                daysToCount - present,
                0
            );


        // ===============================
        // ATTENDANCE PERCENTAGE
        // ===============================

        const attendancePercentage =
            daysToCount === 0
                ? "0%"
                :
                (
                    (present / daysToCount) * 100
                ).toFixed(2) + "%";


        // ===============================
        // RESPONSE
        // ===============================

        res.json({

            month,

            employeeId:
                req.user.id,

            totalDays,

            daysCounted:
                daysToCount,

            present,

            absent,

            attendancePercentage

        });


    } catch (error) {

        console.error(
            "Monthly attendance error:",
            error
        );


        res.status(500).json({

            message:
                error.message

        });

    }

};

