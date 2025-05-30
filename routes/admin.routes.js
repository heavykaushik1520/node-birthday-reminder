// routes/admin.routes.js
const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');

const { createAdmin , loginAdmin , logoutAdmin} = require("../controllers/admin.controller");
const { authenticate } = require("../middleware/auth");
const db = require('../models'); // <--- Make sure to import db here

router.post('/register', createAdmin);
router.post('/login', loginAdmin);
router.post("/logout", logoutAdmin);

router.get('/me', authenticate, async (req, res) => {
  try {
    const admin = await db.Admin.findByPk(req.user.id, {
      attributes: ['id', 'userName', 'role'],
    });

    if (!admin) {
      return res.status(404).json({ error: 'Admin user not found' });
    }
    return res.status(200).json(admin);
  } catch (error) {
    console.error('Error fetching admin data:', error);
    return res.status(500).json({ error: 'Failed to fetch admin data' });
  }
});

router.post('/refresh-token', authenticate, (req, res) => {
  try {
    const newToken = jwt.sign(
      { id: req.user.id, role: req.user.role, userName: req.user.userName },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '5m' }
    );
    return res.status(200).json({ token: newToken });
  } catch (error) {
    console.error('Error refreshing token:', error);
    return res.status(500).json({ error: 'Failed to refresh token' });
  }
});

module.exports = router;