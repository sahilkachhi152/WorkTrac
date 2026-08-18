const { DataTypes } = require("sequelize");

const sequelize = require("../config/database");


const Attendance = sequelize.define(
    "Attendance",

    {

        employeeId: {

            type: DataTypes.INTEGER,

            allowNull: false

        },


        date: {

            type: DataTypes.DATEONLY,

            allowNull: false

        },


        signInTime: {

            type: DataTypes.DATE,

            allowNull: false

        },


        signOutTime: {

            type: DataTypes.DATE,

            allowNull: true

        },


        signInLatitude: {

            type: DataTypes.FLOAT,

            allowNull: true

        },


        signInLongitude: {

            type: DataTypes.FLOAT,

            allowNull: true

        },


        signOutLatitude: {

            type: DataTypes.FLOAT,

            allowNull: true

        },


        signOutLongitude: {

            type: DataTypes.FLOAT,

            allowNull: true

        },


        deviceId: {

            type: DataTypes.STRING,

            allowNull: true

        },


        workingHours: {

            type: DataTypes.STRING,

            allowNull: true

        }

    },


    {

        timestamps: true,


        indexes: [

            {

                name: "employee_date_index",

                unique: true,

                fields: [

                    "employeeId",

                    "date"

                ]

            },


            {

                name: "attendance_date_index",

                fields: [

                    "date"

                ]

            }

        ]

    }

);



module.exports = Attendance;