const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/auth.middleware");
const {
  getEmployeeProject,
} = require("../../controllers/employee/project.controller");

router.get("/", authMiddleware, getEmployeeProject);
module.exports = router;
