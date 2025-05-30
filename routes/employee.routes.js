// routes/employee.routes.js
const express = require('express');
const router = express.Router();
const { authenticate, authorizeRoles } = require('../middleware/auth'); // Import authentication and authorization middleware

const {
  addEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployeeById,
  deleteEmployeeById,
  // searchEmployeeByName
  getBirthdayCountByMonth
} = require('../controllers/employee.controller');



router.post('/', authenticate, authorizeRoles('admin'), addEmployee);

router.get('/', authenticate, authorizeRoles('admin'), getEmployees);

router.get('/:id', authenticate, authorizeRoles('admin'), getEmployeeById);


// router.get('/search', authenticate, authorizeRoles('admin'), searchEmployeeByName);
router.put('/:id', authenticate, authorizeRoles('admin'), updateEmployeeById);

router.delete('/:id', authenticate, authorizeRoles('admin'), deleteEmployeeById);

router.get('/birthdays/monthly-count', authenticate, authorizeRoles('admin'), getBirthdayCountByMonth);



module.exports = router;