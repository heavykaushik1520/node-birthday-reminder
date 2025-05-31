const express = require('express');
// const fetch = require('node-fetch'); // Or use native fetch if on Node 18+
const cors = require('cors');
require("dotenv").config();


const sequelize = require("./config/database");
const db = require('./models');


const adminRoutes = require("./routes/admin.routes");
const employeeRoutes = require("./routes/employee.routes");

const app = express();
const PORT = process.env.PORT || 5000; 
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000','https://artiststation.co.in'], // Allow both 5173 and 3000
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], 
}));
app.use(express.json());



// 🔁 REPLACE with your own Google Apps Script Web App URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxvBnWKmhbEoPaQZJ4Fle3PI6zzgLPLJracGg3vp7QaidzB4hR2Eo929S8L66uh1ooXsQ/exec';


app.get("/birthday-reminder", async (req, res) => {
  res.send("Hello World");
});



// POST: Add Employee
// app.post('/api/add-employee', async (req, res) => {
//   try {
//     const response = await fetch(GOOGLE_SCRIPT_URL, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(req.body),
//     });
//     const result = await response.json();
//     res.json(result);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to add employee' });
//   }
// });

// // GET: Fetch Employees
// app.get('/api/employees', async (req, res) => {
//   try {
//     const response = await fetch(GOOGLE_SCRIPT_URL);
//     const employees = await response.json();
//     res.json(employees);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch employees' });
//   }
// });

app.use("/api/admin", adminRoutes);
app.use("/api/employees", employeeRoutes);



// sequelize
sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Database connected successfully.");
   
    return db.sequelize.sync({ alter: true });
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Unable to connect to the database or sync models:", err);
    process.exit(1);
  });