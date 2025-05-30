// controllers/admin.controller.js
const db = require('../models'); // Correctly imports your models setup
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // Ensure this matches your package (bcrypt or bcryptjs)

const createAdmin = async (req, res) => {
  const { userName, password } = req.body;
  try {
    const admin = await db.Admin.create({ userName, password });
    res.status(201).json({ message: 'Admin created', adminId: admin.id });
  } catch (error) {
    // More robust error handling for common Sequelize errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Username already exists.' });
    }
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: error.message });
    }
    console.error('Error creating admin:', error);
    res.status(500).json({ error: 'Internal server error during admin creation.' });
  }
};

const loginAdmin = async (req, res) => {
  const { userName, password } = req.body;
  try {
    const admin = await db.Admin.findOne({ where: { userName } });

    if (!admin) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign(
      {
        id: admin.id,
        role: admin.role,
        userName: admin.userName,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '5m' } // Use env var for expiry
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: admin.id,
        userName: admin.userName,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Error logging in admin:', error);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
};

const logoutAdmin = async (req, res) => {
  // As previously discussed, with JWTs, logout is client-side.
  // This endpoint serves as a confirmation.
  try {
    res.status(200).json({ message: 'Logout successful. Please clear token on client side.' });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
};

module.exports = {
  createAdmin,
  loginAdmin,
  logoutAdmin,
};