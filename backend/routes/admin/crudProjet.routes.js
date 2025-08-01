const express = require("express");
const router = express.Router();
const crudProjectController = require("../../controllers/admin/crudProjet.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");
const {
  uploadProjectLogo,
  processProjectLogo,
} = require("../../middlewares/upload");

router.put(
  "/update/:id",
  authMiddleware,
  roleMiddleware.roleMiddleware("admin", "manager"),
  uploadProjectLogo,
  processProjectLogo,
  crudProjectController.updateProject
);

// Nouvelle endpoint spécial cartes
router.get(
  "/cards",
  authMiddleware,
  roleMiddleware.roleMiddleware("admin", "manager"),
  crudProjectController.getAllProjectsForCards
);

// Route protégée (ajoute un projet seulement pour admin)
router.post(
  "/ajout",
  authMiddleware,
  roleMiddleware.roleMiddleware("admin"),
  crudProjectController.createProject
);

// Suppression d'un projet proteger seuelement pour admin
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware.roleMiddleware("admin"),
  crudProjectController.deleteProject
);

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware.roleMiddleware("admin", "manager"),
  crudProjectController.getProjectDetails
);
module.exports = router;
