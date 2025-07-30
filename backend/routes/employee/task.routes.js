const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/auth.middleware");
const taskController = require("../../controllers/employee/task.controller");

router.get("/", authMiddleware, taskController.getEmployeTask);
router.post("/create", authMiddleware, taskController.createDailyTask);
router.post(
  "/:taskId/toggle-favorite",
  authMiddleware,
  taskController.toggleFavoutes
);
router.get("/favorites", authMiddleware, taskController.getFavoriteTasks);

module.exports = router;
