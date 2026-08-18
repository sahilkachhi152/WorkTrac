const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Employee = sequelize.define(
    "Employee",
    {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        employeeCode: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        role: {
            type: DataTypes.ENUM('superior', 'admin', 'employee'),
            defaultValue: 'employee'
        },
        departmentId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        deviceId: {
            type: DataTypes.STRING,
            allowNull: true
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: "active"
        },
        lastLogin: {
            type: DataTypes.DATE,
            allowNull: true
        },
        mobileNumber: {
            type: DataTypes.STRING(15),
            allowNull: true
        },
        scheme: {
            type: DataTypes.ENUM('NAPS', 'NATS'),
            allowNull: true
        }
    },
    {
        defaultScope: {
            attributes: {
                exclude: ["password"]
            }
        }
    }
);

module.exports = Employee;