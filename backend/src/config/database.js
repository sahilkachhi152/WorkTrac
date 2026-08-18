const { Sequelize } = require("sequelize");
const path = require("path");

const storagePath = process.env.NODE_ENV === 'production'
  ? '/opt/render/project/src/data/database.sqlite'   // Render’s persistent disk
  : path.join(__dirname, "../database.sqlite");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: storagePath
});

module.exports = sequelize;