const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const cors = require("cors");
const path = require('path');
const authMiddleware = require('./middlewares/auth.middleware');
const adminDashboardRoutes = require('./routes/admin/dashboard.routes');
const profileRoutes = require('./routes/profile.routes');
const projectRoutes = require('./routes/admin/crudProjet.routes');
const tasksRoutes=require('./routes/admin/crudTasks.routes');
const employeesRoutes = require('./routes/admin/crudEmployees.routes');
const employeDashboard=require('./routes/employee/dashboard_employee.routes');



dotenv.config();
connectDB();


const app = express();
app.use(cors());
app.use(express.json());


// Routes
app.use("/api/auth", authRoutes);//Toutes les routes définies dans authRoutes seront préfixées par /api/auth
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin/projects', projectRoutes);//aussi pour ajouter un projet 
app.use('/api/admin/employees', employeesRoutes);
app.use('/api/admin/tasks',tasksRoutes);
app.use('/api/employee',employeDashboard);
app.use('/public', express.static('public'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Serveur démarré sur le port ${PORT}`));
