const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");


const LeaveType = sequelize.define("LeaveType", {

    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },


    name:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true
    },


    description:{
        type:DataTypes.TEXT,
        allowNull:true
    }


});


module.exports = LeaveType;