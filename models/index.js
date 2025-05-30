const sequelize = require('../config/database'); // Correctly points to your database.js
const Admin = require('./admin.model');
// const Employee = require('./employee.model');


const db = {};
db.Sequelize = sequelize; // The Sequelize library itself
db.sequelize = sequelize; // The configured Sequelize instance

// Initialize models and attach them to the db object
db.Admin = Admin(sequelize);
// db.Employee = Employee(sequelize);



module.exports = db;