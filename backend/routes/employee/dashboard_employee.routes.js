const express = require('express');
const router = express.Router();
const dashboardController = require('../../controllers/employee/dashboard_employe.controller');
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");
// Route pour le tableau de bord employé
router.get('/dashboard', authMiddleware,roleMiddleware.roleMiddleware('employee'), 
dashboardController.getEmployeeStats);

module.exports = router;