const { Sequelize } = require('sequelize')
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: '../db.sqlite',
})

const db = {}

db.Sequelize = Sequelize
db.sequelize = sequelize

module.exports = db
