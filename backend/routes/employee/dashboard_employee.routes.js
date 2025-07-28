const express = require("express");
const router = express.Router();
const dashboardController = require("../../controllers/employee/dashboard_employe.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");

router.get(
  "/stats",
  authMiddleware,
  roleMiddleware.roleMiddleware("employee"),
  dashboardController.getUserStats
);

router.get(
  "/stats/daily",
  authMiddleware,
  roleMiddleware.roleMiddleware("employee"),
  dashboardController.getDailyStats
);

router.get(
  "/stats/monthly",
  authMiddleware,
  roleMiddleware.roleMiddleware("employee"),
  dashboardController.getMonthlyStats
);

router.get(
  "/stats/yearly",
  authMiddleware,
  roleMiddleware.roleMiddleware("employee"),
  dashboardController.getYearlyStats
);

module.exports = router;
