const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");


const Department = sequelize.define("Department", {

    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },

    description: {
        type: DataTypes.STRING,
        allowNull: true
    }

});





module.exports = Department;