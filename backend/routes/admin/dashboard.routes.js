const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");
const dashboardController = require("../../controllers/admin/dashboard.controller");
router.get(
  "/stats",
  authMiddleware,
  roleMiddleware.roleMiddleware("admin", "manager"),
  dashboardController.getStats
);
router.get(
  "/stats/daily",
  authMiddleware,
  roleMiddleware.roleMiddleware("admin", "manager"),
  dashboardController.getDailyStatsAdmin
);

router.get(
  "/stats/monthly",
  authMiddleware,
  roleMiddleware.roleMiddleware("admin", "manager"),
  dashboardController.getMonthlyStatsAdmin
);

router.get(
  "/stats/yearly",
  authMiddleware,
  roleMiddleware.roleMiddleware("admin", "manager"),
  dashboardController.getYearlyStatsAdmin
);
module.exports = router;
