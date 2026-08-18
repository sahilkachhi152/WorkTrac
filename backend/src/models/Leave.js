const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Leave = sequelize.define("Leave", {

    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },


    employeeId:{
        type:DataTypes.INTEGER,
        allowNull:false
    },


    leaveType:{
        type:DataTypes.STRING,
        allowNull:false
    },


    startDate:{
        type:DataTypes.DATEONLY,
        allowNull:false
    },


    endDate:{
        type:DataTypes.DATEONLY,
        allowNull:false
    },


    reason:{
        type:DataTypes.TEXT,
        allowNull:false
    },


    status:{
        type:DataTypes.ENUM(
            "pending",
            "approved",
            "rejected"
        ),
        defaultValue:"pending"
    },


    adminComment:{
        type:DataTypes.TEXT,
        allowNull:true
    }


});


module.exports = Leave;