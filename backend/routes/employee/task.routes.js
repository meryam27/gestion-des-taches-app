const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/auth.middleware");
const taskController = require("../../controllers/employee/task.controller");

router.get("/", authMiddleware, taskController.getEmployeTask);
router.delete(
  "/delete/:taskId",
  authMiddleware,
  taskController.deleteEmployeTask
);
router.put("/update/:taskId", authMiddleware, taskController.updateEmployeTask);
router.post("/create", authMiddleware, taskController.createDailyTask);
router.post(
  "/:taskId/toggle-favorite",
  authMiddleware,
  taskController.toggleFavorites
);
router.get("/favorites", authMiddleware, taskController.getFavoriteTasks);

module.exports = router;
