const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/auth.middleware");
const taskController = require("../../controllers/employee/task.controller");
const { roleMiddleware } = require("../../middlewares/role.middleware");

router.get("/", authMiddleware, taskController.getEmployeTask);
router.post("/create", authMiddleware, taskController.createDailyTask);
router.patch(
  "/:id/toggle-star",
  authMiddleware,
  roleMiddleware("employee"),
  taskController.toggleStar
);
module.exports = router;
