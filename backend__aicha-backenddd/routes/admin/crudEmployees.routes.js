// routes/employees.routes.js
const express = require("express");
const router = express.Router();
const multer = require("multer"); // AJOUTÉ
const {
  uploadUserPhoto,
  processUserPhoto,
} = require("../../middlewares/upload");

const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");
const employeesController = require("../../controllers/admin/crudEmployees.controller");

// Configuration Multer pour l'upload des photos de profil
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Assure-toi que ce dossier existe
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Routes

// GET /api/employees - Récupère tous les employés avec leurs projets
router.get(
  "/",
  authMiddleware,
  roleMiddleware.roleMiddleware("admin","manager"),
  employeesController.getAllEmployeesWithProjects
);

// GET /api/employees/detailse/:id
router.get(
  "/detailse/:id",
  authMiddleware,
  roleMiddleware.roleMiddleware("admin","manager"),
  employeesController.getEmployeeDetails
);

// POST /api/employees/ajout
router.post(
  "/ajout",
  authMiddleware,
  roleMiddleware.roleMiddleware("admin"),
  employeesController.createEmployee
);

// DELETE /api/employees/:id
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware.roleMiddleware("admin"),
  employeesController.deleteEmployee
);


router.post(
  "/update/:id",
  authMiddleware,
  roleMiddleware.roleMiddleware("admin","manager"),
  (req, res, next) => {
    uploadUserPhoto(req, res, function (err) {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  processUserPhoto,
  employeesController.updateEmployee
);

router.put('/resetPassword/:id',
  authMiddleware,
  roleMiddleware.roleMiddleware("admin"),
  employeesController.resetPassword
)

module.exports = router;

