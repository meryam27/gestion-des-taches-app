const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/auth.middleware");
const projectController = require("../../controllers/employee/project.controller");

router.get("/", authMiddleware, projectController.getEmployeeProject);
router.get("/detail/:id", authMiddleware, projectController.getProjectDetail);

module.exports = router;
