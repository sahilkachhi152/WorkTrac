const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");


const AuditLog = sequelize.define("AuditLog", {

    userId: {

        type: DataTypes.INTEGER,

        allowNull: false

    },


    action: {

        type: DataTypes.STRING,

        allowNull: false

    },


    module: {

        type: DataTypes.STRING,

        allowNull: false

    },


    recordId: {

        type: DataTypes.INTEGER,

        allowNull: true

    },


    description: {

        type: DataTypes.STRING,

        allowNull: true

    }


});


module.exports = AuditLog;